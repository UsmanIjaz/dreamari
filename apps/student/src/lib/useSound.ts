import { useRef } from "react";

/**
 * Tiny Web-Audio feedback layer — no audio assets shipped.
 * Each interaction gets a short, friendly tone (tap / select / success …).
 */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ac = () =>
    (ctxRef.current ||= new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)());

  const tone = (
    freq: number,
    dur: number,
    type: OscillatorType = "sine",
    gain = 0.06,
    when = 0,
  ) => {
    try {
      const c = ac();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.connect(g);
      g.connect(c.destination);
      const t = c.currentTime + when;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch {
      /* audio not available — silently ignore */
    }
  };

  return {
    tap: () => tone(430, 0.07, "triangle", 0.05),
    select: () => {
      tone(560, 0.08, "sine", 0.06);
      tone(760, 0.07, "sine", 0.04, 0.04);
    },
    deselect: () => tone(320, 0.07, "sine", 0.04),
    next: () => {
      tone(520, 0.09, "sine", 0.06);
      tone(700, 0.11, "sine", 0.05, 0.05);
    },
    back: () => tone(300, 0.08, "sine", 0.045),
    success: () =>
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.2, "sine", 0.06, i * 0.085)),
  };
}

export type Snd = ReturnType<typeof useSound>;
