'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MeetingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    console.log('Redirecting from /meetings to /dashboard');
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="ml-4">Redirecting...</p>
    </div>
  );
} 