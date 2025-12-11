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
import {
  createGeneralRateLimitConfig,
} from "./config/rate-limit.config";
import { FILE_UPLOAD, NETWORK } from "./constants/security.constants";
import { csrfProtection } from "./middleware/csrf.middleware";
import { getAllowedOrigins, createCorsOriginHandler } from "./utils/origin-validator";
import { createErrorHandler } from "./exception/global-error-handler";
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

// Create error handler function
const errorHandler = createErrorHandler();
app.setErrorHandler(errorHandler);

async function main() {
  // Connect to Redis (optional - not used for rate limiting currently)
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
      // Don't block server startup if Redis fails
      baseLogger.warn("Server will continue without Redis");
    }
  }

  const PORT = Number(process.env.PORT) || NETWORK.DEFAULT_PORT;
  const HOST = process.env.HOST || NETWORK.DEFAULT_HOST;
  const isProduction = process.env.NODE_ENV === "PRODUCTION";

  // Register plugins
  app.register(fastifyRequestContext, { defaultStoreValues: { data: "" } });

  // Register Swagger FIRST - Before security headers to avoid CSP conflicts
  await app.register(fastifySwagger, swaggerConfig);
  await app.register(fastifySwaggerUi, swaggerUiConfig);
  baseLogger.info('Swagger UI enabled');

  // Register Security Headers (Helmet) - Must be registered early
  // Note: CSP is disabled globally - Swagger UI needs relaxed CSP and handles its own
  app.register(helmet, {
    contentSecurityPolicy: false, // Disable CSP - Swagger UI needs 'unsafe-inline' and 'unsafe-eval'
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
  
  // Add CSP headers conditionally (skip for Swagger routes)
  app.addHook('onRequest', async (request, reply) => {
    // Skip CSP for Swagger routes - Swagger UI handles its own CSP
    if (!request.url.startsWith('/swagger')) {
      reply.header('Content-Security-Policy', 
        "default-src 'self'; " +
        "style-src 'self' 'unsafe-inline' data:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self'; " +
        "font-src 'self' data: https:; " +
        "object-src 'none'; " +
        "media-src 'self'; " +
        "frame-src 'none'; " +
        "base-uri 'self'"
      );
    }
  });
  // baseLogger.info('Security headers configured (Helmet)');

  // Register CSRF Protection - Must be before routes
  app.addHook('onRequest', async (request, reply) => {
    await csrfProtection(request, reply);
  });
  // baseLogger.info('CSRF protection enabled');

  app.register(multipart, {
    limits: {
      fileSize: FILE_UPLOAD.MAX_SIZE_MULTIPART,
    },
  });

  // Configure CORS with restricted origins
  const allowedOrigins = isProduction
    ? (process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : []) // No default origins in production - must be explicitly set
    : getAllowedOrigins(); // Use centralized defaults for development

  // In production, allow localhost origins if explicitly enabled (for testing)
  const allowLocalhostInProduction = process.env.ALLOW_LOCALHOST_IN_PRODUCTION === 'true';

  // Create CORS origin handler function
  const corsOriginHandler = createCorsOriginHandler(
    allowedOrigins,
    isProduction,
    allowLocalhostInProduction,
    baseLogger
  );

  app.register(cors, {
    origin: corsOriginHandler,
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

  // Register general rate limiting - Applied to all routes
  // 100 requests per minute per IP
  // Note: Route-specific limits (login/register) are handled via middleware
  const generalRateLimitConfig = createGeneralRateLimitConfig();
  await app.register(rateLimit, generalRateLimitConfig);
  
  baseLogger.info('Rate limiting configured', {
    storage: 'in-memory cache',
    generalLimit: '100 requests per minute',
    authLimit: '5 requests per 15 minutes (via middleware)',
    registerLimit: '3 requests per hour (via middleware)',
  });

  // Register routes
  await app.register(Autoload, {
    dir: path.join(__dirname, "modules"),
    options: { prefix: "/api/v1" },
  });



 
  await app.ready();
  // Generate Swagger documentation after routes are loaded
  app.swagger();
  baseLogger.info('Swagger documentation generated');

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