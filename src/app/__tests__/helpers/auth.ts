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

  // Navigate to login page
  await page.goto('/login');
  
  // Fill in login form
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForURL('/dashboard');
}

// Add a placeholder test to prevent Jest from failing
// This file is meant to be a helper module, not a test suite
if (typeof jest !== 'undefined') {
  describe('Auth Helpers', () => {
    test('placeholder test to satisfy Jest runner', () => {
      expect(true).toBe(true);
    });
  });
} 