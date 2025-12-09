import { fastify } from "fastify";
import fastifyRequestContext from "@fastify/request-context";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Autoload from "@fastify/autoload";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";
import path from "path";
// import killPort from "kill-port";

// import BackendJobs from "./utils/backendJobs";
import { swaggerConfig, swaggerUiConfig } from "./config/swagger.config";
//import { SubscribeEvents } from "./modules/whitelabel/whileLabel.controller";
import  { redisClient } from "./utils/redis";
// import { close } from "./utils/socket";
// import { prisma, prismaClientRO1, prismaClientRO2 } from "./utils/prisma";
import { prisma } from "./utils/prisma";
import baseLogger from './utils/logger/winston';
import { fmt } from "./config";
import { HttpException } from "./exception/http.exception";
import {
  generalRateLimitConfig,
  authRateLimitConfig,
  registerRateLimitConfig,
} from "./config/rate-limit.config";
import { FILE_UPLOAD, NETWORK } from "./constants/security.constants";
import { csrfProtection } from "./middleware/csrf.middleware";
import { getAllowedOrigins, isOriginAllowed } from "./utils/origin-validator";
//require('./utils/ws-sockets')
// Create Fastify instance with logger configuration
export const app = fastify({ logger: true });

// Healthcheck Route - Enhanced for production monitoring
app.get("/healthcheck", async (_request, reply) => {
  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "DEV",
    version: process.env.npm_package_version || "1.0.0",
    services: {
      database: "unknown",
      redis: "unknown",
    },
  };

  // Check database connection
  // Use main prisma client (works for local DB and production)
  // prismaClientRO1 is optional and only used if explicitly configured
  try {
    // Simple query to check database connectivity
    const result = await prisma.$queryRaw`SELECT 1 as health`;

    // Verify we got a result (result should be an array with at least one row)
    if (Array.isArray(result) && result.length > 0) {
      healthStatus.services.database = "connected";
    } else {
      healthStatus.services.database = "disconnected";
      healthStatus.status = "degraded";
    }
  } catch (error) {
    healthStatus.services.database = "disconnected";
    healthStatus.status = "degraded";
    // Log error in development for debugging
    if (process.env.NODE_ENV !== "PRODUCTION") {
      const errorMessage = error instanceof Error ? error.message : String(error);
      baseLogger.error("Database health check failed", { 
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
    }
  }

  // Check Redis connection
  if (redisClient) {
    try {
      if (redisClient.isOpen) {
        const pingResult = await redisClient.ping();
        // ping() returns "PONG" if successful
        if (pingResult === "PONG") {
          healthStatus.services.redis = "connected";
        } else {
          healthStatus.services.redis = "disconnected";
          healthStatus.status = "degraded";
        }
      } else {
        healthStatus.services.redis = "disconnected";
        healthStatus.status = "degraded";
      }
    } catch (error) {
      healthStatus.services.redis = "disconnected";
      healthStatus.status = "degraded";
      // Log error in development for debugging
      if (process.env.NODE_ENV !== "PRODUCTION") {
        baseLogger.error("Redis health check failed", { error });
      }
    }
  } else {
    healthStatus.services.redis = "not_initialized";
  }

  const statusCode = healthStatus.status === "healthy" ? 200 : 503;
  return reply.status(statusCode).send(healthStatus);
});

app.setErrorHandler((error, request, reply) => {
  baseLogger.error({ err: error, url: request.url, method: request.method }, "Unhandled error");

  const validationError = (error as any)?.validation;
  if (validationError) {
    return reply.status(400).send(
      fmt.formatError({
        status: 400,
        code: "E400",
        message: "Validation error",
        description: error.message || "Request validation failed",
        data: validationError,
      })
    );
  }

  if (error instanceof HttpException) {
    return reply.status(error.status).send(fmt.formatError(error));
  }

  // In production, don't expose error details to prevent information disclosure
  const isProduction = process.env.NODE_ENV === "PRODUCTION";
  const errorDescription = isProduction
    ? "An unexpected error occurred. Please try again later."
    : ((error as Error)?.message || "Unexpected error occurred");

  return reply.status(500).send(
    fmt.formatError({
      status: 500,
      code: "E500",
      message: "Internal Server Error",
      description: errorDescription,
    })
  );
});

async function main() {
  // Connect to Redis (only if client is initialized)
  if (redisClient) {
    try {
      // Check if already connected
      if (!redisClient.isOpen) {
        baseLogger.info('Connecting to Redis...');
        await redisClient.connect();
        baseLogger.info("Connected to Redis successfully");
      } else {
        baseLogger.info("Redis already connected");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      baseLogger.error("Could not connect to Redis", { 
        error: errorMessage,
        host: process.env.REDIS_URL || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      });
      // Don't block server startup if Redis fails - it's used for rate limiting and caching
      baseLogger.warn("Server will continue without Redis (rate limiting may not work)");
    }
  } else {
    baseLogger.warn("Redis client not initialized - rate limiting may not work");
  }

  const PORT = Number(process.env.PORT) || NETWORK.DEFAULT_PORT;
  const HOST = process.env.HOST || NETWORK.DEFAULT_HOST;
  const isProduction = process.env.NODE_ENV === "PRODUCTION";

  // Register plugins
  app.register(fastifyRequestContext, { defaultStoreValues: { data: "" } });

  // Register Security Headers (Helmet) - Must be registered early
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for Swagger UI compatibility
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: isProduction, // Only in production
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  });
  // baseLogger.info('Security headers configured (Helmet)');

  // Register CSRF Protection - Must be before routes
  app.addHook('onRequest', async (request, reply) => {
    await csrfProtection(request, reply);
  });
  // baseLogger.info('CSRF protection enabled');

  // Register route-specific rate limiting FIRST (before general limit)
  // These will take precedence over the general limit for specific routes
  
  // Login endpoint: 5 requests per 15 minutes (prevents brute force)
  app.register(async (app) => {
    app.register(rateLimit, authRateLimitConfig);
  }, { prefix: '/api/v1/auth/login' });
  
  // Register endpoint: 3 requests per hour (very strict)
  app.register(async (app) => {
    app.register(rateLimit, registerRateLimitConfig);
  }, { prefix: '/api/v1/auth/register' });
  
  // Register general rate limiting - Applied to all other routes
  // 100 requests per minute per IP
  // This protects against DDoS and brute force attacks
  app.register(rateLimit, generalRateLimitConfig);
  
  // baseLogger.info('Rate limiting configured:');
  // baseLogger.info('  - General: 100 requests per minute per IP');
  // baseLogger.info('  - Login: 5 requests per 15 minutes per IP');
  // baseLogger.info('  - Register: 3 requests per hour per IP');
  
  app.register(multipart, {
    limits: {
      fileSize: FILE_UPLOAD.MAX_SIZE_MULTIPART,
    },
  });

  // Register Swagger only in non-production environments
  if (!isProduction) {
    app.register(fastifySwagger, swaggerConfig);
    app.register(fastifySwaggerUi, swaggerUiConfig);
    baseLogger.info('Swagger UI enabled (development mode)');
  } else {
    baseLogger.info('Swagger UI disabled (production mode)');
  }

  // Configure CORS with restricted origins
  const allowedOrigins = isProduction
    ? (process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : []) // No default origins in production - must be explicitly set
    : getAllowedOrigins(); // Use centralized defaults for development

  app.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Validate origin using centralized logic
      const isAllowed = isOriginAllowed(origin, allowedOrigins, !isProduction);

      if (isAllowed) {
        callback(null, true);
      } else {
        if (allowedOrigins.length === 0 && isProduction) {
          baseLogger.warn('CORS: No allowed origins configured in production');
        } else {
          baseLogger.warn('CORS: Blocked origin', { 
            origin, 
            allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : 'none (production)' 
          });
        }
        callback(new Error('CORS: Origin not allowed'), false);
      }
    },
    credentials: true, // Enable credentials for authenticated requests
    exposedHeaders: ["X-Access-Token"],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false, // Let Fastify handle preflight
    optionsSuccessStatus: 204, // Some legacy browsers (IE11) choke on 204
  });
  baseLogger.info('CORS configured', { 
    allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : 'none (production)',
    developmentMode: !isProduction ? 'Local network IPs allowed' : 'strict',
  });

  app.register(Autoload, {
    dir: path.join(__dirname, "modules"),
    options: { prefix: "/api/v1" },
  });



 
  await app.ready();
  // Only generate Swagger in non-production (already registered conditionally above)
  if (!isProduction) {
    app.swagger();
  }

  const shutdown = async () => {
    baseLogger.info("Initiating server shutdown...");
    
    try {
      // Close Fastify server (triggers onClose hooks)
      await app.close();
      baseLogger.info("Fastify server closed successfully.");

      // // Disconnect Prisma clients
      // await prisma.$disconnect();
      if (prisma) {
        await prisma.$disconnect();
      }
      // if (prismaClientRO2) {
      //   await prismaClientRO2.$disconnect();
      // }
      baseLogger.info("Prisma clients closed successfully.");

      // Disconnect Redis client (if connected)
      if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        baseLogger.info("Redis client closed successfully.");
      } else {
        baseLogger.info("Redis client was not connected, skipping disconnect.");
      }

      

    } catch (err) {
      baseLogger.error("Error closing server & resources:", err);
    } finally {
      baseLogger.info("Shutdown complete. Exiting process.");
      process.exit(0);
    }
  };

  // try {
  //   //SubscribeEvents();
  //   baseLogger.info("Connected to SQS");
  // } catch (error) {
  //   baseLogger.error("Error connecting to SQS:", error);
  //   await shutdown()
  // }

  const startServer = async (hasRetried = false): Promise<void> => {
    try {
      await app.listen({ port: PORT, host: HOST });
      baseLogger.info(`Server ready at http://${HOST}:${PORT}/healthcheck`);
    } catch (error: unknown) {
      const errorCode = error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : undefined;
      if (errorCode === "EADDRINUSE" && !isProduction && !hasRetried) {
        baseLogger.warn(
          `Port ${PORT} in use. Attempting to free it automatically...`
        );

        try {
          // await killPort(PORT);
          baseLogger.info(`Successfully freed port ${PORT}`);
        } catch (killError) {
          baseLogger.error(
            `Unable to free port ${PORT}: ${killError instanceof Error ? killError.message : killError
            }`
          );
          await shutdown();
          return;
        }

        await startServer(true);
        return;
      }

      const errorMessage = error instanceof Error ? error.stack || error.message : String(error);
      baseLogger.error(`Error starting server: ${errorMessage}`);
      await shutdown();
    }
  };
  if(!isProduction) {
    await startServer();
  } else {
    try {
      await app.listen({ port: Number(PORT), host: HOST });
      baseLogger.info(`Server ready at http://${HOST}:${PORT}/healthcheck`);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.stack || e.message : String(e);
      baseLogger.error(`Error starting server: ${errorMessage}`);
      await shutdown();
    }
  }

  try {
    if (process.env.NODE_ENV === "PRODUCTION") { 
      // await new BackendJobs().initialize();
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.stack || e.message : String(e);
    baseLogger.error(`Error starting backend jobs: ${errorMessage}`);
    await shutdown();
  }

  process.on("SIGTERM", async () => {
    baseLogger.info("SIGTERM received - initiating graceful shutdown");
    await shutdown();
  });
  
  process.on("SIGINT", async () => {
    baseLogger.info("SIGINT received - initiating graceful shutdown");
    await shutdown();
  });

}

main();