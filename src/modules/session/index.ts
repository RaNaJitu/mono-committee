import { FastifyInstance } from "fastify";
import sessionRoutes from "./session.routes";

export default async (fastify: FastifyInstance) => {
  for (const route of  sessionRoutes ) {
    if (Array.isArray(route.preHandler)) {
        route.preHandler = [...route.preHandler];
    }
    fastify.route(route);
  }
};
