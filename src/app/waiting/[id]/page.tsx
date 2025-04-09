'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_ENDPOINTS, API_HEADERS } from '../../config';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

const MAX_POLLS = 20; // Limit automatic polling (e.g., 20 * 5s = ~1.7 mins)
const INITIAL_POLL_INTERVAL_MS = 5000; // 5 seconds
const LONGER_POLL_INTERVAL_MS = 10000; // 10 seconds for retries

export default function WaitingPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const requestId = params?.id as string;
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial load and manual checks
  const [isPolling, setIsPolling] = useState(false); // Visual indicator for active polling
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number>(60);
  const pollTimeoutRef = useRef<NodeJS.Timeout>();
  const pollCountRef = useRef(0); // Track number of polls
  const [pollingStopped, setPollingStopped] = useState(false); // State for manual refresh trigger

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.meetingRequestStatus(requestId), {
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 429) {
        // Rate limited
        setRateLimited(true);
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        setRetryAfter(retryAfter);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }

      const data = await response.json();
      setStatus(data.status);

      if (data.status === 'completed') {
        // Fetch results
        const resultsResponse = await fetch(API_ENDPOINTS.meetingRequestResults(requestId), {
          headers: {
            ...API_HEADERS,
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!resultsResponse.ok) {
          throw new Error('Failed to fetch results');
        }

        const resultsData = await resultsResponse.json();
        router.push(`/results/${requestId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPollingStopped(true);
    } finally {
      setIsLoading(false);
    }
  }, [requestId, router, token]);

  // Effect for initial fetch
  useEffect(() => {
    if (requestId) {
      checkStatus(); // Initial fetch which will schedule subsequent polls
    }

    // Cleanup function to clear timeout on unmount or dependency change
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
    // Rerun if requestId changes
  }, [requestId, checkStatus]); 

  // --- UI Rendering --- 
  if (isLoading && status === null) { // Show initial loading state only
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Loading Request Status...
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
              Error Checking Status
            </h1>
            <div className="max-w-md mx-auto p-6 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
            <Button
              onClick={checkStatus} // Manual trigger
              className="mt-4"
              disabled={isLoading} // Disable button while loading manual check
            >
              {isLoading ? 'Checking...' : 'Try Checking Status Again'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Waiting UI
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Waiting for Response
            </h1>
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-card rounded-lg shadow-lg">
                <div className="flex flex-col items-center space-y-4">
                  {/* Spinner only if actively polling */} 
                  {isPolling && (
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  )}
                   {/* Paused icon if polling stopped (and not loading a manual check) */} 
                   {pollingStopped && !isLoading && !error && (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                   )}
                   {/* Loading indicator specifically for manual check */} 
                   {isLoading && pollingStopped && (
                       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                   )}
                  <p className="text-lg text-secondary">
                    {status === 'pending_b_address' && 'Waiting for the other person to submit their address...'}
                    {status === 'calculating' && 'Finding the best meeting spots...'}
                    {status === 'error' && 'An error occurred processing the request.'}
                    {pollingStopped && status !== 'completed' && status !== 'error' && `Current Status: ${status || 'Unknown'}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Request ID: {requestId}
                  </p>
                  {/* Rate Limit Message */} 
                  {rateLimited && (
                    <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md w-full">
                      <p className="text-sm text-center">
                        Checking too frequently. Waiting {retryAfter} seconds before the next automatic check...
                      </p>
                    </div>
                  )}
                  {/* Manual Refresh Section */} 
                   {pollingStopped && !error && (
                     <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-md w-full">
                       <p className="text-sm text-center">
                         Automatic status checks have stopped. You can check manually.
                       </p>
                       <Button 
                         onClick={checkStatus} // Manual trigger
                         className="mt-2 w-full"
                         variant="outline"
                         disabled={isLoading} // Disable while manual check is loading
                       >
                         {isLoading ? 'Checking...' : 'Check Status Now'}
                       </Button>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 