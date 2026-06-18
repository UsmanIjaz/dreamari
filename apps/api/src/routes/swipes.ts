import type { FastifyPluginAsync } from "fastify";
import { SwipeDecision } from "@prisma/client";
import { MAJOR_BY_CODE } from "@dreamari/dataset";
import { prisma } from "../db";
import { httpError } from "../lib/http";

export const swipeRoutes: FastifyPluginAsync = async (app) => {
  // ---- record a swipe (idempotent per major) ----
  app.post(
    "/",
    {
      preHandler: app.requireStudent,
      schema: {
        tags: ["swipes"],
        summary: "Record a like/pass on a major, with the 5 facet answers (idempotent)",
        security: [{ cookieAuth: [] }],
        body: {
          type: "object",
          required: ["majorCode", "decision"],
          properties: {
            majorCode: { type: "string" },
            decision: { type: "string", enum: ["LIKE", "PASS"] },
            // the five "vibe check" answers (classes/workstyle/skills/salary/day)
            facetAnswers: { type: "array", items: { type: "boolean" }, maxItems: 5 },
          },
        },
      },
    },
    async (req) => {
      const { majorCode, decision, facetAnswers } = req.body as {
        majorCode: string;
        decision: SwipeDecision;
        facetAnswers?: boolean[];
      };
      if (!MAJOR_BY_CODE[majorCode]) throw httpError(400, "Unknown major");
      const studentId = req.authUser!.id;
      const answers = facetAnswers ?? [];
      const fit = answers.filter(Boolean).length;

      await prisma.swipe.upsert({
        where: { studentId_majorCode: { studentId, majorCode } },
        create: { studentId, majorCode, decision, fit, facetAnswers: answers },
        update: { decision, fit, facetAnswers: answers },
      });

      const [total, liked] = await Promise.all([
        prisma.swipe.count({ where: { studentId } }),
        prisma.swipe.count({ where: { studentId, decision: SwipeDecision.LIKE } }),
      ]);
      return { ok: true, total, likedCount: liked };
    },
  );

  // ---- my swipes (now including per-facet fit) ----
  app.get(
    "/",
    { preHandler: app.requireStudent, schema: { tags: ["swipes"], summary: "My swipes + liked count", security: [{ cookieAuth: [] }] } },
    async (req) => {
      const studentId = req.authUser!.id;
      const swipes = await prisma.swipe.findMany({ where: { studentId }, orderBy: { createdAt: "asc" } });
      return { swipes, likedCount: swipes.filter((s) => s.decision === SwipeDecision.LIKE).length };
    },
  );
};
