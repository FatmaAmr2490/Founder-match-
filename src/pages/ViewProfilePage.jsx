// src/pages/ViewProfilePage.jsx
import React, { useEffect, useState } from 'react'
import { useParams }   from 'react-router-dom'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Users, Mail, MessageCircle } from 'lucide-react'

export default function ViewProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/users?id=${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(j => setUser(j.user))
      .catch(e => setError(e.message))
  }, [id])

  if (error) return <p className="text-red-500">{error}</p>
  if (!user) return <p>Loading…</p>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-6 w-6 text-red-600"/>
            {user.first_name} {user.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><Mail className="inline mr-2"/> {user.email}</p>
          {user.about && <p>{user.about}</p>}
          <div className="space-y-2">
            {user.facebook_url && <p><a href={user.facebook_url} target="_blank">Facebook</a></p>}
            {user.instagram_url && <p><a href={user.instagram_url} target="_blank">Instagram</a></p>}
            {user.linkedin_url && <p><a href={user.linkedin_url} target="_blank">LinkedIn</a></p>}
            {user.twitter_url  && <p><a href={user.twitter_url} target="_blank">Twitter</a></p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
