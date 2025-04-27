'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  
  // Extract first name from email
  const getFirstName = () => {
    if (!user || !user.email) return 'User';
    
    // If email contains a plus sign, take the part before it
    const emailParts = user.email.split('@')[0].split('+');
    const username = emailParts[0];
    
    // If username contains dots or underscores, replace with spaces
    const nameWithSpaces = username.replace(/[._]/g, ' ');
    
    // Capitalize first letter of each word
    const words = nameWithSpaces.split(' ');
    const capitalizedWords = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    
    return capitalizedWords.join(' ');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                Find a Meeting Spot
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  href="/create"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Create Meeting
                </Link>
                <Link 
                  href="/contacts" 
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Contacts
                </Link>
                <Link 
                  href="/subscription" 
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Subscription
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {getFirstName()}</span>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 