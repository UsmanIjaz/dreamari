// Transactional email via Resend. Used for: invite links, password reset, and
// (soft) email verification. Degrades gracefully: if RESEND_API_KEY is unset
// (e.g. local dev), it logs and no-ops instead of throwing, so nothing breaks.
//
// Sender: defaults to Resend's shared sandbox `onboarding@resend.dev`, which
// needs no domain verification but only delivers to the Resend account owner.
// Set EMAIL_FROM to a verified domain (e.g. "Dreamari <noreply@dreamari.app>")
// to reach real student inboxes.

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "Dreamari <onboarding@resend.dev>";
// WEB_ORIGIN may be a comma-separated list; invite links use the first (canonical) one.
const WEB_ORIGIN = (process.env.WEB_ORIGIN ?? "http://localhost:5173").split(",")[0].trim().replace(/\/$/, "");

const resend = apiKey ? new Resend(apiKey) : null;

/** Server-side format guard for invite recipients (the admin UI does richer typo checks). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (e: unknown): e is string => typeof e === "string" && EMAIL_RE.test(e.trim());

type Mail = { to: string; subject: string; html: string; text?: string };

/** Outcome of an email attempt. `skipped` means no API key (local/dev no-op). */
export type SendResult = { sent: boolean; skipped?: boolean; error?: string };

export async function sendEmail(mail: Mail): Promise<SendResult> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping "${mail.subject}" → ${mail.to}`);
    return { sent: false, skipped: true };
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, ...mail });
    if (error) {
      const message = (error as { message?: string }).message ?? String(error);
      console.error(`[email] send failed → ${mail.to}:`, error);
      return { sent: false, error: message };
    }
    return { sent: true };
  } catch (err) {
    // never let email failures break the request that triggered them
    console.error(`[email] threw → ${mail.to}:`, err);
    return { sent: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/* ------------------------------------------------------------------ templates */

const wrap = (heading: string, body: string, cta?: { label: string; url: string }) => `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#16271f">
    <div style="font-weight:800;font-size:22px;letter-spacing:-0.5px;color:#16271f">Dreamari<span style="color:#1f9d63">.</span></div>
    <h1 style="font-size:20px;font-weight:800;margin:24px 0 8px">${heading}</h1>
    <p style="font-size:15px;line-height:1.6;color:#3f5247;margin:0 0 20px">${body}</p>
    ${
      cta
        ? `<a href="${cta.url}" style="display:inline-block;background:#1f9d63;color:#fff;font-weight:800;font-size:15px;text-decoration:none;padding:12px 22px;border-radius:12px">${cta.label}</a>
    <p style="font-size:12px;color:#7a8b82;margin:18px 0 0">Or paste this link into your browser:<br><span style="color:#1f9d63">${cta.url}</span></p>`
        : ""
    }
    <p style="font-size:12px;color:#9aa8a0;margin:28px 0 0">Dreamari · career discovery for ages 13–18</p>
  </div>`;

export function resetPasswordEmail(url: string): string {
  return wrap(
    "Reset your password",
    "Tap the button below to choose a new password. If you didn't request this, you can safely ignore this email.",
    { label: "Reset password", url },
  );
}

export function verifyEmail(url: string): string {
  return wrap(
    "Confirm your email",
    "Confirm this is you so we can keep your Dreamari account safe. This is optional — you can keep exploring without it.",
    { label: "Verify email", url },
  );
}

/** Send a school/cohort invite link to a student. */
export async function sendInviteEmail(opts: {
  to: string;
  code: string;
  firstName?: string | null;
  schoolName?: string | null;
}): Promise<SendResult> {
  const url = `${WEB_ORIGIN}/invite/${opts.code}`;
  const hi = opts.firstName ? `Hi ${opts.firstName}, ` : "";
  const from = opts.schoolName ? `${opts.schoolName} invited you` : "You've been invited";
  return sendEmail({
    to: opts.to,
    subject: `${from} to Dreamari`,
    html: wrap(
      `${from} to Dreamari 🎉`,
      `${hi}Dreamari helps you discover careers and majors that actually fit you — no grades, no wrong answers. Tap below to set up your account and start exploring.`,
      { label: "Accept invite", url },
    ),
  });
}
