'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RespondToRequestFormProps {
  token: string;
  onSubmit: (data: { address_b: string }) => Promise<void>;
}

export default function RespondToRequestForm({ token, onSubmit }: RespondToRequestFormProps) {
  const [address, setAddress] = useState('');
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
      await onSubmit({ address_b: address.trim() });
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      setIsLoading(false);
    }
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
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            disabled={isLoading}
          />
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