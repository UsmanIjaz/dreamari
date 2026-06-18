/** Minimal stroke-icon set — single path each, drawn in the line style of the brand. */
export const ICON_PATHS: Record<string, string> = {
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0",
  cap: "M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 3 3 6 3s6-2 6-3v-5",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM19 19H6",
  zap: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  target:
    "M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0M12 12m-5 0a5 5 0 1010 0 5 5 0 10-10 0M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0",
  bag: "M4 7h16v13H4zM9 7V5a3 3 0 016 0v2",
  star: "M12 3l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 18l-5.8 3 1.1-6.5L2.5 9.9 9.1 9z",
  rocket:
    "M5 15c-1 1-2 5-2 5s4-1 5-2m4-9a6 6 0 016 6c0 4-6 8-6 8s-6-4-6-8a6 6 0 016-6zm0 4a2 2 0 100 0",
  pin: "M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12zM12 10m-2 0a2 2 0 104 0 2 2 0 10-4 0",
  brain:
    "M9 4a3 3 0 00-3 3 3 3 0 00-1 5 3 3 0 002 5 3 3 0 005 1 3 3 0 005-1 3 3 0 002-5 3 3 0 00-1-5 3 3 0 00-3-3 3 3 0 00-3-1 3 3 0 00-3 1z",
  mic: "M12 3a3 3 0 013 3v6a3 3 0 01-6 0V6a3 3 0 013-3zM6 11a6 6 0 0012 0M12 18v3",
  screen: "M3 4h18v12H3zM8 20h8M12 16v4",
  heart: "M12 20s-7-4.6-7-9.5A3.5 3.5 0 0112 7a3.5 3.5 0 017 3.5C19 15.4 12 20 12 20z",
  brush: "M3 21s4 0 6-2 2-4 2-4l-2-2s-2 0-4 2-2 6-2 6zM13 13l6-6a2 2 0 00-3-3l-6 6",
  users:
    "M9 11a3 3 0 100-6 3 3 0 000 6zm-7 8a7 7 0 0114 0M17 11a3 3 0 10-2-5M22 19a6 6 0 00-4-5",
  cube: "M12 2l8 4.5v9L12 20l-8-4.5v-9zM12 2v18M4 6.5l8 4.5 8-4.5",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  trend: "M3 17l6-6 4 4 7-7M14 8h5v5",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z",
  wind: "M3 8h11a2.5 2.5 0 10-2.5-2.5M3 12h16a2.5 2.5 0 11-2.5 2.5M3 16h9a2 2 0 11-2 2",
  trophy: "M7 4h10v4a5 5 0 01-10 0V4zM5 6H3v1a3 3 0 003 3M19 6h2v1a3 3 0 01-3 3M9 14h6M12 14v4m-3 3h6",
  wrench: "M14 7a4 4 0 01-5 5l-6 6 2 2 6-6a4 4 0 005-5l-2 2-2-2 2-2z",
  spark:
    "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 3l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7zM5 17l.6 1.7 1.7.6-1.7.6L5 22l-.6-1.7L2.7 19.7l1.7-.6z",
  check: "M5 13l4 4L19 7",
  flame: "M12 22c4 0 7-3 7-7 0-4-3-5-3-9 0 0-3 2-3 6 0-2-1-4-2-5 0 3-3 4-3 8 0 4 3 7 7 7z",
  chevDown: "M6 9l6 6 6-6",
  chevLeft: "M15 18l-6-6 6-6",
  chevRight: "M9 18l6-6-6-6",
};

export function Icon({ n, c = "w-5 h-5", sw = 2 }: { n: string; c?: string; sw?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={c}
    >
      <path d={ICON_PATHS[n] || ""} />
    </svg>
  );
}
