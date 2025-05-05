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
  meetingRequestResendInvitation: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/resend-invitation`,
  dbCheck: `${BASE_URL}/debug/db-check`,
  health: `${API_BASE_URL}/v1/health`,
  // Auth endpoints
  login: `${API_BASE_URL}/v1/auth/login`,
  loginDirect: `${API_BASE_URL}/v1/auth/login/direct`, // Direct login endpoint that bypasses ORM
  register: `${API_BASE_URL}/v1/auth/register`,
  registerDirect: `${API_BASE_URL}/v1/auth/register/direct`, // Direct register endpoint that bypasses ORM
  profile: `${API_BASE_URL}/v1/auth/me`,
  profilePicture: `${API_BASE_URL}/v1/auth/me/picture`,
  refresh: `${API_BASE_URL}/v1/auth/refresh`,
  resetPassword: `${API_BASE_URL}/v1/auth/reset-password`,
  resetPasswordConfirm: `${API_BASE_URL}/v1/auth/reset-password/confirm`,
  verifyEmail: `${API_BASE_URL}/v1/auth/verify-email`,
  resendVerification: `${API_BASE_URL}/v1/auth/resend-verification`,
  // Social auth endpoints
  googleAuth: `${API_BASE_URL}/v1/auth/google`,
  googleCallback: `${API_BASE_URL}/v1/auth/google/callback`,
  googleCallbackDirect: `${API_BASE_URL}/v1/auth/google/callback/direct`,
  facebookAuth: `${API_BASE_URL}/v1/auth/facebook`,
  facebookCallback: `${API_BASE_URL}/v1/auth/facebook/callback`,
  linkedinAuth: `${API_BASE_URL}/v1/auth/linkedin`,
  linkedinCallback: `${API_BASE_URL}/v1/auth/linkedin/callback`,
  findMeetingSpot: `${API_BASE_URL}/v1/meeting-spot/find`,
  versions: `${BASE_URL}/api/versions`,
  // Contacts endpoints
  contacts: `${API_BASE_URL}/v1/contacts`,
  contactFromMeeting: (meetingId: string) => `${API_BASE_URL}/v1/contacts/from-meeting/${meetingId}`,
  // Geocoding endpoint
  geocoding: `${API_BASE_URL}/v1/geocoding`,
};

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Social auth configurations
export const GOOGLE_CLIENT_ID = '270814322595-hueraif6brli58po5gishfvcmocv6n04.apps.googleusercontent.com';
export const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1484265795195128';
export const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '';

// Maps API configuration
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDLR7KhhfKqH7F1S0X-D0ZB7LSpGIGCqsI'; // Fallback to a test key
