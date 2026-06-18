import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ shared bits */

/** The Dreamy face mark — two eyes + smile in a sticker badge. */
function DreamyMark({ size = 34, radius = 11, bg = "bg-jade" }: { size?: number; radius?: number; bg?: string }) {
  const eye = (
    <span className="bg-white rounded-full flex items-center justify-center" style={{ width: size * 0.2, height: size * 0.2 }}>
      <span className="rounded-full bg-ink" style={{ width: size * 0.09, height: size * 0.09 }} />
    </span>
  );
  return (
    <span
      className={`${bg} border-[2.5px] border-ink shadow-sk-xs flex items-center justify-center relative`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <span className="flex" style={{ gap: size * 0.14 }}>
        {eye}
        {eye}
      </span>
    </span>
  );
}

function Phone({ children, w = 268, h = 548 }: { children: ReactNode; w?: number; h?: number }) {
  return (
    <div
      className="bg-[oklch(0.18_0.045_162)] rounded-[42px] p-1.5"
      style={{ width: w, height: h, boxShadow: "0 26px 50px rgba(20,45,32,0.22)" }}
    >
      <div className="relative w-full h-full bg-cream rounded-[36px] overflow-hidden flex flex-col">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[74px] h-[21px] bg-black rounded-full z-50" />
        <div className="h-[42px] flex items-center justify-between px-6 text-[12px] font-extrabold text-ink">
          <span>9:41</span>
          <span className="w-4 h-2.5 border-2 border-ink rounded-[3px] relative">
            <span className="absolute inset-[1.5px] bg-ink rounded-[1px]" />
          </span>
        </div>
        {children}
        <div className="absolute bottom-[7px] left-1/2 -translate-x-1/2 w-[108px] h-1 rounded-full bg-ink/85" />
      </div>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="text-[13px] font-bold px-3.5 py-1.5 rounded-full bg-white border-2 border-ink text-ink">
      {children}
    </span>
  );
}

const HASH = (id: string) => () => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

/* ------------------------------------------------------------------ nav */
function Nav() {
  return (
    <header className="sticky top-0 z-[100] bg-[oklch(0.975_0.03_122_/_0.92)] border-b-[2.5px] border-ink backdrop-blur">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-[74px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DreamyMark />
          <span className="text-[21px] font-extrabold tracking-tight text-ink">
            Dreamari<span className="text-jade">.</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-ink2">
          <a href="#how" className="hover:text-jade transition-colors">How it works</a>
          <a href="#features" className="hover:text-jade transition-colors">Features</a>
          <a href="#parents" className="hover:text-jade transition-colors">For parents</a>
          <a href="#faq" className="hover:text-jade transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:inline text-[15px] font-extrabold text-ink">
            Log in
          </Link>
          <Link
            to="/onboarding"
            className="inline-flex items-center h-11 px-5 rounded-[13px] bg-jade text-white border-[2.5px] border-ink shadow-sk-sm text-[15px] font-extrabold hover:-translate-x-px hover:-translate-y-px hover:shadow-sk transition-all"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ hero */
function HeroPhone() {
  const match = (name: string, tag: string, pct: string, hue: number) => (
    <div className="flex items-center gap-2.5 bg-white border-[2.5px] border-ink rounded-2xl p-2 shadow-sk-sm">
      <div
        className="w-[38px] h-[38px] rounded-[10px] shrink-0 border-2 border-ink"
        style={{
          background: `repeating-linear-gradient(135deg, oklch(0.88 0.08 ${hue}), oklch(0.88 0.08 ${hue}) 6px, oklch(0.80 0.10 ${hue}) 6px, oklch(0.80 0.10 ${hue}) 12px)`,
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-extrabold text-ink">{name}</div>
        <div className="text-[11px] font-semibold text-ink3">{tag}</div>
      </div>
      <span className="text-[11px] font-extrabold text-white bg-green border-2 border-ink px-1.5 rounded-full">{pct}</span>
    </div>
  );
  return (
    <Phone w={308} h={632}>
      <div className="flex-1 px-[18px] pt-1 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-[23px] font-extrabold tracking-tight text-ink">Hi, Maya</div>
            <div className="text-[14px] font-semibold text-ink2">Let's keep going.</div>
          </div>
          <DreamyMark size={46} radius={999} />
        </div>
        <div className="rounded-[20px] p-[18px] bg-jade border-[2.5px] border-ink shadow-sk text-white mb-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-wide opacity-90">Dream Score</div>
          <div className="flex items-end gap-2.5 mt-1">
            <span className="text-[46px] font-extrabold leading-none tracking-tight">720</span>
            <span className="text-[11px] font-extrabold bg-yellow text-yellowInk border-2 border-ink px-2 py-0.5 rounded-full mb-1.5">
              +40
            </span>
          </div>
          <div className="h-[11px] rounded-full bg-white/30 border-2 border-ink mt-3 overflow-hidden">
            <div className="h-full w-[72%] bg-yellow" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-white border-[2.5px] border-ink rounded-2xl p-3 mb-4 shadow-sk">
          <div className="w-[38px] h-[38px] rounded-[11px] bg-mint border-2 border-ink flex items-center justify-center text-jadeDeep shrink-0 font-extrabold">
            ▸
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-extrabold text-ink">Finish: Strengths quiz</div>
            <div className="text-[12px] font-semibold text-ink3">2 min left</div>
          </div>
          <div className="w-[30px] h-[30px] rounded-full bg-jade border-2 border-ink text-white flex items-center justify-center">→</div>
        </div>
        <div className="text-[14px] font-extrabold text-ink mb-2.5">For you</div>
        <div className="flex flex-col gap-2">
          {match("UX Designer", "Creative · Tech", "94%", 165)}
          {match("Marine Biologist", "Science · Outdoors", "88%", 205)}
        </div>
      </div>
      <div className="h-[54px] border-t-[2.5px] border-ink bg-white flex items-center justify-around pb-1.5">
        {["Home", "Explore", "Play", "You"].map((t, i) => (
          <div key={t} className="flex flex-col items-center gap-1">
            <div className={`w-[17px] h-[17px] rounded-md border-2 border-ink ${i === 0 ? "bg-jade" : "border-ink2"}`} />
            <span className={`text-[9px] font-extrabold ${i === 0 ? "text-ink" : "text-ink2"}`}>{t}</span>
          </div>
        ))}
      </div>
    </Phone>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[oklch(0.955_0.045_150)]">
      {/* floating sticker confetti */}
      <span className="absolute top-[88px] left-[6%] w-[18px] h-[18px] rounded-full bg-yellow border-[2.5px] border-ink drm-float" />
      <span className="absolute top-[200px] left-[3%] w-4 h-4 bg-white border-[2.5px] border-ink rounded-[3px] drm-floatB" />
      <span className="absolute bottom-[140px] left-[8%] w-3.5 h-3.5 rounded-full bg-terra border-[2.5px] border-ink drm-float" />
      <span className="absolute top-[120px] right-[5%] w-[15px] h-[15px] bg-yellow border-[2.5px] border-ink rounded-[3px] drm-floatB" />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-12 sm:py-[74px] grid gap-9 lg:grid-cols-2 items-center">
        <div>
          <div className="inline-flex items-center gap-2.5 bg-white border-[2.5px] border-ink shadow-sk-sm rounded-full px-3.5 py-2 text-[13px] font-extrabold text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-green" />
            Career discovery for ages 13–18
          </div>
          <h1 className="text-[clamp(38px,8.5vw,66px)] leading-[1.02] font-extrabold tracking-[-0.035em] mt-6 text-ink">
            Dream about who you could{" "}
            <span className="relative whitespace-nowrap">
              become
              <span className="absolute left-0 right-0 bottom-1.5 h-3 rounded-full -z-10 bg-yellow" />
            </span>
            .
          </h1>
          <p className="text-[clamp(17px,4.5vw,20px)] leading-relaxed font-medium mt-6 max-w-[30ch] text-ink2">
            Turn "I have no idea what I want to do" into a map of careers that actually fit you — built
            from quick quizzes, real day-in-the-life simulations, and a companion that grows as you do.
          </p>
          <div className="flex gap-3.5 flex-wrap mt-8">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 h-14 px-6 rounded-2xl bg-jade text-white border-[2.5px] border-ink shadow-sk-lg text-[18px] font-extrabold hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sk-xl transition-all"
            >
              Start free <span>→</span>
            </Link>
            <button
              onClick={HASH("how")}
              className="inline-flex items-center gap-2 h-14 px-6 rounded-2xl bg-white text-ink border-[2.5px] border-ink shadow-sk-lg text-[18px] font-extrabold hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sk-xl transition-all"
            >
              See how it works
            </button>
          </div>
          <div className="flex items-center gap-2 mt-5 text-[14px] font-semibold text-ink2">
            <span className="w-5 h-5 rounded-full bg-green border-2 border-ink text-white flex items-center justify-center text-[11px]">
              ✓
            </span>
            Free to start · No grades, no wrong answers
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute top-[30px] -left-1.5 z-20 flex items-center gap-2 bg-white border-[2.5px] border-ink shadow-sk rounded-[14px] px-3 py-2 drm-float">
            <div className="w-7 h-7 rounded-lg bg-yellow border-2 border-ink flex items-center justify-center text-[14px] font-extrabold text-yellowInk">
              ↑
            </div>
            <div>
              <div className="text-[14px] font-extrabold leading-none text-ink">+40</div>
              <div className="text-[10px] font-semibold text-ink3">Dream Score</div>
            </div>
          </div>
          <div className="absolute bottom-[120px] -right-1 z-20 flex items-center gap-2 bg-yellow border-[2.5px] border-ink shadow-sk rounded-[13px] px-3 py-2 drm-float">
            <span className="w-3 h-4 rounded-[0_999px_999px_999px] bg-terra rotate-45" />
            <span className="text-[15px] font-extrabold text-yellowInk">5</span>
            <span className="text-[11px] font-extrabold text-yellowInk">day streak</span>
          </div>
          <HeroPhone />
        </div>
      </div>

      {/* proof strip */}
      <div className="border-t-[2.5px] border-ink bg-white">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-5 flex items-center justify-between flex-wrap gap-4">
          <span className="font-mono text-[12px] tracking-[0.12em] uppercase text-ink3 font-medium">
            116 school partners across 8 countries
          </span>
          <div className="flex items-center gap-7 flex-wrap font-mono text-[14px] text-ink2">
            <span>JPMorgan&nbsp;Chase</span>
            <span>EY</span>
            <span>AT&amp;T</span>
            <span>&amp;&nbsp;more</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ how it works */
function StepMockQuiz() {
  return (
    <Phone>
      <div className="flex-1 flex flex-col px-5 pb-5 pt-1">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-8 h-8 rounded-full border-[2.5px] border-ink bg-white shadow-sk-xs flex items-center justify-center text-ink">‹</span>
          <div className="flex-1 h-3 rounded-full bg-white border-[2.5px] border-ink overflow-hidden">
            <div className="h-full w-[40%] bg-yellow" />
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3.5">
          <DreamyMark size={36} radius={999} />
          <span className="font-mono text-[10px] text-ink3">Question 2 of 8</span>
        </div>
        <h4 className="text-[21px] font-extrabold tracking-tight mb-4 text-ink leading-snug">Which sounds more like you?</h4>
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 border-[2.5px] border-ink bg-mint rounded-2xl p-4 flex flex-col justify-center gap-1.5 shadow-sk">
            <span className="w-[22px] h-[22px] rounded-md bg-jade border-2 border-ink text-white flex items-center justify-center font-mono text-[11px] font-bold">A</span>
            <span className="text-[16px] font-extrabold text-ink leading-snug">Sketch out a bold new idea</span>
          </div>
          <div className="flex-1 border-[2.5px] border-ink bg-white rounded-2xl p-4 flex flex-col justify-center gap-1.5 shadow-sk">
            <span className="w-[22px] h-[22px] rounded-md bg-yellow border-2 border-ink text-yellowInk flex items-center justify-center font-mono text-[11px] font-bold">B</span>
            <span className="text-[16px] font-extrabold text-ink leading-snug">Dig into how something works</span>
          </div>
        </div>
      </div>
    </Phone>
  );
}

function StepMockMatches() {
  const row = (name: string, tag: string, pct: string, hue: number) => (
    <div className="bg-white border-[2.5px] border-ink rounded-[15px] p-3 shadow-sk">
      <div className="flex items-center gap-2.5">
        <div
          className="w-10 h-10 rounded-[11px] shrink-0 border-2 border-ink"
          style={{ background: `repeating-linear-gradient(135deg, oklch(0.88 0.08 ${hue}), oklch(0.88 0.08 ${hue}) 6px, oklch(0.80 0.10 ${hue}) 6px, oklch(0.80 0.10 ${hue}) 12px)` }}
        />
        <div className="flex-1">
          <div className="text-[14.5px] font-extrabold text-ink">{name}</div>
          <div className="text-[11px] font-semibold text-ink3">{tag}</div>
        </div>
        <span className="text-[12px] font-extrabold text-white bg-green border-2 border-ink px-2 py-0.5 rounded-full">{pct}</span>
      </div>
    </div>
  );
  return (
    <Phone>
      <div className="flex-1 flex flex-col px-[18px] pb-4 pt-1.5 overflow-hidden">
        <div className="flex flex-col items-center text-center gap-2 mb-3.5">
          <DreamyMark size={62} radius={999} />
          <h4 className="text-[20px] font-extrabold tracking-tight text-ink">Your top matches</h4>
        </div>
        <div className="flex flex-col gap-2.5">
          {row("UX Designer", "Creative · Tech", "94%", 165)}
          {row("Physical Therapist", "Health · People", "88%", 150)}
          {row("Marine Biologist", "Science · Outdoors", "81%", 205)}
        </div>
      </div>
    </Phone>
  );
}

function StepMockCareer() {
  return (
    <Phone>
      <div className="flex-1 flex flex-col px-[18px] pb-3.5 pt-1 overflow-hidden">
        <div
          className="rounded-2xl h-24 border-[2.5px] border-ink shadow-sk flex items-end p-2.5 mb-3.5"
          style={{ background: "repeating-linear-gradient(135deg, oklch(0.88 0.08 165), oklch(0.88 0.08 165) 8px, oklch(0.81 0.10 165) 8px, oklch(0.81 0.10 165) 16px)" }}
        >
          <span className="font-mono text-[10px] text-jadeDeep bg-white border-2 border-ink rounded-md px-1.5 py-0.5">career photo</span>
        </div>
        <h4 className="text-[19px] font-extrabold tracking-tight mb-1 text-ink">UX Designer</h4>
        <p className="text-[12.5px] leading-snug font-medium mb-3 text-ink2">
          Sketch ideas, talk to the people who'll use a product, and shape rough flows into screens.
        </p>
        <div className="flex gap-2 mb-3.5">
          {[
            ["$85k", "Median pay", "text-ink"],
            ["+13%", "Outlook", "text-green"],
            ["4 yr", "Training", "text-ink"],
          ].map(([v, l, c]) => (
            <div key={l} className="flex-1 bg-white border-[2.5px] border-ink rounded-xl p-2 shadow-sk-sm">
              <div className={`text-[16px] font-extrabold ${c}`}>{v}</div>
              <div className="text-[9.5px] font-semibold text-ink3">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-auto flex gap-2 items-center">
          <div className="w-[46px] h-[46px] shrink-0 rounded-[13px] border-[2.5px] border-ink bg-white text-terra flex items-center justify-center text-[19px] shadow-sk-sm">♥</div>
          <div className="flex-1 h-[46px] rounded-[13px] bg-jade border-[2.5px] border-ink shadow-sk flex items-center justify-center text-white text-[14px] font-extrabold">
            Start the simulation →
          </div>
        </div>
      </div>
    </Phone>
  );
}

function Step({
  n,
  badgeBg,
  badgeText,
  title,
  body,
  pills,
  mock,
  reverse,
}: {
  n: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  body: string;
  pills: string[];
  mock: ReactNode;
  reverse?: boolean;
}) {
  const copy = (
    <div>
      <div className={`inline-flex items-center justify-center w-[54px] h-[54px] rounded-[15px] ${badgeBg} ${badgeText} border-[2.5px] border-ink shadow-sk text-[24px] font-extrabold`}>
        {n}
      </div>
      <h3 className="text-[clamp(25px,5vw,31px)] leading-tight font-extrabold tracking-tight mt-5 text-ink">{title}</h3>
      <p className="text-[18px] leading-relaxed font-medium mt-3.5 max-w-[42ch] text-ink2">{body}</p>
      <div className="flex gap-2.5 flex-wrap mt-5">
        {pills.map((p) => (
          <Pill key={p}>{p}</Pill>
        ))}
      </div>
    </div>
  );
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-5 grid gap-9 lg:grid-cols-2 items-center">
      {reverse ? (
        <>
          <div className="flex justify-center order-1">{mock}</div>
          <div className="order-2">{copy}</div>
        </>
      ) : (
        <>
          {copy}
          <div className="flex justify-center">{mock}</div>
        </>
      )}
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="bg-[oklch(0.975_0.03_122)]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-10 text-center">
        <p className="font-mono text-[13px] tracking-[0.16em] uppercase text-jadeDeep font-medium mb-3.5">How it works</p>
        <h2 className="text-[clamp(30px,6vw,46px)] leading-tight font-extrabold tracking-tight mx-auto max-w-[18ch] text-ink">
          Three steps from "no clue" to a real shortlist.
        </h2>
        <p className="text-[19px] leading-relaxed font-medium mt-4 mx-auto max-w-[54ch] text-ink2">
          No grades, no wrong answers. Just a few minutes that point your curiosity somewhere real.
        </p>
      </div>
      <Step
        n="1"
        badgeBg="bg-yellow"
        badgeText="text-yellowInk"
        title="Answer a few quick questions"
        body="Tap through playful either-or questions about how you think, what you enjoy, and what a good day feels like. Three minutes, tops — and you can stop any time."
        pills={["No prep needed", "3 minutes"]}
        mock={<StepMockQuiz />}
      />
      <Step
        n="2"
        badgeBg="bg-green"
        badgeText="text-white"
        title="Meet careers that actually fit"
        body="Get a ranked shortlist with a match score — and, more importantly, the why. Every match explains which of your strengths and interests it's built on, so it never feels like a black box."
        pills={["Explainable matches", "1,200+ careers"]}
        mock={<StepMockMatches />}
        reverse
      />
      <Step
        n="3"
        badgeBg="bg-terra"
        badgeText="text-white"
        title="Try the job on for size"
        body="Step into a day-in-the-life simulation, see real pay and training paths, and save the careers worth a second look. Your companion and Dream Score keep the momentum going."
        pills={["Day-in-the-life", "Real pay & paths"]}
        mock={<StepMockCareer />}
      />
      <div className="h-16" />
    </section>
  );
}

/* ------------------------------------------------------------------ features */
const FEATURES = [
  { bg: "bg-jade", title: "Day-in-the-life sims", body: "Don't just read about a job — make the calls a real one makes for a day, then see if it clicked." },
  { bg: "bg-yellow", title: "Matches that explain themselves", body: "Every result shows the strengths and interests it's built on. No mystery algorithm, no labels you can't argue with." },
  { bg: "bg-green", title: "Dream Score & streaks", body: "Progress you can feel. Every bit of exploring nudges your score and keeps your streak alive — gently, never naggy." },
  { bg: "bg-jade", title: "A companion that grows", body: "Your character starts undefined and becomes more itself as you explore — a small reflection of you, figuring it out too." },
  { bg: "bg-terra", title: "Save & compare paths", body: "Keep a shortlist of the careers worth a second look, side by side — pay, training, and what the day actually feels like." },
  { bg: "bg-yellow", title: "Safe & private by design", body: "No grades, no public profiles, no data sold. A calm place to be curious about your future — on your terms." },
];

function Features() {
  return (
    <section id="features" className="bg-[oklch(0.91_0.06_160)] border-y-[2.5px] border-ink">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="max-w-[30ch]">
          <p className="font-mono text-[13px] tracking-[0.16em] uppercase text-jadeDeep font-medium mb-3.5">What's inside</p>
          <h2 className="text-[clamp(30px,6vw,46px)] leading-tight font-extrabold tracking-tight text-ink">
            More than a personality quiz.
          </h2>
        </div>
        <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3 mt-11" style={{ gap: 18 }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white border-[2.5px] border-ink shadow-sk-lg rounded-[20px] p-6 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sk-xl transition-all"
            >
              <div className={`w-12 h-12 rounded-[13px] ${f.bg} border-[2.5px] border-ink flex items-center justify-center mb-4`}>
                <span className="w-[18px] h-[18px] rounded-md bg-white/90" />
              </div>
              <h3 className="text-[20px] font-extrabold tracking-tight mb-2 text-ink">{f.title}</h3>
              <p className="text-[15px] leading-relaxed text-ink2">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ companion story */
function Companion() {
  const blobs = [
    { size: 52, bg: "oklch(0.86 0.04 160)", label: "Resting", eyes: false },
    { size: 58, bg: "oklch(0.80 0.07 160)", label: "Waking", eyes: true },
    { size: 66, bg: "oklch(0.68 0.11 163)", label: "Tinted", eyes: true },
    { size: 74, bg: "oklch(0.57 0.13 165)", label: "Defined", eyes: true },
    { size: 84, bg: "#fff", label: "Companion", eyes: true },
  ];
  return (
    <section className="bg-[oklch(0.975_0.03_122)]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-16 sm:py-24 grid gap-9 lg:grid-cols-2 items-center">
        <div>
          <p className="font-mono text-[13px] tracking-[0.16em] uppercase text-jadeDeep font-medium mb-3.5">Your companion</p>
          <h2 className="text-[clamp(29px,6vw,44px)] leading-tight font-extrabold tracking-tight text-ink">
            It starts as a blur. So does everyone.
          </h2>
          <p className="text-[18px] leading-relaxed font-medium mt-5 max-w-[46ch] text-ink2">
            Meet your companion — a soft little character that begins undefined and grows sharper,
            brighter, and more itself with every step you take. It's not a score to chase. It's a
            reminder that becoming someone is a process, and you're already in it.
          </p>
          <div className="flex gap-3.5 flex-wrap mt-7">
            <div className="flex items-center gap-3 bg-white border-[2.5px] border-ink shadow-sk rounded-[14px] px-4 py-3">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-yellow border-2 border-ink flex items-center justify-center text-[15px] font-extrabold text-yellowInk">↑</div>
              <div>
                <div className="text-[15px] font-extrabold text-ink">Dream Score</div>
                <div className="text-[12px] font-semibold text-ink3">grows as you explore</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border-[2.5px] border-ink shadow-sk rounded-[14px] px-4 py-3">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-terra border-2 border-ink flex items-center justify-center">
                <span className="w-2.5 h-3.5 rounded-[0_999px_999px_999px] bg-white rotate-45" />
              </div>
              <div>
                <div className="text-[15px] font-extrabold text-ink">Streaks</div>
                <div className="text-[12px] font-semibold text-ink3">small steps, kept up</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[oklch(0.91_0.07_162)] border-[2.5px] border-ink shadow-sk-lg rounded-3xl p-8">
          <div className="font-mono text-[12px] tracking-wide uppercase text-jadeDeep font-medium mb-6">
            The companion, evolving →
          </div>
          <div className="flex items-end justify-center flex-wrap gap-x-3 gap-y-4.5" style={{ rowGap: 18 }}>
            {blobs.map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-2.5">
                <div
                  className="rounded-full border-[2.5px] border-ink shadow-sk-sm flex items-center justify-center"
                  style={{ width: b.size, height: b.size, background: b.bg }}
                >
                  {b.eyes ? (
                    <span className="flex" style={{ gap: b.size * 0.14 }}>
                      <span className="rounded-full bg-white flex items-center justify-center" style={{ width: b.size * 0.16, height: b.size * 0.16 }}>
                        <span className="rounded-full bg-ink" style={{ width: b.size * 0.06, height: b.size * 0.06 }} />
                      </span>
                      <span className="rounded-full bg-white flex items-center justify-center" style={{ width: b.size * 0.16, height: b.size * 0.16 }}>
                        <span className="rounded-full bg-ink" style={{ width: b.size * 0.06, height: b.size * 0.06 }} />
                      </span>
                    </span>
                  ) : (
                    <span className="flex gap-1.5">
                      <span className="w-2 h-0.5 rounded-full bg-ink/60" />
                      <span className="w-2 h-0.5 rounded-full bg-ink/60" />
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-extrabold text-ink2">{b.label}</span>
              </div>
            ))}
          </div>
          <div className="h-3 rounded-full bg-white border-[2.5px] border-ink overflow-hidden mt-7">
            <div className="h-full w-[78%] bg-yellow" />
          </div>
          <div className="flex justify-between mt-2 font-mono text-[11px] text-ink3">
            <span>Day one</span>
            <span>You, becoming</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ testimonials */
const QUOTES = [
  { border: "border-yellow", shadow: "6px 6px 0 oklch(0.85 0.15 92)", body: "I always froze when adults asked what I wanted to do. Dreamari made it a game instead of a quiz I could fail — and the matches actually sounded like me.", name: "Maya, 16", grade: "11th grade", hue: 165 },
  { border: "border-green", shadow: "6px 6px 0 oklch(0.55 0.14 155)", body: "The day-in-the-life thing is unreal. I tried being a physical therapist for a day and realized I actually loved the people part more than the science.", name: "Diego, 15", grade: "10th grade", hue: 150 },
  { border: "border-terra", shadow: "6px 6px 0 oklch(0.63 0.15 38)", body: "My streak is the only one I haven't broken. Watching my companion go from a grey blob to… kind of me? It's silly but it keeps me coming back.", name: "Priya, 17", grade: "12th grade", hue: 205 },
];

function Testimonials() {
  return (
    <section className="bg-[oklch(0.18_0.045_162)] border-t-[2.5px] border-ink">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="font-mono text-[13px] tracking-[0.16em] uppercase text-[oklch(0.78_0.12_150)] font-medium mb-3.5">Loved by students</p>
          <h2 className="text-[clamp(29px,6vw,44px)] leading-tight font-extrabold tracking-tight text-[oklch(0.98_0.02_140)]">
            "I finally have a starting point."
          </h2>
        </div>
        <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 18 }}>
          {QUOTES.map((q) => (
            <div key={q.name} className={`bg-cream border-[2.5px] ${q.border} rounded-[20px] p-6`} style={{ boxShadow: q.shadow }}>
              <div className="text-[30px] leading-none text-jade font-extrabold">"</div>
              <p className="text-[16.5px] leading-relaxed font-semibold mt-1.5 mb-5 text-ink">{q.body}</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-[42px] h-[42px] rounded-full border-[2.5px] border-ink"
                  style={{ background: `repeating-linear-gradient(135deg, oklch(0.88 0.08 ${q.hue}), oklch(0.88 0.08 ${q.hue}) 5px, oklch(0.80 0.10 ${q.hue}) 5px, oklch(0.80 0.10 ${q.hue}) 10px)` }}
                />
                <div>
                  <div className="text-[14px] font-extrabold text-ink">{q.name}</div>
                  <div className="text-[12px] font-semibold text-ink3">{q.grade}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center font-mono text-[11px] text-[oklch(0.70_0.06_150)] mt-7">
          Illustrative — replace with real student quotes before launch.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ parents */
function Parents() {
  const items = [
    { bg: "bg-green", title: "No grades, no ranking", body: "Exploration, not assessment. Nothing here can be passed or failed." },
    { bg: "bg-jade", title: "Private & safe by default", body: "No public profiles, no data sold. Student-first privacy, always." },
    { bg: "bg-yellow", title: "A light counselor dashboard", body: "See engagement at a glance — meet students where their curiosity already is." },
  ];
  return (
    <section id="parents" className="bg-[oklch(0.955_0.045_150)] border-y-[2.5px] border-ink">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-16 sm:py-24 grid gap-9 lg:grid-cols-2 items-center">
        <div>
          <p className="font-mono text-[13px] tracking-[0.16em] uppercase text-jadeDeep font-medium mb-3.5">For parents & schools</p>
          <h2 className="text-[clamp(28px,6vw,42px)] leading-tight font-extrabold tracking-tight text-ink">
            Built to be trusted by the grown-ups, too.
          </h2>
          <p className="text-[18px] leading-relaxed font-medium mt-5 max-w-[46ch] text-ink2">
            Dreamari is a calm, private space for teens to explore — not another thing to be graded on.
            Counselors get a light dashboard; parents get peace of mind.
          </p>
          <a
            href="#faq"
            className="inline-flex items-center gap-2 mt-7 h-13 px-6 py-3.5 rounded-[15px] bg-white text-ink border-[2.5px] border-ink shadow-sk text-[16px] font-extrabold hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sk-lg transition-all"
          >
            Dreamari for educators →
          </a>
        </div>
        <div className="flex flex-col gap-3.5">
          {items.map((it) => (
            <div key={it.title} className="flex gap-3.5 items-start bg-white border-[2.5px] border-ink shadow-sk rounded-2xl px-5 py-4.5" style={{ paddingTop: 18, paddingBottom: 18 }}>
              <div className={`w-9 h-9 shrink-0 rounded-[10px] ${it.bg} border-2 border-ink text-white flex items-center justify-center`}>✓</div>
              <div>
                <div className="text-[16px] font-extrabold text-ink">{it.title}</div>
                <div className="text-[14px] leading-snug font-medium text-ink2 mt-0.5">{it.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ faq */
const FAQS = [
  { q: "Is Dreamari free?", a: "Yes — you can start exploring for free, no account or payment needed to try it. Some deeper features may come with a school or family plan later, but the core discovery experience is free for students." },
  { q: "Who is it for?", a: "Dreamari is built specifically for high-schoolers, roughly ages 13 to 18. The questions, simulations, and tone are all designed for where you are right now — not for adults already in careers." },
  { q: "Is this just another personality quiz?", a: "No. The quiz is only the starting point. The real value is in trying careers on through day-in-the-life simulations, seeing real pay and training paths, and getting matches that explain exactly why they fit you." },
  { q: "What about my privacy?", a: "Privacy is the default, not a setting. There are no public profiles, your exploration is yours, and we never sell student data. Parents and counselors only ever see what you choose to share." },
  { q: "Do I have to know what I want to do?", a: "Absolutely not — that's the whole point. Dreamari is built for the \"I have no idea\" moment. There are no grades and no wrong answers, just a few minutes that point your curiosity somewhere real." },
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-[oklch(0.975_0.03_122)]">
      <div className="max-w-[820px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="text-center mb-11">
          <p className="font-mono text-[13px] tracking-[0.16em] uppercase text-jadeDeep font-medium mb-3.5">Questions</p>
          <h2 className="text-[clamp(29px,6vw,44px)] leading-tight font-extrabold tracking-tight text-ink">
            Good questions, honest answers.
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = i === open;
            return (
              <div key={f.q} className="bg-white border-[2.5px] border-ink shadow-sk rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left"
                >
                  <span className="text-[18px] font-extrabold tracking-tight text-ink">{f.q}</span>
                  <span
                    className={`w-8 h-8 shrink-0 rounded-[9px] border-[2.5px] border-ink flex items-center justify-center text-[20px] font-extrabold leading-none ${
                      isOpen ? "bg-jade text-white" : "bg-mint text-jadeDeep"
                    }`}
                  >
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-[16px] leading-relaxed font-medium text-ink2">{f.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ final cta */
function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-jade border-t-[2.5px] border-ink">
      <span className="absolute top-[50px] left-[8%] w-[18px] h-[18px] rounded-full bg-yellow border-[2.5px] border-ink drm-float" />
      <span className="absolute bottom-[60px] left-[14%] w-4 h-4 bg-white border-[2.5px] border-ink rounded-[3px] drm-floatB" />
      <span className="absolute top-20 right-[10%] w-[15px] h-[15px] rounded-full bg-terra border-[2.5px] border-ink drm-float" />
      <span className="absolute bottom-[90px] right-[16%] w-[17px] h-[17px] bg-yellow border-[2.5px] border-ink rounded-[3px] drm-floatB" />
      <div className="max-w-[760px] mx-auto px-4 sm:px-8 py-20 sm:py-24 text-center relative z-[5]">
        <div className="inline-flex mb-7">
          <DreamyMark size={96} radius={999} bg="bg-white" />
        </div>
        <h2 className="text-[clamp(32px,7vw,52px)] leading-tight font-extrabold tracking-tight text-white">
          Your future's worth three minutes.
        </h2>
        <p className="text-[clamp(17px,4.5vw,20px)] leading-snug font-medium mt-4.5 mx-auto max-w-[42ch] text-[oklch(0.96_0.04_140)]" style={{ marginTop: 18 }}>
          Start free, no account needed to try it. See where your curiosity points.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap mt-8">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 h-[58px] px-8 rounded-2xl bg-yellow text-yellowInk border-[2.5px] border-ink shadow-sk-lg text-[19px] font-extrabold hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sk-xl transition-all"
          >
            Start free <span>→</span>
          </Link>
          <button
            onClick={HASH("how")}
            className="inline-flex items-center gap-2 h-[58px] px-7 rounded-2xl bg-white text-ink border-[2.5px] border-ink shadow-sk-lg text-[19px] font-extrabold hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sk-xl transition-all"
          >
            How it works
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ footer */
function Footer() {
  const col = (title: string, links: string[]) => (
    <div>
      <div className="text-[13px] font-extrabold uppercase tracking-wide text-[oklch(0.80_0.06_150)] mb-3.5">{title}</div>
      <div className="flex flex-col gap-2.5 text-[14px] font-semibold">
        {links.map((l) => (
          <a key={l} href="#" className="text-[oklch(0.88_0.03_140)] hover:text-white transition-colors">{l}</a>
        ))}
      </div>
    </div>
  );
  return (
    <footer className="bg-[oklch(0.18_0.045_162)] text-[oklch(0.92_0.03_140)]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-3.5">
            <DreamyMark size={32} radius={10} />
            <span className="text-[20px] font-extrabold tracking-tight text-white">
              Dreamari<span className="text-[oklch(0.78_0.12_150)]">.</span>
            </span>
          </div>
          <p className="text-[14px] leading-relaxed font-medium max-w-[34ch] text-[oklch(0.74_0.04_150)]">
            Career discovery for ages 13–18. Dream about who you could become.
          </p>
        </div>
        {col("Product", ["How it works", "Features", "Get started"])}
        {col("For grown-ups", ["For parents", "For schools", "FAQ"])}
        {col("Company", ["About", "Privacy", "Contact"])}
      </div>
      <div className="border-t border-[oklch(0.30_0.04_160)] max-w-[1180px] mx-auto px-4 sm:px-8 py-5 flex justify-between flex-wrap gap-3 text-[13px] font-medium text-[oklch(0.68_0.04_150)]">
        <span>© 2026 Dreamari. All rights reserved.</span>
        <span className="font-mono">Made for dreamers · ages 13–18</span>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ page */
export default function Landing() {
  return (
    <div className="font-display text-ink bg-[oklch(0.975_0.03_122)] overflow-x-hidden">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <Companion />
      <Testimonials />
      <Parents />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}
