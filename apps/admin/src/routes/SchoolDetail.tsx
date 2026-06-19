import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useApi } from "../lib/useApi";
import { adminApi, type CohortRow } from "../lib/api";
import { Loading, ErrorBox, Card, Button, Badge } from "../components/ui";
import { Icon } from "../components/Icon";
import { checkEmail, type EmailCheck } from "../lib/email-validate";

const input = "h-10 px-3 rounded-lg border-2 border-ink bg-white font-bold text-[14px] outline-none focus:border-jade";

type RosterRow = { firstName: string; email: string; check: EmailCheck; ok: boolean };

/** Split one CSV line into fields, respecting double-quotes (so "Lee, Maya" stays one field). */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (!inQuotes && (ch === "," || ch === ";" || ch === "\t")) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** Parse pasted/CSV roster into validated rows. Tolerates quoted names with commas,
 *  email-first or name-first order, and a trailing column (e.g. Last, First, Email). */
function parseRoster(text: string): RosterRow[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^\s*"?name"?\s*[,;\t]\s*"?e-?mail"?/i.test(l)) // skip a header row
    .map((l) => {
      const fields = splitCsvLine(l).filter(Boolean);
      const emailIdx = fields.findIndex((f) => f.includes("@"));
      const email = emailIdx >= 0 ? fields[emailIdx] : "";
      // name = the field just before the email (handles "Last, First, email"), else first non-email field
      const firstName = (emailIdx > 0 ? fields[emailIdx - 1] : fields.find((f) => !f.includes("@"))) ?? "";
      const check = checkEmail(email);
      return { firstName, email, check, ok: Boolean(firstName) && check.valid };
    });
}

