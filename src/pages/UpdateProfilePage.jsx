// src/pages/UpdateProfilePage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate }   from 'react-router-dom'
import { useToast }      from '@/components/ui/use-toast'
import { Input }         from '@/components/ui/input'
import { Label }         from '@/components/ui/label'
import { Button }        from '@/components/ui/button'
import { Textarea }      from '@/components/ui/textarea'
import { useAuth }      from '@/contexts/AuthContext'

export default function UpdateProfilePage() {
  const navigate  = useNavigate()
  const { toast } = useToast()
  const { currentUser, logout, loading } = useAuth()

  const [form, setForm] = useState({
    first_name:   '',
    last_name:    '',
    about:        '',
    facebook_url: '',
    instagram_url:'',
    linkedin_url: '',
    twitter_url:  '',
    city:         '',
    country:      ''
  })

  useEffect(() => {
    if (!loading && currentUser) {
      setForm({
        first_name:   currentUser.first_name || '',
        last_name:    currentUser.last_name  || '',
        about:        currentUser.about      || '',
        facebook_url: currentUser.facebook_url||'',
        instagram_url:currentUser.instagram_url||'',
        linkedin_url: currentUser.linkedin_url||'',
        twitter_url:  currentUser.twitter_url||'',
        city:         currentUser.city     || '',
        country:      currentUser.country  || ''
      })
    }
  }, [currentUser, loading])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const res = await fetch('/api/profiles/update', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      toast({ title: 'Profile updated!' })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      toast({ title: 'Error', description: err.message })
    }
  }

  if (loading) return <p>Loading…</p>

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Update Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>First Name</Label>
          <Input name="first_name" value={form.first_name} onChange={handleChange}/>
        </div>
        <div>
          <Label>Last Name</Label>
          <Input name="last_name" value={form.last_name} onChange={handleChange}/>
        </div>
        <div>
          <Label>About / Bio</Label>
          <Textarea name="about" value={form.about} onChange={handleChange}/>
        </div>
        <div>
          <Label>Facebook URL</Label>
          <Input name="facebook_url" value={form.facebook_url} onChange={handleChange}/>
        </div>
        <div>
          <Label>Instagram URL</Label>
          <Input name="instagram_url" value={form.instagram_url} onChange={handleChange}/>
        </div>
        <div>
          <Label>LinkedIn URL</Label>
          <Input name="linkedin_url" value={form.linkedin_url} onChange={handleChange}/>
        </div>
        <div>
          <Label>Twitter URL</Label>
          <Input name="twitter_url" value={form.twitter_url} onChange={handleChange}/>
        </div>
        <div>
          <Label>City</Label>
          <Input name="city" value={form.city} onChange={handleChange}/>
        </div>
        <div>
          <Label>Country</Label>
          <Input name="country" value={form.country} onChange={handleChange}/>
        </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}
