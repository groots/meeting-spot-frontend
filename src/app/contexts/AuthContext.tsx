'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, API_HEADERS } from '../config';

interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_oauth_user: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const REMEMBER_KEY = 'auth_remember';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchProfile(token);
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      console.log('Fetching profile with token:', token); // Debug log
      const response = await fetch(API_ENDPOINTS.profile, {
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setAuthState(prev => ({
          ...prev,
          user: userData,
          token: token,
          loading: false,
        }));
        console.log('Profile fetched, setting auth state:', { user: userData, token }); // Debug log
      } else {
        console.log('Profile fetch failed, clearing tokens'); // Debug log
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        setAuthState(prev => ({
          ...prev,
          user: null,
          token: null,
          loading: false,
        }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      setAuthState(prev => ({
        ...prev,
        user: null,
        token: null,
        loading: false,
      }));
    }
  };

  const login = async (email: string, password: string, remember: boolean = false) => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login response:', data); // Debug log
        
        const token = data.access_token;
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, token);
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, 'true');
        }
        
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          token: token,
          error: null,
        }));
        console.log('Setting auth state:', { user: data.user, token }); // Debug log
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      setAuthState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An error occurred',
      }));
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
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
      setAuthState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An error occurred',
      }));
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
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