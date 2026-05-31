import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load user from localStorage on init
  useEffect(() => {
    const storedUser = localStorage.getItem('couplecotton_user');
    const storedToken = localStorage.getItem('couplecotton_token');
    
    // If we have a user but no token (corrupted state from older version), auto-logout
    if (storedUser && !storedToken) {
      console.warn('Session corrupted (no token found). Forcing logout.');
      localStorage.removeItem('couplecotton_user');
      setUser(null);
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        if (storedToken) setToken(storedToken);
      } catch (e) {
        console.error('Failed to parse user from local storage');
      }
    }
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    localStorage.setItem('couplecotton_user', JSON.stringify(userData));
    if (userToken) {
      setToken(userToken);
      localStorage.setItem('couplecotton_token', userToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('couplecotton_user');
    localStorage.removeItem('couplecotton_token');
    // Also hit the backend logout endpoint if needed, but for now clear local state
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/logout`).catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
