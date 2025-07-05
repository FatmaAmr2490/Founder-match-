import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const cookie = req.headers.cookie || '';
  const match = cookie.match(/auth_token=([^;]+)/);
  if (!match) {
    return res.status(401).json({ error: 'No token.' });
  }
  const token = match[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  // Issue a new token with a fresh expiry
  try {
    const newToken = jwt.sign(
      { sub: payload.sub, email: payload.email, isAdmin: payload.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const newCookie = serialize('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60,
      path: '/'
    });
    res.setHeader('Set-Cookie', newCookie);
    return res.status(200).json({ message: 'Token refreshed.' });
  } catch (err) {
    return res.status(500).json({ error: 'Could not refresh token.' });
  }
}
