import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authClient, useSession } from "../lib/auth-client";
import { AuthLayout, AUTH_FIELD } from "../components/AuthLayout";

export default function Login() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // already signed in with a real (non-guest) account → straight into the app
  const isGuest = Boolean((session?.user as { isAnonymous?: boolean } | undefined)?.isAnonymous);
  if (!isPending && session && !isGuest) return <Navigate to="/app/home" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    // If we're currently a guest, drop that session first so logging into an existing account is
    // a clean switch, not an anonymous-account link (which could collide on the unique BUILD/swipe
    // data and leave us stranded on the guest session, then bounced back to onboarding).
    const cur = await authClient.getSession();
    if ((cur.data?.user as { isAnonymous?: boolean } | undefined)?.isAnonymous) {
      await authClient.signOut();
    }
    const res = await authClient.signIn.email({ email: email.trim(), password });
    if (res.error) {
      setErr(res.error.message ?? "That email and password didn't match.");
      setBusy(false);
      return;
    }
    navigate("/app/home");
  };

  const forgot = async () => {
    setErr(null);
    if (!email.trim()) return setErr("Enter your email above first, then tap reset.");
    await authClient.requestPasswordReset({ email: email.trim(), redirectTo: `${window.location.origin}/reset-password` });
    setResetSent(true);
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="space-y-3.5">
        <h1 className="text-[22px] font-extrabold text-ink text-center">Welcome back</h1>
        <p className="text-ink2 font-semibold text-[14px] text-center -mt-1 mb-2">Log in to pick up where you left off.</p>

        <input
          className={AUTH_FIELD}
          type="email"
          autoComplete="username"
          aria-label="Email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={AUTH_FIELD}
          type="password"
          autoComplete="current-password"
          aria-label="Password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <div className="text-error font-bold text-[13px] text-center">{err}</div>}
        {resetSent && (
          <div className="text-jadeDeep font-bold text-[13px] text-center">
            If that email has an account, a reset link is on its way.
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full h-12 rounded-xl bg-jade text-white border-[2.5px] border-ink shadow-sk font-extrabold text-[15px] active:translate-y-[2px] active:shadow-sk-xs transition-all disabled:opacity-50"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>

        <button type="button" onClick={forgot} className="w-full text-center font-bold text-ink2 text-[13px] py-0.5">
          Forgot password?
        </button>
      </form>

      <p className="text-center text-ink2 font-semibold text-[13.5px] mt-6">
        New here?{" "}
        <Link to="/onboarding" className="text-jadeDeep font-extrabold">
          Start free →
        </Link>
      </p>
    </AuthLayout>
  );
}
