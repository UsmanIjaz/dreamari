import type { FastifyPluginAsync } from "fastify";
import { topMajors, topCareers } from "@dreamari/dataset";
import { prisma } from "../db";
import { toBuildInput } from "../lib/buildInput";

export const matchRoutes: FastifyPluginAsync = async (app) => {
  // ---- top careers + top majors, with explainable breakdowns ----
  app.get(
    "/",
    { preHandler: app.requireStudent, schema: { tags: ["match"], summary: "My top careers + majors (explainable)", security: [{ cookieAuth: [] }] } },
    async (req) => {
      const build = await prisma.buildProfile.findUnique({ where: { studentId: req.authUser!.id } });
      // No completed BUILD yet → don't return a meaningless all-35% ranking.
      if (!build?.completedAt) return { needsBuild: true, careers: [], majors: [] };
      const input = toBuildInput(build);
      const careers = topCareers(input, 5).map((cs) => ({
        code: cs.career.code,
        title: cs.career.title,
        description: cs.career.description,
        matchPercent: cs.matchPercent,
        explanation: cs.explanation,
        breakdown: cs.breakdown,
      }));
      const majors = topMajors(input, 5).map((ms) => ({
        code: ms.major.code,
        title: ms.major.title,
        teaser: ms.major.teaser,
        icon: ms.major.icon,
        accent: ms.major.accent,
        matchPercent: ms.matchPercent,
        topCareer: ms.topCareer
          ? { code: ms.topCareer.career.code, title: ms.topCareer.career.title, matchPercent: ms.topCareer.matchPercent }
          : null,
      }));
      return { needsBuild: false, careers, majors };
    },
  );

  // ---- the swipe deck: top majors with their five sub-cards ----
  app.get(
    "/deck",
    { preHandler: app.requireStudent, schema: { tags: ["match"], summary: "Top majors to swipe (with sub-cards)", security: [{ cookieAuth: [] }] } },
    async (req) => {
      const build = await prisma.buildProfile.findUnique({ where: { studentId: req.authUser!.id } });
      if (!build?.completedAt) return { needsBuild: true, deck: [] };
      const input = toBuildInput(build);
      return {
        needsBuild: false,
        deck: topMajors(input, 5).map((ms) => ({
          code: ms.major.code,
          title: ms.major.title,
          teaser: ms.major.teaser,
          icon: ms.major.icon,
          accent: ms.major.accent,
          matchPercent: ms.matchPercent,
          leadCareer: ms.topCareer?.career.title ?? null,
          subCards: {
            classes: ms.major.classes,
            workstyle: ms.major.workstyle,
            skills: ms.major.skills,
            salaryOutlook: ms.major.salaryOutlook,
            dayInLife: ms.major.dayInLife,
          },
        })),
      };
    },
  );
};
