# End-to-End Tests with Playwright

This directory contains end-to-end tests for the Find a Meeting Spot application using Playwright.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

Run all tests:

```bash
npm run e2e
```

Run tests in debug mode (with UI):

```bash
npm run e2e:debug
```

Run specific test file:

```bash
npx playwright test e2e-tests/tests/auth.spec.ts
```

## Test Structure

- `api-endpoints.spec.ts` - Tests API endpoint URL construction
- `auth.spec.ts` - Tests user authentication flows
- `meeting-spot.spec.ts` - Tests the main meeting spot creation flow

## Fixing Common Issues

### URL Construction Issue

If you see URLs being constructed incorrectly (e.g., `https://findameetingspot.com/.findameetingspot.com/api/...`), check:

1. Your API base URL configuration in your application code
2. Make sure you're not appending the domain to itself when constructing URLs

### Environment Variables

For testing against different environments:

```bash
BASE_URL=https://staging.findameetingspot.com npm run e2e
```

## CI/CD Integration

These tests automatically run on GitHub Actions on pull requests and pushes to main branch.
