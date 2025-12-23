import { fmt } from "../config";
import { BadRequestException } from "../exception/badrequest.exception";

/**
 * Converts a value to an integer
 * 
 * @param value - Value to convert (string or number)
 * @returns Parsed integer value
 * @throws {BadRequestException} If value cannot be converted to integer
 * 
 * @example
 * ```typescript
 * const num = convertToInteger("123"); // Returns 123
 * const num2 = convertToInteger(45.67); // Returns 45
 * ```
 */
export function convertToInteger(value: unknown): number {
  if (typeof value === 'number') {
    return Math.floor(value);
  }

  if (typeof value === 'string') {
    const integerValue = parseInt(value, 10);
    if (!isNaN(integerValue)) {
      return integerValue;
    }
  }

  throw new BadRequestException(
    fmt.formatError({
      message: 'Invalid integer value',
      description: `Unable to convert ${String(value)} to an integer`,
    })
  );
}

/**
 * Converts a value to a float
 * 
 * @param value - Value to convert (string or number)
 * @returns Parsed float value
 * @throws {BadRequestException} If value cannot be converted to float
 * 
 * @example
 * ```typescript
 * const num = convertToFloat("123.45"); // Returns 123.45
 * const num2 = convertToFloat("100"); // Returns 100
 * ```
 */
export function convertToFloat(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const floatValue = parseFloat(value);
    if (!isNaN(floatValue)) {
      return floatValue;
    }
  }

  throw new BadRequestException(
    fmt.formatError({
      message: 'Invalid float value',
      description: `Unable to convert ${String(value)} to a float`,
    })
  );
}

/**
 * Validates that an amount is a positive number
 * 
 * @param amount - Amount to validate
 * @throws {BadRequestException} If amount is not a positive number
 * 
 * @example
 * ```typescript
 * validateAmount(100); // OK
 * validateAmount(-10); // Throws BadRequestException
 * ```
 */
export const validateAmount = (amount: number): void => {
  if (typeof amount !== "number" || amount <= 0 || !isFinite(amount)) {
    throw new BadRequestException(
      fmt.formatError({
        message: "Invalid amount provided",
        description: "Amount must be a positive number",
      })
    );
  }
};

/**
 * Gets current date formatted as DDMMYYYY_HHMMSS
 * 
 * @returns Formatted date string (e.g., "25122024_143052")
 * 
 * @example
 * ```typescript
 * const timestamp = getCurrentDateFormatted(); // "25122024_143052"
 * ```
 */
export function getCurrentDateFormatted(): string {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}${month}${year}_${hours}${minutes}${seconds}`;
}


// export const committeeTypeEnum = {
//   COUNTER: "COUNTER",
//   NORMAL: "NORMAL",
//   LOTTERY: "LOTTERY",
// };
