'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationButton from './LocationButton';

interface RespondToRequestFormProps {
  token: string;
  onSubmit: (data: { 
    address_b: string; 
    address_b_lat?: number;
    address_b_lon?: number;
  }) => Promise<void>;
}

export default function RespondToRequestForm({ token, onSubmit }: RespondToRequestFormProps) {
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter your address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const submitData: any = { address_b: address.trim() };
      
      // If we have coordinates (from geolocation), add them
      if (latitude !== undefined && longitude !== undefined) {
        submitData.address_b_lat = latitude;
        submitData.address_b_lon = longitude;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle location success from the LocationButton
  const handleLocationSuccess = (address: string, lat: number, lng: number) => {
    setAddress(address);
    setLatitude(lat);
    setLongitude(lng);
    setError(null);
  };

  // Handle location error from the LocationButton
  const handleLocationError = (errorMessage: string) => {
    setError(`Location error: ${errorMessage}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address">Your Address</Label>
          <Input
            id="address"
            name="address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              // Clear coordinates if user manually changes the address
              if (latitude !== undefined || longitude !== undefined) {
                setLatitude(undefined);
                setLongitude(undefined);
              }
            }}
            placeholder="Enter your address"
            disabled={isLoading}
          />
          
          <div className="mt-2">
            <LocationButton
              onLocationSuccess={handleLocationSuccess}
              onLocationError={handleLocationError}
              isLoading={isLoading}
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </div>
          ) : (
            'Submit Address'
          )}
        </Button>
      </form>
    </div>
  );
} 