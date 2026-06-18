import { describe, it, expect } from "vitest";
import {
  rankCareers,
  topCareers,
  topMajors,
  scoreCareer,
  buildCareerReport,
  CAREER_BY_CODE,
  CAREERS,
  type BuildInput,
} from "../src/index";
import { SUBJECT_MAP, STRENGTH_MAP } from "../src/match";

// A clearly tech/analytical student (uses onboarding labels to also exercise
// the BUILD→canonical normalization, e.g. "Problem solving" → "Problem Solving").
const ANALYTICAL: BuildInput = {
  subjects: ["Computer Science", "Mathematics"],
  strengths: ["Problem solving", "Technology"],
  days: ["Solve problems", "Build things"],
  values: ["Income", "Creativity"],
  years: "4 years",
  finance: "Not a concern",
  matchPath: "college",
};

const TRADES: BuildInput = {
  subjects: ["Mathematics", "P.E."],
  strengths: ["Technology", "Problem solving"],
  days: ["Build things", "Solve problems"],
  values: ["Income", "Stability"],
  years: "2–4 years",
  finance: "Cost matters a lot",
  matchPath: "trades",
};

describe("scoreCareer", () => {
  it("rewards overlapping subjects and strengths with an explainable breakdown", () => {
    const cs = scoreCareer(ANALYTICAL, CAREER_BY_CODE["software-engineer"]);
    expect(cs.breakdown.subjects.matched).toEqual(
      expect.arrayContaining(["Computer Science", "Mathematics"]),
    );
    expect(cs.breakdown.subjects.points).toBeGreaterThan(0);
    expect(cs.breakdown.strengths.matched).toContain("Problem Solving"); // normalized
    expect(cs.explanation).toMatch(/Software Engineer/);
  });

  it("keeps match percent within friendly bounds", () => {
    for (const c of CAREERS) {
      const cs = scoreCareer(ANALYTICAL, c);
      expect(cs.matchPercent).toBeGreaterThanOrEqual(25);
      expect(cs.matchPercent).toBeLessThanOrEqual(98);
    }
  });

  it("shows a genuine mismatch visibly lower than a neutral profile", () => {
    // cost-sensitive trades student vs a long, expensive, non-trade career
    const mismatch: BuildInput = {
      subjects: ["Art"],
      strengths: ["Creating"],
      days: ["Be creative"],
      values: ["Creativity"],
      years: "2–4 years",
      finance: "Cost matters a lot",
      matchPath: "trades",
    };
    const anti = scoreCareer(mismatch, CAREER_BY_CODE["doctor"]).matchPercent;
    const neutral = scoreCareer({}, CAREER_BY_CODE["doctor"]).matchPercent;
    expect(anti).toBeLessThan(neutral);
  });

  it("explains the score from what actually matched", () => {
    const cs = scoreCareer(ANALYTICAL, CAREER_BY_CODE["software-engineer"]);
    expect(cs.explanation).toMatch(/Computer Science|Mathematics|Problem Solving|Technology/);
  });
});

describe("rankCareers / topMajors", () => {
  it("puts the obviously-matching careers near the top for an analytical student", () => {
    const top = topCareers(ANALYTICAL, 5).map((cs) => cs.career.code);
    expect(top).toContain("software-engineer");
    expect(top).toContain("data-scientist");
  });

  it("surfaces Computer Science / Data Science among the top majors", () => {
    const majors = topMajors(ANALYTICAL, 3).map((m) => m.major.code);
    expect(majors).toEqual(expect.arrayContaining(["computer-science"]));
  });

  it("respects a trades preference and short study window", () => {
    const top = topCareers(TRADES, 5).map((cs) => cs.career.code);
    expect(top).toContain("electrician");
    const majors = topMajors(TRADES, 3).map((m) => m.major.code);
    expect(majors).toContain("skilled-trades");
  });

  it("is deterministic — same input, same order", () => {
    const a = rankCareers(ANALYTICAL).map((cs) => cs.career.code);
    const b = rankCareers(ANALYTICAL).map((cs) => cs.career.code);
    expect(a).toEqual(b);
  });

  it("handles an empty profile without crashing", () => {
    expect(rankCareers({})).toHaveLength(16);
    expect(topCareers({}, 5)).toHaveLength(5);
    expect(topMajors({}, 3)).toHaveLength(3);
  });
});

