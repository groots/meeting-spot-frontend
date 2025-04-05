'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateRequestForm from '@/components/CreateRequestForm';
import RequestStatus from '@/components/RequestStatus';
import MeetingSpotResults from '@/components/MeetingSpotResults';
import { API_ENDPOINTS } from './config';

export default function Home() {
  const router = useRouter();
  const [requestId, setRequestId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [meetingSpots, setMeetingSpots] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRequest = async (data: { address_a: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(API_ENDPOINTS.meetingRequests, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create request');
      }

      const result = await response.json();
      console.log('Response from backend:', result);
      
      setRequestId(result.id);
      setToken(result.token_b);
      setStatus('pending_b_address');
      
      // Start polling for status updates
      pollStatus(result.id);
    } catch (error) {
      console.error('Error creating request:', error);
      setError(error instanceof Error ? error.message : 'Failed to create request');
    } finally {
      setIsLoading(false);
    }
  };

  const pollStatus = async (id: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.meetingRequestStatus(id));
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      const data = await response.json();
      console.log('Status response:', data);
      
      setStatus(data.status);
      
      if (data.status === 'completed') {
        setShowResults(true);
        // Fetch results when status is completed
        const resultsResponse = await fetch(API_ENDPOINTS.meetingRequestResults(id));
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Error
            </h1>
            <div className="max-w-md mx-auto p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
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
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Find a Meeting Spot
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            {status === 'completed' 
              ? 'Here are the suggested meeting spots!' 
              : status === 'pending_b_address'
              ? 'Waiting for the other person to submit their address...'
              : 'Enter your address to find a meeting spot.'}
          </p>
        </div>

        {isLoading && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 rounded-lg">
            Loading...
          </div>
        )}

        {/* Show create form if no request yet */}
        {!requestId && (
          <CreateRequestForm onSubmit={handleCreateRequest} />
        )}

        {/* Show waiting screen if waiting for user B */}
        {status === 'pending_b_address' && (
          <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Waiting for Response
            </h2>
            <div className="text-lg text-gray-700 dark:text-gray-300">
              <p>Share this link with the other person:</p>
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg break-all">
                {`${window.location.origin}/request/${requestId}?token=${token}`}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/request/${requestId}?token=${token}`);
                }}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Show status if calculating */}
        {status === 'calculating' && (
          <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Calculating Meeting Spots
            </h2>
            <div className="text-lg text-gray-700 dark:text-gray-300">
              <p>We're finding the perfect meeting location for you. This may take a moment...</p>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}

        {/* Show results if completed */}
        {showResults && meetingSpots.length > 0 && (
          <MeetingSpotResults spots={meetingSpots} />
        )}
      </div>
    </main>
  );
}
