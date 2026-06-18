import { Mascot } from "./Mascot";

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4 text-center px-6">
      <Mascot size={84} mood="happy" level={2} />
      <div className="font-extrabold text-ink2 text-[14px]">{label}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-3 text-center px-8">
      <Mascot size={80} mood="think" level={2} />
      <div className="font-extrabold text-ink text-[15px]">Couldn't reach Dreamari</div>
      <p className="text-ink2 font-semibold text-[13px] max-w-[260px]">
        {message ?? "We're having trouble connecting right now. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 h-11 px-5 rounded-2xl bg-jade text-white border-[2.5px] border-ink shadow-sk font-extrabold text-[14px] active:translate-y-[2px] active:shadow-sk-xs transition-all"
        >
          Try again
        </button>
      )}
    </div>
  );
}
