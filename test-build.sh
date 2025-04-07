#!/bin/bash

# This script tests if the build argument for the API URL is correctly processed

# Exit on error
set -e

echo "Testing Docker build with custom API URL..."

# Build the Docker image with a test API URL
docker build \
  --build-arg NEXT_PUBLIC_API_URL_ARG=https://test-api-url.example.com/api \
  -t meeting-spot-frontend-test \
  .

echo "Build successful!"

# Run the container with an exposed port
echo "Starting container to test the built image..."
CONTAINER_ID=$(docker run -d -p 8080:8080 meeting-spot-frontend-test)

echo "Waiting for the server to start..."
sleep 5

# Use curl to fetch the debug page
echo "Fetching debug page to verify API URL configuration..."
curl -s http://localhost:8080/debug > debug_output.txt

# Display the output
echo "Debug page content:"
cat debug_output.txt

# Check if the test URL is in the output
if grep -q "test-api-url.example.com" debug_output.txt; then
  echo -e "\n✅ SUCCESS: The build argument was correctly applied!"
else
  echo -e "\n❌ FAILURE: The build argument was NOT correctly applied!"
fi

# Clean up
echo "Cleaning up..."
docker stop $CONTAINER_ID
docker rm $CONTAINER_ID
rm debug_output.txt

echo "Test completed." 