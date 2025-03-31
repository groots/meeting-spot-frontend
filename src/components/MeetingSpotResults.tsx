import { useEffect, useState } from 'react';

interface MeetingSpot {
  name: string;
  address: string;
  distance: number;
  rating?: number;
  type: string;
  latitude: number;
  longitude: number;
}

interface MeetingSpotResultsProps {
  requestId: string;
}

export default function MeetingSpotResults({ requestId }: MeetingSpotResultsProps) {
  const [spot, setSpot] = useState<MeetingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/v1/requests/${requestId}/results`);
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        const data = await response.json();
        setSpot(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [requestId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600 dark:text-gray-400">No results available yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your Meeting Spot
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {spot.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{spot.address}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-gray-600 dark:text-gray-400 mr-2">Type:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{spot.type}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 dark:text-gray-400 mr-2">Distance:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {spot.distance.toFixed(1)} miles
                </span>
              </div>
              {spot.rating && (
                <div className="flex items-center">
                  <span className="text-gray-600 dark:text-gray-400 mr-2">Rating:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {spot.rating.toFixed(1)}/5
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(spot.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 