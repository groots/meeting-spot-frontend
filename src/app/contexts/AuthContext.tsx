'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, API_HEADERS } from '../config';
import { useRouter } from 'next/navigation';

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
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  is_oauth_user: boolean;
  is_premium: boolean;
  subscription?: Subscription;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    firstName?: string,
    lastName?: string,
    username?: string
  ) => Promise<void>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const REMEMBER_KEY = 'auth_remember';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    console.log('[Auth] 🔍 Initializing authentication context');
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    console.log('[Auth] 🔑 Initial auth check - token found:', !!token);

    if (token) {
      console.log('[Auth] 🔄 Token found, fetching user profile');
      fetchProfile(token);
    } else if (refreshToken) {
      console.log('[Auth] 🔄 Access token not found but refresh token exists, attempting refresh');
      refreshAccessToken(refreshToken);
    } else {
      console.log('[Auth] ❌ No tokens found, user is not authenticated');
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const refreshAccessToken = async (refreshToken: string) => {
    console.log('[Auth] 🔄 Attempting to refresh access token');
    try {
      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auth] ✅ Token refresh successful');
        const newToken = data.access_token;

        // Store the new access token in localStorage since we're using a refresh token
        localStorage.setItem(TOKEN_KEY, newToken);

        // Fetch the user profile with the new token
        fetchProfile(newToken);
      } else {
        console.error('[Auth] ❌ Token refresh failed, clearing auth state');
        clearAuthStorage();
        setAuthState({
          user: null,
          token: null,
          refreshToken: null,
          loading: false,
          error: 'Session expired. Please login again.',
        });
      }
    } catch (err) {
      console.error('[Auth] 💥 Error refreshing token:', err);
      clearAuthStorage();
      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        error: 'Session expired. Please login again.',
      });
    }
  };

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

        // Get refresh token from storage
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        // Update auth state with user data
        console.log('[Auth] 📝 Updating authentication state with user data');
        setAuthState(prev => ({
          ...prev,
          user: userData,
          token: token,
          refreshToken: refreshToken,
          loading: false,
          error: null,
        }));
        console.log('[Auth] 🟢 Authentication complete - user is logged in');
      } else {
        console.error(`[Auth] ❌ Profile fetch failed with status: ${response.status}`, await response.text());
        // Try to refresh token if we have a refresh token
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          console.log('[Auth] 🔄 Profile fetch failed but refresh token exists, attempting refresh');
          refreshAccessToken(refreshToken);
        } else {
          console.log('[Auth] 🗑️ Clearing stored tokens due to profile fetch failure');
          clearAuthStorage();
          setAuthState(prev => ({
            ...prev,
            user: null,
            token: null,
            refreshToken: null,
            loading: false,
            error: 'Session expired. Please login again.',
          }));
          console.log('[Auth] 🔴 Authentication failed - user is not logged in');
        }
      }
    } catch (err) {
      console.error('[Auth] 💥 Error fetching profile:', err);
      // Try to refresh token if we have a refresh token
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        console.log('[Auth] 🔄 Profile fetch failed but refresh token exists, attempting refresh');
        refreshAccessToken(refreshToken);
      } else {
        console.log('[Auth] 🗑️ Clearing stored tokens due to fetch error');
        clearAuthStorage();
        setAuthState(prev => ({
          ...prev,
          user: null,
          token: null,
          refreshToken: null,
          loading: false,
          error: 'Session expired. Please login again.',
        }));
        console.log('[Auth] 🔴 Authentication failed - user is not logged in');
      }
    }
  };

  const clearAuthStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  };

  const login = async (email: string, password: string, remember: boolean = false) => {
    console.log('[Auth] 🔄 Starting login process');
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      console.log('[Auth] 📡 Sending login request');
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ email, password, remember_me: remember }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auth] ✅ Login successful');

        const token = data.access_token;
        const refreshToken = data.refresh_token;

        // Store access token in appropriate storage
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, token);

        // Store refresh token in localStorage if provided (for "remember me")
        if (refreshToken) {
          console.log('[Auth] 💾 Storing refresh token in localStorage');
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }

        if (remember) {
          localStorage.setItem(REMEMBER_KEY, 'true');
        }

        console.log('[Auth] 📝 Updating authentication state');
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          token: token,
          refreshToken: refreshToken || null,
          error: null,
        }));

        // Verify token is stored correctly
        const storedToken = storage.getItem(TOKEN_KEY);
        console.log('[Auth] ✓ Token verification:', storedToken ? 'Token exists' : 'Token missing');
        console.log('[Auth] 🟢 Login successful - user is now logged in');

        // Redirect to dashboard instead of home page
        router.push('/dashboard');
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

  const register = async (
    email: string,
    password: string,
    name: string,
    firstName?: string,
    lastName?: string,
    username?: string
  ) => {
    console.log('[Auth] 🔄 Starting registration process');
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      console.log('[Auth] 📡 Sending registration request');

      // Generate a username if not provided
      let usernameToUse = username;
      if (!usernameToUse || usernameToUse.trim() === '') {
        // Extract username from email (before the @)
        usernameToUse = email.split('@')[0];
        // Append random digits to make it more unique
        usernameToUse += Math.floor(Math.random() * 1000);
        console.log(`[Auth] 🔠 Generated username: ${usernameToUse}`);
      }

      // Try with a simplified payload to avoid potential issues with the backend
      // Some backends might have strict validation on fields
      const registrationData = {
        email: email.trim(),
        password,
        name: name.trim()  // Keep for backward compatibility
        // Omit other fields that might be causing issues
      };

      console.log('[Auth] 📦 Registration payload:', {
        ...registrationData,
        password: '[REDACTED]'
      });
      console.log('[Auth] 🔗 Sending to endpoint:', API_ENDPOINTS.register);

      try {
        // Remove special headers that cause CORS issues
        const response = await fetch(API_ENDPOINTS.register, {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify(registrationData),
          // Add credentials to handle any CORS issues
          credentials: 'include'
        });

        // Log the response status
        console.log(`[Auth] 📥 Registration response status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log('[Auth] ✅ Registration successful');

          // After registration, log the user in
          await login(email, password, true); // Remember by default for new registrations
        } else {
          // Handle different error status codes
          console.error(`[Auth] ❌ Registration failed with status: ${response.status}`);
          
          try {
            const errorData = await response.json();
            console.error(`[Auth] 📋 Error response:`, errorData);
            throw new Error(errorData.message || 'Registration failed');
          } catch (parseError) {
            // Handle error if response is not JSON
            console.error('[Auth] 🔄 Failed to parse error response:', parseError);
            
            // Try to get the raw text
            const rawText = await response.text();
            console.error('[Auth] 📄 Raw error response:', rawText);
            
            throw new Error(`Registration failed with status ${response.status}`);
          }
        }
      } catch (fetchError) {
        console.error('[Auth] 🔌 Network or fetch error:', fetchError);
        throw fetchError;
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
    clearAuthStorage();
    console.log('[Auth] 🗑️ Cleared all authentication tokens');
    setAuthState({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,
    });
    console.log('[Auth] 🟢 Logout successful - user is now logged out');
  };

  const refreshUserProfile = async () => {
    if (!authState.token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.profile, {
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('[Auth] ✅ Profile refreshed successfully:', userData.email || 'User (email unavailable)');
        
        setAuthState(prev => ({
          ...prev,
          user: userData,
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('[Auth] Error refreshing user profile:', error);
    }
  };

  const contextValue: AuthContextType = {
    user: authState.user,
    token: authState.token,
    refreshToken: authState.refreshToken,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
