'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationButton from './LocationButton';
import ContactSelector from './ContactSelector';

// Define categories matching backend
export const PLACE_CATEGORIES = {
  "Restaurant / Food": "A food establishment serving sit-down meals",
  "Cafe": "A place primarily serving coffee and light refreshments",
  "Bar": "A place serving alcoholic beverages",
  "Meeting Space": "A shared office or meeting room",
  "Hotel": "Accommodation with meeting facilities",
  "Park": "An outdoor recreational area or garden",
  "Library": "A quiet public space with study areas",
  "Other": "Any other type of meeting location"
};

// Define specific subcategories for food preference
export const FOOD_SUBCATEGORIES = [
  "Any Food",
  "American",
  "Italian",
  "Chinese",
  "Mexican",
  "Japanese",
  "Thai",
  "Indian",
  "Mediterranean",
  "Vegetarian/Vegan",
  "Fast Food",
  "Bakery",
  "Seafood",
  "BBQ/Steakhouse",
  "Pizza",
  "Brunch/Breakfast",
  "Other"
];

export interface CreateRequestFormProps {
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
  const [category, setCategory] = useState(Object.keys(PLACE_CATEGORIES)[0]);
  const [subcategory, setSubcategory] = useState(FOOD_SUBCATEGORIES[0]);
  const [contactMethod, setContactMethod] = useState('EMAIL');
  const [contactInfo, setContactInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!address) {
      setError('Please enter your address');
      setIsLoading(false);
      return;
    }

    if (!contactInfo) {
      setError('Please enter contact information');
      setIsLoading(false);
      return;
    }

    try {
      const locationType = category === 'Food & Drink' ? subcategory : category;
      
      await onSubmit({
        address_a: address,
        location_type: locationType,
        contact_method: contactMethod,
        contact_info: contactInfo,
        ...(coords.lat && coords.lon ? { 
          address_a_lat: coords.lat, 
          address_a_lon: coords.lon 
        } : {})
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to create meeting request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSuccess = (address: string, lat: number, lng: number) => {
    setAddress(address);
    setCoords({ lat, lon: lng });
  };

  const handleLocationError = (errorMessage: string) => {
    setError(`Location error: ${errorMessage}`);
  };

  const handleContactChange = (info: string, method: string) => {
    setContactInfo(info);
    setContactMethod(method);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Create Meeting Request</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address">Your Address</Label>
          <div className="space-y-2">
            <Input
              id="address"
              name="address"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
            onChange={(e) => setCategory(e.target.value)}
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
              {FOOD_SUBCATEGORIES.map((subcat) => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>
        )}

        <div className="border-t border-gray-200 my-6 pt-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <ContactSelector
            onChange={handleContactChange}
            defaultContactType={contactMethod}
            defaultContactInfo={contactInfo}
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