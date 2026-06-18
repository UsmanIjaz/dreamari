/**
 * Dreamy — the shapeshifter companion. Starts undefined ("becoming") and grows
 * more realized as `level` rises (1 resting → 4+ defined). `mood` overlays on top.
 * See design language §08 and the Requirements & Plan §5 for the evolution model.
 */
export type Mood = "happy" | "idle" | "celebrate" | "think";

export function Mascot({
  size = 96,
  mood = "happy",
  level = 1,
}: {
  size?: number;
  mood?: Mood;
  level?: number;
}) {
  const eye = (
    <span
      className="relative bg-ink rounded-full"
      style={{ width: size * 0.12, height: size * 0.12, animation: "drm-blink 4s infinite" }}
    >
      <span
        className="absolute bg-white rounded-full"
        style={{
          width: size * 0.045,
          height: size * 0.045,
          top: size * 0.018,
          left: size * 0.018,
        }}
      />
    </span>
  );

  return (
    <div
      className="relative inline-flex items-center justify-center a-bob"
      style={{ width: size, height: size }}
    >
      {/* aura once the mascot is "tinted"/defined */}
      {level >= 3 && (
        <span
          className="absolute rounded-full bg-yellow/40"
          style={{ inset: -size * 0.16, filter: "blur(" + size * 0.09 + "px)" }}
        />
      )}
      <div className="absolute inset-0 rounded-full bg-white border-[3px] border-ink shadow-sk" />
      <div className="relative flex flex-col items-center" style={{ gap: size * 0.06 }}>
        <div className="flex" style={{ gap: size * 0.13 }}>
          {eye}
          {eye}
        </div>
        {mood !== "idle" && (
          <span
            className="rounded-b-full bg-terra"
            style={{ width: size * 0.16, height: size * 0.08 }}
          />
        )}
      </div>
      {(mood === "celebrate" || mood === "happy" || level >= 2) && (
        <span
          className="absolute bg-yellow border-2 border-ink rotate-45 rounded-[3px]"
          style={{ width: size * 0.16, height: size * 0.16, top: -size * 0.06, right: size * 0.02 }}
        />
      )}
      {level >= 3 && (
        <span
          className="absolute bg-jade border-2 border-ink rounded-full"
          style={{ width: size * 0.1, height: size * 0.1, bottom: -size * 0.01, left: -size * 0.03 }}
        />
      )}
    </div>
  );
}
