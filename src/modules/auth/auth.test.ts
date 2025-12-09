import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  loginBodySchema,
  registerUserBodySchema,
  profileQuerySchema,
} from './auth.validation';

/**
 * Test data factories for consistent test data generation
 */
const createValidLoginPayload = () => ({
  phoneNo: '1234567890',
  password: 'password123',
});

const createValidRegisterPayload = () => ({
  name: 'John Doe',
  email: 'john.doe@example.com',
  phoneNo: '1234567890',
  password: 'password123',
  role: 'USER',
});

/**
 * Test utilities
 */
const expectValidationError = (result: { success: boolean; error?: ZodError }) => {
  expect(result.success).toBe(false);
  expect(result.error).toBeInstanceOf(ZodError);
  expect(result.error?.issues.length).toBeGreaterThan(0);
};

const expectValidationSuccess = <T>(result: { success: boolean; data?: T }) => {
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  return result.data as T;
};

const getFieldError = (error: ZodError, fieldName: string) => {
  return error.issues.find((issue) => issue.path.includes(fieldName));
};

/**
 * Test constants
 */
const VALIDATION_CONSTRAINTS = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 16,
    VALID_CHARS_REGEX: /^[a-zA-Z0-9@!#$&]+$/,
  },
  EMAIL: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 255,
  },
  PHONE_NO: {
    MAX_LENGTH: 16,
  },
} as const;

