'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Find a Meeting Spot",
  description: "Find the perfect meeting location between two addresses",
  keywords: ["meeting spot", "location finder", "meeting place", "geocoding"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="py-10">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
