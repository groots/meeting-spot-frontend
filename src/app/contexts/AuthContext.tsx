'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, API_HEADERS } from '../config';
import { useRouter } from 'next/navigation';
import { initApiHelpers } from '../utils/api';

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
  profile_picture?: string;
  phone?: string;
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
    username?: string,
    phone?: string
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

  // Initialize the API helpers with auth callbacks
  useEffect(() => {
    initApiHelpers({
      onTokenExpired: () => {
        console.log('[Auth] 🔑 Token expired callback triggered');
        clearAuthStorage();
        setAuthState(prev => ({
          ...prev,
          user: null,
          token: null,
          refreshToken: null,
          loading: false,
          error: 'Your session has expired. Please log in again.',
        }));
        router.push('/auth/login?expired=true');
      },
      onUnauthorized: () => {
        console.log('[Auth] 🔒 Unauthorized callback triggered');
        router.push('/auth/login?unauthorized=true');
      },
      getToken: () => authState.token,
    });
  }, [authState.token, router]);

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
      
      // Try regular login endpoint first
      let response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ email, password, remember_me: remember }),
      });

      // If server error occurs, try direct login endpoint
      if (response.status >= 500) {
        console.log('[Auth] ⚠️ Server error with standard login, trying direct login endpoint');
        response = await fetch(API_ENDPOINTS.loginDirect, {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify({ email, password, remember_me: remember }),
        });
      }

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
    username?: string,
    phone?: string
  ) => {
    console.log('[Auth] 🔄 Starting registration process');
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Clear any existing tokens
      clearAuthStorage();

      // Prepare registration payload with optional fields
      const payload: any = { email, password };
      
      // Only add fields that have values
      if (name) payload.name = name;
      if (firstName) payload.first_name = firstName;
      if (lastName) payload.last_name = lastName;
      if (username) payload.username = username;
      if (phone) payload.phone = phone;

      // Try regular register endpoint first
      let response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify(payload),
      });

      // If server error occurs, try direct register endpoint
      if (response.status >= 500) {
        console.log('[Auth] ⚠️ Server error with standard register, trying direct register endpoint');
        response = await fetch(API_ENDPOINTS.registerDirect, {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify(payload),
        });
      }

      let errorMessage = 'Registration failed';
      
      // Process the response
      if (response.ok) {
        const data = await response.json();
        console.log('[Auth] ✅ Registration successful');

        // After registration, log the user in
        await login(email, password, true); // Remember by default for new registrations
      } else {
        // Handle error without trying to read the body twice
        console.error(`[Auth] ❌ Registration failed with status: ${response.status}`);
        
        try {
          // Try to read the response as JSON
          const errorData = await response.json();
          console.error(`[Auth] 📋 Error response:`, errorData);
          errorMessage = errorData.message || errorData.error || 'Registration failed';
        } catch (parseError) {
          // If it's not JSON or body was already read, use status code
          console.error('[Auth] 🔄 Failed to parse error response:', parseError);
          errorMessage = `Registration failed with status ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('[Auth] Registration error:', err);
      setAuthState(prev => ({
        ...prev,
        loading: false,
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
