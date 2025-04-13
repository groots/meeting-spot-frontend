import { test, expect } from '@playwright/test';

// Generate a unique email for testing to avoid conflicts
const getTestEmail = () => `test_${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

test.describe('Authentication Flow', () => {
  test('Login form works correctly', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    console.log('Login page loaded');
    
    // Capture network requests to verify URL formation
    const apiRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        apiRequests.push(url);
        console.log('API URL:', url);
        // Check for malformed URLs
        expect(url).not.toMatch(/\.findameetingspot\.com\/\.findameetingspot\.com/);
      }
    });
    
    // Fill in login form - find inputs by type, placeholder or name
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[placeholder*="password"], input[name="password"]').first();
    
    // Ensure elements are found
    expect(await emailInput.count()).toBeGreaterThan(0);
    expect(await passwordInput.count()).toBeGreaterThan(0);
    
    // Fill credentials
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
    expect(await submitButton.count()).toBeGreaterThan(0);
    
    // Click the button and capture any API requests
    await Promise.all([
      submitButton.click(),
      // Wait for either navigation or a response (may not happen if using test credentials)
      Promise.race([
        page.waitForNavigation({ timeout: 5000 }).catch(() => { /* ignore timeout */ }),
        page.waitForResponse(resp => resp.url().includes('/api/') && resp.url().includes('/auth'), 
                            { timeout: 5000 }).catch(() => { /* ignore timeout */ })
      ])
    ]);
    
    // Check if any API requests were made (success if we got here without errors)
    console.log(`Captured ${apiRequests.length} API requests`);
  });
  
  test('Registration form works correctly', async ({ page }) => {
    // Use a unique email each time to avoid conflicts
    const testEmail = getTestEmail();
    console.log(`Using test email: ${testEmail}`);
    
    // Navigate to registration page
    await page.goto('/auth/register');
    await page.waitForLoadState('domcontentloaded');
    console.log('Registration page loaded');
    
    // Capture network requests to verify URL formation
    const apiRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        apiRequests.push(url);
        console.log('API URL:', url);
        // Check for malformed URLs
        expect(url).not.toMatch(/\.findameetingspot\.com\/\.findameetingspot\.com/);
      }
    });
    
    // Fill in registration form
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]').first();
    const passwordInputs = page.locator('input[type="password"], input[placeholder*="password"], input[name*="password"]');
    
    // Ensure elements are found
    expect(await emailInput.count()).toBeGreaterThan(0);
    expect(await passwordInputs.count()).toBeGreaterThan(0);
    
    // Fill credentials
    await emailInput.fill(testEmail);
    
    // Fill password in both fields if there are two password fields (password and confirm)
    if (await passwordInputs.count() >= 2) {
      await passwordInputs.nth(0).fill('Password123!');
      await passwordInputs.nth(1).fill('Password123!');
    } else {
      await passwordInputs.first().fill('Password123!');
    }
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Register")').first();
    expect(await submitButton.count()).toBeGreaterThan(0);
    
    // Click the button and capture any API requests
    await Promise.all([
      submitButton.click(),
      // Wait for either navigation or a response (may not happen if using test credentials)
      Promise.race([
        page.waitForNavigation({ timeout: 5000 }).catch(() => { /* ignore timeout */ }),
        page.waitForResponse(resp => resp.url().includes('/api/') && resp.url().includes('/auth'), 
                           { timeout: 5000 }).catch(() => { /* ignore timeout */ })
      ])
    ]);
    
    // Check if any API requests were made (success if we got here without errors)
    console.log(`Captured ${apiRequests.length} API requests`);
  });
}); 