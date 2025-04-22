'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, API_HEADERS } from '../config';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  end_date?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_oauth_user: boolean;
  is_premium: boolean;
  subscription?: Subscription;
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
    console.log('[Auth] 🔍 Initializing authentication context');
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    console.log('[Auth] 🔑 Initial auth check - token found:', !!token);
    if (token) {
      console.log('[Auth] 🔄 Token found, fetching user profile');
      fetchProfile(token);
    } else {
      console.log('[Auth] ❌ No token found, user is not authenticated');
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchProfile = async (token: string) => {
    console.log('[Auth] 🔄 Starting profile fetch');
    try {
      console.log('[Auth] 📡 Fetching profile with token:', token.substring(0, 10) + '...');
      const response = await fetch(API_ENDPOINTS.profile, {
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('[Auth] ✅ Profile fetched successfully:', userData.email || 'User (email unavailable)');
        
        // Make sure user has email property, add fallback if missing
        if (!userData.email) {
          console.log('[Auth] ⚠️ User email missing in profile data, adding placeholder');
          userData.email = 'User';
        }
        
        // Update auth state with user data
        console.log('[Auth] 📝 Updating authentication state with user data');
        setAuthState(prev => ({
          ...prev,
          user: userData,
          token: token,
          loading: false,
          error: null,
        }));
        console.log('[Auth] 🟢 Authentication complete - user is logged in');
      } else {
        console.error(`[Auth] ❌ Profile fetch failed with status: ${response.status}`, await response.text());
        // Clear tokens on profile fetch failure
        console.log('[Auth] 🗑️ Clearing stored tokens due to profile fetch failure');
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        setAuthState(prev => ({
          ...prev,
          user: null,
          token: null,
          loading: false,
          error: 'Session expired. Please login again.',
        }));
        console.log('[Auth] 🔴 Authentication failed - user is not logged in');
      }
    } catch (err) {
      console.error('[Auth] 💥 Error fetching profile:', err);
      // Clear tokens on error
      console.log('[Auth] 🗑️ Clearing stored tokens due to fetch error');
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      setAuthState(prev => ({
        ...prev,
        user: null,
        token: null,
        loading: false,
        error: 'Session expired. Please login again.',
      }));
      console.log('[Auth] 🔴 Authentication failed - user is not logged in');
    }
  };

  const login = async (email: string, password: string, remember: boolean = false) => {
    console.log('[Auth] 🔄 Starting login process');
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      console.log('[Auth] 📡 Sending login request');
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auth] ✅ Login successful');
        
        const token = data.access_token;
        const storage = remember ? localStorage : sessionStorage;
        console.log(`[Auth] 💾 Storing token in ${remember ? 'localStorage' : 'sessionStorage'}`);
        storage.setItem(TOKEN_KEY, token);
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, 'true');
        }
        
        console.log('[Auth] 📝 Updating authentication state');
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          token: token,
          error: null,
        }));
        
        // Verify token is stored correctly
        const storedToken = storage.getItem(TOKEN_KEY);
        console.log('[Auth] ✓ Token verification:', storedToken ? 'Token exists' : 'Token missing');
        console.log('[Auth] 🟢 Login successful - user is now logged in');
      } else {
        const errorData = await response.json();
        console.error(`[Auth] ❌ Login failed with status: ${response.status}`, errorData);
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (err) {
      console.error('[Auth] 💥 Login error:', err);
      setAuthState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An error occurred',
      }));
      console.log('[Auth] 🔴 Login failed - user is not logged in');
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    console.log('[Auth] 🔄 Starting registration process');
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      console.log('[Auth] 📡 Sending registration request');
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        console.log('[Auth] ✅ Registration successful, proceeding to login');
        // After registration, log the user in
        await login(email, password, true); // Remember by default for new registrations
      } else {
        const errorData = await response.json();
        console.error(`[Auth] ❌ Registration failed with status: ${response.status}`, errorData);
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (err) {
      console.error('[Auth] 💥 Registration error:', err);
      setAuthState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An error occurred',
      }));
      console.log('[Auth] 🔴 Registration failed - user is not logged in');
      throw err;
    }
  };

  const logout = () => {
    console.log('[Auth] 🔄 Logging out user');
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    console.log('[Auth] 🗑️ Cleared all authentication tokens');
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
    console.log('[Auth] 🟢 Logout successful - user is now logged out');
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