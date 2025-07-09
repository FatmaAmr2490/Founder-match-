// src/pages/MatchesPage.jsx
import React, { useContext } from 'react'
import AuthContext from '@/contexts/AuthContext'
import { useMatches }      from '@/hooks/useMatches'
import MatchList      from '@/components/ui/MatchList'

export default function MatchesPage() {
  const { currentUser } = useContext(AuthContext)
  const { matches, isLoading, isError } = useMatches(currentUser.id, 10)

  if (isLoading) return <div className="p-8 text-center">Loading matches…</div>
  if (isError)   return <div className="p-8 text-center text-red-500">Error loading matches.</div>

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Your Top Matches</h1>
      <MatchList matches={matches} />
    </div>
  )
}
