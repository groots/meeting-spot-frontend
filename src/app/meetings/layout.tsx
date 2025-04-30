'use client';

import AppNavigation from "../components/navigation/AppNavigation";

export default function MeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 