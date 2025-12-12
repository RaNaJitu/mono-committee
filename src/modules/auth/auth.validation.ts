import zod from "zod";

export const registerUserBodySchema = zod.object({
  name: zod.string({ message: "Name must be a string" }),
  email: zod
    .string({ message: "Email must be a string" })
    .email("Invalid email format")
    .min(4, "The email should have at least 4 characters.")
    .max(255, "The email cannot exceed 255 characters."),
  phoneNo: zod
    .string({ message: "PhoneNo must be a string" })
    .max(16, "The phoneNo seems to be too long.")
    .optional(),
  password: zod
    .string()
    .min(6, "The password should have at least 6 characters or more.")
    .max(16, "The password cannot exceed more than 16 characters!")
    .regex(
      /^[a-zA-Z0-9@!#$&]+$/,
      "The Password can only contain letters, numbers, and the symbols @, !, #, $, &"
    ),
  role: zod.string({
    message: "role should be String and reuired field",
  })
});

export const loginBodySchema = zod.object(
  {
    // email: zod.string({ message: "The email should be string format" }),
    password: zod
      .string({ message: "The password should be string format " })
      .min(6, "The password should have at least 6 characters or more.")
      .regex(
        /^[a-zA-Z0-9@!#$&]+$/,
        "The Password can only contain letters, numbers, and the symbols @, !, #, $, &"
      ),
    phoneNo: zod.string({ message: "The phoneNo should be string format" }),
  },
  { message: "Body is required" }
);

export const changePasswordBodySchema = zod.object(
  {
    oldPassword: zod
      .string({ message: "The oldPassword should be string format" })
      .min(6, "The oldPassword should have at least 6 characters or more.")
      .regex(
        /^[a-zA-Z0-9@!#$&]+$/,
        "The Password can only contain letters, numbers, and the symbols @, !, #, $, &"
      ),
    newPassword: zod.string({
      message: "The newPassword should be string format ",
    }).min(6, "The newPassword should have at least 6 characters or more.")
      .regex(
        /^[a-zA-Z0-9@!#$&]+$/,
        "The Password can only contain letters, numbers, and the symbols @, !, #, $, &"
      ),
  },
  { message: "Body is required" }
);

// Query Schemas
export const profileQuerySchema = zod.object({
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

export const forgotPasswordBodySchema = zod.object({
  phoneNo: zod.string({ message: "The phoneNo should be string format" }),
  newPassword: zod.string({ message: "The newPassword should be string format" }).min(6, "The newPassword should have at least 6 characters or more.").regex(
    /^[a-zA-Z0-9@!#$&]+$/,
    "The Password can only contain letters, numbers, and the symbols @, !, #, $, &"
  ),
  confirmPassword: zod.string({ message: "The confirmPassword should be string format" }).min(6, "The confirmPassword should have at least 6 characters or more.").regex(
    /^[a-zA-Z0-9@!#$&]+$/,
    "The Password can only contain letters, numbers, and the symbols @, !, #, $, &"
  ),
});