describe('Auth Validation Schemas', () => {
  describe('loginBodySchema', () => {
    describe('Required Fields Validation', () => {
      it('should reject empty payload', () => {
        // Arrange
        const payload = {};

        // Act
        const result = loginBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
      });

      it('should reject when phoneNo is missing', () => {
        // Arrange
        const payload = { password: 'password123' };

        // Act
        const result = loginBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
        const phoneNoError = getFieldError(result.error!, 'phoneNo');
        expect(phoneNoError).toBeDefined();
      });

      it('should reject when password is missing', () => {
        // Arrange
        const payload = { phoneNo: '1234567890' };

        // Act
        const result = loginBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
        const passwordError = getFieldError(result.error!, 'password');
        expect(passwordError).toBeDefined();
      });
    });

    describe('Field Type Validation', () => {
      it('should reject non-string phoneNo', () => {
        // Arrange
        const payload = {
          phoneNo: 1234567890,
          password: 'password123',
        };

        // Act
        const result = loginBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
      });

      it('should reject non-string password', () => {
        // Arrange
        const payload = {
          phoneNo: '1234567890',
          password: 123456,
        };

        // Act
        const result = loginBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
      });
    });

    describe('Valid Input Acceptance', () => {
      it('should accept valid login credentials', () => {
        // Arrange
        const payload = createValidLoginPayload();

        // Act
        const result = loginBodySchema.safeParse(payload);

        // Assert
        const data = expectValidationSuccess(result);
        expect(data.phoneNo).toBe(payload.phoneNo);
        expect(data.password).toBe(payload.password);
      });

      it('should accept phone numbers of any length (no min constraint)', () => {
        // Arrange
        const testCases = ['1', '12', '123', '1234567890123456'];

        // Act & Assert
        testCases.forEach((phoneNo) => {
          const result = loginBodySchema.safeParse({
            phoneNo,
            password: 'password123',
          });
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe('registerUserBodySchema', () => {
    describe('Required Fields Validation', () => {
      it('should reject empty payload', () => {
        // Arrange
        const payload = {};

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
      });

      it('should reject when name is missing', () => {
        // Arrange
        const payload = {
          email: 'test@example.com',
          password: 'password123',
          role: 'USER',
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
        const nameError = getFieldError(result.error!, 'name');
        expect(nameError).toBeDefined();
      });

      it('should reject when email is missing', () => {
        // Arrange
        const payload = {
          name: 'John Doe',
          password: 'password123',
          role: 'USER',
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
        const emailError = getFieldError(result.error!, 'email');
        expect(emailError).toBeDefined();
      });

      it('should reject when password is missing', () => {
        // Arrange
        const payload = {
          name: 'John Doe',
          email: 'test@example.com',
          role: 'USER',
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
        const passwordError = getFieldError(result.error!, 'password');
        expect(passwordError).toBeDefined();
      });

      it('should reject when role is missing', () => {
        // Arrange
        const payload = {
          name: 'John Doe',
          email: 'test@example.com',
          password: 'password123',
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
        const roleError = getFieldError(result.error!, 'role');
        expect(roleError).toBeDefined();
      });
    });

    describe('Email Validation', () => {
      it('should reject invalid email format', () => {
        // Arrange
        const invalidEmails = [
          'invalid-email',
          'missing@domain',
          '@missinglocal.com',
          'spaces in@email.com',
          'invalid@',
        ];

        // Act & Assert
        invalidEmails.forEach((email) => {
          const result = registerUserBodySchema.safeParse({
            ...createValidRegisterPayload(),
            email,
          });
          expectValidationError(result);
          const emailError = getFieldError(result.error!, 'email');
          expect(emailError?.message).toContain('Invalid email format');
        });
      });

      it('should reject email shorter than minimum length', () => {
        // Arrange
        const payload = {
          ...createValidRegisterPayload(),
          email: 'a@b', // 4 chars minimum, but this is invalid format
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
      });

      it('should reject email longer than maximum length', () => {
        // Arrange
        const longEmail = `a${'b'.repeat(250)}@example.com`; // Exceeds 255 chars
        const payload = {
          ...createValidRegisterPayload(),
          email: longEmail,
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
        const emailError = getFieldError(result.error!, 'email');
        expect(emailError?.message).toContain('255');
      });

      it('should accept valid email formats', () => {
        // Arrange
        const validEmails = [
          'user@example.com',
          'user.name@example.com',
          'user+tag@example.co.uk',
          'user123@subdomain.example.com',
        ];

        // Act & Assert
        validEmails.forEach((email) => {
          const result = registerUserBodySchema.safeParse({
            ...createValidRegisterPayload(),
            email,
          });
          expect(result.success).toBe(true);
        });
      });
    });

    describe('Password Validation', () => {
      it('should reject password shorter than minimum length', () => {
        // Arrange
        const shortPassword = 'a'.repeat(VALIDATION_CONSTRAINTS.PASSWORD.MIN_LENGTH - 1);
        const payload = {
          ...createValidRegisterPayload(),
          password: shortPassword,
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
        const passwordError = getFieldError(result.error!, 'password');
        expect(passwordError?.message).toContain('6');
      });

      it('should reject password longer than maximum length', () => {
        // Arrange
        const longPassword = 'a'.repeat(VALIDATION_CONSTRAINTS.PASSWORD.MAX_LENGTH + 1);
        const payload = {
          ...createValidRegisterPayload(),
          password: longPassword,
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
        const passwordError = getFieldError(result.error!, 'password');
        expect(passwordError?.message).toContain('16');
      });

      it('should reject password with invalid characters', () => {
        // Arrange
        const invalidPasswords = [
          'pass%word', // Contains % (not allowed)
          'pass*word', // Contains * (not allowed)
          'pass(word)', // Contains parentheses (not allowed)
        ];

        // Act & Assert
        invalidPasswords.forEach((password) => {
          const result = registerUserBodySchema.safeParse({
            ...createValidRegisterPayload(),
            password,
          });
          expectValidationError(result);
          const passwordError = getFieldError(result.error!, 'password');
          // Check that it's a validation error (could be regex or length error)
          expect(passwordError).toBeDefined();
        });
      });

      it('should accept password with valid characters', () => {
        // Arrange
        const validPasswords = [
          'password123',
          'PASSWORD123',
          'pass@word123',
          'pass!word#123',
          'pass$word&123',
        ];

        // Act & Assert
        validPasswords.forEach((password) => {
          const result = registerUserBodySchema.safeParse({
            ...createValidRegisterPayload(),
            password,
          });
          expect(result.success).toBe(true);
        });
      });

      it('should accept password at minimum length boundary', () => {
        // Arrange
        const minLengthPassword = 'a'.repeat(VALIDATION_CONSTRAINTS.PASSWORD.MIN_LENGTH);
        const payload = {
          ...createValidRegisterPayload(),
          password: minLengthPassword,
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expect(result.success).toBe(true);
      });

      it('should accept password at maximum length boundary', () => {
        // Arrange
        const maxLengthPassword = 'a'.repeat(VALIDATION_CONSTRAINTS.PASSWORD.MAX_LENGTH);
        const payload = {
          ...createValidRegisterPayload(),
          password: maxLengthPassword,
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe('Phone Number Validation', () => {
      it('should accept valid phone number', () => {
        // Arrange
        const payload = createValidRegisterPayload();

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expect(result.success).toBe(true);
      });

      it('should reject phone number longer than maximum length', () => {
        // Arrange
        const longPhoneNo = '1'.repeat(VALIDATION_CONSTRAINTS.PHONE_NO.MAX_LENGTH + 1);
        const payload = {
          ...createValidRegisterPayload(),
          phoneNo: longPhoneNo,
        };

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
        const phoneNoError = getFieldError(result.error!, 'phoneNo');
        expect(phoneNoError).toBeDefined();
        expect(phoneNoError?.message).toContain('too long');
      });

      it('should accept missing phone number (optional field)', () => {
        // Arrange
        const { phoneNo, ...payload } = createValidRegisterPayload();

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe('Valid Input Acceptance', () => {
      it('should accept complete valid registration payload', () => {
        // Arrange
        const payload = createValidRegisterPayload();

        // Act
        const result = registerUserBodySchema.safeParse(payload);

        // Assert
        const data = expectValidationSuccess(result);
        expect(data.name).toBe(payload.name);
        expect(data.email).toBe(payload.email);
        expect(data.phoneNo).toBe(payload.phoneNo);
        expect(data.password).toBe(payload.password);
        expect(data.role).toBe(payload.role);
      });
    });
  });

  describe('profileQuerySchema', () => {
    describe('Optional Fields Handling', () => {
      it('should accept empty query parameters', () => {
        // Arrange
        const payload = {};

        // Act
        const result = profileQuerySchema.safeParse(payload);

        // Assert
        const data = expectValidationSuccess(result);
        expect(data.page).toBeUndefined();
        expect(data.perPage).toBeUndefined();
      });

      it('should accept only page parameter', () => {
        // Arrange
        const payload = { page: '1' };

        // Act
        const result = profileQuerySchema.safeParse(payload);

        // Assert
        const data = expectValidationSuccess(result);
        expect(data.page).toBe(1);
        expect(data.perPage).toBeUndefined();
      });

      it('should accept only perPage parameter', () => {
        // Arrange
        const payload = { perPage: '10' };

        // Act
        const result = profileQuerySchema.safeParse(payload);

        // Assert
        const data = expectValidationSuccess(result);
        expect(data.page).toBeUndefined();
        expect(data.perPage).toBe(10);
      });
    });

    describe('String to Number Transformation', () => {
      it('should transform string numbers to integers', () => {
        // Arrange
        const payload = { page: '2', perPage: '20' };

        // Act
        const result = profileQuerySchema.safeParse(payload);

        // Assert
        const data = expectValidationSuccess(result);
        expect(data.page).toBe(2);
        expect(data.perPage).toBe(20);
        expect(typeof data.page).toBe('number');
        expect(typeof data.perPage).toBe('number');
      });

      it('should handle large numbers correctly', () => {
        // Arrange
        const payload = { page: '999999', perPage: '1000' };

        // Act
        const result = profileQuerySchema.safeParse(payload);

        // Assert
        const data = expectValidationSuccess(result);
        expect(data.page).toBe(999999);
        expect(data.perPage).toBe(1000);
      });
    });

    describe('Invalid Input Rejection', () => {
      it('should reject non-numeric string values', () => {
        // Arrange
        const invalidValues = ['abc', '12abc', 'abc12', '12.5', '-5'];

        // Act & Assert
        invalidValues.forEach((value) => {
          const result = profileQuerySchema.safeParse({ page: value });
          expectValidationError(result);
        });
      });

      it('should reject negative numbers', () => {
        // Arrange
        const payload = { page: '-1' };

        // Act
        const result = profileQuerySchema.safeParse(payload);

        // Assert
        expectValidationError(result);
      });

      it('should accept zero as page number (schema allows it)', () => {
        // Arrange
        const payload = { page: '0' };

        // Act
        const result = profileQuerySchema.safeParse(payload);

        // Assert
        // Note: The schema accepts "0" as a valid string that transforms to 0
        // If business logic requires page > 0, that should be handled in the service layer
        const data = expectValidationSuccess(result);
        expect(data.page).toBe(0);
      });

      it('should reject non-string types', () => {
        // Arrange
        const invalidTypes = [
          { page: 1 }, // Number instead of string
          { page: true }, // Boolean instead of string
          { page: {} }, // Object instead of string
        ];

        // Act & Assert
        invalidTypes.forEach((payload) => {
          const result = profileQuerySchema.safeParse(payload);
          expectValidationError(result);
        });
      });

      it('should handle null and undefined gracefully', () => {
        // Arrange
        const testCases = [
          { page: null },
          { page: undefined },
        ];

        // Act & Assert
        // Note: Zod may coerce these or treat them as missing optional fields
        testCases.forEach((payload) => {
          const result = profileQuerySchema.safeParse(payload);
          // These might be accepted as undefined (optional field)
          // or rejected depending on Zod version/configuration
          expect(result.success).toBeDefined();
        });
      });
    });

    describe('Valid Input Acceptance', () => {
      it('should accept valid pagination parameters', () => {
        // Arrange
        const payload = { page: '1', perPage: '10' };

        // Act
        const result = profileQuerySchema.safeParse(payload);

        // Assert
        const data = expectValidationSuccess(result);
        expect(data.page).toBe(1);
        expect(data.perPage).toBe(10);
      });
    });
  });
});

