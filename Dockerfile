# Build stage
FROM node:20-slim AS builder

# Accept API URL as a build argument
ARG NEXT_PUBLIC_API_URL_ARG=http://localhost:5001/api
# Set it as an environment variable for the build process
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL_ARG

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application (will now use the ENV var)
RUN echo "Building with API URL: $NEXT_PUBLIC_API_URL" && npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Set runtime environment variables (PORT is still useful)
ENV NODE_ENV=production
ENV PORT=8080
# We no longer need to set NEXT_PUBLIC_API_URL here, it's baked into the .next build

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Start the Next.js application directly
CMD ["npm", "run", "start"] 