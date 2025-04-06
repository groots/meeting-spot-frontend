// API configuration
// Use environment variables for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const API_ENDPOINTS = {
  meetingRequests: `${API_BASE_URL}/v1/meeting-requests/`,
  meetingRequestStatus: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/status/`,
  meetingRequestRespond: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/respond/`,
  meetingRequestResults: (id: string) => `${API_BASE_URL}/v1/meeting-requests/${id}/results/`,
};

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}; 