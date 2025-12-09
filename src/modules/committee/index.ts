import { FastifyInstance } from "fastify";
import committeeRoutes from "./committee.route";

export default async (fastify: FastifyInstance) => {
  for (const route of committeeRoutes) {
    if (Array.isArray(route.preHandler)) {
      route.preHandler = [...route.preHandler];
    }
    fastify.route(route);
  }
};
