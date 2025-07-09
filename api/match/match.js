// File: api/match.js
import supabase from '../lib/supabase.js'
import { withAuth } from '..//lib/secure.js'

// 1) Write your handler just as a plain function, assuming req.user is set
async function handler(req, res) {
  // 2) Only allow GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 3) `withAuth` guarantees req.user exists and is the JWT payload
  const userId = req.user.sub   // <-- enforced, no more query param impersonation
  const limitK = parseInt(req.query.k || '10', 10)
  if (Number.isNaN(limitK) || limitK < 4 || limitK > 15) {
    return res.status(400).json({ error: 'Invalid limit "k"' })
  }

  try {
    // 4) Call your stored procedure
    const { data, error } = await supabase
      .rpc('match_users', { cur_user_id: userId, limit_k: limitK })

    if (error) throw error
    return res.status(200).json(data)
  } catch (err) {
    console.error('match error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}

// 5) Export the wrapped function
export default withAuth(handler)
