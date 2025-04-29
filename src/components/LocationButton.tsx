'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GOOGLE_MAPS_API_KEY } from '@/app/config';
import { reverseGeocodeCoordinates, fallbackReverseGeocodeCoordinates } from '@/utils/geocoding';

interface LocationButtonProps {
  onLocationSuccess: (address: string, lat: number, lon: number) => void;
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

    if (!navigator.geolocation) {
      onLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try to use our backend reverse geocoding service first
        try {
          // First, attempt to get a human-readable address from our backend
          const address = await reverseGeocodeCoordinates(latitude, longitude);
          
          // If we got a proper address, use it
          if (address) {
            console.log(`Converted coordinates (${latitude}, ${longitude}) to address: ${address}`);
            onLocationSuccess(address, latitude, longitude);
            setIsGettingLocation(false);
            return;
          }
          
          // If backend geocoding fails, instead of using the fallback which may have API key issues,
          // just use the formatted coordinates directly
          console.log("Backend reverse geocoding failed, using formatted coordinates");
          const formattedCoords = `Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
          onLocationSuccess(formattedCoords, latitude, longitude);
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
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get location timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
        }
        onLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 w-full"
      onClick={handleGetLocation}
      disabled={isGettingLocation || isLoading}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isGettingLocation ? 'animate-spin' : ''}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
      {isGettingLocation ? 'Getting Location...' : 'Use my current location'}
    </Button>
  );
}
