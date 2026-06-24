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
    // Premium travel-time fairness (seconds from each origin). Present only when
    // the owner is premium and the re-rank ran; null when a leg is unreachable.
    travel_time_a_sec: z.number().nullish(),
    travel_time_b_sec: z.number().nullish(),
  })
  .passthrough();

export type MeetingSpot = z.infer<typeof meetingSpotSchema>;

// Scheduling fields shared by the results/owner/choose DTOs. ISO datetime
// strings (or null). `meeting_time` non-null is the "time is locked" signal;
// the per-party choices drive the mutual-agreement UI. They carry no address.
const timeFields = {
  meeting_time: z.string().nullish(),
  user_a_time_choice: z.string().nullish(),
  user_b_time_choice: z.string().nullish(),
  meeting_duration_min: z.number().nullish(),
};

// GET /:id/results. `suggested_options` is null until calculation completes, so
// normalize null/undefined to an empty array for the UI. `meeting_contact_info`
// is owner-only (the backend attaches User B's email only for the authenticated
// owner, never on the invitee/token path) so it's optional here.
export const meetingResultsSchema = z
  .object({
    request_id: z.string().nullish(),
    status: z.string(),
    selection_mode: z.string().nullish(),
    suggested_options: z
      .array(meetingSpotSchema)
      .nullish()
      .transform((v) => v ?? []),
    selected_place: meetingSpotSchema.nullish(),
    user_a_choice: meetingSpotSchema.nullish(),
    user_b_choice: meetingSpotSchema.nullish(),
    ...timeFields,
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

// GET /:id (owner view, toOwnerDto). `user_b_contact` is the decrypted contact
// the backend returns only to the authenticated owner. `selected_place_details`
// is the venue the owner picked (null until chosen); `suggested_options` are the
// computed venues (same shape as the results page).
export const meetingOwnerSchema = z
  .object({
    request_id: z.string().nullish(),
    status: z.string(),
    selection_mode: z.string().nullish(),
    user_b_contact: z.string().nullish(),
    user_b_contact_type: z.string().nullish(),
    location_type: z.string().nullish(),
    selected_place_details: meetingSpotSchema.nullish(),
    suggested_options: z
      .array(meetingSpotSchema)
      .nullish()
      .transform((v) => v ?? []),
    user_a_choice: meetingSpotSchema.nullish(),
    user_b_choice: meetingSpotSchema.nullish(),
    ...timeFields,
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
    expires_at: z.string().nullish(),
    is_expired: z.boolean().nullish(),
  })
  .passthrough();

export type MeetingOwner = z.infer<typeof meetingOwnerSchema>;

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

export const parseMeetingOwner = (data: unknown): MeetingOwner =>
  parseOrThrow(meetingOwnerSchema, data, 'meeting');

// POST /:id/choose reply (toChooseDto): the collaborative-selection state after
// recording a pick.
export const chooseResponseSchema = z
  .object({
    request_id: z.string().nullish(),
    status: z.string(),
    selection_mode: z.string().nullish(),
    user_a_choice: meetingSpotSchema.nullish(),
    user_b_choice: meetingSpotSchema.nullish(),
    selected_place: meetingSpotSchema.nullish(),
    ...timeFields,
  })
  .passthrough();

export type ChooseResponse = z.infer<typeof chooseResponseSchema>;

export const parseChooseResponse = (data: unknown): ChooseResponse =>
  parseOrThrow(chooseResponseSchema, data, 'choose response');

// POST /:id/schedule reply (toScheduleDto): the collaborative time-selection
// state after recording a proposal.
export const scheduleResponseSchema = z
  .object({
    request_id: z.string().nullish(),
    status: z.string(),
    selection_mode: z.string().nullish(),
    ...timeFields,
  })
  .passthrough();

export type ScheduleResponse = z.infer<typeof scheduleResponseSchema>;

export const parseScheduleResponse = (data: unknown): ScheduleResponse =>
  parseOrThrow(scheduleResponseSchema, data, 'schedule response');

// GET /:id/calendar reply: the "add to calendar" artifacts. `ics` is the source
// of truth for the .ics download; `google_url` opens the Google Calendar form.
export const calendarLinksSchema = z
  .object({
    google_url: z.string(),
    ics: z.string(),
  })
  .passthrough();

export type CalendarLinks = z.infer<typeof calendarLinksSchema>;

export const parseCalendarLinks = (data: unknown): CalendarLinks =>
  parseOrThrow(calendarLinksSchema, data, 'calendar links');
