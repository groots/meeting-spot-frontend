'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { API_ENDPOINTS } from '@/app/config';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

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
    rating?: number;
    price_level?: number;
    photos?: string[];
  }>;
}

export default function MeetingDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { token } = useAuth();
  const [meetingRequest, setMeetingRequest] = useState<MeetingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;

    const fetchMeetingRequest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.meetingRequests}${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch meeting request: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched meeting request:', data);
        setMeetingRequest(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching meeting request:', err);
        setError('Could not load meeting request details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingRequest();
  }, [id, token]);

  const getStatusBadge = (status: string) => {
    let bgColor = 'bg-gray-500';
    let textColor = 'text-white';
    
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'PENDING_B_ADDRESS':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'PROCESSING':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'COMPLETED':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'DECLINED':
      case 'EXPIRED':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/meetings" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Meetings
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        ) : !meetingRequest ? (
          <div className="bg-yellow-100 p-4 rounded-lg">
            <p className="text-yellow-700">Meeting request not found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Meeting Details</h1>
                {getStatusBadge(meetingRequest.status)}
              </div>
              <p className="text-gray-600">
                Created {formatDistanceToNow(new Date(meetingRequest.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Meeting Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Meeting ID</p>
                    <p className="font-medium">{meetingRequest.request_id || meetingRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Meeting Type</p>
                    <p className="font-medium">{meetingRequest.location_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Participant</p>
                    <p className="font-medium">
                      {meetingRequest.user_b_name || 'Unnamed'} ({meetingRequest.user_b_contact})
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Location Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Your Location</p>
                    <p className="font-medium">{meetingRequest.address_a || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Participant Location</p>
                    <p className="font-medium">{meetingRequest.address_b || 'Not yet provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {meetingRequest.selected_place && (
              <div className="p-6 border-t">
                <h2 className="text-lg font-semibold mb-3">Selected Meeting Place</h2>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg">{meetingRequest.selected_place.name}</h3>
                  <p className="text-gray-700">{meetingRequest.selected_place.address}</p>
                  {meetingRequest.selected_place.google_place_id && (
                    <a 
                      href={`https://www.google.com/maps/place/?q=place_id:${meetingRequest.selected_place.google_place_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-blue-600 hover:text-blue-800"
                    >
                      View on Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}

            {meetingRequest.suggested_places && meetingRequest.suggested_places.length > 0 && !meetingRequest.selected_place && (
              <div className="p-6 border-t">
                <h2 className="text-lg font-semibold mb-3">Suggested Places</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meetingRequest.suggested_places.map((place) => (
                    <div key={place.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <h3 className="font-bold">{place.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{place.address}</p>
                      {place.rating && (
                        <div className="flex items-center mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm font-medium">{place.rating}</span>
                        </div>
                      )}
                      {place.google_place_id && (
                        <a 
                          href={`https://www.google.com/maps/place/?q=place_id:${place.google_place_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 border-t flex justify-end">
              <Link 
                href="/meetings"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Meetings
              </Link>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 