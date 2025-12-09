/**
 * Security-related constants
 * Centralized configuration for password hashing, JWT, and security settings
 */

/**
 * Password hashing configuration
 */
export const PASSWORD_HASH = {
  ITERATIONS: 100_000, // Increased from 1000 for better security
  KEY_LENGTH: 64, // bytes
  SALT_LENGTH: 16, // bytes
  ALGORITHM: 'sha512' as const,
} as const;

/**
 * JWT token configuration
 */
export const JWT_CONFIG = {
  DEFAULT_EXPIRY: '8h',
  REFRESH_EXPIRY: '8h',
} as const;

/**
 * File upload limits
 */
export const FILE_UPLOAD = {
  MAX_SIZE_MULTIPART: 5 * 1024 * 1024, // 5 MB
  MAX_SIZE_HANDLER: 2 * 1024 * 1024, // 2 MB
} as const;

/**
 * Default network configuration
 */
export const NETWORK = {
  DEFAULT_HOST: '127.0.0.1',
  DEFAULT_PORT: 4000,
} as const;

/**
 * Validation limits
 */
export const VALIDATION_LIMITS = {
  PHONE_NO_MAX_LENGTH: 16,
  PASSWORD_MAX_LENGTH: 16,
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_MAX_LENGTH: 255,
  EMAIL_MIN_LENGTH: 4,
} as const;

