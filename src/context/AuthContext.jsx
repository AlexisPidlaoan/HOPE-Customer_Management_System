import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Wraps a promise with a timeout — prevents indefinite hangs from RLS errors
function withTimeout(promise, ms = 15000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingActivation, setPendingActivation] = useState(false);
  // Keep a ref to the last successfully fetched profile so we never lose it
  const lastGoodProfile = useRef(null);

  const fetchProfile = useCallback(async (userId, retryCount = 0) => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        15000
      );

      if (error) throw error;

      if (data?.record_status === 'INACTIVE') {
        // Check if this user signed in via Google OAuth — if so, auto-activate
        // them as a regular USER so they can log in without admin intervention.
        const { data: { user } } = await supabase.auth.getUser();
        const provider = user?.app_metadata?.provider;

        if (provider === 'google') {
          // Auto-activate Google OAuth users
          const { data: updated, error: updateErr } = await supabase
            .from('profiles')
            .update({ record_status: 'ACTIVE' })
            .eq('id', userId)
            .select('*')
            .single();

          if (!updateErr && updated) {
            setProfile(updated);
            lastGoodProfile.current = updated;
            setPendingActivation(false);
          } else {
            // If update fails (e.g., RLS blocks it), show pending activation
            console.warn('Could not auto-activate Google user:', updateErr?.message);
            setPendingActivation(true);
            await supabase.auth.signOut();
            setSession(null);
            setProfile(null);
            lastGoodProfile.current = null;
          }
        } else {
          // Email/password sign-up — require admin activation
          setPendingActivation(true);
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
          lastGoodProfile.current = null;
        }
      } else {
        setProfile(data);
        lastGoodProfile.current = data;
        setPendingActivation(false);
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
      // IMPORTANT: Do NOT wipe the profile on transient errors.
      // Keep the last known good profile so the user doesn't lose
      // their SUPERADMIN/ADMIN status during token refreshes.
      if (lastGoodProfile.current) {
        console.warn('Keeping last known good profile instead of clearing.');
        setProfile(lastGoodProfile.current);
      } else if (retryCount < 2) {
        // If we've never fetched a profile successfully, retry after a short delay
        console.warn(`Retrying profile fetch (attempt ${retryCount + 2}/3)...`);
        await new Promise((r) => setTimeout(r, 2000));
        return fetchProfile(userId, retryCount + 1);
      } else {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Global safety net: if onAuthStateChange never fires (network issue,
    // Supabase unreachable, etc.) stop the loading screen after 12 seconds
    const globalTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('AuthContext: onAuthStateChange did not fire within 12s — forcing loading=false');
        setLoading(false);
      }
    }, 12000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        clearTimeout(globalTimeout);

        setSession(session);

        if (session?.user?.id) {
          // For token refreshes, don't show loading spinner — profile is already set
          if (event === 'TOKEN_REFRESHED' && lastGoodProfile.current) {
            // Still fetch in the background to keep data fresh, but don't flash loading
            fetchProfile(session.user.id);
          } else {
            await fetchProfile(session.user.id);
          }
        } else {
          setProfile(null);
          lastGoodProfile.current = null;
          // DON'T clear pendingActivation here — it may have just been set
          // by fetchProfile detecting an INACTIVE user. Clearing it would
          // hide the "Account Pending Activation" banner on the login page.
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(globalTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    setPendingActivation(false);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    lastGoodProfile.current = null;
  };

  const refreshProfile = () => {
    if (session?.user?.id) fetchProfile(session.user.id);
  };

  const isAdmin = profile?.user_type === 'ADMIN' || profile?.user_type === 'SUPERADMIN';
  const isSuperAdmin = profile?.user_type === 'SUPERADMIN';

  return (
    <AuthContext.Provider value={{
      session,
      profile,
      loading,
      pendingActivation,
      isAdmin,
      isSuperAdmin,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

