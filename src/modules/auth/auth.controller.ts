import { FastifyReply, FastifyRequest } from "fastify";
import { fmt } from "../../config";
import { signJwt } from "../../utils/jwt";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { prisma } from "../../utils/prisma";
import { BadRequestException } from "../../exception/badrequest.exception";
import { RegisterUser, findUserByPhoneNo, getUserListCreatedByAdmin, updateUserPassword } from "./auth.services";
import { createSession, logLogout } from "../session/session.service";
import { getDataFromRequestContext } from "./helper";
import { redisClient } from "../../utils/redis";
import { ForbiddenException } from "../../exception/forbidden.exception";
import baseLogger from "../../utils/logger/winston";
import {
  AuthenticatedUserPayload,
  ChangePasswordRequestBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  ProfileQuerystring,
  RegisterUserInput,
  RegisterUserRequestBody,
  SessionLogPayload,
  UserWithProfile,
} from "./auth.types";
import { UserRole } from "../../enum/constants";
import { getClientIP } from "../../config/rate-limit.config";
import { JWT_CONFIG } from "../../constants/security.constants";

//#region Login
export const LOGIN = async (
  request: FastifyRequest<{
    Body: LoginRequestBody;
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  baseLogger.info("==request body== :", request.body);
  const { phoneNo, password } = request.body;
  const user = await findUserByPhoneNo(phoneNo);

  if (!user) {
    throw new BadRequestException({
      message: "Invalid user or password",
      description: "The provided credentials are incorrect",
    });
  }

  const isPasswordValid = await verifyPassword(password, user.salt, user.password);
  if (!isPasswordValid) {
    throw new ForbiddenException({
      message: "Invalid password",
      description: "The provided password is incorrect",
    });
  }

  const profileImage =
    "profileImage" in user ? (user as UserWithProfile).profileImage ?? null : null;
  const userPayload: AuthenticatedUserPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
    phoneNo: user.phoneNo,
    profileImage,
  };

  const accessToken = await signJwt({ data: userPayload });

  const refreshToken = signJwt({
    data: { ...userPayload, expiresIn: JWT_CONFIG.REFRESH_EXPIRY },
    expiresIn: JWT_CONFIG.REFRESH_EXPIRY,
  });

  const clientIP = getClientIP(request);
  const sessionData: SessionLogPayload = {
    userId: user.id,
    token: accessToken,
    ipAddress: clientIP,
    logType: "login",
    refreshToken,
    browserInfo: (request.headers["user-agent"] as string) || "unknown",
  };

  const responsePayload: AuthenticatedUserPayload = {
    ...userPayload,
    refreshToken,
  };
  await createSession(sessionData);

  return reply.status(200).send(
    fmt.formatResponse(
      {
        accessToken,
        ...responsePayload,
        profileImageUrl:
          profileImage !== "" && profileImage !== null
            ? `${process.env.BASE_BUNNYCDN_URL}USER/${profileImage}`
            : "",
      },
      "Login Successful!"
    )
  );
};
//#endregion

