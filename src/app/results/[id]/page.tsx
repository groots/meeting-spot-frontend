'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS, API_HEADERS } from '../../config';

interface MeetingSpot {
  name: string;
  address: string;
  distance: number;
  rating?: number;
  photos?: string[];
  price_level?: number;
  category?: string;
  subcategory?: string;
  place_id?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface ResultsData {
  suggested_options: MeetingSpot[];
  status: string;
  midpoint?: {
    lat: number;
    lng: number;
  };
  locations?: {
    a: {
      lat: number;
      lng: number;
    };
    b: {
      lat: number;
      lng: number;
    };
  };
}

// Helper function to display price level
const getPriceLevel = (level?: number) => {
  if (level === undefined) return 'Price not available';
  
  const symbols = ['$', '$$', '$$$', '$$$$'];
  return level >= 0 && level < symbols.length ? symbols[level] : 'Price not available';
};

export default function ResultsPage() {
  const params = useParams();
  const requestId = params?.id as string;
  const [meetingSpots, setMeetingSpots] = useState<MeetingSpot[]>([]);
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.meetingRequestResults(requestId), {
          headers: API_HEADERS,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        console.log('Results data:', data);
        setResultsData(data);
        setMeetingSpots(data.suggested_options || []);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch results');
      } finally {
        setIsLoading(false);
      }
    };

    if (requestId) {
      fetchResults();
    }
  }, [requestId]);

  const openInMaps = (spot: MeetingSpot) => {
    if (spot.location) {
      const { lat, lng } = spot.location;
      const query = encodeURIComponent(`${spot.name}, ${spot.address}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${spot.place_id}`, '_blank');
    } else if (spot.address) {
      const encodedAddress = encodeURIComponent(spot.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const openMidpointMap = () => {
    if (resultsData?.midpoint) {
      const { lat, lng } = resultsData.midpoint;
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Loading Results...
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

  // Get category and subcategory info
  const categoryInfo = meetingSpots.length > 0 ? 
    (meetingSpots[0].subcategory ? 
      `${meetingSpots[0].category}: ${meetingSpots[0].subcategory}` : 
      meetingSpots[0].category) : 
    null;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Meeting Spot Suggestions
          </h1>
          {categoryInfo && (
            <p className="text-lg text-muted-foreground mb-4">
              Category: {categoryInfo}
            </p>
          )}
          {resultsData?.midpoint && (
            <button 
              onClick={openMidpointMap}
              className="inline-flex items-center justify-center px-4 py-2 mb-8 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View Midpoint on Map
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetingSpots.map((spot, index) => (
            <div
              key={index}
              className="bg-card rounded-lg shadow-lg overflow-hidden"
            >
              {spot.photos && spot.photos[0] && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={spot.photos[0]}
                    alt={spot.name}
                    className="object-cover w-full h-48"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {spot.name}
                  </h3>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-sm font-semibold rounded dark:bg-gray-700">
                    {getPriceLevel(spot.price_level)}
                  </span>
                </div>
                <p className="text-secondary mb-4">{spot.address}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {spot.distance.toFixed(1)} km away
                  </span>
                  {spot.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-sm text-muted-foreground">
                        {spot.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openInMaps(spot)}
                  className="mt-4 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Open in Maps
                </button>
              </div>
            </div>
          ))}
        </div>

        {meetingSpots.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-lg text-secondary">
              No meeting spots found. Please try again with different criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 