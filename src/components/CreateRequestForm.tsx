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

// Multistep form component
export default function CreateRequestForm({ onSubmit }: CreateRequestFormProps) {
  // Form state
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState(Object.keys(PLACE_CATEGORIES)[0]);
  const [subcategory, setSubcategory] = useState(FOOD_SUBCATEGORIES[0]);
  const [contactMethod, setContactMethod] = useState('EMAIL');
  const [contactInfo, setContactInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  
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

  // Form progress bar
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex mb-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div 
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2 ${
                currentStep === step 
                  ? 'bg-lime-500 text-white border-lime-500' 
                  : currentStep > step 
                    ? 'bg-lime-100 text-lime-700 border-lime-200' 
                    : 'bg-gray-100 text-gray-500 border-gray-300'
              }`}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div 
                className={`h-1 w-12 sm:w-20 md:w-32 ${
                  currentStep > step ? 'bg-lime-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <div className="w-16">Location</div>
        <div className="w-16 text-center">Preferences</div>
        <div className="w-16 text-right">Contact</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
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
            
            <div className="flex justify-end mt-6">
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canAdvanceStep1}
                className="bg-lime-500 hover:bg-lime-600"
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
            
            <div className="space-y-2">
              <Label htmlFor="category">Place Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              >
                {Object.entries(PLACE_CATEGORIES).map(([key, description]) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">{PLACE_CATEGORIES[category as keyof typeof PLACE_CATEGORIES]}</p>
            </div>

            {category === 'Food & Drink' && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="subcategory">Specific Food Preference</Label>
                <select
                  id="subcategory"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                className="border-lime-500 text-lime-600"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canAdvanceStep2}
                className="bg-lime-500 hover:bg-lime-600"
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
                className="border-lime-500 text-lime-600"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !canAdvanceStep3}
                className="bg-lime-500 hover:bg-lime-600"
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