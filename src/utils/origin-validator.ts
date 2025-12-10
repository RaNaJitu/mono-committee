/**
 * Centralized Origin Validation Utility
 * Ensures consistent origin validation across CORS and CSRF protection
 */

/**
 * Checks if an origin is from a local network (development only)
 */
export const isLocalNetworkOrigin = (origin: string): boolean => {
  return (
    origin.startsWith('http://localhost') ||
    origin.startsWith('https://localhost') ||
    origin.startsWith('http://127.0.0.1') ||
    origin.startsWith('https://127.0.0.1') ||
    origin.startsWith('http://10.') ||
    origin.startsWith('https://10.') ||
    origin.startsWith('http://192.168.') ||
    origin.startsWith('https://192.168.') ||
    !!origin.match(/^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./)
  );
};

/**
 * Gets allowed origins from environment or defaults
 */
export const getAllowedOrigins = (): string[] => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  if (allowedOrigins) {
    return allowedOrigins.split(',').map(origin => origin.trim());
  }
  
  // Default origins for development
  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://10.255.253.32:5173', // Frontend development server
  ];
};

/**
 * Validates if an origin is allowed
 * @param origin - The origin to validate
 * @param allowedOrigins - List of allowed origins
 * @param isDevelopment - Whether we're in development mode
 * @returns true if origin is allowed, false otherwise
 */
export const isOriginAllowed = (
  origin: string | null | undefined,
  allowedOrigins: string[],
  isDevelopment: boolean
): boolean => {
  if (!origin) {
    return false;
  }

  // In development, allow local network IPs
  if (isDevelopment && isLocalNetworkOrigin(origin)) {
    return true;
  }
  console.log('allowedOrigins', allowedOrigins);
  console.log('origin', origin);
  console.log('isDevelopment', isDevelopment);

  // Check against allowed origins list
  return allowedOrigins.some(allowed => {
    // Exact match
    if (origin === allowed) {
      return true;
    }
    
    // Wildcard subdomain match (e.g., *.example.com)
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    
    return false;
  });
};

/**
 * Extracts origin from request headers
 */
export const extractOrigin = (headers: {
  origin?: string;
  referer?: string;
}): string | null => {
  return (
    (headers.origin as string) ||
    (headers.referer as string)?.split('/').slice(0, 3).join('/') ||
    null
  );
};

/**
 * Type definition for CORS origin callback
 */
type OriginCallback = (err: Error | null, origin: string | boolean | string[]) => void;

/**
 * Creates a CORS origin validation callback function
 * @param allowedOrigins - List of allowed origins
 * @param isProduction - Whether we're in production mode
 * @param allowLocalhostInProduction - Whether to allow localhost in production (for testing)
 * @param logger - Logger instance for logging blocked origins
 * @returns CORS origin callback function
 */
export const createCorsOriginHandler = (
  allowedOrigins: string[],
  isProduction: boolean,
  allowLocalhostInProduction: boolean,
  logger: { warn: (message: string, meta?: any) => void, info: (message: string, meta?: any) => void }
) => {
  return (origin: string | undefined, callback: OriginCallback): void => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // In production, allow localhost if explicitly enabled (for local testing)
    const isDevelopmentMode = !isProduction || allowLocalhostInProduction;
    
    // Validate origin using centralized logic
    const isAllowed = isOriginAllowed(origin, allowedOrigins, isDevelopmentMode);
    logger.info('CORS: Origin allowed', { origin, isAllowed }); 

    if (isAllowed) {
      callback(null, true);
    } else {
      if (allowedOrigins.length === 0 && isProduction) {
        logger.warn('CORS: No allowed origins configured in production');
      } else {
        logger.warn('CORS: Blocked origin', { 
          origin, 
          allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : 'none (production)' 
        });
      }
      callback(new Error('CORS: Origin not allowed'), false);
    }
  };
};

