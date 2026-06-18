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
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        const fromId = anonymousUser.user.id;
        const toId = newUser.user.id;
        // Move the guest's work to the real account *before* the plugin deletes
        // the anonymous user (their build/swipes cascade-delete with it otherwise).
        await prisma.$transaction(async (tx) => {
          await tx.buildProfile.updateMany({ where: { studentId: fromId }, data: { studentId: toId } });
          await tx.swipe.updateMany({ where: { studentId: fromId }, data: { studentId: toId } });
          const anon = await tx.user.findUnique({ where: { id: fromId }, select: { schoolId: true, cohortId: true } });
          if (anon?.schoolId || anon?.cohortId) {
            await tx.user.update({ where: { id: toId }, data: { schoolId: anon.schoolId, cohortId: anon.cohortId } });
          }
        });
      },
    }),
  ],
  trustedOrigins: TRUSTED_ORIGINS,
  // built-in rate limiting (per-IP) on the auth endpoints
  rateLimit: { enabled: true, window: 60, max: 30 },
});

export type Auth = typeof auth;
