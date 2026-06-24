'use client';

// Collaborative time picker — the time analog of the place-agreement UI in
// MeetingSpotResults. Rendered once a place is locked (completed + selectedPlace).
//
//   OWNER mode  → the owner picks a time; the invitee is read-only.
//   MUTUAL mode → both propose a time with "Your/Their proposed time" chips and a
//                 "Waiting…"/"You both agreed" state, mirroring place selection.
//
// Once `meetingTime` is set, the picker shows "Add to Calendar": a Google
// Calendar button (built locally), a Download .ics (server `ics` is the source
// of truth, fetched via getCalendarLinks), and an optional Text/email control.
//
// PRIVACY: only the public venue (name + address) is ever put into a calendar
// event; this component never touches anyone's home address or coordinates.
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { buildGoogleCalendarUrl, downloadIcs } from '@/utils/calendar';
import type { MeetingSpot, CalendarLinks } from '@/lib/schemas';

interface SchedulePickerProps {
  selectionMode?: string | null;
  // True when the viewer is the organizer (User A). Governs read-only state in
  // OWNER mode and which proposed time is "yours".
  isOwner: boolean;
  selectedPlace: MeetingSpot;
  meetingTime?: string | null; // ISO; non-null = time is locked
  myTimeChoice?: string | null;
  theirTimeChoice?: string | null;
  durationMin?: number | null;
  // Record a proposal (page handles the API call + refetch with correct auth).
  onPropose: (meetingTimeIso: string) => Promise<void>;
  proposing?: boolean;
  // Fetch the server's calendar artifacts (google_url + ics) for the .ics download.
  getCalendarLinks?: () => Promise<CalendarLinks>;
  onSendCalendar?: () => void;
  sendState?: 'idle' | 'sending' | 'sent' | 'unavailable';
}

// Format a Date as the value a <input type="datetime-local"> expects
// (YYYY-MM-DDTHH:MM) in the user's local timezone.
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

// Two proposals "agree" once truncated to the minute.
function sameMinute(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const fa = Math.floor(new Date(a).getTime() / 60000);
  const fb = Math.floor(new Date(b).getTime() / 60000);
  return !Number.isNaN(fa) && fa === fb;
}

export default function SchedulePicker({
  selectionMode,
  isOwner,
  selectedPlace,
  meetingTime,
  myTimeChoice,
  theirTimeChoice,
  durationMin,
  onPropose,
  proposing = false,
  getCalendarLinks,
  onSendCalendar,
  sendState = 'idle',
}: SchedulePickerProps) {
  const isMutual = selectionMode === 'mutual';
  const readOnly = !isMutual && !isOwner; // OWNER mode → invitee can't propose
  const locked = Boolean(meetingTime);

  const [value, setValue] = useState('');
  const [icsState, setIcsState] = useState<'idle' | 'loading' | 'error'>('idle');

  const minValue = toLocalInputValue(new Date());

  const handlePropose = async () => {
    if (!value) return;
    // datetime-local has no timezone; interpret as local and send ISO/UTC.
    const iso = new Date(value).toISOString();
    await onPropose(iso);
  };

  const handleDownloadIcs = async () => {
    if (!getCalendarLinks) return;
    try {
      setIcsState('loading');
      const links = await getCalendarLinks();
      downloadIcs(links.ics, 'meeting.ics');
      setIcsState('idle');
    } catch {
      setIcsState('error');
    }
  };

  // --- Locked: show the "add to calendar" affordances. ---
  if (locked && meetingTime) {
    const start = new Date(meetingTime);
    const minutes = typeof durationMin === 'number' && durationMin > 0 ? durationMin : 60;
    const end = new Date(start.getTime() + minutes * 60 * 1000);
    const googleUrl = buildGoogleCalendarUrl({
      title: `Meeting at ${selectedPlace.name}`,
      location: selectedPlace.address
        ? `${selectedPlace.name}, ${selectedPlace.address}`
        : selectedPlace.name,
      description: 'Scheduled via Find A Meeting Spot.',
      start,
      end,
    });

    return (
      <Alert variant="success" title={`Meeting time: ${formatWhen(meetingTime)}`}>
        <p className="mb-3">
          {isMutual
            ? 'You both agreed on this time. Add it to your calendar:'
            : 'Your meeting time is set. Add it to your calendar:'}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
          >
            Add to Google Calendar
          </a>
          {getCalendarLinks && (
            <button
              onClick={handleDownloadIcs}
              disabled={icsState === 'loading'}
              className="inline-flex items-center px-3 py-2 text-sm bg-surface-muted text-foreground rounded-md hover:bg-border transition-colors disabled:opacity-50"
            >
              {icsState === 'loading' ? 'Preparing…' : 'Download .ics'}
            </button>
          )}
          {onSendCalendar && (
            <button
              onClick={onSendCalendar}
              disabled={sendState === 'sending' || sendState === 'sent'}
              className="inline-flex items-center px-3 py-2 text-sm bg-surface-muted text-foreground rounded-md hover:bg-border transition-colors disabled:opacity-50"
            >
              {sendState === 'sending'
                ? 'Sending…'
                : sendState === 'sent'
                  ? 'Calendar link sent ✓'
                  : 'Send me the calendar link'}
            </button>
          )}
        </div>
        {icsState === 'error' && (
          <p className="text-sm mt-2 text-foreground/80">
            Couldn&apos;t prepare the .ics file. Use the Google Calendar button instead.
          </p>
        )}
        {sendState === 'unavailable' && (
          <p className="text-sm mt-2 text-foreground/80">
            We couldn&apos;t send you the calendar link. Use the buttons above instead.
          </p>
        )}
      </Alert>
    );
  }

  // --- Not yet locked: propose a time. ---
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold mb-2">Pick a time</h3>

      {readOnly ? (
        <p className="text-muted-foreground">
          {theirTimeChoice
            ? `The organizer proposed ${formatWhen(theirTimeChoice)}.`
            : 'The organizer will choose the meeting time.'}
        </p>
      ) : (
        <>
          <p className="text-muted-foreground mb-4">
            {isMutual
              ? 'Propose a time. It locks in once you both propose the same one.'
              : 'Choose the meeting time to finalize your plan.'}
          </p>

          {isMutual && (myTimeChoice || theirTimeChoice) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {myTimeChoice && (
                <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/15 text-primary">
                  Your proposed time: {formatWhen(myTimeChoice)}
                </span>
              )}
              {theirTimeChoice && (
                <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-info/15 text-info">
                  Their proposed time: {formatWhen(theirTimeChoice)}
                </span>
              )}
            </div>
          )}

          {isMutual &&
            myTimeChoice &&
            theirTimeChoice &&
            !sameMinute(myTimeChoice, theirTimeChoice) && (
              <p className="text-info mb-4">
                You proposed different times — adjust to match and it locks in.
              </p>
            )}
          {isMutual && myTimeChoice && !theirTimeChoice && (
            <p className="text-info mb-4">Waiting for the other person to propose a time…</p>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col">
              <label htmlFor="meeting-time" className="text-sm text-muted-foreground mb-1">
                Date &amp; time
              </label>
              <input
                id="meeting-time"
                type="datetime-local"
                value={value}
                min={minValue}
                onChange={(e) => setValue(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-surface text-foreground"
              />
            </div>
            <Button onClick={handlePropose} disabled={!value || proposing}>
              {proposing
                ? 'Saving…'
                : isMutual
                  ? myTimeChoice
                    ? 'Update my time'
                    : 'Propose this time'
                  : 'Set meeting time'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
