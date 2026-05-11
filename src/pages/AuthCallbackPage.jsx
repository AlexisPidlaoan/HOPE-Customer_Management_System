import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * /auth/callback — handles OAuth redirect.
 * Supabase deposits the session token in the URL hash fragment.
 * AuthContext picks it up via onAuthStateChange and sets the session.
 * This page shows a spinner until the session is ready, then navigates.
 */
export default function AuthCallbackPage() {
  const { session, loading, pendingActivation } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // still processing

    if (pendingActivation) {
      navigate('/login?error=pending', { replace: true });
    } else if (session) {
      navigate('/customers', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [session, loading, pendingActivation, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
      <h2 className="text-xl font-bold mb-2">Signing you in…</h2>
      <p className="text-slate-400 text-sm">Completing authentication, please wait.</p>
    </div>
  );
}
