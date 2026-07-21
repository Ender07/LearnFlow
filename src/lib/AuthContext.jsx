import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: 'local-app',
    public_settings: {
      auth_required: true
    }
  });

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // Verify if local user session exists in localStorage
      const localUser = localStorage.getItem('lf_current_user');
      if (localUser) {
        const parsedUser = JSON.parse(localUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('Local app state check failed:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'Failed to initialize local workspace.'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const loginLocalUser = (userData) => {
    localStorage.setItem('lf_current_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setAuthChecked(true);
  };

  const checkUserAuth = async () => {
    await checkAppState();
  };

  const logout = () => {
    localStorage.removeItem('lf_current_user');
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
    window.location.reload();
  };

  const navigateToLogin = () => {
    // Navigate using browser location to the local login page
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      loginLocalUser,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
