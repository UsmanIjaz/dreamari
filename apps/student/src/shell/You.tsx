import { Link, useNavigate } from "react-router-dom";
import { Mascot } from "../components/Mascot";
import { Icon } from "../components/Icon";
import { Loading, ErrorState } from "../components/Loading";
import { useApi } from "../lib/useApi";
import { api, type ReportGroup } from "../lib/api";
import { authClient, useSession } from "../lib/auth-client";

const PATH_LABEL: Record<string, string> = { college: "College", trades: "Trades", both: "College + Trades" };

function CareerRow({ cs }: { cs: ReportGroup["careers"][number] }) {
  return (
    <Link
      to={`/app/career/${cs.code}`}
      className="flex items-center gap-3 bg-white border-[2.5px] border-ink rounded-2xl shadow-sk-sm p-3 active:translate-x-[2px] active:translate-y-[2px] active:shadow-sk-xs transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-ink text-[15px]">{cs.title}</div>
        <div className="text-ink2 font-semibold text-[12px] leading-snug mt-0.5">{cs.description}</div>
      </div>
      <span className="shrink-0 text-[12px] font-extrabold text-white bg-green border-2 border-ink rounded-full px-2 py-0.5">{cs.matchPercent}%</span>
      <span className="shrink-0 text-ink2">
        <Icon n="chevRight" c="w-5 h-5" sw={2.4} />
      </span>
    </Link>
  );
}

export default function You() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const name = session?.user.name ?? "";
  const isGuest = Boolean((session?.user as { isAnonymous?: boolean } | undefined)?.isAnonymous);
  const buildQ = useApi(() => api.getBuild(), []);
  const reportQ = useApi(() => api.getReport(), []);

  if (buildQ.loading || reportQ.loading) return <Loading />;
  if (reportQ.error) return <ErrorState onRetry={() => { buildQ.reload(); reportQ.reload(); }} />;

  const grade = buildQ.data?.grade ?? "—";
  const pathPref = buildQ.data?.pathPref;
  const groups = reportQ.data?.groups ?? [];

  const downloadMyData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      name: name || null,
      buildProfile: buildQ.data ?? null,
      careerReport: reportQ.data ?? null,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-dreamari-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-5 pt-7 pb-6">
      <div className="flex items-center gap-3 mb-5">
        <Mascot size={58} mood="happy" level={4} />
        <div className="flex-1">
          <div className="text-[22px] font-extrabold tracking-tight text-ink leading-tight">{name || "You"}</div>
          <div className="text-ink2 font-semibold text-[13px]">
            {grade} · {pathPref ? PATH_LABEL[pathPref] ?? "Exploring" : "Exploring"}
          </div>
        </div>
        <Link to="/onboarding?redo=1" className="font-bold text-ink2 text-[12px] bg-white border-2 border-ink rounded-full px-3 py-1.5 shadow-sk-xs">
          Redo BUILD
        </Link>
      </div>

      {isGuest && (
        <Link
          to="/save"
          className="block mb-5 bg-jade text-white border-[2.5px] border-ink rounded-2xl shadow-sk p-4 active:translate-x-[2px] active:translate-y-[2px] active:shadow-sk-xs transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-white/20 border-2 border-white/50 flex items-center justify-center shrink-0">
              <Icon n="spark" c="w-5 h-5" sw={2.4} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-[14.5px]">Save your account</div>
              <div className="font-semibold text-[12px] text-white/85 leading-snug">
                You're exploring as a guest — add an email so you don't lose your matches.
              </div>
            </div>
            <Icon n="chevRight" c="w-5 h-5" sw={2.4} />
          </div>
        </Link>
      )}

      <div className="font-extrabold text-ink text-[16px] mb-2.5">Your Career Report</div>
      {groups.length === 0 ? (
        <div className="bg-white border-[2.5px] border-ink rounded-2xl shadow-sk px-5 py-7 text-center">
          <p className="text-ink font-extrabold text-[15px]">No majors saved yet.</p>
          <p className="text-ink2 font-semibold text-[13px] mt-1">Explore a world and save one you love.</p>
          <Link to="/app/explore" className="inline-flex items-center justify-center gap-2 mt-4 h-11 px-5 rounded-2xl bg-jade text-white border-[2.5px] border-ink shadow-sk font-extrabold text-[14px] active:translate-y-[2px] active:shadow-sk-xs transition-all">
            Open the Dream Map →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(({ major, careers }) => (
            <div key={major.code}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-7 h-7 rounded-lg bg-${major.accent} border-2 border-ink flex items-center justify-center text-white`}>
                  <Icon n={major.icon} c="w-4 h-4" sw={2.4} />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wide text-ink2">from {major.title}</span>
              </div>
              <div className="space-y-2">
                {careers.map((cs) => (
                  <CareerRow key={cs.code} cs={cs} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-7 bg-white border-[2.5px] border-ink rounded-2xl shadow-sk-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-lg bg-green border-2 border-ink flex items-center justify-center text-white">
            <Icon n="shield" c="w-4 h-4" sw={2.2} />
          </span>
          <span className="font-extrabold text-ink text-[14px]">Your data is yours</span>
        </div>
        <p className="text-ink2 font-semibold text-[12.5px] leading-snug">No public profile, nothing sold. You can download or delete everything, anytime.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={downloadMyData}
            className="flex-1 h-10 rounded-xl bg-white border-2 border-ink text-ink font-extrabold text-[12.5px] shadow-sk-xs active:translate-y-px active:shadow-none transition-all"
          >
            Download my data
          </button>
          <button
            onClick={async () => {
              await authClient.signOut();
              navigate("/");
            }}
            className="flex-1 h-10 rounded-xl bg-white border-2 border-ink text-error font-extrabold text-[12.5px] shadow-sk-xs"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
