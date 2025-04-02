'use client';

import { useState, useEffect } from 'react';
import RespondToRequestForm from '@/components/RespondToRequestForm';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [meetingSpots, setMeetingSpots] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [showSelectedSpot, setShowSelectedSpot] = useState(false);

  // Load request data and token on mount
  useEffect(() => {
    const loadRequestData = async () => {
      try {
        // Get token from URL if present
        const urlToken = searchParams.get('token');
        if (urlToken) {
          setToken(urlToken);
        }

        const response = await fetch(`/api/meeting-requests/${params.id}/status/`);
        const data = await response.json();
        console.log('Loaded request data:', data);
        
        setStatus(data.status);
        
        // If we have results, load them
        if (data.status === 'completed') {
          const resultsResponse = await fetch(`/api/meeting-requests/${params.id}/results/`);
          const resultsData = await resultsResponse.json();
          if (resultsData.results?.meeting_spots) {
            setMeetingSpots(resultsData.results.meeting_spots);
            setShowResults(true);
          }
        }

        // Check if a spot has been selected
        if (data.selected_place_details) {
          setSelectedSpot(data.selected_place_details);
          setShowSelectedSpot(true);
        }

        // Only show response form if we have a token (user B) and status is pending_b_address
        if (urlToken && data.status === 'pending_b_address') {
          setShowResponseForm(true);
        }
      } catch (error) {
        console.error('Error loading request data:', error);
      }
    };

    loadRequestData();
  }, [params.id, searchParams]);

  const handleRespondToRequest = async (data: { address_b: string }) => {
    if (!token) return;

    try {
      console.log('Sending response to backend:', data);
      const response = await fetch(`/api/meeting-requests/${params.id}/respond/`, {
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
      
      setShowResponseForm(false);
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  };

  const handleSelectSpot = async (spot: any) => {
    try {
      const response = await fetch(`/api/meeting-requests/${params.id}/select-spot/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ place_id: spot.place_id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to select spot');
      }

      const result = await response.json();
      setSelectedSpot(result.selected_spot);
      setShowSelectedSpot(true);
    } catch (error) {
      console.error('Error selecting spot:', error);
      throw error;
    }
  };

  const handleOpenInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  // Poll for status updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let currentInterval = 20000; // Start with 20 seconds
    const maxInterval = 120000; // Max 2 minutes
    const backoffFactor = 1.5; // Increase interval by 50% each time
    
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/meeting-requests/${params.id}/status/`);
        const data = await response.json();
        console.log('Status response:', data);
        
        setStatus(data.status);
        
        // If status is calculating, start polling for results
        if (data.status === 'calculating') {
          const resultsResponse = await fetch(`/api/meeting-requests/${params.id}/results/`);
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
          } else {
            // If still calculating, increase the polling interval
            currentInterval = Math.min(currentInterval * backoffFactor, maxInterval);
            if (pollInterval) {
              clearInterval(pollInterval);
            }
            pollInterval = setInterval(pollStatus, currentInterval);
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
        // On error, increase the polling interval
        currentInterval = Math.min(currentInterval * backoffFactor, maxInterval);
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        pollInterval = setInterval(pollStatus, currentInterval);
      }
    };

    // Initial poll
    pollStatus();
    // Set up initial polling interval
    pollInterval = setInterval(pollStatus, currentInterval);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [params.id]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meeting Request
          </h1>
          <p className="text-lg text-gray-600">
            View and respond to your meeting request
          </p>
        </div>

        {status === 'pending_b_address' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {showResponseForm ? 'Enter Your Address' : 'Waiting for Response'}
            </h2>
            {showResponseForm ? (
              <RespondToRequestForm 
                onSubmit={handleRespondToRequest} 
                token={token || ''} 
              />
            ) : (
              <p className="text-lg text-gray-600">
                Waiting for the other person to submit their address...
              </p>
            )}
          </div>
        )}

        {status && status !== 'pending_b_address' && !showResults && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Request Status
            </h2>
            <div className="text-lg text-gray-700">
              {status === 'calculating' && (
                <p>Calculating meeting spots...</p>
              )}
              {status === 'completed' && (
                <p>Meeting spots have been found!</p>
              )}
            </div>
          </div>
        )}

        {showResults && meetingSpots.length > 0 && !showSelectedSpot && (
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
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Distance from you: {spot.distance_a} miles</span>
                    <span>Distance from them: {spot.distance_b} miles</span>
                    <span>Rating: {spot.rating} ({spot.total_ratings} reviews)</span>
                  </div>
                  <button
                    onClick={() => {
                      console.log('Spot object:', spot);
                      handleSelectSpot(spot);
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Select This Spot
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSpot && showSelectedSpot && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Selected Meeting Spot
              </h2>
              <button
                onClick={() => setShowSelectedSpot(false)}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Change Meeting Spot
              </button>
            </div>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedSpot.name}
                </h3>
                <p className="text-gray-600 mb-2">{selectedSpot.address}</p>
                {selectedSpot.phone && (
                  <p className="text-gray-600 mb-2">Phone: {selectedSpot.phone}</p>
                )}
                {selectedSpot.website && (
                  <p className="text-gray-600 mb-2">
                    <a href={selectedSpot.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  </p>
                )}
                {selectedSpot.opening_hours && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Opening Hours:</h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {selectedSpot.opening_hours.map((hour: string, index: number) => (
                        <li key={index}>{hour}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Rating: {selectedSpot.rating} ({selectedSpot.total_ratings} reviews)</span>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleOpenInMaps(selectedSpot.address)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Open in Maps
                  </button>
                  <button
                    onClick={() => handleOpenInMaps(selectedSpot.address)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 