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
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAdmin(user.email === 'admin@foundermatch.com');
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

      // Store user in localStorage
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
      // For demo purposes, accept any email/password combination
      const isAdminEmail = email === 'admin@foundermatch.com';
      const user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        is_admin: isAdminEmail,
        created_at: new Date().toISOString()
      };

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

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAdmin, 
      login, 
      logout, 
      signup, 
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;