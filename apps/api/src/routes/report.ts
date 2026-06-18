import type { FastifyPluginAsync } from "fastify";
import { SwipeDecision } from "@prisma/client";
import { MAJOR_BY_CODE, rankCareers, buildCareerReport, type CareerScore } from "@dreamari/dataset";
import { prisma } from "../db";
import { toBuildInput } from "../lib/buildInput";
import { httpError } from "../lib/http";

export const reportRoutes: FastifyPluginAsync = async (app) => {
  // ---- the Career Report: careers grouped by the student's liked majors ----
  app.get(
    "/",
    { preHandler: app.requireStudent, schema: { tags: ["report"], summary: "Career Report for my liked majors", security: [{ cookieAuth: [] }] } },
    async (req) => {
      const studentId = req.authUser!.id;
      const build = await prisma.buildProfile.findUnique({ where: { studentId } });
      const input = toBuildInput(build);
      const liked = await prisma.swipe.findMany({ where: { studentId, decision: SwipeDecision.LIKE } });
      const byCode = new Map(rankCareers(input).map((s) => [s.career.code, s]));

      const groups = liked
        .map((s) => MAJOR_BY_CODE[s.majorCode])
        .filter(Boolean)
        .map((major) => ({
          major: { code: major.code, title: major.title, accent: major.accent, icon: major.icon },
          careers: major.linkedCareers
            .map((c) => byCode.get(c))
            .filter((cs): cs is CareerScore => Boolean(cs))
            .sort((a, b) => b.raw - a.raw)
            .map((cs) => ({
              code: cs.career.code,
              title: cs.career.title,
              description: cs.career.description,
              matchPercent: cs.matchPercent,
              explanation: cs.explanation,
            })),
        }));

      return { likedMajors: liked.map((s) => s.majorCode), groups };
    },
  );

  // ---- the full, personalized report for one career ----
  app.get(
    "/career/:code",
    { preHandler: app.requireStudent, schema: { tags: ["report"], summary: "Full Career Report for one career", security: [{ cookieAuth: [] }] } },
    async (req, reply) => {
      const { code } = req.params as { code: string };
      const build = await prisma.buildProfile.findUnique({ where: { studentId: req.authUser!.id } });
      const input = toBuildInput(build);
      const cs = rankCareers(input).find((s) => s.career.code === code);
      if (!cs) throw httpError(404, "Unknown career");
      return buildCareerReport(cs);
    },
  );
};
