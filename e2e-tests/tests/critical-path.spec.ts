import { test, expect } from '@playwright/test';
import { Locator, Page } from '@playwright/test';

// Generate a unique email for testing to avoid conflicts
const getTestEmail = () => `test_${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

// Helper function to log test step with timestamp
const logStep = (step: string) => {
  console.log(`[${new Date().toISOString()}] ${step}`);
};

// Helper to save screenshots with prefixes
const screenshot = async (page: Page, name: string) => {
  await page.screenshot({ path: `test-results/critical-path/${name}-${Date.now()}.png` });
};

// Credentials storage for the test session
const testData = {
  userEmail: getTestEmail(),
  userPassword: 'TestPassword123!',
  meetingId: '',
};

// Helper to create a meeting request
async function createMeeting(page: Page) {
  logStep('Creating a new meeting request');
  
  // Navigate to create page (may redirect to login if not authenticated)
  await page.goto('/create');
  await page.waitForLoadState('domcontentloaded');
  
  // Fill meeting form
  await screenshot(page, '01-create-form');
  
  // Location A
  const locationAInput = page.getByPlaceholder(/your location/i, { exact: false });
  await locationAInput.fill('New York, NY');
  await locationAInput.press('Tab');
  await page.waitForTimeout(1000); // Allow time for autocomplete
  
  // Location B
  const locationBInput = page.getByPlaceholder(/their location/i, { exact: false });
  await locationBInput.fill('Boston, MA');
  await locationBInput.press('Tab');
  await page.waitForTimeout(1000); // Allow time for autocomplete
  
  // Contact details
  const contactEmail = page.getByPlaceholder(/email of the person/i, { exact: false });
  await contactEmail.fill('meeting-test@example.com');
  
  // Submit form
  const submitButton = page.getByRole('button', { name: /find/i, exact: false });
  await screenshot(page, '02-before-submit');
  await submitButton.click();

  // Wait for result page
  try {
    await page.waitForURL(/\/meetup\/.*/, { timeout: 15000 });
    const url = page.url();
    testData.meetingId = url.split('/').pop() || '';
    logStep(`Meeting created with ID: ${testData.meetingId}`);
    await screenshot(page, '03-meeting-created');
    expect(testData.meetingId).toBeTruthy();
  } catch (e) {
    logStep(`Error waiting for meeting result: ${(e as Error).message}`);
    await screenshot(page, '03-meeting-error');
    throw e;
  }
}

async function acceptMeeting(page: Page, meetingId: string) {
  logStep(`Accepting meeting with ID: ${meetingId}`);
  
  // Navigate to the meeting page as the recipient
  await page.goto(`/meetup/${meetingId}`);
  await page.waitForLoadState('domcontentloaded');
  await screenshot(page, '04-meeting-page');
  
  // Find and click the accept button
  try {
    const acceptButton = page.getByRole('button', { name: /accept/i });
    await acceptButton.waitFor({ state: 'visible', timeout: 10000 });
    await acceptButton.click();
    logStep('Clicked accept button');
    
    // Wait for a success message or status change
    await page.waitForTimeout(2000);
    await screenshot(page, '05-after-accept');
    
    // Check for any error messages
    const errorMessage = page.getByText(/error|failed/i);
    const hasError = await errorMessage.isVisible().catch(() => false);
    expect(hasError).toBe(false);
  } catch (e) {
    logStep(`Error accepting meeting: ${(e as Error).message}`);
    await screenshot(page, '05-accept-error');
    throw e;
  }
}

async function viewMeetingResults(page: Page, meetingId: string) {
  logStep(`Viewing results for meeting: ${meetingId}`);
  
  // Navigate to the meeting results page
  await page.goto(`/meetup/${meetingId}/results`);
  await page.waitForLoadState('domcontentloaded');
  await screenshot(page, '06-results-page');
  
  // Verify that suggested places are displayed
  try {
    // Wait for places to load
    await page.waitForSelector('.place-card, .suggestion-card', { timeout: 15000 });
    await screenshot(page, '07-places-loaded');
    
    // Check if any place cards are visible
    const placeCards = page.locator('.place-card, .suggestion-card');
    const count = await placeCards.count();
    
    logStep(`Found ${count} suggested places`);
    // There should be at least one suggested place
    expect(count).toBeGreaterThan(0);
  } catch (e) {
    logStep(`Error viewing results: ${(e as Error).message}`);
    await screenshot(page, '07-results-error');
    throw e;
  }
}

async function register(page: Page, email: string, password: string) {
  logStep(`Registering new user: ${email}`);
  
  // Navigate to the registration page
  await page.goto('/auth/register');
  await page.waitForLoadState('domcontentloaded');
  await screenshot(page, 'register-form');
  
  // Fill the registration form
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  
  // If there is a confirm password field, fill it too
  const confirmPasswordField = page.getByLabel(/confirm password/i);
  if (await confirmPasswordField.isVisible().catch(() => false)) {
    await confirmPasswordField.fill(password);
  }
  
  // Submit the form
  const registerButton = page.getByRole('button', { name: /sign up|register/i });
  await registerButton.click();
  
  // Wait for registration to complete
  try {
    // Either wait for navigation to dashboard/create page
    // or wait for success message
    await Promise.race([
      page.waitForURL(/\/create|\/dashboard/, { timeout: 10000 }),
      page.waitForSelector('text=/success|registered|welcome/i', { timeout: 10000 })
    ]);
    
    await screenshot(page, 'register-success');
    logStep('Registration successful');
  } catch (e) {
    // Check for any visible error
    const errorMessage = await page.locator('.error, [role="alert"]').textContent() || 'Unknown error';
    logStep(`Registration failed: ${errorMessage}`);
    await screenshot(page, 'register-error');
    throw new Error(`Registration failed: ${errorMessage}`);
  }
}

async function login(page: Page, email: string, password: string) {
  logStep(`Logging in user: ${email}`);
  
  // Navigate to the login page
  await page.goto('/auth/login');
  await page.waitForLoadState('domcontentloaded');
  await screenshot(page, 'login-form');
  
  // Fill the login form
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  
  // Submit the form
  const loginButton = page.getByRole('button', { name: /sign in|log in|login/i });
  await loginButton.click();
  
  // Wait for login to complete
  try {
    // Either wait for navigation to dashboard/create page
    await Promise.race([
      page.waitForURL(/\/create|\/dashboard/, { timeout: 10000 }),
      page.waitForSelector('text=/welcome|logged in/i', { timeout: 10000 })
    ]);
    
    await screenshot(page, 'login-success');
    logStep('Login successful');
  } catch (e) {
    // Check for any visible error
    const errorMessage = await page.locator('.error, [role="alert"]').textContent() || 'Unknown error';
    logStep(`Login failed: ${errorMessage}`);
    await screenshot(page, 'login-error');
    throw new Error(`Login failed: ${errorMessage}`);
  }
}

async function testSessionExpiration(page: Page) {
  logStep('Testing session expiration scenario');
  
  // First login successfully
  await login(page, testData.userEmail, testData.userPassword);
  
  // Simulate token expiration by manually corrupting the token
  await page.evaluate(() => {
    // Replace the token with an invalid one
    localStorage.setItem('auth_token', 'expired.token.value');
    sessionStorage.setItem('auth_token', 'expired.token.value');
  });
  
  // Navigate to a page that requires authentication
  await page.goto('/create');
  
  // We should be redirected to login
  await page.waitForURL(/\/auth\/login/);
  await screenshot(page, 'session-expired');
  
  // Check for the specific error message about session expiration
  const errorText = await page.locator('.bg-red-50, [role="alert"]').textContent();
  logStep(`Error message shown: ${errorText}`);
  
  // Verify the correct error message is shown
  expect(errorText).toContain('Session expired');
  expect(errorText).not.toContain('Failed to authenticate');
}

// Main test for the critical user path
test.describe('Critical User Journey', () => {
  // Increase timeout for this flow as it's comprehensive
  test.setTimeout(120000);
  
  // Make sure we have a clean directory for screenshots
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.evaluate(() => {
      // Create directory for screenshots if it doesn't exist
      const fs = require('fs');
      const dir = 'test-results/critical-path';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }).catch(() => {
      // Ignore errors, the directory will be created when taking screenshots
    });
    await page.close();
  });
  
  test('Complete user flow from registration to viewing results', async ({ page }) => {
    // Step 1: Register a new user
    await register(page, testData.userEmail, testData.userPassword);
    
    // Step 2: Create a meeting (should be automatically logged in after registration)
    await createMeeting(page);
    expect(testData.meetingId).toBeTruthy();
    
    // Step 3: Accept the meeting (simulate the other user)
    await acceptMeeting(page, testData.meetingId);
    
    // Step 4: View the meeting results
    await viewMeetingResults(page, testData.meetingId);
    
    // Success! The critical path is working
    logStep('Critical user journey completed successfully');
  });
  
  test('Session expiration shows correct error message', async ({ page }) => {
    await testSessionExpiration(page);
    logStep('Session expiration test completed successfully');
  });
}); 