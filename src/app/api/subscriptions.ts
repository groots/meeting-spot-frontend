import { API_ENDPOINTS } from '../config';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionRequest {
  plan_id: string;
  payment_provider: string;
  payment_id?: string;
}

export interface CreateCheckoutSessionRequest {
  price_id: string;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutResponse {
  checkout_url: string;
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  return response.json();
};

// Create base URL for payments endpoints
const PAYMENTS_BASE_URL = `${API_ENDPOINTS.login.split('/auth')[0]}/payments`;

// Get all subscriptions for the current user
export const getUserSubscriptions = async (token: string): Promise<Subscription[]> => {
  const response = await fetch(`${PAYMENTS_BASE_URL}/subscriptions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return handleResponse(response);
};

// Get a specific subscription
export const getSubscription = async (id: string, token: string): Promise<Subscription> => {
  const response = await fetch(`${PAYMENTS_BASE_URL}/subscriptions/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return handleResponse(response);
};

// Create a new subscription (for free plans only)
export const createSubscription = async (
  data: CreateSubscriptionRequest,
  token: string
): Promise<Subscription> => {
  const response = await fetch(`${PAYMENTS_BASE_URL}/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

// Create a Stripe checkout session
export const createCheckoutSession = async (
  data: CreateCheckoutSessionRequest,
  token: string
): Promise<CheckoutResponse> => {
  const response = await fetch(`${PAYMENTS_BASE_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

// Cancel a subscription
export const cancelSubscription = async (id: string, token: string): Promise<Subscription> => {
  const response = await fetch(`${PAYMENTS_BASE_URL}/subscriptions/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return handleResponse(response);
}; 