//#region Register User
export const REGISTER_USER = async (
  request: FastifyRequest<{ Body: RegisterUserRequestBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { email, phoneNo, password, role, name } = request.body;

  try {
    // Use transaction to ensure atomicity - if any error occurs, user creation is rolled back
    const createdData = await prisma.$transaction(
      async (transactionClient) => {
        const data: RegisterUserInput = {
          email,
          phoneNo,
          password,
          role,
          name,
          createdBy: undefined,
        };
        
        // RegisterUser will throw an error if user already exists or creation fails
        // This will cause the transaction to rollback automatically
        const createUser = await RegisterUser(transactionClient, data);

        return { createUser };
      },
      {
        // Transaction timeout (5 seconds)
        timeout: 5000,
        // Maximum number of retries
        maxWait: 5000,
        // Isolation level
        isolationLevel: 'ReadCommitted',
      }
    );

    // Only clear cache if user creation was successful
    // If Redis fails, log error but don't fail the request (user is already created)
    try {
      if (redisClient && redisClient.isOpen) {
        await redisClient.del(`USERS${11}`);
      }
    } catch (cacheError) {
      // Log cache error but don't fail the request
      baseLogger.warn("Failed to clear user cache after registration", {
        error: cacheError instanceof Error ? cacheError.message : String(cacheError),
      });
    }

    return reply
      .status(200)
      .send(fmt.formatResponse(createdData, "User Created Successfully"));
  } catch (error) {
    // Any error in the transaction will automatically rollback the user creation
    // The error handler will catch and format the response
    baseLogger.error("User registration failed", {
      error: error instanceof Error ? error.message : String(error),
      phoneNo,
      email,
    });
    
    // Re-throw to let the global error handler process it
    throw error;
  }
};
//#endregion

//#region Logout
export const LOGOUT = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
    request,
    "data"
  );
  const { clientip } = request.headers as { clientip?: string };

  const browserInfo =
    (request.headers["user-agent-data"] as string) || "unknown";
  await logLogout(authUser.id, clientip ?? "unknown", browserInfo, false);

  return reply.status(200).send(fmt.formatResponse({}, "Logout Successful!"));
};
//#endregion

//#region Get Current User Profile
export const GET_CURRENT_USER_PROFILE = async (
  request: FastifyRequest<{ Querystring: ProfileQuerystring }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
    request,
    "data"
  );

  const data = await findUserByPhoneNo(authUser.phoneNo);

  return reply.status(200).send(
    fmt.formatResponse(
      {
        ...data,
      },
      "User Profile Fetched!"
    )
  );
};
//#endregion

//#region Get User List Created By Admin
export const GET_USER_LIST_CREATED_BY_ADMIN = async (
  request: FastifyRequest<{
    Querystring: ProfileQuerystring
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser: AuthenticatedUserPayload = getDataFromRequestContext<AuthenticatedUserPayload>(
    request,
    "data"
  );
  baseLogger.info("==authUser==:", authUser);

  if(authUser.role !== UserRole.ADMIN) {
    throw new BadRequestException({
      message: "You are not authorized to get user list",
      description: "You are not authorized to get user list",
    });
  }
  const data = await getUserListCreatedByAdmin(authUser);
  return reply.status(200).send(
    fmt.formatResponse(
      data || [],
      "User List Fetched!"
    )
  );
};
//#endregion

//#region Change Password
export const CHANGE_PASSWORD = async (
  request: FastifyRequest<{ Body: ChangePasswordRequestBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser: AuthenticatedUserPayload = getDataFromRequestContext<AuthenticatedUserPayload>(
    request,
    "data"
  );
  const { oldPassword, newPassword } = request.body;
  const user = await findUserByPhoneNo(authUser.phoneNo);
  if (!user) {
    throw new BadRequestException({
      message: "User not found",
      description: "User not found",
    });
  }
  const isPasswordValid = await verifyPassword(oldPassword, user.salt, user.password);
  if (!isPasswordValid) {
    throw new ForbiddenException({
      message: "Invalid password",
      description: "The provided password is incorrect",
    });
  }
  const { hash, salt } = await hashPassword(newPassword);
  await updateUserPassword(user.id, hash, salt);
  return reply.status(200).send(fmt.formatResponse({}, "Password Changed Successfully"));
};
//#endregion

//#region Forgot Password
export const FORGOT_PASSWORD = async (
  request: FastifyRequest<{ Body: ForgotPasswordRequestBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { newPassword, confirmPassword, phoneNo } = request.body;
  if(newPassword !== confirmPassword) {
    throw new BadRequestException({
      message: "New password and confirm password do not match",
      description: "New password and confirm password do not match",
    });
  }
  const user = await findUserByPhoneNo(phoneNo);
  if (!user) {
    throw new BadRequestException({
      message: "User not found",
      description: "User not found",
    });
  }
  const { hash, salt } = await hashPassword(newPassword);
  await updateUserPassword(user.id, hash, salt);
  return reply.status(200).send(fmt.formatResponse({}, "Password Changed Successfully"));
};
//#endregion


