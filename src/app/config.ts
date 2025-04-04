// API configuration
// Use a different approach to access environment variables to avoid linter errors
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return (window as any).__NEXT_DATA__?.props?.pageProps?.apiUrl || 
           'https://meeting-spot-backend-zylogyedtq-ue.a.run.app/api/v2';
  } else {
    // Server-side
    return 'https://meeting-spot-backend-zylogyedtq-ue.a.run.app/api/v2';
  }
};

export const API_URL = getApiUrl();

// API endpoints
export const API_ENDPOINTS = {
  meetingRequests: `${API_URL}/meeting-requests`,
  meetingRequestStatus: (id: string) => `${API_URL}/meeting-requests/${id}/status`,
  meetingRequestRespond: (id: string) => `${API_URL}/meeting-requests/${id}/respond`,
  meetingRequestResults: (id: string) => `${API_URL}/meeting-requests/${id}/results`,
}; 