describe("scoring rules: finance / education / path notes track the answer", () => {
  const base: BuildInput = { subjects: [], strengths: [], days: [], values: [] };

  it("penalizes a cost-sensitive student against a long, expensive path", () => {
    const cs = scoreCareer({ ...base, finance: "Cost matters a lot" }, CAREER_BY_CODE["doctor"]); // tiers [3]
    expect(cs.breakdown.finance.points).toBeLessThan(0);
    expect(cs.breakdown.finance.note).toMatch(/cost-sensitive/i);
  });

  it("boosts a cost-sensitive student when a short route exists", () => {
    const cs = scoreCareer({ ...base, finance: "Cost matters a lot" }, CAREER_BY_CODE["electrician"]); // tiers [1]
    expect(cs.breakdown.finance.points).toBeGreaterThan(0);
  });

  it("never tells a cost-sensitive student that cost isn't a factor (regression)", () => {
    const cs = scoreCareer({ ...base, finance: "Cost matters a lot" }, CAREER_BY_CODE["teacher"]); // tiers [2]
    expect(cs.breakdown.finance.note).toMatch(/cost-sensitive/i);
  });

  it("penalizes too-short study willingness and rewards an exact fit", () => {
    const tooShort = scoreCareer({ ...base, years: "2–4 years" }, CAREER_BY_CODE["doctor"]); // needs [3]
    expect(tooShort.breakdown.education.points).toBeLessThan(0);
    const exact = scoreCareer({ ...base, years: "4 years" }, CAREER_BY_CODE["teacher"]); // [2]
    expect(exact.breakdown.education.points).toBeGreaterThan(0);
  });

  it("treats a 'Both' path preference as neutral with an honest note", () => {
    const cs = scoreCareer({ ...base, matchPath: "both" }, CAREER_BY_CODE["electrician"]);
    expect(cs.breakdown.path.points).toBe(0);
    expect(cs.breakdown.path.note).toMatch(/both/i);
  });
});

describe("BUILD picker labels resolve to dataset labels", () => {
  it("normalization still maps the renamed picker labels onto real career labels", () => {
    const subjects = new Set(CAREERS.flatMap((c) => c.subjects));
    const strengths = new Set(CAREERS.flatMap((c) => c.strengths));
    const norm = (xs: string[], m: Record<string, string>) => xs.map((x) => m[x] ?? x);
    // labels the onboarding picker shows that need normalizing
    for (const s of norm(["English", "P.E."], SUBJECT_MAP)) expect(subjects.has(s)).toBe(true);
    for (const s of norm(["Problem solving", "Helping people"], STRENGTH_MAP)) expect(strengths.has(s)).toBe(true);
    // already-canonical picker labels careers depend on
    for (const s of ["Computer Science", "Mathematics", "Psychology", "Art"]) expect(subjects.has(s)).toBe(true);
  });
});

describe("buildCareerReport", () => {
  it("assembles a full, personalized report", () => {
    const cs = scoreCareer(ANALYTICAL, CAREER_BY_CODE["software-engineer"]);
    const report = buildCareerReport(cs);
    expect(report.levels.length).toBeGreaterThan(0);
    expect(report.actionPlan.now.length).toBeGreaterThan(0);
    expect(report.universities.length).toBeGreaterThan(0);
    expect(report.certifications.now.length + report.certifications.after.length).toBeGreaterThan(0);
    expect(report.conclusion).toMatch(/Software Engineer/);
  });
});
