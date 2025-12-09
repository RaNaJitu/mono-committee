import { FastifyInstance } from "fastify";
import authRoutes from "./auth.route";

export default async (fastify: FastifyInstance) => {
  for (const route of authRoutes) {
    if (Array.isArray(route.preHandler)) {
      route.preHandler = [...route.preHandler];
    }
    fastify.route(route);
  }
};
