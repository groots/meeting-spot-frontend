'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateRequestFormProps {
  onSubmit: (data: {
    address_a: string;
    location_type: string;
    contact_method: string;
    contact_info: string;
  }) => Promise<void>;
}

export default function CreateRequestForm({ onSubmit }: CreateRequestFormProps) {
  const [address, setAddress] = useState('');
  const [locationType, setLocationType] = useState('restaurant');
  const [contactMethod, setContactMethod] = useState('email');
  const [contactInfo, setContactInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await onSubmit({
        address_a: address.trim(),
        location_type: locationType,
        contact_method: contactMethod,
        contact_info: contactInfo.trim()
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-card-foreground mb-6">Create Meeting Request</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address">Your Address</Label>
          <Input
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationType">Preferred Location Type</Label>
          <select
            id="locationType"
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          >
            <option value="restaurant">Restaurant</option>
            <option value="cafe">Cafe</option>
            <option value="park">Park</option>
            <option value="library">Library</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactMethod">Contact Method</Label>
          <select
            id="contactMethod"
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactInfo">Contact Information</Label>
          <Input
            id="contactInfo"
            name="contactInfo"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder={contactMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
            type={contactMethod === 'email' ? 'email' : 'tel'}
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