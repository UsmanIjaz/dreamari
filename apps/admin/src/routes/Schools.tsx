import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../lib/useApi";
import { adminApi } from "../lib/api";
import { Loading, ErrorBox, Card, Button } from "../components/ui";
import { Icon } from "../components/Icon";

const input = "h-10 px-3 rounded-lg border-2 border-ink bg-white font-bold text-[14px] outline-none focus:border-jade";

export default function Schools() {
  const q = useApi(() => adminApi.schools(), []);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await adminApi.createSchool(name.trim(), region.trim() || undefined);
      setName("");
      setRegion("");
      await q.reload();
    } catch {
      /* ignore */
    }
    setBusy(false);
  };

  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">Schools</h1>
      <p className="text-ink2 font-semibold text-[14px] mt-0.5">Create schools, add grades (cohorts), and invite students per grade.</p>

      <Card className="mt-6 p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="font-extrabold text-[12.5px] text-ink">School name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Westfield High" className={`mt-1 w-full ${input}`} onKeyDown={(e) => e.key === "Enter" && create()} />
          </div>
          <div className="w-44">
            <label className="font-extrabold text-[12.5px] text-ink">Region (optional)</label>
            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="US" className={`mt-1 w-full ${input}`} />
          </div>
          <Button onClick={create} disabled={busy}>
            <Icon n="plus" c="w-4 h-4" sw={2.4} /> Add school
          </Button>
        </div>
      </Card>

      {q.loading ? (
        <Loading />
      ) : q.error || !q.data ? (
        <div className="mt-4">
          <ErrorBox onRetry={q.reload} message={q.error?.message} />
        </div>
      ) : q.data.length === 0 ? (
        <div className="mt-4 text-ink2 font-semibold text-[14px]">No schools yet — add one above.</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.data.map((s) => (
            <Link
              key={s.id}
              to={`/schools/${s.id}`}
              className="bg-white border-2 border-ink rounded-xl shadow-sk-sm p-4 hover:-translate-y-px hover:shadow-sk transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-jade border-2 border-ink flex items-center justify-center text-white">
                    <Icon n="cap" c="w-4 h-4" sw={2.2} />
                  </span>
                  <div className="font-extrabold text-[16px]">{s.name}</div>
                </div>
                <Icon n="chevRight" c="w-5 h-5 text-ink2" sw={2.4} />
              </div>
              <div className="flex gap-4 mt-3 font-mono text-[11px] text-ink2">
                <span>{s.cohortCount} grades</span>
                <span>{s.studentCount} students</span>
                <span>{s.inviteCount} invites</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
