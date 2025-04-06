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
  });

  describe('createMeetingRequest', () => {
    it('successfully creates a meeting request', async () => {
      const mockResponse: MeetingRequestResponse = { request_id: mockRequestData.requestId };
      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const response = await fetch(API_ENDPOINTS.meetingRequests, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address_a: mockRequestData.addressA }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        API_ENDPOINTS.meetingRequests,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ address_a: mockRequestData.addressA }),
        })
      );
    });

    it('handles errors when creating a meeting request', async () => {
      const errorResponse: ErrorResponse = { error: 'Failed to create request' };
      fetchMock.mockResolvedValueOnce(createMockResponse(errorResponse, false));

      const response = await fetch(API_ENDPOINTS.meetingRequests, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address_a: mockRequestData.addressA }),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data).toEqual(errorResponse);
    });
  });

  describe('respondToMeetingRequest', () => {
    it('successfully responds to a meeting request', async () => {
      const mockResponse = { status: 'success' };
      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const response = await fetch(API_ENDPOINTS.meetingRequestRespond(mockRequestData.requestId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address_b: mockRequestData.addressB }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        API_ENDPOINTS.meetingRequestRespond(mockRequestData.requestId),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ address_b: mockRequestData.addressB }),
        })
      );
    });
  });

  describe('getMeetingRequestStatus', () => {
    it('successfully retrieves meeting request status', async () => {
      const mockResponse: MeetingRequestStatusResponse = { status: 'completed' };
      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const response = await fetch(API_ENDPOINTS.meetingRequestStatus(mockRequestData.requestId));
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        API_ENDPOINTS.meetingRequestStatus(mockRequestData.requestId)
      );
    });
  });

  describe('getMeetingRequestResults', () => {
    it('successfully retrieves meeting spots', async () => {
      const mockResponse: MeetingRequestResultsResponse = { spots: [mockMeetingSpot] };
      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const response = await fetch(API_ENDPOINTS.meetingRequestResults(mockRequestData.requestId));
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        API_ENDPOINTS.meetingRequestResults(mockRequestData.requestId)
      );
    });
  });
}); 