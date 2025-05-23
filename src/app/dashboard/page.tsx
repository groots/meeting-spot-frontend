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
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

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

  const deleteMeetingRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting request?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      const response = await fetch(`${API_ENDPOINTS.meetingRequests}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete meeting request');
      }

      // Remove the deleted meeting request from the state
      setMeetingRequests(prevRequests => 
        prevRequests.filter(request => (request.id !== id && request.request_id !== id))
      );
    } catch (err) {
      console.error('Error deleting meeting request:', err);
      alert('Could not delete the meeting request. Please try again later.');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Helper function to get the correct ID (some APIs use id, others use request_id)
  const getRequestId = (request: MeetingRequest) => {
    // Make sure we have a valid ID and log the values for debugging
    const id = request.request_id || request.id;
    console.log('Request:', request);
    console.log('ID value:', id);
    return id;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/meeting/new" className="btn-accent">
            Create New Meeting
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Summary Cards */}
          <div className="card bg-primary text-white">
            <h3 className="text-xl font-semibold mb-2">Welcome Back</h3>
            <p>{user?.email}</p>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Active Meetings</h3>
            <p className="text-4xl font-bold text-accent">
              {loading ? '...' : meetingRequests.filter(req => req.status !== 'COMPLETED').length}
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/meeting/new" className="block text-primary hover:underline">
                Create a meeting
              </Link>
              <Link href="/profile" className="block text-primary hover:underline">
                View profile
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Your Meeting Requests</h2>

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
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Location Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {meetingRequests.map((request) => {
                    const requestId = getRequestId(request);
                    return (
                      <tr key={requestId} className="hover:bg-neutral-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'PENDING' ? 'bg-purple-light text-white' :
                            request.status === 'ACCEPTED' ? 'bg-info text-white' :
                            request.status === 'DECLINED' ? 'bg-error text-white' :
                            request.status === 'COMPLETED' ? 'bg-success text-white' :
                            'bg-neutral-200 text-neutral-700'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {request.user_b_contact}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {request.location_type}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex space-x-4">
                            {requestId ? (
                              <Link
                                href={`/meeting/${requestId}`}
                                className="text-primary hover:underline"
                              >
                                View Details
                              </Link>
                            ) : (
                              <span className="text-gray-400">ID Missing</span>
                            )}
                            <button
                              onClick={() => deleteMeetingRequest(requestId)}
                              disabled={deleteLoading === requestId}
                              className="text-red-500 hover:underline"
                            >
                              {deleteLoading === requestId ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
