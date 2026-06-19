import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { authClient, useSession } from "../lib/auth-client";
import { Spinner } from "../components/ui";

export default function Login() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@dreamari.test");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isPending && session?.user.role === "admin") return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await authClient.signIn.email({ email, password });
    if (res.error) {
      setError(res.error.message ?? "Sign in failed");
      setBusy(false);
      return;
    }
    const s = await authClient.getSession();
    if (s.data?.user.role !== "admin") {
      await authClient.signOut();
      setError("That account isn't an admin.");
      setBusy(false);
      return;
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(0.955_0.045_150)] px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <span className="w-9 h-9 rounded-xl bg-jade border-2 border-ink shadow-sk-xs flex items-center justify-center">
            <span className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white" />
            </span>
          </span>
          <span className="font-extrabold text-[20px]">
            Dreamari <span className="font-mono text-[12px] text-ink2">ADMIN</span>
          </span>
        </div>
        <form onSubmit={submit} className="bg-white border-2 border-ink rounded-2xl shadow-sk p-6 space-y-4">
          <div className="font-extrabold text-[17px]">Sign in</div>
          <div>
            <label className="font-extrabold text-[13px] text-ink">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              className="mt-1 w-full h-11 px-3 rounded-lg border-2 border-ink bg-white font-bold text-[14px] outline-none focus:border-jade"
            />
          </div>
          <div>
            <label className="font-extrabold text-[13px] text-ink">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="dreamari123"
              className="mt-1 w-full h-11 px-3 rounded-lg border-2 border-ink bg-white font-bold text-[14px] outline-none focus:border-jade"
            />
          </div>
          {error && <div className="text-error font-bold text-[13px]">{error}</div>}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-lg bg-jade text-white border-2 border-ink shadow-sk-xs font-extrabold text-[14px] flex items-center justify-center gap-2 active:translate-y-px active:shadow-none transition-all disabled:opacity-50"
          >
            {busy && <Spinner c="w-4 h-4" />} Sign in
          </button>
          <p className="text-center text-ink2 font-semibold text-[12px]">
            Seed admin — admin@dreamari.test · dreamari123
          </p>
        </form>
      </div>
    </div>
  );
}
