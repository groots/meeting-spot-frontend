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

    // Try to get a more accurate position first with high accuracy
    // Fall back to less accurate position if that fails
    const getLocationWithFallback = () => {
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        () => {
          // If high accuracy fails, try again with lower accuracy
          console.log("High accuracy location failed, trying with lower accuracy...");
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
          );
        },
        geoOptions
      );
    };

    const handleSuccess = async (position: GeolocationPosition) => {
      try {
        const { latitude, longitude } = position.coords;
        console.log(`Got location coordinates: (${latitude}, ${longitude})`);
        
        // First, attempt to get a human-readable address from our backend
        const address = await reverseGeocodeCoordinates(latitude, longitude);
        
        // If we got a proper address, use it
        if (address) {
          console.log(`Converted coordinates to address: ${address}`);
          onLocationSuccess(address, latitude, longitude);
          return;
        }
        
        // If backend geocoding fails, try the fallback service
        try {
          const fallbackAddress = await fallbackReverseGeocodeCoordinates(latitude, longitude);
          if (fallbackAddress) {
            console.log(`Got address from fallback service: ${fallbackAddress}`);
            onLocationSuccess(fallbackAddress, latitude, longitude);
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback geocoding failed:', fallbackError);
        }
        
        // If all geocoding fails, use coordinates with a readable format
        console.log("All geocoding attempts failed, using formatted coordinates");
        const formattedCoords = `Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
        onLocationSuccess(formattedCoords, latitude, longitude);
      } catch (error) {
        console.error('Error processing location:', error);
        onLocationError('Failed to process your location. Please try entering your address manually.');
      } finally {
        setIsGettingLocation(false);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable location services in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Please try entering your address manually.';
          break;
        case error.TIMEOUT:
          errorMessage = 'The request to get location timed out. Please try again or enter your address manually.';
          break;
        default:
          errorMessage = 'An unknown error occurred while getting location. Please try entering your address manually.';
      }
      console.error(`Geolocation error: ${error.code} - ${error.message}`);
      onLocationError(errorMessage);
      setIsGettingLocation(false);
    };

    // Start the location process
    getLocationWithFallback();
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 w-full"
      onClick={handleGetLocation}
      disabled={isGettingLocation || isLoading}
      type="button" 
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
