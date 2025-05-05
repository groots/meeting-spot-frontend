'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import Script from 'next/script';
import { API_ENDPOINTS, API_HEADERS, GOOGLE_CLIENT_ID } from '@/app/config';

// Add a utility function to check server status
const checkServerStatus = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.health, {
      method: 'GET',
      headers: API_HEADERS,
    });
    
    if (response.ok) {
      const data = await response.json();
      return { 
        status: data.status === 'ok' ? 'ok' : 'error', 
        message: data.status === 'ok' ? 'Server is running' : `Server health check: ${data.status}`
      };
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

  // Handle Google credential response
  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      setSocialError(null);
      
      // Log the received credential
      console.log('[Auth] 🔑 Google credential received:', response.credential.substring(0, 20) + '...');
      
      // Try regular endpoint first
      let serverResponse = await fetch(API_ENDPOINTS.googleCallback, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      // If server error occurs, try direct endpoint
      if (serverResponse.status >= 500) {
        console.log('[Auth] ⚠️ Server error with standard Google auth, trying direct endpoint');
        serverResponse = await fetch(API_ENDPOINTS.googleCallbackDirect, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: response.credential }),
        });
      }

      // Log server response status
      console.log(`[Auth] Google callback response status: ${serverResponse.status}`);
      
      let errorMessage = 'Google authentication failed';
      
      if (serverResponse.ok) {
        console.log('[Auth] Google authentication successful');
        window.location.href = '/create';
      } else {
        try {
          const errorData = await serverResponse.json();
          console.error('Google authentication failed:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        setSocialError(errorMessage);
      }
    } catch (err) {
      console.error('Error during Google authentication:', err);
      setSocialError('An error occurred during Google authentication');
    }
  };

  // Initialize Google Sign-In
  const initGoogleSignIn = () => {
    try {
      // Check if Google is defined
      if (typeof window !== 'undefined' && window.google && GOOGLE_CLIENT_ID && socialRef.current) {
        console.log('[Auth] Initializing Google Sign-In');
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
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
      } else {
        console.warn('[Auth] Could not initialize Google Sign-In:', { 
          googleExists: typeof window !== 'undefined' && !!window.google,
          clientIdExists: !!GOOGLE_CLIENT_ID,
          refExists: !!socialRef.current
        });
      }
    } catch (e) {
      console.error('Error initializing Google Sign-In:', e);
      setSocialError('Failed to initialize Google Sign-In');
    }
  };

  useEffect(() => {
    // Load Google Sign-In library
    const googleScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    
    if (googleScript) {
      // If script is already loaded, initialize
      initGoogleSignIn();
    } else {
      // If script isn't loaded yet, add an event listener
      const handleGoogleScriptLoad = () => {
        console.log('[Auth] Google Sign-In script loaded');
        initGoogleSignIn();
      };
      
      window.addEventListener('load', handleGoogleScriptLoad);
      
      return () => {
        window.removeEventListener('load', handleGoogleScriptLoad);
      };
    }
  }, []);

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
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
        </div>
      </div>
      
      {socialError && (
        <div className="mt-4 rounded-md bg-red-50 p-3">
          <div className="text-sm text-red-700">{socialError}</div>
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div ref={socialRef} className="w-full" />
        
        <button
          onClick={handleFacebookLogin}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
  
  const router = useRouter();
  const { login, error, user, token } = useAuth();
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Initialize Google Sign-In - reference to the function for Script onLoad
  const initGoogleSignIn = () => {
    console.log('[Auth] Calling Google Sign-In initialization from main component');
    // This is just a placeholder to call the actual initialization in SocialSignIn
    // We'll trigger a re-render of the SocialSignIn component to initialize
    setSessionError(prev => prev); // Force re-render
  };

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
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[Auth] Google client script loaded');
          initGoogleSignIn();
        }}
      />
      <Script 
        src="https://connect.facebook.net/en_US/sdk.js" 
        strategy="afterInteractive" 
        id="facebook-sdk-script"
        onLoad={() => console.log('[Auth] Facebook SDK script loaded')} 
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                create a new account
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <input type="hidden" name="remember" value={rememberMe ? 'true' : 'false'} />
            
            {/* Error messages */}
            {(sessionError || error || statusCheck?.status === 'error') && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {sessionError || error || statusCheck?.message}
                </p>
                {statusCheck?.status === 'error' && (
                  <p className="text-xs mt-1 text-red-500">
                    The server appears to be having issues. Please try again later or contact support.
                  </p>
                )}
              </div>
            )}
            
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/reset-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
            
            <div className="mt-6">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
          
          <SocialSignIn />
        </div>
      </div>
    </>
  );
}
