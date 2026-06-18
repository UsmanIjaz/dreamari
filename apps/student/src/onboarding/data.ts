/**
 * BUILD content + option sets. These mirror the trial brief's 9 steps exactly
 * (every field here maps to a column the backend must store):
 *   name, grade, subjects(≤3), strengths(≤3), days(≤3), energy/team/interaction,
 *   values(≤3), gpa, study-length(years), finance, location.
 * Kept in one module so the backend contract has a single front-end source.
 */

export type Answers = {
  name: string;
  grade: string;
  gpa: string;
  subjects: string[];
  strengths: string[];
  days: string[];
  values: string[];
  energy: string;
  team: string;
  interaction: string;
  years: string;
  finance: string;
  location: string;
};

export const EMPTY: Answers = {
  name: "",
  grade: "",
  gpa: "",
  subjects: [],
  strengths: [],
  days: [],
  values: [],
  energy: "",
  team: "",
  interaction: "",
  years: "",
  finance: "",
  location: "",
};

export const SAVE_KEY = "dreamari.onboarding.v1";

export const GRADES = ["9th grade", "10th grade", "11th grade", "12th grade", "Recent grad"];
export const GPAS = ["Below 2.5", "2.5 – 3.0", "3.0 – 3.5", "3.5 – 3.8", "3.8 – 4.0", "Not sure yet"];
export const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Art",
  "Music",
  "Computer Science",
  "Languages",
  "Business",
  "Psychology",
  "P.E.",
  "Drama",
];
export const STRENGTHS: [string, string][] = [
  ["Problem solving", "brain"],
  ["Speaking", "mic"],
  ["Technology", "screen"],
  ["Helping people", "heart"],
  ["Creating", "brush"],
  ["Leading", "users"],
];
export const DAYS = [
  "Build things",
  "Solve problems",
  "Help people",
  "Be creative",
  "Lead others",
  "Stay organized",
];
export const VALUES: [string, string][] = [
  ["Income", "trend"],
  ["Impact", "globe"],
  ["Creativity", "brush"],
  ["Stability", "shield"],
  ["Flexibility", "wind"],
  ["Recognition", "trophy"],
];
export const ENERGY = ["Fast pace", "Calm", "Balanced"];
export const TEAM = ["Solo", "Small team", "Big team"];
export const INTERACT = ["Talk a lot", "Some talking", "Mostly solo"];
export const YEARS = [
  { t: "2–4 years", d: "Trade school, community college, or associate", icon: "zap" },
  { t: "4 years", d: "A traditional university / bachelor’s degree", icon: "cap" },
  { t: "6+ years", d: "Graduate or professional school", icon: "brain" },
];
export const FINANCE = [
  { t: "Cost matters a lot", d: "Affordability is a top priority" },
  { t: "Somewhat important", d: "I’ll weigh cost against fit" },
  { t: "Not a concern", d: "Cost won’t drive my decision" },
];
export const LOCATIONS = [
  "In my home state",
  "Anywhere in the US",
  "West Coast",
  "East Coast",
  "Midwest",
  "South",
  "International",
];

export const STAGES = ["About you", "Your strengths", "Your future"];
export const AFFIRM = ["Nice!", "Love it!", "Great pick!", "Yes!", "Ooh, good one!", "Perfect ✨"];
export const INTER_COPY: Record<number, string> = {
  1: "Now the fun part — let’s uncover what you’re naturally great at. This is where your direction starts to take shape.",
  2: "Last stretch. Let’s shape what you actually want your future to look like.",
};

export const SLIDES = [
  {
    mood: "happy" as const,
    level: 1,
    title: "Your future isn’t a test.",
    body: "It’s a place you can visit. Let’s go look around together.",
  },
  {
    mood: "think" as const,
    level: 2,
    title: "You can’t fail at being you.",
    body: "No grades, no wrong answers — just honest questions about what you love.",
  },
  {
    mood: "celebrate" as const,
    level: 3,
    title: "First, I’ll get to know you.",
    body: "Then I’ll introduce you to careers that fit — including ones you’ve never heard of.",
    proof: "Partnered with 116 schools across 8 countries",
  },
];

export const PATHS = [
  { id: "hs", icon: "cap", title: "High School", desc: "Find your best-fit major", accent: "jade" },
  { id: "uni", icon: "bag", title: "University", desc: "Explore internships & roles", accent: "green" },
  { id: "job", icon: "target", title: "Job Seekers", desc: "Launch your next move", accent: "terra" },
];

export const FINISH = [
  { id: "college", icon: "cap", t: "College", d: "Majors & degrees" },
  { id: "trades", icon: "wrench", t: "Trades", d: "Skilled careers" },
  { id: "both", icon: "spark", t: "Both", d: "Explore everything" },
];

export const CONFETTI_COLORS = [
  "oklch(0.85 0.15 92)",
  "oklch(0.57 0.13 165)",
  "oklch(0.55 0.14 155)",
  "oklch(0.64 0.15 38)",
  "oklch(0.86 0.09 160)",
];

export function buzz(p: number | number[]) {
  try {
    if ("vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* haptics unavailable */
  }
}
