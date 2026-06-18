import type { FastifyPluginAsync } from "fastify";
import { InviteStatus, Prisma, SwipeDecision } from "@prisma/client";
import { MAJOR_BY_CODE, topMajors } from "@dreamari/dataset";
import { prisma } from "../db";
import { toBuildInput } from "../lib/buildInput";
import { httpError } from "../lib/http";
import { isValidEmail, sendInviteEmail } from "../lib/email";

function inviteCode(): string {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += s[Math.floor(Math.random() * s.length)];
  return `DRM-${out}`;
}

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.requireAdmin);

  // ---- invites ----
  app.post(
    "/invites",
    {
      schema: {
        tags: ["admin"],
        summary: "Create a student invite (name + email required; emails the link)",
        security: [{ cookieAuth: [] }],
        body: {
          type: "object",
          required: ["firstName", "email"],
          properties: {
            firstName: { type: "string", minLength: 1 },
            email: { type: "string", minLength: 3 },
            cohortId: { type: "string" },
          },
        },
      },
    },
    async (req, reply) => {
      const { firstName, cohortId, email } = (req.body as { firstName: string; cohortId?: string; email: string });
      if (!isValidEmail(email)) throw httpError(400, "A valid email address is required");
      let schoolId: string | null = null;
      let schoolName: string | null = null;
      if (cohortId) {
        const c = await prisma.cohort.findUnique({ where: { id: cohortId }, include: { school: true } });
        if (!c) throw httpError(400, "Unknown cohort");
        schoolId = c.schoolId;
        schoolName = c.school?.name ?? null;
      }
      const invite = await prisma.invite.create({
        data: { code: inviteCode(), intendedFirstName: firstName, email, createdById: req.authUser!.id, cohortId: cohortId ?? null, schoolId },
      });
      const mail = await sendInviteEmail({ to: email, code: invite.code, firstName, schoolName });
      return reply.code(201).send({ ...invite, emailSent: mail.sent, emailError: mail.error ?? null });
    },
  );

  app.get(
    "/invites",
    {
      schema: {
        tags: ["admin"],
        summary: "List invites (paginated + searchable)",
        security: [{ cookieAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
            offset: { type: "integer", minimum: 0, default: 0 },
            q: { type: "string" },
            status: { type: "string", enum: ["PENDING", "REDEEMED", "REVOKED"] },
          },
        },
      },
    },
    async (req) => {
      const { limit = 25, offset = 0, q, status } = req.query as { limit?: number; offset?: number; q?: string; status?: InviteStatus };
      const term = q?.trim();
      const where: Prisma.InviteWhereInput = {
        ...(status ? { status } : {}),
        ...(term
          ? {
              OR: [
                { code: { contains: term, mode: "insensitive" } },
                { intendedFirstName: { contains: term, mode: "insensitive" } },
                { email: { contains: term, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, invites] = await prisma.$transaction([
        prisma.invite.count({ where }),
        prisma.invite.findMany({ where, orderBy: { createdAt: "desc" }, include: { school: true, cohort: true }, take: limit, skip: offset }),
      ]);
      return {
        total,
        items: invites.map((i) => ({
          id: i.id,
          code: i.code,
          intendedFirstName: i.intendedFirstName,
          status: i.status,
          createdAt: i.createdAt,
          redeemedAt: i.redeemedAt,
          redeemedById: i.redeemedById,
          school: i.school ? { id: i.school.id, name: i.school.name } : null,
          cohort: i.cohort ? { id: i.cohort.id, label: i.cohort.label } : null,
        })),
      };
    },
  );

  app.delete(
    "/invites/:id",
    { schema: { tags: ["admin"], summary: "Revoke an invite", security: [{ cookieAuth: [] }] } },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const invite = await prisma.invite.findUnique({ where: { id } });
      if (!invite) throw httpError(404, "Not found");
      return prisma.invite.update({ where: { id }, data: { status: InviteStatus.REVOKED } });
    },
  );

  // ---- students: progress, not psychology ----
  // Raw assessment answers are gated behind ?includeAnswers=true (a deliberate
  // privacy decision mirroring the product's FERPA stance).
  app.get(
    "/students",
    {
      schema: {
        tags: ["admin"],
        summary: "Student roster with progress (paginated + searchable)",
        security: [{ cookieAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
            offset: { type: "integer", minimum: 0, default: 0 },
            q: { type: "string" },
          },
        },
      },
    },
    async (req) => {
      const { limit = 25, offset = 0, q } = req.query as { limit?: number; offset?: number; q?: string };
      const term = q?.trim();
      const where: Prisma.UserWhereInput = {
        role: { not: "admin" },
        ...(term
          ? {
              OR: [
                { name: { contains: term, mode: "insensitive" } },
                { school: { name: { contains: term, mode: "insensitive" } } },
                { cohort: { label: { contains: term, mode: "insensitive" } } },
              ],
            }
          : {}),
      };
      const [total, students] = await prisma.$transaction([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          include: { buildProfile: true, _count: { select: { swipes: true } }, school: true, cohort: true },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
      ]);
      const ids = students.map((s) => s.id);
      const likedGroups = ids.length
        ? await prisma.swipe.groupBy({ by: ["studentId"], where: { decision: SwipeDecision.LIKE, studentId: { in: ids } }, _count: { _all: true } })
        : [];
      const likedMap = new Map(likedGroups.map((g) => [g.studentId, g._count._all]));

      return {
        total,
        items: students.map((s) => {
          const leaning = s.buildProfile?.completedAt ? topMajors(toBuildInput(s.buildProfile), 1)[0]?.major.title : null;
          return {
            id: s.id,
            firstName: s.name,
            buildComplete: Boolean(s.buildProfile?.completedAt),
            swipeCount: s._count.swipes,
            likedCount: likedMap.get(s.id) ?? 0,
            leaning, // broad direction, not raw answers
            school: s.school?.name ?? null,
            grade: s.cohort?.label ?? null,
            lastActive: s.buildProfile?.updatedAt ?? s.createdAt,
          };
        }),
      };
    },
  );

  app.get(
    "/students/:id",
    { schema: { tags: ["admin"], summary: "One student's progress detail", security: [{ cookieAuth: [] }] } },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const includeAnswers = (req.query as { includeAnswers?: string }).includeAnswers === "true";
      const s = await prisma.user.findUnique({
        where: { id },
        include: { buildProfile: true, swipes: true },
      });
      if (!s || s.role === "admin") throw httpError(404, "Not found");
      const likedCount = s.swipes.filter((sw) => sw.decision === SwipeDecision.LIKE).length;
      const b = s.buildProfile;
      // Revealing raw answers is an accountable action — record who/when/whose.
      if (includeAnswers) {
        await prisma.auditLog.create({ data: { actorId: req.authUser!.id, action: "reveal_answers", targetId: s.id } });
      }
      return {
        id: s.id,
        firstName: s.name,
        buildComplete: Boolean(b?.completedAt),
        swipeCount: s.swipes.length,
        likedCount,
        leaning: b?.completedAt ? topMajors(toBuildInput(b), 3).map((m) => m.major.title) : [],
        // privacy gate — only the assessment answers, never ids/timestamps
        answers:
          includeAnswers && b
            ? {
                audience: b.audience,
                grade: b.grade,
                gpa: b.gpa,
                subjects: b.subjects,
                strengths: b.strengths,
                days: b.days,
                values: b.values,
                energy: b.energy,
                team: b.team,
                interaction: b.interaction,
                years: b.years,
                finance: b.finance,
                location: b.location,
                pathPref: b.pathPref,
              }
            : undefined,
      };
    },
  );

  // ---- aggregate analytics ----
  app.get(
    "/analytics",
    { schema: { tags: ["admin"], summary: "Aggregate analytics", security: [{ cookieAuth: [] }] } },
    async () => {
      const [totalStudents, completedBuilds, totalSwipes, popular] = await Promise.all([
        prisma.user.count({ where: { role: { not: "admin" } } }),
        prisma.buildProfile.count({ where: { completedAt: { not: null } } }),
        prisma.swipe.count(),
        prisma.swipe.groupBy({
          by: ["majorCode"],
          where: { decision: SwipeDecision.LIKE },
          _count: { _all: true },
          orderBy: { _count: { majorCode: "desc" } },
          take: 5,
        }),
      ]);
      return {
        totalStudents,
        completedBuilds,
        completionRate: totalStudents ? Math.round((completedBuilds / totalStudents) * 100) : 0,
        totalSwipes,
        popularMajors: popular.map((p) => ({
          code: p.majorCode,
          title: MAJOR_BY_CODE[p.majorCode]?.title ?? p.majorCode,
          likes: p._count._all,
        })),
      };
    },
  );

  // ---- audit log (accountability for sensitive actions like answer reveals) ----
  app.get(
    "/audit",
    { schema: { tags: ["admin"], summary: "Recent sensitive-action log", security: [{ cookieAuth: [] }] } },
    async () => {
      const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
      const ids = [...new Set(rows.flatMap((r) => [r.actorId, r.targetId].filter(Boolean) as string[]))];
      const users = ids.length ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : [];
      const nameOf = new Map(users.map((u) => [u.id, u.name]));
      return rows.map((r) => ({
        id: r.id,
        action: r.action,
        actor: nameOf.get(r.actorId) ?? r.actorId,
        target: r.targetId ? (nameOf.get(r.targetId) ?? r.targetId) : null,
        at: r.createdAt,
      }));
    },
  );
};
