import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { session, pendingActivation } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session) navigate('/customers', { replace: true });
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      if (error) setError(error.message);
      else setSuccess('Account created! An administrator must activate it before you can log in.');
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
        queryParams: { prompt: 'select_account' },
      },
    });
  };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-4">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white font-black text-xs">H</div>
            <span className="text-white font-black text-lg">Hope<span className="text-blue-300">CMS</span></span>
          </div>
          <h1 className="text-white text-3xl font-extrabold">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-blue-200 mt-1 text-sm">
            {mode === 'login' ? 'Sign in to Hope, Inc. Customer Management' : 'Register — activation required after sign-up'}
          </p>
        </div>

        {/* Pending activation banner */}
        {pendingActivation && (
          <div className="glass rounded-xl p-4 mb-4 border border-amber-400/30 bg-amber-500/10">
            <div className="flex gap-3 items-start">
              <span className="text-amber-400 text-xl">⏳</span>
              <div>
                <p className="text-amber-200 font-semibold text-sm">Account Pending Activation</p>
                <p className="text-amber-300/80 text-xs mt-0.5">
                  Your account exists but hasn't been activated yet. Please contact an administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* Error / Success */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 mb-5 text-red-200 text-sm flex gap-2 items-start">
              <span>✕</span><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-3 mb-5 text-green-200 text-sm flex gap-2 items-start">
              <span>✓</span><span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-blue-100 text-sm font-semibold mb-1.5">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Juan dela Cruz"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-blue-300/50 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
                />
              </div>
            )}
            <div>
              <label className="block text-blue-100 text-sm font-semibold mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-blue-300/50 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
              />
            </div>
            <div>
              <label className="block text-blue-100 text-sm font-semibold mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-blue-300/50 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
              />
            </div>
            <button
              id="submitBtn"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30 mt-2"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-blue-300/60 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google OAuth */}
          <button
            id="googleBtn"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95 text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,19.000,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continue with Google
          </button>

          {/* Mode toggle */}
          <p className="text-center text-blue-300/70 text-sm mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              id="modeToggle"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
              className="text-blue-300 hover:text-white font-semibold transition-colors"
            >
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>

        <p className="text-center text-blue-300/40 text-xs mt-6">
          Hope, Inc. © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  );
}
