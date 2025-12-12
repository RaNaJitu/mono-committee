import { fmt } from "../../config";

const registerUserBody = {
  type: "object",
  required: ["email", "phoneNo", "password", "role", "name"],
  properties: {
    email: {
      type: "string",
      minLength: 4,
    },
    phoneNo: {
      type: "string",
      minLength: 10,
    },
    password: {
      type: "string",
      minLength: 8,
    },
    role: {
      type: "string",
    },
    name: {
      type: "string",
    },
  },
};

const registerUserResponse = {
  200: {
    description: "Successful response",
    type: "object",
    properties: {
      data: {
        type: "object",
        properties: {
          createUser: {
            type: "object",
            properties: {
              id: { type: "integer" },
              email: { type: "string" },
              name: { type: "string" },
              phoneNo: { type: "string" },
              role: { type: "string" },
              status: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

export const registerUser = {
  description: "register user after otp verification",
  tags: ["UserAuth"],
  summary: "register white label user",
  body: registerUserBody,
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: {
    ...registerUserResponse,
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

export const loginUserBody = {
  type: "object",
  required: ["phoneNo", "password"],
  properties: {
    phoneNo: {
      type: "string",
      minLength: 10,
      maxLength: 16,
      description: "User phone number",
    },
    password: {
      type: "string",
      minLength: 6,
      maxLength: 16,
      description: "User password",
    },
  },
};

const loginResponse = {
  200: {
    description: "Successful response",
    type: "object",
    properties: {
      data: {
        type: "object",
        properties: {
          features: {
            type: "array",
            items: {
              type: "object",
              properties: {
                multiplier: { type: "number" },
                name: { type: "string" },
              },
              required: ["multiplier", "name"],
            },
          },
          accessToken: { type: "string" },
          id: { type: "integer" },
          phoneNo: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string" },
          status: { type: "boolean" },
          refreshToken: { type: "string" },
          profileImage: { type: "string" },
          profileImageUrl: { type: "string" },
        },
      },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

export const loginSchema = {
  description: "Authenticate user with phone number and password",
  tags: ["UserAuth"],
  summary: "User Login",
  body: loginUserBody,
  response: {
    ...loginResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    403: fmt.getSwaggerErrorResponse(403, "Forbidden - Invalid credentials"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

const getProfileResponse = {
  200: {
    description: "Successful response",
    type: "object",
    properties: {
      data: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string" },
          phoneNo: { type: "string" },
          role: { type: "string" },
          status: { type: "boolean" },
          name: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

export const getProfileSchema = {
  description: "Get current authenticated user profile",
  tags: ["UserAuth"],
  summary: "Get User Profile",
  querystring: {
    type: "object",
    properties: {
      page: { type: "integer", minimum: 1, description: "Page number for pagination" },
      perPage: { type: "integer", minimum: 1, maximum: 100, description: "Items per page" },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: {
    ...getProfileResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

const logoutResponse = {
  200: {
    description: "Successful response",
    properties: {
      data: {
        type: "object",
      },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

export const logoutSchema = {
  description: "logout for white label user",
  tags: ["UserAuth"],
  summary: "logout for white label user",
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: {
    ...logoutResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

const userListQuery = {
  type: "object",
  properties: {
    page: {
      type: "integer",
      minimum: 1,
      description: "Page number for pagination",
    },
    perPage: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Items per page",
    },
  },
};

const userListResponse = {
  200: {
    description: "User list retrieved successfully",
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            phoneNo: { type: "string" },
            email: { type: "string" },
            role: { type: "string" },
            status: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

export const getUserListSchema = {
  description: "Get list of users created by admin (Admin only)",
  tags: ["UserAuth"],
  summary: "Get User List",
  querystring: userListQuery,
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: {
    ...userListResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    403: fmt.getSwaggerErrorResponse(403, "Forbidden - Admin only"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

const changePasswordBody = {
  type: "object",
  required: ["newPassword"],
  properties: {
    newPassword: {
      type: "string",
      minLength: 8,
    },
    oldPassword: {
      type: "string",
      minLength: 8,
    },
  },
};

export const changePasswordSchema = {
  description: "Change user password",
  tags: ["UserAuth"],
  summary: "Change User Password",
  body: changePasswordBody,
  security: [
    {
      bearerAuth: [],
    },
  ],
};

//#region Forgot Password
const forgotPasswordBody = {
  type: "object",
  required: ["newPassword", "confirmPassword"],
  properties: {
    phoneNo: {
      type: "string",
      minLength: 10,
      maxLength: 16,
      description: "User phone number",
    },
    newPassword: {
      type: "string",
      minLength: 6,
      regex: /^[a-zA-Z0-9@!#$&]+$/,
    },
    confirmPassword: {
      type: "string",
      minLength: 6,
      regex: /^[a-zA-Z0-9@!#$&]+$/,
    },
  },
};

export const forgotPasswordSchema = {
  description: "Forgot user password",
  tags: ["UserAuth"],
  summary: "Forgot User Password",
  body: forgotPasswordBody,
  response: {
    200: {
      description: "Successful response",
      type: "object",
      properties: {
        message: { type: "string" },
        success: { type: "boolean" },
        code: { type: "string" },
      },
    },
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};
//#endregion