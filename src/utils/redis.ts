import { createClient } from "redis";
import baseLogger from "./logger/winston";

let redisClient: ReturnType<typeof createClient>;

// Initialize Redis client based on environment
const initializeRedisClient = () => {
  const port = Number(process.env.REDIS_PORT) || 6379;
  const host = process.env.REDIS_URL || 'localhost';
  const password = process.env.REDIS_PWD;

  baseLogger.debug('Initializing Redis client', { 
    env: process.env.NODE_ENV,
    host,
    port,
    hasPassword: !!password,
  });

  const clientConfig: Parameters<typeof createClient>[0] = {
    socket: {
      host,
      port,
    },
  };

  // Add password if provided
  if (password) {
    clientConfig.password = password;
  }

  return createClient(clientConfig);
};

// Initialize client (connection will be established in app.ts)
redisClient = initializeRedisClient();

// Handle connection errors
redisClient.on('error', (error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  baseLogger.error('Redis connection error', { error: errorMessage });
});

// Handle successful connection
redisClient.on('connect', () => {
  baseLogger.info('Redis client initialized (connection will be established from app.ts)');
});

// Note: Connection is established in app.ts, not here
// This prevents double connection attempts

export { redisClient };
