export interface MeetingSpot {
  name: string;
  address: string;
  distance_a: number;
  distance_b: number;
  rating: number;
  total_ratings: number;
}

export interface MeetingRequestResponse {
  request_id: string;
}

export interface MeetingRequestStatusResponse {
  status: 'pending_b_address' | 'calculating' | 'completed';
}

export interface MeetingRequestResultsResponse {
  spots: MeetingSpot[];
}

export interface ErrorResponse {
  error: string;
}

export const mockMeetingSpot: MeetingSpot = {
  name: 'Coffee Shop',
  address: '789 Center St, City, State',
  distance_a: 1.2,
  distance_b: 1.5,
  rating: 4.5,
  total_ratings: 100,
};

export const createMockResponse = <T>(data: T, ok = true) => ({
  ok,
  json: async () => data,
});

export const setupFetchMock = () => {
  global.fetch = jest.fn();
  return global.fetch as jest.Mock;
};

export const mockRequestData = {
  requestId: '123456',
  addressA: '123 Main St, City, State',
  addressB: '456 Oak St, City, State',
};
