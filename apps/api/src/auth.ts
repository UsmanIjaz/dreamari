import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, anonymous } from "better-auth/plugins";
import { prisma } from "./db";
import { resetPasswordEmail, sendEmail, verifyEmail } from "./lib/email";

// WEB_ORIGIN / ADMIN_ORIGIN may each be a comma-separated list — handy during a
// domain cutover (custom domain + www + the *.vercel.app URL). Trailing slashes
// are tolerated so "https://dreamari.app/" doesn't silently fail to match.
const splitOrigins = (v: string | undefined, fallback: string) =>
  (v ?? fallback)
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);

/** The browser origins allowed to talk to the API — reused for both Better Auth's
 *  CSRF check and the API's CORS allowlist (see app.ts). */
export const TRUSTED_ORIGINS = [
  ...splitOrigins(process.env.WEB_ORIGIN, "http://localhost:5173"), // student app(s)
  ...splitOrigins(process.env.ADMIN_ORIGIN, "http://localhost:5174"), // admin app(s)
];

// Never run production on a default signing secret (it would make sessions forgeable).
const SECRET = process.env.BETTER_AUTH_SECRET ?? process.env.JWT_SECRET;
if (!SECRET && process.env.NODE_ENV === "production") {
  throw new Error("BETTER_AUTH_SECRET is required in production — refusing to start with a default secret.");
}

/**
 * Better Auth — DB-backed sessions (revocable), email/password, plus:
 *  - admin plugin: roles (student users default "user"; staff get "admin")
 *  - anonymous plugin: guest sessions a student can later upgrade to email/password.
 *    On upgrade, onLinkAccount migrates the guest's BUILD profile + swipes + school
 *    placement to the new account so nothing is lost.
 *
 * Sessions ride in an httpOnly cookie and last 30 days (sliding), so a signed-in
 * student rarely has to log in again. Password reset + email verification go out
 * through Resend (see lib/email.ts). The web app reaches the API same-origin via a
 * proxy, so the cookie is never exposed to JS.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.API_URL ?? "http://localhost:8080",
  basePath: "/api/auth",
  secret: SECRET ?? "dev-secret-local-only",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false, // never block exploring on a verify click
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({ to: user.email, subject: "Reset your Dreamari password", html: resetPasswordEmail(url) });
    },
  },
  emailVerification: {
    sendOnSignUp: false, // soft: only send when explicitly requested
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({ to: user.email, subject: "Verify your Dreamari email", html: verifyEmail(url) });
    },
  },
  // 30-day sliding session → login is rare; refreshed at most once a day.
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  plugins: [
    admin(),
    anonymous({
      // When a guest links to an account, move their work over. This MUST be collision-safe:
      // BuildProfile.studentId and Swipe[studentId, majorCode] are unique, so a blind re-parent
      // throws if the target account already has its own data (e.g. a returning user signing in
      // while a guest session is active) — and a throw here breaks the sign-in, stranding the
      // user on the guest session and bouncing them back to onboarding. So we keep the account's
      // existing data, adopt only what doesn't collide, and never let a hiccup block the user.
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        const fromId = anonymousUser.user.id;
        const toId = newUser.user.id;
        try {
          await prisma.$transaction(async (tx) => {
            // BUILD profile: the account's own build wins if it has one; otherwise adopt the guest's.
            const existing = await tx.buildProfile.findUnique({ where: { studentId: toId }, select: { id: true } });
            if (existing) {
              await tx.buildProfile.deleteMany({ where: { studentId: fromId } });
            } else {
              await tx.buildProfile.updateMany({ where: { studentId: fromId }, data: { studentId: toId } });
            }
            // Swipes: move only the majors the account hasn't swiped; drop the colliding duplicates.
            const taken = new Set(
              (await tx.swipe.findMany({ where: { studentId: toId }, select: { majorCode: true } })).map((s) => s.majorCode),
            );
            const guestSwipes = await tx.swipe.findMany({ where: { studentId: fromId }, select: { id: true, majorCode: true } });
            const move = guestSwipes.filter((s) => !taken.has(s.majorCode)).map((s) => s.id);
            const drop = guestSwipes.filter((s) => taken.has(s.majorCode)).map((s) => s.id);
            if (move.length) await tx.swipe.updateMany({ where: { id: { in: move } }, data: { studentId: toId } });
            if (drop.length) await tx.swipe.deleteMany({ where: { id: { in: drop } } });
            // School/cohort placement: fill only what the account is missing, never clobber it.
            const anon = await tx.user.findUnique({ where: { id: fromId }, select: { schoolId: true, cohortId: true } });
            if (anon?.schoolId || anon?.cohortId) {
              const acct = await tx.user.findUnique({ where: { id: toId }, select: { schoolId: true, cohortId: true } });
              await tx.user.update({
                where: { id: toId },
                data: { schoolId: acct?.schoolId ?? anon.schoolId, cohortId: acct?.cohortId ?? anon.cohortId },
              });
            }
          });
        } catch (err) {
          // The account is valid even if migration failed; never block the user from getting in.
          console.error("onLinkAccount migration failed (non-fatal):", err);
        }
      },
    }),
  ],
  trustedOrigins: TRUSTED_ORIGINS,
  // built-in rate limiting (per-IP) on the auth endpoints
  rateLimit: { enabled: true, window: 60, max: 30 },
});

export type Auth = typeof auth;
