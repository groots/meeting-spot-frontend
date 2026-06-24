'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { API_ENDPOINTS } from '@/app/config';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Alert } from '@/components/ui/alert';
import { buildDirectionsUrl } from '@/utils/directions';
import SchedulePicker from '@/components/SchedulePicker';
import RefineControl, { type RefineParams } from '@/components/RefineControl';
import {
  parseMeetingOwner,
  parseCalendarLinks,
  type MeetingOwner,
  type MeetingSpot,
  type CalendarLinks,
} from '@/lib/schemas';

// Identify a venue across the suggestions/selected place. Prefer place_id; fall
// back to name+address when the backend didn't return a place_id.
const venueKey = (spot: MeetingSpot) => spot.place_id || `${spot.name}|${spot.address}`;

// Premium travel-time chips: seconds → "N min" (or "<1 min"); null → unreachable.
const formatTravelTime = (seconds: number | null | undefined): string | null => {
  if (seconds == null) return null;
  const minutes = Math.round(seconds / 60);
  return minutes < 1 ? '<1 min' : `${minutes} min`;
};

const statusColor = (status: string) => {
  switch (status) {
    case 'pending_b_address':
      return 'bg-warning/15 text-warning';
    case 'calculating':
      return 'bg-info/15 text-info';
    case 'ready':
      return 'bg-warning/15 text-warning';
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
  const [smsState, setSmsState] = useState<'idle' | 'sending' | 'sent' | 'unavailable'>('idle');
  const [proposingTime, setProposingTime] = useState(false);
  const [calSendState, setCalSendState] = useState<'idle' | 'sending' | 'sent' | 'unavailable'>(
    'idle'
  );
  const [refining, setRefining] = useState(false);
  const [refinePremiumRequired, setRefinePremiumRequired] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  const fetchMeetingRequest = useCallback(
    async (showSpinner = false) => {
      if (!id || !token) return;
      try {
        if (showSpinner) setLoading(true);
        const response = await fetch(API_ENDPOINTS.meetingRequest(id), {
          headers: {
            Authorization: `Bearer ${token}`,
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
        if (showSpinner) {
          setError('Could not load meeting request details. Please try again later.');
        }
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [id, token]
  );

  useEffect(() => {
    fetchMeetingRequest(true);
  }, [fetchMeetingRequest]);

  // Near-live polling (5s) so the owner sees the other person's place pick AND
  // mutual time agreement without a manual refresh. Stops only once both the
  // place and the time are locked (completed + meeting_time).
  useEffect(() => {
    if (!id || !token) return;
    if (meetingRequest?.status === 'completed' && meetingRequest?.meeting_time) return;

    const interval = setInterval(() => fetchMeetingRequest(false), 5000);
    return () => clearInterval(interval);
  }, [id, token, meetingRequest?.status, meetingRequest?.meeting_time, fetchMeetingRequest]);

  // OWNER mode: finalize directly via PUT meeting_location (legacy behavior).
  const handleSelectPlace = async (venue: MeetingSpot) => {
    if (!token) return;
    try {
      setError(null);
      setSelectingKey(venueKey(venue));
      const response = await fetch(API_ENDPOINTS.meetingRequest(id), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
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

  // MUTUAL mode: record the owner's pick via /choose. Agreement is detected
  // server-side; we just re-read the (possibly finalized) request.
  const handleChoosePlace = async (venue: MeetingSpot) => {
    if (!token) return;
    try {
      setError(null);
      setSelectingKey(venueKey(venue));
      const response = await fetch(API_ENDPOINTS.meetingRequestChoose(id), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ place: venue }),
      });

      if (!response.ok) {
        throw new Error(`Failed to record your pick: ${response.status}`);
      }

      // Re-fetch the owner DTO so all indicators stay in sync.
      await fetchMeetingRequest(false);
    } catch (err) {
      console.error('Error choosing place:', err);
      setError('Could not record your pick. Please try again.');
    } finally {
      setSelectingKey(null);
    }
  };

  const handleSendDirections = async () => {
    if (!token) return;
    try {
      setSmsState('sending');
      const response = await fetch(API_ENDPOINTS.meetingRequestSendDirections(id), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.status === 400) {
        // No phone on file → fall back to the on-screen link.
        setSmsState('unavailable');
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to send directions: ${response.status}`);
      }
      setSmsState('sent');
    } catch (err) {
      console.error('Error sending directions:', err);
      setSmsState('unavailable');
    }
  };

  // Propose the meeting time (owner, Bearer auth). Agreement (MUTUAL) or
  // immediate set (OWNER) is resolved server-side; we re-read the request.
  const handleProposeTime = async (meetingTimeIso: string) => {
    if (!token) return;
    try {
      setError(null);
      setProposingTime(true);
      const response = await fetch(API_ENDPOINTS.meetingRequestSchedule(id), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meeting_time: meetingTimeIso }),
      });
      if (!response.ok) {
        throw new Error(`Failed to propose a time: ${response.status}`);
      }
      await fetchMeetingRequest(false);
    } catch (err) {
      console.error('Error proposing time:', err);
      setError('Could not record the meeting time. Please try again.');
    } finally {
      setProposingTime(false);
    }
  };

  // Owner-only refine: re-run discovery with new params, then re-read the owner
  // DTO. The soft premium gate flags the travel-time upsell via a response header
  // (non-premium still gets refreshed distance-ranked results).
  const handleRefine = async (params: RefineParams) => {
    if (!token) return;
    try {
      setRefining(true);
      setRefineError(null);
      const response = await fetch(API_ENDPOINTS.meetingRequestRefine(id), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      setRefinePremiumRequired(response.headers.get('X-Premium-Required') === 'true');
      if (!response.ok) {
        throw new Error(`Failed to refine: ${response.status}`);
      }
      await fetchMeetingRequest(false);
    } catch (err) {
      console.error('Error refining suggestions:', err);
      setRefineError('Could not refine the suggestions. Please try again.');
    } finally {
      setRefining(false);
    }
  };

  const getCalendarLinks = useCallback(async (): Promise<CalendarLinks> => {
    const response = await fetch(API_ENDPOINTS.meetingRequestCalendar(id), {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to load calendar: ${response.status}`);
    return parseCalendarLinks(await response.json());
  }, [id, token]);

  const handleSendCalendar = async () => {
    if (!token) return;
    try {
      setCalSendState('sending');
      const response = await fetch(API_ENDPOINTS.meetingRequestSendCalendar(id), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (response.status === 400) {
        setCalSendState('unavailable');
        return;
      }
      if (!response.ok) throw new Error(`Failed to send calendar: ${response.status}`);
      setCalSendState('sent');
    } catch (err) {
      console.error('Error sending calendar link:', err);
      setCalSendState('unavailable');
    }
  };

  const isMutual = meetingRequest?.selection_mode === 'mutual';
  const contact =
    meetingRequest?.user_b_contact || meetingRequest?.user_b_contact_type || '—';
  const selectedPlace = meetingRequest?.selected_place_details ?? null;
  const selectedKey = selectedPlace ? venueKey(selectedPlace) : null;
  const suggestions = meetingRequest?.suggested_options ?? [];
  const isCompleted = meetingRequest?.status === 'completed';

  // In MUTUAL mode the owner is User A; "their" pick is User B's choice.
  const myChoice = meetingRequest?.user_a_choice ?? null;
  const theirChoice = meetingRequest?.user_b_choice ?? null;
  const myKey = myChoice ? venueKey(myChoice) : null;
  const theirKey = theirChoice ? venueKey(theirChoice) : null;
  const waitingForAgreement = isMutual && !isCompleted && myKey !== null;

  const directionsUrl = selectedPlace ? buildDirectionsUrl(selectedPlace) : null;

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
                <li className="flex">
                  <span className="font-medium w-32 text-foreground">Decision:</span>
                  <span className="text-muted-foreground">
                    {isMutual ? 'Decide together' : 'You choose the spot'}
                  </span>
                </li>
              </ul>
            </div>

            {isCompleted && selectedPlace && (
              <div className="p-6 border-t border-border">
                <Alert variant="success" title="You're all set — here's what happens next">
                  <p className="mb-2">
                    <span className="font-semibold">{selectedPlace.name}</span> is locked in
                    {selectedPlace.address ? ` (${selectedPlace.address})` : ''}. The other person
                    sees this same confirmation on their page, so you&apos;re both looking at the
                    same plan.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {directionsUrl && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
                      >
                        Get directions
                      </a>
                    )}
                    <button
                      onClick={handleSendDirections}
                      disabled={smsState === 'sending' || smsState === 'sent'}
                      className="inline-flex items-center px-3 py-2 text-sm bg-surface-muted text-foreground rounded-md hover:bg-border transition-colors disabled:opacity-50"
                    >
                      {smsState === 'sending'
                        ? 'Sending…'
                        : smsState === 'sent'
                          ? 'Directions texted ✓'
                          : 'Text me directions'}
                    </button>
                  </div>
                  {smsState === 'unavailable' && (
                    <p className="text-sm mt-2 text-foreground/80">
                      We couldn&apos;t text you (no phone number on file). Use the
                      &quot;Get directions&quot; link above instead.
                    </p>
                  )}
                </Alert>

                <div className="mt-6">
                  <SchedulePicker
                    selectionMode={meetingRequest.selection_mode}
                    isOwner
                    selectedPlace={selectedPlace}
                    meetingTime={meetingRequest.meeting_time}
                    myTimeChoice={meetingRequest.user_a_time_choice}
                    theirTimeChoice={meetingRequest.user_b_time_choice}
                    durationMin={meetingRequest.meeting_duration_min}
                    onPropose={handleProposeTime}
                    proposing={proposingTime}
                    getCalendarLinks={getCalendarLinks}
                    onSendCalendar={handleSendCalendar}
                    sendState={calSendState}
                  />
                </div>
              </div>
            )}

            {selectedPlace && !isCompleted && (
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
              {!selectedPlace && meetingRequest.status === 'ready' && suggestions.length > 0 && (
                <p className="text-muted-foreground mb-4">
                  {isMutual
                    ? 'Pick the place you want. It locks in once you both pick the same one.'
                    : 'Pick a place below to agree on it and finalize the meeting.'}
                </p>
              )}
              {waitingForAgreement && (
                <p className="text-info mb-4">Waiting for the other person to agree…</p>
              )}
              {!selectedPlace && meetingRequest.status === 'ready' && (
                <div className="mb-6">
                  <RefineControl
                    currentLocationType={meetingRequest.location_type}
                    onRefine={handleRefine}
                    refining={refining}
                    premiumRequired={refinePremiumRequired}
                    error={refineError}
                  />
                </div>
              )}
              {suggestions.length === 0 ? (
                <p className="text-muted-foreground">
                  {meetingRequest.status === 'ready' || meetingRequest.status === 'completed'
                    ? 'No suggestions are available for this meeting.'
                    : 'Suggestions will appear here once the other person shares their address.'}
                </p>
              ) : (
                <ul className="space-y-4">
                  {suggestions.map((place, index) => {
                    const key = venueKey(place);
                    const isFinalSelected = selectedKey === key;
                    const isMyPick = myKey === key;
                    const isTheirPick = theirKey === key;
                    return (
                      <li
                        key={`${key}-${index}`}
                        className="p-4 bg-surface-muted rounded-lg flex justify-between items-start gap-4"
                      >
                        <div>
                          <h3 className="font-bold text-foreground">{place.name}</h3>
                          <p className="text-muted-foreground">{place.address}</p>
                          {(place.travel_time_a_sec != null || place.travel_time_b_sec != null) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                                You: {formatTravelTime(place.travel_time_a_sec) ?? 'N/A'}
                              </span>
                              <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-info/10 text-info">
                                Them: {formatTravelTime(place.travel_time_b_sec) ?? 'N/A'}
                              </span>
                            </div>
                          )}
                          {isMutual && (isMyPick || isTheirPick) && !isFinalSelected && (
                            <div className="flex gap-2 mt-2">
                              {isMyPick && (
                                <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/15 text-primary">
                                  Your pick
                                </span>
                              )}
                              {isTheirPick && (
                                <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-info/15 text-info">
                                  Their pick
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {isFinalSelected ? (
                          <span className="shrink-0 inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-success/15 text-success">
                            {isMutual ? 'You both agreed' : 'Selected'}
                          </span>
                        ) : isCompleted ? null : (
                          <button
                            onClick={() =>
                              isMutual ? handleChoosePlace(place) : handleSelectPlace(place)
                            }
                            disabled={selectingKey !== null}
                            className="shrink-0 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50"
                          >
                            {selectingKey === key
                              ? isMutual
                                ? 'Saving…'
                                : 'Selecting…'
                              : isMutual
                                ? isMyPick
                                  ? 'Keep this pick'
                                  : 'Pick this place'
                                : 'Select as meeting place'}
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
