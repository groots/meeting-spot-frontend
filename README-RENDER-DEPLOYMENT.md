# Frontend Deployment to Render.com

This guide explains how to deploy the Meeting Spot Frontend to Render.com.

## Prerequisites

1. Render.com account
2. GitHub repository connected to Render
3. Backend already deployed to Render (meeting-spot-backend.onrender.com)

## Deployment Steps

### 1. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Connect your GitHub account if not already connected
5. Select the `groots/meeting-spot-frontend` repository
6. Configure the service:

   **Basic Settings:**

   - **Name**: `meeting-spot-frontend`
   - **Region**: Oregon (same as backend for better performance)
   - **Branch**: `main`
   - **Runtime**: Docker
   - **Plan**: Free (or Starter for production)

   **Build Settings:**

   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `./`

### 2. Environment Variables

Set these environment variables in Render:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://meeting-spot-backend.onrender.com/api
PORT=8080
```

### 3. Deploy Using Blueprint (Alternative)

You can also deploy using the included `render.yaml`:

1. Fork/clone this repository
2. Go to Render Dashboard
3. Click **"New +"** → **"Blueprint"**
4. Connect your GitHub repository
5. Select this repository
6. Render will automatically read `render.yaml` and create the service

## Configuration Files

### render.yaml

```yaml
services:
  - type: web
    name: meeting-spot-frontend
    runtime: docker
    plan: free
    region: oregon
    branch: main
    repo: https://github.com/groots/meeting-spot-frontend
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        value: https://meeting-spot-backend.onrender.com/api
      - key: PORT
        value: 8080
    healthCheckPath: /
    dockerfilePath: ./Dockerfile
    dockerContext: ./
```

### Key Features

- **Multi-stage Docker build** for optimized production images
- **Non-root user** for security
- **Next.js standalone output** for minimal production bundle
- **Environment variable injection** for API URL configuration
- **Health check endpoint** at root path (`/`)

## Post-Deployment

1. **Verify deployment**: Check that the service starts successfully
2. **Test API connectivity**: Visit `/test` page to verify backend connection
3. **Check health endpoint**: Confirm the app responds at the root URL
4. **Update DNS** (if using custom domain)

## Expected URLs

After deployment, your frontend will be available at:

- **Render URL**: `https://meeting-spot-frontend.onrender.com`
- **Custom domain**: Configure in Render dashboard if needed

## Troubleshooting

### Common Issues

1. **Build failures**: Check build logs in Render dashboard
2. **Environment variables**: Ensure `NEXT_PUBLIC_API_URL` is correctly set
3. **API connectivity**: Verify backend is running and accessible
4. **CORS issues**: Backend should allow frontend domain

### Build Logs

Monitor deployment progress in the Render dashboard under your service's "Events" tab.

### Testing Deployment

Use the built-in test pages:

- `/test` - API connectivity test
- `/debug` - Configuration verification
- `/api/health` - Frontend health check

## Performance Optimization

For production environments:

1. Upgrade to **Starter plan** or higher for better performance
2. Consider enabling **CDN** for static assets
3. Monitor **build times** and optimize dependencies if needed

## CI/CD Integration

The repository includes GitHub Actions workflows that can be adapted for Render deployment notifications and testing.

## Support

For deployment issues:

1. Check Render documentation: https://render.com/docs
2. Review build logs in Render dashboard
3. Test locally with Docker: `docker build -t frontend .`
