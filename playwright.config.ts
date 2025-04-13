import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests/tests',
  timeout: 15 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html'],
    ['line']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://findameetingspot.com',
    actionTimeout: 5000,
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results/',
}); 