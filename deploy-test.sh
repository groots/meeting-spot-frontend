#!/bin/bash

# Build the test container
docker build -t gcr.io/$(gcloud config get-value project)/api-test:latest -f Dockerfile.test .

# Push the container to Google Container Registry
docker push gcr.io/$(gcloud config get-value project)/api-test:latest

# Deploy to Cloud Run
gcloud run deploy api-test \
  --image gcr.io/$(gcloud config get-value project)/api-test:latest \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated

# Get the URL of the deployed service
echo "Test page deployed to:"
gcloud run services describe api-test --region us-east1 --format="get(status.url)" 