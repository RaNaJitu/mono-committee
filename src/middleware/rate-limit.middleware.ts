import { FastifyRequest, FastifyReply } from 'fastify';
import { createAuthRateLimitConfig, createRegisterRateLimitConfig, getClientIP } from '../config/rate-limit.config';
import baseLogger from '../utils/logger/winston';

// In-memory rate limit storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limit middleware for login endpoint
 * 5 requests per 15 minutes per IP
 */
export const authRateLimitMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const config = createAuthRateLimitConfig();
  const ip = getClientIP(request);
  const route = request.url.split('?')[0];
  const key = `rate-limit:auth:${route}:${ip}`;
  
  const now = Date.now();
  const stored = rateLimitStore.get(key);
  
  // Check if limit exists and is still valid
  if (stored) {
    if (now < stored.resetTime) {
      // Still within time window
      if (stored.count >= config.max) {
        baseLogger.warn('Rate limit exceeded', { key, count: stored.count, max: config.max });
        const errorResponse = config.errorResponseBuilder(request, {
          max: config.max,
          timeWindow: config.timeWindow,
          ttl: stored.resetTime - now,
        } as any);
        return reply.status(429).send(errorResponse);
      }
      // Increment count
      stored.count++;
    } else {
      // Time window expired, reset
      rateLimitStore.set(key, { count: 1, resetTime: now + config.timeWindow });
    }
  } else {
    // First request, initialize
    rateLimitStore.set(key, { count: 1, resetTime: now + config.timeWindow });
  }
  
  baseLogger.debug('Rate limit check passed', { key, count: rateLimitStore.get(key)?.count });
};

/**
 * Rate limit middleware for register endpoint
 * 3 requests per hour per IP
 */
export const registerRateLimitMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const config = createRegisterRateLimitConfig();
  const ip = getClientIP(request);
  const route = request.url.split('?')[0];
  const key = `rate-limit:register:${route}:${ip}`;
  
  const now = Date.now();
  const stored = rateLimitStore.get(key);
  
  // Check if limit exists and is still valid
  if (stored) {
    if (now < stored.resetTime) {
      // Still within time window
      if (stored.count >= config.max) {
        baseLogger.warn('Rate limit exceeded', { key, count: stored.count, max: config.max });
        const errorResponse = config.errorResponseBuilder(request, {
          max: config.max,
          timeWindow: config.timeWindow,
          ttl: stored.resetTime - now,
        } as any);
        return reply.status(429).send(errorResponse);
      }
      // Increment count
      stored.count++;
    } else {
      // Time window expired, reset
      rateLimitStore.set(key, { count: 1, resetTime: now + config.timeWindow });
    }
  } else {
    // First request, initialize
    rateLimitStore.set(key, { count: 1, resetTime: now + config.timeWindow });
  }
  
  baseLogger.debug('Rate limit check passed', { key, count: rateLimitStore.get(key)?.count });
};

