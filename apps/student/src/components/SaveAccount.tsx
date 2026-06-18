import { useMemo, useState } from "react";
import { authClient, useSession } from "../lib/auth-client";
import { AUTH_FIELD } from "./AuthLayout";

/**
 * Upgrades the current (anonymous) guest into a real email/password account.
 * Better Auth's anonymous plugin links the accounts on sign-up and our
 * onLinkAccount migrates the guest's BUILD profile + swipes (see api/src/auth.ts),
 * so nothing is lost. Reused by the onboarding "save" step and the /save route.
 * Includes a light 13+ age check (COPPA hygiene).
 */
export function SaveAccount({
  onDone,
  onSkip,
  heading = "Save your progress",
  sub = "Create a free account so your matches are here when you come back.",
  cta = "Create account",
}: {
  onDone: () => void;
  onSkip?: () => void;
  heading?: string;
  sub?: string;
  cta?: string;
}) {
  const { data: session } = useSession();
  const thisYear = useMemo(() => new Date().getFullYear(), []);
  const years = useMemo(() => Array.from({ length: 19 }, (_, i) => thisYear - 10 - i), [thisYear]); // ages 10–28
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!email.trim()) return setErr("Enter your email.");
    if (!year) return setErr("Select your birth year.");
    if (thisYear - Number(year) < 13)
      return setErr("You need to be 13 or older. Ask a parent or guardian to set this up with you.");
    if (password.length < 8) return setErr("Use at least 8 characters for your password.");
    setBusy(true);
    const name = session?.user.name || "Friend";
    const res = await authClient.signUp.email({ email: email.trim(), password, name });
    if (res.error) {
      setErr(res.error.message ?? "Couldn't create your account.");
      setBusy(false);
      return;
    }
    onDone();
  };

  return (
    <div>
      <h1 className="text-[22px] font-extrabold text-ink text-center">{heading}</h1>
      <p className="text-ink2 font-semibold text-[14px] text-center mt-1.5 mb-6 leading-snug">{sub}</p>
      <div className="space-y-3">
        <input
          className={AUTH_FIELD}
          type="email"
          autoComplete="email"
          aria-label="Email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={AUTH_FIELD}
          type="password"
          autoComplete="new-password"
          aria-label="Password"
          placeholder="Create a password (8+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <select
          className={`${AUTH_FIELD} ${year ? "text-ink" : "text-ink3"}`}
          aria-label="Birth year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">Birth year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {err && <div className="text-error font-bold text-[13px] mt-3 text-center">{err}</div>}
      <button
        disabled={busy}
        onClick={submit}
        className="w-full h-12 mt-5 rounded-xl bg-jade text-white border-[2.5px] border-ink shadow-sk font-extrabold text-[15px] active:translate-y-[2px] active:shadow-sk-xs transition-all disabled:opacity-50"
      >
        {busy ? "Saving…" : cta}
      </button>
      {onSkip && (
        <button onClick={onSkip} className="w-full mt-3 font-bold text-ink2 text-[13.5px] py-1">
          I'll do it later
        </button>
      )}
      <p className="text-ink3 text-[11px] text-center mt-4 leading-snug">For ages 13–18. No public profile, nothing sold.</p>
    </div>
  );
}
