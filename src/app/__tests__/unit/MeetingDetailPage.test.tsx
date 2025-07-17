import { render, screen, waitFor } from '@testing-library/react';
import MeetingDetailPage from '@/app/meetings/[id]/page';
import { useAuth } from '@/app/contexts/AuthContext';
import { API_ENDPOINTS } from '@/app/config';
import { useParams } from 'next/navigation';

// Mock the dependencies
jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/app/components/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('MeetingDetailPage', () => {
  const mockToken = 'mock-token';
  const mockId = 'meeting-123';
  
  beforeEach(() => {
    // Mock implementation of useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      token: mockToken,
    });
    
    // Mock useParams to return the meeting ID
    (useParams as jest.Mock).mockReturnValue({ id: mockId });
    
    // Reset fetch mocks
    (global.fetch as jest.Mock).mockReset();
  });
  
  it('displays loading state initially', () => {
    // Mock fetch to never resolve during this test
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<MeetingDetailPage />);
    
    // Check for loading spinner instead of role="status"
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  it('displays error message when fetch fails', async () => {
    // Mock fetch to reject
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<MeetingDetailPage />);
    
    await waitFor(() => {
      // Update to match actual error message
      expect(screen.getByText('Failed to load meeting details. Please try again later.')).toBeInTheDocument();
    });
  });
  
  it('does not display anything when meeting request is null', async () => {
    // Mock successful fetch with null data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });
    
    render(<MeetingDetailPage />);
    
    // The component returns null when meetingRequest is null
    // So we just verify the loading state disappears
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });
  
  it('displays meeting details when data is available', async () => {
    // Mock meeting request data
    const mockMeetingRequest = {
      id: mockId,
      status: 'PENDING_B_ADDRESS',
      user_b_contact: 'test@example.com',
      location_type: 'Restaurant',
      created_at: new Date().toISOString(),
      address_a: '123 Test St, City',
    };
    
    // Mock successful fetch with data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeetingRequest,
    });
    
    render(<MeetingDetailPage />);
    
    await waitFor(() => {
      // Check for basic information
      expect(screen.getByText('Meeting Details')).toBeInTheDocument();
      expect(screen.getByText('Waiting for other party')).toBeInTheDocument(); // Status display text
      expect(screen.getByText(mockMeetingRequest.user_b_contact)).toBeInTheDocument();
      expect(screen.getByText(mockMeetingRequest.location_type)).toBeInTheDocument();
      expect(screen.getByText(mockMeetingRequest.address_a)).toBeInTheDocument();
      expect(screen.getByText('Not provided')).toBeInTheDocument(); // address_b not provided
    });
  });
  
  it('displays selected place when available', async () => {
    // Mock meeting request with selected place
    const mockMeetingRequest = {
      id: mockId,
      status: 'COMPLETED',
      user_b_contact: 'test@example.com',
      location_type: 'Restaurant',
      created_at: new Date().toISOString(),
      address_a: '123 Test St, City',
      address_b: '456 Other St, City',
      selected_place: {
        id: 'place-1',
        name: 'Test Restaurant',
        address: '789 Meeting St, City',
        google_place_id: 'google-place-123',
      }
    };
    
    // Mock successful fetch with data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeetingRequest,
    });
    
    render(<MeetingDetailPage />);
    
    await waitFor(() => {
      // Check for selected place information
      expect(screen.getByText('Selected Meeting Location')).toBeInTheDocument();
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('789 Meeting St, City')).toBeInTheDocument();
      expect(screen.getByText('View on Google Maps')).toBeInTheDocument();
    });
  });
  
  it('displays suggested places when available', async () => {
    // Mock meeting request with suggested places but no selected place
    const mockMeetingRequest = {
      id: mockId,
      status: 'PROCESSING',
      user_b_contact: 'test@example.com',
      location_type: 'Restaurant',
      created_at: new Date().toISOString(),
      address_a: '123 Test St, City',
      address_b: '456 Other St, City',
      suggested_places: [
        {
          id: 'place-1',
          name: 'Option 1',
          address: '111 Option St, City',
          distance_a: 1200,
          distance_b: 1500,
          rating: 4.5,
          google_place_id: 'google-place-1',
        },
        {
          id: 'place-2',
          name: 'Option 2',
          address: '222 Option St, City',
          distance_a: 800,
          distance_b: 900,
          rating: 4.0,
          google_place_id: 'google-place-2',
        }
      ]
    };
    
    // Mock successful fetch with data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeetingRequest,
    });
    
    render(<MeetingDetailPage />);
    
    await waitFor(() => {
      // Check for suggested places
      expect(screen.getByText('Suggested Meeting Locations')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('111 Option St, City')).toBeInTheDocument();
      expect(screen.getByText('222 Option St, City')).toBeInTheDocument();
      // Should have two "View on Google Maps" links
      const links = screen.getAllByText('View on Google Maps');
      expect(links.length).toBe(2);
    });
  });
  
  it('makes fetch request with correct parameters', () => {
    render(<MeetingDetailPage />);
    
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_ENDPOINTS.meetingRequests}/${mockId}`,
      {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  });
}); 