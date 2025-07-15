// api/users.js
import supabase from './lib/supabase.js'
import { withAuth } from './lib/secure.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end()
  }

  // you could allow public access, but here we require login:
  const { id } = req.query

   if (!id) {
     return res.status(400).json({ error: 'Missing id query parameter' })
   }

   
   const userId = parseInt(id, 10)
   if (Number.isNaN(userId)) {
     return res.status(400).json({ error: 'Invalid id' })
   }

  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id, first_name, last_name,
      about, 
      city, country,
      facebook_url, instagram_url, linkedin_url, twitter_url
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('users/[id] error:', error)
    return res.status(500).json({ error: error.message })
  }
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.status(200).json({ user })
}

export default withAuth(handler)
