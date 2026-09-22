import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DemoUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, startDate?: string) => Promise<void>;
  loginAsDemo: (userId: number) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mastery_token'));
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
    } catch (err) {
      console.warn('Failed to load active user profile:', err);
      // Fallback or leave user null
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const u = await api.getMe();
        setUser(u);
      } catch (err) {
        console.warn('No active session or guest mode active');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, startDate?: string) => {
    setLoading(true);
    try {
      const res = await api.register({ name, email, password, startDate });
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async (userId: number) => {
    setLoading(true);
    try {
      const res = await api.demoLogin(userId);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginAsDemo,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
