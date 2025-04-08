'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, API_HEADERS } from '../config';

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const REMEMBER_KEY = 'auth_remember';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      const response = await fetch(API_ENDPOINTS.profile, {
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, remember: boolean = false) => {
    try {
      setError(null);
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, data.access_token);
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, 'true');
        }
        setUser(data.user);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        // After registration, log the user in
        await login(email, password, true); // Remember by default for new registrations
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 