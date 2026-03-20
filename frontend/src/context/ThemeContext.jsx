import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [branding, setBranding] = useState({
    primaryColor: '#0f172a',
    secondaryColor: '#2563eb',
    institutionName: 'Smart University',
    logoUrl: ''
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await api.get('/admin/settings/branding');
        const data = response.data;
        setBranding(data);
        
        // Inject CSS variables into :root
        const root = document.documentElement;
        root.style.setProperty('--color-primary', data.primaryColor || '#0f172a');
        root.style.setProperty('--color-secondary', data.secondaryColor || '#2563eb');
        
        // If we want to generate shades (e.g. for hover), we can do it here
      } catch (err) {
        console.error("Failed to load branding:", err);
      }
    };
    fetchBranding();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, branding }}>
      {children}
    </ThemeContext.Provider>
  );
};
