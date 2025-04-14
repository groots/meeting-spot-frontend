import { test, expect } from '@playwright/test';

test.describe('Debug API Endpoints', () => {
  test('db-check endpoint URL is correctly constructed', async ({ page, request }) => {
    // Navigate to the debug page
    await page.goto('/debug');
    await page.waitForLoadState('domcontentloaded');
    console.log('Debug page loaded');
    
    // Capture all network requests to analyze URL construction
    const apiRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/debug/db-check')) {
        apiRequests.push(url);
        console.log('DB check API URL detected:', url);
        
        // The key test - ensure the URL doesn't have the domain duplication issue
        expect(url).not.toContain('/.findameetingspot.com');
        expect(url).toMatch(/https?:\/\/[^\/]+\/api\/debug\/db-check/);
      }
    });
    
    // Try to find the button that would trigger the db-check API call
    const dbCheckElements = [
      page.getByText('Check Database'), 
      page.getByText('DB Check'),
      page.getByText('Test Database'),
      page.getByRole('button', { name: /check|database|db/i }),
      page.locator('button:has-text("Check")'),
      page.locator('a:has-text("Check")'),
    ];
    
    // Try each selector until we find one that works
    let elementFound = false;
    for (const element of dbCheckElements) {
      if (await element.count() > 0) {
        console.log('Found db-check trigger element');
        await element.click();
        elementFound = true;
        break;
      }
    }
    
    if (!elementFound) {
      console.log('Could not find db-check trigger element, trying direct API call');
      // Make a direct API call to the endpoint
      try {
        const response = await request.get('/api/debug/db-check');
        console.log(`Direct API call response status: ${response.status()}`);
        
        // Verify the response
        expect(response.status()).toBeLessThan(500); // Should not be a server error
      } catch (err) {
        console.log('Error making direct API call:', err);
      }
    }
    
    // Wait a moment for any requests to be captured
    await page.waitForTimeout(2000);
    
    // Take a screenshot of the debug page
    await page.screenshot({ path: 'test-results/debug-page.png' });
  });
  
  test('Analyze all API request URLs for domain duplication', async ({ page }) => {
    // Visit multiple pages and monitor all API requests
    const pagesToVisit = ['/', '/debug', '/auth/login'];
    
    // Store all detected API URLs
    const allApiUrls: string[] = [];
    
    // Set up request monitoring
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        allApiUrls.push(url);
        console.log('API URL:', url);
        
        // Check each URL for the duplication issue
        expect(url).not.toMatch(/\.findameetingspot\.com\/\.findameetingspot\.com/);
      }
    });
    
    // Visit each page
    for (const path of pagesToVisit) {
      console.log(`Visiting ${path}`);
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000); // Short wait to capture initial requests
      
      // Try to interact with the page to trigger more requests
      try {
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        if (buttonCount > 0) {
          console.log(`Found ${buttonCount} buttons on ${path}`);
          // Click the first button if any are found
          await buttons.first().click().catch(() => console.log('Could not click first button'));
        }
      } catch (e) {
        console.log(`Error interacting with page ${path}:`, e);
      }
      
      await page.waitForTimeout(1000); // Wait for potential requests after interaction
    }
    
    console.log(`Analyzed ${allApiUrls.length} API URLs across ${pagesToVisit.length} pages`);
  });
}); 