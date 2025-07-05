// lib/auth.js
import supabase from './supabase';
import cookie from 'cookie';

/**
 * Reads sb-access-token from cookies, validates it with Supabase,
 * and returns the user object (or null if unauthenticated).
 */
export async function authenticate(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const accessToken = cookies['sb-access-token'];
  if (!accessToken) return null;

  // Tell supabase-js to use that token
  supabase.auth.setAuth(accessToken);

  // Fetch & verify user
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Higher-order wrapper for API handlers:
 * if no valid session, returns 401; otherwise injects `user`.
 */
export function withAuth(fn) {
  return async (req, res) => {
    const user = await authenticate(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Pass user into your handler
    return fn(req, res, user);
  };
}
