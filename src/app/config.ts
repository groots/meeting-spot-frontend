// API configuration
// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Hard-code the production API URL for deployed environments
// Use environment variables or localhost for development/testing
const API_BASE_URL = isProduction 
  ? 'https://api.findameetingspot.com/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api');

// Base URL without the /api suffix for non-standard endpoints
const BASE_URL = isProduction
  ? 'https://api.findameetingspot.com'
  : (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8081');

export const API_ENDPOINTS = {
  meetingRequests: `${API_BASE_URL}/v1/meeting-requests/`,
  meetingRequestStatus: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/status`,
  meetingRequestRespond: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/respond`,
  meetingRequestResults: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/results`,
  dbCheck: `${BASE_URL}/debug/db-check`,
  // Auth endpoints
  login: `${BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/v1/auth/register`,
  profile: `${API_BASE_URL}/v1/auth/me`,
  resetPassword: `${BASE_URL}/api/auth/reset-password`,
  resetPasswordConfirm: `${API_BASE_URL}/v1/auth/reset-password/confirm`,
  verifyEmail: `${BASE_URL}/api/auth/verify-email`,
  resendVerification: `${API_BASE_URL}/auth/resend-verification`,
  // Social auth endpoints
  googleAuth: `${BASE_URL}/api/auth/google`,
  googleCallback: `${API_BASE_URL}/v1/auth/google/callback`,
  facebookAuth: `${BASE_URL}/api/auth/facebook`,
  facebookCallback: `${API_BASE_URL}/v1/auth/facebook/callback`,
  linkedinAuth: `${BASE_URL}/api/auth/linkedin`,
  linkedinCallback: `${API_BASE_URL}/v1/auth/linkedin/callback`,
  findMeetingSpot: `${BASE_URL}/api/meeting-spot/find`,
  versions: `${BASE_URL}/api/versions`,
};

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Social auth configurations
export const GOOGLE_CLIENT_ID = '270814322595-hueraif6brli58po5gishfvcmocv6n04.apps.googleusercontent.com';
export const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';
export const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || ''; 