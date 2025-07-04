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
        const parsedUser = JSON.parse(storedUser);
        // We don't store password in currentUser state for security,
        // but it was saved during signup.
        // For login, we'd check against the full user record from localStorage.
        setCurrentUser(parsedUser); 
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

  const signup = (userDataWithPassword) => {
    // In a real app, password would be hashed here before saving.
    // For localStorage, we save it as is for this demo.
    const users = JSON.parse(localStorage.getItem('founderMatchUsers') || '[]');
    users.push(userDataWithPassword);
    localStorage.setItem('founderMatchUsers', JSON.stringify(users));

    const { password, ...userDataToStore } = userDataWithPassword; // Don't store password in active currentUser state

    setCurrentUser(userDataToStore);
    localStorage.setItem('currentUser', JSON.stringify(userDataToStore));
    
    const isAdminUser = userDataWithPassword.email === 'admin@foundermatch.com';
    if (isAdminUser) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
    }
    return { success: true, isAdmin: isAdminUser };
  };


const login = async (email, password) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      // Set admin if needed
      const isAdminUser = data.user.email === 'admin@foundermatch.com';
      setIsAdmin(isAdminUser);
      localStorage.setItem('isAdmin', isAdminUser ? 'true' : 'false');
      return { success: true, isAdmin: isAdminUser };
    } else {
      return { success: false, message: data.error || 'Login failed.' };
    }
  } catch (err) {
    return { success: false, message: 'Network error.' };
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
    // This check can remain as is, or rely on isAdmin state which is set during login/signup
    return isAdmin || (currentUser && currentUser.email === 'admin@foundermatch.com');
  };


  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, login, logout, signup, loading, checkAdmin, checkLoginStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;