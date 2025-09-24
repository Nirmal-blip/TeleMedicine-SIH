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
  loginWithOTP: (email: string, password: string, userType: 'patient' | 'doctor', otp: string) => Promise<void>;
  registerWithOTP: (formData: any, otp: string) => Promise<void>;
  sendOTP: (email: string, purpose: 'signup' | 'signin') => Promise<void>;
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
      const response = await axios.get(`${(import.meta as any).env.VITE_BACKEND_URL}/api/auth/me`, {
        withCredentials: true,
      });
      
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
    } catch (error) {
      // This is normal for unauthenticated users - don't log as error
      setUser(null);
    } finally {
      setIsLoading(false);
      refreshTokenState(); // Refresh token state after auth check
    }
  };

  const sendOTP = async (email: string, purpose: 'signup' | 'signin') => {
    try {
      const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND_URL}/api/auth/send-otp`, {
        email,
        purpose,
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      throw new Error(errorMessage);
    }
  };

  const registerWithOTP = async (formData: any, otp: string) => {
    try {
      console.log('Registering with OTP:', { email: formData.email, otp: otp.substring(0, 2) + '****' });
      const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND_URL}/api/auth/register-with-otp`, {
        ...formData,
        otp,
      }, { withCredentials: true });

      if (response.data.message) {
        setUser({
          userId: '', // Will be set after login
          email: formData.email,
          fullname: formData.fullname || '',
          userType: formData.userType,
        });
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
        setUser({
          userId: response.data.userId || '',
          email: email,
          fullname: '',
          userType: response.data.userType,
        });
        refreshTokenState(); // Refresh token state after successful login
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithOTP = async (email: string, password: string, userType: 'patient' | 'doctor', otp: string) => {
    try {
      console.log('Logging in with OTP:', { email, otp: otp.substring(0, 2) + '****' });
      const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND_URL}/api/auth/login-with-otp`, {
        email,
        password,
        userType,
        otp,
      }, { withCredentials: true });

      if (response.data.userType) {
        setUser({
          userId: response.data.userId || '',
          email: email,
          fullname: '',
          userType: response.data.userType,
        });
        refreshTokenState();
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
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
    loginWithOTP,
    registerWithOTP,
    sendOTP,
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
