// Runtime validation for API responses. The frontend can't trust the shape of
// `fetch().json()` (it's `any`), so we validate at the boundary. This turns a
// silent shape mismatch (e.g. a missing `distance` -> `undefined.toFixed()`
// crash) into a clear, caught error.
import { z } from 'zod';

// A single suggested venue. Only `name`/`address` are guaranteed; everything the
// UI renders numerically is nullable/optional because the backend returns
// `null` (rating, price_level, distance for some places). `.passthrough()` keeps
// any extra backend fields instead of stripping or rejecting them.
export const meetingSpotSchema = z
  .object({
    name: z.string(),
    address: z.string(),
    distance: z.number().nullish(), // kilometers from the midpoint
    rating: z.number().nullish(),
    user_ratings_total: z.number().nullish(),
    price_level: z.number().nullish(),
    photos: z.array(z.string()).nullish(),
    place_id: z.string().nullish(),
    category: z.string().nullish(),
    subcategory: z.string().nullish(),
    location: z.object({ lat: z.number(), lng: z.number() }).nullish(),
  })
  .passthrough();

export type MeetingSpot = z.infer<typeof meetingSpotSchema>;

// GET /:id/results. `suggested_options` is null until calculation completes, so
// normalize null/undefined to an empty array for the UI. `meeting_contact_info`
// is owner-only (the backend attaches User B's email only for the authenticated
// owner, never on the invitee/token path) so it's optional here.
export const meetingResultsSchema = z
  .object({
    request_id: z.string().nullish(),
    status: z.string(),
    suggested_options: z
      .array(meetingSpotSchema)
      .nullish()
      .transform((v) => v ?? []),
    selected_place: z.unknown().nullish(),
    meeting_contact_info: z
      .object({
        email: z.string().nullish(),
        phone: z.string().nullish(),
        name: z.string().nullish(),
      })
      .nullish(),
  })
  .passthrough();

export type MeetingResults = z.infer<typeof meetingResultsSchema>;

// GET /:id/status.
export const meetingStatusSchema = z
  .object({
    request_id: z.string().nullish(),
    status: z.string(),
    created_at: z.string().nullish(),
    expires_at: z.string().nullish(),
  })
  .passthrough();

export type MeetingStatus = z.infer<typeof meetingStatusSchema>;

// Validate `data` against `schema`, logging the detailed issues for debugging
// and throwing a user-friendly Error (caught by the page's error handling).
function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Invalid ${label} response:`, result.error.issues);
    throw new Error('Received an unexpected response from the server. Please try again.');
  }
  return result.data;
}

export const parseMeetingResults = (data: unknown): MeetingResults =>
  parseOrThrow(meetingResultsSchema, data, 'meeting results');

export const parseMeetingStatus = (data: unknown): MeetingStatus =>
  parseOrThrow(meetingStatusSchema, data, 'meeting status');
