import { API_ENDPOINTS, API_HEADERS } from '@/app/config';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactWithMeetings extends Contact {
  meetings?: Array<{
    id: string;
    status: string;
    created_at: string;
    updated_at: string;
    selected_place?: {
      name: string;
      address: string;
      google_place_id: string;
    };
  }>;
  meeting_count?: number;
  premium_required?: boolean;
}

export interface CreateContactParams {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

/**
 * Get all contacts for the current user
 */
export const getContacts = async (token: string): Promise<Contact[]> => {
  // Try with direct URL without trailing slash first
  const url = API_ENDPOINTS.contacts.endsWith('/')
    ? API_ENDPOINTS.contacts.slice(0, -1)
    : API_ENDPOINTS.contacts;

  try {
    console.log(`Trying to fetch contacts from: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...API_HEADERS,
        'Authorization': `Bearer ${token}`,
      },
      // Disable redirect following to prevent CORS issues with 308 redirects
      redirect: 'manual',
    });

    // If we got a redirect, try the URL with a trailing slash explicitly
    if (response.status === 308 || response.type === 'opaqueredirect') {
      console.log('Got redirect, trying with trailing slash');
      const urlWithSlash = url.endsWith('/') ? url : `${url}/`;
      const redirectResponse = await fetch(urlWithSlash, {
        method: 'GET',
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!redirectResponse.ok) {
        const error = await redirectResponse.json().catch(() => ({}));
        if (redirectResponse.status === 402) {
          throw new Error(error.message || 'This feature requires a premium subscription');
        }
        throw new Error(error.message || `Failed to fetch contacts (${redirectResponse.status})`);
      }

      // Check if premium required from headers
      const isPremiumRequired = redirectResponse.headers.get('X-Premium-Required') === 'true';
      if (isPremiumRequired) {
        console.log('Premium subscription required for contacts');
        // Return empty array but set a custom property to indicate premium required
        const result: Contact[] = [];
        Object.defineProperty(result, 'premiumRequired', { value: true });
        return result;
      }

      const responseData = await redirectResponse.json();
      // Ensure we always return an array - handle different response types
      if (Array.isArray(responseData)) {
        return responseData;
      } else if (responseData && typeof responseData === 'object') {
        // If it's a single contact object with actual data
        if (responseData.id) {
          return [responseData];
        }
        // If it's a placeholder object or empty response
        console.error("API returned non-array data:", responseData);
        return [];
      } else {
        console.error("API returned unexpected data format:", responseData);
        return [];
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 402) {
        throw new Error(error.message || 'This feature requires a premium subscription');
      }
      throw new Error(error.message || `Failed to fetch contacts (${response.status})`);
    }

    // Check if premium required from headers
    const isPremiumRequired = response.headers.get('X-Premium-Required') === 'true';
    if (isPremiumRequired) {
      console.log('Premium subscription required for contacts');
      // Return empty array but set a custom property to indicate premium required
      const result: Contact[] = [];
      Object.defineProperty(result, 'premiumRequired', { value: true });
      return result;
    }

    const responseData = await response.json();
    // Ensure we always return an array - handle different response types
    if (Array.isArray(responseData)) {
      return responseData;
    } else if (responseData && typeof responseData === 'object') {
      // If it's a single contact object with actual data
      if (responseData.id) {
        return [responseData];
      }
      // If it's a placeholder object or empty response
      console.error("API returned non-array data:", responseData);
      return [];
    } else {
      console.error("API returned unexpected data format:", responseData);
      return [];
    }
  } catch (error) {
    console.error('Error fetching contacts:', error);

    // If the first attempt failed with redirect handling, try the standard way as fallback
    if ((error as Error).message.includes('redirect') || (error as Error).message.includes('manual')) {
      console.log('Trying standard fetch as fallback');
      const fallbackResponse = await fetch(API_ENDPOINTS.contacts, {
        method: 'GET',
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!fallbackResponse.ok) {
        const errorData = await fallbackResponse.json().catch(() => ({}));
        if (fallbackResponse.status === 402) {
          throw new Error(errorData.message || 'This feature requires a premium subscription');
        }
        throw new Error(errorData.message || 'Failed to fetch contacts');
      }

      // Check if premium required from headers
      const isPremiumRequired = fallbackResponse.headers.get('X-Premium-Required') === 'true';
      if (isPremiumRequired) {
        console.log('Premium subscription required for contacts');
        // Return empty array but set a custom property to indicate premium required
        const result: Contact[] = [];
        Object.defineProperty(result, 'premiumRequired', { value: true });
        return result;
      }

      const responseData = await fallbackResponse.json();
      // Ensure we always return an array - handle different response types
      if (Array.isArray(responseData)) {
        return responseData;
      } else if (responseData && typeof responseData === 'object') {
        // If it's a single contact object with actual data
        if (responseData.id) {
          return [responseData];
        }
        // If it's a placeholder object or empty response
        console.error("API returned non-array data:", responseData);
        return [];
      } else {
        console.error("API returned unexpected data format:", responseData);
        return [];
      }
    }

    // Return empty array on error to prevent UI breaking
    return [];
  }
};

/**
 * Get a specific contact by ID with meeting history
 */
export const getContact = async (id: string, token: string): Promise<ContactWithMeetings> => {
  const response = await fetch(`${API_ENDPOINTS.contacts}/${id}`, {
    method: 'GET',
    headers: {
      ...API_HEADERS,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to fetch contact with ID ${id}`);
  }

  return response.json();
};

/**
 * Create a new contact
 */
export const createContact = async (data: CreateContactParams, token: string): Promise<Contact> => {
  const response = await fetch(API_ENDPOINTS.contacts, {
    method: 'POST',
    headers: {
      ...API_HEADERS,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create contact');
  }

  return response.json();
};

/**
 * Update an existing contact
 */
export const updateContact = async (id: string, data: Partial<CreateContactParams>, token: string): Promise<Contact> => {
  const response = await fetch(`${API_ENDPOINTS.contacts}/${id}`, {
    method: 'PUT',
    headers: {
      ...API_HEADERS,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to update contact with ID ${id}`);
  }

  return response.json();
};

/**
 * Delete a contact
 */
export const deleteContact = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_ENDPOINTS.contacts}/${id}`, {
    method: 'DELETE',
    headers: {
      ...API_HEADERS,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to delete contact with ID ${id}`);
  }
};

/**
 * Create a contact from a meeting participant
 */
export const createContactFromMeeting = async (
  meetingId: string,
  data: CreateContactParams,
  token: string
): Promise<Contact> => {
  const response = await fetch(`${API_ENDPOINTS.contacts}/from-meeting/${meetingId}`, {
    method: 'POST',
    headers: {
      ...API_HEADERS,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create contact from meeting');
  }

  return response.json();
};
