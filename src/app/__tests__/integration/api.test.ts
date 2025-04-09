import { API_ENDPOINTS } from '@/app/config';
import {
  MeetingRequestResponse,
  MeetingRequestStatusResponse,
  MeetingRequestResultsResponse,
  ErrorResponse,
  mockMeetingSpot,
  createMockResponse,
  setupFetchMock,
  mockRequestData,
} from './helpers';

describe('Meeting Request API Integration', () => {
  const fetchMock = setupFetchMock();

  beforeEach(() => {
    fetchMock.mockReset();
    // Reset environment variables before each test
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  describe('API Configuration', () => {
    it('uses production API URL when NEXT_PUBLIC_API_URL is set', () => {
      const prodUrl = 'https://meeting-spot-backend-zylogyedtq-ue.a.run.app/api';
      process.env.NEXT_PUBLIC_API_URL = prodUrl;
      
      // Re-import to get fresh config with new env var
      jest.resetModules();
      const { API_ENDPOINTS } = require('@/app/config');
      
      expect(API_ENDPOINTS.meetingRequests).toBe(`${prodUrl}/v1/meeting-requests/`);
    });

    it('falls back to localhost when NEXT_PUBLIC_API_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      
      // Re-import to get fresh config with new env var
      jest.resetModules();
      const { API_ENDPOINTS } = require('@/app/config');
      
      expect(API_ENDPOINTS.meetingRequests).toBe('http://localhost:8000/api/v1/meeting-requests/');
    });
  });

  describe('createMeetingRequest', () => {
    // ... existing tests ...
  });
}); 