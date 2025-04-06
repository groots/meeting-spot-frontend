'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateRequestForm from '@/components/CreateRequestForm';
import RequestStatus from '@/components/RequestStatus';
import MeetingSpotResults from '@/components/MeetingSpotResults';
import { API_ENDPOINTS, API_HEADERS } from './config';

interface CreateRequestData {
  address_a: string;
  location_type: string;
  user_b_contact_type: string;
  user_b_contact: string;
}

export default function Home() {
  const router = useRouter();
  const [requestId, setRequestId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [meetingSpots, setMeetingSpots] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRequest = async (data: CreateRequestData) => {
    if (isLoading) return; // Prevent duplicate submissions
    
    try {
      setIsLoading(true);
      setError('');
      console.log('Making request to:', API_ENDPOINTS.meetingRequests);
      console.log('Request data:', {
        address_a: data.address_a,
        location_type: data.location_type,
        user_b_contact_type: data.user_b_contact_type,
        user_b_contact: data.user_b_contact,
      });
      const response = await fetch(API_ENDPOINTS.meetingRequests, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
          address_a: data.address_a,
          location_type: data.location_type,
          user_b_contact_type: data.user_b_contact_type,
          user_b_contact: data.user_b_contact,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to create request');
      }

      const result = await response.json();
      console.log('Response from backend:', result);
      
      router.push(`/waiting/${result.request_id}`);
    } catch (error) {
      console.error('Error creating request:', error);
      setError(error instanceof Error ? error.message : 'Failed to create request');
    } finally {
      setIsLoading(false);
    }
  };

  const pollStatus = async (id: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.meetingRequestStatus(id), {
        headers: API_HEADERS,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      const data = await response.json();
      console.log('Status response:', data);
      
      setStatus(data.status);
      
      if (data.status === 'completed') {
        setShowResults(true);
        // Fetch results when status is completed
        const resultsResponse = await fetch(API_ENDPOINTS.meetingRequestResults(id), {
          headers: API_HEADERS,
        });
        if (!resultsResponse.ok) {
          throw new Error('Failed to fetch results');
        }
        const resultsData = await resultsResponse.json();
        console.log('Results data:', resultsData);
        setMeetingSpots(resultsData.suggested_options || []);
      } else if (data.status !== 'completed') {
        // Continue polling if not completed
        setTimeout(() => pollStatus(id), 5000);
      }
    } catch (error) {
      console.error('Error polling status:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch status');
    }
  };

  if (isLoading && !requestId) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Creating Request...
            </h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Error
            </h1>
            <div className="max-w-md mx-auto p-6 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Find a Meeting Spot
          </h1>
          <p className="text-xl text-secondary mb-12">
            Enter your details to find a convenient meeting location
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <CreateRequestForm onSubmit={async (data) => {
            await handleCreateRequest({
              address_a: data.address_a,
              location_type: data.location_type,
              user_b_contact_type: data.contact_method,
              user_b_contact: data.contact_info,
            });
          }} />
        </div>
      </div>
    </main>
  );
}
