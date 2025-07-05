// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext
} from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext({
  currentUser: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
  checkLoginStatus: async () => {}
})

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin]       = useState(false)
  const [loading, setLoading]       = useState(true)
  const navigate                    = useNavigate()

  // Fetch /api/auth/me to see if we’re already logged in
  const checkLoginStatus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      if (!res.ok) {
        setCurrentUser(null)
        setIsAdmin(false)
      } else {
        const { user } = await res.json()
        setCurrentUser(user)
        setIsAdmin(!!user.is_admin)
      }
    } catch (err) {
      console.error('Auth check error', err)
      setCurrentUser(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkLoginStatus()
  }, [checkLoginStatus])

  // Call /api/auth/login, set state & redirect on success
  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers:  { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:     JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        return { success: false, message: data.error || 'Login failed.' }
      }

      setCurrentUser(data.user)
      setIsAdmin(!!data.user.is_admin)
      navigate('/dashboard')
      return { success: true }
    } catch (err) {
      console.error('Login error', err)
      return { success: false, message: 'Network error.' }
    } finally {
      setLoading(false)
    }
  }

  // Call /api/auth/logout, clear state & redirect
  const logout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error', err)
    } finally {
      setCurrentUser(null)
      setIsAdmin(false)
      setLoading(false)
      navigate('/')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        login,
        logout,
        checkLoginStatus
      }}
    >
      {/* don’t render routes until we know whether we’re logged in */}
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export default AuthContext
