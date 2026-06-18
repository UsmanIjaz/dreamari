import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, type InviteInfo } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { AuthLayout, AUTH_FIELD } from "../components/AuthLayout";
import { Loading } from "../components/Loading";

/** Onboarding reads this to pre-fill what the invite already knows (name, grade). */
export const PREFILL_KEY = "dreamari.prefill.v1";

export default function Invite() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const thisYear = useMemo(() => new Date().getFullYear(), []);
  const years = useMemo(() => Array.from({ length: 19 }, (_, i) => thisYear - 10 - i), [thisYear]);

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [phase, setPhase] = useState<"loading" | "ok" | "bad">("loading");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    api
      .getInvite(code)
      .then((i) => {
        if (!live) return;
        if (i.status !== "PENDING") {
          setPhase("bad");
          return;
        }
        setInfo(i);
        setName(i.intendedFirstName ?? "");
        setEmail(i.email ?? "");
        setPhase("ok");
      })
      .catch(() => live && setPhase("bad"));
    return () => {
      live = false;
    };
  }, [code]);

  if (phase === "loading")
    return (
      <AuthLayout>
        <Loading />
      </AuthLayout>
    );

  if (phase === "bad" || !info)
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-[22px] font-extrabold text-ink">This invite isn't available</h1>
          <p className="text-ink2 font-semibold text-[14px] mt-2">It may have expired or already been used.</p>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center w-full h-12 mt-5 rounded-xl bg-jade text-white border-[2.5px] border-ink shadow-sk font-extrabold text-[15px]"
          >
            Start free instead →
          </Link>
        </div>
      </AuthLayout>
    );

  const lockedEmail = Boolean(info.email);

  const submit = async () => {
    setErr(null);
    const finalName = (name.trim() || info.intendedFirstName || "Friend").trim();
    const finalEmail = (info.email ?? email).trim();
    if (!finalEmail) return setErr("Enter your email.");
    if (!year) return setErr("Select your birth year.");
    if (thisYear - Number(year) < 13)
      return setErr("You need to be 13 or older. Ask a parent or guardian to set this up with you.");
    if (password.length < 8) return setErr("Use at least 8 characters for your password.");

    setBusy(true);
    const res = await authClient.signUp.email({ email: finalEmail, password, name: finalName });
    if (res.error) {
      setErr(res.error.message ?? "Couldn't create your account.");
      setBusy(false);
      return;
    }
    // bind the new account to the invite's school/cohort (best-effort)
    try {
      await api.attachInvite(code);
    } catch {
      /* account exists; admin will still see the invite as pending */
    }
    try {
      sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ name: finalName, grade: info.cohort?.label ?? "" }));
    } catch {
      /* ignore */
    }
    navigate("/onboarding?invited=1");
  };

  const schoolName = info.school?.name;
  return (
    <AuthLayout>
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 bg-yellow text-yellowInk border-2 border-ink rounded-full px-3 py-1 font-extrabold text-[12px] shadow-sk-xs mb-3">
          🎉 You're invited
        </div>
        <h1 className="text-[22px] font-extrabold text-ink leading-tight">
          {info.intendedFirstName ? `Hi ${info.intendedFirstName}!` : "Welcome to Dreamari"}
        </h1>
        <p className="text-ink2 font-semibold text-[14px] mt-1.5">
          {schoolName ? `${schoolName} invited you to discover careers that fit you.` : "Set up your account to start exploring."}
        </p>
      </div>

      <div className="space-y-3">
        {!info.intendedFirstName && (
          <input className={AUTH_FIELD} placeholder="Your first name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input
          className={`${AUTH_FIELD} ${lockedEmail ? "opacity-70" : ""}`}
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          readOnly={lockedEmail}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={AUTH_FIELD}
          type="password"
          autoComplete="new-password"
          placeholder="Create a password (8+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <select
          className={`${AUTH_FIELD} ${year ? "text-ink" : "text-ink3"}`}
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
        {busy ? "Setting up…" : "Create account & start →"}
      </button>
      <p className="text-ink3 text-[11px] text-center mt-4 leading-snug">For ages 13–18. No public profile, nothing sold.</p>
    </AuthLayout>
  );
}
