import { render, screen, waitFor } from '@testing-library/react';
import MeetingsPage from '@/app/meetings/page';
import { useAuth } from '@/app/contexts/AuthContext';
import { API_ENDPOINTS } from '@/app/config';
import * as apiUtils from '@/app/utils/api';

// Mock the AuthContext
jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the ProtectedRoute component
jest.mock('@/app/components/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the API utilities
jest.mock('@/app/utils/api', () => ({
  apiGet: jest.fn(),
  initApiHelpers: jest.fn(),
}));

describe('MeetingsPage', () => {
  const mockToken = 'mock-token';
  const mockUser = { id: '123', email: 'test@example.com' };
  
  beforeEach(() => {
    // Mock implementation of useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      token: mockToken,
      user: mockUser,
    });
    
    // Reset API mocks
    jest.spyOn(apiUtils, 'apiGet').mockClear();
  });
  
  it('displays loading state initially', () => {
    // Mock API to never resolve during this test
    jest.spyOn(apiUtils, 'apiGet').mockImplementation(() => new Promise(() => {}));
    
    render(<MeetingsPage />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  it('displays error message when fetch fails', async () => {
    // Mock API to return an error
    jest.spyOn(apiUtils, 'apiGet').mockResolvedValue({
      data: null,
      error: 'Failed to fetch',
      status: 500
    });
    
    render(<MeetingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });
  
  it('displays empty state when no meetings are returned', async () => {
    // Mock successful API call with empty array
    jest.spyOn(apiUtils, 'apiGet').mockResolvedValue({
      data: [],
      error: null,
      status: 200
    });
    
    render(<MeetingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("You don't have any meeting requests yet.")).toBeInTheDocument();
    });
  });
  
  it('displays meeting requests when available', async () => {
    // Mock meeting request data
    const mockMeetingRequests = [
      {
        id: '1',
        status: 'PENDING_B_ADDRESS',
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
      }
    ];
    
    // Mock successful API call with data
    jest.spyOn(apiUtils, 'apiGet').mockResolvedValue({
      data: mockMeetingRequests,
      error: null,
      status: 200
    });
    
    render(<MeetingsPage />);
    
    await waitFor(() => {
      // Check for table column headers
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Meeting With')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      
      // Check for meeting request data
      expect(screen.getByText('Waiting for other party')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('another@example.com')).toBeInTheDocument();
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Coffee')).toBeInTheDocument();
    });
  });
  
  it('makes API request with correct endpoint', () => {
    render(<MeetingsPage />);
    
    expect(apiUtils.apiGet).toHaveBeenCalledWith(API_ENDPOINTS.meetingRequests);
  });
}); 