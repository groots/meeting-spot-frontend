// API configuration
// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Hard-code the production API URL for deployed environments
// Use environment variables or localhost for development/testing
export const API_URL = isProduction
  ? 'https://api.findameetingspot.com'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081');

export const API_ENDPOINTS = {
  meetingRequests: `${API_URL}/api/v1/meeting-requests/`,
  meetingRequestStatus: (id: string) => `${API_URL}/api/v1/meeting-requests/${id}/status`,
  meetingRequestRespond: (id: string) => `${API_URL}/api/v1/meeting-requests/${id}/respond`,
  meetingRequestResults: (id: string) => `${API_URL}/api/v1/meeting-requests/${id}/results`,
  // Auth endpoints
  login: `${API_URL}/api/v1/auth/login`,
  register: `${API_URL}/api/v1/auth/register`,
  profile: `${API_URL}/api/v1/auth/me`,
  resetPassword: `${API_URL}/api/v1/auth/reset-password`,
  resetPasswordConfirm: `${API_URL}/api/v1/auth/reset-password/confirm`,
  forgotPassword: `${API_URL}/api/v1/auth/forgot-password`,
  // Social auth endpoints
  googleCallback: `${API_URL}/api/v1/auth/google/callback`,
  facebookCallback: `${API_URL}/api/v1/auth/facebook/callback`,
};

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Google Client ID for OAuth
export const GOOGLE_CLIENT_ID = '270814322595-hueraif6brli58po5gishfvcmocv6n04.apps.googleusercontent.com';

// Facebook App ID
export const FACEBOOK_APP_ID = '1484265795195128';
