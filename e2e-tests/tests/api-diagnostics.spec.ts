import { test, expect } from '@playwright/test';

test.describe('API Diagnostics', () => {
  test('Registration endpoint direct API call', async ({ request }) => {
    // Create a unique test email
    const testEmail = `test_${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;
    const testPassword = 'TestPassword123!';
    console.log(`Testing registration with email: ${testEmail}`);

    try {
      // Make a direct API call to the registration endpoint
      const response = await request.post('https://api.findameetingspot.com/api/v1/auth/register', {
        data: {
          email: testEmail,
          password: testPassword
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Log the full response for debugging
      console.log(`Registration response status: ${response.status()}`);
      const responseBody = await response.json().catch(() => null);
      console.log('Response body:', responseBody);

      // Even if we don't get a 201 success, we should at least not get a server error
      expect(response.status()).toBeLessThan(500);
    } catch (error) {
      console.error('Error making registration API call:', error);
    }
  });

  test('Compare direct vs frontend-mediated API calls', async ({ page, request }) => {
    // 1. Direct API call first
    const testEmail1 = `test_direct_${Date.now()}@example.com`;
    console.log(`Testing direct API call with email: ${testEmail1}`);
    
    try {
      const directResponse = await request.post('https://api.findameetingspot.com/api/v1/auth/register', {
        data: {
          email: testEmail1,
          password: 'TestPassword123!'
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`Direct API call response status: ${directResponse.status()}`);
    } catch (error) {
      console.error('Error with direct API call:', error);
    }
    
    // 2. Now try through the frontend
    const testEmail2 = `test_frontend_${Date.now()}@example.com`;
    console.log(`Testing frontend-mediated API call with email: ${testEmail2}`);
    
    // Capture all API requests
    const apiRequests: {url: string, method: string, headers: Record<string, string>}[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/v1/auth/register')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
        console.log('Captured API request:', {
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    // Navigate to registration page
    await page.goto('/auth/register');
    await page.waitForLoadState('domcontentloaded');
    
    // Fill and submit the form
    await page.locator('input[type="email"]').fill(testEmail2);
    await page.locator('input[type="password"]').first().fill('TestPassword123!');
    
    // If there's a confirm password field, fill it too
    const passwordFields = page.locator('input[type="password"]');
    if (await passwordFields.count() > 1) {
      await passwordFields.nth(1).fill('TestPassword123!');
    }
    
    // Click the register button and capture any API calls
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000); // Wait for potential API calls
    
    // Log the captured API requests for comparison
    console.log(`Captured ${apiRequests.length} API requests from frontend`);
    apiRequests.forEach((req, i) => {
      console.log(`API Request ${i+1}:`, req.url);
      console.log('Method:', req.method);
      console.log('Headers:', req.headers);
    });
    
    // Take a screenshot of where we ended up
    await page.screenshot({ path: 'test-results/after-register-form.png' });
  });
  
  test('Debug API URL construction', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Inject script to expose how API URLs are constructed
    await page.evaluate(() => {
      // Override fetch
      const originalFetch = window.fetch;
      // @ts-ignore - Working around TypeScript's type checking for this debugging code
      window.fetch = function(url, options) {
        if (url.toString().includes('/api/')) {
          console.log('FETCH URL:', url);
          console.log('BASE URL:', window.location.origin);
          console.log('OPTIONS:', options);
          
          // Create an element to visualize this info for screenshots
          const debugDiv = document.createElement('div');
          debugDiv.id = 'api-debug-info';
          debugDiv.style.position = 'fixed';
          debugDiv.style.top = '0';
          debugDiv.style.left = '0';
          debugDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
          debugDiv.style.color = 'white';
          debugDiv.style.padding = '10px';
          debugDiv.style.zIndex = '9999';
          debugDiv.style.maxWidth = '100%';
          debugDiv.style.overflow = 'auto';
          debugDiv.innerHTML = `
            <h3>API Debug</h3>
            <p>Fetch URL: ${url}</p>
            <p>Base URL: ${window.location.origin}</p>
          `;
          document.body.appendChild(debugDiv);
        }
        return originalFetch.apply(this, [url, options]);
      };
      
      // Check if axios exists before attempting to override
      // @ts-ignore - Working around TypeScript's type checking for window.axios
      if (typeof window.axios !== 'undefined') {
        // @ts-ignore
        const originalAxiosRequest = window.axios.request;
        // @ts-ignore
        window.axios.request = function(config: any) {
          if (config.url.includes('/api/')) {
            console.log('AXIOS REQUEST:', config);
          }
          return originalAxiosRequest.apply(this, [config]);
        };
      }
      
      console.log('API debugging instrumentation installed');
    });
    
    // Try to navigate to register page to trigger potential API calls
    await page.goto('/auth/register');
    await page.waitForTimeout(1000);
    
    // Take a screenshot which might include our injected debug info
    await page.screenshot({ path: 'test-results/api-construction-debug.png' });
  });
}); 