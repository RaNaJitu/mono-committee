import { FastifyRequest } from 'fastify';
import { fmt } from './index';

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
 * General API rate limit configuration
 * 100 requests per minute per IP
 */
export const generalRateLimitConfig = {
  max: 100,
  timeWindow: 60 * 1000, // 1 minute
  cache: 10000, // Cache size
  allowList: ['127.0.0.1', '::1'], // Allow localhost
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
};

/**
 * Authentication endpoints rate limit configuration
 * Stricter limits: 5 requests per 15 minutes per IP
 * This prevents brute force attacks
 */
export const authRateLimitConfig = {
  max: 5,
  timeWindow: 15 * 60 * 1000, // 15 minutes
  cache: 10000,
  allowList: ['127.0.0.1', '::1'], // Allow localhost in development
  keyGenerator: (request: FastifyRequest) => {
    const ip = getClientIP(request);
    // Include route in key for per-endpoint limiting
    const route = request.url.split('?')[0];
    return `rate-limit:auth:${route}:${ip}`;
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
};

/**
 * Registration endpoint rate limit configuration
 * Very strict: 3 requests per hour per IP
 */
export const registerRateLimitConfig = {
  max: 3,
  timeWindow: 60 * 60 * 1000, // 1 hour
  cache: 10000,
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
};
