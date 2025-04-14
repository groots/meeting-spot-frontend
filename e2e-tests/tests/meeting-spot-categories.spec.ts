import { test, expect } from '@playwright/test';

// Helper to log in
async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  // Wait for login to complete - either redirects to home or dashboard
  await page.waitForNavigation();
}

test.describe('Meeting Spot Category Selection', () => {
  test('Main category selection changes available options', async ({ page }) => {
    // Log in first
    await login(page);
    
    // Navigate to create request page
    await page.goto('/create');
    
    // Verify the category dropdown exists and has options
    await expect(page.locator('select#category')).toBeVisible();
    
    // Select "Food & Drink" category
    await page.selectOption('select#category', 'Food & Drink');
    
    // Verify subcategory dropdown appears
    await expect(page.locator('select#subcategory')).toBeVisible();
    
    // Verify subcategory options include fine dining and cheap eats
    const subcategoryOptions = await page.locator('select#subcategory option').allTextContents();
    expect(subcategoryOptions.some(text => text.includes('fine dining'))).toBeTruthy();
    expect(subcategoryOptions.some(text => text.includes('cheap eats'))).toBeTruthy();
    
    // Change to different category
    await page.selectOption('select#category', 'Cultural');
    
    // Verify subcategory dropdown disappears
    await expect(page.locator('select#subcategory')).not.toBeVisible();
  });

  test('Creating request with subcategory works correctly', async ({ page }) => {
    // Log in first
    await login(page);
    
    // Navigate to create request page
    await page.goto('/create');
    
    // Fill out the form with a subcategory
    await page.fill('input#address', '123 Test St, San Francisco, CA');
    await page.selectOption('select#category', 'Food & Drink');
    await page.selectOption('select#subcategory', 'cheap eats');
    await page.selectOption('select#contactMethod', 'EMAIL');
    await page.fill('input#contactInfo', 'friend@example.com');
    
    // Take a screenshot before submission
    await page.screenshot({ path: 'form-filled.png' });
    
    // Submit the form and wait for navigation to waiting page
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/v1/meeting-requests') && res.status() === 201),
      page.click('button[type="submit"]')
    ]);
    
    // Verify we get a successful response
    const responseData = await response.json();
    expect(responseData.location_type).toBe('Food & Drink: cheap eats');
    
    // Verify we've been redirected to waiting page
    await expect(page.url()).toContain('/waiting/');
    await expect(page.locator('text="Waiting for Response"')).toBeVisible();
  });

  test('All main categories are displayed correctly', async ({ page }) => {
    // Log in first
    await login(page);
    
    // Navigate to create request page
    await page.goto('/create');
    
    // Get all category options
    const categoryOptions = await page.locator('select#category option').allTextContents();
    
    // Verify all main categories are present
    const expectedCategories = [
      'Accommodation', 
      'Food & Drink', 
      'Night Life', 
      'Fun & Family', 
      'Cultural', 
      'Shopping', 
      'Transport'
    ];
    
    for (const category of expectedCategories) {
      expect(categoryOptions.some(text => text.includes(category))).toBeTruthy();
    }
  });
});

test.describe('Meeting Results Display', () => {
  // This test would require a mocked API response or a specific test meeting request
  test.skip('Results page displays category and price level information', async ({ page }) => {
    // Note: This test would need a valid meeting request ID with results
    // Here's how you would test it with a known ID:
    const testMeetingId = 'test-meeting-id'; // Replace with a real ID for actual testing
    
    // Navigate to results page
    await page.goto(`/results/${testMeetingId}`);
    
    // Verify category information is displayed
    await expect(page.locator('text="Category:"')).toBeVisible();
    
    // Verify price level indicators are shown
    await expect(page.locator('.bg-gray-100')).toBeVisible(); // Price level badge
    
    // Verify "Open in Maps" buttons are displayed
    await expect(page.locator('button:has-text("Open in Maps")')).toBeVisible();
    
    // Verify midpoint map button is available
    await expect(page.locator('button:has-text("View Midpoint on Map")')).toBeVisible();
  });
});

// Mock API interactions to avoid relying on real API during tests
test.describe('Meeting Request Flow with Mocked API', () => {
  test('End-to-end flow with mocked API responses', async ({ page }) => {
    // Mock the API calls
    await page.route('**/api/v1/meeting-requests/', async (route) => {
      const postData = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({ 
        status: 201, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          request_id: 'mock-request-id-123', 
          token_b: 'mock-token-123',
          status: 'pending_b_address',
          location_type: postData.location_type
        })
      });
    });
    
    // Mock the status check
    await page.route('**/api/v1/meeting-requests/*/status', async (route) => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'calculating'
        })
      });
    });
    
    // Log in and navigate to create page
    await login(page);
    await page.goto('/create');
    
    // Fill and submit the form
    await page.fill('input#address', '123 Test St, San Francisco, CA');
    await page.selectOption('select#category', 'Food & Drink');
    await page.selectOption('select#subcategory', 'fine dining');
    await page.selectOption('select#contactMethod', 'EMAIL');
    await page.fill('input#contactInfo', 'friend@example.com');
    await page.click('button[type="submit"]');
    
    // Verify we're on the waiting page
    await expect(page.url()).toContain('/waiting/');
    await expect(page.locator('text="Finding the best meeting spots..."')).toBeVisible();
  });
}); 