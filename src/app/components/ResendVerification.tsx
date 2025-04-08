'use client';

import { useState } from 'react';
import { API_ENDPOINTS } from '../config';

export default function ResendVerification({ email }: { email: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(API_ENDPOINTS.resendVerification, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to resend verification email');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-sm text-green-600">
        Verification email sent! Please check your inbox.
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={handleResend}
        disabled={isLoading}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Sending...' : 'Resend verification email'}
      </button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
} 