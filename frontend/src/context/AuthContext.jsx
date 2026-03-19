import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          // Expected behavior if token is expired/invalid. 
          // Silently remove token instead of throwing a scary console error.
          localStorage.removeItem('token');
        }
      } else {
        localStorage.removeItem('token');
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // ── Session Timeout Logic ─────────────────────────────────────────────
  useEffect(() => {
    let timeoutId;
    const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (user) {
        timeoutId = setTimeout(() => {
          logout();
          alert("Session timed out due to inactivity. Please login again.");
        }, TIMEOUT_MS);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [user]);

  const login = async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
