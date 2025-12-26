import { fmt } from "../../config";


// Get Committee Draw List Query
const committeeDrawQuery = {
  type: "object",
  required: ["committeeId"],
  properties: {
    committeeId: {
      type: "string",
      pattern: "^\\d+$",
      description: "Committee ID",
    },
  },
};

// Get User Wise Draw Paid Query (includes drawId)
const userWiseDrawPaidQuery = {
  type: "object",
  required: ["committeeId", "drawId"],
  properties: {
    committeeId: {
      type: "string",
      pattern: "^\\d+$",
      description: "Committee ID",
    },
    drawId: {
      type: "string",
      pattern: "^\\d+$",
      description: "Draw ID",
    },
  },
};

const committeeDrawListResponse = {
  200: {
    description: "Committee draws retrieved successfully",
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            committeeId: { type: "integer" },
            committeeDrawAmount: { type: "number" },
            committeeDrawPaidAmount: { type: "number" },
            committeeDrawMinAmount: { type: "number" },
            committeeDrawDate: { type: "string", format: "date-time" },
            committeeDrawTime: { type: "string", format: "date-time" },
          },
        },
      },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

export const getCommitteeDrawListSchema = {
  description: "Get list of draws for a committee",
  tags: ["Draw"],
  summary: "Get Committee Draw List",
  querystring: committeeDrawQuery,
  security: [{ bearerAuth: [] }],
  response: {
    ...committeeDrawListResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

// User Wise Draw Paid Body
const userWiseDrawPaidBody = {
  type: "object",
  required: ["committeeId", "drawId", "userId"],
  properties: {
    committeeId: {
      type: "integer",
      minimum: 1,
      description: "ID of the committee",
    },
    drawId: {
      type: "integer",
      minimum: 1,
      description: "ID of the draw",
    },
    userId: {
      type: "integer",
      minimum: 1,
      description: "ID of the user",
    },
    userDrawAmountPaid: {
      type: "number",
      minimum: 0,
      description: "Amount paid by user (calculated automatically if not provided)",
    },
    fineAmountPaid: {
      type: "number",
      minimum: 0,
      description: "Fine amount paid (calculated automatically if not provided)",
    },
  },
};

// Response for PATCH (single object)
const userWiseDrawPaidUpdateResponse = {
  200: {
    description: "User draw payment updated successfully",
    type: "object",
    properties: {
      data: {
        type: "object",
        properties: {
          id: { type: "integer" },
          committeeId: { type: "integer" },
          drawId: { type: "integer" },
          userId: { type: "integer" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              phoneNo: { type: "string" },
              email: { type: "string" },
              role: { type: "string" },
              userDrawAmountPaid: { type: "number" },
              fineAmountPaid: { type: "number" },
            },
          },
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

// Response for GET (array of objects)
const userWiseDrawPaidGetResponse = {
  200: {
    description: "User draw payment records retrieved successfully",
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            committeeId: { type: "integer" },
            drawId: { type: "integer" },
            userId: { type: "integer" },
            user: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
                phoneNo: { type: "string" },
                email: { type: "string" },
                isDrawCompleted : { type: "boolean" },
                role: { type: "string" },
                userDrawAmountPaid: { type: "number" },
                fineAmountPaid: { type: "number" },
              },
            },
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

export const updateUserWiseDrawPaidSchema = {
  description: "Update user-wise draw paid amount (Admin only). Calculates fine and draw amount automatically.",
  tags: ["Draw"],
  summary: "Update User Wise Draw Paid",
  body: userWiseDrawPaidBody,
  security: [{ bearerAuth: [] }],
  response: {
    ...userWiseDrawPaidUpdateResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    403: fmt.getSwaggerErrorResponse(403, "Forbidden - Admin only"),
    404: fmt.getSwaggerErrorResponse(404, "Committee or draw not found"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

export const getUserWiseDrawPaidSchema = {
  description: "Get user-wise draw paid amount for a specific committee and draw",
  tags: ["Draw"],
  summary: "Get User Wise Draw Paid",
  querystring: userWiseDrawPaidQuery,
  security: [{ bearerAuth: [] }],
  response: {
    ...userWiseDrawPaidGetResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    404: fmt.getSwaggerErrorResponse(404, "Committee or draw not found"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

//#region Update Draw Amount
const updateDrawAmountBody = {
  type: "object",
  required: ["committeeId", "drawId", "amount"],
  properties: {
    committeeId: { type: "integer", minimum: 1, description: "Committee ID" },
    drawId: { type: "integer", minimum: 1, description: "Draw ID" },
    amount: { type: "number", minimum: 0, description: "Amount to update" },
  },
};

const updateDrawAmountResponse = {
  200: {
    description: "Draw amount updated successfully",
    type: "object",
    properties: {
      data: { type: "object", properties: { id: { type: "integer" }, committeeId: { type: "integer" }, drawId: { type: "integer" }, amount: { type: "number" } } },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

export const updateDrawAmountSchema = {
  description: "Update draw amount",
  tags: ["Draw"],
  summary: "Update Draw Amount",
  body: updateDrawAmountBody,
  security: [{ bearerAuth: [] }],
  response: {
    ...updateDrawAmountResponse,
  },
  400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
  401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
  403: fmt.getSwaggerErrorResponse(403, "Forbidden - Admin only"),
  404: fmt.getSwaggerErrorResponse(404, "Committee or draw not found"),
  500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
};
//#endregion


//#region User Wise Draw Completed
const userWiseDrawCompletedBody = {
  type: "object",
  required: ["committeeId", "drawId", "userId", "isDrawCompleted"],
  properties: {
    committeeId: { type: "integer", minimum: 1, description: "Committee ID" },
    drawId: { type: "integer", minimum: 1, description: "Draw ID" },
    userId: { type: "integer", minimum: 1, description: "User ID" },
    isDrawCompleted: { type: "boolean", description: "Is draw completed" },
  },
};

const userWiseDrawCompletedResponse = {
  200: {
    description: "User draw completed updated successfully",
    type: "object",
    properties: {
      data: { type: "object", properties: { id: { type: "integer" }, committeeId: { type: "integer" }, drawId: { type: "integer" }, userId: { type: "integer" }, isDrawCompleted: { type: "boolean" } } },
    },
  },
};

export const userWiseDrawCompletedSchema = {
  description: "Update user-wise draw completed",
  tags: ["Draw"],
  summary: "User Wise Draw Completed",
  body: userWiseDrawCompletedBody,
  security: [{ bearerAuth: [] }],
  response: {
    ...userWiseDrawCompletedResponse,
  },
};
//#endregion