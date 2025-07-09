// src/hooks/useMatches.js
import useSWR from 'swr'

export function useMatches(userId, k = 6) {
  const { data, error } = useSWR(
    () => userId ? `/api/match/match?user_id=${userId}&k=${k}` : null,
    url => fetch(url, { credentials: 'include' }).then(r => {
      if (!r.ok) throw new Error('Could not load matches')
      return r.json()
    })
  )

  return {
    matches:     data || [],
    isLoading:   !error && !data,
    isError:     !!error
  }
}
