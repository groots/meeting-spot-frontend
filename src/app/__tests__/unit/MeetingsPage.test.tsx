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
  getMeetingRequestsWithContacts: jest.fn(),
  initApiHelpers: jest.fn(),
}));

describe('MeetingsPage', () => {
  const mockToken = 'mock-token';
  const mockUser = { id: '123', email: 'user@example.com' };
  const mockMeetingRequests = [
    {
      id: '1',
      status: 'PENDING_B_ADDRESS',
      user_b_contact: 'user2@example.com',
      location_type: 'restaurant',
      created_at: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      status: 'COMPLETED',
      user_b_contact: 'user3@example.com',
      location_type: 'cafe',
      created_at: '2023-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: mockToken,
    });
    (apiUtils.getMeetingRequestsWithContacts as jest.Mock).mockResolvedValue({
      data: mockMeetingRequests,
      error: null,
    });
  });

  it('should render loading state initially', () => {
    render(<MeetingsPage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render meeting requests when loaded', async () => {
    render(<MeetingsPage />);
    
    await waitFor(() => {
      expect(apiUtils.getMeetingRequestsWithContacts).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Your Meeting Requests')).toBeInTheDocument();
    expect(screen.getByText('PENDING_B_ADDRESS')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('should render error message when API returns error', async () => {
    const errorMessage = 'Failed to fetch meetings';
    (apiUtils.getMeetingRequestsWithContacts as jest.Mock).mockResolvedValue({
      data: null,
      error: errorMessage,
    });
    
    render(<MeetingsPage />);
    
    await waitFor(() => {
      expect(apiUtils.getMeetingRequestsWithContacts).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render empty state when there are no meeting requests', async () => {
    (apiUtils.getMeetingRequestsWithContacts as jest.Mock).mockResolvedValue({
      data: [],
      error: null,
    });
    
    render(<MeetingsPage />);
    
    await waitFor(() => {
      expect(apiUtils.getMeetingRequestsWithContacts).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText("You don't have any meeting requests yet.")).toBeInTheDocument();
    expect(screen.getByText('Create a Meeting Request')).toBeInTheDocument();
  });
}); 