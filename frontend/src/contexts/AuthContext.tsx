import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { hasTokenCookie } from '../utils/cookieUtils';

interface User {
  userId: string;
  email: string;
  fullname: string;
  userType: 'patient' | 'doctor';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasToken: boolean;
  login: (email: string, password: string, userType: 'patient' | 'doctor') => Promise<void>;
  register: (formData: any) => Promise<void>;
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
      console.log('🔍 Checking auth status...');
      
      // Add a small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await axios.get(`${(import.meta as any).env.VITE_BACKEND_URL}/api/auth/me`, {
        withCredentials: true,
      });
      
      console.log('✅ Auth check successful:', response.data);
      
      if (response.data.user) {
        setUser({
          userId: response.data.user.userId,
          email: response.data.user.email,
          fullname: response.data.user.fullname,
          userType: response.data.user.userType
        });
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.log('❌ Auth check failed:', error.response?.status, error.response?.data);
      // This is normal for unauthenticated users - don't log as error
      setUser(null);
    } finally {
      setIsLoading(false);
      refreshTokenState(); // Refresh token state after auth check
    }
  };

  const register = async (formData: any) => {
    try {
      console.log('Registering user:', { email: formData.email, userType: formData.userType });
      const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND_URL}/api/auth/register`, {
        ...formData,
      }, { withCredentials: true });

      if (response.data.message) {
        // Set user state directly from registration response
        setUser({
          userId: response.data.userId || '',
          email: formData.email,
          fullname: formData.fullname || '',
          userType: formData.userType,
        });
        
        // Refresh token state
        refreshTokenState();
        
        return response.data;
      }
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const login = async (email: string, password: string, userType: 'patient' | 'doctor') => {
    try {
      const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND_URL}/api/auth/login`, {
        email,
        password,
        userType,
      }, { withCredentials: true });

      if (response.data.userType) {
        // Set user state directly from login response
        setUser({
          userId: response.data.userId || '',
          email: email,
          fullname: response.data.fullname || '',
          userType: response.data.userType,
        });
        
        // Refresh token state
        refreshTokenState();
      }
    } catch (error) {
      throw error;
    }
  };


  const logout = async () => {
    try {
      await axios.get(`${(import.meta as any).env.VITE_BACKEND_URL}/api/auth/logout`, { withCredentials: true });
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
    register,
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
