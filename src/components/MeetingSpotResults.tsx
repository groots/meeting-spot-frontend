'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";

interface MeetingSpot {
  name: string;
  address: string;
  distance: number | null; // kilometers from the midpoint
  rating: number | null;
  user_ratings_total: number | null;
}

interface MeetingSpotResultsProps {
  spots: MeetingSpot[];
}

export default function MeetingSpotResults({ spots }: MeetingSpotResultsProps) {
  const handleOpenInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-6">
        {spots.map((spot, index) => (
          <div key={index} className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">
              {spot.name}
            </h3>
            <p className="text-muted-foreground mb-4">{spot.address}</p>

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

            <div className="flex space-x-4">
              <Button
                onClick={() => handleOpenInMaps(spot.address)}
                className="flex-1"
              >
                Open in Maps
              </Button>
              <Button
                onClick={() => handleOpenInMaps(spot.address)}
                variant="secondary"
                className="flex-1"
              >
                Get Directions
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
