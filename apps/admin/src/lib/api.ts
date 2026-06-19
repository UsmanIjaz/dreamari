// Admin API client — cookie-authed (credentials: include), same-origin via proxy.
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
  // session expired / not an admin → go to login instead of looping on an error box
  if ((res.status === 401 || res.status === 403) && !location.pathname.startsWith("/login")) {
    location.assign("/login");
  }
  if (!res.ok) throw new ApiError(res.status, await res.text().catch(() => res.statusText));
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

export type Paged<T> = { total: number; items: T[] };

function qs(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export type Analytics = {
  totalStudents: number;
  completedBuilds: number;
  completionRate: number;
  totalSwipes: number;
  popularMajors: { code: string; title: string; likes: number }[];
};

export type StudentRow = {
  id: string;
  firstName: string;
  buildComplete: boolean;
  swipeCount: number;
  likedCount: number;
  leaning: string | null;
  school: string | null;
  grade: string | null;
  lastActive: string;
};

export type School = {
  id: string;
  name: string;
  region: string | null;
  cohortCount: number;
  studentCount: number;
  inviteCount: number;
  createdAt: string;
};
export type CohortRow = { id: string; label: string; gradeLevel: string | null; studentCount: number; inviteCount: number };
export type SchoolDetail = { id: string; name: string; region: string | null; createdAt: string; cohorts: CohortRow[] };

export type BuildAnswers = {
  grade: string | null;
  gpa: string | null;
  subjects: string[];
  strengths: string[];
  days: string[];
  values: string[];
  energy: string | null;
  team: string | null;
  interaction: string | null;
  years: string | null;
  finance: string | null;
  location: string | null;
  pathPref: string | null;
} | null;

export type StudentDetail = {
  id: string;
  firstName: string;
  buildComplete: boolean;
  swipeCount: number;
  likedCount: number;
  leaning: string[];
  answers?: BuildAnswers;
};

export type Invite = {
  id: string;
  code: string;
  intendedFirstName: string | null;
  email: string | null;
  status: "PENDING" | "REDEEMED" | "REVOKED";
  createdAt: string;
  redeemedAt: string | null;
  redeemedById: string | null;
  school?: { id: string; name: string } | null;
  cohort?: { id: string; label: string } | null;
  // present on the create response: null = no email given, true/false = send outcome
  emailSent?: boolean | null;
  emailError?: string | null;
};

export const adminApi = {
  analytics: () => req<Analytics>("/admin/analytics"),
  students: (params?: { q?: string; limit?: number; offset?: number }) =>
    req<Paged<StudentRow>>(`/admin/students${qs(params)}`),
  student: (id: string, includeAnswers = false) =>
    req<StudentDetail>(`/admin/students/${id}${includeAnswers ? "?includeAnswers=true" : ""}`),
  createInvite: (firstName?: string, email?: string) =>
    req<Invite>("/admin/invites", {
      method: "POST",
      body: JSON.stringify({ ...(firstName ? { firstName } : {}), ...(email ? { email } : {}) }),
    }),
  invites: (params?: { q?: string; status?: string; limit?: number; offset?: number }) =>
    req<Paged<Invite>>(`/admin/invites${qs(params)}`),
  revokeInvite: (id: string) => req<Invite>(`/admin/invites/${id}`, { method: "DELETE" }),

  // ---- schools → cohorts → invites ----
  schools: () => req<School[]>("/admin/schools"),
  school: (id: string) => req<SchoolDetail>(`/admin/schools/${id}`),
  createSchool: (name: string, region?: string) =>
    req<School>("/admin/schools", { method: "POST", body: JSON.stringify({ name, region }) }),
  updateSchool: (id: string, data: { name?: string; region?: string }) =>
    req<School>(`/admin/schools/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSchool: (id: string) => req<{ ok: boolean }>(`/admin/schools/${id}`, { method: "DELETE" }),
  createCohort: (schoolId: string, label: string, gradeLevel?: string) =>
    req<CohortRow>(`/admin/schools/${schoolId}/cohorts`, { method: "POST", body: JSON.stringify({ label, gradeLevel }) }),
  deleteCohort: (id: string) => req<{ ok: boolean }>(`/admin/cohorts/${id}`, { method: "DELETE" }),
  cohortInvites: (id: string) => req<Invite[]>(`/admin/cohorts/${id}/invites`),
  createCohortInvite: (id: string, firstName?: string, email?: string) =>
    req<Invite>(`/admin/cohorts/${id}/invites`, {
      method: "POST",
      body: JSON.stringify({ ...(firstName ? { firstName } : {}), ...(email ? { email } : {}) }),
    }),
  bulkInvites: (cohortId: string, students: { firstName: string; email: string }[]) =>
    req<{ created: number; skipped: number; emailed: number; emailFailed: number }>(
      `/admin/cohorts/${cohortId}/invites/bulk`,
      { method: "POST", body: JSON.stringify({ students }) },
    ),
};
