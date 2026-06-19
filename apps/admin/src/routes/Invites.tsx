import { useState } from "react";
import { useApi } from "../lib/useApi";
import { adminApi } from "../lib/api";
import { Loading, ErrorBox, Card, Badge, Button } from "../components/ui";
import { Icon } from "../components/Icon";
import { checkEmail } from "../lib/email-validate";

const PAGE = 25;

function fmtDate(s: string) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Invites() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const q = useApi(
    () => adminApi.invites({ q: search.trim() || undefined, status: status || undefined, limit: PAGE, offset: page * PAGE }),
    [search, status, page],
  );

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);

  const emailCheck = checkEmail(email);
  const canCreate = firstName.trim().length > 0 && emailCheck.valid;

  const create = async () => {
    if (!canCreate || busy) return;
    setBusy(true);
    setNotice(null);
    const to = email.trim();
    try {
      const inv = await adminApi.createInvite(firstName.trim(), to);
      setNotice(
        inv.emailSent
          ? { kind: "ok", text: `Invite created and emailed to ${to}.` }
          : {
              kind: "warn",
              text: inv.emailError
                ? `Invite created, but the email couldn't be sent: ${inv.emailError}`
                : "Invite created, but the email wasn't sent — share the code below instead.",
            },
      );
      setFirstName("");
      setEmail("");
      await q.reload();
    } catch (e) {
      setNotice({ kind: "warn", text: e instanceof Error ? e.message : "Couldn't create the invite." });
    }
    setBusy(false);
  };
  const revoke = async (id: string) => {
    if (!confirm("Revoke this invite? The student's link will stop working.")) return;
    try {
      await adminApi.revokeInvite(id);
      await q.reload();
    } catch (e) {
      setNotice({ kind: "warn", text: e instanceof Error ? e.message : "Couldn't revoke the invite." });
    }
  };
  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      setNotice({ kind: "warn", text: "Couldn't copy — select the code manually." });
    }
  };

  const total = q.data?.total ?? 0;
  const invites = q.data?.items ?? [];
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">Invites</h1>
      <p className="text-ink2 font-semibold text-[14px] mt-0.5">
        A name and email are both required — we email the student their invite link.
      </p>

      <Card className="mt-6 p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="font-extrabold text-[12.5px] text-ink">Student first name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Jordan"
              onKeyDown={(e) => e.key === "Enter" && create()}
              className="mt-1 w-full h-10 px-3 rounded-lg border-2 border-ink bg-white font-bold text-[14px] outline-none focus:border-jade"
            />
          </div>
          <div className="flex-1">
            <label className="font-extrabold text-[12.5px] text-ink">Email</label>
            <input
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@email.com"
              onKeyDown={(e) => e.key === "Enter" && create()}
              className="mt-1 w-full h-10 px-3 rounded-lg border-2 border-ink bg-white font-bold text-[14px] outline-none focus:border-jade"
            />
          </div>
          <Button onClick={create} disabled={busy || !canCreate}>
            <Icon n="plus" c="w-4 h-4" sw={2.4} /> Create invite
          </Button>
        </div>
        {email.trim() && !emailCheck.valid && <div className="mt-2 text-terra font-bold text-[12.5px]">{emailCheck.reason}</div>}
        {emailCheck.suggestion && (
          <div className="mt-2 inline-flex items-center gap-2 text-[12.5px] font-bold text-yellowInk bg-yellow/25 border-2 border-yellow rounded-lg px-3 py-1.5">
            Did you mean <span className="font-mono">{emailCheck.suggestion}</span>?
            <button onClick={() => setEmail(emailCheck.suggestion!)} className="underline text-jadeDeep">
              Use it
            </button>
          </div>
        )}
        {notice && (
          <div
            className={`mt-3 rounded-lg border-2 px-3 py-2 font-bold text-[13px] ${
              notice.kind === "ok" ? "border-green bg-green/10 text-jadeDeep" : "border-terra bg-terra/10 text-terra"
            }`}
          >
            {notice.text}
          </div>
        )}
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          placeholder="Search code, name, or email…"
          className="w-full max-w-[320px] h-10 px-3 rounded-lg border-2 border-ink bg-white font-bold text-[14px] outline-none focus:border-jade"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(0);
            setStatus(e.target.value);
          }}
          className="h-10 px-3 rounded-lg border-2 border-ink bg-white font-bold text-[13px] outline-none focus:border-jade"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="REDEEMED">Redeemed</option>
          <option value="REVOKED">Revoked</option>
        </select>
        <span className="font-mono text-[12px] text-ink2">{total} total</span>
      </div>

      {q.loading && !q.data ? (
        <Loading />
      ) : q.error && !q.data ? (
        <div className="mt-4">
          <ErrorBox onRetry={q.reload} message={q.error?.message} />
        </div>
      ) : (
        <>
          <Card className="mt-3 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-ink bg-mint/30 font-mono text-[11px] uppercase tracking-wide text-ink2">
                  <th className="px-4 py-2.5 font-medium">Code</th>
                  <th className="px-3 py-2.5 font-medium">For</th>
                  <th className="px-3 py-2.5 font-medium">Grade</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Created</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink/5">
                {invites.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-ink2 font-semibold text-[13px]">
                      {search || status ? "No invites match your filters." : "No invites yet — create one above."}
                    </td>
                  </tr>
                )}
                {invites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-mint/20 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copy(inv.code)}
                        title="Copy code"
                        aria-label={`Copy code ${inv.code}`}
                        className="inline-flex items-center gap-2 font-mono font-bold text-[13.5px] text-ink bg-mint/40 border-2 border-ink rounded-md px-2 py-1"
                      >
                        {inv.code}
                        <Icon n={copied === inv.code ? "check" : "ticket"} c="w-3.5 h-3.5" sw={2.2} />
                      </button>
                    </td>
                    <td className="px-3 py-3 font-semibold text-[13px] text-ink">{inv.intendedFirstName ?? "—"}</td>
                    <td className="px-3 py-3 font-semibold text-[12.5px] text-ink2">{inv.cohort?.label ?? "—"}</td>
                    <td className="px-3 py-3">
                      <Badge kind={inv.status}>{inv.status.toLowerCase()}</Badge>
                    </td>
                    <td className="px-3 py-3 font-mono text-[12px] text-ink2">{fmtDate(inv.createdAt)}</td>
                    <td className="px-3 py-3 text-right">
                      {inv.status === "PENDING" && (
                        <button
                          onClick={() => revoke(inv.id)}
                          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border-2 border-ink bg-white text-error font-extrabold text-[12px] shadow-sk-xs active:translate-y-px active:shadow-none transition-all"
                        >
                          <Icon n="trash" c="w-3.5 h-3.5" sw={2.2} /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {pages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-[12px] text-ink2">
                {page * PAGE + 1}–{Math.min((page + 1) * PAGE, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="h-9 px-3 rounded-lg border-2 border-ink bg-white font-extrabold text-[13px] disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={page >= pages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-9 px-3 rounded-lg border-2 border-ink bg-white font-extrabold text-[13px] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
