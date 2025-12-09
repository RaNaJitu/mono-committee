/**
 * Environment variable validation
 * Validates all required environment variables on startup
 */

interface RequiredEnvVars {
  JWT_SECRET: string;
  DATABASE_URL_RW?: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  NODE_ENV?: string;
}

interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  errors: string[];
}

/**
 * Validates required environment variables
 * 
 * @param env - Process environment variables
 * @returns Validation result with missing variables and errors
 */
export function validateEnvironmentVariables(env: NodeJS.ProcessEnv): EnvValidationResult {
  const missing: string[] = [];
  const errors: string[] = [];

  // Critical variables that must be present
  const criticalVars: (keyof RequiredEnvVars)[] = [
    'JWT_SECRET',
  ];

  // Check critical variables
  for (const varName of criticalVars) {
    if (!env[varName] || env[varName]?.trim() === '') {
      missing.push(varName);
    }
  }

  // Validate JWT_SECRET strength
  if (env.JWT_SECRET) {
    if (env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }
  }

  // Validate NODE_ENV if present
  if (env.NODE_ENV) {
    const validEnvs = ['DEVELOPMENT', 'PRODUCTION', 'TEST', 'dev', 'production', 'test'];
    if (!validEnvs.includes(env.NODE_ENV)) {
      errors.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
    }
  }

  // Check database URLs (at least one must be present)
  if (!env.DATABASE_URL_RW && !env.DATABASE_URL) {
    missing.push('DATABASE_URL_RW or DATABASE_URL');
  }

  return {
    isValid: missing.length === 0 && errors.length === 0,
    missing,
    errors,
  };
}

/**
 * Validates and throws if environment is invalid
 * 
 * @param env - Process environment variables
 * @throws Error if validation fails
 */
export function validateAndThrow(env: NodeJS.ProcessEnv): void {
  const result = validateEnvironmentVariables(env);

  if (!result.isValid) {
    const errorMessages: string[] = [];

    if (result.missing.length > 0) {
      errorMessages.push(`Missing required environment variables: ${result.missing.join(', ')}`);
    }

    if (result.errors.length > 0) {
      errorMessages.push(`Environment variable errors: ${result.errors.join(', ')}`);
    }

    throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
  }
}

