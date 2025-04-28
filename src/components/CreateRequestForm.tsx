'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationButton from './LocationButton';
import ContactSelector from './ContactSelector';
import LocationTypeSelector from './LocationTypeSelector';
import { geocodeAddress, fallbackGeocodeAddress } from '@/utils/geocoding';

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

// Multistep form component
export default function CreateRequestForm({ onSubmit }: CreateRequestFormProps) {
  // Form state
  const [address, setAddress] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [category, setCategory] = useState(Object.keys(PLACE_CATEGORIES)[0]);
  const [subcategory, setSubcategory] = useState(FOOD_SUBCATEGORIES[0]);
  const [contactMethod, setContactMethod] = useState('EMAIL');
  const [contactInfo, setContactInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [geocodingInProgress, setGeocodingInProgress] = useState(false);

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Step validation
  const canAdvanceStep1 = !!address;
  const canAdvanceStep2 = true; // Category always has a default value
  const canAdvanceStep3 = !!contactInfo;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!address) {
      setError('Please enter your address');
      setIsLoading(false);
      setCurrentStep(1);
      return;
    }

    if (!contactInfo) {
      setError('Please enter contact information');
      setIsLoading(false);
      setCurrentStep(3);
      return;
    }

    // Ensure coordinates are present
    if (!coords.lat || !coords.lon) {
      setError('Location coordinates are missing. Please use the "Get Current Location" button or enter a valid address.');
      setIsLoading(false);
      setCurrentStep(1);
      return;
    }

    try {
      const locationType = category === 'Food & Drink' ? subcategory : category;

      await onSubmit({
        address_a: address,
        location_type: locationType,
        contact_method: contactMethod,
        contact_info: contactInfo,
        address_a_lat: coords.lat,
        address_a_lon: coords.lon
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to create meeting request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSuccess = (address: string, lat: number, lng: number) => {
    setAddress(address);
    setAddressInput(address);
    setCoords({ lat, lon: lng });
  };

  const handleLocationError = (errorMessage: string) => {
    setError(`Location error: ${errorMessage}`);
  };

  const handleContactChange = (info: string, method: string) => {
    setContactInfo(info);
    setContactMethod(method);
  };

  // Debounced geocoding when address changes
  useEffect(() => {
    // Skip empty addresses and avoid geocoding when already in progress
    if (!addressInput || geocodingInProgress) return;

    // Set a timeout to avoid too many API calls
    const timeoutId = setTimeout(async () => {
      setGeocodingInProgress(true);
      try {
        // Try to use our backend geocoding service first
        let result = await geocodeAddress(addressInput);

        // If backend geocoding fails, try fallback to direct Google Maps API
        if (!result) {
          console.log("Backend geocoding failed, trying fallback...");
          result = await fallbackGeocodeAddress(addressInput);
        }

        if (result) {
          setAddress(addressInput);
          setCoords({ lat: result.lat, lon: result.lng });
          setError(''); // Clear any previous error
        } else {
          setError('Unable to find coordinates for this address. Please try a different address or use the "Get Current Location" button.');
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setError('Error looking up address. Please try again or use the "Get Current Location" button.');
      } finally {
        setGeocodingInProgress(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [addressInput]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
  };

  // Form progress bar
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 mt-2 text-right">{`Step ${currentStep} of ${totalSteps}`}</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold mb-2 text-center">Create Meeting Request</h1>
      <p className="text-gray-600 text-center mb-6">Find the perfect middle ground between you and a contact</p>

      <ProgressBar />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Location */}
        {currentStep === 1 && (
          <div className="space-y-4 min-h-[240px]">
            <h2 className="text-xl font-semibold">Step 1: Your Location</h2>
            <p className="text-gray-600 mb-4">Enter your starting location</p>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700">Your Address</Label>
              <div className="space-y-2">
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter your address"
                  value={addressInput}
                  onChange={handleAddressChange}
                  disabled={isLoading}
                  className="border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200"
                />
                {geocodingInProgress && (
                  <p className="text-xs text-blue-600">Looking up location...</p>
                )}
                {coords.lat && coords.lon && (
                  <p className="text-xs text-green-600">✓ Coordinates found</p>
                )}
                <LocationButton
                  onLocationSuccess={handleLocationSuccess}
                  onLocationError={handleLocationError}
                  isLoading={isLoading || geocodingInProgress}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canAdvanceStep1}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:shadow-none"
              >
                Next Step
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {currentStep === 2 && (
          <div className="space-y-4 min-h-[240px]">
            <h2 className="text-xl font-semibold">Step 2: Meeting Preferences</h2>
            <p className="text-gray-600 mb-4">Select what type of place you'd like to meet at</p>

            <LocationTypeSelector
              selectedType={category}
              onChange={setCategory}
              disabled={isLoading}
            />

            {category === 'Food & Drink' && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="subcategory" className="text-gray-700">Specific Food Preference</Label>
                <select
                  id="subcategory"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  disabled={isLoading}
                >
                  {FOOD_SUBCATEGORIES.map((subcat) => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canAdvanceStep2}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:shadow-none"
              >
                Next Step
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Information */}
        {currentStep === 3 && (
          <div className="space-y-4 min-h-[240px]">
            <h2 className="text-xl font-semibold">Step 3: Contact Information</h2>
            <p className="text-gray-600 mb-4">How should your contact reach you?</p>

            <ContactSelector
              onChange={handleContactChange}
              defaultContactType={contactMethod}
              defaultContactInfo={contactInfo}
            />

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !canAdvanceStep3}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Meeting'
                )}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
