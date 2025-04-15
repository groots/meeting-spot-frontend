'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from "../contexts/AuthContext";
import Navbar from './Navbar';
import Footer from '../../components/Footer';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        {!isHomePage && <Navbar />}
        <main className={`flex-grow ${!isHomePage ? "py-10" : ""}`}>
          {children}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
} 