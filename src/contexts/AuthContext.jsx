import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        // Placeholder for session check
        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = { data: { subscription: null } };

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    try {
      // Placeholder for user refresh
      setUser(null);
      setError('No profile found. Please sign up first.');
    } catch (error) {
      console.error('Error refreshing user:', error);
      setError(error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set a mock user object to simulate a successful login
      const mockUser = {
        id: 1,
        email,
        is_admin: false,
        name: 'Demo User',
        role: 'founder',
        status: 'active',
      };
      setUser(mockUser);
      return { success: true, isAdmin: false };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return { 
        success: false, 
        message: error.message || 'Failed to log in. Please check your credentials and try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Placeholder for signup
      setUser(null);
      return { success: true, isAdmin: false };
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      return { 
        success: false, 
        message: error.message || 'Failed to create account. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Placeholder for logout
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      return { 
        success: false, 
        message: error.message || 'Failed to log out. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;