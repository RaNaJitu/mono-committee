import { PrismaClient, User } from "@prisma/client";
import { BadRequestException } from "../../exception/badrequest.exception";
import { hashPassword } from "../../utils/hash";
import { prisma } from "../../utils/prisma";
import { FoundUser, RegisterUserInput } from "./auth.types";
import { UserRole } from "../../enum/constants";
import baseLogger from "../../utils/logger/winston";

type PrismaTransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

/**
 * Finds a user by phone number using the provided Prisma client (can be transaction client)
 */
const findUserByPhoneNoWithClient = async (
  client: PrismaClient | PrismaTransactionClient,
  phoneNo: string
): Promise<FoundUser> => {
  const user = await client.user.findUnique({
    where: {
      phoneNo: phoneNo,
    },
  });
  return user;
};

export const RegisterUser = async (
  prismaClient: PrismaClient | PrismaTransactionClient,
  body: RegisterUserInput
): Promise<User> => {
  const { email, phoneNo, password, role, name } = body;
  
  try {
    // Check if user already exists - use the same client (transaction or regular)
    // This ensures the check happens within the transaction if using transaction client
    const existingUser = await findUserByPhoneNoWithClient(prismaClient, phoneNo);

    if (existingUser) {
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
    
    baseLogger.info("==dataToCreate==:", dataToCreate, salt, hash);
    
    // Create user - if this fails, transaction will rollback automatically
    const created_user = await prismaClient.user.create({
      data: { ...dataToCreate, salt, password: hash },
    });

    //HERE WE ARE ASSIGN THE SUB USER TO ROLE

    return created_user;
  } catch (error) {
    // Log the error for debugging
    baseLogger.error("Error during user registration", {
      error: error instanceof Error ? error.message : String(error),
      phoneNo,
      email,
    });
    
    // Re-throw the error so the transaction can rollback
    // If it's already a BadRequestException, it will be handled by the error handler
    throw error;
  }
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
  
export async function updateUserPassword(id: number, hash: string, salt: string): Promise<void> {
  await prisma.user.update({
    where: { id: id },
    data: { password: hash, salt: salt },
  });
}