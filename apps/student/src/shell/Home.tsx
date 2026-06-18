import { Link, Navigate } from "react-router-dom";
import { Mascot } from "../components/Mascot";
import { Icon } from "../components/Icon";
import { Loading, ErrorState } from "../components/Loading";
import { useApi } from "../lib/useApi";
import { api } from "../lib/api";
import { dreamScore } from "../lib/session";
import { useSession } from "../lib/auth-client";

/**
 * Home is the launchpad — greeting, progress, and the single clearest next action.
 * It deliberately avoids duplicating Explore (the map) or You (the full report):
 * once a report exists it surfaces a prominent shortcut, but the depth lives there.
 */
export default function Home() {
  const { data: session } = useSession();
  const name = session?.user.name ?? "";
  const matchQ = useApi(() => api.getMatch(), []);
  const swipesQ = useApi(() => api.getSwipes(), []);

  if (matchQ.loading || swipesQ.loading) return <Loading />;
  if (matchQ.error || !matchQ.data) return <ErrorState onRetry={() => { matchQ.reload(); swipesQ.reload(); }} />;
  // no completed BUILD yet → send them to finish it (avoids an all-35% dashboard)
  if (matchQ.data.needsBuild) return <Navigate to="/onboarding" replace />;

  const { majors } = matchQ.data;
  const swipes = swipesQ.data?.swipes ?? [];
  const likedCodes = new Set(swipes.filter((s) => s.decision === "LIKE").map((s) => s.majorCode));
  const explored = swipes.length;
  const saved = likedCodes.size;
  const score = dreamScore(explored, saved, true);
  const pct = Math.min(100, Math.round((score / 800) * 100));
  const savedMajors = majors.filter((m) => likedCodes.has(m.code));
  const total = majors.length;

  return (
    <div className="px-5 pt-7 pb-6">
      {/* greeting */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[24px] font-extrabold tracking-tight text-ink leading-tight">Hi, {name || "there"}</div>
          <div className="text-ink2 font-semibold text-[14px]">Let's keep going.</div>
        </div>
        <Mascot size={52} mood="happy" level={Math.min(4, 2 + explored)} />
      </div>

      {/* dream score */}
      <div className="rounded-3xl p-5 bg-jade border-[2.5px] border-ink shadow-sk text-white">
        <span className="font-mono text-[11px] uppercase tracking-wide opacity-90">Dream Score</span>
        <div className="text-[44px] font-extrabold leading-none tracking-tight mt-1">{score}</div>
        <div className="h-2.5 rounded-full bg-white/30 border-2 border-ink mt-3 overflow-hidden">
          <div className="h-full bg-yellow transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* career report — the payoff, elevated once it exists */}
      {saved > 0 && (
        <Link
          to="/app/you"
          className="mt-4 block bg-yellow/30 border-[2.5px] border-ink rounded-2xl p-4 shadow-sk active:translate-x-[2px] active:translate-y-[2px] active:shadow-sk-xs transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-yellow border-2 border-ink flex items-center justify-center text-yellowInk shrink-0">
              <Icon n="star" sw={2.2} c="w-6 h-6" />
            </span>
            <div className="flex-1">
              <div className="font-extrabold text-ink text-[16px]">Your Career Report</div>
              <div className="text-ink2 font-semibold text-[12.5px]">
                {saved} saved major{saved > 1 ? "s" : ""} → see where they lead
              </div>
            </div>
            <Icon n="chevRight" c="w-5 h-5" sw={2.6} />
          </div>
        </Link>
      )}

      {/* the single clear next action */}
      <Link
        to="/app/explore"
        className="mt-4 flex items-center gap-3 bg-white border-[2.5px] border-ink rounded-2xl p-3.5 shadow-sk active:translate-x-[2px] active:translate-y-[2px] active:shadow-sk-xs transition-all"
      >
        <span className="w-11 h-11 rounded-xl bg-mint border-2 border-ink flex items-center justify-center text-jadeDeep shrink-0">
          <Icon n="globe" sw={2.2} />
        </span>
        <div className="flex-1">
          <div className="font-extrabold text-ink text-[15px]">
            {explored < total ? "Explore your worlds" : "Revisit the Dream Map"}
          </div>
          <div className="text-ink2 font-semibold text-[12.5px]">{explored} of {total} explored</div>
        </div>
        <span className="w-8 h-8 rounded-full bg-jade border-2 border-ink text-white flex items-center justify-center">
          <Icon n="chevRight" c="w-4 h-4" sw={2.6} />
        </span>
      </Link>

      {/* saved majors — progress at a glance */}
      {savedMajors.length > 0 && (
        <div className="mt-6">
          <div className="font-extrabold text-ink text-[15px] mb-2.5">Saved majors</div>
          <div className="flex flex-wrap gap-2">
            {savedMajors.map((m) => (
              <span key={m.code} className={`inline-flex items-center gap-1.5 bg-${m.accent} text-white border-2 border-ink rounded-full pl-1.5 pr-3 py-1 text-[13px] font-extrabold`}>
                <span className="w-5 h-5 rounded-full bg-white/90 text-ink flex items-center justify-center">
                  <Icon n={m.icon} c="w-3 h-3" sw={2.4} />
                </span>
                {m.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
