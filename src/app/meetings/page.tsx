'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { API_ENDPOINTS } from '@/app/config';
import { formatDistanceToNow } from 'date-fns';

// Define the MeetingRequest interface
interface MeetingRequest {
  id: string;
  request_id?: string; // Some APIs might return request_id instead of id
  status: string;
  user_b_contact: string;
  location_type: string;
  created_at: string;
  address_a?: string;
  address_b?: string;
  selected_place?: {
    id: string;
    name: string;
    address: string;
  };
}

export default function MeetingsPage() {
  const { user, token } = useAuth();
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetingRequests = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${API_ENDPOINTS.meetingRequests}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch meeting requests');
        }

        const data = await response.json();
        setMeetingRequests(data.requests || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching meeting requests:', err);
        setError('Failed to load your meeting requests. Please try again later.');
        setLoading(false);
      }
    };

    fetchMeetingRequests();
  }, [token]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING_B_ADDRESS':
        return { text: 'Waiting for other party', color: 'bg-yellow-100 text-yellow-800' };
      case 'PROCESSING':
        return { text: 'Finding meeting spots', color: 'bg-blue-100 text-blue-800' };
      case 'COMPLETED':
        return { text: 'Complete', color: 'bg-green-100 text-green-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Meetings</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <div data-testid="loading-spinner" className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : meetingRequests.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-600">You don't have any meeting requests yet.</p>
            <Link href="/request">
              <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
                Create a Meeting Request
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meeting With
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetingRequests.map((meeting) => {
                  const statusDisplay = getStatusDisplay(meeting.status);
                  return (
                    <tr key={meeting.id || meeting.request_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{meeting.user_b_contact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{meeting.location_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(meeting.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/meetings/${meeting.id || meeting.request_id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 