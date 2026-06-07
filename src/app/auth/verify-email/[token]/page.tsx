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
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
              Verifying your email...
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
              Verification failed
            </h2>
            <div className="mt-2 text-center text-sm text-muted-foreground">
              {error}
            </div>
            <div className="mt-4 text-center">
              <Link href="/auth/login" className="font-medium text-primary hover:text-primary-hover">
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Email verified successfully!
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Your email has been verified. Redirecting to login...
          </p>
        </div>
      </div>
    </div>
  );
}
