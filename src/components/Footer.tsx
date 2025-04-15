'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © {currentYear} Find a Meeting Spot. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link href="/privacy-policy" className="text-sm hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-sm hover:text-white transition">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm hover:text-white transition">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 