import { User, UserRoleEnum } from "@prisma/client";

export interface LoginRequestBody {
  email: string;
  phoneNo: string;
  password: string;
}

export interface RegisterUserRequestBody {
  email: string;
  phoneNo: string;
  password: string;
  role: UserRoleEnum;
  name: string;
}

export type RegisterUserInput = RegisterUserRequestBody;

export interface ProfileQuerystring {
  page?: number;
  perPage?: number;
}

export interface AuthenticatedUserPayload {
  id: number;
  role: UserRoleEnum;
  email: string;
  phoneNo: string;
  profileImage?: string | null;
  refreshToken?: string;
}

export interface SessionLogPayload {
  userId: number;
  token: string;
  ipAddress: string;
  logType: "login" | "logout";
  refreshToken: string;
  browserInfo: string;
}

export interface UserWithProfile extends User {
  profileImage?: string | null;
}

export type FoundUser = UserWithProfile | null;

