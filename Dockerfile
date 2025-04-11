# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Declare the build argument
ARG NEXT_PUBLIC_API_URL_ARG

# Set the environment variable from the build argument
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL_ARG

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application (will now use NEXT_PUBLIC_API_URL)
RUN npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"] 