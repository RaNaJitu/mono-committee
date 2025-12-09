import zod from "zod";

// Body Schemas
export const addCommitteeBodySchema = zod.object({
  committeeName: zod
    .string({ message: "Committee name must be a string" })
    .min(1, "Committee name is required")
    .max(100, "Committee name cannot exceed 100 characters"),
  committeeAmount: zod
    .number({ message: "Committee amount must be a number" })
    .positive("Committee amount must be positive")
    .min(1, "Committee amount must be at least 1"),
  commissionMaxMember: zod
    .number({ message: "Maximum members must be a number" })
    .int("Maximum members must be an integer")
    .positive("Maximum members must be positive")
    .min(1, "Maximum members must be at least 1"),
  noOfMonths: zod
    .number({ message: "Number of months must be a number" })
    .int("Number of months must be an integer")
    .positive("Number of months must be positive")
    .min(1, "Number of months must be at least 1"),
  fineAmount: zod
    .number({ message: "Fine amount must be a number" })
    .nonnegative("Fine amount cannot be negative")
    .optional(),
  extraDaysForFine: zod
    .number({ message: "Extra days for fine must be a number" })
    .int("Extra days for fine must be an integer")
    .nonnegative("Extra days for fine cannot be negative")
    .optional(),
  startCommitteeDate: zod
    .date({ message: "Start committee date must be a valid date" })
    .optional()
    .nullable(),
});

export const addCommitteeMemberBodySchema = zod.object({
  committeeId: zod
    .number({ message: "Committee ID must be a number" })
    .int("Committee ID must be an integer")
    .positive("Committee ID must be positive"),
  name: zod
    .string({ message: "Name must be a string" })
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  phoneNo: zod
    .string({ message: "Phone number must be a string" })
    .min(10, "Phone number must be at least 10 characters")
    .max(16, "Phone number cannot exceed 16 characters")
    .regex(/^[0-9+\-() ]+$/, "Phone number contains invalid characters"),
  password: zod
    .string({ message: "Password must be a string" })
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password cannot exceed 16 characters")
    .optional(),
  email: zod
    .string({ message: "Email must be a string" })
    .email("Invalid email format")
    .optional(),
});

export const userWiseDrawPaidBodySchema = zod.object({
  committeeId: zod
    .number({ message: "Committee ID must be a number" })
    .int("Committee ID must be an integer")
    .positive("Committee ID must be positive"),
  drawId: zod
    .number({ message: "Draw ID must be a number" })
    .int("Draw ID must be an integer")
    .positive("Draw ID must be positive"),
  userId: zod
    .number({ message: "User ID must be a number" })
    .int("User ID must be an integer")
    .positive("User ID must be positive"),
  userDrawAmountPaid: zod
    .number({ message: "User draw amount paid must be a number" })
    .nonnegative("User draw amount paid cannot be negative")
    .optional(),
  fineAmountPaid: zod
    .number({ message: "Fine amount paid must be a number" })
    .nonnegative("Fine amount paid cannot be negative")
    .optional(),
});

// Query Schemas
export const committeeMemberQuerySchema = zod.object({
  committeeId: zod
    .string({ message: "Committee ID must be provided in query" })
    .regex(/^\d+$/, "Committee ID must be a valid number")
    .transform((val) => Number(val)),
});

export const committeeDrawQuerySchema = zod.object({
  committeeId: zod
    .string({ message: "Committee ID must be provided in query" })
    .regex(/^\d+$/, "Committee ID must be a valid number")
    .transform((val) => Number(val)),
  drawId: zod
    .string({ message: "Draw ID must be provided in query" })
    .regex(/^\d+$/, "Draw ID must be a valid number")
    .transform((val) => Number(val))
    .optional(),
});

export const committeeListQuerySchema = zod.object({
  page: zod
    .string({ message: "Page must be a string" })
    .regex(/^\d+$/, "Page must be a valid number")
    .transform((val) => Number(val))
    .optional(),
  perPage: zod
    .string({ message: "Per page must be a string" })
    .regex(/^\d+$/, "Per page must be a valid number")
    .transform((val) => Number(val))
    .optional(),
});

export const userWiseDrawPaidQuerySchema = zod.object({
  committeeId: zod
    .string({ message: "Committee ID must be provided in query" })
    .regex(/^\d+$/, "Committee ID must be a valid number")
    .transform((val) => Number(val)),
  drawId: zod
    .string({ message: "Draw ID must be provided in query" })
    .regex(/^\d+$/, "Draw ID must be a valid number")
    .transform((val) => Number(val)),
});

