'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/app/config';

// Define the MeetingRequest interface
interface MeetingRequest {
  id: string;
  status: string;
  created_at: string;
}

export default function DevToolsPage() {
  const { token, user } = useAuth();
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
      setMeetingRequests(data);
    } catch (err) {
      console.error('Error fetching meeting requests:', err);
      setError('Could not load meeting requests');
    } finally {
      setLoading(false);
    }
  };

  const getRespondUrl = (requestId: string) => {
    // Base URL - replace with your actual domain in development
    const baseUrl = window.location.origin;
    return `${baseUrl}/respond/${requestId}`;
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  if (!user) {
    return <div className="container mx-auto p-4">Please log in to access developer tools.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Developer Tools</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Meeting Requests</h2>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : meetingRequests.length === 0 ? (
          <div>No meeting requests found. Try creating some first.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User B Link</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetingRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(request.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={getRespondUrl(request.id)}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Open
                        </Link>
                        <button
                          onClick={() => copyToClipboard(getRespondUrl(request.id))}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
