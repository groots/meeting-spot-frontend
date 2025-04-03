# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with verbose logging
RUN npm install --verbose

# Copy the rest of the application
COPY . .

# Build the application with verbose logging
RUN npm run build --verbose

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port 8080
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV DEBUG=*
ENV NODE_DEBUG=*
ENV PORT=8080

# Start the application with verbose logging
CMD ["node", "--trace-warnings", "--trace-uncaught", "server.js"] 