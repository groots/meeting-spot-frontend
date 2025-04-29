'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MeetingIdRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    // Check if we have an ID parameter
    if (id) {
      console.log('Redirecting from /meetings/:id to /meeting/:id', id);
      // Redirect to the correct path format
      router.replace(`/meeting/${id}`);
    } else {
      console.log('No ID parameter, redirecting to dashboard');
      // Redirect to dashboard if no ID
      router.replace('/dashboard');
    }
  }, [id, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="ml-4">Redirecting...</p>
    </div>
  );
} 