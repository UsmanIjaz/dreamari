import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../lib/useApi";
import { adminApi } from "../lib/api";
import { Loading, ErrorBox, Card, Badge } from "../components/ui";
import { Icon } from "../components/Icon";

const PAGE = 25;

function fmtDate(s: string) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Students() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const query = useApi(
    () => adminApi.students({ q: q.trim() || undefined, limit: PAGE, offset: page * PAGE }),
    [q, page],
  );

  // full-screen states only on the very first load — keep the table during search/page reloads
  if (query.loading && !query.data) return <Loading />;
  if (query.error && !query.data) return <ErrorBox onRetry={query.reload} message={query.error?.message} />;

  const total = query.data?.total ?? 0;
  const students = query.data?.items ?? [];
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">Students</h1>
      <p className="text-ink2 font-semibold text-[14px] mt-0.5">
        Progress, not psychology — completion, engagement, and a broad direction. Open one for detail.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => {
            setPage(0);
            setQ(e.target.value);
          }}
          placeholder="Search name, school, or grade…"
          className="w-full max-w-[360px] h-10 px-3 rounded-lg border-2 border-ink bg-white font-bold text-[14px] outline-none focus:border-jade"
        />
        <span className="font-mono text-[12px] text-ink2">
          {total} student{total === 1 ? "" : "s"}
        </span>
      </div>

      <Card className="mt-3 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-ink bg-mint/30 font-mono text-[11px] uppercase tracking-wide text-ink2">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-3 py-2.5 font-medium">Build</th>
              <th className="px-3 py-2.5 font-medium text-center">Swipes</th>
              <th className="px-3 py-2.5 font-medium text-center">Likes</th>
              <th className="px-3 py-2.5 font-medium">Leaning</th>
              <th className="px-3 py-2.5 font-medium">School</th>
              <th className="px-3 py-2.5 font-medium">Grade</th>
              <th className="px-3 py-2.5 font-medium">Active</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-ink/5">
            {students.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-ink2 font-semibold text-[13px]">
                  {q ? "No students match your search." : "No students yet — create an invite or run onboarding."}
                </td>
              </tr>
            )}
            {students.map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate(`/students/${s.id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(`/students/${s.id}`)}
                className="cursor-pointer hover:bg-mint/20 focus:bg-mint/30 focus:outline-none transition-colors"
              >
                <td className="px-4 py-3 font-extrabold text-[14px] text-ink">{s.firstName}</td>
                <td className="px-3 py-3">
                  {s.buildComplete ? <Badge kind="done">done</Badge> : <Badge kind="todo">in progress</Badge>}
                </td>
                <td className="px-3 py-3 text-center font-mono text-[13px] text-ink2">{s.swipeCount}</td>
                <td className="px-3 py-3 text-center font-mono text-[13px] text-ink2">{s.likedCount}</td>
                <td className="px-3 py-3 font-semibold text-[13px] text-ink">{s.leaning ?? "—"}</td>
                <td className="px-3 py-3 font-semibold text-[12.5px] text-ink2">{s.school ?? "—"}</td>
                <td className="px-3 py-3 font-semibold text-[12.5px] text-ink2">{s.grade ?? "—"}</td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink2">{fmtDate(s.lastActive)}</td>
                <td className="px-3 py-3 text-ink2">
                  <Icon n="chevRight" c="w-4 h-4" sw={2.4} />
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
    </div>
  );
}
