// src/services/matchService.js
export async function fetchMatches(userId, k = 6) {
  const res = await fetch(`/api/match?user_id=${userId}&k=${k}`, { credentials: 'include' })
  if (!res.ok) throw new Error(`fetchMatches failed: ${res.status}`)
  return res.json()
}
