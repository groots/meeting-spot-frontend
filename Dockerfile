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