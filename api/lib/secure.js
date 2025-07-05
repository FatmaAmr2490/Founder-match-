import jwt from 'jsonwebtoken';

export function authenticateRequest(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/auth_token=([^;]+)/);
  if (!match) return null;
  const token = match[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

export function withAuth(handler) {
  return async (req, res) => {
    const user = authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    return handler(req, res);
  };
}
