import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../db";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["meta"],
        summary: "Liveness + DB connectivity check",
        response: {
          200: {
            type: "object",
            properties: { status: { type: "string" }, db: { type: "boolean" } },
          },
        },
      },
    },
    async (_req, reply) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return { status: "ok", db: true };
      } catch {
        return reply.code(503).send({ status: "degraded", db: false });
      }
    },
  );
};
