import { test, expect } from '@playwright/test';

test.describe('Redirect functionality', () => {
  test('should redirect from /meetings to /dashboard when logged in', async ({ page, context }) => {
    // Set up local storage to simulate being logged in
    await context.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'fake-jwt-token');
    });

    // Mock auth endpoint to simulate being logged in
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User'
        })
      });
    });

    // Visit the meetings page
    await page.goto('/meetings');

    // Assert that we got redirected to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should redirect from /meetings/:id to /meeting/:id', async ({ page, context }) => {
    // Set up local storage to simulate being logged in
    await context.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'fake-jwt-token');
    });

    // Mock auth endpoint to simulate being logged in
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User'
        })
      });
    });

    // Mock meeting request data
    const testId = '123e4567-e89b-12d3-a456-426614174000';
    await page.route(`**/api/v1/meeting-requests/${testId}`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: testId,
          status: 'COMPLETED',
          user_b_contact: 'test@example.com',
          location_type: 'Restaurant',
          created_at: new Date().toISOString()
        })
      });
    });

    // Visit the meetings page with ID
    await page.goto(`/meetings/${testId}`);

    // Assert that we got redirected to the meeting page with the same ID
    await expect(page).toHaveURL(`/meeting/${testId}`);
  });
}); 