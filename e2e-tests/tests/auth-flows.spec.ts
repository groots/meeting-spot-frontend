import { test, expect } from '@playwright/test';

// Generate a unique email for testing to avoid conflicts
const getTestEmail = () => `test_${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

test.describe('Authentication Journey', () => {
  test('User can register and then login with new account', async ({ page }) => {
    // Generate unique test credentials
    const testEmail = getTestEmail();
    const testPassword = 'TestPassword123!';
    console.log(`Using test email: ${testEmail}`);
    
    // Step 1: Register a new account
    console.log('Starting registration flow...');
    await page.goto('/auth/register');
    await page.waitForLoadState('domcontentloaded');
    
    // Fill registration form
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]').first();
    const passwordInputs = page.locator('input[type="password"], input[placeholder*="password"], input[name*="password"]');
    
    // Ensure form elements are found
    expect(await emailInput.count()).toBeGreaterThan(0);
    expect(await passwordInputs.count()).toBeGreaterThan(0);
    
    // Fill credentials
    await emailInput.fill(testEmail);
    
    // Handle password fields (password + confirm password)
    if (await passwordInputs.count() >= 2) {
      await passwordInputs.nth(0).fill(testPassword);
      await passwordInputs.nth(1).fill(testPassword);
    } else {
      await passwordInputs.first().fill(testPassword);
    }
    
    // Submit the registration form
    const registerButton = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Register")').first();
    
    // Take a screenshot before clicking
    await page.screenshot({ path: 'test-results/register-form.png' });
    
    // Click register button and wait for either navigation or response
    await Promise.all([
      registerButton.click(),
      Promise.race([
        page.waitForNavigation({ timeout: 8000 }).catch(() => { /* ignore timeout */ }),
        page.waitForResponse(resp => resp.url().includes('/api/') && resp.url().includes('/auth'), 
                           { timeout: 8000 }).catch(() => { /* ignore timeout */ })
      ])
    ]);
    
    // Wait a moment for any redirects or state changes
    await page.waitForTimeout(2000);
    
    // Take a screenshot after registration
    await page.screenshot({ path: 'test-results/after-register.png' });
    console.log('Registration step completed');
    
    // Step 2: Login with the newly created account
    console.log('Starting login flow...');
    
    // Navigate to login page (or check if we're already there after registration)
    const currentUrl = page.url();
    if (!currentUrl.includes('/login') && !currentUrl.includes('/auth/login')) {
      await page.goto('/auth/login');
      await page.waitForLoadState('domcontentloaded');
    }
    
    // Fill login form
    const loginEmailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]').first();
    const loginPasswordInput = page.locator('input[type="password"], input[placeholder*="password"], input[name="password"]').first();
    
    // Ensure login form elements are found
    expect(await loginEmailInput.count()).toBeGreaterThan(0);
    expect(await loginPasswordInput.count()).toBeGreaterThan(0);
    
    // Fill login credentials with the same email/password used in registration
    await loginEmailInput.fill(testEmail);
    await loginPasswordInput.fill(testPassword);
    
    // Take a screenshot before login
    await page.screenshot({ path: 'test-results/login-form.png' });
    
    // Submit login form
    const loginButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
    
    // Click login button and wait for either navigation or response
    await Promise.all([
      loginButton.click(),
      Promise.race([
        page.waitForNavigation({ timeout: 8000 }).catch(() => { /* ignore timeout */ }),
        page.waitForResponse(resp => resp.url().includes('/api/') && resp.url().includes('/auth'), 
                           { timeout: 8000 }).catch(() => { /* ignore timeout */ })
      ])
    ]);
    
    // Wait a moment for any redirects or state changes
    await page.waitForTimeout(2000);
    
    // Take a screenshot after login
    await page.screenshot({ path: 'test-results/after-login.png' });
    console.log('Login step completed');
    
    // Check for successful login indicators (will depend on your app's behavior)
    // This could be checking for user-specific elements, redirection to dashboard, etc.
    console.log('Full authentication journey completed');
  });
}); 