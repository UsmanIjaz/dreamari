import type { ReactNode } from "react";
import { Icon } from "./Icon";

/* The admin "register" of the design language: same Sticker tokens, calmer —
   tighter radius (lg = 12), lighter shadows, neutral surfaces, jade for actions. */

export function Spinner({ c = "w-5 h-5" }: { c?: string }) {
  return (
    <svg className={`animate-spin ${c}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-ink2">
      <Spinner />
      <span className="font-bold text-[14px]">{label}</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="bg-white border-2 border-error/40 rounded-xl p-5 flex items-center justify-between gap-4">
      <div>
        <div className="font-extrabold text-ink text-[15px]">Couldn't load this</div>
        <div className="text-ink2 font-semibold text-[13px] mt-0.5">{message ?? "The API may be unreachable."}</div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 h-9 px-4 rounded-lg bg-white border-2 border-ink text-ink font-extrabold text-[13px] shadow-sk-xs">
          Retry
        </button>
      )}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  full,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  full?: boolean;
}) {
  const look =
    variant === "primary"
      ? "bg-jade text-white"
      : variant === "danger"
        ? "bg-white text-error"
        : "bg-white text-ink";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border-2 border-ink ${look} font-extrabold text-[13.5px] shadow-sk-xs transition-all active:translate-x-px active:translate-y-px active:shadow-none disabled:opacity-40 ${full ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border-2 border-ink rounded-xl shadow-sk-sm ${className}`}>{children}</div>;
}

export function StatCard({ label, value, icon, accent = "jade" }: { label: string; value: ReactNode; icon: string; accent?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink2">{label}</span>
        <span className={`w-8 h-8 rounded-lg bg-${accent} border-2 border-ink flex items-center justify-center text-white`}>
          <Icon n={icon} c="w-4 h-4" sw={2.2} />
        </span>
      </div>
      <div className="text-[30px] font-extrabold tracking-tight text-ink mt-1.5 leading-none">{value}</div>
    </Card>
  );
}

const BADGE: Record<string, string> = {
  PENDING: "bg-yellow/40 text-yellowInk border-ink",
  REDEEMED: "bg-green text-white border-ink",
  REVOKED: "bg-white text-ink3 border-ink/40 line-through",
  done: "bg-green text-white border-ink",
  todo: "bg-white text-ink2 border-ink/40",
};

export function Badge({ kind, children }: { kind: keyof typeof BADGE | string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 text-[11px] font-extrabold ${BADGE[kind] ?? "bg-white text-ink2 border-ink/40"}`}>
      {children}
    </span>
  );
}
