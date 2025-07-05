// src/App.jsx
import React, { useContext } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import { Toaster }      from '@/components/ui/toaster'
import HelpCenter       from '@/components/ui/help-center'
import LandingPage      from '@/pages/LandingPage'
import SignupPage       from '@/pages/SignupPage'
import LoginPage        from '@/pages/LoginPage'
import DashboardPage    from '@/pages/DashboardPage'
import AdminPage        from '@/pages/AdminPage'
import ChatPage         from '@/pages/ChatPage'
import PrivacyPolicyPage    from '@/pages/PrivacyPolicyPage'
import TermsOfServicePage   from '@/pages/TermsOfServicePage'

import AuthContext, { AuthProvider } from '@/contexts/AuthContext'

// ------------------------------------------------------
// Protect routes until auth is resolved
// ------------------------------------------------------
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, isAdmin, loading } = useContext(AuthContext)

  // still fetching /api/auth/me
  if (loading) {
    return <div className="pt-8 text-center">Loading…</div>
  }

  // not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // logged in but not an admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// ------------------------------------------------------
// All your routes
// ------------------------------------------------------
function AppContent() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="/privacy-policy"   element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      </Routes>

      <HelpCenter />
      <Toaster />
    </div>
  )
}

// ------------------------------------------------------
// Root of your app: just wrap in AuthProvider + Router
// ------------------------------------------------------
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}
