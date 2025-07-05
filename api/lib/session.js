// api/lib/session.js
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

export function issueAuthToken(res, user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET')
  }

  // 1) Sign the JWT
  const token = jwt.sign(
    { sub: user.id, email: user.email, isAdmin: user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  // 2) Create the HttpOnly cookie
  const cookieStr = serialize('auth_token', token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'strict',
    maxAge:    60 * 60,  // 1h
    path:      '/'
  })

  // 3) Attach it
  res.setHeader('Set-Cookie', cookieStr)
}
