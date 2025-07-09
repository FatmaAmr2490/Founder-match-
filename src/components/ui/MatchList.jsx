// src/components/MatchList.jsx
import React from 'react'
import { Card } from '@/components/ui/card'

export default function MatchList({ matches }) {
  if (!matches || matches.length === 0) {
    return <p className="p-4 text-center">No matches found.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map(m => (
        <Card key={m.user_id} className="p-4">
          <h3 className="text-lg font-semibold">
            {m.first_name} {m.last_name}
          </h3>
          <p className="text-sm text-gray-600">{m.city}, {m.country}</p>
          <p className="mt-2 text-gray-800">{m.about}</p>
          <div className="mt-3 text-xs text-gray-500">
            Score: {m.final_score.toFixed(3)}
          </div>
        </Card>
      ))}
    </div>
  )
}
