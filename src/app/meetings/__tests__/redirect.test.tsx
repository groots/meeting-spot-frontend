import { render, screen } from '@testing-library/react';
import MeetingsRedirect from '../page';
import MeetingIdRedirect from '../[id]/page';
import { useRouter } from 'next/navigation';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
  useParams: jest.fn(() => ({
    id: 'test-id',
  })),
}));

describe('Meetings Redirect Pages', () => {
  beforeEach(() => {
    // Clear mocks between tests
    jest.clearAllMocks();
  });

  describe('MeetingsRedirect', () => {
    it('redirects to dashboard', () => {
      const mockReplace = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        replace: mockReplace,
      });

      render(<MeetingsRedirect />);
      
      // Check if the loading indicator is shown
      expect(screen.getByText('Redirecting...')).toBeInTheDocument();
      
      // Check if router.replace was called with the dashboard path
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('MeetingIdRedirect', () => {
    it('redirects to correct meeting path with ID', () => {
      const mockReplace = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        replace: mockReplace,
      });
      
      const mockParams = { id: 'test-meeting-id' };
      require('next/navigation').useParams.mockReturnValue(mockParams);

      render(<MeetingIdRedirect />);
      
      // Check if the loading indicator is shown
      expect(screen.getByText('Redirecting...')).toBeInTheDocument();
      
      // Check if router.replace was called with the correct path
      expect(mockReplace).toHaveBeenCalledWith(`/meeting/${mockParams.id}`);
    });

    it('redirects to dashboard when ID is missing', () => {
      const mockReplace = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        replace: mockReplace,
      });
      
      // Simulate missing ID parameter
      require('next/navigation').useParams.mockReturnValue({});

      render(<MeetingIdRedirect />);
      
      // Check if router.replace was called with the dashboard path
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });
}); 