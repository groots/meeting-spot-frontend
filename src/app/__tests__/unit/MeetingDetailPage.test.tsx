import { render, screen, waitFor, act } from '@testing-library/react';
import MeetingDetailPage from '@/app/meetings/[id]/page';
import { useAuth } from '@/app/contexts/AuthContext';
import { API_ENDPOINTS } from '@/app/config';
import { useParams, useRouter } from 'next/navigation';
import * as apiUtils from '@/app/utils/api';

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
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock the API utils
jest.mock('@/app/utils/api', () => ({
  apiGet: jest.fn(),
}));

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
    
    // Reset API mocks
    jest.spyOn(apiUtils, 'apiGet').mockClear();
  });
  
  it('displays loading state initially', async () => {
    // Mock API to never resolve during this test
    const apiGetPromise = new Promise(() => {});
    jest.spyOn(apiUtils, 'apiGet').mockReturnValue(apiGetPromise as any);
    
    // Use act to render the component
    await act(async () => {
      render(<MeetingDetailPage />);
    });
    
    // Check for loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  it('displays error message when fetch fails', async () => {
    // Mock API to return an error
    const mockError = 'Failed to fetch';
    jest.spyOn(apiUtils, 'apiGet').mockResolvedValue({
      data: null,
      error: mockError
    });
    
    // Use act for the initial render
    await act(async () => {
      render(<MeetingDetailPage />);
    });
    
    // Wait for the component to update with the error
    await waitFor(() => {
      expect(screen.getByText(mockError)).toBeInTheDocument();
    });
  });
  
  it('displays meeting details when fetch succeeds', async () => {
    // Mock successful API call with meeting data
    const mockMeeting = {
      id: mockId,
      status: 'COMPLETED',
      user_b_contact: 'contact@example.com',
      location_type: 'Restaurant',
      created_at: '2023-01-01T00:00:00Z',
      selected_place: {
        id: 'place-1',
        name: 'Test Restaurant',
        address: '123 Test St'
      }
    };
    
    jest.spyOn(apiUtils, 'apiGet').mockResolvedValue({
      data: mockMeeting,
      error: null
    });
    
    // Use act for the initial render and state updates
    await act(async () => {
      render(<MeetingDetailPage />);
    });
    
    // Wait for the component to update with the meeting data
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('contact@example.com')).toBeInTheDocument();
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
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
    
    // Mock successful API call with data
    jest.spyOn(apiUtils, 'apiGet').mockResolvedValue({
      data: mockMeetingRequest,
      error: null
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
    
    // Mock successful API call with data
    jest.spyOn(apiUtils, 'apiGet').mockResolvedValue({
      data: mockMeetingRequest,
      error: null
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
  
  it('calls apiGet with correct parameters', async () => {
    // Mock API to resolve with null data
    jest.spyOn(apiUtils, 'apiGet').mockResolvedValue({
      data: null,
      error: null
    });
    
    render(<MeetingDetailPage />);
    
    expect(apiUtils.apiGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.meetingRequests}/${mockId}`
    );
  });
}); 