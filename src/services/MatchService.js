// src/services/matchService.js
export async function fetchMatches(userId, k = 10) {
  const res = await fetch(`/api/match/match?user_id=${userId}&k=${k}`)
  if (!res.ok) { 
    console.log('error doing sth');
    throw new Error('Failed to fetch matches');
  }
  return res.json()
}
