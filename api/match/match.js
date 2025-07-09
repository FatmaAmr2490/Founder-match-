import supabase from '../lib/supabase.js'

export default async function handler(req, res) {
  // Only GET requests allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userId = parseInt(req.query.user_id, 10)
  const limitK = parseInt(req.query.k || '10', 10)

  // Validate query params
  if (!userId || Number.isNaN(limitK)) {
    return res.status(400).json({ error: 'Missing or invalid user_id/k' })
  }

  try {
    // Call the stored RPC match_users(cur_user_id, limit_k)
    const { data, error } = await supabase
      .rpc('match_users', { cur_user_id: userId, limit_k: limitK })

    if (error) throw error

    // Returns an array of { user_id, final_score, vec_sim, ind_jaccard, skill_jaccard }
    res.status(200).json(data)
  } catch (e) {
    console.error('match error:', e)
    res.status(500).json({ error: e.message || 'Internal server error' })
  }
}



