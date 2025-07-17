// api/auth/register.js
import supabase from '../lib/supabase.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'
import { issueAuthToken } from '../lib/session.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const {
    name,
    email,
    password,
    university,
    skills,
    interests,
    availability,
    bio, 
    idea_description,
    city,
    country
  } = req.body || {}

  // 1. Required fields
  if (!name || !email || !password || !skills) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  // 2. Split name
  let first_name = name
  let last_name = ''
  if (name.includes(' ')) {
    const parts     = name.trim().split(/\s+/)
    first_name      = parts.shift()
    last_name       = parts.join(' ')
  }

  // 3. Hash password
  const password_hash = await bcrypt.hash(password, 10)

  // 4. Insert user
  const { data: user, error } = await supabase
    .from('users')
    .insert([{
      username:    email,       // using email as username for now
      email,
      password_hash,
      first_name,
      last_name,
      bio:        bio || null,
      idea_description: idea_description || null,
      availability: availability || null,
      city:         city || null,
      country:      country || null
      // is_admin defaults to false
    }])
    .select('*')
    .maybeSingle()

  if (error) {
    if (error.code === '23505') {
      // unique violation
      return res.status(409).json({ error: 'Email or username already exists.' })
    }
    console.error('Supabase insert error:', error)
    return res.status(500).json({ error: error.message })
  }

  // 5. issue auth token
  issueAuthToken(res, user)
  return res.status(201).json({ user })

}
