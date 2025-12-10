import { FastifyRequest, FastifyReply } from 'fastify';
import { HttpException } from './http.exception';
import { fmt } from '../config';
import baseLogger from '../utils/logger/winston';

/**
 * Logs error details to Winston logger
 * @param error - The error object
 * @param request - Fastify request object
 */
const logError = (error: any, request: FastifyRequest): void => {
  // If error is an Error instance, pass it directly so Winston can extract stack trace
  if (error instanceof Error) {
    baseLogger.error("Unhandled error", {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        ...(error as any).code && { code: (error as any).code },
        ...(error as any).statusCode && { statusCode: (error as any).statusCode },
        ...(error as any).status && { status: (error as any).status },
        ...(error as any).validation && { validation: (error as any).validation },
      },
      url: request.url,
      method: request.method,
    });
  } else {
    // For non-Error objects, create a structured error object
    const errorDetails: Record<string, any> = {
      message: error?.message || String(error) || "Unknown error message",
      name: error?.name || error?.constructor?.name || "Error",
      url: request.url,
      method: request.method,
    };
    
    // Add stack trace if available
    if (error?.stack) {
      errorDetails.stack = error.stack;
    }
    
    // Add error code if available
    if (error?.code) {
      errorDetails.code = error.code;
    }
    
    // Add status code if available
    if (error?.statusCode || error?.status) {
      errorDetails.statusCode = error?.statusCode || error?.status;
    }
    
    // Add validation errors if present
    if (error?.validation) {
      errorDetails.validation = error.validation;
    }
    
    // Log the error - pass errorDetails as splat argument so Winston can serialize it
    baseLogger.error("Unhandled error", errorDetails);
  }
};

/**
 * Creates a Fastify error handler function
 * @returns Error handler function for Fastify
 */
export const createErrorHandler = () => {
  return (error: any, request: FastifyRequest, reply: FastifyReply) => {
    // Log the error
    logError(error, request);

    // Handle validation errors
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

    // Handle HttpException (custom exceptions)
    if (error instanceof HttpException) {
      return reply.status(error.status).send(fmt.formatError(error));
    }

    // Handle generic errors
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
  };
};

