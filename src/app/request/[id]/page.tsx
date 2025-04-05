'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import RespondToRequestForm from '@/components/RespondToRequestForm';
import RequestStatus from '@/components/RequestStatus';
import MeetingSpotResults from '@/components/MeetingSpotResults';
import { API_ENDPOINTS } from '@/app/config';

export default function RequestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const requestId = params.id as string;
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<string | null>(null);
  const [meetingSpots, setMeetingSpots] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!requestId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(API_ENDPOINTS.meetingRequestStatus(requestId));
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        const data = await response.json();
        console.log('Status response:', data);
        
        setStatus(data.status);
        
        if (data.status === 'completed') {
          setShowResults(true);
          // Fetch results when status is completed
          const resultsResponse = await fetch(API_ENDPOINTS.meetingRequestResults(requestId));
          if (!resultsResponse.ok) {
            throw new Error('Failed to fetch results');
          }
          const resultsData = await resultsResponse.json();
          console.log('Results data:', resultsData);
          setMeetingSpots(resultsData.suggested_options || []);
        }
      } catch (error) {
        console.error('Error fetching status:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [requestId]);

  // Poll for status updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    const pollStatus = async () => {
      if (!requestId) return;
      
      try {
        const response = await fetch(API_ENDPOINTS.meetingRequestStatus(requestId));
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        const data = await response.json();
        console.log('Status response:', data);
        
        setStatus(data.status);
        
        if (data.status === 'completed') {
          setShowResults(true);
          // Fetch results when status is completed
          const resultsResponse = await fetch(API_ENDPOINTS.meetingRequestResults(requestId));
          if (!resultsResponse.ok) {
            throw new Error('Failed to fetch results');
          }
          const resultsData = await resultsResponse.json();
          console.log('Results data:', resultsData);
          setMeetingSpots(resultsData.suggested_options || []);
        }
      } catch (error) {
        console.error('Error polling status:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch status');
      }
    };

    if (requestId && !showResults) {
      pollStatus();
      pollInterval = setInterval(pollStatus, 5000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [requestId, showResults]);

  const handleRespondToRequest = async (data: { address_b: string }) => {
    if (!token || !requestId) {
      setError('Missing token or request ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(API_ENDPOINTS.meetingRequestRespond(requestId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          token: token
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit response');
      }

      const result = await response.json();
      console.log('Response from backend:', result);
      
      // Update status to show calculating
      setStatus('calculating');
    } catch (error) {
      console.error('Error submitting response:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit response');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !status) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Loading Request...
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
            Meeting Request
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            {status === 'completed' 
              ? 'Here are the suggested meeting spots!' 
              : 'Enter your address to find a meeting spot.'}
          </p>
        </div>

        {isLoading && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 rounded-lg">
            Loading...
          </div>
        )}

        {/* Show response form if status is pending_b_address */}
        {status === 'pending_b_address' && token && (
          <RespondToRequestForm
            token={token}
            onSubmit={handleRespondToRequest}
          />
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