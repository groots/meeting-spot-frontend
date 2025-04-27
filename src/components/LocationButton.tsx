'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { GOOGLE_MAPS_API_KEY } from '@/app/config';

interface LocationButtonProps {
  onLocationSuccess: (address: string, lat: number, lng: number) => void;
  onLocationError: (error: string) => void;
  isLoading?: boolean;
}

export default function LocationButton({
  onLocationSuccess,
  onLocationError,
  isLoading = false,
}: LocationButtonProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetLocation = () => {
    setIsGettingLocation(true);

    // Debug log to check API key
    console.log('Using Google Maps API Key:', GOOGLE_MAPS_API_KEY);

    // Check if geolocation is available in the browser
    if (!navigator.geolocation) {
      setIsGettingLocation(false);
      onLocationError('Geolocation is not supported by your browser');
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Google Maps Geocoding API to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
          );
          
          const data = await response.json();
          
          if (data.status === 'OK' && data.results.length > 0) {
            // Find the most appropriate address result
            let address = data.results[0].formatted_address;
            
            // Look for a result that contains a street address if available
            for (const result of data.results) {
              const addressTypes = result.types || [];
              if (
                addressTypes.includes('street_address') || 
                addressTypes.includes('route') ||
                addressTypes.includes('premise')
              ) {
                address = result.formatted_address;
                break;
              }
            }
            
            console.log(`Converted coordinates (${latitude}, ${longitude}) to address: ${address}`);
            onLocationSuccess(address, latitude, longitude);
          } else {
            // If geocoding fails, use coordinates but format them nicely
            console.warn(`Geocoding failed with status: ${data.status}`, data);
            const formattedCoords = `Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
            onLocationSuccess(formattedCoords, latitude, longitude);
          }
        } catch (error) {
          console.error('Error getting address:', error);
          // If geocoding fails, use coordinates but format them nicely
          const formattedCoords = `Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
          onLocationSuccess(formattedCoords, latitude, longitude);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            onLocationError('User denied the request for geolocation');
            break;
          case error.POSITION_UNAVAILABLE:
            onLocationError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            onLocationError('The request to get user location timed out');
            break;
          default:
            onLocationError('An unknown error occurred');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="flex items-center gap-2"
      onClick={handleGetLocation}
      disabled={isGettingLocation || isLoading}
    >
      <MapPinIcon className="h-4 w-4" />
      {isGettingLocation ? 'Getting location...' : 'Use my current location'}
    </Button>
  );
} 