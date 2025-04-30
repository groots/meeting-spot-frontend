import { render, screen, waitFor } from '@testing-library/react';
import MeetingsPage from '../../../meetings/page';
import { useAuth } from '@/app/contexts/AuthContext';
import { API_ENDPOINTS } from '@/app/config';

// Mock the AuthContext
jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the ProtectedRoute component
jest.mock('@/app/components/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('MeetingsPage', () => {
  const mockToken = 'mock-token';
  const mockUser = { id: '123', email: 'test@example.com' };
  
  beforeEach(() => {
    // Mock implementation of useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      token: mockToken,
      user: mockUser,
    });
    
    // Reset fetch mocks
    (global.fetch as jest.Mock).mockReset();
  });
  
  it('displays loading state initially', () => {
    // Mock fetch to never resolve during this test
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<MeetingsPage />);
    
    expect(screen.getByText(/Loading your meeting requests/i)).toBeInTheDocument();
  });
  
  it('displays error message when fetch fails', async () => {
    // Mock fetch to reject
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<MeetingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Could not load your meeting requests/i)).toBeInTheDocument();
    });
  });
  
  it('displays empty state when no meetings are returned', async () => {
    // Mock successful fetch with empty array
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    
    render(<MeetingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/You don't have any meeting requests yet/i)).toBeInTheDocument();
    });
  });
  
  it('displays meeting requests when available', async () => {
    // Mock meeting request data
    const mockMeetingRequests = [
      {
        id: '1',
        status: 'PENDING',
        user_b_contact: 'test@example.com',
        location_type: 'Restaurant',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        status: 'COMPLETED',
        user_b_contact: 'another@example.com',
        location_type: 'Coffee',
        created_at: new Date().toISOString(),
        selected_place: {
          id: 'place1',
          name: 'Test Cafe',
          address: '123 Test St',
        },
      },
    ];
    
    // Mock successful fetch with data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeetingRequests,
    });
    
    render(<MeetingsPage />);
    
    await waitFor(() => {
      // Check for table column headers
      expect(screen.getByText(/Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact/i)).toBeInTheDocument();
      expect(screen.getByText(/Location Type/i)).toBeInTheDocument();
      
      // Check for meeting request data
      expect(screen.getByText('PENDING')).toBeInTheDocument();
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('another@example.com')).toBeInTheDocument();
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.getByText('Test Cafe')).toBeInTheDocument();
      expect(screen.getByText('Not yet determined')).toBeInTheDocument();
    });
  });
  
  it('makes fetch request with correct parameters', () => {
    render(<MeetingsPage />);
    
    expect(global.fetch).toHaveBeenCalledWith(
      API_ENDPOINTS.meetingRequests,
      {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  });
}); 