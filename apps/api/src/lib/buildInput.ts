import type { BuildInput } from "@dreamari/dataset";
import type { BuildProfile } from "@prisma/client";

/** Map a stored BuildProfile row into the engine's BuildInput shape. */
export function toBuildInput(b: BuildProfile | null): BuildInput {
  if (!b) return {};
  return {
    subjects: b.subjects,
    strengths: b.strengths,
    days: b.days,
    values: b.values,
    energy: b.energy ?? undefined,
    team: b.team ?? undefined,
    interaction: b.interaction ?? undefined,
    gpa: b.gpa ?? undefined,
    years: b.years ?? undefined,
    finance: b.finance ?? undefined,
    location: b.location ?? undefined,
    matchPath: b.pathPref ?? undefined,
  };
}
