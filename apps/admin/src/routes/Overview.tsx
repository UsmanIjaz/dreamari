import { Link } from "react-router-dom";
import { useApi } from "../lib/useApi";
import { adminApi } from "../lib/api";
import { Loading, ErrorBox, StatCard, Card } from "../components/ui";
import { Icon } from "../components/Icon";

export default function Overview() {
  const q = useApi(() => adminApi.analytics(), []);
  if (q.loading) return <Loading />;
  if (q.error || !q.data) return <ErrorBox onRetry={q.reload} message={q.error?.message} />;

  const a = q.data;
  const maxLikes = Math.max(1, ...a.popularMajors.map((p) => p.likes));

  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">Overview</h1>
      <p className="text-ink2 font-semibold text-[14px] mt-0.5">Aggregate engagement across all students.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        <StatCard label="Students" value={a.totalStudents} icon="users" />
        <StatCard label="Builds done" value={a.completedBuilds} icon="check" accent="green" />
        <StatCard label="Completion" value={`${a.completionRate}%`} icon="trend" accent="jade" />
        <StatCard label="Swipes" value={a.totalSwipes} icon="spark" accent="terra" />
      </div>

      <Card className="mt-6 p-5">
        <div className="font-extrabold text-[15px] mb-3">Most-liked majors</div>
        {a.popularMajors.length === 0 ? (
          <div className="text-ink2 font-semibold text-[13px]">No likes recorded yet.</div>
        ) : (
          <div className="space-y-2.5">
            {a.popularMajors.map((p) => (
              <div key={p.code} className="flex items-center gap-3">
                <div className="w-40 shrink-0 font-extrabold text-[13.5px] truncate">{p.title}</div>
                <div className="flex-1 h-5 rounded-md bg-mint/40 border-2 border-ink overflow-hidden">
                  <div className="h-full bg-jade" style={{ width: `${(p.likes / maxLikes) * 100}%` }} />
                </div>
                <div className="w-8 text-right font-mono text-[12px] text-ink2">{p.likes}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-6 flex gap-3">
        <Link to="/students" className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white border-2 border-ink text-ink font-extrabold text-[13.5px] shadow-sk-xs">
          <Icon n="users" c="w-4 h-4" sw={2.2} /> View students
        </Link>
        <Link to="/invites" className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white border-2 border-ink text-ink font-extrabold text-[13.5px] shadow-sk-xs">
          <Icon n="ticket" c="w-4 h-4" sw={2.2} /> Manage invites
        </Link>
      </div>
    </div>
  );
}
