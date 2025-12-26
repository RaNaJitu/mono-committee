import { FastifyInstance } from "fastify";
import drawRoutes from "./draw.route";

export default async (fastify: FastifyInstance) => {
  for (const route of drawRoutes) {
    if (Array.isArray(route.preHandler)) {
      route.preHandler = [...route.preHandler];
    }
    fastify.route(route);
  }
};
