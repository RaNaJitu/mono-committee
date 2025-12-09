# Docker Setup Guide

This guide explains how to run the Committee Backend using Docker.

## Prerequisites

- Docker and Docker Compose installed
- `.env` file configured with your local database URL

## Quick Start

1. **Ensure your `.env` file is configured** with the local database URL:
   ```env
   DATABASE_URL_RW=postgresql://user:password@host:5432/database
   # or
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

2. **Build and start the container**:
   ```bash
   docker-compose up --build
   ```

3. **Run in detached mode** (background):
   ```bash
   docker-compose up -d --build
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f backend
   ```

5. **Stop the container**:
   ```bash
   docker-compose down
   ```

## Configuration

### Using Local Database (Host Machine)

If your database is running on the host machine (not in Docker), you have two options:

#### Option 1: Use `host.docker.internal` (Recommended for Mac/Windows)

Update your `.env` file to use `host.docker.internal`:
```env
DATABASE_URL_RW=postgresql://user:password@host.docker.internal:5432/database
```

#### Option 2: Use Host Network Mode (Linux)

If you're on Linux, you can modify `docker-compose.yml` to use host network:
```yaml
services:
  backend:
    network_mode: host
    # Remove the ports section as it's not needed with host network
```

#### Option 3: Use Host IP Address

Find your host IP and use it in the database URL:
```env
DATABASE_URL_RW=postgresql://user:password@192.168.1.100:5432/database
```

### Environment Variables

The Docker setup automatically loads variables from your `.env` file. Key variables:

- `DATABASE_URL_RW` or `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (optional)
- `JWT_SECRET` - JWT secret key (required)
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (DEVELOPMENT, PRODUCTION, TEST)

## Docker Commands

### Build the image
```bash
docker-compose build
```

### Start services
```bash
docker-compose up
```

### Start in background
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Execute commands in container
```bash
docker-compose exec backend sh
```

### Rebuild after code changes
```bash
docker-compose up --build
```

## Health Check

The container includes a health check endpoint at `/healthcheck`. You can verify the container is healthy:

```bash
curl http://localhost:4000/healthcheck
```

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

1. **Check database URL format**: Ensure it's a valid PostgreSQL connection string
2. **Verify network access**: If database is on host, use `host.docker.internal` or host IP
3. **Check firewall**: Ensure PostgreSQL port (5432) is accessible
4. **View container logs**: `docker-compose logs backend`

### Port Already in Use

If port 4000 is already in use, change it in `.env`:
```env
PORT=4001
```

Then update `docker-compose.yml` ports mapping:
```yaml
ports:
  - "4001:4000"
```

### Prisma Client Not Generated

If you see Prisma errors, ensure Prisma Client is generated during build. The Dockerfile handles this automatically, but you can regenerate manually:

```bash
docker-compose exec backend npx prisma generate
```

## Production Considerations

For production deployment:

1. **Use production environment**:
   ```env
   NODE_ENV=PRODUCTION
   ```

2. **Secure secrets**: Use Docker secrets or environment variable management
3. **Use reverse proxy**: Nginx or Traefik for HTTPS
4. **Database**: Use managed database service or separate database container
5. **Monitoring**: Set up logging and monitoring solutions

## Volumes

The following directories are mounted as volumes:

- `./logs` - Application logs
- `./uploads` - File uploads (if applicable)

These persist on your host machine even if the container is removed.