function CohortCard({ c, schoolId, onChange }: { c: CohortRow; schoolId: string; onChange: () => void }) {
  const invitesQ = useApi(() => adminApi.cohortInvites(c.id), [c.id]);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [roster, setRoster] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);

  const singleCheck = checkEmail(email);
  const canAdd = firstName.trim().length > 0 && singleCheck.valid;
  const rosterRows = parseRoster(roster);
  const validRows = rosterRows.filter((r) => r.ok);

  const refresh = async () => {
    await invitesQ.reload();
    onChange();
  };
  const addOne = async () => {
    if (!canAdd || busy) return;
    setBusy(true);
    setNotice(null);
    const to = email.trim();
    try {
      const inv = await adminApi.createCohortInvite(c.id, firstName.trim(), to);
      setNotice(
        inv.emailSent
          ? { kind: "ok", text: `Invite emailed to ${to}.` }
          : {
              kind: "warn",
              text: inv.emailError ? `Created, but email failed: ${inv.emailError}` : "Created, but the email wasn't sent.",
            },
      );
      setFirstName("");
      setEmail("");
      await refresh();
      setShowInvites(true);
    } catch (e) {
      setNotice({ kind: "warn", text: e instanceof Error ? e.message : "Couldn't create the invite." });
    }
    setBusy(false);
  };
  const generate = async () => {
    if (validRows.length === 0 || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await adminApi.bulkInvites(c.id, validRows.map((r) => ({ firstName: r.firstName, email: r.email })));
      const parts = [`${res.created} invite${res.created === 1 ? "" : "s"} created`];
      if (res.emailed) parts.push(`${res.emailed} emailed`);
      if (res.emailFailed) parts.push(`${res.emailFailed} failed to email`);
      if (res.skipped) parts.push(`${res.skipped} skipped`);
      setNotice({ kind: res.emailFailed || res.skipped ? "warn" : "ok", text: parts.join(" · ") });
      setRoster("");
      setShowBulk(false);
      await refresh();
      setShowInvites(true);
    } catch (e) {
      setNotice({ kind: "warn", text: e instanceof Error ? e.message : "Couldn't generate invites." });
    }
    setBusy(false);
  };
  const del = async () => {
    if (!confirm(`Delete "${c.label}"? This removes its invites.`)) return;
    await adminApi.deleteCohort(c.id);
    onChange();
  };
  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      /* ignore */
    }
  };

  void schoolId;
  const invites = invitesQ.data ?? [];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[15px]">{c.label}</span>
            {c.gradeLevel && <Badge kind="todo">{c.gradeLevel}</Badge>}
          </div>
          <div className="flex gap-3 mt-1 font-mono text-[11px] text-ink2">
            <span>{c.studentCount} students</span>
            <span>{invites.length} invites</span>
          </div>
        </div>
        <button onClick={del} title="Delete grade" className="w-8 h-8 rounded-lg border-2 border-ink bg-white text-error flex items-center justify-center shadow-sk-xs">
          <Icon n="trash" c="w-4 h-4" sw={2.2} />
        </button>
      </div>

      {/* single invite */}
      <div className="flex items-end gap-2 mt-3">
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          className={`flex-1 min-w-0 ${input}`}
          onKeyDown={(e) => e.key === "Enter" && addOne()}
        />
        <input
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@email.com"
          className={`flex-1 min-w-0 ${input}`}
          onKeyDown={(e) => e.key === "Enter" && addOne()}
        />
        <Button onClick={addOne} disabled={busy || !canAdd}>
          <Icon n="plus" c="w-4 h-4" sw={2.4} /> Invite
        </Button>
        <Button variant="secondary" onClick={() => setShowBulk((b) => !b)}>
          Bulk roster
        </Button>
      </div>
      {email.trim() && !singleCheck.valid && <div className="mt-1.5 text-terra font-bold text-[12px]">{singleCheck.reason}</div>}
      {singleCheck.suggestion && (
        <div className="mt-1.5 inline-flex items-center gap-2 text-[12px] font-bold text-yellowInk bg-yellow/25 border-2 border-yellow rounded-lg px-2.5 py-1">
          Did you mean <span className="font-mono">{singleCheck.suggestion}</span>?
          <button onClick={() => setEmail(singleCheck.suggestion!)} className="underline text-jadeDeep">
            Use it
          </button>
        </div>
      )}

      {/* bulk roster */}
      {showBulk && (
        <div className="mt-3 border-2 border-ink/15 rounded-lg p-3 bg-mint/10">
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-extrabold text-[12px] text-ink">
              Paste a roster — one student per line as <span className="font-mono">name, email</span> (or upload a CSV).
            </label>
            <label className="text-[11px] font-bold text-jadeDeep cursor-pointer">
              upload .csv
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setRoster(await f.text());
                }}
              />
            </label>
          </div>
          <textarea
            value={roster}
            onChange={(e) => setRoster(e.target.value)}
            rows={4}
            placeholder={"Maya, maya@example.com\nDiego, diego@example.com"}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink bg-white font-mono text-[12.5px] outline-none focus:border-jade"
          />

          {/* live preview — who the invites go to + per-row validation */}
          {rosterRows.length > 0 && (
            <div className="mt-2 border-2 border-ink rounded-lg overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0">
                  <tr className="bg-mint/50 font-mono text-[10.5px] uppercase tracking-wide text-ink2 border-b-2 border-ink">
                    <th className="px-2.5 py-1.5 font-medium w-8">#</th>
                    <th className="px-2.5 py-1.5 font-medium">Name</th>
                    <th className="px-2.5 py-1.5 font-medium">Email</th>
                    <th className="px-2.5 py-1.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {rosterRows.map((r, i) => (
                    <tr key={i} className={r.ok ? "" : "bg-terra/5"}>
                      <td className="px-2.5 py-1.5 font-mono text-[11px] text-ink3">{i + 1}</td>
                      <td className="px-2.5 py-1.5 font-bold text-[12.5px] text-ink">
                        {r.firstName || <span className="text-terra">— missing —</span>}
                      </td>
                      <td className="px-2.5 py-1.5 font-mono text-[11.5px] text-ink2 break-all">
                        {r.email || <span className="text-terra">— missing —</span>}
                      </td>
                      <td className="px-2.5 py-1.5 text-[11.5px] font-bold whitespace-nowrap">
                        {!r.firstName ? (
                          <span className="text-terra">✗ name required</span>
                        ) : !r.check.valid ? (
                          <span className="text-terra">✗ {r.check.reason}</span>
                        ) : r.check.suggestion ? (
                          <span className="text-yellowInk">⚠ did you mean {r.check.suggestion}?</span>
                        ) : (
                          <span className="text-green">✓ ready</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[11px] text-ink2">
              {validRows.length} ready
              {rosterRows.length - validRows.length > 0 && ` · ${rosterRows.length - validRows.length} need a name + valid email`}
            </span>
            <Button onClick={generate} disabled={busy || validRows.length === 0}>
              Generate {validRows.length || ""} invite{validRows.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      )}

      {notice && (
        <div
          className={`mt-3 rounded-lg border-2 px-3 py-2 font-bold text-[12.5px] ${
            notice.kind === "ok" ? "border-green bg-green/10 text-jadeDeep" : "border-terra bg-terra/10 text-terra"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* invites list */}
      {invites.length > 0 && (
        <button onClick={() => setShowInvites((s) => !s)} className="mt-3 text-[12px] font-extrabold text-jadeDeep">
          {showInvites ? "Hide" : "Show"} {invites.length} invite{invites.length > 1 ? "s" : ""}
        </button>
      )}
      {showInvites && (
        <div className="mt-2 space-y-1.5">
          {invites.map((inv) => (
            <div key={inv.id} className="flex items-center gap-2 text-[12.5px]">
              <button
                onClick={() => copy(inv.code)}
                className="inline-flex items-center gap-1.5 font-mono font-bold bg-mint/40 border-2 border-ink rounded-md px-2 py-0.5"
              >
                {inv.code}
                <Icon n={copied === inv.code ? "check" : "ticket"} c="w-3 h-3" sw={2.2} />
              </button>
              <span className="font-semibold text-ink2">{inv.intendedFirstName ?? "—"}</span>
              <Badge kind={inv.status}>{inv.status.toLowerCase()}</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function SchoolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const q = useApi(() => adminApi.school(id!), [id]);
  const [label, setLabel] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [busy, setBusy] = useState(false);

  if (q.loading) return <Loading />;
  if (q.error || !q.data) return <ErrorBox onRetry={q.reload} message={q.error?.message} />;
  const school = q.data;

  const addCohort = async () => {
    if (!label.trim()) return;
    setBusy(true);
    try {
      await adminApi.createCohort(school.id, label.trim(), gradeLevel.trim() || undefined);
      setLabel("");
      setGradeLevel("");
      await q.reload();
    } catch {
      /* ignore */
    }
    setBusy(false);
  };
  const delSchool = async () => {
    if (!confirm(`Delete "${school.name}"? This removes its grades and invites.`)) return;
    await adminApi.deleteSchool(school.id);
    navigate("/schools");
  };

  return (
    <div>
      <Link to="/schools" className="inline-flex items-center gap-1 text-ink2 font-bold text-[13px] mb-3">
        <Icon n="chevLeft" c="w-4 h-4" sw={2.4} /> Schools
      </Link>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">{school.name}</h1>
          <p className="text-ink2 font-semibold text-[13px]">{school.region ?? "—"}</p>
        </div>
        <button onClick={delSchool} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border-2 border-ink bg-white text-error font-extrabold text-[12.5px] shadow-sk-xs">
          <Icon n="trash" c="w-4 h-4" sw={2.2} /> Delete school
        </button>
      </div>

      {/* add grade */}
      <Card className="mt-6 p-4">
        <div className="font-extrabold text-[14px] mb-2">Add a grade (cohort)</div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="font-extrabold text-[12.5px] text-ink">Label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder='e.g. "9th grade" or "Ms. Lee · P3"' className={`mt-1 w-full ${input}`} onKeyDown={(e) => e.key === "Enter" && addCohort()} />
          </div>
          <div className="w-40">
            <label className="font-extrabold text-[12.5px] text-ink">Grade level</label>
            <input value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} placeholder="9th" className={`mt-1 w-full ${input}`} />
          </div>
          <Button onClick={addCohort} disabled={busy}>
            <Icon n="plus" c="w-4 h-4" sw={2.4} /> Add grade
          </Button>
        </div>
      </Card>

      {/* cohorts */}
      <div className="mt-4 space-y-3">
        {school.cohorts.length === 0 ? (
          <div className="text-ink2 font-semibold text-[14px]">No grades yet — add one above, then invite students.</div>
        ) : (
          school.cohorts.map((c) => <CohortCard key={c.id} c={c} schoolId={school.id} onChange={q.reload} />)
        )}
      </div>
    </div>
  );
}
