import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:5001';
  axios.defaults.withCredentials = true; // For refresh token cookies

  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  useEffect(() => {
    // Attempt to silently refresh token on mount
    const initAuth = async () => {
      try {
        const res = await axios.get('/api/auth/refresh');
        setAccessToken(res.data.accessToken);
        setCurrentUser(res.data);
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setCurrentUser(res.data);
  };

  const register = async (username, email, password) => {
    const res = await axios.post('/api/auth/register', { username, email, password });
    setAccessToken(res.data.accessToken);
    setCurrentUser(res.data);
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setAccessToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, accessToken, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
