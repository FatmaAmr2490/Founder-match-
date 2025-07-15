// src/components/Navbar.jsx
import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogOut, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Optionally hide on certain routes:
  const hideOn = ['/login','/signup']
  if (hideOn.includes(pathname)) return null

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="flex-1 flex items-center">
        <Users className="h-6 w-6 text-red-600 mr-2" />
        <Link to="/" className="text-2xl font-bold gradient-text">
          FounderMatch
        </Link>
      </div>

      <nav className="flex items-center gap-2 sm:gap-4">
        {currentUser ? (
          <>
            <Button
             variant="ghost"
             className="hover:bg-red-50"
             onClick={() => navigate('/dashboard')}
           >
            Dashboard
            </Button>

            <Button
            variant="ghost"
            className="hover:bg-red-50"
            onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </Button>
            <Button variant="ghost" className=" hover:bg-red-50" onClick={() => navigate('/matches')}>
              Matches
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" className="hover:bg-red-50" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </>
        )}
      </nav>
    </header>
  )
}
