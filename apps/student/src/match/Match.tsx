import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Mascot } from "../components/Mascot";
import { Icon } from "../components/Icon";
import { Loading, ErrorState } from "../components/Loading";
import { useSound, type Snd } from "../lib/useSound";
import { useApi } from "../lib/useApi";
import { api, type DeckMajor } from "../lib/api";
import { readFit, writeFit, type FitCache } from "../lib/session";
import { useSession } from "../lib/auth-client";

type WorldView = { m: DeckMajor; explored: boolean; saved: boolean; fit: number | undefined };

/* ------------------------------------------------------------------ primitive */
function Btn({ children, onClick, full }: { children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 h-14 px-6 rounded-2xl font-extrabold text-[16px] border-[2.5px] border-ink shadow-sk bg-jade text-white transition-all duration-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-sk-xs ${full ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ dream map */
const POS = [
  { top: "2%", left: "5%" },
  { top: "10%", right: "5%" },
  { top: "40%", left: "3%" },
  { top: "50%", right: "4%" },
  { bottom: "3%", left: "29%" },
];

function World({ w, pos, onEnter, delay }: { w: WorldView; pos: (typeof POS)[number]; onEnter: () => void; delay: number }) {
  const { m, explored, saved, fit } = w;
  return (
    <button
      onClick={onEnter}
      aria-label={`Explore ${m.title}${explored ? ", explored" : ""}`}
      style={{ ...pos, animationDelay: `${delay}ms`, width: 134 } as React.CSSProperties}
      className={`absolute a-pop text-left rounded-3xl border-[2.5px] border-ink p-3 transition-all duration-150 active:translate-y-[2px] active:shadow-sk-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-jade/50 ${
        explored ? `bg-${m.accent} shadow-sk` : "bg-white shadow-sk a-bob"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`w-11 h-11 rounded-2xl border-2 border-ink flex items-center justify-center ${explored ? "bg-white text-ink" : `bg-${m.accent} text-white`}`}>
          <Icon n={m.icon} sw={2.2} c="w-6 h-6" />
        </span>
        {explored ? (
          <span className="flex items-center gap-1 bg-white border-2 border-ink rounded-full px-2 py-0.5 text-[11px] font-extrabold text-ink">
            <Icon n="spark" c="w-3 h-3" sw={2.4} />
            {fit ?? "✓"}
            {fit != null ? "/5" : ""}
          </span>
        ) : (
          <span className="w-6 h-6 rounded-full bg-mint border-2 border-ink flex items-center justify-center text-jadeDeep">
            <Icon n="chevRight" c="w-4 h-4" sw={2.6} />
          </span>
        )}
      </div>
      <div className={`font-extrabold text-[15px] leading-tight ${explored ? "text-white" : "text-ink"}`}>{m.title}</div>
      <div className={`text-[12px] font-semibold mt-0.5 ${explored ? "text-white/90" : "text-ink2"}`}>
        {explored ? (saved ? "Saved ♥" : "Explored") : `“${m.teaser}”`}
      </div>
      {!explored && <div className="mt-2 text-[10px] font-mono uppercase tracking-wide text-jadeDeep">Tap to explore</div>}
    </button>
  );
}

function DreamMap({ name, worlds, onEnter, onReport }: { name: string; worlds: WorldView[]; onEnter: (i: number) => void; onReport: () => void }) {
  const exploredCount = worlds.filter((w) => w.explored).length;
  const savedCount = worlds.filter((w) => w.saved).length;
  return (
    <div className="relative flex flex-col">
      <div className="px-5 pt-6 pb-2 z-20">
        <h1 className="text-[25px] font-extrabold tracking-tight text-ink leading-tight">Where to first{name ? `, ${name}` : ""}?</h1>
        <p className="text-ink2 font-semibold text-[14px] mt-1">Worlds picked for you. Tap one to look around.</p>
        <div className="mt-2 inline-flex items-center gap-2 bg-white border-2 border-ink rounded-full px-3 py-1 shadow-sk-xs">
          <span className="font-mono text-[11px] tracking-wide text-ink2">explored</span>
          <span className="font-extrabold text-jadeDeep text-[13px]">
            {exploredCount}/{worlds.length}
          </span>
        </div>
      </div>

      <div className="relative min-h-[640px] mx-2">
        <span className="absolute top-[18%] left-[40%] w-2 h-2 rounded-full bg-ink/20" />
        <span className="absolute top-[34%] left-[47%] w-2 h-2 rounded-full bg-ink/20" />
        <span className="absolute top-[42%] left-[60%] w-2 h-2 rounded-full bg-ink/20" />
        <span className="absolute bottom-[40%] left-[44%] w-2 h-2 rounded-full bg-ink/20" />
        <span className="absolute top-[10%] right-[42%] w-4 h-4 bg-yellow border-2 border-ink rounded-full drm-float" />
        <span className="absolute bottom-[20%] right-[10%] w-3.5 h-3.5 bg-green border-2 border-ink rotate-45 rounded-[3px] drm-floatB" />

        {worlds.map((w, i) => (
          <World key={w.m.code} w={w} pos={POS[i]} delay={i * 90} onEnter={() => onEnter(i)} />
        ))}

        <div className="absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <Mascot size={80} mood="happy" level={Math.min(4, 2 + exploredCount)} />
          <span className="mt-1 bg-white border-2 border-ink rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-ink shadow-sk-xs">you</span>
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 z-20">
        {exploredCount > 0 ? (
          <Btn full onClick={onReport}>
            See my Career Report →
          </Btn>
        ) : (
          <div className="text-center text-ink2 font-semibold text-[13px] py-3">Explore a world to begin ✨</div>
        )}
        {savedCount > 0 && (
          <div className="text-center text-ink2 font-semibold text-[12px] mt-2">
            {savedCount} major{savedCount > 1 ? "s" : ""} saved ♥
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ world enter */
function WorldEnter({ m, onReady }: { m: DeckMajor; onReady: () => void }) {
  useEffect(() => {
    const t = setTimeout(onReady, 1050);
    return () => clearTimeout(t);
  }, [onReady]);
  return (
    <button onClick={onReady} className={`relative h-full w-full bg-${m.accent} flex flex-col items-center justify-center text-center px-8 select-none`}>
      <span className="absolute top-[18%] left-[16%] w-5 h-5 bg-white border-2 border-ink rounded-full a-pop" />
      <span className="absolute top-[26%] right-[18%] w-4 h-4 bg-yellow border-2 border-ink rotate-45 rounded-[3px] a-pop" />
      <span className="absolute bottom-[24%] left-[24%] w-3.5 h-3.5 bg-white border-2 border-ink rounded-full a-pop" />
      <div className="a-pop">
        <span className="inline-flex w-24 h-24 rounded-3xl bg-white border-[3px] border-ink shadow-sk items-center justify-center text-ink">
          <Icon n={m.icon} sw={2.2} c="w-12 h-12" />
        </span>
      </div>
      <div className="mt-6 font-mono text-[12px] tracking-[0.18em] text-white/90 font-extrabold">ENTERING</div>
      <h1 className="text-[30px] font-extrabold text-white tracking-tight mt-1 a-slide">{m.title}</h1>
      {m.leadCareer && <p className="text-white/90 font-semibold text-[14px] mt-2">Leads to {m.leadCareer} & more</p>}
      <div className="mt-7 flex items-center gap-2 text-white/85 font-bold text-[13px] a-bob">
        <Mascot size={40} mood="celebrate" level={3} /> let’s look around…
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ swipe card */
function SwipeCard({
  facet,
  title,
  prompt,
  sub,
  icon,
  onDecide,
}: {
  facet: string;
  title: string;
  prompt: string;
  sub: string;
  icon: string;
  onDecide: (yes: boolean) => void;
}) {
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<null | "yes" | "no">(null);
  const startX = useRef(0);
  const dragging = useRef(false);

  const fly = (dir: "yes" | "no") => {
    setLeaving(dir);
    setTimeout(() => onDecide(dir === "yes"), 240);
  };
  const onDown = (e: React.PointerEvent) => {
    if (leaving) return;
    dragging.current = true;
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDx(e.clientX - startX.current);
  };
  const end = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dx > 110) fly("yes");
    else if (dx < -110) fly("no");
    else setDx(0);
  };

  const offset = leaving === "yes" ? 540 : leaving === "no" ? -540 : dx;
  const rot = offset * 0.04;
  const yesOp = Math.max(0, Math.min(1, offset / 100));
  const noOp = Math.max(0, Math.min(1, -offset / 100));
  const settling = !dragging.current;

  return (
    <div className="flex-1 flex flex-col">
      <div className="relative flex-1">
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={end}
          onPointerCancel={end}
          style={{ transform: `translateX(${offset}px) rotate(${rot}deg)`, transition: settling ? "transform .26s cubic-bezier(.34,1.4,.64,1)" : "none" }}
          className="absolute inset-0 touch-none select-none cursor-grab active:cursor-grabbing bg-white border-[2.5px] border-ink rounded-3xl shadow-sk p-6 flex flex-col"
        >
          {/* verdict stamps live top-right so they never cover the facet icon (top-left) */}
          <span style={{ opacity: yesOp }} className="absolute top-6 right-6 rotate-[-12deg] border-[3px] border-green text-green font-extrabold text-[22px] px-3 py-1 rounded-xl bg-white/90">
            YES
          </span>
          <span style={{ opacity: noOp }} className="absolute top-6 right-6 rotate-[12deg] border-[3px] border-terra text-terra font-extrabold text-[22px] px-3 py-1 rounded-xl bg-white/90">
            NOPE
          </span>
          <span className="w-14 h-14 rounded-2xl bg-mint border-2 border-ink flex items-center justify-center text-jadeDeep">
            <Icon n={icon} sw={2.2} c="w-8 h-8" />
          </span>
          <div className="mt-4 font-mono text-[11px] tracking-[0.14em] text-jadeDeep font-extrabold">{facet}</div>
          <div className="font-extrabold text-ink text-[15px] mt-0.5">{title}</div>
          <p className="text-ink text-[20px] font-extrabold leading-snug mt-3 flex-1">{prompt}.</p>
          <p className="text-ink2 font-semibold text-[14px]">{sub}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 pt-5">
        <button
          onClick={() => fly("no")}
          aria-label="Not for me"
          className="w-16 h-16 rounded-full bg-white border-[2.5px] border-ink shadow-sk text-terra flex items-center justify-center active:translate-y-[3px] active:shadow-sk-xs transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-terra/50"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <button
          onClick={() => fly("yes")}
          aria-label="Yes, this is me"
          className="w-20 h-20 rounded-full bg-jade border-[2.5px] border-ink shadow-sk text-white flex items-center justify-center active:translate-y-[3px] active:shadow-sk-xs transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-jade/50"
        >
          <Icon n="heart" c="w-9 h-9" sw={2.4} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ major questions */
type Facet = { facet: string; title: string; prompt: string; sub: string; icon: string };

function MajorQuestions({ m, onComplete, onBack, snd }: { m: DeckMajor; onComplete: (answers: boolean[]) => void; onBack: () => void; snd: Snd }) {
  const facets: Facet[] = useMemo(
    () => [
      { facet: "CLASSES", title: "In class", prompt: m.subCards.classes, sub: "Sound like classes you'd actually enjoy?", icon: "book" },
      { facet: "WORKSTYLE", title: "The vibe", prompt: m.subCards.workstyle, sub: "Is this the kind of environment you'd thrive in?", icon: "users" },
      { facet: "SKILLS", title: "You'd get good at", prompt: m.subCards.skills, sub: "Are these skills you'd want to build?", icon: "spark" },
      { facet: "SALARY", title: "The pay", prompt: m.subCards.salaryOutlook, sub: "Does this pay feel worth it to you?", icon: "trend" },
      { facet: "DAY", title: "A typical day", prompt: m.subCards.dayInLife, sub: "Could you picture yourself doing this day-to-day?", icon: "target" },
    ],
    [m],
  );
  const [qi, setQi] = useState(0);
  const [ans, setAns] = useState<boolean[]>([]);
  const yesCount = ans.filter(Boolean).length;

  const decide = (yes: boolean) => {
    yes ? snd.select() : snd.deselect();
    const next = [...ans, yes];
    setAns(next);
    if (qi >= facets.length - 1) {
      snd.success();
      onComplete(next);
    } else {
      setQi(qi + 1);
    }
  };

  return (
    <div className="flex flex-col h-full px-5 pt-6 pb-5">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={onBack}
          aria-label="Back to the map"
          className="w-10 h-10 rounded-full border-[2.5px] border-ink bg-white shadow-sk-sm flex items-center justify-center text-ink active:translate-y-[2px] active:shadow-none transition-all"
        >
          <Icon n="chevLeft" c="w-5 h-5" sw={2.6} />
        </button>
        <div className="flex-1">
          <div className="font-extrabold text-ink text-[16px] leading-tight">{m.title}</div>
          <div className="font-mono text-[10px] tracking-wide text-ink2">vibe check · {qi + 1} of 5</div>
        </div>
        <div className="shrink-0">
          <Mascot size={44} mood="happy" level={3} />
        </div>
      </div>

      <div className="flex gap-1.5 mb-4">
        {facets.map((_, i) => (
          <div key={i} className="flex-1 h-2.5 rounded-full bg-white border-2 border-ink overflow-hidden">
            <div className={`h-full transition-all duration-300 ${i < ans.length ? (ans[i] ? "bg-green w-full" : "bg-terra w-full") : i === qi ? "bg-yellow w-1/2" : "w-0"}`} />
          </div>
        ))}
      </div>

      <SwipeCard key={qi} {...facets[qi]} onDecide={decide} />

      <div className="flex items-center justify-center gap-2 pt-4 text-[12px] font-bold text-ink2">
        <span>Fit so far</span>
        <span className="flex gap-1">
          {facets.map((_, i) => (
            <span key={i} className={`w-3 h-3 rounded-full border-2 border-ink ${i < yesCount ? "bg-green" : "bg-white"}`} />
          ))}
        </span>
        <span className="text-jadeDeep font-extrabold">{yesCount}/5</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ major result */
function MajorResult({ m, answers, onSave, onSkip, snd }: { m: DeckMajor; answers: boolean[]; onSave: () => void; onSkip: () => void; snd: Snd }) {
  const yes = answers.filter(Boolean).length;
  const positive = yes >= 3;
  const tier = yes >= 5 ? "Made for you!" : yes === 4 ? "Strong fit" : yes === 3 ? "Could be your thing" : yes === 2 ? "Maybe not your world" : "Probably not your thing";
  const names = ["Classes", "Workstyle", "Skills", "Salary", "Day-in-life"];
  const liked = names.filter((_, i) => answers[i]);
  const unsure = names.filter((_, i) => !answers[i]);
  useEffect(() => {
    if (positive) snd.success();
    else snd.back();
  }, [positive, snd]);

  return (
    <div className="h-full px-5 flex flex-col items-center justify-center text-center">
      <div className="a-pop">
        <Mascot size={100} mood={positive ? "celebrate" : "think"} level={positive ? 4 : 2} />
      </div>
      <div className={`mt-5 inline-flex items-center gap-2 border-2 border-ink rounded-full px-3.5 py-1.5 font-extrabold text-[13px] shadow-sk-xs ${positive ? "bg-yellow text-yellowInk" : "bg-white text-ink2"}`}>
        <Icon n="spark" c="w-4 h-4" sw={2.4} /> {yes}/5 clicked
      </div>
      <h1 className="text-[26px] font-extrabold text-ink tracking-tight mt-3">{m.title}</h1>
      <p className="text-jadeDeep font-extrabold text-[16px] mt-0.5">{tier}</p>

      <div className="mt-5 w-full max-w-[320px] space-y-2">
        {liked.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-ink2 font-bold text-[12px]">Loved:</span>
            {liked.map((l) => (
              <span key={l} className="bg-green text-white border-2 border-ink rounded-full px-2.5 py-0.5 text-[12px] font-bold">{l}</span>
            ))}
          </div>
        )}
        {unsure.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-ink2 font-bold text-[12px]">Unsure:</span>
            {unsure.map((l) => (
              <span key={l} className="bg-white text-ink2 border-2 border-ink rounded-full px-2.5 py-0.5 text-[12px] font-bold">{l}</span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-7 w-full max-w-[320px] flex flex-col gap-3">
        {positive ? (
          <>
            <Btn full onClick={onSave}>
              <Icon n="heart" sw={2.2} /> Save this major
            </Btn>
            <button onClick={onSkip} className="font-bold text-ink2 text-[14px] py-1">Not for me — back to map</button>
          </>
        ) : (
          <>
            <button onClick={onSkip} className="w-full h-14 rounded-2xl bg-white text-ink border-[2.5px] border-ink shadow-sk font-extrabold text-[16px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-sk-xs transition-all">
              Back to the map
            </button>
            <button onClick={onSave} className="font-bold text-ink2 text-[14px] py-1">Still save it anyway ♥</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Explore tab */
type Phase = "map" | "enter" | "questions" | "result" | "revisit";

export default function Explore() {
  const navigate = useNavigate();
  const snd = useSound();
  const { data: session } = useSession();
  const name = session?.user.name ?? "";
  const deckQ = useApi(() => api.getDeck(), []);
  const swipesQ = useApi(() => api.getSwipes(), []);
  const [fit, setFit] = useState<FitCache>(() => readFit());
  const [optimistic, setOptimistic] = useState<Record<string, "LIKE" | "PASS">>({});
  const [phase, setPhase] = useState<Phase>("map");
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  if (deckQ.loading || swipesQ.loading) return <Loading label="Finding your worlds…" />;
  if (deckQ.error || !deckQ.data) {
    return (
      <ErrorState
        onRetry={() => {
          deckQ.reload();
          swipesQ.reload();
        }}
      />
    );
  }
  if (deckQ.data.needsBuild) return <Navigate to="/onboarding" replace />;

  const deck = deckQ.data.deck;
  const swMap = new Map<string, "LIKE" | "PASS">((swipesQ.data?.swipes ?? []).map((s) => [s.majorCode, s.decision]));
  for (const [c, d] of Object.entries(optimistic)) swMap.set(c, d); // optimistic overlay
  const worlds: WorldView[] = deck.map((m) => ({
    m,
    explored: swMap.has(m.code),
    saved: swMap.get(m.code) === "LIKE",
    fit: fit[m.code],
  }));
  const active = deck[activeIdx];

  const enter = (i: number) => {
    snd.next();
    setActiveIdx(i);
    // already explored → confirm before re-running, so a stray tap can't overwrite the result
    setPhase(swMap.has(deck[i].code) ? "revisit" : "enter");
  };
  const settle = async (saved: boolean) => {
    const code = active.code;
    const decision: "LIKE" | "PASS" = saved ? "LIKE" : "PASS";
    const f = answers.filter(Boolean).length;
    setFit((prev) => {
      const n = { ...prev, [code]: f };
      writeFit(n);
      return n;
    });
    setOptimistic((p) => ({ ...p, [code]: decision })); // map updates instantly
    setPhase("map");
    try {
      await api.swipe(code, decision, answers); // send the 5 facet answers
      await swipesQ.reload();
    } catch {
      /* fit + optimistic state already reflected locally */
    }
  };

  return (
    <>
      <DreamMap name={name} worlds={worlds} onEnter={enter} onReport={() => navigate("/app/you")} />

      {phase !== "map" && active && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cream sm:bg-[oklch(0.93_0.022_145)] sm:py-6">
          <div className="relative w-full sm:max-w-[430px] h-[100dvh] sm:h-[min(880px,92vh)] bg-cream sm:rounded-[44px] sm:border-[3px] sm:border-ink sm:shadow-sk-lg overflow-hidden">
            {phase === "revisit" && (
              <div className="h-full flex flex-col items-center justify-center text-center px-8 a-in">
                <Mascot size={92} mood="happy" level={3} />
                <h1 className="text-[24px] font-extrabold text-ink mt-5 tracking-tight">You've explored {active.title}</h1>
                <p className="text-ink2 font-semibold mt-2">
                  {swMap.get(active.code) === "LIKE" ? "You saved this one ♥" : "You passed on it"} · {fit[active.code] ?? 0}/5 vibe
                </p>
                <div className="mt-7 w-full max-w-[320px] flex flex-col gap-3">
                  <Btn
                    full
                    onClick={() => {
                      setAnswers([]);
                      setPhase("questions");
                    }}
                  >
                    Take the vibe check again
                  </Btn>
                  <button onClick={() => setPhase("map")} className="font-bold text-ink2 text-[14px] py-1">
                    Back to the map
                  </button>
                </div>
              </div>
            )}
            {phase === "enter" && <WorldEnter m={active} onReady={() => setPhase("questions")} />}
            {phase === "questions" && (
              <MajorQuestions
                m={active}
                snd={snd}
                onBack={() => setPhase("map")}
                onComplete={(a) => {
                  setAnswers(a);
                  setPhase("result");
                }}
              />
            )}
            {phase === "result" && <MajorResult m={active} answers={answers} snd={snd} onSave={() => settle(true)} onSkip={() => settle(false)} />}
          </div>
        </div>
      )}
    </>
  );
}
