import { NavLink, Outlet, Navigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Loading } from "../components/Loading";
import { useSession } from "../lib/auth-client";

/**
 * The app shell — the phone frame + the persistent bottom tab bar. Tab screens
 * render into <Outlet/>. Immersive flows (onboarding, the swipe session) render
 * ABOVE this as full-screen overlays, so the bar is hidden during a focused moment.
 */

const TABS = [
  { to: "/app/home", label: "Home", icon: "grid", soon: false },
  { to: "/app/explore", label: "Explore", icon: "globe", soon: false },
  { to: "/app/play", label: "Play", icon: "rocket", soon: true },
  { to: "/app/you", label: "You", icon: "user", soon: false },
];

function TabBar() {
  return (
    <nav
      className="shrink-0 border-t-[2.5px] border-ink bg-white flex items-stretch px-1.5 pt-2"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          aria-label={t.soon ? `${t.label} (coming soon)` : t.label}
          className="flex-1 flex flex-col items-center gap-1 py-0.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade"
        >
          {({ isActive }) => (
            <>
              <span
                className={`relative w-12 h-9 rounded-xl border-2 flex items-center justify-center transition-all duration-150 ${
                  isActive
                    ? "bg-jade text-white border-ink shadow-sk-xs -translate-y-px"
                    : "bg-white text-ink2 border-transparent"
                }`}
              >
                <Icon n={t.icon} sw={2.3} c="w-5 h-5" />
                {t.soon && (
                  <span className="absolute -top-0.5 right-1.5 px-1 h-3.5 rounded-full bg-mint2 border border-ink text-ink text-[7px] font-extrabold flex items-center leading-none">
                    soon
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-extrabold ${isActive ? "text-ink" : "text-ink2"}`}>{t.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Shell() {
  const { data: session, isPending } = useSession();
  // not signed in → back to the entry flow (Better Auth owns the session)
  if (!isPending && !session) return <Navigate to="/onboarding" replace />;
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[oklch(0.93_0.022_145)] sm:py-6">
      <div className="relative w-full sm:max-w-[430px] h-[100dvh] sm:h-[min(880px,92vh)] bg-cream sm:rounded-[44px] sm:border-[3px] sm:border-ink sm:shadow-sk-lg overflow-hidden flex flex-col">
        {isPending ? (
          <Loading />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto noscroll">
              <Outlet />
            </div>
            <TabBar />
          </>
        )}
      </div>
    </div>
  );
}
