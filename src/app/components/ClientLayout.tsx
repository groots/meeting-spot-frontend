'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import Footer from '../../components/Footer';
import AppNavigation from './navigation/AppNavigation';

// Wrapper component that delays rendering until auth state is determined
function AuthStateWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // If not loading or after 2 seconds max, show content regardless
    if (!loading) {
      setShowContent(true);
    }

    // Safety timeout to ensure content is shown even if loading gets stuck
    const timer = setTimeout(() => setShowContent(true), 2000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (!showContent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-lime-500 border-solid rounded-full border-t-transparent animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading app...</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <AuthProvider>
      <AuthStateWrapper>
        <div className="min-h-screen flex flex-col">
          {!isHomePage && <AppNavigation />}
          <main className={`flex-grow ${!isHomePage ? "py-10" : ""}`}>
            {children}
          </main>
          <Footer />
        </div>
      </AuthStateWrapper>
    </AuthProvider>
  );
}
