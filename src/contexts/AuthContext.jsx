import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkLoginStatus = () => {
    const storedUser = localStorage.getItem('currentUser');
    const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsAdmin(storedIsAdmin);
    setLoading(false);
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const login = (userData, isAdminFlag = false) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    if (isAdminFlag) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };
  
  const checkAdmin = () => {
    if (currentUser && currentUser.email === 'admin@foundermatch.com') {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
        return true;
    }
    return localStorage.getItem('isAdmin') === 'true';
  };


  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, login, logout, loading, checkAdmin, checkLoginStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;