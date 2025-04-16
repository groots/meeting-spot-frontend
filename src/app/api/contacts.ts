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
  const response = await fetch(API_ENDPOINTS.contacts, {
    method: 'GET',
    headers: {
      ...API_HEADERS,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 402) {
      throw new Error(error.message || 'This feature requires a premium subscription');
    }
    throw new Error(error.message || 'Failed to fetch contacts');
  }

  return response.json();
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