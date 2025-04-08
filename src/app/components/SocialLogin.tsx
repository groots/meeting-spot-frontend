'use client';

import { useEffect } from 'react';
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
  useEffect(() => {
    // Initialize Google Sign-In
    if (typeof window !== 'undefined' && window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const googleButton = document.getElementById('google-signin');
      if (googleButton) {
        window.google.accounts.id.renderButton(googleButton, {
          theme: 'outline',
          size: 'large',
          width: '100%',
        });
      }
    }

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
        window.location.href = '/';
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
            window.location.href = '/';
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
            window.location.href = '/';
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
        strategy="lazyOnload"
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
          <div id="google-signin" className="w-full" />
          
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
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
} 