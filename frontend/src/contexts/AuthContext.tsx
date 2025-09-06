import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { hasTokenCookie } from '../utils/cookieUtils';

interface User {
  userId: string;
  email: string;
  userType: 'patient' | 'doctor';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasToken: boolean;
  login: (email: string, password: string, userType: 'patient' | 'doctor') => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshTokenState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExists, setTokenExists] = useState(hasTokenCookie());

  const isAuthenticated = !!user;
  const hasToken = tokenExists;

  const refreshTokenState = () => {
    setTokenExists(hasTokenCookie());
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        withCredentials: true,
      });
      
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setIsLoading(false);
      refreshTokenState(); // Refresh token state after auth check
    }
  };

  const login = async (email: string, password: string, userType: 'patient' | 'doctor') => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
        userType,
      }, { withCredentials: true });

      if (response.data.userType) {
        setUser({
          userId: response.data.userId || '',
          email: email,
          userType: response.data.userType,
        });
        refreshTokenState(); // Refresh token state after successful login
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.get('http://localhost:3000/api/auth/logout', { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      // Clear the token cookie
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      refreshTokenState(); // Refresh token state after logout
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Periodic check for token changes (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTokenState();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    hasToken,
    login,
    logout,
    checkAuth,
    refreshTokenState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
