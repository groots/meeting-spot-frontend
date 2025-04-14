'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationButton from './LocationButton';

// Define categories matching backend
const PLACE_CATEGORIES = {
  "Accommodation": "Places to stay",
  "Food & Drink": "Places to eat and drink",
  "Night Life": "Bars, clubs, and entertainment",
  "Fun & Family": "Activities for everyone",
  "Cultural": "Museums, galleries, and attractions",
  "Shopping": "Retail and markets",
  "Transport": "Transportation hubs"
};

// Food subcategories 
const FOOD_SUBCATEGORIES = {
  "fine dining": "Upscale restaurants",
  "hole in the wall": "Hidden local gems",
  "cheap eats": "Budget-friendly options",
  "vegetarian": "Vegetarian and vegan-friendly",
  "outdoor seating": "Places with patios or terraces",
  "quick bite": "Fast service options"
};

interface CreateRequestFormProps {
  onSubmit: (data: {
    address_a: string;
    location_type: string;
    contact_method: string;
    contact_info: string;
    address_a_lat?: number;
    address_a_lon?: number;
  }) => Promise<void>;
}

export default function CreateRequestForm({ onSubmit }: CreateRequestFormProps) {
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState('Food & Drink');
  const [subcategory, setSubcategory] = useState('');
  const [contactMethod, setContactMethod] = useState('EMAIL');
  const [contactInfo, setContactInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get combined location type value
  const getLocationType = () => {
    if (category === 'Food & Drink' && subcategory) {
      return `${category}: ${subcategory}`;
    }
    return category;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter your address');
      return;
    }

    if (!contactInfo.trim()) {
      setError('Please enter your contact information');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const requestData: any = {
        address_a: address.trim(),
        location_type: getLocationType(),
        contact_method: contactMethod,
        contact_info: contactInfo.trim()
      };
      
      // If we have coordinates (from geolocation), add them
      if (latitude !== undefined && longitude !== undefined) {
        requestData.address_a_lat = latitude;
        requestData.address_a_lon = longitude;
      }
      
      await onSubmit(requestData);
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
    <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-card-foreground mb-6">Create Meeting Request</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address">Your Address</Label>
          <div className="space-y-2">
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
            <LocationButton 
              onLocationSuccess={handleLocationSuccess}
              onLocationError={handleLocationError}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              // Reset subcategory when changing category
              if (e.target.value !== 'Food & Drink') {
                setSubcategory('');
              }
            }}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          >
            {Object.entries(PLACE_CATEGORIES).map(([key, description]) => (
              <option key={key} value={key}>{key} - {description}</option>
            ))}
          </select>
        </div>

        {category === 'Food & Drink' && (
          <div className="space-y-2">
            <Label htmlFor="subcategory">Specific Food Preference</Label>
            <select
              id="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            >
              <option value="">Any food type</option>
              {Object.entries(FOOD_SUBCATEGORIES).map(([key, description]) => (
                <option key={key} value={key}>{key} - {description}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="contactMethod">Contact Method</Label>
          <select
            id="contactMethod"
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          >
            <option value="EMAIL">Email</option>
            <option value="PHONE">Phone</option>
            <option value="SMS">SMS</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactInfo">Contact Information</Label>
          <Input
            id="contactInfo"
            name="contactInfo"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder={contactMethod === 'EMAIL' ? 'Enter your email' : 'Enter your phone number'}
            type={contactMethod === 'EMAIL' ? 'email' : 'tel'}
            disabled={isLoading}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Request...
            </div>
          ) : (
            'Create Request'
          )}
        </Button>
      </form>
    </div>
  );
} 