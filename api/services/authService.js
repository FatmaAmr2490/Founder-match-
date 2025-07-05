import supabase from '../../server/lib/supabase';
import cookie from 'cookie';

// Centralized signIn logic
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error };
  return { session: data.session, user: data.user };
}

// Centralized refresh logic
export async function refreshSession(refreshToken) {
  supabase.auth.setAuth(refreshToken);
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) return { error };
  return { session: data.session, user: data.user };
}

// Centralized cookie setter
export function setAuthCookies(res, session) {
  res.setHeader('Set-Cookie', [
    cookie.serialize('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
      path: '/',
    }),
    cookie.serialize('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    }),
  ]);
}
