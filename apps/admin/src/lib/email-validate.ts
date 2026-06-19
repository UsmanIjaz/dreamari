// Client-side email validation for the invite flows: format check + a "did you
// mean…" typo detector for common providers (catches gmial.com, yaho.com, etc.).
// Typos don't block — they warn with a one-tap fix — since an odd domain can be real.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Popular consumer domains students typically use (most-typo'd first).
const POPULAR = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
];

// Levenshtein (edit) distance — small strings, so the simple DP is plenty.
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export type EmailCheck = {
  /** format-valid — gates whether an invite can be created */
  valid: boolean;
  /** why it's invalid (when valid === false) */
  reason?: string;
  /** a likely-correct address when the domain looks misspelled (a soft warning) */
  suggestion?: string;
};

export function checkEmail(raw: string): EmailCheck {
  const email = (raw ?? "").trim();
  if (!email) return { valid: false, reason: "Email is required" };
  if (!EMAIL_RE.test(email)) return { valid: false, reason: "That doesn't look like a valid email" };

  const [local, domain] = email.toLowerCase().split("@");
  if (POPULAR.includes(domain)) return { valid: true };

  // close to a popular domain (1–2 edits) but not exact → probably a typo
  let best: string | null = null;
  let bestDist = Infinity;
  for (const d of POPULAR) {
    const dist = editDistance(domain, d);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  if (best && bestDist > 0 && bestDist <= 2) {
    return { valid: true, suggestion: `${local}@${best}` };
  }
  return { valid: true };
}
