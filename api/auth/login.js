// api/auth/login.js
import supabase from '../lib/supabase.js'
import bcrypt from 'bcryptjs';
import { issueAuthToken } from '../lib/session.js'



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

  issueAuthToken(res, user)

  // success!
  return res.status(200).json({ user })

}
