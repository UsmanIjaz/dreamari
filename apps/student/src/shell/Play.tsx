import { Mascot } from "../components/Mascot";
import { Icon } from "../components/Icon";
import { Loading, ErrorState } from "../components/Loading";
import { useApi } from "../lib/useApi";
import { api } from "../lib/api";

/**
 * Play — the games & day-in-the-life simulations (the "Simulate" stage).
 * Tastefully stubbed for the trial; the teasers are generated from the student's
 * own top majors (fetched from the API), signalling the full journey.
 */
export default function Play() {
  const deckQ = useApi(() => api.getDeck(), []);

  if (deckQ.loading) return <Loading />;
  if (deckQ.error || !deckQ.data) return <ErrorState onRetry={() => deckQ.reload()} />;

  const deck = deckQ.data.deck;

  return (
    <div className="px-5 pt-7 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[24px] font-extrabold tracking-tight text-ink leading-tight">Play</div>
          <div className="text-ink2 font-semibold text-[14px]">Try a career on for a day.</div>
        </div>
        <Mascot size={52} mood="celebrate" level={4} />
      </div>

      <div className="rounded-3xl bg-mint border-[2.5px] border-ink shadow-sk p-5 flex items-center gap-3">
        <span className="w-12 h-12 rounded-2xl bg-jade border-2 border-ink flex items-center justify-center text-white shrink-0">
          <Icon n="rocket" sw={2.2} c="w-6 h-6" />
        </span>
        <div>
          <div className="font-extrabold text-ink text-[15px]">Day-in-the-life simulations</div>
          <div className="text-ink2 font-semibold text-[12.5px] leading-snug">Make the calls a real pro makes, then see if it clicked. Arriving next.</div>
        </div>
      </div>

      <div className="mt-6 font-extrabold text-ink text-[15px] mb-2.5">From your worlds</div>
      <div className="flex flex-col gap-3">
        {deck.map((m) => (
          <div key={m.code} className="relative flex items-center gap-3 bg-white border-[2.5px] border-ink rounded-2xl p-3.5 shadow-sk-sm overflow-hidden">
            <span className={`w-11 h-11 rounded-xl bg-${m.accent} border-2 border-ink flex items-center justify-center text-white shrink-0`}>
              <Icon n={m.icon} sw={2.2} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-ink text-[14.5px]">A day as a {m.leadCareer ?? m.title}</div>
              <div className="text-ink2 font-semibold text-[12px] truncate">{m.subCards.dayInLife}</div>
            </div>
            <span className="flex items-center gap-1 bg-mint2 text-ink2 border-2 border-ink rounded-full px-2.5 py-1 text-[11px] font-extrabold shrink-0">
              <Icon n="shield" c="w-3.5 h-3.5" sw={2.2} /> Soon
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-ink2 font-semibold text-[12px] mt-6">Simulations & glossary games are on the roadmap — see the build plan.</p>
    </div>
  );
}
