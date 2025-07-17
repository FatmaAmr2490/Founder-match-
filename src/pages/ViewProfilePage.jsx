// src/pages/ViewProfilePage.jsx
import React, { useEffect, useState } from 'react'
import { useParams }   from 'react-router-dom'
import {
  Card, CardHeader, CardContent, CardTitle
} from '@/components/ui/card'
import { Users, Mail } from 'lucide-react'

export default function ViewProfilePage() {
  const { id } = useParams()
  const [user, setUser]   = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/users?id=${id}`, { credentials: 'include' })
      .then(async r => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      })
      .then(j => setUser(j.user))
      .catch(e => setError(e.message))
  }, [id])

  if (error) return <p className="text-red-500">{error}</p>
  if (!user) return <p>Loading…</p>

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-6 w-6 text-red-600"/>
            {user.first_name} {user.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {user.bio && (
              <>
                <h3 className="font-semibold">Bio</h3>
                <p>{user.bio}</p>
              </>
            )}

             {user.idea_description && (
              <>
                <h3 className="font-semibold">Idea Description</h3>
                <p>{user.idea_description}</p>
              </>
            )} 
          

          {user.skills?.length > 0 && (
            <>
              <h3 className="font-semibold">Skills</h3>
              <ul className="list-disc pl-5">
                {user.skills.map(s => <li key={s}>{s}</li>)}
              </ul>
            </>
          )}

          {user.education?.length > 0 && (
            <>
              <h3 className="font-semibold">Education</h3>
              <ul className="list-disc pl-5">
                {user.education.map(inst => <li key={inst}>{inst}</li>)}
              </ul>
            </>
          )}

          <div className="space-y-1">
            {user.facebook_url  && <a href={user.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}
            {user.instagram_url && <a href={user.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}
            {user.linkedin_url  && <a href={user.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
            {user.twitter_url   && <a href={user.twitter_url} target="_blank" rel="noreferrer">Twitter</a>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
