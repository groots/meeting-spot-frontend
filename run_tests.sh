#!/bin/bash
set -e

# Install dependencies if needed
if [ "$1" == "--install" ]; then
  echo "Installing dependencies..."
  npm install
  npx playwright install
fi

# Run the various test types
echo "Running unit tests..."
npm run test

echo "Running E2E tests..."
npx playwright test

echo "All tests completed!"

# Generate HTML report for Playwright tests
npx playwright show-report 