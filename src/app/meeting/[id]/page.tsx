'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { API_ENDPOINTS } from '@/app/config';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  parseMeetingOwner,
  type MeetingOwner,
  type MeetingSpot,
} from '@/lib/schemas';

// Identify a venue across the suggestions/selected place. Prefer place_id; fall
// back to name+address when the backend didn't return a place_id.
const venueKey = (spot: MeetingSpot) => spot.place_id || `${spot.name}|${spot.address}`;

const statusColor = (status: string) => {
  switch (status) {
    case 'pending_b_address':
      return 'bg-warning/15 text-warning';
    case 'calculating':
      return 'bg-info/15 text-info';
    case 'completed':
      return 'bg-success/15 text-success';
    case 'expired':
    case 'failed':
      return 'bg-error/15 text-error';
    default:
      return 'bg-surface-muted text-muted-foreground';
  }
};

export default function MeetingDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { token } = useAuth();
  const [meetingRequest, setMeetingRequest] = useState<MeetingOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectingKey, setSelectingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;

    const fetchMeetingRequest = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.meetingRequest(id), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch meeting request: ${response.status}`);
        }

        const data = parseMeetingOwner(await response.json());
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

  const handleSelectPlace = async (venue: MeetingSpot) => {
    if (!token) return;
    try {
      setError(null);
      setSelectingKey(venueKey(venue));
      const response = await fetch(API_ENDPOINTS.meetingRequest(id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meeting_location: venue }),
      });

      if (!response.ok) {
        throw new Error(`Failed to select place: ${response.status}`);
      }

      const updated = parseMeetingOwner(await response.json());
      setMeetingRequest(updated);
    } catch (err) {
      console.error('Error selecting place:', err);
      setError('Could not save the selected place. Please try again.');
    } finally {
      setSelectingKey(null);
    }
  };

  const contact =
    meetingRequest?.user_b_contact || meetingRequest?.user_b_contact_type || '—';
  const selectedPlace = meetingRequest?.selected_place_details ?? null;
  const selectedKey = selectedPlace ? venueKey(selectedPlace) : null;
  const suggestions = meetingRequest?.suggested_options ?? [];

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
        ) : error && !meetingRequest ? (
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
                  className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${statusColor(meetingRequest.status)}`}
                >
                  {meetingRequest.status}
                </span>
              </div>
              {meetingRequest.created_at && (
                <p className="text-muted-foreground">
                  Created {formatDistanceToNow(new Date(meetingRequest.created_at), { addSuffix: true })}
                </p>
              )}
            </div>

            {error && (
              <div className="mx-6 mt-6 bg-error/10 p-3 rounded-lg">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            <div className="p-6">
              <h2 className="text-lg font-semibold mb-3 text-foreground">Basic Information</h2>
              <ul className="space-y-3">
                <li className="flex">
                  <span className="font-medium w-32 text-foreground">Meeting ID:</span>
                  <span className="text-muted-foreground">{meetingRequest.request_id || id}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32 text-foreground">Contact:</span>
                  <span className="text-muted-foreground">{contact}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32 text-foreground">Location Type:</span>
                  <span className="text-muted-foreground">{meetingRequest.location_type ?? '—'}</span>
                </li>
              </ul>
            </div>

            {selectedPlace && (
              <div className="p-6 border-t border-border">
                <h2 className="text-lg font-semibold mb-3 text-foreground">Selected Meeting Place</h2>
                <div className="bg-success/10 p-4 rounded-lg">
                  <h3 className="font-bold text-success">{selectedPlace.name}</h3>
                  <p className="text-success/90">{selectedPlace.address}</p>
                </div>
              </div>
            )}

            <div className="p-6 border-t border-border">
              <h2 className="text-lg font-semibold mb-3 text-foreground">
                {selectedPlace ? 'Other Suggested Places' : 'Suggested Meeting Places'}
              </h2>
              {suggestions.length === 0 ? (
                <p className="text-muted-foreground">
                  {meetingRequest.status === 'completed'
                    ? 'No suggestions are available for this meeting.'
                    : 'Suggestions will appear here once the other person shares their address.'}
                </p>
              ) : (
                <ul className="space-y-4">
                  {suggestions.map((place, index) => {
                    const key = venueKey(place);
                    const isSelected = selectedKey === key;
                    return (
                      <li
                        key={`${key}-${index}`}
                        className="p-4 bg-surface-muted rounded-lg flex justify-between items-start gap-4"
                      >
                        <div>
                          <h3 className="font-bold text-foreground">{place.name}</h3>
                          <p className="text-muted-foreground">{place.address}</p>
                        </div>
                        {isSelected ? (
                          <span className="shrink-0 inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-success/15 text-success">
                            Selected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSelectPlace(place)}
                            disabled={selectingKey !== null}
                            className="shrink-0 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50"
                          >
                            {selectingKey === key ? 'Selecting…' : 'Select as meeting place'}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

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
