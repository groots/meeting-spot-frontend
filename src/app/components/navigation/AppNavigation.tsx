'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Create Meeting", href: "/create" },
  { name: "Contacts", href: "/contacts" },
  { name: "Subscription", href: "/subscription" },
  { name: "Profile", href: "/profile" }
];

export default function AppNavigation() {
  const pathname = usePathname() || '';
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="bg-white shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-lg font-bold text-indigo-600">
              Find a Meeting Spot
            </Link>
          </div>
          
          <div className="flex space-x-8 h-16 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || 
                              (link.href !== '/dashboard' && pathname.startsWith(link.href));
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive 
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 