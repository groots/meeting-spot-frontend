'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { API_ENDPOINTS, GOOGLE_CLIENT_ID, FACEBOOK_APP_ID, LINKEDIN_CLIENT_ID } from '../config';

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
    IN?: {
      init: (config: any) => void;
      User?: {
        authorize: (callback: () => void) => void;
      };
    };
    fbAsyncInit?: () => void;
  }
}

export default function SocialLogin() {
  const googleButtonRef = useRef<HTMLDivElement>(null);

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
        });
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
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

    // Initialize LinkedIn SDK
    if (typeof window !== 'undefined' && LINKEDIN_CLIENT_ID) {
      window.IN?.init({
        api_key: LINKEDIN_CLIENT_ID,
        authorize: true,
      });
    }

    // Try to initialize Google Sign-In if the script is already loaded
    initializeGoogleSignIn();
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      const res = await fetch(API_ENDPOINTS.googleCallback, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      if (res.ok) {
        window.location.href = '/create';
      } else {
        console.error('Google authentication failed');
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
    }
  };

  const handleFacebookLogin = () => {
    window.FB?.login(async (response) => {
      if (response.authResponse) {
        try {
          const res = await fetch(API_ENDPOINTS.facebookCallback, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              access_token: response.authResponse.accessToken 
            }),
          });

          if (res.ok) {
            window.location.href = '/create';
          } else {
            console.error('Facebook authentication failed');
          }
        } catch (error) {
          console.error('Error during Facebook authentication:', error);
        }
      }
    }, { scope: 'email,public_profile' });
  };

  const handleLinkedInLogin = () => {
    window.IN?.User?.authorize(() => {
      // LinkedIn's API will return an authorization code
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        fetch(API_ENDPOINTS.linkedinCallback, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })
        .then(res => {
          if (res.ok) {
            window.location.href = '/create';
          } else {
            console.error('LinkedIn authentication failed');
          }
        })
        .catch(error => {
          console.error('Error during LinkedIn authentication:', error);
        });
      }
    });
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
      <Script
        src="https://platform.linkedin.com/in.js"
        strategy="lazyOnload"
        id="linkedin-sdk-script"
      >
        {`api_key: ${LINKEDIN_CLIENT_ID}
          authorize: true`}
      </Script>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
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

          <button
            onClick={handleLinkedInLogin}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Sign in with LinkedIn</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
} 