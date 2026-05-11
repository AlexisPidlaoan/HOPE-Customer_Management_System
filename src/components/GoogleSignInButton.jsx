import React, { useState } from 'react';
import { signInWithGoogle } from '../services/googleAuthService';

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // Supabase will redirect to /auth/callback automatically
    } catch (err) {
      alert(`Google sign-in failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      style={{
        backgroundColor: '#4285F4',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}
