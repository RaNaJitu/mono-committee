import { FastifyRequest } from "fastify";
import { BadRequestException } from "../../exception/badrequest.exception";
// import { prisma } from "../../utils/prisma"; // Commented out - function below is disabled

export function getDataFromRequestContext<T>(
  request: FastifyRequest,
  key: string
): T {
  const data = (request.requestContext.get as any)(key);

  if (!data || typeof data !== "object" || !("data" in data)) {
    throw new BadRequestException({
      message: `${key} not found in request context`,
      description: `${key} not found in request context`,
    });
  }
  return data.data as T;
}

