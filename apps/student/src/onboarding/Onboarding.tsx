import { useState, useRef, useEffect, type ReactNode, type Key } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mascot, type Mood } from "../components/Mascot";
import { Icon } from "../components/Icon";
import { useSound, type Snd } from "../lib/useSound";
import {
  type Answers,
  EMPTY,
  SAVE_KEY,
  GRADES,
  GPAS,
  SUBJECTS,
  STRENGTHS,
  DAYS,
  VALUES,
  ENERGY,
  TEAM,
  INTERACT,
  YEARS,
  FINANCE,
  LOCATIONS,
  STAGES,
  AFFIRM,
  INTER_COPY,
  SLIDES,
  PATHS,
  FINISH,
  CONFETTI_COLORS,
  buzz,
} from "./data";
import { api } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { SaveAccount } from "../components/SaveAccount";
import { PREFILL_KEY } from "../routes/Invite";

/* ------------------------------------------------------------------ primitives */
function Btn({
  children,
  onClick,
  variant = "primary",
  full,
  color = "jade",
  disabled,
  snd,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  full?: boolean;
  color?: string;
  disabled?: boolean;
  snd?: Snd;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 h-14 px-6 rounded-2xl font-extrabold text-[16px] border-[2.5px] border-ink select-none transition-all duration-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-sk-xs disabled:opacity-40 disabled:active:translate-x-0 disabled:active:translate-y-0";
  const look =
    variant === "primary" ? `bg-${color} text-white shadow-sk` : "bg-white text-ink shadow-sk";
  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        snd?.tap();
        onClick?.();
      }}
      className={`${base} ${look} ${full ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}

function Continue({ label, dim, onClick }: { label: string; dim: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full h-14 rounded-2xl font-extrabold text-[16px] tracking-wide border-[2.5px] transition-all duration-75 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-jade/50 " +
        (dim
          ? "bg-mint2 text-ink3 border-ink/30"
          : "bg-jade text-white border-ink shadow-d-lg active:translate-y-[5px] active:shadow-none")
      }
    >
      {label}
    </button>
  );
}

/** big 3D tappable option (single / multi / big) */
function Opt({
  label,
  desc,
  icon,
  selected,
  disabled,
  multi,
  onClick,
}: {
  label: string;
  desc?: string;
  icon?: string;
  selected: boolean;
  disabled?: boolean;
  multi?: boolean;
  onClick: () => void;
}) {
  const ring = selected ? "border-jade bg-mint shadow-d-jade" : "border-ink bg-white shadow-d";
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={
        "w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-[2.5px] text-left transition-all duration-75 active:translate-y-[4px] active:shadow-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-jade/50 " +
        ring
      }
    >
      {icon && (
        <span
          className={
            "w-10 h-10 rounded-xl border-2 border-ink flex items-center justify-center shrink-0 " +
            (selected ? "bg-jade text-white" : "bg-mint text-jadeDeep")
          }
        >
          <Icon n={icon} sw={2.2} />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-ink text-[16px] leading-tight">{label}</div>
        {desc && <div className="text-ink2 text-[12.5px] font-semibold leading-snug mt-0.5">{desc}</div>}
      </div>
      <span
        className={
          (multi ? "rounded-md " : "rounded-full ") +
          "w-6 h-6 border-2 border-ink flex items-center justify-center shrink-0 " +
          (selected ? "bg-green text-white" : "bg-white")
        }
      >
        {selected && <Icon n="check" c="w-4 h-4" sw={3} />}
      </span>
    </button>
  );
}

/** mascot speaks the question; evolves by stage via `level` */
function Ask({ mood, level = 1, children }: { mood?: Mood; level?: number; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div key={level} className="shrink-0 mt-0.5 a-pop">
        <Mascot size={62} mood={mood} level={level} />
      </div>
      <div className="relative bg-white border-[2.5px] border-ink rounded-2xl shadow-sk-sm px-4 py-3 text-ink font-extrabold text-[17px] leading-snug a-slide">
        {children}
        <span className="absolute -left-[9px] top-5 w-3 h-3 bg-white border-l-[2.5px] border-b-[2.5px] border-ink rotate-45" />
      </div>
    </div>
  );
}

function Confetti() {
  // inline-animated bits aren't covered by the CSS reduced-motion rule, so gate them here
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return null;
  const bits = Array.from({ length: 46 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {bits.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2.4;
        const dur = 2.2 + Math.random() * 1.8;
        const sz = 7 + Math.random() * 7;
        const sq = i % 2 === 0;
        return (
          <span
            key={i}
            className="absolute top-[-20px] border border-ink"
            style={{
              left: `${left}%`,
              width: sz,
              height: sz,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              borderRadius: sq ? 2 : 999,
              animation: `drm-confetti ${dur}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ screen 0 · splash */
function Splash({ snd, onDone }: { snd: Snd; onDone: () => void }) {
  const [phase, setPhase] = useState<"launch" | "intro">("launch");
  const [w, setW] = useState(0);
  const [i, setI] = useState(0);
  const sx = useRef(0);

  useEffect(() => {
    const t1 = setTimeout(() => setW(100), 90);
    const t2 = setTimeout(() => setPhase("intro"), 1650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const go = (n: number) => {
    if (n < 0 || n > SLIDES.length - 1) return;
    snd.next();
    setI(n);
  };

  if (phase === "launch") {
    return (
      <div
        onClick={() => setPhase("intro")}
        className="h-full bg-jade flex flex-col items-center justify-center text-center px-8 cursor-pointer select-none"
      >
        <div className="a-pop">
          <Mascot size={120} mood="happy" level={2} />
        </div>
        <h1 className="text-white font-extrabold text-[46px] tracking-tight mt-7">Dreamari</h1>
        <p className="text-white/90 font-bold text-[16px] mt-1">Dream it. Then go be it.</p>
        <div className="w-44 h-3.5 rounded-full bg-white/25 border-2 border-ink overflow-hidden mt-9">
          <div
            className="h-full bg-yellow rounded-r-full transition-all ease-out"
            style={{ width: w + "%", transitionDuration: "1450ms" }}
          />
        </div>
        <p className="text-white/85 font-semibold text-[12px] mt-3">Loading your future…</p>
      </div>
    );
  }

  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <div
      className="h-full flex flex-col bg-cream select-none"
      onPointerDown={(e) => {
        sx.current = e.clientX;
      }}
      onPointerUp={(e) => {
        const dx = e.clientX - sx.current;
        if (dx < -50) go(i + 1);
        else if (dx > 50) go(i - 1);
      }}
    >
      <div className="flex justify-end px-5 pt-5">
        <button
          onClick={() => {
            snd.tap();
            onDone();
          }}
          className="font-bold text-ink2 text-[14px] px-3 py-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-jade/50 rounded-full"
        >
          Skip
        </button>
      </div>
      <div key={i} className="a-in flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="relative mb-8">
          <span className="absolute -left-11 top-0 w-5 h-5 bg-yellow border-2 border-ink rounded-full" />
          <span className="absolute -right-10 top-7 w-5 h-5 bg-green border-2 border-ink rotate-45 rounded-[3px]" />
          <span className="absolute right-0 -top-3 w-3.5 h-3.5 bg-terra border-2 border-ink rounded-full" />
          <div className="a-pop">
            <Mascot size={116} mood={s.mood} level={s.level} />
          </div>
        </div>
        <h1 className="text-ink font-extrabold text-[28px] tracking-tight leading-tight max-w-[300px]">
          {s.title}
        </h1>
        <p className="text-ink2 font-semibold text-[15.5px] mt-3 leading-snug max-w-[290px]">{s.body}</p>
        {"proof" in s && s.proof && (
          <div className="mt-5 inline-flex items-center gap-2 bg-yellow text-yellowInk border-2 border-ink rounded-full px-3.5 py-1.5 font-extrabold text-[12.5px] shadow-sk-xs">
            <Icon n="users" c="w-4 h-4" sw={2.2} />
            {s.proof}
          </div>
        )}
      </div>
      <div className="px-5 pb-7">
        <div className="flex items-center justify-center gap-2 mb-4">
          {SLIDES.map((_, k) => (
            <button
              key={k}
              onClick={() => go(k)}
              className={
                "h-2.5 rounded-full border-2 border-ink transition-all duration-300 " +
                (k === i ? "w-7 bg-jade" : "w-2.5 bg-white")
              }
            />
          ))}
        </div>
        <Continue
          label={last ? "MEET DREAMY" : "NEXT"}
          dim={false}
          onClick={() => {
            if (last) {
              snd.next();
              onDone();
            } else go(i + 1);
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ screen 1 · welcome */
function Welcome({ onNext, snd }: { onNext: () => void; snd: Snd }) {
  return (
    <div className="h-full px-5 a-in flex flex-col items-center justify-center text-center">
      <Mascot size={120} mood="happy" />
      <div className="relative mt-7 bg-white border-[2.5px] border-ink rounded-2xl shadow-sk px-6 py-5 max-w-[320px]">
        <span className="absolute left-1/2 -top-[10px] -translate-x-1/2 w-4 h-4 bg-white border-l-[2.5px] border-t-[2.5px] border-ink rotate-45" />
        <div className="font-extrabold text-ink text-[20px]">Hi, I'm Dreamy 👋</div>
        <p className="text-ink2 font-semibold text-[14.5px] mt-1.5 leading-snug">
          I'm your virtual friend — let's find your dream career together.
        </p>
      </div>
      <div className="mt-8 w-full max-w-[320px]">
        <Btn full color="jade" snd={snd} onClick={onNext}>
          <Icon n="spark" sw={2.2} /> Let's Go
        </Btn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ screen 2 · choose path */
function ChoosePath({
  onPick,
  onBack,
  snd,
}: {
  onPick: (id: string) => void;
  onBack: () => void;
  snd: Snd;
}) {
  return (
    <div className="h-full overflow-y-auto noscroll px-5 pt-5 pb-8 a-in">
      <button
        onClick={() => {
          snd.back();
          onBack();
        }}
        className="flex items-center gap-1 font-bold text-ink2 text-[14px] mb-6"
      >
        <Icon n="chevLeft" c="w-4 h-4" sw={2.5} /> Back
      </button>
      <div className="text-center mb-7">
        <h1 className="text-[30px] font-extrabold text-ink tracking-tight leading-none">Choose Your Path</h1>
        <p className="text-ink2 font-semibold mt-2">Where are you starting your journey?</p>
      </div>
      <div className="flex flex-col gap-4">
        {PATHS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              snd.next();
              onPick(p.id);
            }}
            style={{ animationDelay: `${i * 70}ms` }}
            className="a-pop flex items-center gap-4 bg-white border-[2.5px] border-ink rounded-2xl shadow-sk p-4 text-left transition-all duration-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-sk-xs"
          >
            <span
              className={`w-14 h-14 rounded-2xl bg-${p.accent} border-2 border-ink flex items-center justify-center text-white shrink-0`}
            >
              <Icon n={p.icon} sw={2.2} c="w-7 h-7" />
            </span>
            <div className="flex-1">
              <div className="font-extrabold text-ink text-[18px]">{p.title}</div>
              <div className="text-ink2 font-semibold text-[13.5px]">{p.desc}</div>
            </div>
            <span className={`font-extrabold text-${p.accent} flex items-center gap-1 text-[13px]`}>
              Select
              <Icon n="chevRight" c="w-4 h-4" sw={2.6} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ screen 3 · intro */
function Intro({ onNext, snd }: { onNext: () => void; snd: Snd }) {
  return (
    <div className="h-full px-5 a-in flex flex-col items-center justify-center text-center">
      <Mascot size={110} mood="think" />
      <div className="relative mt-7 bg-white border-[2.5px] border-ink rounded-2xl shadow-sk px-6 py-5 max-w-[330px]">
        <span className="absolute left-1/2 -top-[10px] -translate-x-1/2 w-4 h-4 bg-white border-l-[2.5px] border-t-[2.5px] border-ink rotate-45" />
        <div className="font-extrabold text-ink text-[20px]">Let's build your path.</div>
        <p className="text-ink2 font-semibold text-[14.5px] mt-1.5 leading-snug">
          A quick academic & personality check helps me match you with the right careers and majors.
          Takes about 2 minutes.
        </p>
        <p className="text-ink3 font-medium text-[11px] mt-3 leading-snug">
          Built on frameworks from Harvard, NYU, the Big&nbsp;Five model & the U.S. Dept. of Labor's
          O*NET database.
        </p>
      </div>
      <div className="mt-8 w-full max-w-[330px]">
        <Btn full color="jade" snd={snd} onClick={onNext}>
          Let's Go →
        </Btn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ screen 4 · assessment (BUILD) */
type Q = {
  key: keyof Answers;
  stage: number;
  mood: Mood;
  type: "text" | "single" | "multi" | "big";
  prompt: ReactNode;
  opts?: unknown[];
  max?: number;
  cols?: number;
  hint?: string;
  ph?: string;
};

function Assessment({
  onFinish,
  onExit,
  snd,
}: {
  onFinish: (a: Answers) => void;
  onExit: () => void;
  snd: Snd;
}) {
  const [qi, setQi] = useState(0);
  const [a, setA] = useState<Answers>(EMPTY);
  const [xp, setXp] = useState(0);
  const [xpKey, setXpKey] = useState(0);
  const [err, setErr] = useState(false);
  const [toast, setToast] = useState<{ t: string; k: number } | null>(null);
  const advTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const set = (k: keyof Answers, v: unknown) => setA((p) => ({ ...p, [k]: v }));
  const [inter, setInter] = useState<number | null>(null);
  const aRef = useRef(a);
  aRef.current = a;

  // resume a previous session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.a) {
          setA(o.a);
          setQi(Math.min(o.qi || 0, 12));
          setXp(o.xp || 0);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ a, qi, xp }));
    } catch {
      /* ignore */
    }
  }, [a, qi, xp]);

  const nm = a.name.trim();
  const Qs: Q[] = [
    { key: "name", stage: 0, mood: "happy", type: "text", ph: "Type your first name…", prompt: <>First things first — what should I call you?</> },
    { key: "grade", stage: 0, mood: "happy", type: "single", opts: GRADES, prompt: <>Nice to meet you{nm ? ", " + nm : ""}! What grade are you in?</> },
    { key: "subjects", stage: 0, mood: "happy", type: "multi", opts: SUBJECTS, max: 3, cols: 2, prompt: <>Which subjects actually light you up?</> },
    { key: "strengths", stage: 1, mood: "happy", type: "multi", opts: STRENGTHS, max: 3, prompt: <>What comes naturally to you?</> },
    { key: "days", stage: 1, mood: "think", type: "multi", opts: DAYS, max: 3, prompt: <>How do you most want to spend your days?</> },
    { key: "energy", stage: 1, mood: "happy", type: "single", opts: ENERGY, prompt: <>What’s your ideal pace?</> },
    { key: "team", stage: 1, mood: "happy", type: "single", opts: TEAM, prompt: <>Who do you do your best work with?</> },
    { key: "interaction", stage: 1, mood: "think", type: "single", opts: INTERACT, prompt: <>How much talking feels right for you?</> },
    { key: "values", stage: 2, mood: "happy", type: "multi", opts: VALUES, max: 3, prompt: <>What matters most for your future?</> },
    { key: "gpa", stage: 2, mood: "think", type: "single", opts: GPAS, hint: "Most people pick 3.0 – 3.5", prompt: <>How are your grades looking? No wrong answers.</> },
    { key: "years", stage: 2, mood: "think", type: "big", opts: YEARS, hint: "Most choose 4 years", prompt: <>How long do you want to study after high school?</> },
    { key: "finance", stage: 2, mood: "think", type: "big", opts: FINANCE, hint: "Most say “Somewhat important”", prompt: <>How much does cost matter to you?</> },
    { key: "location", stage: 2, mood: "celebrate", type: "single", opts: LOCATIONS, hint: "Most pick “Anywhere in the US”", prompt: <>Last one ✨ How far are you willing to go?</> },
  ];

  const total = Qs.length;
  const cur = Qs[qi];
  const last = qi === total - 1;
  const curStage = cur.stage;
  const level = curStage + 1;
  const validAns = (q: Q, ans: Answers): boolean => {
    const v = ans[q.key];
    return q.type === "text"
      ? String(v).trim().length > 0
      : Array.isArray(v)
        ? v.length > 0
        : !!v;
  };
  const ok = validAns(cur, a);

  const stageQs = Qs.map((q, idx) => ({ q, idx })).filter((x) => x.q.stage === curStage);
  const idxInStage = stageQs.findIndex((x) => x.idx === qi);
  const stagePct = ((idxInStage + (ok ? 1 : 0)) / stageQs.length) * 100;
  const matches = Math.min(150, Math.round(8 + xp * 1.25));

  const award = () => {
    setXp((x) => x + 5);
    setXpKey((k) => k + 1);
    buzz(10);
    setErr(false);
  };

  const goNext = (auto = false) => {
    if (advTimer.current) clearTimeout(advTimer.current);
    if (!validAns(cur, aRef.current)) {
      if (!auto) {
        setErr(true);
        snd.back();
        buzz([8, 40]);
      }
      return;
    }
    if (last) {
      snd.success();
      buzz([12, 28, 12, 28]);
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {
        /* ignore */
      }
      onFinish(aRef.current);
      return;
    }
    const nextStage = Qs[qi + 1].stage;
    if (nextStage !== curStage) {
      snd.success();
      buzz([10, 30, 10]);
      setInter(nextStage);
      return;
    }
    snd.next();
    if (!auto) buzz(8);
    setToast({ t: AFFIRM[Math.floor(Math.random() * AFFIRM.length)], k: Date.now() });
    setQi((i) => i + 1);
  };

  const leaveInter = () => {
    setInter(null);
    setQi((i) => i + 1);
    snd.next();
    buzz(8);
  };
  const goBack = () => {
    if (advTimer.current) clearTimeout(advTimer.current);
    setErr(false);
    if (qi === 0) {
      snd.back();
      onExit();
    } else {
      snd.back();
      buzz(8);
      setQi((i) => i - 1);
    }
  };

  const pickSingle = (key: keyof Answers, label: string) => {
    snd.select();
    award();
    set(key, label);
    if (advTimer.current) clearTimeout(advTimer.current);
    advTimer.current = setTimeout(() => goNext(true), 540);
  };
  const pickBig = (key: keyof Answers, t: string) => {
    snd.select();
    award();
    set(key, t);
    if (advTimer.current) clearTimeout(advTimer.current);
    advTimer.current = setTimeout(() => goNext(true), 540);
  };
  const pickMulti = (key: keyof Answers, label: string, max: number) => {
    const arr = a[key] as string[];
    if (arr.includes(label)) {
      snd.deselect();
      set(
        key,
        arr.filter((x) => x !== label),
      );
      return;
    }
    if (arr.length >= max) return;
    snd.select();
    award();
    const nx = [...arr, label];
    set(key, nx);
    if (nx.length >= max) {
      if (advTimer.current) clearTimeout(advTimer.current);
      advTimer.current = setTimeout(() => goNext(true), 620);
    }
  };

  const renderBody = () => {
    if (cur.type === "text") {
      return (
        <input
          autoFocus
          value={a[cur.key] as string}
          onChange={(e) => {
            setErr(false);
            set(cur.key, e.target.value);
          }}
          placeholder={cur.ph}
          onKeyDown={(e) => {
            if (e.key === "Enter") goNext();
          }}
          className="w-full px-5 py-4 rounded-2xl border-[2.5px] border-ink bg-white shadow-d font-extrabold text-[18px] text-ink placeholder:text-ink3 placeholder:font-bold outline-none focus:border-jade"
        />
      );
    }
    if (cur.type === "single") {
      return (
        <div className="flex flex-col gap-3">
          {(cur.opts as (string | [string, string])[]).map((o) => {
            const [l, ic] = Array.isArray(o) ? o : [o, undefined];
            return (
              <Opt
                key={l}
                label={l}
                icon={ic}
                selected={a[cur.key] === l}
                onClick={() => pickSingle(cur.key, l)}
              />
            );
          })}
        </div>
      );
    }
    if (cur.type === "big") {
      return (
        <div className="flex flex-col gap-3">
          {(cur.opts as { t: string; d: string; icon: string }[]).map((o) => (
            <Opt
              key={o.t}
              label={o.t}
              desc={o.d}
              icon={o.icon}
              selected={a[cur.key] === o.t}
              onClick={() => pickBig(cur.key, o.t)}
            />
          ))}
        </div>
      );
    }
    const arr = a[cur.key] as string[];
    const max = cur.max || 3;
    return (
      <>
        <div className="text-ink2 font-bold text-[13px] mb-3">
          Pick up to {max} · <span className="text-jadeDeep">{arr.length} selected</span>
        </div>
        <div className={cur.cols === 2 ? "grid grid-cols-2 gap-2.5" : "flex flex-col gap-3"}>
          {(cur.opts as (string | [string, string])[]).map((o) => {
            const [l, ic] = Array.isArray(o) ? o : [o, undefined];
            const sel = arr.includes(l);
            return (
              <Opt
                key={l}
                label={l}
                icon={ic}
                multi
                selected={sel}
                disabled={!sel && arr.length >= max}
                onClick={() => pickMulti(cur.key, l, max)}
              />
            );
          })}
        </div>
      </>
    );
  };

  if (inter !== null) {
    return (
      <div className="h-full px-6 flex flex-col items-center justify-center text-center a-in">
        <div key={inter} className="a-pop">
          <Mascot size={104} mood="celebrate" level={inter + 1} />
        </div>
        <div className="mt-7 font-mono text-[12px] tracking-[0.16em] text-jadeDeep font-extrabold">
          STAGE {inter + 1} OF 3
        </div>
        <h2 className="text-[28px] font-extrabold text-ink mt-1.5 tracking-tight">{STAGES[inter]}</h2>
        <p className="text-ink2 font-semibold mt-2.5 max-w-[300px] leading-snug">{INTER_COPY[inter]}</p>
        <div className="mt-8 w-full max-w-[320px]">
          <Continue label="LET'S GO" dim={false} onClick={leaveInter} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* header: back · staged progress · XP */}
      <div className="px-5 pt-5 pb-3 bg-cream">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            aria-label="Go back"
            className="w-10 h-10 rounded-full border-[2.5px] border-ink bg-white shadow-d-sm active:translate-y-[3px] active:shadow-none transition-all duration-75 flex items-center justify-center text-ink shrink-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-jade/50"
          >
            <Icon n="chevLeft" c="w-5 h-5" sw={2.6} />
          </button>
          <div className="flex-1 flex gap-1.5">
            {STAGES.map((_, s) => (
              <div key={s} className="flex-1 h-3.5 rounded-full bg-white border-[2.5px] border-ink overflow-hidden">
                <div
                  className="h-full bg-yellow transition-all duration-500 rounded-r-full"
                  style={{ width: (s < curStage ? 100 : s === curStage ? stagePct : 0) + "%" }}
                />
              </div>
            ))}
          </div>
          <div className="relative shrink-0">
            <span
              key={xpKey}
              className="a-pulse inline-flex items-center gap-1 bg-yellow text-yellowInk border-2 border-ink rounded-full pl-1.5 pr-2.5 py-1 text-[12px] font-extrabold"
            >
              <Icon n="spark" c="w-3.5 h-3.5" sw={2.4} />
              {xp}
            </span>
            {xpKey > 0 && (
              <span
                key={"f" + xpKey}
                className="a-float pointer-events-none absolute -top-3 right-1 text-yellowInk font-extrabold text-[12px]"
              >
                +5
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <span className="font-extrabold text-jadeDeep text-[12px]">
            Step {curStage + 1} of 3 · {STAGES[curStage]}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] font-bold text-ink2">
            <Icon n="spark" c="w-3.5 h-3.5" sw={2.2} />
            <span className="text-jadeDeep font-extrabold">{matches}</span> matches forming
          </span>
        </div>
      </div>

      {/* question */}
      <div key={qi} className="a-in relative flex-1 overflow-y-auto noscroll px-5 pt-2 pb-4">
        {toast && (
          <div
            key={toast.k}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 z-30 bg-ink text-white font-extrabold text-[13px] px-4 py-2 rounded-full a-float"
          >
            {toast.t}
          </div>
        )}
        <Ask mood={cur.mood} level={level}>
          {cur.prompt}
        </Ask>
        <div className={err ? "a-shake" : ""}>{renderBody()}</div>
        {err && (
          <div className="mt-3 text-center text-terra font-extrabold text-[13px]">
            Pick at least one to keep going ✋
          </div>
        )}
      </div>

      {/* in-flow footer button */}
      <div className="px-5 py-4 bg-cream border-t-2 border-ink/5">
        <Continue label={last ? "FINISH" : "CONTINUE"} dim={!ok} onClick={() => goNext(false)} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ screen 5 · congrats */
function Congrats({
  name,
  onContinue,
  snd,
}: {
  name: string;
  onContinue: (pathPref: string) => void | Promise<void>;
  snd: Snd;
}) {
  const [pick, setPick] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    snd.success();
  }, [snd]);
  return (
    <div className="h-full px-5 relative flex flex-col items-center justify-center text-center">
      <Confetti />
      <div className="relative z-10 w-full max-w-[340px] a-pop">
        <div className="relative inline-flex">
          <Mascot size={96} mood="celebrate" />
          <span className="absolute -right-2 -bottom-1 w-9 h-9 rounded-full bg-green border-2 border-ink flex items-center justify-center text-white">
            <Icon n="check" sw={3.2} />
          </span>
        </div>
        <h1 className="text-[28px] font-extrabold text-jadeDeep mt-4">
          Congratulations{name ? `, ${name}` : ""}!
        </h1>
        <p className="text-ink2 font-semibold mt-1 mb-5">Your profile is ready. Let's find your path.</p>
        <div className="grid grid-cols-2 gap-3">
          {FINISH.map((f, i) => (
            <button
              key={f.id}
              onClick={() => {
                snd.select();
                setPick(f.id);
              }}
              style={{ gridColumn: i === 2 ? "1 / span 2" : "auto" }}
              className={`flex flex-col items-center gap-1 py-4 rounded-2xl border-[2.5px] border-ink transition-all duration-100 active:translate-y-[2px] ${
                pick === f.id ? "bg-mint shadow-sk-xs translate-y-[1px]" : "bg-white shadow-sk-sm"
              }`}
            >
              <span
                className={`w-10 h-10 rounded-xl border-2 border-ink flex items-center justify-center ${
                  pick === f.id ? "bg-jade text-white" : "bg-mint text-jadeDeep"
                }`}
              >
                <Icon n={f.icon} sw={2.2} />
              </span>
              <span className="font-extrabold text-ink text-[15px]">{f.t}</span>
              <span className="text-ink2 text-[12px] font-medium">{f.d}</span>
            </button>
          ))}
        </div>
        <div className="mt-5">
          <Btn
            full
            color="jade"
            disabled={!pick || saving}
            snd={snd}
            onClick={() => {
              setSaving(true);
              void Promise.resolve(onContinue(pick));
            }}
          >
            {saving ? "Saving…" : "See Matches →"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ phone shell */
function PhoneShell({ children, frameKey }: { children: ReactNode; frameKey?: Key }) {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[oklch(0.93_0.022_145)] sm:py-6">
      {/* back-to-site — desktop chrome only */}
      <Link
        to="/"
        className="hidden sm:flex items-center gap-1.5 fixed top-5 left-5 z-50 font-bold text-ink2 text-[13px] bg-white border-[2.5px] border-ink rounded-full pl-2 pr-3.5 py-1.5 shadow-sk-sm hover:-translate-y-0.5 hover:shadow-sk transition-all"
      >
        <Icon n="chevLeft" c="w-4 h-4" sw={2.6} /> Dreamari
      </Link>
      <div
        key={frameKey}
        className="relative w-full sm:max-w-[430px] h-[100dvh] sm:h-[min(880px,92vh)] bg-cream sm:rounded-[44px] sm:border-[3px] sm:border-ink sm:shadow-sk-lg overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ orchestrator */
type ScreenName = "splash" | "welcome" | "path" | "intro" | "assess" | "congrats" | "save";

export default function Onboarding() {
  const snd = useSound();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const invited = params.get("invited") === "1";
  // invited students already have an account + chose to join → skip the splash slides
  const [screen, setScreen] = useState<ScreenName>(invited ? "intro" : "splash");
  const [name, setName] = useState("");
  const startPath = useRef<string>("");
  const answers = useRef<Answers | null>(null);

  // Invited students arrive with their name + grade known. Pre-seed the assessment's
  // resume slot so those questions are filled and skipped (but never clobber an
  // already-in-progress session).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PREFILL_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PREFILL_KEY);
      const { name: pName, grade } = JSON.parse(raw) as { name?: string; grade?: string };
      if (pName) setName(pName);
      if (!localStorage.getItem(SAVE_KEY) && (pName || grade)) {
        const a = { ...EMPTY, name: pName ?? "", grade: grade ?? "" };
        const qi = a.name ? (a.grade ? 2 : 1) : 0; // skip the leading questions we already know
        localStorage.setItem(SAVE_KEY, JSON.stringify({ a, qi, xp: qi * 5 }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const finish = async (pathPref: string) => {
    const a = answers.current;
    const who = (name || a?.name || "Friend").trim() || "Friend";
    let guest = false;
    try {
      const current = await authClient.getSession();
      if (!current.data) await authClient.signIn.anonymous();
      await authClient.updateUser({ name: who });
      if (a) {
        await api.putBuild({
          audience: startPath.current || undefined,
          grade: a.grade,
          gpa: a.gpa,
          subjects: a.subjects,
          strengths: a.strengths,
          days: a.days,
          values: a.values,
          energy: a.energy,
          team: a.team,
          interaction: a.interaction,
          years: a.years,
          finance: a.finance,
          location: a.location,
          pathPref,
        });
      }
      const after = await authClient.getSession();
      guest = Boolean((after.data?.user as { isAnonymous?: boolean } | undefined)?.isAnonymous);
    } catch {
      navigate("/app/home"); // best effort — still enter the app
      return;
    }
    // Guests get the chance to save (email + password); real accounts go straight in.
    if (guest) setScreen("save");
    else navigate("/app/home");
  };

  return (
    <PhoneShell frameKey={screen}>
      {screen === "splash" && <Splash snd={snd} onDone={() => setScreen("welcome")} />}
      {screen === "welcome" && <Welcome snd={snd} onNext={() => setScreen("path")} />}
      {screen === "path" && (
        <ChoosePath
          snd={snd}
          onBack={() => setScreen("welcome")}
          onPick={(id) => {
            startPath.current = id;
            setScreen("intro");
          }}
        />
      )}
      {screen === "intro" && <Intro snd={snd} onNext={() => setScreen("assess")} />}
      {screen === "assess" && (
        <Assessment
          snd={snd}
          onExit={() => setScreen("intro")}
          onFinish={(a) => {
            answers.current = a;
            setName(a.name);
            setScreen("congrats");
          }}
        />
      )}
      {screen === "congrats" && <Congrats snd={snd} name={name} onContinue={finish} />}
      {screen === "save" && (
        <div className="h-full flex flex-col items-center justify-center px-6 a-in">
          <div className="w-full max-w-[340px]">
            <SaveAccount
              onDone={() => navigate("/app/home")}
              onSkip={() => navigate("/app/home")}
              heading="Save your progress"
              sub="Create a free account so your matches are here when you come back."
              cta="Save my progress"
            />
          </div>
        </div>
      )}
    </PhoneShell>
  );
}
