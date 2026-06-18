// API client — calls the versioned API same-origin (Vite proxy) and sends the
// session cookie via `credentials: "include"`. Auth itself lives in auth-client.ts.

const BASE = "/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) ?? {}),
  };
  const res = await fetch(BASE + path, { ...opts, headers, credentials: "include" });
  if (!res.ok) throw new ApiError(res.status, await res.text().catch(() => res.statusText));
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

// ---- response shapes ----
export type SubCards = { classes: string; workstyle: string; skills: string; salaryOutlook: string; dayInLife: string };
export type DeckMajor = {
  code: string;
  title: string;
  teaser: string;
  icon: string;
  accent: string;
  matchPercent: number;
  leadCareer: string | null;
  subCards: SubCards;
};
export type MatchCareer = { code: string; title: string; description: string; matchPercent: number; explanation: string };
export type MatchMajor = { code: string; title: string; teaser: string; icon: string; accent: string; matchPercent: number; topCareer: { title: string } | null };
export type Swipe = { majorCode: string; decision: "LIKE" | "PASS" };

export type ReportGroup = {
  major: { code: string; title: string; accent: string; icon: string };
  careers: { code: string; title: string; description: string; matchPercent: number; explanation: string }[];
};
export type CareerReportResp = {
  career: { code: string; title: string; description: string; educationPathLabel: string };
  matchPercent: number;
  levels: { title: string; salary: string }[];
  actionPlan: { now: string[]; near: string[]; far: string[] };
  universities: { program: string; requirements: string; whyFits: string }[];
  certifications: { now: string[]; during: string[]; after: string[] };
  conclusion: string;
};

export type BuildBody = {
  audience?: string;
  grade?: string;
  gpa?: string;
  subjects?: string[];
  strengths?: string[];
  days?: string[];
  values?: string[];
  energy?: string;
  team?: string;
  interaction?: string;
  years?: string;
  finance?: string;
  location?: string;
  pathPref?: string;
};

export type InviteInfo = {
  code: string;
  status: "PENDING" | "REDEEMED" | "REVOKED";
  email: string | null;
  intendedFirstName: string | null;
  school: { id: string; name: string } | null;
  cohort: { id: string; label: string; gradeLevel: string | null } | null;
};

export const api = {
  getInvite: (code: string) => req<InviteInfo>(`/invite/${encodeURIComponent(code)}`),
  attachInvite: (code: string) =>
    req<{ ok: boolean; schoolId: string | null; cohortId: string | null }>("/invite/attach", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  getBuild: () => req<BuildBody | null>("/build"),
  putBuild: (b: BuildBody) => req<BuildBody>("/build", { method: "PUT", body: JSON.stringify(b) }),
  getMatch: () => req<{ needsBuild: boolean; careers: MatchCareer[]; majors: MatchMajor[] }>("/match"),
  getDeck: () => req<{ needsBuild: boolean; deck: DeckMajor[] }>("/match/deck"),
  getSwipes: () => req<{ swipes: Swipe[]; likedCount: number }>("/swipes"),
  swipe: (majorCode: string, decision: "LIKE" | "PASS", facetAnswers?: boolean[]) =>
    req<{ ok: boolean; total: number; likedCount: number }>("/swipes", {
      method: "POST",
      body: JSON.stringify({ majorCode, decision, facetAnswers }),
    }),
  getReport: () => req<{ likedMajors: string[]; groups: ReportGroup[] }>("/report"),
  getCareerReport: (code: string) => req<CareerReportResp>(`/report/career/${code}`),
};
