// API configuration
// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Hard-code the production API URL for deployed environments
// Use environment variables or localhost for development/testing
const API_BASE_URL = isProduction 
  ? 'https://meeting-spot-backend-zylogyedtq-ue.a.run.app/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api');

export const API_ENDPOINTS = {
  meetingRequests: `${API_BASE_URL}/v1/meeting-requests/`,
  meetingRequestStatus: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/status/`,
  meetingRequestRespond: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/respond/`,
  meetingRequestResults: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/results/`,
  dbCheck: `${API_BASE_URL.replace('/api', '')}/debug/db-check`,
};

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}; 