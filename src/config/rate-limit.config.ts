import { FastifyRequest } from 'fastify';
import { fmt } from './index';
import baseLogger from '../utils/logger/winston';

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 */
export const getClientIP = (request: FastifyRequest): string => {
  return (
    (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (request.headers['x-real-ip'] as string) ||
    request.ip ||
    request.socket.remoteAddress ||
    'unknown'
  );
};

// Rate limit context type for @fastify/rate-limit v7
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RateLimitContext = any;

/**
 * Creates general API rate limit configuration
 * 100 requests per minute per IP
 * @param redisClient - Optional Redis client for distributed rate limiting
 */
export const createGeneralRateLimitConfig = (redisClient?: any) => ({
  max: 100,
  timeWindow: 60 * 1000, // 1 minute
  ...(redisClient ? { redis: redisClient } : { cache: 10000 }), // Use Redis if available, otherwise in-memory cache
  allowList: ['127.0.0.1', '::1'], // Allow localhost
  skip: (request: FastifyRequest) => {
    // Skip rate limiting for Swagger UI and healthcheck endpoints
    const urlPath = request.url.split('?')[0] || '';
    return urlPath.startsWith('/swagger') || urlPath === '/healthcheck';
  },
  keyGenerator: (request: FastifyRequest) => {
    const ip = getClientIP(request);
    return `rate-limit:general:${ip}`;
  },
  errorResponseBuilder: (_request: FastifyRequest, context: RateLimitContext) => {
    const errorResponse = fmt.formatError({
      status: 429,
      code: 'E429',
      message: 'Too Many Requests',
      description: `Rate limit exceeded. Maximum ${context.max} requests per ${context.timeWindow / 1000} seconds allowed. Please try again later.`,
    });
    return {
      ...errorResponse,
      retryAfter: Math.ceil(context.ttl / 1000),
    };
  },
});

// Backward compatibility - default config without Redis
export const generalRateLimitConfig = createGeneralRateLimitConfig();

/**
 * Creates authentication endpoints rate limit configuration
 * Stricter limits: 5 requests per 15 minutes per IP
 * This prevents brute force attacks
 * @param redisClient - Optional Redis client for distributed rate limiting
 */
export const createAuthRateLimitConfig = (redisClient?: any) => ({
  max: 5,
  timeWindow: 15 * 60 * 1000, // 15 minutes
  ...(redisClient ? { redis: redisClient } : { cache: 10000 }), // Use Redis if available, otherwise in-memory cache
  allowList: ['127.0.0.1', '::1'], // Allow localhost in development
  keyGenerator: (request: FastifyRequest) => {
    const ip = getClientIP(request);
    // Include route in key for per-endpoint limiting
    const route = request.url.split('?')[0];
    const key = `rate-limit:auth:${route}:${ip}`;
    
    baseLogger.info('Auth rate limit key generated', {
      ip,
      route: request.url,
      key,
    });
    
    return key;
  },
  errorResponseBuilder: (_request: FastifyRequest, context: RateLimitContext) => {
    const errorResponse = fmt.formatError({
      status: 429,
      code: 'E429',
      message: 'Too Many Requests',
      description: `Authentication rate limit exceeded. Maximum ${context.max} attempts per ${context.timeWindow / (60 * 1000)} minutes allowed. Please try again later.`,
    });
    return {
      ...errorResponse,
      retryAfter: Math.ceil(context.ttl / 1000),
    };
  },
});

// Backward compatibility - default config without Redis
export const authRateLimitConfig = createAuthRateLimitConfig();

/**
 * Creates registration endpoint rate limit configuration
 * Very strict: 3 requests per hour per IP
 * @param redisClient - Optional Redis client for distributed rate limiting
 */
export const createRegisterRateLimitConfig = (redisClient?: any) => ({
  max: 3,
  timeWindow: 60 * 60 * 1000, // 1 hour
  ...(redisClient ? { redis: redisClient } : { cache: 10000 }), // Use Redis if available, otherwise in-memory cache
  allowList: ['127.0.0.1', '::1'], // Allow localhost in development
  keyGenerator: (request: FastifyRequest) => {
    const ip = getClientIP(request);
    return `rate-limit:register:${ip}`;
  },
  errorResponseBuilder: (_request: FastifyRequest, context: RateLimitContext) => {
    const errorResponse = fmt.formatError({
      status: 429,
      code: 'E429',
      message: 'Too Many Requests',
      description: `Registration rate limit exceeded. Maximum ${context.max} registrations per hour allowed. Please try again later.`,
    });
    return {
      ...errorResponse,
      retryAfter: Math.ceil(context.ttl / 1000),
    };
  },
});

// Backward compatibility - default config without Redis
export const registerRateLimitConfig = createRegisterRateLimitConfig();
