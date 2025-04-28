'use client';

import { useRouter } from 'next/navigation';
import CreateRequestForm from '@/components/CreateRequestForm';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { API_ENDPOINTS, API_HEADERS } from '@/app/config';

export default function CreatePage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const handleSubmit = async (data: {
    address_a: string;
    location_type: string;
    contact_method: string;
    contact_info: string;
    address_a_lat?: number;
    address_a_lon?: number;
  }) => {
    if (!token) {
      console.error('No token found in auth state');
      throw new Error('Not authenticated');
    }

    console.log('Using token from auth state:', token);

    const headers = {
      ...API_HEADERS,
      'Authorization': `Bearer ${token}`,
    };

    console.log('Request headers:', headers);
    console.log('Request URL:', API_ENDPOINTS.meetingRequests);

    const requestData = {
      address_a: data.address_a,
      location_type: data.location_type,
      user_b_contact_type: data.contact_method.toLowerCase(),
      user_b_contact: data.contact_info,
    };

    // Add coordinates if available
    if (data.address_a_lat !== undefined && data.address_a_lon !== undefined) {
      Object.assign(requestData, {
        address_a_lat: data.address_a_lat,
        address_a_lon: data.address_a_lon
      });
    }

    console.log('Request data:', requestData);

    try {
      const response = await fetch(API_ENDPOINTS.meetingRequests, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
        mode: 'cors',
        credentials: 'same-origin',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = {
            message: responseText ||
              (response.status === 500 ?
                'Server error. This might be due to missing required fields or incorrect data format.' :
                'Failed to create meeting request')
          };
        }
        console.error('Request failed:', error);
        throw new Error(error.message || error.error || 'Failed to create meeting request');
      }

      const result = JSON.parse(responseText);
      console.log('Request succeeded:', result);
      router.push(`/waiting/${result.request_id}`);
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <CreateRequestForm onSubmit={handleSubmit} />
      </div>
    </ProtectedRoute>
  );
}
