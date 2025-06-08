import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setCurrentUser(session.user);
        // Fetch the user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setCurrentUser({ ...session.user, ...profile });
          setIsAdmin(profile.role === 'admin');
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Check initial session
    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Fetch the user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        setCurrentUser({ ...session.user, ...profile });
        setIsAdmin(profile.role === 'admin');
      } else {
        setCurrentUser(session.user);
      }
    }
    setLoading(false);
  };

  const signup = async (userData) => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password strength
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }

      // Validate name
      if (userData.name.trim().length < 2) {
        throw new Error('Please enter a valid name (minimum 2 characters)');
      }

      // Sign up with Supabase Auth with email verification enabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: userData.name,
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: userData.name,
            email: userData.email,
            skills: userData.skills ? userData.skills.split(',').map(s => s.trim()) : [],
            interests: userData.interests ? userData.interests.split(',').map(i => i.trim()) : [],
            availability: userData.availability || null,
            role: userData.email === 'admin@foundermatch.com' ? 'admin' : 'user'
          }
        ]);

      if (profileError) throw profileError;

      return { 
        success: true, 
        isAdmin: userData.email === 'admin@foundermatch.com',
        message: 'Please check your email to verify your account before logging in.'
      };
    } catch (error) {
      console.error('Error in signup:', error.message);
      return { success: false, message: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password is not empty
      if (!password.trim()) {
        throw new Error('Please enter your password');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Login failed. Please try again.');
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }

      // Fetch the user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        setCurrentUser({ ...data.user, ...profile });
        setIsAdmin(profile.role === 'admin');
      }

      return { 
        success: true, 
        isAdmin: profile?.role === 'admin' 
      };
    } catch (error) {
      console.error('Error in login:', error.message);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      setIsAdmin(false);
      navigate('/');
    } catch (error) {
      console.error('Error in logout:', error.message);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser(prev => ({ ...prev, ...profileData }));
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error.message);
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAdmin, 
      login, 
      logout, 
      signup, 
      loading,
      updateProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;