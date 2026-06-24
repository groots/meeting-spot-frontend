'use client';

import { useCallback, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import RespondToRequestForm from '@/components/RespondToRequestForm';
import MeetingSpotResults from '@/components/MeetingSpotResults';
import SchedulePicker from '@/components/SchedulePicker';
import { API_ENDPOINTS } from '@/app/config';
import {
  parseMeetingResults,
  parseMeetingStatus,
  parseCalendarLinks,
  type MeetingResults,
  type MeetingSpot,
  type CalendarLinks,
} from '@/lib/schemas';

export default function RequestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const requestId = params?.id as string;
  const token = searchParams?.get('token');

  const [status, setStatus] = useState<string | null>(null);
  const [results, setResults] = useState<MeetingResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectingKey, setSelectingKey] = useState<string | null>(null);
  const [smsState, setSmsState] = useState<'idle' | 'sending' | 'sent' | 'unavailable'>('idle');
  const [proposingTime, setProposingTime] = useState(false);
  const [calSendState, setCalSendState] = useState<'idle' | 'sending' | 'sent' | 'unavailable'>(
    'idle'
  );

  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';

  // Fetch status and (when ready/completed) results. Keep polling until the
  // meeting is finalized so mutual-mode picks update near-live (~5s).
  const fetchState = useCallback(
    async (showSpinner = false) => {
      if (!requestId) return;
      try {
        if (showSpinner) setIsLoading(true);
        const response = await fetch(API_ENDPOINTS.meetingRequestStatus(requestId) + tokenParam);
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        const data = parseMeetingStatus(await response.json());
        setStatus(data.status);

        if (data.status === 'ready' || data.status === 'completed') {
          setShowResults(true);
          const resultsResponse = await fetch(
            API_ENDPOINTS.meetingRequestResults(requestId) + tokenParam
          );
          if (!resultsResponse.ok) {
            throw new Error('Failed to fetch results');
          }
          const resultsData = parseMeetingResults(await resultsResponse.json());
          setResults(resultsData);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching request state:', err);
        if (showSpinner) {
          setError(err instanceof Error ? err.message : 'Failed to fetch status');
        }
      } finally {
        if (showSpinner) setIsLoading(false);
      }
    },
    [requestId, tokenParam]
  );

  useEffect(() => {
    fetchState(true);
  }, [fetchState]);

  // Poll until the meeting is fully finalized — both the place AND the time.
  // This covers the wait for the owner's address (pending → ready), mutual-mode
  // place agreement (ready → completed), and mutual-mode time agreement
  // (completed → meeting_time set), so the invitee sees the other person's
  // picks without refreshing.
  useEffect(() => {
    if (!requestId) return;
    if (status === 'completed' && results?.meeting_time) return;

    const interval = setInterval(() => fetchState(false), 5000);
    return () => clearInterval(interval);
  }, [requestId, status, results?.meeting_time, fetchState]);

  const handleRespondToRequest = async (data: {
    address_b: string;
    address_b_lat?: number;
    address_b_lon?: number;
  }) => {
    if (!token || !requestId) {
      setError('Missing token or request ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(API_ENDPOINTS.meetingRequestRespond(requestId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          token: token,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit response');
      }

      await response.json();
      // Update status to show calculating; polling will pick up the results.
      setStatus('calculating');
    } catch (error) {
      console.error('Error submitting response:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit response');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // MUTUAL mode: record the invitee's pick via /choose, then refetch so the
  // indicators (and possible agreement) reflect immediately.
  const handleChoose = async (spot: MeetingSpot) => {
    if (!token || !requestId) return;
    const key = spot.place_id || `${spot.name}|${spot.address}`;
    try {
      setSelectingKey(key);
      setError(null);
      const response = await fetch(API_ENDPOINTS.meetingRequestChoose(requestId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, place: spot }),
      });
      if (!response.ok) {
        throw new Error('Failed to record your pick');
      }
      await fetchState(false);
    } catch (err) {
      console.error('Error choosing place:', err);
      setError(err instanceof Error ? err.message : 'Could not record your pick.');
    } finally {
      setSelectingKey(null);
    }
  };

  const handleSendDirections = async () => {
    if (!token || !requestId) return;
    try {
      setSmsState('sending');
      const response = await fetch(API_ENDPOINTS.meetingRequestSendDirections(requestId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      if (response.status === 400) {
        // No phone on file for the invitee → fall back to the on-screen link.
        setSmsState('unavailable');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to send directions');
      }
      setSmsState('sent');
    } catch (err) {
      console.error('Error sending directions:', err);
      setSmsState('unavailable');
    }
  };

  // Propose the meeting time (invitee, token auth). Agreement (MUTUAL) is
  // resolved server-side; we re-read so the indicators reflect immediately.
  const handleProposeTime = async (meetingTimeIso: string) => {
    if (!token || !requestId) return;
    try {
      setError(null);
      setProposingTime(true);
      const response = await fetch(API_ENDPOINTS.meetingRequestSchedule(requestId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, meeting_time: meetingTimeIso }),
      });
      if (!response.ok) {
        throw new Error(`Failed to propose a time: ${response.status}`);
      }
      await fetchState(false);
    } catch (err) {
      console.error('Error proposing time:', err);
      setError('Could not record the meeting time. Please try again.');
    } finally {
      setProposingTime(false);
    }
  };

  const getCalendarLinks = useCallback(async (): Promise<CalendarLinks> => {
    const response = await fetch(API_ENDPOINTS.meetingRequestCalendar(requestId) + tokenParam);
    if (!response.ok) throw new Error(`Failed to load calendar: ${response.status}`);
    return parseCalendarLinks(await response.json());
  }, [requestId, tokenParam]);

  const handleSendCalendar = async () => {
    if (!token || !requestId) return;
    try {
      setCalSendState('sending');
      const response = await fetch(API_ENDPOINTS.meetingRequestSendCalendar(requestId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
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

  if (isLoading && !status) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Loading Request...
            </h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
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
            <div className="max-w-md mx-auto p-6 bg-error/10 text-error rounded-lg">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = status === 'completed';
  const meetingSpots = results?.suggested_options ?? [];

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Meeting Request
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            {status === 'ready' || status === 'completed'
              ? 'Here are the suggested meeting spots!'
              : 'Enter your address to find a meeting spot.'}
          </p>
        </div>

        {isLoading && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-info/10 text-info rounded-lg">
            Loading...
          </div>
        )}

        {/* Show response form if status is pending_b_address */}
        {status === 'pending_b_address' && token && (
          <RespondToRequestForm
            token={token}
            onSubmit={handleRespondToRequest}
          />
        )}

        {/* Show status if calculating */}
        {status === 'calculating' && (
          <div className="max-w-md mx-auto p-6 bg-surface border border-border rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Calculating Meeting Spots
            </h2>
            <div className="text-lg text-muted-foreground">
              <p>We're finding the perfect meeting location for you. This may take a moment...</p>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          </div>
        )}

        {/* Show results if ready/completed. The invitee is User B, so their pick
            is user_b_choice and the other person's is user_a_choice. */}
        {showResults && meetingSpots.length > 0 && (
          <MeetingSpotResults
            spots={meetingSpots}
            selectionMode={results?.selection_mode}
            myChoice={results?.user_b_choice ?? null}
            theirChoice={results?.user_a_choice ?? null}
            selectedPlace={results?.selected_place ?? null}
            completed={isCompleted}
            selectingKey={selectingKey}
            onSelect={token ? handleChoose : undefined}
            onSendDirections={token ? handleSendDirections : undefined}
            smsState={smsState}
          />
        )}

        {/* Once a place is locked, pick the time. The invitee is User B, so
            their proposed time is user_b_time_choice and the other person's is
            user_a_time_choice. In OWNER mode the picker is read-only. */}
        {isCompleted && results?.selected_place && (
          <div className="max-w-3xl mx-auto mt-8">
            <SchedulePicker
              selectionMode={results.selection_mode}
              isOwner={false}
              selectedPlace={results.selected_place}
              meetingTime={results.meeting_time}
              myTimeChoice={results.user_b_time_choice}
              theirTimeChoice={results.user_a_time_choice}
              durationMin={results.meeting_duration_min}
              onPropose={handleProposeTime}
              proposing={proposingTime}
              getCalendarLinks={getCalendarLinks}
              onSendCalendar={token ? handleSendCalendar : undefined}
              sendState={calSendState}
            />
          </div>
        )}
      </div>
    </main>
  );
}
