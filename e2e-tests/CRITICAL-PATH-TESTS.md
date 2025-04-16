# Critical Path E2E Tests

This document explains the critical path end-to-end tests for Find a Meeting Spot - tests that ensure our core user journey never breaks in production.

## Overview

Our critical path tests validate the entire user journey from registration to viewing meeting results, ensuring that the fundamental functionality of our application remains intact. These tests run as part of our CI/CD pipeline and can also be run locally during development.

The tests cover:

- User registration
- Login functionality
- Meeting creation
- Meeting acceptance
- Results display
- Session expiration error handling

## Setup

The tests require Playwright to be installed:

```bash
# Install dependencies if you haven't already
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium
```

## Running Tests Locally

There are two ways to run the critical path tests:

```bash
# Run in headless mode (faster, for CI or quick verification)
npm run e2e:critical-path

# Run with UI debugging (helpful for development/troubleshooting)
npm run e2e:critical-path:debug
```

### Prerequisites:

- Make sure the application frontend is running locally, or you have a test environment URL configured
- The screenshot directory should exist: `mkdir -p test-results/critical-path`

## CI/CD Integration

The critical path tests are integrated into our CI/CD pipeline:

1. They run automatically on:

   - Every push to the main branch
   - Pull requests targeting main
   - Manual triggers via GitHub Actions

2. They **block deployment** if they fail, ensuring critical issues don't reach production

3. Test artifacts (screenshots, logs) are saved in GitHub Actions for review

### Viewing Test Results in CI

1. Go to the GitHub Actions tab in our repository
2. Find the workflow run you're interested in
3. Look for the "Artifacts" section at the bottom
4. Download "critical-path-test-results" to see screenshots and logs

## Test Structure

The tests are defined in `e2e-tests/tests/critical-path.spec.ts` and consist of:

1. **Helper functions** for each step of the user journey

   - `register(page, email, password)`
   - `login(page, email, password)`
   - `createMeeting(page)`
   - `acceptMeeting(page, meetingId)`
   - `viewMeetingResults(page, meetingId)`
   - `testSessionExpiration(page)`

2. **Test cases** that use these helpers
   - `Complete user flow from registration to viewing results`
   - `Session expiration shows correct error message`

## Troubleshooting

Common issues and solutions:

### Tests failing locally but passing in CI (or vice versa)

- Check environment differences (URLs, timeouts, API endpoints)
- Review screenshots to see what's different

### Element not found errors

- The selectors might need updating if the UI changed
- Adjust the selectors in the test file to match current HTML

### Test timeouts

- Increase the timeout in the affected step: `test.setTimeout(120000)`
- Look for performance issues in the application

## Extending the Tests

To add new test scenarios:

1. Add new helper functions for specific flows
2. Create new test cases using `test('description', async ({ page }) => {...})`
3. Update the CI workflow if needed

For example, to add a test for premium subscription features:

```typescript
async function subscribeToPremium(page: Page) {
  // Implementation details
}

test('User can subscribe to premium plan', async ({ page }) => {
  await login(page, testData.userEmail, testData.userPassword);
  await subscribeToPremium(page);
  // Assertions
});
```

## Why These Tests Matter

The critical path tests were implemented after an issue with session expiration error messages reached production. They help us:

1. Catch regressions early
2. Ensure core flows always work
3. Validate error messages and edge cases
4. Provide confidence when deploying

Remember: A passing build doesn't mean much if users can't complete the core journey!

## Best Practices

- Run critical path tests locally before pushing important changes
- Check the screenshots when tests fail to understand what went wrong
- Keep the tests updated as the UI and functionality evolve
- Don't skip these tests in CI even if they make deployment take longer
