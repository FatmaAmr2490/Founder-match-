// src/components/MatchList.jsx
import React from 'react'
import { Card } from '@/components/ui/card'

export default function MatchList({ matches }) {
  if (!matches || matches.length === 0) {
    return <p className="p-4 text-center">No matches found.</p>
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map(m => (
        <Card key={m.user_id} className="p-6">
          <h3 className="text-xl font-bold">
            {m.first_name} {m.last_name}
          </h3>
          <p className="text-sm text-gray-500">
            {m.city}, {m.country}
          </p>
          <p className="mt-2 text-gray-800 line-clamp-3">
            {m.about}
          </p>
          <div className="mt-4 text-sm text-gray-600">
            Score: {m.final_score.toFixed(3)}
          </div>
        </Card>
      ))}
    </div>
  )
}
