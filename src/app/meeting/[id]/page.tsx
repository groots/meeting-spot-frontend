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
  location_type: string;
  created_at: string;
  address_a?: string;
  address_b?: string;
  selected_place?: {
    id: string;
    name: string;
    address: string;
  };
  suggested_places?: Array<{
    id: string;
    name: string;
    address: string;
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
        const response = await fetch(`${API_ENDPOINTS.meetingRequests}/${id}`, {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-warning/15 text-warning';
      case 'ACCEPTED': return 'bg-info/15 text-info';
      case 'DECLINED': return 'bg-error/15 text-error';
      case 'COMPLETED': return 'bg-success/15 text-success';
      default: return 'bg-surface-muted text-muted-foreground';
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-error/10 p-4 rounded-lg">
            <p className="text-error">{error}</p>
          </div>
        ) : !meetingRequest ? (
          <div className="bg-warning/10 p-4 rounded-lg">
            <p className="text-warning">Meeting request not found.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-foreground">Meeting Request Details</h1>
                <span
                  className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(meetingRequest.status)}`}
                >
                  {meetingRequest.status}
                </span>
              </div>
              <p className="text-muted-foreground">
                Created {formatDistanceToNow(new Date(meetingRequest.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-3 text-foreground">Basic Information</h2>
                <ul className="space-y-3">
                  <li className="flex">
                    <span className="font-medium w-32 text-foreground">Meeting ID:</span>
                    <span className="text-muted-foreground">{meetingRequest.request_id || meetingRequest.id}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-32 text-foreground">Contact:</span>
                    <span className="text-muted-foreground">{meetingRequest.user_b_contact}</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-32 text-foreground">Location Type:</span>
                    <span className="text-muted-foreground">{meetingRequest.location_type}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3 text-foreground">Locations</h2>
                <ul className="space-y-3">
                  {meetingRequest.address_a && (
                    <li className="flex">
                      <span className="font-medium w-32 text-foreground">Your Address:</span>
                      <span className="text-muted-foreground">{meetingRequest.address_a}</span>
                    </li>
                  )}
                  {meetingRequest.address_b && (
                    <li className="flex">
                      <span className="font-medium w-32 text-foreground">Their Address:</span>
                      <span className="text-muted-foreground">{meetingRequest.address_b}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {meetingRequest.selected_place && (
              <div className="p-6 border-t border-border">
                <h2 className="text-lg font-semibold mb-3 text-foreground">Selected Meeting Place</h2>
                <div className="bg-success/10 p-4 rounded-lg">
                  <h3 className="font-bold text-success">{meetingRequest.selected_place.name}</h3>
                  <p className="text-success/90">{meetingRequest.selected_place.address}</p>
                </div>
              </div>
            )}

            {meetingRequest.suggested_places && meetingRequest.suggested_places.length > 0 && (
              <div className="p-6 border-t border-border">
                <h2 className="text-lg font-semibold mb-3 text-foreground">Suggested Meeting Places</h2>
                <ul className="space-y-4">
                  {meetingRequest.suggested_places.map((place) => (
                    <li key={place.id} className="p-3 bg-surface-muted rounded-lg">
                      <h3 className="font-bold text-foreground">{place.name}</h3>
                      <p className="text-muted-foreground">{place.address}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-6 border-t border-border">
              <div className="flex justify-between">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-surface-muted text-foreground rounded-md hover:bg-border transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 