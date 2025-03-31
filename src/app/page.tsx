'use client';

import { useState } from 'react';
import CreateRequestForm from '@/components/CreateRequestForm';
import RespondToRequestForm from '@/components/RespondToRequestForm';
import RequestStatus from '@/components/RequestStatus';
import MeetingSpotResults from '@/components/MeetingSpotResults';

export default function Home() {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);

  const handleCreateRequest = async (data: {
    address_a: string;
    location_type: string;
    user_b_contact_type: string;
    user_b_contact: string;
  }) => {
    try {
      const response = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      const result = await response.json();
      setRequestId(result.request_id);
      setToken(result.user_b_token);
      setShowResponseForm(true);
    } catch (error) {
      throw error;
    }
  };

  const handleRespondToRequest = async (data: { address_b: string }) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/v1/respond/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      setShowResponseForm(false);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Find a Meeting Spot
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find the perfect meeting location between two addresses
          </p>
        </div>

        {!requestId ? (
          <CreateRequestForm onSubmit={handleCreateRequest} />
        ) : (
          <div className="space-y-8">
            <RequestStatus requestId={requestId} />
            
            {showResponseForm && (
              <RespondToRequestForm
                token={token!}
                onSubmit={handleRespondToRequest}
              />
            )}

            <MeetingSpotResults requestId={requestId} />
          </div>
        )}
      </div>
    </div>
  );
}
