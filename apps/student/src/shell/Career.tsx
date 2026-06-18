import { Link, Navigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Loading, ErrorState } from "../components/Loading";
import { useApi } from "../lib/useApi";
import { api } from "../lib/api";

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-jade border-2 border-ink flex items-center justify-center text-white">
          <Icon n={icon} c="w-4 h-4" sw={2.2} />
        </span>
        <h2 className="font-extrabold text-ink text-[16px]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

const PLAN_LABELS: [string, string][] = [
  ["now", "Now"],
  ["near", "1–2 years"],
  ["far", "3–5 years"],
];
const CERT_LABELS: [string, string][] = [
  ["now", "Start now"],
  ["during", "Along the way"],
  ["after", "Later"],
];

export default function Career() {
  const { code } = useParams();
  const reportQ = useApi(() => api.getCareerReport(code!), [code]);

  if (reportQ.loading) return <Loading label="Building your report…" />;
  if (reportQ.error || !reportQ.data) return <Navigate to="/app/you" replace />;

  const report = reportQ.data;
  const c = report.career;
  const ladder = [...report.levels].reverse(); // senior at top
  const plan = report.actionPlan as Record<string, string[]>;
  const certs = report.certifications as Record<string, string[]>;

  return (
    <div className="px-5 pt-7 pb-8">
      <Link to="/app/you" className="flex items-center gap-1 text-ink2 font-bold text-[13px] mb-4 w-fit">
        <Icon n="chevLeft" c="w-4 h-4" sw={2.6} /> Career Report
      </Link>

      <div className="bg-jade border-[2.5px] border-ink rounded-3xl shadow-sk p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[26px] font-extrabold tracking-tight leading-tight">{c.title}</h1>
          <span className="shrink-0 bg-yellow text-yellowInk border-2 border-ink rounded-full px-2.5 py-1 text-[13px] font-extrabold">{report.matchPercent}%</span>
        </div>
        <p className="text-white/90 font-semibold text-[14px] mt-1.5 leading-snug">{c.description}</p>
      </div>

      <Section icon="trend" title="Career path">
        <div className="space-y-2">
          {ladder.map((lvl, i) => (
            <div
              key={lvl.title}
              className={`flex items-center gap-3 border-[2.5px] border-ink rounded-2xl px-4 py-3 shadow-sk-sm ${i === 0 ? "bg-mint" : "bg-white"}`}
              style={{ marginLeft: `${(ladder.length - 1 - i) * 10}px` }}
            >
              <span className="font-mono text-[11px] text-ink2 shrink-0">{ladder.length - i}</span>
              <span className="flex-1 font-extrabold text-ink text-[14.5px]">{lvl.title}</span>
              <span className="font-extrabold text-jadeDeep text-[13.5px] shrink-0">{lvl.salary}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="check" title="Your action plan">
        <div className="space-y-3">
          {PLAN_LABELS.map(([key, label]) => (
            <div key={key} className="bg-white border-[2.5px] border-ink rounded-2xl shadow-sk-sm p-4">
              <div className="inline-flex items-center gap-1.5 bg-yellow text-yellowInk border-2 border-ink rounded-full px-2.5 py-0.5 text-[11px] font-extrabold mb-2.5">{label}</div>
              <div className="space-y-2">
                {(plan[key] ?? []).map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 mt-0.5 rounded-md border-2 border-ink bg-white shrink-0" />
                    <span className="text-ink font-semibold text-[13.5px] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="cap" title="Where to study">
        <div className="space-y-2.5">
          {report.universities.map((u) => (
            <div key={u.program} className="bg-white border-[2.5px] border-ink rounded-2xl shadow-sk-sm p-4">
              <div className="font-extrabold text-ink text-[14.5px]">{u.program}</div>
              <div className="text-ink2 font-semibold text-[12.5px] mt-1">
                <span className="font-mono text-[10px] uppercase tracking-wide text-jadeDeep">Needs</span> {u.requirements}
              </div>
              <div className="text-ink2 font-semibold text-[12.5px] mt-1.5 leading-snug">{u.whyFits}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="star" title="Certifications">
        <div className="grid grid-cols-1 gap-2.5">
          {CERT_LABELS.map(([key, label]) => (
            <div key={key} className="bg-white border-[2.5px] border-ink rounded-2xl shadow-sk-sm p-3.5">
              <div className="font-mono text-[10px] uppercase tracking-wide text-jadeDeep mb-2">{label}</div>
              <div className="flex flex-wrap gap-1.5">
                {(certs[key] ?? []).map((cert) => (
                  <span key={cert} className="bg-mint border-2 border-ink rounded-full px-2.5 py-1 text-[12px] font-bold text-ink">{cert}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="spark" title="Why this fits you">
        <div className="bg-yellow/30 border-[2.5px] border-ink rounded-2xl p-4">
          <p className="text-ink font-semibold text-[14px] leading-relaxed">{report.conclusion}</p>
        </div>
      </Section>

      <Link to="/app/you" className="mt-6 w-full py-3.5 rounded-2xl bg-white text-ink border-[2.5px] border-ink shadow-sk font-extrabold text-[15px] flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-sk-xs transition-all">
        Back to all careers
      </Link>
    </div>
  );
}
