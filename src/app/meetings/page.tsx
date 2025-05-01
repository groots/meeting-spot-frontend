'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { API_ENDPOINTS } from '@/app/config';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { apiGet, getMeetingRequestsWithContacts } from '@/app/utils/api';

// Define the MeetingRequest interface
interface MeetingRequest {
  id: string;
  request_id?: string; // Some APIs might return request_id instead of id
  status: string;
  user_b_contact: string;
  user_b_contact_type?: string;
  location_type: string;
  created_at: string;
  address_a?: string;
  address_b?: string;
  selected_place?: {
    id: string;
    name: string;
    address: string;
  };
  // Add fields for contact information
  user_b_contact_details?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

type SortField = 'status' | 'contact' | 'location_type' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function MeetingsPage() {
  const { user, token } = useAuth();
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Items per page constant
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchMeetingRequests = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      const { data, error: apiError } = await getMeetingRequestsWithContacts();
      
      console.log('API Response with contacts:', data);
      
      if (apiError) {
        console.error('Error fetching meeting requests:', apiError);
        setError(apiError);
        setLoading(false);
        return;
      }

      if (data && Array.isArray(data)) {
        // Log the first meeting request to examine its structure
        if (data.length > 0) {
          console.log('First meeting request:', data[0]);
        }
        setMeetingRequests(data);
      } else {
        // If data is not an array, set to empty array
        setMeetingRequests([]);
      }
      
      setLoading(false);
    };

    fetchMeetingRequests();
  }, [token]);

  const getStatusDisplay = (status: string) => {
    // Convert status to uppercase for consistent handling
    const normalizedStatus = status.toUpperCase();
    
    switch (normalizedStatus) {
      case 'PENDING_B_ADDRESS':
        return { text: 'Awaiting Address', color: 'bg-yellow-100 text-yellow-800' };
      case 'CALCULATING':
        return { text: 'Finding Spots', color: 'bg-blue-100 text-blue-800' };
      case 'PROCESSING':
        return { text: 'Processing Suggestions', color: 'bg-blue-100 text-blue-800' };
      case 'COMPLETED':
        return { text: 'Complete', color: 'bg-green-100 text-green-800' };
      case 'EXPIRED':
        return { text: 'Expired', color: 'bg-gray-100 text-gray-800' };
      case 'FAILED':
        return { text: 'Failed', color: 'bg-red-100 text-red-800' };
      default:
        // Attempt to make raw status more readable
        return { 
          text: status.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()), 
          color: 'bg-gray-100 text-gray-800' 
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Log the raw date string for debugging
      console.log('Raw date string:', dateString);
      
      // Try to parse the date with different methods
      let date;
      try {
        date = parseISO(dateString);
      } catch (e) {
        // Fallback to regular Date parsing
        date = new Date(dateString);
      }
      
      // Log the parsed date
      console.log('Parsed date:', date);
      
      const now = new Date();
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing failed
      }
      
      // For dates in the future (for scheduled meetings)
      if (date > now) {
        return `Scheduled for ${format(date, 'MMM d, yyyy')}`;
      }
      
      // For dates in the past (created dates)
      const distance = formatDistanceToNow(date, { addSuffix: false });
      return `${distance} ago`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle sort direction if clicking on the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending order
      setSortField(field);
      setSortDirection('asc');
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
    } catch (error) {
      console.error('Error deleting meeting request:', error);
      alert('Could not delete the meeting request. Please try again later.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const sortedMeetingRequests = [...meetingRequests].sort((a, b) => {
    if (sortField === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'status') {
      return sortDirection === 'asc' 
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    } else if (sortField === 'contact') {
      const contactA = a.user_b_contact_details?.name || a.user_b_contact || '';
      const contactB = b.user_b_contact_details?.name || b.user_b_contact || '';
      return sortDirection === 'asc'
        ? contactA.localeCompare(contactB)
        : contactB.localeCompare(contactA);
    } else if (sortField === 'location_type') {
      return sortDirection === 'asc'
        ? a.location_type.localeCompare(b.location_type)
        : b.location_type.localeCompare(a.location_type);
    }
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedMeetingRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = sortedMeetingRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Create pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        
        <span className="px-3 py-1 text-sm">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  const SortableHeader = ({ field, label }: { field: SortField, label: string }) => {
    const isSorted = sortField === field;
    
    return (
      <th 
        scope="col" 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          <span className="inline-block">
            {isSorted && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {sortDirection === 'asc' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Meeting Requests</h1>
        
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
            <Link href="/create">
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
                  <SortableHeader field="status" label="Status" />
                  <SortableHeader field="contact" label="Contact" />
                  <SortableHeader field="location_type" label="Location Type" />
                  <SortableHeader field="created_at" label="Created" />
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRequests.map((meeting) => {
                  // Ensure we have a valid status
                  const meetingStatus = meeting.status || 'unknown';
                  const statusDisplay = getStatusDisplay(meetingStatus);
                  
                  // Get meeting ID safely
                  const meetingId = meeting.id || meeting.request_id || '';
                  
                  // Get contact information safely
                  const contactName = meeting.user_b_contact_details?.name || null;
                  const contactEmail = meeting.user_b_contact_details?.email || meeting.user_b_contact || '';
                  const contactPhone = meeting.user_b_contact_details?.phone || null;
                  
                  return (
                    <tr key={meetingId}>
                      {/* Status Cell */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </span>
                      </td>
                      
                      {/* Contact Cell */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contactName || contactEmail || 'Unknown'}
                        </div>
                        {contactName && contactEmail && (
                          <div className="text-xs text-gray-500">
                            {contactEmail}
                          </div>
                        )}
                        {contactPhone && (
                          <div className="text-xs text-gray-500">
                            {contactPhone}
                          </div>
                        )}
                      </td>
                      
                      {/* Location Type Cell */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{meeting.location_type || 'Not specified'}</div>
                      </td>
                      
                      {/* Created Date Cell */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {meeting.created_at ? formatDate(meeting.created_at) : 'Unknown'}
                      </td>
                      
                      {/* Actions Cell */}
                      <td className="px-6 py-4 whitespace-nowrap flex space-x-4">
                        <Link
                          href={`/meetings/${meetingId}`}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View Details
                        </Link>
                        <button
                          onClick={() => deleteMeetingRequest(meetingId)}
                          disabled={!!deleteLoading}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          {deleteLoading === meetingId ? (
                            <svg className="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <Pagination />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 