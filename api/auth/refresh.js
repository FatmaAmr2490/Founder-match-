// pages/api/auth/refresh.js
import { refreshSession, setAuthCookies } from '../services/authService';
import cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  // 1. Grab the refresh token from the HTTP-only cookie
  const cookies = cookie.parse(req.headers.cookie || '');
  const refreshToken = cookies['sb-refresh-token'];
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token.' });
  }

  // 2. Refresh session using centralized service
  const { session, user, error } = await refreshSession(refreshToken);
  if (error || !session) {
    return res.status(401).json({ error: error?.message || 'Refresh failed.' });
  }

  // 3. Rotate your cookies with the new tokens
  setAuthCookies(res, session);

  // 4. Return the user so client can update UI if needed
  return res.status(200).json({ user });
}
