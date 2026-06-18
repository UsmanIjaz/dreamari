/** How long a student is willing to study: 1 = 2–4 yrs, 2 = 4 yrs, 3 = 6+ yrs. */
export type StudyTier = 1 | 2 | 3;

export interface Career {
  code: string;
  title: string;
  description: string;
  subjects: string[];
  strengths: string[];
  dayActivities: string[];
  values: string[];
  educationTiers: StudyTier[];
  educationPathLabel: string;
  /** trade-route career (shorter, hands-on path) — used by the path-preference rule. */
  trade: boolean;
}

export interface Major {
  code: string;
  title: string;
  teaser: string;
  /** icon name from the app's icon set + Mint-palette accent token. */
  icon: string;
  accent: string;
  /** career codes this major leads to. */
  linkedCareers: string[];
  // the five sub-cards the brief requires (shown as swipe questions in MATCH)
  classes: string;
  workstyle: string;
  skills: string;
  salaryOutlook: string;
  dayInLife: string;
}

/** A student's BUILD answers, in dataset-canonical labels after normalization. */
export interface BuildInput {
  subjects?: string[];
  strengths?: string[];
  days?: string[];
  values?: string[];
  energy?: string;
  team?: string;
  interaction?: string;
  gpa?: string;
  years?: string;
  finance?: string;
  location?: string;
  /** path preference from the congrats screen: "college" | "trades" | "both". */
  matchPath?: string;
}

export interface DimensionScore {
  matched: string[];
  points: number;
}

export interface CareerScore {
  career: Career;
  raw: number;
  matchPercent: number;
  breakdown: {
    subjects: DimensionScore;
    strengths: DimensionScore;
    dayActivities: DimensionScore;
    values: DimensionScore;
    education: { points: number; note: string };
    finance: { points: number; note: string };
    path: { points: number; note: string };
  };
  explanation: string;
}

export interface MajorScore {
  major: Major;
  raw: number;
  matchPercent: number;
  topCareer: CareerScore | null;
  careers: CareerScore[];
}

// ---- Career Report content (authored, extends the brief's dataset) ----
export interface CareerLevel {
  title: string;
  salary: string;
}
export interface UniversityOption {
  program: string;
  requirements: string;
  whyFits: string;
}
/** Authored per-career report content. */
export interface CareerReportContent {
  levels: CareerLevel[]; // entry → senior/executive, each with a salary range
  actionPlan: { now: string[]; near: string[]; far: string[] }; // Now / 1–2 yrs / 3–5 yrs
  universities: UniversityOption[];
  certifications: { now: string[]; during: string[]; after: string[] };
}
/** A fully assembled Career Report for one career, personalized to the student. */
export interface CareerReport extends CareerReportContent {
  career: Career;
  matchPercent: number;
  conclusion: string;
}
