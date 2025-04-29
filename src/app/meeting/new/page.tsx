'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function CreateMeetingPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Meeting</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-700 mb-4">
            This is where the meeting creation form would go. It would allow users to:
          </p>
          <ul className="list-disc ml-6 mb-6 text-gray-700">
            <li>Enter contact information</li>
            <li>Specify location type</li>
            <li>Input addresses or location data</li>
            <li>Set meeting preferences</li>
          </ul>
          
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <p className="text-yellow-800 font-medium">
              Form implementation coming soon!
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled
            >
              Create Meeting
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 