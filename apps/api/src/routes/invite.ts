import type { FastifyPluginAsync } from "fastify";
import { InviteStatus } from "@prisma/client";
import { prisma } from "../db";
import { httpError } from "../lib/http";

/**
 * Invite flow. The account itself is created by Better Auth (`signUp.email` on the
 * client, which sets the session cookie same-origin) — these routes just expose
 * the invite for the accept screen and bind the new account to its school/cohort.
 *
 *   GET  /v1/invite/:code   public — details to render the accept screen
 *   POST /v1/invite/attach  authed — place the signed-in student + mark redeemed
 */
export const inviteRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/:code",
    { schema: { tags: ["invite"], summary: "Public invite details for the accept screen" } },
    async (req) => {
      const { code } = req.params as { code: string };
      const invite = await prisma.invite.findUnique({
        where: { code },
        include: { school: true, cohort: true },
      });
      if (!invite) throw httpError(404, "Invite not found");
      return {
        code: invite.code,
        status: invite.status,
        email: invite.email,
        intendedFirstName: invite.intendedFirstName,
        school: invite.school ? { id: invite.school.id, name: invite.school.name } : null,
        cohort: invite.cohort
          ? { id: invite.cohort.id, label: invite.cohort.label, gradeLevel: invite.cohort.gradeLevel }
          : null,
      };
    },
  );

  app.post(
    "/attach",
    {
      preHandler: app.authenticate,
      schema: {
        tags: ["invite"],
        summary: "Attach the signed-in student to an invite's school/cohort",
        security: [{ cookieAuth: [] }],
        body: { type: "object", required: ["code"], properties: { code: { type: "string" } } },
      },
    },
    async (req, reply) => {
      const { code } = req.body as { code: string };
      const invite = await prisma.invite.findUnique({ where: { code } });
      if (!invite || invite.status !== InviteStatus.PENDING) {
        throw httpError(400, "Invite is invalid or already used");
      }
      // If the invite was addressed to a specific email, the redeemer must match it.
      const user = await prisma.user.findUnique({ where: { id: req.authUser!.id } });
      if (invite.email && user?.email?.toLowerCase() !== invite.email.toLowerCase()) {
        throw httpError(403, "This invite was sent to a different email address");
      }
      // Atomic compare-and-swap: only redeem if still PENDING (guards the TOCTOU race
      // where two accounts redeem the same code). A P2002 means this user already
      // redeemed a *different* invite (Invite.redeemedById is unique) → friendly 409.
      let taken = false;
      try {
        await prisma.$transaction(async (tx) => {
          const res = await tx.invite.updateMany({
            where: { id: invite.id, status: InviteStatus.PENDING },
            data: { status: InviteStatus.REDEEMED, redeemedById: req.authUser!.id, redeemedAt: new Date() },
          });
          if (res.count === 0) {
            taken = true;
            return;
          }
          await tx.user.update({
            where: { id: req.authUser!.id },
            data: { schoolId: invite.schoolId, cohortId: invite.cohortId },
          });
        });
      } catch (e) {
        if ((e as { code?: string }).code === "P2002") throw httpError(409, "You've already joined with another invite.");
        throw e;
      }
      if (taken) throw httpError(409, "This invite was just used.");
      return reply.send({ ok: true, schoolId: invite.schoolId, cohortId: invite.cohortId });
    },
  );
};
