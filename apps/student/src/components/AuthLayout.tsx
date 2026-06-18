import { type ReactNode } from "react";
import { Link } from "react-router-dom";

/** The two-eye Dreamy badge used across auth screens. */
function DreamyMark() {
  return (
    <span className="w-10 h-10 rounded-xl bg-jade border-[2.5px] border-ink shadow-sk-xs flex items-center justify-center">
      <span className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-white" />
        <span className="w-2 h-2 rounded-full bg-white" />
      </span>
    </span>
  );
}

/** Centered mobile-framed shell for Login / Invite / Save / Reset screens. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[oklch(0.93_0.022_145)] sm:py-6 px-4">
      <Link
        to="/"
        className="hidden sm:flex items-center gap-1.5 fixed top-5 left-5 z-50 font-bold text-ink2 text-[13px] bg-white border-[2.5px] border-ink rounded-full pl-3 pr-3.5 py-1.5 shadow-sk-sm hover:-translate-y-0.5 hover:shadow-sk transition-all"
      >
        ‹ Dreamari
      </Link>
      <div className="relative w-full sm:max-w-[430px] min-h-[100dvh] sm:min-h-[560px] bg-cream sm:rounded-[44px] sm:border-[3px] sm:border-ink sm:shadow-sk-lg overflow-hidden flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[340px]">
          <div className="flex items-center gap-2.5 justify-center mb-7">
            <DreamyMark />
            <span className="font-extrabold text-[20px] text-ink">
              Dreamari<span className="text-jade">.</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export const AUTH_FIELD =
  "w-full h-12 px-3.5 rounded-xl border-[2.5px] border-ink bg-white font-bold text-[15px] text-ink placeholder:text-ink3 placeholder:font-semibold outline-none focus:border-jade";
