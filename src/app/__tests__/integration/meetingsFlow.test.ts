import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { API_ENDPOINTS } from '@/app/config';

// Mock meeting data
const mockMeetingRequests = [
  {
    id: 'meeting-1',
    request_id: 'meeting-1',
    status: 'PENDING_B_ADDRESS',
    user_b_contact: 'test@example.com',
    user_b_name: 'Test User',
    location_type: 'Restaurant',
    created_at: new Date().toISOString(),
    address_a: '123 Test St, City',
  },
  {
    id: 'meeting-2',
    request_id: 'meeting-2',
    status: 'COMPLETED',
    user_b_contact: 'another@example.com',
    user_b_name: 'Another User',
    location_type: 'Coffee',
    created_at: new Date().toISOString(),
    address_a: '456 Main St, City',
    address_b: '789 Other St, City',
    selected_place: {
      id: 'place-1',
      name: 'Test Cafe',
      address: '555 Meeting St, City',
      google_place_id: 'google-place-123',
    }
  }
];

test.describe('Meetings Feature Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock the API responses
    await context.route(API_ENDPOINTS.meetingRequests, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMeetingRequests)
      });
    });

    // Mock individual meeting request responses
    await context.route(`${API_ENDPOINTS.meetingRequests}meeting-1`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMeetingRequests[0])
      });
    });

    await context.route(`${API_ENDPOINTS.meetingRequests}meeting-2`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMeetingRequests[1])
      });
    });

    // Login as test user first
    await loginAsTestUser(page);
  });

  test('should display the meetings list page', async ({ page }) => {
    // Navigate to meetings page
    await page.goto('/meetings');
    
    // Check that the page title is visible
    await expect(page.locator('h1')).toContainText('All Meetings');
    
    // Check that the meeting requests are displayed in a table
    const meetingRows = page.locator('tbody tr');
    await expect(meetingRows).toHaveCount(2);
    
    // Verify the first meeting request data is shown
    await expect(page.locator('tbody tr:first-child')).toContainText('PENDING_B_ADDRESS');
    await expect(page.locator('tbody tr:first-child')).toContainText('test@example.com');
    await expect(page.locator('tbody tr:first-child')).toContainText('Restaurant');
    
    // Verify the second meeting request data is shown
    await expect(page.locator('tbody tr:nth-child(2)')).toContainText('COMPLETED');
    await expect(page.locator('tbody tr:nth-child(2)')).toContainText('another@example.com');
    await expect(page.locator('tbody tr:nth-child(2)')).toContainText('Coffee');
    await expect(page.locator('tbody tr:nth-child(2)')).toContainText('Test Cafe');
  });

  test('should navigate to meeting detail page and display correct information', async ({ page }) => {
    // Navigate to meetings page
    await page.goto('/meetings');
    
    // Click on the first meeting's View link
    await page.locator('tbody tr:first-child a:text("View")').click();
    
    // Check URL is correct
    await expect(page).toHaveURL(/\/meetings\/meeting-1$/);
    
    // Check that the meeting details are displayed correctly
    await expect(page.locator('h1')).toContainText('Meeting Details');
    await expect(page.getByText('PENDING_B_ADDRESS')).toBeVisible();
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByText('Restaurant')).toBeVisible();
    await expect(page.getByText('123 Test St, City')).toBeVisible();
    
    // Go back to meetings list
    await page.getByText('Back to Meetings').click();
    await expect(page).toHaveURL('/meetings');
    
    // Click on the second meeting's View link
    await page.locator('tbody tr:nth-child(2) a:text("View")').click();
    
    // Check URL is correct
    await expect(page).toHaveURL(/\/meetings\/meeting-2$/);
    
    // Check that the second meeting details are displayed correctly
    await expect(page.locator('h1')).toContainText('Meeting Details');
    await expect(page.getByText('COMPLETED')).toBeVisible();
    await expect(page.getByText('Another User')).toBeVisible();
    await expect(page.getByText('another@example.com')).toBeVisible();
    await expect(page.getByText('Coffee')).toBeVisible();
    await expect(page.getByText('456 Main St, City')).toBeVisible();
    await expect(page.getByText('789 Other St, City')).toBeVisible();
    
    // Check selected place information is displayed
    await expect(page.getByText('Selected Meeting Place')).toBeVisible();
    await expect(page.getByText('Test Cafe')).toBeVisible();
    await expect(page.getByText('555 Meeting St, City')).toBeVisible();
    await expect(page.getByText('View on Google Maps')).toBeVisible();
  });

  test('should handle empty meeting list', async ({ page, context }) => {
    // Override the mock to return empty array
    await context.route(API_ENDPOINTS.meetingRequests, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Navigate to meetings page
    await page.goto('/meetings');
    
    // Check that the empty state message is displayed
    await expect(page.getByText("You don't have any meeting requests yet")).toBeVisible();
    await expect(page.getByText("Create Your First Meeting")).toBeVisible();
  });

  test('should handle API errors on meetings list page', async ({ page, context }) => {
    // Override the mock to return an error
    await context.route(API_ENDPOINTS.meetingRequests, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    // Navigate to meetings page
    await page.goto('/meetings');
    
    // Check that the error message is displayed
    await expect(page.getByText(/Could not load your meeting requests/)).toBeVisible();
  });
}); 