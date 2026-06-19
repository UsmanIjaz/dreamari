import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApi } from "../lib/useApi";
import { adminApi, type BuildAnswers } from "../lib/api";
import { Loading, ErrorBox, Card, Badge, StatCard } from "../components/ui";
import { Icon } from "../components/Icon";

function AnswersTable({ a }: { a: NonNullable<BuildAnswers> }) {
  const rows: [string, string][] = [
    ["Grade", a.grade ?? ""],
    ["GPA", a.gpa ?? ""],
    ["Subjects", a.subjects.join(", ")],
    ["Strengths", a.strengths.join(", ")],
    ["Day activities", a.days.join(", ")],
    ["Values", a.values.join(", ")],
    ["Energy", a.energy ?? ""],
    ["Team", a.team ?? ""],
    ["Interaction", a.interaction ?? ""],
    ["Study length", a.years ?? ""],
    ["Cost sensitivity", a.finance ?? ""],
    ["Location", a.location ?? ""],
    ["Path preference", a.pathPref ?? ""],
  ];
  return (
    <div className="mt-4 border-t-2 border-ink/5 divide-y-2 divide-ink/5">
      {rows.map(([l, v]) => (
        <div key={l} className="flex gap-3 py-2">
          <span className="w-40 shrink-0 font-mono text-[11px] uppercase tracking-wide text-ink2 pt-0.5">{l}</span>
          <span className="flex-1 font-bold text-[13px] text-ink">{v || "—"}</span>
        </div>
      ))}
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams();
  const [reveal, setReveal] = useState(false);
  const q = useApi(() => adminApi.student(id!, reveal), [id, reveal]);

  // keep the page visible while toggling Reveal (a reload) instead of flashing a spinner
  if (q.loading && !q.data) return <Loading />;
  if (q.error && !q.data) return <ErrorBox onRetry={q.reload} message={q.error?.message} />;
  if (!q.data) return <Loading />;
  const s = q.data;

  return (
    <div>
      <Link to="/students" className="inline-flex items-center gap-1 text-ink2 font-bold text-[13px] mb-3">
        <Icon n="chevLeft" c="w-4 h-4" sw={2.4} /> Students
      </Link>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-extrabold tracking-tight">{s.firstName}</h1>
        {s.buildComplete ? <Badge kind="done">build complete</Badge> : <Badge kind="todo">build in progress</Badge>}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <StatCard label="Swipes" value={s.swipeCount} icon="spark" />
        <StatCard label="Liked majors" value={s.likedCount} icon="check" accent="green" />
        <StatCard label="Leaning" value={<span className="text-[17px]">{s.leaning[0] ?? "—"}</span>} icon="trend" accent="jade" />
      </div>

      {s.leaning.length > 0 && (
        <Card className="mt-4 p-4">
          <div className="font-mono text-[11px] uppercase tracking-wide text-ink2 mb-2">Direction · top majors</div>
          <div className="flex flex-wrap gap-2">
            {s.leaning.map((l) => (
              <span key={l} className="bg-mint border-2 border-ink rounded-full px-3 py-1 text-[13px] font-extrabold">
                {l}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* privacy gate — revealing raw answers is an explicit audit action */}
      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-yellow/40 border-2 border-ink flex items-center justify-center text-yellowInk">
              <Icon n="shield" c="w-4 h-4" sw={2.2} />
            </span>
            <div>
              <div className="font-extrabold text-[14px]">Assessment answers</div>
              <div className="text-ink2 font-semibold text-[12.5px]">Private by default — every reveal is recorded in the audit log.</div>
            </div>
          </div>
          <button
            onClick={() => setReveal((r) => !r)}
            className="shrink-0 inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border-2 border-ink bg-white font-extrabold text-[12.5px] shadow-sk-xs active:translate-y-px active:shadow-none transition-all"
          >
            <Icon n={reveal ? "eyeOff" : "eye"} c="w-4 h-4" sw={2.2} /> {reveal ? "Hide" : "Reveal"}
          </button>
        </div>
        {reveal && (
          <>
            {s.answers ? (
              <AnswersTable a={s.answers} />
            ) : (
              <div className="mt-4 text-ink2 font-semibold text-[13px]">No assessment answers on file.</div>
            )}
            <div className="mt-3 text-ink3 font-semibold text-[11.5px]">✓ This view was recorded in the audit log.</div>
          </>
        )}
      </Card>
    </div>
  );
}
