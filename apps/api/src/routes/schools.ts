import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../db";
import { httpError } from "../lib/http";
import { isValidEmail, sendInviteEmail } from "../lib/email";

const sec = [{ cookieAuth: [] }];

function inviteCode(): string {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += s[Math.floor(Math.random() * s.length)];
  return `DRM-${out}`;
}

/** Schools → Cohorts (grades) → per-cohort invites + bulk roster upload. Admin only. */
export const schoolRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.requireAdmin);

  // ---- schools ----
  app.post(
    "/schools",
    {
      schema: {
        tags: ["schools"],
        summary: "Create a school",
        security: sec,
        body: { type: "object", required: ["name"], properties: { name: { type: "string", minLength: 1 }, region: { type: "string" } } },
      },
    },
    async (req, reply) => {
      const { name, region } = req.body as { name: string; region?: string };
      const school = await prisma.school.create({ data: { name, region: region ?? null, createdById: req.authUser!.id } });
      return reply.code(201).send(school);
    },
  );

  app.get("/schools", { schema: { tags: ["schools"], summary: "List schools", security: sec } }, async () => {
    const schools = await prisma.school.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { cohorts: true, students: true, invites: true } } },
    });
    return schools.map((s) => ({
      id: s.id,
      name: s.name,
      region: s.region,
      cohortCount: s._count.cohorts,
      studentCount: s._count.students,
      inviteCount: s._count.invites,
      createdAt: s.createdAt,
    }));
  });

  app.get("/schools/:id", { schema: { tags: ["schools"], summary: "School detail with cohorts", security: sec } }, async (req) => {
    const { id } = req.params as { id: string };
    const school = await prisma.school.findUnique({
      where: { id },
      include: { cohorts: { orderBy: { createdAt: "asc" }, include: { _count: { select: { students: true, invites: true } } } } },
    });
    if (!school) throw httpError(404, "Not found");
    return {
      id: school.id,
      name: school.name,
      region: school.region,
      createdAt: school.createdAt,
      cohorts: school.cohorts.map((c) => ({
        id: c.id,
        label: c.label,
        gradeLevel: c.gradeLevel,
        studentCount: c._count.students,
        inviteCount: c._count.invites,
      })),
    };
  });

  app.patch(
    "/schools/:id",
    { schema: { tags: ["schools"], summary: "Update a school", security: sec, body: { type: "object", properties: { name: { type: "string" }, region: { type: "string" } } } } },
    async (req) => {
      const { id } = req.params as { id: string };
      const { name, region } = req.body as { name?: string; region?: string };
      return prisma.school.update({ where: { id }, data: { name, region } });
    },
  );

  app.delete("/schools/:id", { schema: { tags: ["schools"], summary: "Delete a school (cascades cohorts + invites)", security: sec } }, async (req) => {
    const { id } = req.params as { id: string };
    await prisma.school.delete({ where: { id } });
    return { ok: true };
  });

  // ---- cohorts (grades) ----
  app.post(
    "/schools/:schoolId/cohorts",
    {
      schema: {
        tags: ["schools"],
        summary: "Create a cohort (grade) in a school",
        security: sec,
        body: { type: "object", required: ["label"], properties: { label: { type: "string", minLength: 1 }, gradeLevel: { type: "string" } } },
      },
    },
    async (req, reply) => {
      const { schoolId } = req.params as { schoolId: string };
      const { label, gradeLevel } = req.body as { label: string; gradeLevel?: string };
      if (!(await prisma.school.findUnique({ where: { id: schoolId } }))) throw httpError(404, "School not found");
      const cohort = await prisma.cohort.create({ data: { schoolId, label, gradeLevel: gradeLevel ?? null } });
      return reply.code(201).send(cohort);
    },
  );

  app.patch(
    "/cohorts/:id",
    { schema: { tags: ["schools"], summary: "Update a cohort", security: sec, body: { type: "object", properties: { label: { type: "string" }, gradeLevel: { type: "string" } } } } },
    async (req) => {
      const { id } = req.params as { id: string };
      const { label, gradeLevel } = req.body as { label?: string; gradeLevel?: string };
      return prisma.cohort.update({ where: { id }, data: { label, gradeLevel } });
    },
  );

  app.delete("/cohorts/:id", { schema: { tags: ["schools"], summary: "Delete a cohort", security: sec } }, async (req) => {
    const { id } = req.params as { id: string };
    await prisma.cohort.delete({ where: { id } });
    return { ok: true };
  });

  // ---- cohort invites ----
  app.get("/cohorts/:id/invites", { schema: { tags: ["schools"], summary: "Invites for a cohort", security: sec } }, async (req) => {
    const { id } = req.params as { id: string };
    const invites = await prisma.invite.findMany({ where: { cohortId: id }, orderBy: { createdAt: "desc" } });
    // project a safe shape — don't ship raw recipient emails / internal ids to the client
    return invites.map((i) => ({
      id: i.id,
      code: i.code,
      intendedFirstName: i.intendedFirstName,
      status: i.status,
      createdAt: i.createdAt,
      redeemedAt: i.redeemedAt,
    }));
  });

  app.post(
    "/cohorts/:id/invites",
    {
      schema: {
        tags: ["schools"],
        summary: "Create one invite for a cohort (name + email required; emails the link)",
        security: sec,
        body: {
          type: "object",
          required: ["firstName", "email"],
          properties: { firstName: { type: "string", minLength: 1 }, email: { type: "string", minLength: 3 } },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const { firstName, email } = req.body as { firstName: string; email: string };
      if (!isValidEmail(email)) throw httpError(400, "A valid email address is required");
      const cohort = await prisma.cohort.findUnique({ where: { id }, include: { school: true } });
      if (!cohort) throw httpError(404, "Cohort not found");
      const invite = await prisma.invite.create({
        data: { code: inviteCode(), intendedFirstName: firstName, email, createdById: req.authUser!.id, schoolId: cohort.schoolId, cohortId: id },
      });
      const mail = await sendInviteEmail({ to: email, code: invite.code, firstName, schoolName: cohort.school?.name ?? null });
      return reply.code(201).send({ ...invite, emailSent: mail.sent, emailError: mail.error ?? null });
    },
  );

  // ---- bulk roster upload -> one invite per row ----
  app.post(
    "/cohorts/:id/invites/bulk",
    {
      schema: {
        tags: ["schools"],
        summary: "Bulk-create invites from a roster (one per student)",
        security: sec,
        body: {
          type: "object",
          required: ["students"],
          properties: {
            students: {
              type: "array",
              maxItems: 500,
              items: { type: "object", required: ["firstName", "email"], properties: { firstName: { type: "string" }, email: { type: "string" } } },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const { students } = req.body as { students: { firstName: string; email: string }[] };
      const cohort = await prisma.cohort.findUnique({ where: { id }, include: { school: true } });
      if (!cohort) throw httpError(404, "Cohort not found");
      // keep only rows with a name + valid email
      const candidates = students
        .filter((s) => s.firstName?.trim() && isValidEmail(s.email))
        .map((s) => ({ firstName: s.firstName.trim(), email: s.email.trim() }));
      // de-dupe within the paste AND against emails already pending in this cohort
      // (re-uploading a roster shouldn't double-invite / double-email a class)
      const pending = await prisma.invite.findMany({
        where: { cohortId: id, status: "PENDING", email: { not: null } },
        select: { email: true },
      });
      const seen = new Set(pending.map((p) => (p.email ?? "").toLowerCase()));
      const valid = candidates
        .filter((c) => {
          const key = c.email.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((c) => ({ ...c, code: inviteCode() }));
      const skipped = students.length - valid.length;

      // one insert for the whole batch (not N round-trips)
      const { count } = await prisma.invite.createMany({
        data: valid.map((v) => ({
          code: v.code,
          intendedFirstName: v.firstName,
          email: v.email,
          createdById: req.authUser!.id,
          schoolId: cohort.schoolId,
          cohortId: id,
        })),
        skipDuplicates: true,
      });

      // send emails with bounded concurrency so 500 rows don't serialize into a timeout
      let emailed = 0;
      let emailFailed = 0;
      const CONCURRENCY = 8;
      for (let i = 0; i < valid.length; i += CONCURRENCY) {
        const batch = valid.slice(i, i + CONCURRENCY);
        const results = await Promise.allSettled(
          batch.map((v) => sendInviteEmail({ to: v.email, code: v.code, firstName: v.firstName, schoolName: cohort.school?.name ?? null })),
        );
        for (const r of results) {
          if (r.status === "fulfilled") {
            if (r.value.sent) emailed++;
            else if (!r.value.skipped) emailFailed++;
          } else {
            emailFailed++;
          }
        }
      }
      return reply.code(201).send({ created: count, skipped, emailed, emailFailed });
    },
  );
};
