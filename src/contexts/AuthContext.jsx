import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signIn, signUp, getCurrentUser } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await refreshUser();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setError(error.message);
    setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await refreshUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setError(null);
      } else {
        // If no user profile exists, sign out
        await supabase.auth.signOut();
        setUser(null);
        setError('No profile found. Please sign up first.');
      }
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
      
      const { user: authUser, error } = await signIn(email, password);
      
      if (error) throw error;

      if (!authUser) {
        throw new Error('No user returned from login');
      }

      setUser(authUser);
      return { success: true, isAdmin: authUser.is_admin };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      // Custom message for unverified email
      if (error.message && error.message.includes('verify your email')) {
        return {
          success: false,
          message: 'Please verify your email address before logging in. Check your inbox for a verification link.'
        };
      }
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
      
      const { user: newUser, error } = await signUp(userData);
      
      if (error) throw error;
      
      if (!newUser) {
        throw new Error('No user returned from signup');
      }

      setUser(newUser);
      return { success: true, isAdmin: newUser.is_admin };
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
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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