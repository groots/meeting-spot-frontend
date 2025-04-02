'use client';

import { useState, useEffect } from 'react';
import CreateRequestForm from '@/components/CreateRequestForm';
import RespondToRequestForm from '@/components/RespondToRequestForm';
import RequestStatus from '@/components/RequestStatus';
import MeetingSpotResults from '@/components/MeetingSpotResults';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [requestId, setRequestId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [meetingSpots, setMeetingSpots] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleCreateRequest = async (data: {
    address_a: string;
    location_type: string;
    user_b_contact_type: string;
    user_b_contact: string;
  }) => {
    try {
      const response = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      const result = await response.json();
      console.log('Create request response:', result);
      
      if (!result.user_b_token) {
        throw new Error('No token received from server');
      }

      // Redirect to the request page
      router.push(`/request/${result.request_id}`);
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  };

  const handleRespondToRequest = async (data: { address_b: string }) => {
    if (!token) return;

    try {
      console.log('Sending response to backend:', data);
      const response = await fetch(`/api/v1/respond/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit response');
      }

      const result = await response.json();
      console.log('Response from backend:', result);
      
      // Update the UI state
      setShowResponseForm(false);
      // Force a refresh of the status and results
      if (requestId) {
        // Trigger a re-render of the status and results components
        setRequestId(requestId);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  };

  // Poll for status updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    const pollStatus = async () => {
      if (!requestId) return;
      
      try {
        const response = await fetch(`/api/v1/requests/${requestId}/status`);
        const data = await response.json();
        console.log('Status response:', data);
        
        setStatus(data.status);
        
        // If status is calculating, start polling for results
        if (data.status === 'calculating') {
          const resultsResponse = await fetch(`/api/v1/requests/${requestId}/results`);
          const resultsData = await resultsResponse.json();
          console.log('Results response:', resultsData);
          
          if (resultsData.status === 'completed' && resultsData.results?.meeting_spots) {
            setMeetingSpots(resultsData.results.meeting_spots);
            setShowResponseForm(false);
            setShowResults(true);
            // Stop polling once we have results
            if (pollInterval) {
              clearInterval(pollInterval);
            }
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    if (requestId) {
      // Initial poll
      pollStatus();
      // Set up polling interval
      pollInterval = setInterval(pollStatus, 5000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [requestId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find a Meeting Spot
          </h1>
          <p className="text-lg text-gray-600">
            Easily find the perfect meeting location between two addresses
          </p>
        </div>

        <CreateRequestForm onSubmit={handleCreateRequest} />

        {requestId && showResponseForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Enter Your Address
            </h2>
            <RespondToRequestForm 
              onSubmit={handleRespondToRequest} 
              token={token || ''} 
            />
          </div>
        )}

        {requestId && status && !showResults && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Request Status
            </h2>
            <div className="text-lg text-gray-700">
              {status === 'pending_b_address' && (
                <p>Waiting for the other person to submit their address...</p>
              )}
              {status === 'calculating' && (
                <p>Calculating meeting spots...</p>
              )}
              {status === 'completed' && (
                <p>Meeting spots have been found!</p>
              )}
            </div>
          </div>
        )}

        {showResults && meetingSpots.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Suggested Meeting Spots
            </h2>
            <div className="space-y-4">
              {meetingSpots.map((spot, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {spot.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{spot.address}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Distance from you: {spot.distance_a} miles</span>
                    <span>Distance from them: {spot.distance_b} miles</span>
                    <span>Rating: {spot.rating} ({spot.total_ratings} reviews)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </main>
  );
}
