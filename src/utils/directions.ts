// Build a Google Maps directions URL to a chosen venue.
//
// PRIVACY: the origin is intentionally omitted so Google Maps uses each user's
// own current location as the start point — no party's address is embedded in
// or shared via the link. Mirrors the backend src/utils/directions.ts.
import type { MeetingSpot } from '@/lib/schemas';

export function buildDirectionsUrl(place: Pick<MeetingSpot, 'name' | 'address' | 'place_id'>): string {
  const destination = place.address || place.name || '';
  const params = new URLSearchParams({ api: '1', destination });
  if (place.place_id) {
    params.set('destination_place_id', place.place_id);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
