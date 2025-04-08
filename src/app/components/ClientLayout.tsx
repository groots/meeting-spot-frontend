'use client';

import { AuthProvider } from "../contexts/AuthContext";
import Navbar from './Navbar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="py-10">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
} 