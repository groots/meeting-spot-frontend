'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { API_ENDPOINTS } from './config';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import CreateRequestForm from '@/components/CreateRequestForm';

interface CreateRequestData {
  address_a: string;
  location_type: string;
  user_b_contact_type: string;
  user_b_contact: string;
}

interface FormData {
  address_a: string;
  location_type: string;
  contact_method: string;
  contact_info: string;
}

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleCreateRequest = async (data: CreateRequestData) => {
    if (!token) {
      setError('Not authenticated');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.meetingRequests, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create meeting request');
      }

      const result = await response.json();
      router.push(`/waiting/${result.request_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Error
            </h1>
            <div className="max-w-md mx-auto p-6 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Find a Meeting Spot
            </h1>
            <p className="text-xl text-secondary mb-12">
              Enter your details to find a convenient meeting location
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <CreateRequestForm onSubmit={async (formData: FormData) => {
              await handleCreateRequest({
                address_a: formData.address_a,
                location_type: formData.location_type,
                user_b_contact_type: formData.contact_method,
                user_b_contact: formData.contact_info,
              });
            }} />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
