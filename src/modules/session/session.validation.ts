import zod from "zod";

// Body Schemas
export const createSessionBodySchema = zod.object({
  userId: zod
    .number({ message: "User ID must be a number" })
    .int("User ID must be an integer")
    .positive("User ID must be positive"),
  token: zod
    .string({ message: "Token must be a string" })
    .min(1, "Token is required"),
});

export const logoutBodySchema = zod.object({
  userId: zod
    .number({ message: "User ID must be a number" })
    .int("User ID must be an integer")
    .positive("User ID must be positive"),
  token: zod
    .string({ message: "Token must be a string" })
    .min(1, "Token is required")
    .optional(),
});

// Query Schemas
export const loginActivitiesQuerySchema = zod.object({
  dateFrom: zod
    .string({ message: "Date from must be a string" })
    .datetime({ message: "Date from must be a valid ISO datetime" })
    .transform((val) => new Date(val))
    .optional(),
  dateTo: zod
    .string({ message: "Date to must be a string" })
    .datetime({ message: "Date to must be a valid ISO datetime" })
    .transform((val) => new Date(val))
    .optional(),
});

