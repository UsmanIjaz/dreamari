import type {
  BuildInput,
  Career,
  CareerScore,
  MajorScore,
  StudyTier,
} from "./types";
import { CAREERS } from "./careers";
import { MAJORS } from "./majors";

/**
 * The matching engine — fully transparent and deterministic. No black box, no LLM.
 *
 * In plain language:
 *  1. Each career is scored against the student's BUILD profile across six
 *     dimensions (subjects, strengths, day activities, values, education fit,
 *     finance), with a path-preference adjustment.
 *  2. Every matched item earns fixed points (see WEIGHTS) — so the score is
 *     explainable item-by-item.
 *  3. Careers are ranked; a major's score is its best-matching linked career, so
 *     a major surfaces because it leads somewhere that fits the student.
 *  4. The raw score is mapped to a friendly 0–100 "match %" for display.
 *
 * These weights are the single place to tune behaviour — change them here only.
 */
export const WEIGHTS = {
  subject: 3,
  strength: 3,
  dayActivity: 2,
  value: 2,
  educationExact: 4, // student's willingness exactly covers the path
  educationOver: 2, // willing to study longer than required
  educationUnder: -2, // not willing to study long enough
  financeLongPenalty: -3, // cost-sensitive student vs a 6+ year path
  financeShortBoost: 2, // cost-sensitive student + a short path available
  financeSomewhatPenalty: -1,
  pathTradeBoost: 3, // "trades" preference + a trade-route career
  pathTradePenalty: -2, // "trades" preference + a non-trade career
  pathCollegeBoost: 1, // "college" preference + a degree-route career
} as const;

// Map a raw score to a friendly 0–100 match %. Calibrated so a near-perfect profile
// (raw ≈ REF_MAX) reaches the ceiling, a no-overlap profile sits at PCT_BASE, and a
// genuine anti-fit (negative raw) dips toward — but never below — PCT_FLOOR, so true
// fit is visible instead of every weak/empty match collapsing to one number.
const REF_MAX = 28; // raw a near-perfect profile reaches
const PCT_BASE = 42; // shown at raw 0 (nothing meaningful matched)
const PCT_FLOOR = 25; // genuine mismatch floor — visibly below a neutral profile
const PCT_CEIL = 98;

// ---- label normalization: BUILD answer labels → dataset-canonical labels ----
// Exported so a test can pin them: a rename on either side should fail loudly
// rather than silently producing zero matches.
export const SUBJECT_MAP: Record<string, string> = {
  English: "English/Literature",
  "P.E.": "Physical Education",
  Languages: "Foreign Languages",
};
export const STRENGTH_MAP: Record<string, string> = {
  "Problem solving": "Problem Solving",
  "Helping people": "Helping",
};

const norm = (arr: string[] | undefined, map: Record<string, string>): string[] =>
  (arr ?? []).map((x) => map[x] ?? x);

function yearsToTier(years: string | undefined): StudyTier | null {
  if (!years) return null;
  if (years.startsWith("2")) return 1; // "2–4 years"
  if (years.startsWith("4")) return 2; // "4 years"
  if (years.startsWith("6")) return 3; // "6+ years"
  return null;
}

const overlap = (a: string[], b: string[]): string[] => a.filter((x) => b.includes(x));

function clampPct(raw: number): number {
  const pct = Math.round(PCT_BASE + (raw / REF_MAX) * (PCT_CEIL - PCT_BASE));
  return Math.max(PCT_FLOOR, Math.min(PCT_CEIL, pct));
}

/** Build the one-line explanation from what actually scored — so it tracks the score. */
function buildExplanation(
  career: Career,
  m: { subjects: string[]; strengths: string[]; days: string[]; values: string[] },
  eduPositive: boolean,
): string {
  const parts: string[] = [];
  if (m.subjects.length) parts.push(`your interest in ${m.subjects.join(" & ")}`);
  if (m.strengths.length) parts.push(`your ${m.strengths.join(" & ")} ${m.strengths.length > 1 ? "strengths" : "strength"}`);
  if (m.days.length) parts.push(`wanting to ${m.days.map((d) => d.toLowerCase()).join(" & ")}`);
  if (m.values.length) parts.push(`what you value (${m.values.join(" & ")})`);
  const lead = parts.slice(0, 2).join(" and ");
  if (lead) return `Strong fit for ${lead} — a clear match for ${career.title}.`;
  if (eduPositive) return `Fits the study path you're planning — worth exploring as a ${career.title}.`;
  return `Not your strongest match yet, but worth a peek as a ${career.title} if it sparks something.`;
}

