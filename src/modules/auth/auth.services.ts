import { PrismaClient, User } from "@prisma/client";
import { BadRequestException } from "../../exception/badrequest.exception";
import { hashPassword } from "../../utils/hash";
import { prisma } from "../../utils/prisma";
import { FoundUser, RegisterUserInput } from "./auth.types";
import { UserRole } from "../../enum/constants";
import baseLogger from "../../utils/logger/winston";

type PrismaTransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export const RegisterUser = async (
  prisma: PrismaClient | PrismaTransactionClient,
  body: RegisterUserInput
): Promise<User> => {
  const { email, phoneNo, password, role, name } = body;
  
  
    // const user = await findUserByUsernameAndRole(userName, role, phoneNo);
  const user = await findUserByPhoneNo(phoneNo);

    if (user) {
        throw new BadRequestException({
                message: "Phone number already exists",
                description: "Phone number should be unique",
            });
    }
    // Hash password
  const { hash, salt } = await hashPassword(password || 'admin123');
  
  const dataToCreate: Omit<RegisterUserInput, "password"> = {
    email,
    phoneNo,
    role,
    name,
  };
  baseLogger.info("==dataToCreate==:", dataToCreate);
    const created_user = await prisma.user.create({
        data: { ...dataToCreate, salt, password: hash },
    });

    //HERE WE ARE ASSIGN THE SUB USER TO ROLE

    return created_user;
};


/**
 * Finds a user by phone number
 * 
 * @param phoneNo - Phone number to search for
 * @returns Promise resolving to user or null if not found
 * 
 * @example
 * ```typescript
 * const user = await findUserByPhoneNo('1234567890');
 * if (user) {
 *   console.log(user.email);
 * }
 * ```
 */
export async function findUserByPhoneNo(phoneNo: string): Promise<FoundUser> {
  const user = await prisma.user.findUnique({
    where: {
      phoneNo: phoneNo,
    },
  });
  return user;
}


export async function getUserListCreatedByAdmin(): Promise<any> {
    const user = await prisma.user.findMany({
            where: {
        role: UserRole.USER,
        // createdBy: Number(authUser.id),
      },
                    select: {
                        id: true,
        name: true,
                    phoneNo: true,
        email: true,
            role: true,
        },
    });
    return user;
  }