import { fmt } from "../../config";
import { CommitteeTypeEnum } from "./committee.type";

// Committee List Response
const committeeListResponse = {
  200: {
    description: "Successful response",
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            committeeName: { type: "string" },
            committeeAmount: { type: "number" },
            commissionMaxMember: { type: "integer" },
            committeeStatus: { type: "integer", enum: [0, 1, 2] },
            noOfMonths: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            fineAmount: { type: "number", nullable: true },
            extraDaysForFine: { type: "integer", nullable: true },
            startCommitteeDate: { type: "string", format: "date-time", nullable: true },
            committeeType: { type: "string" },
            fineStartDate: { type: "string", format: "date-time" },
            lotteryAmount: { type: "number", nullable: true },
            isUserDrawCompleted: { type: "boolean" },
          },
        },
      },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

// Add Committee Body
const addCommitteeBody = {
  type: "object",
  required: ["committeeName", "committeeAmount", "commissionMaxMember", "noOfMonths"],
  properties: {
    committeeName: {
      type: "string",
      minLength: 1,
      maxLength: 100,
      description: "Name of the committee",
    },
    committeeAmount: {
      type: "number",
      minimum: 1,
      description: "Total amount for the committee",
    },
    commissionMaxMember: {
      type: "integer",
      minimum: 1,
      description: "Maximum number of members allowed",
    },
    noOfMonths: {
      type: "integer",
      minimum: 1,
      description: "Number of months for the committee",
    },
    fineAmount: {
      type: "number",
      minimum: 0,
      description: "Fine amount per day (optional)",
    },
    extraDaysForFine: {
      type: "integer",
      minimum: 0,
      description: "Extra days before fine applies (optional)",
    },
    startCommitteeDate: {
      type: "string",
      format: "date-time",
      nullable: true,
      description: "Start date for the committee (optional)",
    },
    lotteryAmount: {
      type: "number",
      minimum: 0,
      description: "Lottery amount (optional)",
    },
    committeeType: {
      type: "string",
      enum: Object.values(CommitteeTypeEnum),
      description: "Type of the committee",
    },
    fineStartDate: {
      type: "string",
      format: "date-time",
      description: "Fine start date for the committee",
    },
  },
};

const addCommitteeResponse = {
  200: {
    description: "Committee created successfully",
    type: "object",
    properties: {
      data: {
        type: "object",
        properties: {
          id: { type: "integer" },
          committeeName: { type: "string" },
          committeeAmount: { type: "number" },
          commissionMaxMember: { type: "integer" },
          committeeStatus: { type: "integer" },
          noOfMonths: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

export const getCommitteeListSchema = {
  description: "Get list of committees for the authenticated user",
  tags: ["Committee"],
  summary: "Get Committee List",
  querystring: {
    type: "object",
    properties: {
      page: { type: "integer", minimum: 1, description: "Page number for pagination" },
      perPage: { type: "integer", minimum: 1, maximum: 100, description: "Items per page" },
    },
  },
  security: [{ bearerAuth: [] }],
  response: {
    ...committeeListResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

export const addCommitteeSchema = {
  description: "Create a new committee (Admin only)",
  tags: ["Committee"],
  summary: "Add Committee",
  body: addCommitteeBody,
  security: [{ bearerAuth: [] }],
  response: {
    ...addCommitteeResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    403: fmt.getSwaggerErrorResponse(403, "Forbidden - Admin only"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

// Add Committee Member Body
const addCommitteeMemberBody = {
  type: "object",
  required: ["committeeId", "name", "phoneNo"],
  properties: {
    committeeId: {
      type: "integer",
      minimum: 1,
      description: "ID of the committee",
    },
    name: {
      type: "string",
      minLength: 1,
      maxLength: 100,
      description: "Name of the member",
    },
    phoneNo: {
      type: "string",
      minLength: 10,
      maxLength: 16,
      pattern: "^[0-9+\\-() ]+$",
      description: "Phone number of the member",
    },
    password: {
      type: "string",
      minLength: 6,
      maxLength: 16,
      description: "Password for new user (optional, defaults to admin123)",
    },
    email: {
      type: "string",
      format: "email",
      description: "Email address (optional)",
    },
  },
};

const addCommitteeMemberResponse = {
  200: {
    description: "Committee member added successfully",
    type: "object",
    properties: {
      data: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string" },
          phoneNo: { type: "string" },
          role: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

export const addCommitteeMemberSchema = {
  description: "Add a member to a committee (Admin only). Creates user if doesn't exist.",
  tags: ["Committee"],
  summary: "Add Committee Member",
  body: addCommitteeMemberBody,
  security: [{ bearerAuth: [] }],
  response: {
    ...addCommitteeMemberResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    403: fmt.getSwaggerErrorResponse(403, "Forbidden - Admin only"),
    404: fmt.getSwaggerErrorResponse(404, "Committee not found"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

// Get Committee Members Query
const committeeMemberQuery = {
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

const committeeMemberResponse = {
  200: {
    description: "Committee members retrieved successfully",
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            committeeId: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
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
                isUserDrawCompleted: { type: "boolean" },
              },
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

export const getCommitteeMemberSchema = {
  description: "Get list of members for a committee",
  tags: ["Committee"],
  summary: "Get Committee Members",
  querystring: committeeMemberQuery,
  security: [{ bearerAuth: [] }],
  response: {
    ...committeeMemberResponse,
    400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
    401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
    500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
  },
};

//#region Get Committee Analysis
const committeeAnalysisQuery = {
  type: "object",
  required: ["committeeId"],
  properties: {
    committeeId: { type: "integer", minimum: 1, description: "Committee ID" },
  },
};

const committeeAnalysisResponse = {
  200: {
    description: "Committee analysis retrieved successfully",
    type: "object",
    properties: {
      data: {
        type: "object", properties: {
          id: { type: "integer" },
          committeeId: { type: "integer" },
          committeeName: { type: "string" },
          committeeAmount: { type: "number" },
          commissionMaxMember: { type: "integer" },
          committeeStatus: { type: "integer", enum: [0, 1, 2] },
          noOfMonths: { type: "integer" },
          fineAmount: { type: "number", nullable: true },
          extraDaysForFine: { type: "integer", nullable: true },
          startCommitteeDate: { type: "string", format: "date-time", nullable: true },
          analysis: { type: "object", properties: {
            totalMembers: { type: "integer" },
            totalCommitteeAmount: { type: "number" },
            totalCommitteePaidAmount: { type: "number" },
            totalCommitteeFineAmount: { type: "number" },
            noOfDrawsCompleted: { type: "integer" },
            totalDraws: { type: "integer" },
          } } 
        }
      },
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    },
  },
};

export const committeeAnalysisSchema = {
  description: "Get committee analysis",
  tags: ["Committee"],
  summary: "Get Committee Analysis",
  querystring: committeeAnalysisQuery,
  security: [{ bearerAuth: [] }],
  response: {
    ...committeeAnalysisResponse,
  },
  400: fmt.getSwaggerErrorResponse(400, "Bad Request"),
  401: fmt.getSwaggerErrorResponse(401, "Unauthorized"),
  500: fmt.getSwaggerErrorResponse(500, "Internal Server Error"),
};
//#endregion

