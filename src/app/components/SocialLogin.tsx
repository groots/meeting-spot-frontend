'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { API_ENDPOINTS, GOOGLE_CLIENT_ID, FACEBOOK_APP_ID } from '../config';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
    FB?: {
      init: (config: any) => void;
      login: (callback: (response: any) => void, config: any) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export default function SocialLogin() {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const initializeGoogleSignIn = () => {
    if (window.google && GOOGLE_CLIENT_ID && googleButtonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '300px',
          text: 'signin_with',
          logo_alignment: 'center',
        });
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        setGoogleError('Failed to initialize Google Sign-In');
      }
    }
  };

  useEffect(() => {
    // Initialize Facebook SDK
    if (typeof window !== 'undefined' && FACEBOOK_APP_ID) {
      window.fbAsyncInit = function() {
        window.FB?.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };
    }

    // Try to initialize Google Sign-In if the script is already loaded
    initializeGoogleSignIn();
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      setGoogleError(null);
      const res = await fetch(API_ENDPOINTS.googleCallback, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();
      
      if (res.ok) {
        window.location.href = '/create';
      } else {
        console.error('Google authentication failed:', data);
        setGoogleError(data.message || 'Google authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
      setGoogleError('An error occurred during Google authentication');
    }
  };

  const handleFacebookLogin = () => {
    window.FB?.login(function(response) {
      if (response.authResponse) {
        // Get the access token
        const accessToken = response.authResponse.accessToken;
        
        // Make the API call
        fetch(API_ENDPOINTS.facebookCallback, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            access_token: accessToken 
          }),
        })
        .then(res => {
          if (res.ok) {
            window.location.href = '/create';
          } else {
            console.error('Facebook authentication failed');
            return res.json();
          }
        })
        .then(data => {
          if (data && data.message) {
            console.error('Facebook error:', data.message);
          }
        })
        .catch(error => {
          console.error('Error during Facebook authentication:', error);
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'email,public_profile' });
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogleSignIn}
        id="google-signin-script"
      />
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="lazyOnload"
        id="facebook-sdk-script"
      />

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        {googleError && (
          <div className="mt-4 rounded-md bg-red-50 p-3">
            <div className="text-sm text-red-700">{googleError}</div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div ref={googleButtonRef} className="w-full" />
          
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

          {/* LinkedIn button removed */}
        </div>
      </div>
    </>
  );
} 