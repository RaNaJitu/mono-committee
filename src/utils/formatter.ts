import { fmt } from "../config";
import { BadRequestException } from "../exception/badrequest.exception";
import baseLogger from "./logger/winston";

interface ErrorParams {
  status?: number;
  message?: string;
  code?: string;
  data?: unknown;
  description?: string;
}

interface FormattedError {
  status: number;
  message: string;
  code: string;
  data: unknown;
  success: boolean;
  description: string;
}

interface FormattedResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  code: string;
}

class Formatter {
  /**
   * Formats an error into a standardized error response
   * 
   * @param error - Error object with status, message, code, data, and description
   * @returns Formatted error response
   */
  public formatError = (error: ErrorParams): FormattedError => {
    const status = error.status ?? 500;
    const message = error.message ?? "Something went wrong";
    const code = error.code ?? "E500";
    const data = error.data ?? null;
    const success = false;
    const description = error.description ?? "Unexpected Error occurred Try Again!";
    
    // Log error details (not exposed to user)
    baseLogger.error('Error formatted', {
      status,
      code,
      message,
      description,
      hasData: data !== null,
    });
    
    return {
      status,
      message,
      data,
      success,
      code,
      description,
    };
  };

  /**
   * Formats a successful response
   * 
   * @param result - Data to include in response
   * @param message - Success message
   * @returns Formatted success response
   */
  public formatResponse = <T = unknown>(
    result: T,
    message?: string
  ): FormattedResponse<T> => {
    const code = "S200";

    return {
      data: result,
      message: message ?? "",
      success: true,
      code,
    };
  };

  /**
   * Generates Swagger response schema for successful responses
   * 
   * @param data - Example data structure
   * @returns Swagger response schema
   */
  public getSwaggerResponse = (data: unknown) => {
    return {
      data,
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    };
  };

  /**
   * Generates Swagger error response schema
   * 
   * @param errorCode - HTTP error code
   * @param description - Error description
   * @returns Swagger error response schema
   */
  public getSwaggerErrorResponse = (errorCode: number, description: string) => {
    return {
      description,
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          enum: [errorCode],
        },
        code: { type: "string" },
        error: { type: "string" },
        message: { type: "string" },
        description: { type: "string" },
      },
    };
  };
}


export interface Filters {
  page: number;
  perPage: number;
  fieldname: string;
  order: string;
}

interface PaginatedResponse<T> {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
  data: T[];
}

/**
 * Creates a paginated response object
 * 
 * @param page - Current page number
 * @param perPage - Items per page
 * @param totalCount - Total number of items
 * @param data - Array of data items
 * @returns Paginated response object
 */
export const paginateResponse = <T = unknown>(
  page: number,
  perPage: number,
  totalCount: number,
  data: T[]
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(totalCount / perPage);
  return {
    currentPage: page,
    perPage,
    totalPages,
    totalRecords: totalCount,
    data,
  };
};

/**
 * Handles errors by logging and throwing BadRequestException
 * 
 * @param error - Error object
 * @param message - Error message
 * @throws {BadRequestException}
 */
export const handleError = (error: unknown, message: string): never => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  baseLogger.error(message, { error });
  
  throw new BadRequestException(
    fmt.formatError({
      message,
      description: errorMessage || "An error occurred.",
    })
  );
};

/**
 * Formats a response using the formatter
 * 
 * @param data - Data to format
 * @param message - Success message
 * @returns Formatted response
 */
export const formatResponse = <T = unknown>(data: T, message: string) => {
  return fmt.formatResponse(data, message);
};

export const handlePagination = (query: Filters) => ({
  page: query.page || 1,
  perPage: query.perPage || 10,
  fieldname: query.fieldname || "id",
  order: query.order || "desc",
});




export default Formatter;
