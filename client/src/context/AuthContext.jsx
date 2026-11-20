import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nirmal_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        if (res.data?.success) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session expired or unauthorized');
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      localStorage.setItem('nirmal_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data?.success) {
      localStorage.setItem('nirmal_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  const demoLogin = async () => {
    try {
      return await login('demo@nirmal.eco', 'password123');
    } catch (err) {
      // If server is clean, try registering demo directly
      return await register({
        name: 'Aarav Sharma',
        email: 'demo@nirmal.eco',
        password: 'password123',
        preferredLanguage: 'en',
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('nirmal_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await authAPI.updateProfile(updates);
    if (res.data?.success) {
      setUser(res.data.user);
      return res.data.user;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
