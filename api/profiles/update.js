// api/profiles/update.js
import supabase from '../lib/supabase.js'
import { withAuth } from '../lib/secure.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }

  // req.user set by withAuth()
  const userId = req.user.sub
  const {
    first_name,
    last_name,
    about,
    facebook_url,
    instagram_url,
    linkedin_url,
    twitter_url,
    city,
    country
  } = req.body

  // TODO: validate fields (e.g. URL format) as desired

  try {
    const { error } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        about,
        facebook_url,
        instagram_url,
        linkedin_url,
        twitter_url,
        city,
        country
      })
      .eq('id', userId)

    if (error) throw error

    return res.status(200).json({ status: 'ok' })
  } catch (err) {
    console.error('profile update error:', err)
    return res.status(500).json({ error: err.message })
  }
}

export default withAuth(handler)
