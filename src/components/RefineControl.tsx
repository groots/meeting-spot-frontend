'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import LocationTypeSelector from '@/components/LocationTypeSelector';

// Params posted to POST /:id/refine. All optional — the backend falls back to
// the stored location type and default radius/count when omitted.
export interface RefineParams {
  location_type?: string;
  open_now?: boolean;
  radius?: number;
  max_results?: number;
}

interface RefineControlProps {
  currentLocationType?: string | null;
  onRefine: (params: RefineParams) => void | Promise<void>;
  refining?: boolean;
  // Soft premium gate: the server still refines for non-premium owners (distance
  // ranking) but flags the travel-time fairness upsell via X-Premium-Required.
  premiumRequired?: boolean;
  error?: string | null;
}

// A wider search re-runs discovery at 5km and surfaces more options; mirrors the
// "show more / wider radius" affordance from the plan.
const WIDE_RADIUS = 5000;
const WIDE_MAX_RESULTS = 10;

export default function RefineControl({
  currentLocationType,
  onRefine,
  refining = false,
  premiumRequired = false,
  error,
}: RefineControlProps) {
  const [open, setOpen] = useState(false);
  const [locationType, setLocationType] = useState(currentLocationType ?? 'Restaurant / Food');
  const [openNow, setOpenNow] = useState(false);
  const [widerArea, setWiderArea] = useState(false);

  const handleSubmit = () => {
    const params: RefineParams = { location_type: locationType };
    if (openNow) params.open_now = true;
    if (widerArea) {
      params.radius = WIDE_RADIUS;
      params.max_results = WIDE_MAX_RESULTS;
    }
    void onRefine(params);
  };

  return (
    <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-foreground">Refine results</span>
        <span className="text-muted-foreground text-sm">{open ? 'Hide' : 'Adjust search'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Re-run the search with new options. This updates the suggestions for both of you —
            no new invite is sent.
          </p>

          <LocationTypeSelector selectedType={locationType} onChange={setLocationType} disabled={refining} />

          <div className="flex flex-col gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={openNow}
                onChange={(e) => setOpenNow(e.target.checked)}
                disabled={refining}
                className="h-4 w-4 rounded border-border"
              />
              Only show places open now
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={widerArea}
                onChange={(e) => setWiderArea(e.target.checked)}
                disabled={refining}
                className="h-4 w-4 rounded border-border"
              />
              Search a wider area and show more options
            </label>
          </div>

          {premiumRequired && (
            <Alert variant="info" title="Travel-time fairness is a premium feature">
              Your results were refined using distance ranking. Upgrade to rank spots by fair
              driving time for both people.
            </Alert>
          )}
          {error && <p className="text-error text-sm">{error}</p>}

          <Button onClick={handleSubmit} disabled={refining}>
            {refining ? 'Refining…' : 'Refine results'}
          </Button>
        </div>
      )}
    </div>
  );
}
