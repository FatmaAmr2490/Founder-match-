// api/auth/login.js
import supabase from '../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  const { email, password } = req.body || {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Must include email & password strings.' })
  }

  // --- use maybeSingle() here ---
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password_hash', password)
    .maybeSingle()

  // real connection / query error?
  if (error) {
    console.error('❌ Supabase error:', error)
    return res.status(500).json({ error: 'Database error.' })
  }

  // no rows => wrong creds
  if (!data) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  // success!
  return res.status(200).json({ user: data })
}
