'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS } from '../../../config';

export default function VerifyEmailPage({
  params,
}: {
  params: { token: string };
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.verifyEmail, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: params.token }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to verify email');
        }

        // Wait 3 seconds before redirecting
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [params.token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verifying your email...
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verification failed
            </h2>
            <div className="mt-2 text-center text-sm text-gray-600">
              {error}
            </div>
            <div className="mt-4 text-center">
              <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email verified successfully!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your email has been verified. Redirecting to login...
          </p>
        </div>
      </div>
    </div>
  );
}
