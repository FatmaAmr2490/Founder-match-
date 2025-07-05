// api/auth/me.js
import jwt from 'jsonwebtoken'
import { parse } from 'cookie'
import supabase from '../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end()
  }

  // 1. Grab the token from the HttpOnly cookie
  const cookies = parse(req.headers.cookie || '')
  const token   = cookies.auth_token
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  // 2. Verify & decode
  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    console.error('JWT verify failed:', err)
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }

  // 3. (Optional) fetch fresh user record from Supabase
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, first_name, last_name, is_admin, city, country')
    .eq('id', payload.sub)
    .maybeSingle()

  if (error) {
    console.error('Supabase fetch failed:', error)
    return res.status(500).json({ error: 'Could not fetch user.' })
  }
  if (!user) {
    return res.status(404).json({ error: 'User not found.' })
  }

  // 4. Return the user object
  return res.status(200).json({ user })
}
