/**
 * CSRF Protection Middleware
 * Validates Origin/Referer headers for state-changing operations
 * Uses centralized origin validation to ensure consistency with CORS
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import baseLogger from '../utils/logger/winston';
import { fmt } from '../config';
import { getAllowedOrigins, isOriginAllowed, extractOrigin } from '../utils/origin-validator';

/**
 * CSRF protection middleware
 * Validates Origin/Referer headers for POST, PUT, PATCH, DELETE requests
 * 
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export const csrfProtection = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return;
  }

  // Skip CSRF check for healthcheck and Swagger endpoints
  const urlPath = request.url.split('?')[0] || '';
  if (
    urlPath === '/healthcheck' ||
    urlPath.startsWith('/swagger') ||
    urlPath.startsWith('/api/v1/auth/login') || // Login endpoint (handled by rate limiting)
    urlPath.startsWith('/api/v1/auth/register') // Register endpoint (handled by rate limiting)
  ) {
    return;
  }

  try {
    const allowedOrigins = getAllowedOrigins();
    const origin = extractOrigin(request.headers);
    const isDevelopment = process.env.NODE_ENV !== "PRODUCTION";
    
    // In development, be more lenient - allow requests without origin (e.g., Postman, curl)
    if (!origin && isDevelopment) {
      baseLogger.debug('CSRF check skipped in development (no origin header)', {
        method,
        url: request.url,
      });
      return;
    }

    // Require origin for state-changing operations
    if (!origin) {
      baseLogger.warn('CSRF protection: Missing Origin/Referer header', {
        method,
        url: request.url,
        ip: request.ip,
      });
      reply.status(403).send(
        fmt.formatError({
          status: 403,
          code: 'E403',
          message: 'CSRF Protection: Missing Origin header',
          description: 'Request must include Origin or Referer header',
        })
      );
      return;
    }

    // Validate origin using centralized logic (matches CORS validation)
    if (!isOriginAllowed(origin, allowedOrigins, isDevelopment)) {
      baseLogger.warn('CSRF protection: Invalid origin', {
        origin,
        method,
        url: request.url,
        ip: request.ip,
        allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : 'none (production)',
      });
      reply.status(403).send(
        fmt.formatError({
          status: 403,
          code: 'E403',
          message: 'CSRF Protection: Invalid Origin',
          description: 'Request origin is not allowed',
        })
      );
      return;
    }

    // Origin is valid - continue
  } catch (error) {
    baseLogger.error('CSRF middleware error', { error });
    reply.status(500).send(
      fmt.formatError({
        status: 500,
        code: 'E500',
        message: 'Internal Server Error',
        description: 'CSRF validation failed',
      })
    );
  }
};

