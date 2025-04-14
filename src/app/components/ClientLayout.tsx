'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from "../contexts/AuthContext";
import Navbar from './Navbar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <AuthProvider>
      <div className={`min-h-screen ${isHomePage ? 'bg-neutral-50' : 'bg-gray-100'}`}>
        {!isHomePage && <Navbar />}
        <main className={!isHomePage ? "py-10" : ""}>
          {children}
        </main>
      </div>
    </AuthProvider>
  );
} 