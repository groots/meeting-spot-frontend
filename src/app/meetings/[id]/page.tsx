'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { API_ENDPOINTS } from '@/app/config';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { apiGet } from '@/app/utils/api';

interface MeetingRequest {
  id: string;
  request_id?: string;
  status: string;
  user_b_contact: string;
  user_b_name?: string;
  location_type: string;
  created_at: string;
  address_a?: string;
  address_b?: string;
  address_a_lat?: number;
  address_a_lon?: number;
  address_b_lat?: number;
  address_b_lon?: number;
  selected_place?: {
    id: string;
    name: string;
    address: string;
    google_place_id?: string;
  };
  suggested_places?: Array<{
    id: string;
    name: string;
    address: string;
    google_place_id?: string;
    distance_a: number;
    distance_b: number;
    rating?: number;
  }>;
}

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [meetingRequest, setMeetingRequest] = useState<MeetingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !params?.id) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchMeetingRequest = async () => {
      try {
        const { data, error: apiError } = await apiGet<MeetingRequest>(`${API_ENDPOINTS.meetingRequests}/${params.id}`);
        
        if (!isMounted) return;
        
        if (apiError) {
          console.error('Error fetching meeting request:', apiError);
          setError(apiError);
        } else if (data) {
          setMeetingRequest(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMeetingRequest();

    return () => {
      isMounted = false;
    };
  }, [token, params?.id]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING_B_ADDRESS':
        return { text: 'Waiting for other party', color: 'bg-yellow-100 text-yellow-800' };
      case 'PROCESSING':
        return { text: 'Finding meeting spots', color: 'bg-blue-100 text-blue-800' };
      case 'COMPLETED':
        return { text: 'Complete', color: 'bg-green-100 text-green-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <Link href="/meetings" className="inline-flex items-center text-blue-600 hover:underline mb-6">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to all meetings
        </Link>
        
        {loading ? (
          <div className="flex justify-center">
            <div data-testid="loading-spinner" className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : meetingRequest ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold">Meeting Details</h1>
                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusDisplay(meetingRequest.status).color}`}>
                  {getStatusDisplay(meetingRequest.status).text}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Meeting Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Type:</span>
                      <p className="text-gray-900">{meetingRequest.location_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">With:</span>
                      <p className="text-gray-900">{meetingRequest.user_b_contact}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Created:</span>
                      <p className="text-gray-900">{formatDistanceToNow(new Date(meetingRequest.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">Location Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Your Address:</span>
                      <p className="text-gray-900">{meetingRequest.address_a || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Other Party's Address:</span>
                      <p className="text-gray-900">{meetingRequest.address_b || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {meetingRequest.selected_place && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Selected Meeting Location</h2>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-1">{meetingRequest.selected_place.name}</h3>
                    <p className="text-gray-700 mb-2">{meetingRequest.selected_place.address}</p>
                    {meetingRequest.selected_place.google_place_id && (
                      <a 
                        href={`https://maps.google.com/?q=${meetingRequest.selected_place.name}&cid=${meetingRequest.selected_place.google_place_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm inline-flex items-center"
                      >
                        View on Google Maps
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {meetingRequest.suggested_places && meetingRequest.suggested_places.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Suggested Meeting Locations</h2>
                  <div className="space-y-4">
                    {meetingRequest.suggested_places.map((place) => (
                      <div key={place.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                        <p className="text-gray-700 mb-2">{place.address}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-gray-600">
                            Your distance: {formatDistance(place.distance_a)}
                          </span>
                          <span className="text-gray-600">
                            Other party's distance: {formatDistance(place.distance_b)}
                          </span>
                          {place.rating && (
                            <span className="text-gray-600 flex items-center">
                              Rating: {place.rating}
                              <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            </span>
                          )}
                        </div>
                        {place.google_place_id && (
                          <a 
                            href={`https://maps.google.com/?q=${place.name}&cid=${place.google_place_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm inline-flex items-center mt-2"
                          >
                            View on Google Maps
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
} 