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
  const [resendLoading, setResendLoading] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

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

  const resendInvitation = async (id: string) => {
    try {
      setResendLoading(id);
      setResendMessage(null);
      const response = await fetch(API_ENDPOINTS.meetingRequestResendInvitation(id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to resend invitation');
      }

      setResendMessage('Invitation resent successfully.');
    } catch (err) {
      console.error('Error resending invitation:', err);
      setResendMessage('Could not resend the invitation. Please try again later.');
    } finally {
      setResendLoading(null);
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
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <Link href="/create" className="btn-accent">
            Create New Meeting
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Summary Cards */}
          <div className="rounded-xl bg-gradient-primary p-6 text-primary-foreground shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Welcome Back</h3>
            <p className="opacity-90">{user?.email}</p>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-2 text-foreground">Active Meetings</h3>
            <p className="text-4xl font-bold text-accent">
              {loading ? '...' : meetingRequests.filter(req => req.status !== 'COMPLETED').length}
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-2 text-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/create" className="block text-primary hover:underline">
                Create a meeting
              </Link>
              <Link href="/profile" className="block text-primary hover:underline">
                View profile
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Your Meeting Requests</h2>

          {resendMessage && (
            <div className="mb-4 rounded-lg bg-surface-muted p-3 text-sm text-foreground">
              {resendMessage}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading your meeting requests...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-error">
              {error}
            </div>
          ) : meetingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">You don't have any meeting requests yet.</p>
              <Link href="/create" className="btn-primary mt-4 inline-block">
                Create Your First Meeting
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Location Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {meetingRequests.map((request) => {
                    const requestId = getRequestId(request);
                    return (
                      <tr key={requestId} className="hover:bg-surface-muted">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'PENDING' ? 'bg-warning/15 text-warning' :
                            request.status === 'ACCEPTED' ? 'bg-info/15 text-info' :
                            request.status === 'DECLINED' ? 'bg-error/15 text-error' :
                            request.status === 'COMPLETED' ? 'bg-success/15 text-success' :
                            'bg-surface-muted text-muted-foreground'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-foreground">
                          {request.user_b_contact}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-foreground">
                          {request.location_type}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
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
                              <span className="text-muted-foreground">ID Missing</span>
                            )}
                            {requestId && request.status === 'PENDING' && (
                              <button
                                onClick={() => resendInvitation(requestId)}
                                disabled={resendLoading === requestId}
                                className="text-primary hover:underline disabled:opacity-50"
                              >
                                {resendLoading === requestId ? 'Resending...' : 'Resend Invite'}
                              </button>
                            )}
                            <button
                              onClick={() => deleteMeetingRequest(requestId)}
                              disabled={deleteLoading === requestId}
                              className="text-error hover:underline disabled:opacity-50"
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
