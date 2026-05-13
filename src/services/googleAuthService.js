import { supabase } from '../lib/supabase';

/**
 * Initiates Google OAuth sign-in.
 * @param {string} redirectTo - URL to redirect after successful login
 */
export async function signInWithGoogle(redirectTo = `${window.location.origin}/auth/callback`) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) {
    console.error('Google sign-in error:', error.message);
    throw error;
  }

  return data;
}
