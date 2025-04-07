# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

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

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
# Ensure the API URL is set even if not provided
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://meeting-spot-backend-zylogyedtq-ue.a.run.app/api/v1}

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Start the Next.js application directly
CMD ["npm", "run", "start"] 