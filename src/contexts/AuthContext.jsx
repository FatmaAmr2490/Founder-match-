import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, signIn, signOut, getCurrentUser } from '@/lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkUser = async () => {
    try {
      console.log('Checking user status...');
      const user = await getCurrentUser();
      
      if (user) {
        console.log('Found user:', user);
        setCurrentUser(user);
        setIsAdmin(user.is_admin || false);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setCurrentUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      
      const { user } = await signIn(email, password);
      console.log('Login successful:', user);
      
      setCurrentUser(user);
      setIsAdmin(user.is_admin || false);

      return { success: true, isAdmin: user.is_admin || false };
    } catch (error) {
      console.error('Error logging in:', error);
      return { 
        success: false, 
        message: error.message || "Invalid credentials. Please try again." 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const { user } = await signUp(userData);
      
      setCurrentUser(user);
      setIsAdmin(user.is_admin || false);

      return { success: true, isAdmin: user.is_admin || false };
    } catch (error) {
      console.error('Error signing up:', error);
      return { 
        success: false, 
        message: error.message || "Failed to create account. Please try again." 
      };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setIsAdmin(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const refreshUser = async () => {
    await checkUser();
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    signup,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;