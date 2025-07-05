import supabase from '../lib/supabase.js';
import bcrypt from 'bcryptjs';


// This API endpoint handles user registration
// it hashes the password and stores user details in the database
// required fields: name, email, password, skills
// optional fields: university, interests, availability, bio, city, country


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
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
    city,
    country
  } = req.body || {};

  // Required fields
  if (!name || !email || !password || !skills) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Split name into first and last (optional)
  let first_name = name;
  let last_name = '';
  if (name.includes(' ')) {
    const parts = name.split(' ');
    first_name = parts[0];
    last_name = parts.slice(1).join(' ');
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Insert user
  const { data, error } = await supabase.from('users').insert([
    {
      username: email, // using email as username for now
      email,
      password_hash,
      first_name,
      last_name,
      about: bio || null,
      availability: availability || null,
      city: city || null,
      country: country || null,
      // is_admin: false (default)
    }
  ]).select('*').single();

  if (error) {
    if (error.code === '23505') {
      // Unique violation
      return res.status(409).json({ error: 'Email or username already exists.' });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ user: data });
}
