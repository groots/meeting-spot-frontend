'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('[ProtectedRoute] 🔐 No authenticated user found, redirecting to login');
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) {
    // Enhanced loading state with staged loading indicator
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mb-4"></div>
        <div className="text-primary font-medium">Loading your profile...</div>
        <div className="text-muted-foreground text-sm mt-2">Please wait while we verify your session</div>
      </div>
    );
  }

  if (!user) {
    // Transitional message while redirecting
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-primary font-medium">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}
