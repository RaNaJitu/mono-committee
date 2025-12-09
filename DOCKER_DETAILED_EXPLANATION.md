# Docker Configuration - Detailed Explanation

This document provides a comprehensive, line-by-line explanation of all Docker-related files in this project.

---

## Table of Contents

1. [Dockerfile](#dockerfile)
2. [docker-compose.yml](#docker-composeyml)
3. [docker-entrypoint.sh](#docker-entrypointsh)
4. [Why Multi-Stage Builds?](#why-multi-stage-builds)
5. [Common Docker Commands](#common-docker-commands)

---

## Dockerfile

### Purpose
The Dockerfile defines how to build a Docker image for the Node.js/Fastify backend application. It uses a **multi-stage build** pattern to create an optimized production image.

### Line-by-Line Explanation

```dockerfile
# Multi-stage build for Node.js/Fastify backend
```
**Why**: Comment explaining the build strategy. Multi-stage builds allow us to use different base images and tools for building vs. running the application.

---

### Stage 1: Dependencies

```dockerfile
FROM node:20-alpine AS dependencies
```
**Why**: 
- `FROM node:20-alpine` - Uses Node.js version 20 on Alpine Linux (lightweight, ~5MB base image vs ~150MB for full Node image)
- `AS dependencies` - Names this stage "dependencies" so we can reference it later
- Alpine Linux is minimal and secure, perfect for production containers

```dockerfile
WORKDIR /app
```
**Why**: Sets the working directory inside the container to `/app`. All subsequent commands run from this directory. If the directory doesn't exist, Docker creates it.

```dockerfile
# Install OpenSSL and other required libraries for Prisma
RUN apk add --no-cache openssl libc6-compat
```
**Why**:
- `apk` - Alpine Package Manager (like `apt` for Ubuntu)
- `--no-cache` - Don't store package index locally (saves space)
- `openssl` - Required by Prisma Client for secure database connections
- `libc6-compat` - Compatibility library for glibc-based applications (needed for some Node.js native modules)
- Prisma needs these libraries to work correctly in Alpine Linux

```dockerfile
# Copy package files
COPY package.json package-lock.json ./
```
**Why**:
- Copies only dependency files first (not source code)
- This leverages Docker's layer caching: if dependencies don't change, Docker reuses cached layers
- `./` means copy to current working directory (`/app`)

```dockerfile
# Install dependencies
RUN npm ci --only=production && npm cache clean --force
```
**Why**:
- `npm ci` - Clean install (faster, more reliable than `npm install`, removes `node_modules` first)
- `--only=production` - Install only production dependencies (excludes devDependencies like TypeScript, test tools)
- `npm cache clean --force` - Removes npm cache to reduce image size
- `&&` - Runs second command only if first succeeds

---

### Stage 2: Build

```dockerfile
FROM node:20-alpine AS build
```
**Why**: Starts a fresh Alpine image for the build stage. This stage will have dev dependencies needed for compilation.

```dockerfile
WORKDIR /app
```
**Why**: Sets working directory again (each stage is independent).

```dockerfile
# Install OpenSSL and other required libraries for Prisma
RUN apk add --no-cache openssl libc6-compat
```
**Why**: Same as Stage 1 - Prisma needs these libraries during client generation.

```dockerfile
# Copy package files
COPY package.json package-lock.json ./
```
**Why**: Copy dependency files again (this stage is independent from Stage 1).

```dockerfile
# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force
```
**Why**:
- `npm ci` without `--only=production` - Installs ALL dependencies including devDependencies
- We need dev dependencies (TypeScript, Prisma CLI, etc.) to build the application
- `npm cache clean` - Clean up to reduce image size

```dockerfile
# Copy source code and Prisma schema
COPY . .
```
**Why**:
- Copies entire project (source code, Prisma schema, etc.)
- Done AFTER copying package files to leverage Docker layer caching
- If only source code changes, Docker reuses the cached `node_modules` layer

```dockerfile
# Generate Prisma Client
# Use a dummy DATABASE_URL_RW during build (we only need to generate the client, not connect)
# The actual connection URL will be provided at runtime via environment variables
# Prisma Client generation doesn't require a real database connection
ENV DATABASE_URL_RW=${DATABASE_URL_RW:-postgresql://dummy:dummy@localhost:5432/dummy}
```
**Why**:
- `ENV` - Sets environment variable
- `${DATABASE_URL_RW:-...}` - Uses DATABASE_URL_RW if provided, otherwise uses dummy URL
- Prisma schema requires a `url` field, but we don't need a real database to generate the client
- The dummy URL satisfies Prisma's validation without requiring a database connection

```dockerfile
RUN npx prisma generate
```
**Why**:
- Generates Prisma Client based on the schema
- Creates TypeScript types and database query methods
- This must happen before building TypeScript code (since code imports Prisma Client)

```dockerfile
# Build TypeScript
RUN npm run build
```
**Why**:
- Runs `npm run build` which executes `tsc` (TypeScript compiler)
- Compiles TypeScript to JavaScript in the `dist/` directory
- This is the final step of the build stage

---

### Stage 3: Production

```dockerfile
FROM node:20-alpine AS production
```
**Why**: Final stage - creates the production image. Only includes what's needed to run the app.

```dockerfile
WORKDIR /app
```
**Why**: Sets working directory for production stage.

```dockerfile
# Install dumb-init and OpenSSL libraries for Prisma
RUN apk add --no-cache dumb-init openssl libc6-compat
```
**Why**:
- `dumb-init` - Properly handles Unix signals (SIGTERM, SIGINT) for clean shutdowns
- Without it, Node.js might not receive signals correctly, causing containers to hang
- `openssl` and `libc6-compat` - Still needed at runtime for Prisma Client

```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
```
**Why**:
- **Security best practice**: Don't run applications as root
- `-g 1001` - Group ID 1001
- `-S` - Create system user (no login shell)
- `-u 1001` - User ID 1001
- `&& \` - Continues command on next line
- If container is compromised, attacker has limited privileges

```dockerfile
# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
```
**Why**:
- `--from=dependencies` - Copy from the "dependencies" stage (not from host)
- `--chown=nodejs:nodejs` - Change ownership to nodejs user (so it can read files)
- Only production dependencies (smaller, no dev tools)

```dockerfile
# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
```
**Why**:
- Copies compiled JavaScript from build stage
- `--chown` ensures nodejs user can read/execute these files

```dockerfile
COPY --from=build --chown=nodejs:nodejs /app/prisma ./prisma
```
**Why**: Copies Prisma schema (needed at runtime for migrations, though we're not running migrations here).

```dockerfile
COPY --from=build --chown=nodejs:nodejs /app/package.json ./package.json
```
**Why**: Package.json needed to identify the application and its dependencies.

```dockerfile
# Copy generated Prisma Client from build stage
# The Prisma Client is generated in node_modules/.prisma/client during build
COPY --from=build --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
```
**Why**:
- Prisma Client is generated during build stage (where dev dependencies exist)
- We copy the generated client to production stage
- Without this, Prisma Client wouldn't be available at runtime

```dockerfile
# Copy .env file (will be overridden by docker-compose if needed)
COPY --chown=nodejs:nodejs .env* ./
```
**Why**:
- `*` - Wildcard copies all `.env*` files (`.env`, `.env.production`, etc.)
- Provides default environment variables
- Docker Compose can override these with `env_file` or `environment` sections

```dockerfile
# Copy entrypoint script
COPY --chown=nodejs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
```
**Why**:
- Copies the entrypoint script
- `chmod +x` - Makes script executable
- Entrypoint script transforms database URLs before starting the app

```dockerfile
# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs
```
**Why**:
- `mkdir -p` - Create directory (and parent directories if needed)
- `chown -R` - Recursively change ownership
- Ensures nodejs user can write logs

```dockerfile
# Switch to non-root user
USER nodejs
```
**Why**: Switches to nodejs user for all subsequent commands. Security best practice.

```dockerfile
# Expose port
EXPOSE 4000
```
**Why**:
- Documents which port the container listens on
- Doesn't actually publish the port (that's done in docker-compose.yml)
- Helps with documentation and Docker networking

```dockerfile
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/healthcheck', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```
**Why**:
- `--interval=30s` - Check every 30 seconds
- `--timeout=3s` - If check takes longer than 3s, consider it failed
- `--start-period=40s` - Give app 40 seconds to start before checking
- `--retries=3` - Mark unhealthy after 3 consecutive failures
- `CMD` - Command to run for health check (checks `/healthcheck` endpoint)
- Docker can use this to restart unhealthy containers

```dockerfile
# Use dumb-init to handle signals properly and run entrypoint script
ENTRYPOINT ["dumb-init", "--", "/app/docker-entrypoint.sh"]
```
**Why**:
- `ENTRYPOINT` - Command that always runs (can't be overridden)
- `dumb-init` - Wraps the entrypoint script to handle signals
- `--` - Separates dumb-init args from command args
- Ensures SIGTERM/SIGINT are properly forwarded to Node.js

```dockerfile
# Start the application
CMD ["node", "dist/app.js"]
```
**Why**:
- `CMD` - Default command (can be overridden)
- Starts the compiled Node.js application
- This is passed as `$@` to the entrypoint script

---

## docker-compose.yml

### Purpose
Defines and orchestrates multiple Docker containers (backend + Redis) with networking, volumes, and environment configuration.

### Line-by-Line Explanation

```yaml
services:
```
**Why**: Top-level key defining all services (containers) in this compose file.

---

### Redis Service

```yaml
  redis:
```
**Why**: Defines a service named "redis". Other services can reference it by this name.

```yaml
    image: redis:7-alpine
```
**Why**:
- Uses official Redis image version 7
- Alpine variant (smaller image size)
- No need to build - uses pre-built image

```yaml
    container_name: committee-redis
```
**Why**: Sets a fixed container name (easier to reference in logs/commands). Without this, Docker generates random names.

```yaml
    restart: unless-stopped
```
**Why**:
- Automatically restarts container if it crashes
- `unless-stopped` - Won't restart if manually stopped
- Ensures Redis is always available

```yaml
    ports:
      - "${REDIS_PORT:-6379}:6379"
```
**Why**:
- Maps host port to container port
- `${REDIS_PORT:-6379}` - Uses REDIS_PORT from .env, defaults to 6379
- Format: `host_port:container_port`
- Allows accessing Redis from host machine at `localhost:6379`

```yaml
    command: >
      sh -c "redis-server
      ${REDIS_PWD:+--requirepass $REDIS_PWD}
      --appendonly yes"
```
**Why**:
- `>` - Multi-line YAML syntax
- `sh -c` - Execute shell command
- `${REDIS_PWD:+...}` - If REDIS_PWD is set, add `--requirepass` flag
- `--appendonly yes` - Enable AOF (Append Only File) persistence
- Persists data to disk so it survives container restarts

```yaml
    volumes:
      - redis-data:/data
```
**Why**:
- `redis-data` - Named volume (managed by Docker)
- `/data` - Mount point inside container (where Redis stores data)
- Data persists even if container is removed
- Better than bind mounts for database data

```yaml
    networks:
      - committee-network
```
**Why**: Connects Redis to the same network as backend (allows them to communicate).

```yaml
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 5s
```
**Why**:
- `test` - Command to check health (`redis-cli ping` returns "PONG" if healthy)
- `interval` - Check every 10 seconds
- `timeout` - 3 second timeout
- `retries` - 3 failures = unhealthy
- `start_period` - 5 seconds grace period for startup
- Backend waits for Redis to be healthy before starting

---

### Backend Service

```yaml
  backend:
```
**Why**: Defines the backend application service.

```yaml
    build:
      context: .
      dockerfile: Dockerfile
```
**Why**:
- `context: .` - Build context (current directory)
- `dockerfile: Dockerfile` - Path to Dockerfile
- Tells Docker Compose to build the image (not use pre-built)

```yaml
    container_name: committee-backend
```
**Why**: Fixed container name for easier management.

```yaml
    restart: unless-stopped
```
**Why**: Auto-restart on failure (same as Redis).

```yaml
    ports:
      - "${PORT:-4000}:4000"
```
**Why**:
- Maps host port to container port 4000
- `${PORT:-4000}` - Uses PORT from .env, defaults to 4000
- Access backend at `http://localhost:4000` from host

```yaml
    env_file:
      - .env
```
**Why**:
- Loads all variables from `.env` file
- Provides default values for environment variables
- Can be overridden by `environment` section below

```yaml
    environment:
      - NODE_ENV=${NODE_ENV:-DEVELOPMENT}
```
**Why**:
- Sets NODE_ENV environment variable
- `${NODE_ENV:-DEVELOPMENT}` - Uses NODE_ENV from .env, defaults to "DEVELOPMENT"
- Controls application behavior (logging, error messages, etc.)

```yaml
      - PORT=${PORT:-4000}
```
**Why**: Sets PORT (though Fastify reads from HOST/PORT env vars).

```yaml
      # Host must be 0.0.0.0 in Docker to accept connections from outside container
      - HOST=0.0.0.0
```
**Why**:
- **Critical**: `0.0.0.0` means "listen on all network interfaces"
- If set to `localhost` or `127.0.0.1`, container can't accept external connections
- Docker port mapping requires binding to `0.0.0.0`
- Overrides `.env` file's HOST setting (which might be `10.255.253.32`)

```yaml
      # Use local database URL from .env
      - DATABASE_URL_RW=${DATABASE_URL_RW:-}
      - DATABASE_URL=${DATABASE_URL:-}
```
**Why**:
- Passes database URLs from .env to container
- `:-` - Defaults to empty string if not set
- Entrypoint script will transform `localhost` to `host.docker.internal`

```yaml
      # Redis configuration - connect to Redis service in Docker
      - REDIS_URL=redis
      - REDIS_URL=redis
      - REDIS_PORT=6379
      - REDIS_PWD=${REDIS_PWD:-}
```
**Why**:
- `REDIS_URL=redis` - Uses service name "redis" (Docker DNS resolves this)
- Containers on same network can communicate by service name
- `REDIS_PORT=6379` - Standard Redis port
- `REDIS_PWD` - Optional password from .env

```yaml
    volumes:
      # Mount logs directory for persistence
      - ./logs:/app/logs
      # Mount uploads directory if needed
      - ./uploads:/app/uploads
```
**Why**:
- Bind mounts (host path : container path)
- `./logs:/app/logs` - Host's `./logs` maps to container's `/app/logs`
- Logs persist on host machine (survive container removal)
- Same for uploads directory

```yaml
    networks:
      - committee-network
```
**Why**: Connects backend to same network as Redis (enables communication).

```yaml
    depends_on:
      redis:
        condition: service_healthy
```
**Why**:
- `depends_on` - Backend waits for Redis before starting
- `condition: service_healthy` - Waits for Redis health check to pass
- Ensures Redis is ready before backend tries to connect

```yaml
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:4000/healthcheck', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
```
**Why**:
- Checks `/healthcheck` endpoint
- Returns 0 (success) if status 200, 1 (failure) otherwise
- 30s intervals, 3s timeout, 3 retries
- 40s startup grace period (app needs time to start)

---

### Networks Section

```yaml
networks:
  committee-network:
    driver: bridge
```
**Why**:
- Defines a custom network named "committee-network"
- `bridge` - Default driver (containers can communicate)
- Isolates these containers from other Docker networks
- Services on this network can resolve each other by name

---

### Volumes Section

```yaml
volumes:
  redis-data:
    driver: local
```
**Why**:
- Defines a named volume "redis-data"
- `local` - Stored on host's local filesystem
- Managed by Docker (better than bind mounts for databases)
- Persists Redis data across container restarts/removals

---

## docker-entrypoint.sh

### Purpose
Entrypoint script that runs before the main application. Transforms database connection URLs to work from inside Docker containers.

### Line-by-Line Explanation

```bash
#!/bin/sh
```
**Why**: Shebang - tells system to use `/bin/sh` (shell) to execute this script. `sh` is available in Alpine Linux.

```bash
# Docker entrypoint script to handle database URL transformation
# Replaces localhost/127.0.0.1 with host.docker.internal in database URLs
```
**Why**: Comments explaining the script's purpose.

```bash
# Transform DATABASE_URL_RW if it contains localhost or 127.0.0.1
if [ -n "$DATABASE_URL_RW" ]; then
```
**Why**:
- `if [ -n "$DATABASE_URL_RW" ]` - Check if variable is non-empty
- Only transform if the variable exists
- Prevents errors if variable is not set

```bash
  # Replace @localhost: or @127.0.0.1: with @host.docker.internal: in connection string
  export DATABASE_URL_RW=$(echo "$DATABASE_URL_RW" | sed 's/@localhost:/@host.docker.internal:/g')
```
**Why**:
- `export` - Makes variable available to child processes (Node.js app)
- `echo "$DATABASE_URL_RW"` - Outputs the database URL
- `| sed 's/@localhost:/@host.docker.internal:/g'` - Pipes to sed (stream editor)
  - `s/pattern/replacement/g` - Substitute pattern with replacement globally
  - `@localhost:` - Matches `@localhost:` in connection string (e.g., `postgresql://user:pass@localhost:5432/db`)
  - `@host.docker.internal:` - Replaces with Docker's special hostname
  - `g` - Global (replace all occurrences)
- `host.docker.internal` resolves to host machine's IP from inside container

```bash
  export DATABASE_URL_RW=$(echo "$DATABASE_URL_RW" | sed 's/@127\.0\.0\.1:/@host.docker.internal:/g')
```
**Why**:
- Same as above, but handles `127.0.0.1` (IP address instead of hostname)
- `\.` - Escaped dot (matches literal dot, not any character)
- Some connection strings use IP instead of hostname

```bash
  # Also handle cases without port (though less common)
  export DATABASE_URL_RW=$(echo "$DATABASE_URL_RW" | sed 's/localhost$/host.docker.internal/g')
```
**Why**:
- `localhost$` - Matches "localhost" at end of string (`$` = end of line)
- Handles edge cases where URL might not have a port
- Less common but covers all scenarios

```bash
  export DATABASE_URL_RW=$(echo "$DATABASE_URL_RW" | sed 's/127\.0\.0\.1$/host.docker.internal/g')
```
**Why**: Same as above, but for IP address at end of string.

```bash
fi
```
**Why**: Closes the `if` statement.

```bash
# Transform DATABASE_URL if it contains localhost or 127.0.0.1
if [ -n "$DATABASE_URL" ]; then
```
**Why**: Same transformation logic for `DATABASE_URL` (fallback variable).

```bash
  # Replace @localhost: or @127.0.0.1: with @host.docker.internal: in connection string
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/@localhost:/@host.docker.internal:/g')
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/@127\.0\.0\.1:/@host.docker.internal:/g')
  # Also handle cases without port (though less common)
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/localhost$/host.docker.internal/g')
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/127\.0\.0\.1$/host.docker.internal/g')
```
**Why**: Same transformations as `DATABASE_URL_RW` but for `DATABASE_URL`.

```bash
fi
```
**Why**: Closes the second `if` statement.

```bash
# Execute the main command
exec "$@"
```
**Why**:
- `exec` - Replaces shell process with the command (saves memory, proper signal handling)
- `"$@"` - All arguments passed to entrypoint script
- In our case: `["node", "dist/app.js"]` from CMD
- This starts the Node.js application with transformed environment variables

---

## Why Multi-Stage Builds?

### Benefits

1. **Smaller Final Image**
   - Build stage includes dev dependencies (~500MB)
   - Production stage only has runtime dependencies (~150MB)
   - Reduces image size by ~70%

2. **Security**
   - Production image doesn't contain build tools or source code
   - Reduces attack surface
   - No TypeScript compiler, test frameworks, etc.

3. **Faster Deployments**
   - Smaller images upload/download faster
   - Less storage required

4. **Separation of Concerns**
   - Build tools separate from runtime
   - Clear distinction between build and run environments

---

## Common Docker Commands

### Build and Start
```bash
docker-compose up --build
```
- Builds images and starts containers
- `--build` forces rebuild even if image exists

### Start in Background
```bash
docker-compose up -d
```
- `-d` = detached mode (runs in background)

### View Logs
```bash
docker-compose logs -f backend
```
- `-f` = follow (stream logs)
- `backend` = specific service

### Stop Services
```bash
docker-compose down
```
- Stops and removes containers
- Keeps volumes (Redis data persists)

### Stop and Remove Volumes
```bash
docker-compose down -v
```
- `-v` = removes volumes (deletes Redis data)

### Rebuild Specific Service
```bash
docker-compose build backend
```
- Rebuilds only backend service

### Execute Command in Container
```bash
docker-compose exec backend sh
```
- Opens shell in running backend container

### View Container Status
```bash
docker-compose ps
```
- Shows running containers and their status

---

## Summary

### Dockerfile
- **Stage 1 (dependencies)**: Install production dependencies
- **Stage 2 (build)**: Install all dependencies, generate Prisma Client, compile TypeScript
- **Stage 3 (production)**: Copy only runtime files, create non-root user, set up entrypoint

### docker-compose.yml
- **Redis service**: Pre-built image, persistent data, health checks
- **Backend service**: Built from Dockerfile, connects to Redis, uses host database
- **Networks**: Isolated network for service communication
- **Volumes**: Persistent storage for Redis data and logs

### docker-entrypoint.sh
- **Purpose**: Transform database URLs before app starts
- **Why**: Containers can't use `localhost` to reach host services
- **Solution**: Replace `localhost` with `host.docker.internal`

This setup provides:
✅ Secure, optimized production images
✅ Automatic database URL transformation
✅ Persistent Redis data
✅ Health checks and auto-restart
✅ Isolated networking
✅ Easy development workflow

