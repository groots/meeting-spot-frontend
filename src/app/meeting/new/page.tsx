'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { API_ENDPOINTS } from '@/app/config';
import CreateRequestForm from '@/components/CreateRequestForm';

export default function CreateMeetingPage() {
  const router = useRouter();
  const { token } = useAuth();

  const handleSubmit = async (data: {
    address_a: string;
    location_type: string;
    contact_method: string;
    contact_info: string;
    address_a_lat?: number;
    address_a_lon?: number;
  }) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Prepare the request data in the format expected by the API
    const requestData = {
      address_a: data.address_a,
      address_a_lat: data.address_a_lat,
      address_a_lon: data.address_a_lon,
      location_type: data.location_type,
      user_b_contact_type: data.contact_method,
      user_b_contact: data.contact_info
    };

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
        <h1 className="text-3xl font-bold mb-6">Create New Meeting</h1>
        <CreateRequestForm onSubmit={handleSubmit} />
      </div>
    </ProtectedRoute>
  );
} 