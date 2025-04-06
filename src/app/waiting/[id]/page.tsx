'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, API_HEADERS } from '../../config';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function WaitingPage({ params }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number>(60);
  const pollTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.meetingRequestStatus(params.id), {
          headers: API_HEADERS,
        });

        if (response.status === 429) { // Rate limit exceeded
          const retryAfterHeader = response.headers.get('Retry-After');
          const retrySeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
          console.log(`Rate limit exceeded. Retrying after ${retrySeconds} seconds`);
          
          setRateLimited(true);
          setRetryAfter(retrySeconds);
          
          // Schedule next poll after the retry period
          pollTimeoutRef.current = setTimeout(() => {
            setRateLimited(false);
            pollStatus();
          }, retrySeconds * 1000);
          
          return;
        }

        if (!response.ok) {
          retryCountRef.current += 1;
          if (retryCountRef.current >= MAX_RETRIES) {
            throw new Error('Failed to fetch status after multiple retries');
          }
          // Exponential backoff for retries
          const backoffTime = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
          pollTimeoutRef.current = setTimeout(() => pollStatus(), backoffTime);
          return;
        }

        // Reset retry count on successful request
        retryCountRef.current = 0;
        setRateLimited(false);

        const data = await response.json();
        console.log('Status response:', data);
        
        setStatus(data.status);
        
        if (data.status === 'completed') {
          router.push(`/results/${params.id}`);
        } else if (data.status !== 'error') {
          // Continue polling if not completed or error, with a longer interval
          pollTimeoutRef.current = setTimeout(() => pollStatus(), 10000); // Poll every 10 seconds
        }
      } catch (error) {
        console.error('Error polling status:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch status');
      } finally {
        setIsLoading(false);
      }
    };

    pollStatus();

    // Cleanup function to clear any pending timeouts
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Loading...
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
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Waiting for Response
          </h1>
          <div className="max-w-md mx-auto">
            <div className="p-6 bg-card rounded-lg shadow-lg">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-lg text-secondary">
                  {status === 'pending_b_address' && 'Waiting for User B to respond...'}
                  {status === 'calculating' && 'Processing your request...'}
                  {status === 'error' && 'An error occurred. Please try again.'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Request ID: {params.id}
                </p>
                {rateLimited && (
                  <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                    <p className="text-sm">
                      We're checking a bit too frequently. Waiting {retryAfter} seconds before trying again...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 