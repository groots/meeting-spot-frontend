'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS, API_HEADERS } from '../../config';

interface MeetingSpot {
  name: string;
  address: string;
  distance: number;
  rating?: number;
  photos?: string[];
}

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function ResultsPage({ params }: Props) {
  const [meetingSpots, setMeetingSpots] = useState<MeetingSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.meetingRequestResults(params.id), {
          headers: API_HEADERS,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        console.log('Results data:', data);
        setMeetingSpots(data.suggested_options || []);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [params.id]);

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

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Meeting Spot Suggestions
          </h1>
          <p className="text-xl text-secondary mb-12">
            Here are some great places to meet
          </p>
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
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {spot.name}
                </h3>
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