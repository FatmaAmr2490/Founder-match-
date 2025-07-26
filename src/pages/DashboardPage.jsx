// src/pages/DashboardPage.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import {
  Users,
  ArrowLeft,
  LogOut,
  MessageCircle,
  Mail,
  User
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User as UserIcon } from 'lucide-react'  


import { useAuth }    from '@/contexts/AuthContext'
import { useMatches } from '@/hooks/useMatches'

export default function DashboardPage() {
  const navigate  = useNavigate()
  const { toast } = useToast()
  const { currentUser, logout, loading } = useAuth()

  // Fetch top 6 matches for this user
  const {
    matches = [],
    isLoading: matchesLoading = false,
    isError:   matchesError = false
  } = useMatches(currentUser?.id, 6) || {}

  // Kick off a chat thread
  const handleInitiateChat = (matchUser) => {
    if (!currentUser) return

    // Bootstrap a chat history object in localStorage if you need it
    const key = `founderMatchChats_${currentUser.id}`
    const stored = JSON.parse(localStorage.getItem(key) || '{}')
    if (!stored[matchUser.user_id]) {
      stored[matchUser.user_id] = []
      localStorage.setItem(key, JSON.stringify(stored))
    }

    // Navigate to your chat page, passing the selected user
    navigate('/chat', { state: { selectedUserId: matchUser.user_id } })

    toast({
      title: `Chat started`,
      description: `Now messaging ${matchUser.first_name}`
    })
  }

  // 1) Show a loader while auth state is resolving
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Users className="h-16 w-16 text-red-500 animate-pulse" />
      </div>
    )
  }

  // 2) If not logged in, send them to signup
  if (!currentUser) {
    navigate('/signup')
    return null
  }

  // Render the dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="container mx-auto px-4 py-8">
        {/* ─────────── Profile Summary ─────────── */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-8">
              Hello, <span className="gradient-text">{currentUser.first_name}</span>!
            </h1>

            <Card className="mb-8 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Users className="mr-2 h-6 w-6 text-red-600" />
                  Your Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{currentUser.email}</p>
                    </div>
                  </div>

                  {/* First Name */}
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="font-medium">{currentUser.first_name}</p>
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="font-medium">{currentUser.last_name}</p>
                    </div>
                  </div>

                  {/* BIO (spans both columns) */}
                  {currentUser.bio && (
                    <div className="flex items-start space-x-3 md:col-span-2">
                      <MessageCircle className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">BIO</p>
                        <p className="font-medium">{currentUser.bio}</p>
                      </div>
                    </div>
                  )}
                  {currentUser.idea_description && (
                    <div className="flex items-start space-x-3 md:col-span-2">
                      <MessageCircle className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Idea Description</p>
                        <p className="font-medium">{currentUser.idea_description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        {/* ─────────── Matches ─────────── */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Users className="mr-3 h-8 w-8 text-red-600" />
            Your Matches
          </h2>

          {matchesLoading ? (
            <p>Loading matches…</p>
          ) : matchesError ? (
            <p className="text-red-500">Error loading matches.</p>
          ) : matches.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
                <p className="text-gray-600">
                  Fill out your profile completely to see your best
                  co-founder matches!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((m, i) => (
                <motion.div
                  key={m.user_id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">
                          {m.first_name} {m.last_name}
                        </CardTitle>
                        <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-semibold">
                           Match: {Math.floor(m.final_score * 100)}%
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">
                        {m.city}, {m.country}
                      </p>
                      <p className="mt-2 text-gray-800 line-clamp-3">
                        {m.bio}
                      </p>

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex-1"
                          onClick={() => navigate(`/profile/${m.user_id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
