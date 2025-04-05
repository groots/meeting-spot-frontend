'use client';

import { useEffect, useState } from 'react';

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
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {spot.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{spot.address}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Distance from you</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {spot.distance_a.toFixed(1)} miles
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Distance from them</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {spot.distance_b.toFixed(1)} miles
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {spot.rating} ({spot.total_ratings})
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleOpenInMaps(spot.address)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Open in Maps
              </button>
              <button
                onClick={() => handleOpenInMaps(spot.address)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Get Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 