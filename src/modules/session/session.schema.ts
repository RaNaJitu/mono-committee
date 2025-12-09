import { fmt } from "../../config";

// Create Session Body
const createSessionBody = {
  type: "object",
  required: ["userId", "token"],
  properties: {
    userId: {
      type: "integer",
      minimum: 1,
      description: "User ID",
    },
    token: {
      type: "string",
      minLength: 1,
      description: "Session token",
    },
  },
};

const createSessionResponse = {
  201: {
    description: "Session created successfully",
    type: "object",
    properties: {
      id: { type: "integer" },
      userId: { type: "integer" },
      token: { type: "string" },
      ipAddress: { type: "string" },
      logType: { type: "string", enum: ["login", "logout"] },
      browserInfo: { type: "string" },
      device: { type: "string", enum: ["desktop", "mobile", "tablet"] },
      createdAt: { type: "string", format: "date-time" },
    },
  },
};

export const createSessionSchema = {
  description: "Create a new session for user login tracking",
  tags: ["Session"],
  summary: "Create Session",
  body: createSessionBody,
  response: {
    ...createSessionResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

// Logout Body
const logoutBody = {
  type: "object",
  required: ["userId"],
  properties: {
    userId: {
      type: "integer",
      minimum: 1,
      description: "User ID",
    },
    token: {
      type: "string",
      description: "Session token (optional)",
    },
  },
};

const logoutResponse = {
  200: {
    description: "Logout successful",
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },
};

export const logoutSessionSchema = {
  description: "Logout user and mark session token as expired",
  tags: ["Session"],
  summary: "Logout Session",
  body: logoutBody,
  response: {
    ...logoutResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

// Login Activities Query
const loginActivitiesQuery = {
  type: "object",
  properties: {
    dateFrom: {
      type: "string",
      format: "date-time",
      description: "Start date for filtering activities (ISO 8601 format)",
    },
    dateTo: {
      type: "string",
      format: "date-time",
      description: "End date for filtering activities (ISO 8601 format)",
    },
  },
};

const loginActivitiesResponse = {
  200: {
    description: "Login activities retrieved successfully",
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            token: { type: "string" },
            ipAddress: { type: "string" },
            logType: { type: "string", enum: ["login", "logout"] },
            browserInfo: { type: "string" },
            device: { type: "string" },
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

export const loginActivitiesSchema = {
  description: "Get past login activities for the authenticated user",
  tags: ["Session"],
  summary: "Get Login Activities",
  querystring: loginActivitiesQuery,
  security: [{ bearerAuth: [] }],
  response: {
    ...loginActivitiesResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

