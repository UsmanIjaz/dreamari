import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../db";

const pick3 = { type: "array", items: { type: "string" }, maxItems: 3 } as const;

const BUILD_BODY = {
  type: "object",
  additionalProperties: false,
  properties: {
    audience: { type: "string" }, // "hs" | "uni" | "job"
    grade: { type: "string" },
    gpa: { type: "string" },
    subjects: pick3,
    strengths: pick3,
    days: pick3,
    values: pick3,
    energy: { type: "string" },
    team: { type: "string" },
    interaction: { type: "string" },
    years: { type: "string" },
    finance: { type: "string" },
    location: { type: "string" },
    pathPref: { type: "string", enum: ["college", "trades", "both"] },
  },
} as const;

type BuildBody = {
  audience?: string;
  grade?: string;
  gpa?: string;
  subjects?: string[];
  strengths?: string[];
  days?: string[];
  values?: string[];
  energy?: string;
  team?: string;
  interaction?: string;
  years?: string;
  finance?: string;
  location?: string;
  pathPref?: string;
};

export const buildRoutes: FastifyPluginAsync = async (app) => {
  // ---- get my BUILD profile ----
  app.get(
    "/",
    { preHandler: app.requireStudent, schema: { tags: ["build"], summary: "Get my BUILD profile", security: [{ cookieAuth: [] }] } },
    async (req) => {
      return prisma.buildProfile.findUnique({ where: { studentId: req.authUser!.id } });
    },
  );

  // ---- save / update my BUILD profile (validates the brief's "pick up to 3" rules) ----
  app.put(
    "/",
    {
      preHandler: app.requireStudent,
      schema: { tags: ["build"], summary: "Save my BUILD profile", security: [{ cookieAuth: [] }], body: BUILD_BODY },
    },
    async (req) => {
      const b = req.body as BuildBody;
      const data = {
        audience: b.audience,
        grade: b.grade,
        gpa: b.gpa,
        subjects: b.subjects ?? [],
        strengths: b.strengths ?? [],
        days: b.days ?? [],
        values: b.values ?? [],
        energy: b.energy,
        team: b.team,
        interaction: b.interaction,
        years: b.years,
        finance: b.finance,
        location: b.location,
        pathPref: b.pathPref,
        completedAt: new Date(),
      };
      return prisma.buildProfile.upsert({
        where: { studentId: req.authUser!.id },
        create: { studentId: req.authUser!.id, ...data },
        update: data,
      });
    },
  );
};
