import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    checkUser(); // Check current user on mount

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setCurrentUser({ ...user, ...profile });
          setIsAdmin(profile.is_admin || false);
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
        }
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

  const handleAuthChange = async (event, session) => {
    if (event === 'SIGNED_IN') {
      await checkUser();
    } else if (event === 'SIGNED_OUT') {
      setCurrentUser(null);
      setIsAdmin(false);
    }
  };

  const signup = async (userData) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) throw authError;

      const isAdminEmail = userData.email === 'admin@foundermatch.com';

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name: userData.name,
            university: userData.university,
            skills: userData.skills,
            interests: userData.interests,
            availability: userData.availability,
            bio: userData.bio,
            is_admin: isAdminEmail,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) throw profileError;

      await checkUser();
      return { success: true, isAdmin: isAdminEmail };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, message: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user exists and is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      setCurrentUser({ ...data.user, ...profile });
      setIsAdmin(profile.is_admin || false);

      return { success: true, isAdmin: profile.is_admin || false };
    } catch (error) {
      console.error('Error logging in:', error);
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
      console.error('Error logging out:', error);
    }
  };
  
  const checkAdmin = () => {
    return isAdmin || (currentUser?.is_admin || false);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAdmin, 
      login, 
      logout, 
      signup, 
      loading,
      checkUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;