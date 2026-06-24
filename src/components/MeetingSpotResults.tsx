'use client';

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { buildDirectionsUrl } from '@/utils/directions';
import type { MeetingSpot } from '@/lib/schemas';

// Identify a venue across the suggestions/choices. Prefer place_id; fall back to
// name+address when the backend didn't return a place_id. Mirrors the owner view.
const venueKey = (spot: Pick<MeetingSpot, 'name' | 'address' | 'place_id'>) =>
  spot.place_id || `${spot.name}|${spot.address}`;

// Premium travel-time chips: seconds → "N min" (or "<1 min"); null → unreachable.
const formatTravelTime = (seconds: number | null | undefined): string | null => {
  if (seconds == null) return null;
  const minutes = Math.round(seconds / 60);
  return minutes < 1 ? '<1 min' : `${minutes} min`;
};

interface MeetingSpotResultsProps {
  spots: MeetingSpot[];
  // Collaborative-selection props (all optional → component stays read-only by
  // default, preserving the legacy invitee experience for OWNER mode).
  selectionMode?: string | null;
  myChoice?: MeetingSpot | null;
  theirChoice?: MeetingSpot | null;
  selectedPlace?: MeetingSpot | null;
  completed?: boolean;
  selectingKey?: string | null;
  onSelect?: (spot: MeetingSpot) => void;
  // Directions delivery (shown once completed).
  onSendDirections?: () => void;
  smsState?: 'idle' | 'sending' | 'sent' | 'unavailable';
}

export default function MeetingSpotResults({
  spots,
  selectionMode,
  myChoice,
  theirChoice,
  selectedPlace,
  completed = false,
  selectingKey,
  onSelect,
  onSendDirections,
  smsState = 'idle',
}: MeetingSpotResultsProps) {
  const handleOpenInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const isMutual = selectionMode === 'mutual';
  const canSelect = isMutual && !completed && typeof onSelect === 'function';

  const selectedKey = selectedPlace ? venueKey(selectedPlace) : null;
  const myKey = myChoice ? venueKey(myChoice) : null;
  const theirKey = theirChoice ? venueKey(theirChoice) : null;
  const waitingForAgreement = isMutual && !completed && myKey !== null;

  const directionsUrl = selectedPlace ? buildDirectionsUrl(selectedPlace) : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* What-happens-next + directions, shown once the meeting is locked in. */}
      {completed && selectedPlace && (
        <div className="mb-6">
          <Alert variant="success" title="You're all set — here's what happens next">
            <p className="mb-2">
              <span className="font-semibold">{selectedPlace.name}</span> is locked in
              {selectedPlace.address ? ` (${selectedPlace.address})` : ''}. The other person sees
              this same confirmation, so you&apos;re both looking at the same plan.
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
              {onSendDirections && (
                <button
                  onClick={onSendDirections}
                  disabled={smsState === 'sending' || smsState === 'sent'}
                  className="inline-flex items-center px-3 py-2 text-sm bg-surface-muted text-foreground rounded-md hover:bg-border transition-colors disabled:opacity-50"
                >
                  {smsState === 'sending'
                    ? 'Sending…'
                    : smsState === 'sent'
                      ? 'Directions texted ✓'
                      : 'Text me directions'}
                </button>
              )}
            </div>
            {smsState === 'unavailable' && (
              <p className="text-sm mt-2 text-foreground/80">
                We couldn&apos;t text you directions. Use the &quot;Get directions&quot; link
                above instead.
              </p>
            )}
          </Alert>
        </div>
      )}

      {waitingForAgreement && (
        <p className="text-info text-center mb-6">Waiting for the other person to agree…</p>
      )}
      {isMutual && !completed && myKey === null && (
        <p className="text-muted-foreground text-center mb-6">
          Pick the place you want. It locks in once you both pick the same one.
        </p>
      )}

      <div className="space-y-6">
        {spots.map((spot, index) => {
          const key = venueKey(spot);
          const isFinalSelected = selectedKey === key;
          const isMyPick = myKey === key;
          const isTheirPick = theirKey === key;
          return (
            <div key={`${key}-${index}`} className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="text-xl font-bold">{spot.name}</h3>
                {isFinalSelected && (
                  <span className="shrink-0 inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-success/15 text-success">
                    {isMutual ? 'You both agreed' : 'Selected'}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{spot.address}</p>

              {isMutual && (isMyPick || isTheirPick) && !isFinalSelected && (
                <div className="flex gap-2 mb-4">
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

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Distance from midpoint</p>
                  <p className="text-lg font-semibold">
                    {typeof spot.distance === 'number' ? `${spot.distance.toFixed(1)} km` : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-lg font-semibold">
                    {typeof spot.rating === 'number'
                      ? `${spot.rating.toFixed(1)}${typeof spot.user_ratings_total === 'number' ? ` (${spot.user_ratings_total})` : ''}`
                      : 'No rating'}
                  </p>
                </div>
              </div>

              {/* Premium travel-time fairness chips (driving minutes per person). */}
              {(spot.travel_time_a_sec != null || spot.travel_time_b_sec != null) && (
                <div className="flex flex-wrap justify-center gap-2 mb-6 -mt-2">
                  <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                    You: {formatTravelTime(spot.travel_time_a_sec) ?? 'N/A'}
                  </span>
                  <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-info/10 text-info">
                    Them: {formatTravelTime(spot.travel_time_b_sec) ?? 'N/A'}
                  </span>
                </div>
              )}

              <div className="flex space-x-4">
                {canSelect && !isFinalSelected ? (
                  <Button
                    onClick={() => onSelect?.(spot)}
                    disabled={selectingKey != null}
                    className="flex-1"
                  >
                    {selectingKey === key
                      ? 'Saving…'
                      : isMyPick
                        ? 'Keep this pick'
                        : 'Pick this place'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleOpenInMaps(spot.address)}
                    className="flex-1"
                  >
                    Open in Maps
                  </Button>
                )}
                <Button
                  onClick={() => handleOpenInMaps(spot.address)}
                  variant="secondary"
                  className="flex-1"
                >
                  Get Directions
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
