export const ICON_PATHS: Record<string, string> = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  users: "M9 11a3 3 0 100-6 3 3 0 000 6zm-7 8a7 7 0 0114 0M17 11a3 3 0 10-2-5M22 19a6 6 0 00-4-5",
  ticket: "M3 6h18v4a2 2 0 000 4v4H3v-4a2 2 0 000-4V6zM10 6v12",
  trend: "M3 17l6-6 4 4 7-7M14 8h5v5",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  flame: "M12 22c4 0 7-3 7-7 0-4-3-5-3-9 0 0-3 2-3 6 0-2-1-4-2-5 0 3-3 4-3 8 0 4 3 7 7 7z",
  logout: "M15 12H3m0 0l4-4m-4 4l4 4M11 4h6a2 2 0 012 2v12a2 2 0 01-2 2h-6",
  plus: "M12 5v14M5 12h14",
  check: "M5 13l4 4L19 7",
  x: "M6 6l12 12M18 6L6 18",
  chevRight: "M9 18l6-6-6-6",
  chevLeft: "M15 18l-6-6 6-6",
  trash: "M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M6 7l1 13h10l1-13",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0",
  eyeOff: "M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c6 0 10 6 10 6a16 16 0 01-3 3.4M6.6 6.6A16 16 0 002 12s4 6 10 6a9.7 9.7 0 004-.8",
  shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z",
  cap: "M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 3 3 6 3s6-2 6-3v-5",
};

export function Icon({ n, c = "w-5 h-5", sw = 2 }: { n: string; c?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={c}>
      <path d={ICON_PATHS[n] || ""} />
    </svg>
  );
}
