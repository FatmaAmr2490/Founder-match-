// src/hooks/useMatches.js
import useSWR from 'swr'
import { fetchMatches } from '@/services/matchService'

/**
 * Hook to fetch your top K matches for a given user.
 * Uses SWR for caching/loading/error states.
 */
export function useMatches(userId, k = 10) {
  const { data, error } = useSWR(
    // only fetch if we have a userId
    userId ? ['matches', userId, k] : null,
    () => fetchMatches(userId, k)
  )

  return {
    matches: data,
    isLoading: !error && !data,
    isError:   !!error
  }
}
