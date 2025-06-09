import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = () => {
    try {
      console.log('Checking user status...');
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        console.log('Found saved user:', user);
        setCurrentUser(user);
        const adminStatus = user.email === 'admin@foundermatch.com';
        console.log('Setting admin status:', adminStatus);
        setIsAdmin(adminStatus);

        // Initialize users array if it doesn't exist
        const existingUsers = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
        if (!existingUsers.some(u => u.email === user.email)) {
          existingUsers.push(user);
          localStorage.setItem('founderMatchUsers', JSON.stringify(existingUsers));
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      const isAdminEmail = userData.email === 'admin@foundermatch.com';
      const user = {
        id: Date.now().toString(),
        ...userData,
        is_admin: isAdminEmail,
        created_at: new Date().toISOString()
      };

      // Get existing users or initialize empty array
      const existingUsers = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
      
      // Check if email already exists
      const emailExists = existingUsers.some(u => u.email === userData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }

      // Add new user to the array
      existingUsers.push(user);

      // Store updated users array
      localStorage.setItem('founderMatchUsers', JSON.stringify(existingUsers));
      
      // Store current user
      localStorage.setItem('user', JSON.stringify(user));
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
      
      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
      console.log('Existing users:', existingUsers);
      
      // Find user with matching email
      const user = existingUsers.find(u => u.email === email);
      console.log('Found user:', user);
      
      if (!user) {
        // Special case for admin's first login
        if (email === 'admin@foundermatch.com') {
          const adminUser = {
            id: 'admin',
            email: 'admin@foundermatch.com',
            name: 'Admin User',
            skills: 'Administration',
            is_admin: true,
            created_at: new Date().toISOString()
          };
          
          // Add admin to users array
          existingUsers.push(adminUser);
          localStorage.setItem('founderMatchUsers', JSON.stringify(existingUsers));
          
          // Set as current user
          localStorage.setItem('user', JSON.stringify(adminUser));
          setCurrentUser(adminUser);
          setIsAdmin(true);
          
          return { success: true, isAdmin: true };
        }
        
        throw new Error('User not found');
      }

      // For demo purposes, we're not checking password
      const isAdminEmail = email === 'admin@foundermatch.com';

      // Store current user
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      setIsAdmin(isAdminEmail);

      return { success: true, isAdmin: isAdminEmail };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
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
    login,
    logout,
    signup,
    loading,
    checkUser // Export checkUser so it can be called after state changes
  };

  console.log('AuthContext state:', { currentUser, isAdmin, loading });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;