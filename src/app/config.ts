// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// API endpoints
export const API_ENDPOINTS = {
  meetingRequests: `${API_URL}/meeting-requests`,
  meetingRequestStatus: (id: string) => `${API_URL}/meeting-requests/${id}/status`,
  meetingRequestRespond: (id: string) => `${API_URL}/meeting-requests/${id}/respond`,
  meetingRequestResults: (id: string) => `${API_URL}/meeting-requests/${id}/results`,
}; 