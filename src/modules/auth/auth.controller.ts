import { FastifyReply, FastifyRequest } from "fastify";
import { fmt } from "../../config";
import { signJwt } from "../../utils/jwt";
import { verifyPassword } from "../../utils/hash";
import { prisma } from "../../utils/prisma";
import { BadRequestException } from "../../exception/badrequest.exception";
import { RegisterUser, findUserByPhoneNo, getUserListCreatedByAdmin } from "./auth.services";
import { createSession, logLogout } from "../session/session.service";
import { PrismaClient } from "@prisma/client/extension";
import { getDataFromRequestContext } from "./helper";
import { redisClient } from "../../utils/redis";
import { ForbiddenException } from "../../exception/forbidden.exception";
import baseLogger from "../../utils/logger/winston";
import {
  AuthenticatedUserPayload,
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

export const REGISTER_USER = async (
  request: FastifyRequest<{ Body: RegisterUserRequestBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { email, phoneNo, password, role, name } = request.body;

  const createdData = await prisma.$transaction(
    async (transactionClient: PrismaClient) => {
      const data: RegisterUserInput = {
        email,
        phoneNo,
        password,
        role,
        name,
      };
      const createUser = await RegisterUser(transactionClient, data);

      return { createUser };
    }
  );
  await redisClient.del(`USERS${11}`);
  return reply
    .status(200)
    .send(fmt.formatResponse(createdData, "User Created Successfully"));
};


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
  const data = await getUserListCreatedByAdmin();
  return reply.status(200).send(
    fmt.formatResponse(
      data || [],
      "User List Fetched!"
    )
  );
};

