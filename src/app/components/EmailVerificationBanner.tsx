'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config';

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show for logged-in users whose email is not yet verified.
  if (!user || user.email_verified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.resendVerification, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to resend verification email');
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-warning/10 border-b border-warning/20">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center text-sm text-warning">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {sent ? (
            <span>Verification email sent. Please check your inbox.</span>
          ) : (
            <span>Please verify your email address to secure your account.</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!sent && (
            <button
              onClick={handleResend}
              disabled={isSending}
              className="text-sm font-medium text-warning underline hover:text-warning/80 disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Resend email'}
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-warning hover:text-warning/80"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {error && (
        <div className="max-w-7xl mx-auto px-4 pb-2 sm:px-6 lg:px-8 text-sm text-error">{error}</div>
      )}
    </div>
  );
}
