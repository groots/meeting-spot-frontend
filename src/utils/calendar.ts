// Client-side "add to calendar" helpers. Mirrors the backend src/utils/calendar.ts
// so the app can build a Google Calendar link locally and download the server's
// .ics. Prefer the server-provided `ics` string as the source of truth; the
// Google URL builder is a convenience for the "Add to Google Calendar" button.
//
// PRIVACY: `location` must be the public venue name + address only — never a
// home address or coordinates.

export interface CalendarEvent {
  title: string;
  location: string;
  description?: string;
  start: Date;
  end: Date;
}

/** Format a Date as a UTC "basic" timestamp (YYYYMMDDTHHMMSSZ). */
function toBasicUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Build a Google Calendar "render" template URL that pre-fills a new event.
 * Matches the backend output; used as a fallback when the server didn't return
 * a google_url (the server value is preferred).
 */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toBasicUtc(event.start)}/${toBasicUtc(event.end)}`,
    location: event.location,
  });
  if (event.description) {
    params.set('details', event.description);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Trigger a download of an .ics file from a raw iCalendar string (the server's
 * `ics`). Creates a Blob + temporary anchor and clicks it.
 */
export function downloadIcs(ics: string, filename = 'meeting.ics'): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
