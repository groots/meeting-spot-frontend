# Use Node.js LTS version
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV DEBUG=*
ENV NODE_DEBUG=*

# Copy only the necessary files to the production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV DEBUG=*
ENV NODE_DEBUG=*

COPY --from=0 /app/next.config.js ./
COPY --from=0 /app/public ./public
COPY --from=0 /app/.next/standalone ./
COPY --from=0 /app/.next/static ./.next/static

EXPOSE 8080

# Start the application with more verbose logging
CMD ["node", "--trace-warnings", "--trace-uncaught", "server.js"]

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

# Production image
FROM node:20-slim AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port 8080
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV DEBUG=*
ENV NODE_DEBUG=*

# Start the application with verbose logging
CMD ["node", "--trace-warnings", "--trace-uncaught", "server.js"] 