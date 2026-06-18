import type { FastifyPluginAsync } from "fastify";
import { CAREERS, MAJORS } from "@dreamari/dataset";

/** Public reference content — the career & major datasets. */
export const contentRoutes: FastifyPluginAsync = async (app) => {
  app.get("/careers", { schema: { tags: ["content"], summary: "All careers" } }, async () => ({ careers: CAREERS }));
  app.get("/majors", { schema: { tags: ["content"], summary: "All majors" } }, async () => ({ majors: MAJORS }));
};
