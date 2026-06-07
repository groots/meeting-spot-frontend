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
  phone?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
  is_oauth_user: boolean;
  is_premium: boolean;
  email_verified: boolean;
  subscription?: Subscription;
}

interface RegisterFields {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string, fields?: RegisterFields) => Promise<void>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const REMEMBER_KEY = 'auth_remember';

// Read the token from whichever storage holds it (localStorage for
// "remember me", sessionStorage otherwise).
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  if (remember) localStorage.setItem(REMEMBER_KEY, 'true');
}

// Persist a refreshed token into whichever storage already had one.
function persistRefreshedToken(token: string) {
  if (localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      void loadProfile(token);
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GET /me with the given token. On a 401/expired response, try a single
  // refresh against the stored (possibly expired) access token, then retry.
  const loadProfile = async (token: string, allowRefresh = true): Promise<void> => {
    try {
      const response = await fetch(API_ENDPOINTS.profile, {
        headers: { ...API_HEADERS, Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData: User = await response.json();
        setAuthState({ user: userData, token, loading: false, error: null });
        return;
      }

      if (response.status === 401 && allowRefresh) {
        const newToken = await attemptRefresh(token);
        if (newToken) {
          await loadProfile(newToken, false);
          return;
        }
      }

      sessionExpired();
    } catch (err) {
      console.error('[Auth] Error fetching profile:', err);
      if (allowRefresh) {
        const newToken = await attemptRefresh(token);
        if (newToken) {
          await loadProfile(newToken, false);
          return;
        }
      }
      sessionExpired();
    }
  };

  // POST the stored access token to /refresh; returns a fresh token or null.
  const attemptRefresh = async (oldToken: string): Promise<string | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: { ...API_HEADERS, Authorization: `Bearer ${oldToken}` },
        body: JSON.stringify({ token: oldToken }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const newToken: string | undefined = data.access_token;
      if (!newToken) return null;
      persistRefreshedToken(newToken);
      return newToken;
    } catch (err) {
      console.error('[Auth] Error refreshing token:', err);
      return null;
    }
  };

  const sessionExpired = () => {
    clearAuthStorage();
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: 'Session expired. Please login again.',
    });
  };

  const login = async (email: string, password: string, remember = false) => {
    setAuthState((prev) => ({ ...prev, error: null }));
    const response = await fetch(API_ENDPOINTS.login, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({ email, password, remember_me: remember }),
    });

    if (!response.ok) {
      let message = 'Login failed';
      try {
        const errorData = await response.json();
        message = errorData.error || errorData.message || message;
      } catch {
        /* keep default */
      }
      setAuthState((prev) => ({ ...prev, error: message }));
      throw new Error(message);
    }

    const data = await response.json();
    const token: string = data.access_token;
    storeToken(token, remember);
    setAuthState({ user: data.user, token, loading: false, error: null });
    router.push('/dashboard');
  };

  const register = async (email: string, password: string, fields: RegisterFields = {}) => {
    setAuthState((prev) => ({ ...prev, error: null }));

    // Derive a username from the email local-part if none was provided.
    let username = fields.username?.trim();
    if (!username) {
      username = `${email.split('@')[0]}${Math.floor(Math.random() * 1000)}`;
    }

    const payload: Record<string, string> = {
      email: email.trim(),
      password,
      username,
    };
    if (fields.firstName?.trim()) payload.first_name = fields.firstName.trim();
    if (fields.lastName?.trim()) payload.last_name = fields.lastName.trim();
    if (fields.phone?.trim()) payload.phone = fields.phone.trim();

    const response = await fetch(API_ENDPOINTS.register, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      let message = `Registration failed (${response.status})`;
      try {
        const errorData = await response.json();
        message = errorData.message || errorData.error || message;
      } catch {
        /* keep default */
      }
      setAuthState((prev) => ({ ...prev, error: message }));
      throw new Error(message);
    }

    // Auto-login after a successful registration (remember by default).
    await login(email, password, true);
  };

  const logout = () => {
    clearAuthStorage();
    setAuthState({ user: null, token: null, loading: false, error: null });
    router.push('/auth/login');
  };

  const refreshUserProfile = async () => {
    const token = authState.token || getStoredToken();
    if (!token) return;
    try {
      const response = await fetch(API_ENDPOINTS.profile, {
        headers: { ...API_HEADERS, Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData: User = await response.json();
        setAuthState((prev) => ({ ...prev, user: userData, error: null }));
      }
    } catch (error) {
      console.error('[Auth] Error refreshing user profile:', error);
    }
  };

  const contextValue: AuthContextType = {
    user: authState.user,
    token: authState.token,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
