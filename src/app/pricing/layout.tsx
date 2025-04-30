import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing | Find A Meeting Spot',
  description: 'Choose the perfect pricing plan for your meeting coordination needs.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Simple Header with Logo and Login/Signup Links */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center">
          <div className="h-10 w-10 bg-accent rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="ml-2 font-bold text-xl">Find A Meeting Spot</span>
        </Link>

        <div className="flex gap-4">
          <Link
            href="/auth/register"
            className="btn-accent"
          >
            Sign up →
          </Link>
          <Link
            href="/auth/login"
            className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-hover transition-all"
          >
            Log in
          </Link>
        </div>
      </header>
      
      {children}
      
      {/* Simple Footer */}
      <footer className="bg-primary text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 bg-accent rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="ml-2 font-bold">Find A Meeting Spot</span>
          </div>
          <p className="text-sm opacity-80">© {new Date().getFullYear()} Find A Meeting Spot. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
} 