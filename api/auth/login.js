// api/auth/login.js
import supabase from '../lib/supabase.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  const { email, password } = req.body || {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Must include email & password strings.' })
  }

  // 1. Fetch user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('❌ Supabase error:', error)
    return res.status(500).json({ error: 'Database error.' })
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  // 2. Compare password with hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }
  
  // 3. sign JWT
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET')
  }

  let token
  try {
    token = jwt.sign(
      { sub: user.id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
  } catch (err) {
    console.error('JWT error:', err)
    return res.status(500).json({ error: 'Could not generate token.' })
  }

  // set HttpOnly cookie
  const cookie = serialize('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60,
    path: '/'
  })
  res.setHeader('Set-Cookie', cookie)
  // success!
  return res.status(200).json({ user })

}
