import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, signIn, signOut, getCurrentUser } from '@/lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('Checking user status...');
      const user = await getCurrentUser();
      
      if (user) {
        console.log('Found user:', user);
        setCurrentUser(user);
        const adminStatus = user.email === 'admin@foundermatch.com';
        console.log('Setting admin status:', adminStatus);
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      const { user } = await signUp(userData);
      const isAdminEmail = userData.email === 'admin@foundermatch.com';
      
      setCurrentUser(user);
      setIsAdmin(isAdminEmail);

      return { success: true, isAdmin: isAdminEmail };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, message: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      
      const { user } = await signIn(email, password);
      console.log('Login successful:', user);
      
      const isAdminEmail = email === 'admin@foundermatch.com';
      setCurrentUser(user);
      setIsAdmin(isAdminEmail);

      return { success: true, isAdmin: isAdminEmail };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, message: error.message };
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

  const value = {
    currentUser,
    isAdmin,
    loading,
    signup,
    login,
    logout,
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