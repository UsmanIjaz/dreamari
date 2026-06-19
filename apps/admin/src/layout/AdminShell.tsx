import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useSession, authClient } from "../lib/auth-client";
import { Icon } from "../components/Icon";
import { Spinner } from "../components/ui";

const NAV = [
  { to: "/", label: "Overview", icon: "grid", end: true },
  { to: "/schools", label: "Schools", icon: "cap", end: false },
  { to: "/students", label: "Students", icon: "users", end: false },
  { to: "/invites", label: "Invites", icon: "ticket", end: false },
];

function Logo() {
  return (
    <span className="w-8 h-8 rounded-lg bg-jade border-2 border-ink shadow-sk-xs flex items-center justify-center shrink-0">
      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
      </span>
    </span>
  );
}

export default function AdminShell() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.97_0.02_145)] text-jade">
        <Spinner c="w-7 h-7" />
      </div>
    );
  }
  if (!session || session.user.role !== "admin") return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex bg-[oklch(0.97_0.02_145)] text-ink">
      <aside className="w-[230px] shrink-0 bg-white border-r-2 border-ink flex flex-col">
        <div className="px-5 h-[68px] flex items-center gap-2.5 border-b-2 border-ink">
          <Logo />
          <div>
            <div className="font-extrabold text-[15px] leading-none">Dreamari</div>
            <div className="font-mono text-[10px] text-ink2 tracking-[0.12em]">ADMIN</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 h-10 rounded-lg font-extrabold text-[13.5px] transition-colors ${
                  isActive
                    ? "bg-mint text-ink border-2 border-ink shadow-sk-xs"
                    : "text-ink2 hover:bg-mint/40 border-2 border-transparent"
                }`
              }
            >
              <Icon n={n.icon} c="w-[18px] h-[18px]" sw={2.2} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t-2 border-ink">
          <div className="px-2 mb-2">
            <div className="font-extrabold text-[13px] text-ink truncate">{session.user.name}</div>
            <div className="text-[11px] text-ink2 truncate">{session.user.email}</div>
          </div>
          <button
            onClick={async () => {
              await authClient.signOut();
              navigate("/login");
            }}
            className="w-full flex items-center gap-2 px-3 h-9 rounded-lg border-2 border-ink bg-white text-ink2 font-extrabold text-[12.5px] shadow-sk-xs active:translate-y-px active:shadow-none transition-all"
          >
            <Icon n="logout" c="w-4 h-4" sw={2.2} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
