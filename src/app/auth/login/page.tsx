'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Script from 'next/script';
import { API_ENDPOINTS, API_HEADERS, FACEBOOK_LOGIN_ENABLED } from '@/app/config';

// Client ID for Google OAuth
const API_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Add a utility function to check server status
const checkServerStatus = async () => {
  try {
    const response = await fetch(`${API_ENDPOINTS.login.split('/auth/login')[0]}/health`, {
      method: 'GET',
      headers: API_HEADERS,
    });
    
    if (response.ok) {
      return { status: 'ok', message: 'Server is running' };
    }
    
    return { 
      status: 'error', 
      message: `Server responded with status: ${response.status}` 
    };
  } catch (err) {
    console.error('Server check error:', err);
    return { 
      status: 'error', 
      message: err instanceof Error ? err.message : 'Cannot connect to server' 
    };
  }
};

function SocialSignIn() {
  const socialRef = useRef<HTMLDivElement>(null);
  const [socialError, setSocialError] = useState<string | null>(null);

  // Initialize Google Sign-In
  const initGoogleSignIn = () => {
    if (window.google && API_CLIENT_ID && socialRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: API_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(socialRef.current, {
          theme: 'outline',
          size: 'large',
          width: '300px',
          text: 'signin_with',
          logo_alignment: 'center',
        });
      } catch (e) {
        console.error('Error initializing Google Sign-In:', e);
        setSocialError('Failed to initialize Google Sign-In');
      }
    }
  };

  useEffect(() => {
    initGoogleSignIn();
  }, []);

  // Handle Google credential response
  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      setSocialError(null);
      
      // Log the received credential
      console.log('[Auth] 🔑 Google credential received:', response.credential.substring(0, 20) + '...');
      
      const serverResponse = await fetch(API_ENDPOINTS.googleCallback, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      // Log server response status
      console.log(`[Auth] Google callback response status: ${serverResponse.status}`);
      
      const data = await serverResponse.json();
      
      if (serverResponse.ok) {
        console.log('[Auth] Google authentication successful');
        window.location.href = '/create';
      } else {
        console.error('Google authentication failed:', data);
        setSocialError(data.message || 'Google authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during Google authentication:', err);
      setSocialError('An error occurred during Google authentication');
    }
  };

  // Handle Facebook login
  const handleFacebookLogin = () => {
    // Only proceed if Facebook SDK is loaded
    if (window.FB) {
      window.FB.login(function(response) {
        if (response.authResponse) {
          console.log('[Auth] 🔑 Facebook access token received');
          const accessToken = response.authResponse.accessToken;
          
          // Send token to backend
          fetch(API_ENDPOINTS.facebookCallback, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: accessToken }),
          })
          .then(response => {
            console.log(`[Auth] Facebook callback response status: ${response.status}`);
            if (!response.ok) {
              console.error('Facebook authentication failed');
              return response.json();
            }
            // Success - redirect
            window.location.href = '/create';
          })
          .then(errorData => {
            if (errorData && errorData.message) {
              console.error('Facebook error:', errorData.message);
              setSocialError(errorData.message);
            }
          })
          .catch(error => {
            console.error('Error during Facebook authentication:', error);
            setSocialError('Error processing Facebook login');
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      }, { scope: 'email,public_profile' });
    } else {
      console.error('Facebook SDK not loaded');
      setSocialError('Facebook login is currently unavailable');
    }
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-surface text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {socialError && (
        <div className="mt-4 rounded-lg bg-error/10 p-3">
          <div className="text-sm text-error">{socialError}</div>
        </div>
      )}

      <div className={`mt-6 grid gap-3 ${FACEBOOK_LOGIN_ENABLED ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div ref={socialRef} className="w-full" />

        {FACEBOOK_LOGIN_ENABLED && (
          <button
            onClick={handleFacebookLogin}
            className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-lg shadow-sm bg-surface text-sm font-medium text-muted-foreground hover:bg-surface-muted"
          >
            <span className="sr-only">Sign in with Facebook</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusCheck, setStatusCheck] = useState<{ status: string; message: string } | null>(null);
  
  const { login, error, user, token } = useAuth();
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Check if URL has session_expired parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('session_expired') === 'true') {
      setSessionError('Session expired. Please login again.');
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    if (user && token) {
      console.log('[Auth] User already logged in, redirecting to dashboard');
      window.location.href = '/create';
    }
  }, [user, token]);

  // Check server status if there's an error
  useEffect(() => {
    if (error && error.includes('Server error')) {
      checkServerStatus().then(setStatusCheck);
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('[Auth] Attempting login with email:', email);
      await login(email, password, rememberMe);
      console.log('[Auth] Login successful, redirecting to dashboard');
      window.location.href = '/create';
    } catch (err) {
      console.error('[Auth] Login failed:', err);
      // If the error suggests a server issue, check server status
      if (err instanceof Error && (err.message.includes('Server error') || err.message.includes('Failed to fetch'))) {
        const status = await checkServerStatus();
        setStatusCheck(status);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Load external scripts */}
      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      {FACEBOOK_LOGIN_ENABLED && (
        <Script src="https://connect.facebook.net/en_US/sdk.js" strategy="lazyOnload" id="facebook-sdk-script" />
      )}
      
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="mb-8 flex flex-col items-center">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="font-bold text-lg">Find a Meeting Spot</span>
            </Link>
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-medium text-primary hover:text-primary-hover">
                Create one
              </Link>
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <form className="space-y-5" onSubmit={handleLogin}>
              <input type="hidden" name="remember" value={rememberMe ? 'true' : 'false'} />

              {/* Error messages */}
              {(sessionError || error || statusCheck?.status === 'error') && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-sm text-error">
                    {sessionError || error || statusCheck?.message}
                  </p>
                  {statusCheck?.status === 'error' && (
                    <p className="text-xs mt-1 text-error/80">
                      The server appears to be having issues. Please try again later or contact support.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email-address" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Link
                    href="/auth/reset-password"
                    className="text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <SocialSignIn />
          </div>
        </div>
      </div>
    </>
  );
}
