import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // adjust path if needed

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email, password) =>
    await supabase.auth.signInWithPassword({ email, password });

  const signInWithGoogle = async () =>
    await supabase.auth.signInWithOAuth({ provider: "google" });

  const signOut = async () => await supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