/** Score one career against a BUILD profile, returning a full point-by-point breakdown. */
export function scoreCareer(profile: BuildInput, career: Career): CareerScore {
  const subjects = norm(profile.subjects, SUBJECT_MAP);
  const strengths = norm(profile.strengths, STRENGTH_MAP);
  const days = profile.days ?? [];
  const values = profile.values ?? [];

  const mSubjects = overlap(subjects, career.subjects);
  const mStrengths = overlap(strengths, career.strengths);
  const mDays = overlap(days, career.dayActivities);
  const mValues = overlap(values, career.values);

  // education fit
  const tier = yearsToTier(profile.years);
  let eduPoints = 0;
  let eduNote = "No study-length preference given.";
  if (tier !== null) {
    if (career.educationTiers.includes(tier)) {
      eduPoints = WEIGHTS.educationExact;
      eduNote = `Your study-length plan fits this path (${career.educationPathLabel}).`;
    } else if (tier > Math.min(...career.educationTiers)) {
      eduPoints = WEIGHTS.educationOver;
      eduNote = `You're open to studying longer than this path needs.`;
    } else {
      eduPoints = WEIGHTS.educationUnder;
      eduNote = `This path needs more study time than you planned for.`;
    }
  }

  // finance sensitivity — the note always reflects the student's actual answer
  let finPoints = 0;
  let finNote = "No cost preference given.";
  const needsLong = career.educationTiers.every((t) => t >= 3);
  const hasShort = career.educationTiers.includes(1);
  if (profile.finance === "Cost matters a lot") {
    if (needsLong) {
      finPoints = WEIGHTS.financeLongPenalty;
      finNote = "You're cost-sensitive and this is a long, expensive path.";
    } else if (hasShort) {
      finPoints = WEIGHTS.financeShortBoost;
      finNote = "You're cost-sensitive, and a shorter, cheaper route exists here.";
    } else {
      finNote = "You're cost-sensitive; this path is a moderate length and cost.";
    }
  } else if (profile.finance === "Somewhat important") {
    if (needsLong) {
      finPoints = WEIGHTS.financeSomewhatPenalty;
      finNote = "Cost matters somewhat, and this is a longer path.";
    } else {
      finNote = "Cost matters somewhat; this path's length is manageable.";
    }
  } else if (profile.finance === "Not a concern") {
    finNote = "Cost isn't a concern for you.";
  }

  // path preference
  let pathPoints = 0;
  let pathNote = "No path preference given.";
  if (profile.matchPath === "trades") {
    pathPoints = career.trade ? WEIGHTS.pathTradeBoost : WEIGHTS.pathTradePenalty;
    pathNote = career.trade ? "Matches your interest in the trades." : "You leaned toward trades.";
  } else if (profile.matchPath === "college") {
    pathPoints = career.trade ? 0 : WEIGHTS.pathCollegeBoost;
    pathNote = career.trade ? "You leaned toward college." : "Matches your college path.";
  } else if (profile.matchPath === "both") {
    pathNote = "You're open to both college and the trades.";
  }

  const subjectPts = mSubjects.length * WEIGHTS.subject;
  const strengthPts = mStrengths.length * WEIGHTS.strength;
  const dayPts = mDays.length * WEIGHTS.dayActivity;
  const valuePts = mValues.length * WEIGHTS.value;

  const raw = subjectPts + strengthPts + dayPts + valuePts + eduPoints + finPoints + pathPoints;

  return {
    career,
    raw,
    matchPercent: clampPct(raw),
    breakdown: {
      subjects: { matched: mSubjects, points: subjectPts },
      strengths: { matched: mStrengths, points: strengthPts },
      dayActivities: { matched: mDays, points: dayPts },
      values: { matched: mValues, points: valuePts },
      education: { points: eduPoints, note: eduNote },
      finance: { points: finPoints, note: finNote },
      path: { points: pathPoints, note: pathNote },
    },
    explanation: buildExplanation(
      career,
      { subjects: mSubjects, strengths: mStrengths, days: mDays, values: mValues },
      eduPoints > 0,
    ),
  };
}

/** Score and rank every career, best first (stable: ties broken by title). */
export function rankCareers(profile: BuildInput): CareerScore[] {
  return CAREERS.map((c) => scoreCareer(profile, c)).sort(
    (a, b) => b.raw - a.raw || a.career.title.localeCompare(b.career.title),
  );
}

/** Top N careers. */
export function topCareers(profile: BuildInput, n = 5): CareerScore[] {
  return rankCareers(profile).slice(0, n);
}

/**
 * Rank majors. A major's score is its best-matching linked career — so the majors
 * that surface are the ones leading to careers that actually fit the student.
 */
export function rankMajors(profile: BuildInput): MajorScore[] {
  const byCode = new Map(rankCareers(profile).map((cs) => [cs.career.code, cs]));
  return MAJORS.map((m) => {
    const careers = m.linkedCareers
      .map((code) => byCode.get(code))
      .filter((cs): cs is CareerScore => Boolean(cs))
      .sort((a, b) => b.raw - a.raw || a.career.title.localeCompare(b.career.title));
    const top = careers[0] ?? null;
    return {
      major: m,
      raw: top ? top.raw : 0,
      matchPercent: top ? top.matchPercent : PCT_FLOOR,
      topCareer: top,
      careers,
    };
  }).sort((a, b) => b.raw - a.raw || a.major.title.localeCompare(b.major.title));
}

/** Top N majors — the Dream Map shows the top 3. */
export function topMajors(profile: BuildInput, n = 3): MajorScore[] {
  return rankMajors(profile).slice(0, n);
}

/** Careers reachable from a set of liked majors, ranked and de-duplicated. */
export function careersForMajors(profile: BuildInput, majorCodes: string[]): CareerScore[] {
  const wanted = new Set(majorCodes);
  const codes = new Set<string>();
  for (const m of MAJORS) {
    if (wanted.has(m.code)) m.linkedCareers.forEach((c) => codes.add(c));
  }
  return rankCareers(profile).filter((cs) => codes.has(cs.career.code));
}
