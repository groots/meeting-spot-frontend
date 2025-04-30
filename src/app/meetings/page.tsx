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
    if (token) {
      fetchMeetingRequests();
    }
  }, [token]);

  const fetchMeetingRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.meetingRequests}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch meeting requests');
      }

      const data = await response.json();
      console.log('Meeting requests data:', data);
      setMeetingRequests(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching meeting requests:', err);
      setError('Could not load your meeting requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the correct ID (some APIs use id, others use request_id)
  const getRequestId = (request: MeetingRequest) => {
    return request.request_id || request.id;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'PENDING_B_ADDRESS':
        return 'bg-yellow-500';
      case 'PROCESSING':
        return 'bg-blue-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'DECLINED':
      case 'EXPIRED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Meetings</h1>
          <Link href="/meeting/new" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
            Create New Meeting
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-neutral-500">Loading your meeting requests...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-error">
              {error}
            </div>
          ) : meetingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-neutral-500">You don't have any meeting requests yet.</p>
              <Link href="/meeting/new" className="btn-primary mt-4 inline-block">
                Create Your First Meeting
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting Location</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {meetingRequests.map((request) => (
                    <tr key={getRequestId(request)} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusBadgeClass(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.user_b_contact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{request.location_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500" title={new Date(request.created_at).toLocaleString()}>
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.selected_place ? (
                          <div className="text-sm text-gray-900">{request.selected_place.name}</div>
                        ) : (
                          <div className="text-sm text-gray-500">Not yet determined</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/meetings/${getRequestId(request)}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 