/**
 * API utility functions for handling requests
 */
import { API_HEADERS } from '@/app/config';

// Token expiration handling
let authCallbacks = {
  onTokenExpired: () => {},
  onUnauthorized: () => {},
  getToken: () => null as string | null,
};

/**
 * Initialize the API helpers with auth callbacks
 */
export function initApiHelpers({
  onTokenExpired,
  onUnauthorized,
  getToken,
}: {
  onTokenExpired: () => void;
  onUnauthorized: () => void;
  getToken: () => string | null;
}) {
  authCallbacks = {
    onTokenExpired,
    onUnauthorized,
    getToken,
  };
}

/**
 * Helper function to make authenticated API requests with error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const token = authCallbacks.getToken();
    
    // Set up headers with auth token
    const headers = {
      ...API_HEADERS,
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      
      // Check if this is specifically a token expiration
      if (errorData.code === 'TOKEN_EXPIRED') {
        console.warn('[API] 🔑 Token expired, redirecting to login');
        authCallbacks.onTokenExpired();
        return { data: null, error: 'Your session has expired. Please log in again.', status: 401 };
      } else {
        // Other unauthorized error
        console.warn('[API] 🔒 Unauthorized access');
        authCallbacks.onUnauthorized();
        return { data: null, error: 'You are not authorized to perform this action.', status: 401 };
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        data: null, 
        error: errorData.error || `Request failed with status ${response.status}`, 
        status: response.status 
      };
    }

    // For successful responses
    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (err) {
    console.error('[API] 💥 Request error:', err);
    return { 
      data: null, 
      error: err instanceof Error ? err.message : 'An unexpected error occurred', 
      status: 0 
    };
  }
}

/**
 * Generic GET request with proper error handling
 */
export async function apiGet<T>(url: string, options?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...(options?.headers || {})
      },
      ...options
    });

    // Handle token expiration
    if (response.status === 401) {
      // Remove token from localStorage
      localStorage.removeItem('token');
      return { data: null, error: 'Your session has expired. Please log in again.' };
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return { data: null, error: errorData.message || `Error: ${response.status}` };
    }

    // Handle case where response is ok but empty
    if (response.status === 204) {
      return { data: null, error: null };
    }

    // Parse JSON response
    const responseData = await response.json();
    return { data: responseData as T, error: null };
  } catch (error) {
    console.error('API error:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Generic POST request with proper error handling
 */
export async function apiPost<T>(url: string, body: any, options?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...(options?.headers || {})
      },
      body: JSON.stringify(body),
      ...options
    });

    // Handle token expiration
    if (response.status === 401) {
      // Remove token from localStorage
      localStorage.removeItem('token');
      return { data: null, error: 'Your session has expired. Please log in again.' };
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return { data: null, error: errorData.message || `Error: ${response.status}` };
    }

    // Handle case where response is ok but empty
    if (response.status === 204) {
      return { data: null, error: null };
    }

    // Parse JSON response
    const responseData = await response.json();
    return { data: responseData as T, error: null };
  } catch (error) {
    console.error('API error:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Generic DELETE request with proper error handling
 */
export async function apiDelete(url: string, options?: RequestInit): Promise<{ success: boolean; error: string | null }> {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...(options?.headers || {})
      },
      ...options
    });

    // Handle token expiration
    if (response.status === 401) {
      // Remove token from localStorage
      localStorage.removeItem('token');
      return { success: false, error: 'Your session has expired. Please log in again.' };
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return { success: false, error: errorData.message || `Error: ${response.status}` };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('API error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Make a PUT request to the API
 */
export async function apiPut<T>(url: string, body: any, options: RequestInit = {}): Promise<{ data: T | null; error: string | null; status: number }> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
  });
} 