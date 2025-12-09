# Multi-stage build for Node.js/Fastify backend

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install OpenSSL and other required libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files (package-lock.json is optional)
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
# Use npm ci if package-lock.json exists, otherwise use npm install
# Set CI=true to skip husky prepare script in Docker
ENV CI=true
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production; \
    else \
      npm install --only=production --no-package-lock; \
    fi && \
    npm cache clean --force

# Stage 2: Build
FROM node:20-alpine AS build

WORKDIR /app

# Install OpenSSL and other required libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files (package-lock.json is optional)
COPY package.json ./
COPY package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
# Use npm ci if package-lock.json exists, otherwise use npm install
# CI=true is already set from dependencies stage, but set it again to be safe
ENV CI=true
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install --no-package-lock; \
    fi && \
    npm cache clean --force

# Copy source code and Prisma schema
COPY . .

# Generate Prisma Client
# Use a dummy DATABASE_URL_RW during build (we only need to generate the client, not connect)
# The actual connection URL will be provided at runtime via environment variables
# Prisma Client generation doesn't require a real database connection
ENV DATABASE_URL_RW=${DATABASE_URL_RW:-postgresql://dummy:dummy@localhost:5432/dummy}
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init and OpenSSL libraries for Prisma
RUN apk add --no-cache dumb-init openssl libc6-compat

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nodejs:nodejs /app/package.json ./package.json

# Copy generated Prisma Client from build stage
# The Prisma Client is generated in node_modules/.prisma/client during build
COPY --from=build --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy .env file (will be overridden by docker-compose if needed)
COPY --chown=nodejs:nodejs .env* ./

# Copy entrypoint script
COPY --chown=nodejs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/healthcheck', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly and run entrypoint script
ENTRYPOINT ["dumb-init", "--", "/app/docker-entrypoint.sh"]

# Start the application
CMD ["node", "dist/app.js"]

