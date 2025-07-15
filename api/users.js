// api/users.js
import supabase from './lib/supabase.js'
import { withAuth } from './lib/secure.js'

export default withAuth(async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end()
  }

  const { id } = req.query
  const userId = parseInt(id, 10)
  if (!userId) return res.status(400).json({ error: 'Missing or invalid id' })

  // 1) base user row:
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select(`
      id, first_name, last_name,
      about,
      facebook_url, instagram_url, linkedin_url, twitter_url,
      city, country
    `)
    .eq('id', userId)
    .maybeSingle()
  if (userErr || !user) {
    console.error('user fetch error', userErr)
    return res.status(userErr ? 500 : 404).json({ error: userErr?.message || 'Not found' })
  }

  // 2) skills list
  const { data: skillRows, error: skillErr } = await supabase
    .from('user_skills')
    .select(`skill_id, skills(name)`)
    .eq('user_id', userId)
  if (skillErr) {
    console.error('skills fetch error', skillErr)
    return res.status(500).json({ error: skillErr.message })
  }
  const skills = skillRows.map(r => r.skills.name)

  // 3) education list
  const { data: eduRows, error: eduErr } = await supabase
    .from('user_educations')
    .select(`institution`)
    .eq('user_id', userId)
  if (eduErr) {
    console.error('educations fetch error', eduErr)
    return res.status(500).json({ error: eduErr.message })
  }
  const education = eduRows.map(r => r.institution)

  // 4) return the merged object
  return res.status(200).json({
    user: {
      ...user,
      skills,
      education
    }
  })
})
