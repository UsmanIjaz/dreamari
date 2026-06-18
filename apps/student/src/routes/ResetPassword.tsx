import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { AuthLayout, AUTH_FIELD } from "../components/AuthLayout";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-[22px] font-extrabold text-ink">This link isn't valid</h1>
          <p className="text-ink2 font-semibold text-[14px] mt-2">Reset links expire — request a new one from the login screen.</p>
          <Link to="/login" className="inline-block mt-5 font-extrabold text-jadeDeep">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) return setErr("Use at least 8 characters.");
    setBusy(true);
    const res = await authClient.resetPassword({ newPassword: password, token });
    if (res.error) {
      setErr(res.error.message ?? "Couldn't reset your password. The link may have expired.");
      setBusy(false);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-[22px] font-extrabold text-ink">Password updated 🎉</h1>
          <p className="text-ink2 font-semibold text-[14px] mt-2">You can log in with your new password now.</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full h-12 mt-5 rounded-xl bg-jade text-white border-[2.5px] border-ink shadow-sk font-extrabold text-[15px] active:translate-y-[2px] active:shadow-sk-xs transition-all"
          >
            Go to login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form onSubmit={submit}>
        <h1 className="text-[22px] font-extrabold text-ink text-center">Choose a new password</h1>
        <p className="text-ink2 font-semibold text-[14px] text-center mt-1.5 mb-5">Make it at least 8 characters.</p>
        <input
          className={AUTH_FIELD}
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <div className="text-error font-bold text-[13px] text-center mt-3">{err}</div>}
        <button
          type="submit"
          disabled={busy}
          className="w-full h-12 mt-5 rounded-xl bg-jade text-white border-[2.5px] border-ink shadow-sk font-extrabold text-[15px] active:translate-y-[2px] active:shadow-sk-xs transition-all disabled:opacity-50"
        >
          {busy ? "Saving…" : "Set new password"}
        </button>
      </form>
    </AuthLayout>
  );
}
