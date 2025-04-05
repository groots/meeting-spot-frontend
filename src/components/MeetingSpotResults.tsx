'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";

interface MeetingSpot {
  name: string;
  address: string;
  distance_a: number;
  distance_b: number;
  rating: number;
  total_ratings: number;
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
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Distance from you</p>
                <p className="text-lg font-semibold">
                  {spot.distance_a.toFixed(1)} miles
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Distance from them</p>
                <p className="text-lg font-semibold">
                  {spot.distance_b.toFixed(1)} miles
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-lg font-semibold">
                  {spot.rating} ({spot.total_ratings})
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