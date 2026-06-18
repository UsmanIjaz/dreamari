// Local UX state only — the cosmetic per-major "fit" (0–5) the swipe game produces
// (the server stores the LIKE/PASS decision + facet answers). Auth/session is now
// owned by Better Auth (see auth-client.ts); there are no client-stored tokens.

const FIT_KEY = "dreamari.fit.v1";

export type FitCache = Record<string, number>;
export const readFit = (): FitCache => {
  try {
    const r = localStorage.getItem(FIT_KEY);
    return r ? (JSON.parse(r) as FitCache) : {};
  } catch {
    return {};
  }
};
export const writeFit = (f: FitCache): void => {
  try {
    localStorage.setItem(FIT_KEY, JSON.stringify(f));
  } catch {
    /* ignore */
  }
};

/** Dream Score — composite of progress (assessment + exploration + commitment). */
export function dreamScore(explored: number, saved: number, completed: boolean): number {
  return (completed ? 200 : 0) + explored * 60 + saved * 100;
}
