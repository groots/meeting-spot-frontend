// API configuration — single source of truth for the frontend.
// Determine if we're in production mode.
const isProduction = process.env.NODE_ENV === 'production';

// Production hits the verified custom domain; dev falls back to localhost.
const API_BASE_URL = isProduction
  ? 'https://api.findameetingspot.com/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api');

// Base URL without the /api suffix (health check, etc.).
const BASE_URL = isProduction
  ? 'https://api.findameetingspot.com'
  : (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8081');

export const API_ENDPOINTS = {
  // Health
  health: `${BASE_URL}/api/v1/health`,

  // Meeting requests
  meetingRequests: `${API_BASE_URL}/v1/meeting-requests/`,
  meetingRequestStatus: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/status`,
  meetingRequestRespond: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/respond`,
  meetingRequestResults: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/results`,
  meetingRequestResendInvitation: (id: string) =>
    `${API_BASE_URL}/v1/meeting-requests/${id}/resend-invitation`,

  // Auth
  login: `${API_BASE_URL}/v1/auth/login`,
  register: `${API_BASE_URL}/v1/auth/register`,
  profile: `${API_BASE_URL}/v1/auth/me`,
  refresh: `${API_BASE_URL}/v1/auth/refresh`,
  resetPassword: `${API_BASE_URL}/v1/auth/reset-password`,
  resetPasswordConfirm: `${API_BASE_URL}/v1/auth/reset-password/confirm`,
  verifyEmail: `${API_BASE_URL}/v1/auth/verify-email`,
  resendVerification: `${API_BASE_URL}/v1/auth/resend-verification`,

  // Social auth (only the callbacks that have backend routes)
  googleCallback: `${API_BASE_URL}/v1/auth/google/callback`,
  facebookCallback: `${API_BASE_URL}/v1/auth/facebook/callback`,

  // Contacts
  contacts: `${API_BASE_URL}/v1/contacts`,
  contactFromMeeting: (meetingId: string) =>
    `${API_BASE_URL}/v1/contacts/from-meeting/${meetingId}`,

  // Geocoding (server-side proxy; client falls back to Google Maps directly)
  geocoding: `${API_BASE_URL}/v1/geocoding`,
};

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Social auth configurations. The Google client ID is a public identifier.
export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '270814322595-hueraif6brli58po5gishfvcmocv6n04.apps.googleusercontent.com';
export const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';

// Feature flag: Facebook login stays hidden until a configured FB app and
// matching backend creds (FACEBOOK_APP_ID/SECRET) are available. Enable by
// setting NEXT_PUBLIC_FACEBOOK_APP_ID and NEXT_PUBLIC_FACEBOOK_LOGIN_ENABLED=true.
export const FACEBOOK_LOGIN_ENABLED =
  process.env.NEXT_PUBLIC_FACEBOOK_LOGIN_ENABLED === 'true' && Boolean(FACEBOOK_APP_ID);

// Maps API configuration. Geocoding is proxied through the backend
// (POST /v1/geocoding) so no key is required in the browser. This is only a
// fallback for direct Google Maps calls; leave empty unless a referrer-
// restricted public key is explicitly provided.
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
