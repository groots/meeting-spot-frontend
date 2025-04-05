// API configuration
// Use a different approach to access environment variables to avoid linter errors
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  meetingRequests: `${API_BASE_URL}/api/meeting-requests/`,
  meetingRequestStatus: (id: string) => `${API_BASE_URL}/api/meeting-requests/${id}/status/`,
  meetingRequestRespond: (id: string) => `${API_BASE_URL}/api/meeting-requests/${id}/respond/`,
  meetingRequestResults: (id: string) => `${API_BASE_URL}/api/meeting-requests/${id}/results/`,
}; 