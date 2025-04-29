'use client';

import AppNavigation from "../components/navigation/AppNavigation";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AppNavigation />
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
} 