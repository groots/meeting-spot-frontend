import { Page } from '@playwright/test';
import { API_ENDPOINTS } from '@/app/config';

// Mock user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!',
  id: 'user-123',
  name: 'Test User',
};

// Mock token
const TEST_TOKEN = 'test-jwt-token-value';

/**
 * Helper function to simulate logging in as a test user
 * This mocks the API responses and sets up the necessary storage
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  // Mock the login API response
  await page.route(API_ENDPOINTS.login, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: TEST_TOKEN,
        refreshToken: 'test-refresh-token',
        user: TEST_USER
      })
    });
  });

  // Mock the profile API response
  await page.route(API_ENDPOINTS.profile, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(TEST_USER)
    });
  });

  // Set up localStorage with authentication data directly
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }, { token: TEST_TOKEN, user: TEST_USER });

  // Visit the home page to make sure the app loads with auth context
  await page.goto('/');
} 