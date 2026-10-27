// Lip-sync: ARPAbet phones (public/audio/islamic-finance-01/lipsync.json,
// scripts/if01_phones.py) → viseme targets → smoothed parametric mouth.
// The audio envelope scales the jaw so loud syllables open wider and the
// mouth is closed in every pause.

export type Phone = { readonly p: string; readonly start: number; readonly end: number };
export type LipWord = { readonly text: string; readonly start: number; readonly end: number; readonly phones: readonly Phone[] };
export type LipsyncData = {
  readonly version: 1;
  readonly fps: number;
  readonly env: readonly number[];
  readonly lines: readonly { readonly id: string; readonly words: readonly LipWord[] }[];
};

export type Mouth = { open: number; wide: number; round: number; teeth: number; tongue: number; press: number };

const CLOSED: Mouth = { open: 0, wide: 0, round: 0, teeth: 0, tongue: 0, press: 0 };

// Preston-Blair style viseme targets per ARPAbet phone (stress digits removed).
const VISEME: Record<string, Mouth> = {
  // open vowels
  AA: { open: 1, wide: 0.55, round: 0.05, teeth: 0.2, tongue: 0, press: 0 },
  AE: { open: 0.85, wide: 0.8, round: 0, teeth: 0.4, tongue: 0, press: 0 },
  AH: { open: 0.7, wide: 0.45, round: 0.1, teeth: 0.2, tongue: 0, press: 0 },
  AY: { open: 0.8, wide: 0.7, round: 0, teeth: 0.3, tongue: 0, press: 0 },
  EH: { open: 0.6, wide: 0.8, round: 0, teeth: 0.5, tongue: 0, press: 0 },
  AW: { open: 0.8, wide: 0.3, round: 0.5, teeth: 0.1, tongue: 0, press: 0 },
  // spread vowels
  IY: { open: 0.4, wide: 1, round: 0, teeth: 0.9, tongue: 0, press: 0 },
  IH: { open: 0.45, wide: 0.85, round: 0, teeth: 0.7, tongue: 0, press: 0 },
  EY: { open: 0.5, wide: 0.9, round: 0, teeth: 0.7, tongue: 0, press: 0 },
  // rounded vowels
  AO: { open: 0.7, wide: 0.1, round: 0.85, teeth: 0.1, tongue: 0, press: 0 },
  OW: { open: 0.62, wide: 0, round: 0.95, teeth: 0, tongue: 0, press: 0 },
  OY: { open: 0.6, wide: 0.2, round: 0.8, teeth: 0.1, tongue: 0, press: 0 },
  UH: { open: 0.45, wide: 0.1, round: 0.8, teeth: 0, tongue: 0, press: 0 },
  UW: { open: 0.38, wide: 0, round: 1, teeth: 0, tongue: 0, press: 0 },
  W: { open: 0.3, wide: 0, round: 1, teeth: 0, tongue: 0, press: 0.1 },
  ER: { open: 0.45, wide: 0.2, round: 0.55, teeth: 0.2, tongue: 0, press: 0 },
  R: { open: 0.4, wide: 0.15, round: 0.6, teeth: 0.2, tongue: 0, press: 0 },
  // closed-lip consonants
  M: { open: 0, wide: 0.2, round: 0, teeth: 0, tongue: 0, press: 1 },
  B: { open: 0.02, wide: 0.2, round: 0, teeth: 0, tongue: 0, press: 1 },
  P: { open: 0.02, wide: 0.2, round: 0, teeth: 0, tongue: 0, press: 1 },
  // lip-teeth
  F: { open: 0.18, wide: 0.5, round: 0, teeth: 1, tongue: 0, press: 0.6 },
  V: { open: 0.18, wide: 0.5, round: 0, teeth: 1, tongue: 0, press: 0.6 },
  // tongue
  TH: { open: 0.3, wide: 0.5, round: 0, teeth: 0.5, tongue: 1, press: 0 },
  DH: { open: 0.3, wide: 0.5, round: 0, teeth: 0.5, tongue: 1, press: 0 },
  L: { open: 0.45, wide: 0.5, round: 0, teeth: 0.3, tongue: 1, press: 0 },
  // other consonants: slightly open, teeth
  S: { open: 0.2, wide: 0.8, round: 0, teeth: 0.9, tongue: 0, press: 0 },
  Z: { open: 0.2, wide: 0.8, round: 0, teeth: 0.9, tongue: 0, press: 0 },
  SH: { open: 0.3, wide: 0.2, round: 0.7, teeth: 0.6, tongue: 0, press: 0 },
  ZH: { open: 0.3, wide: 0.2, round: 0.7, teeth: 0.6, tongue: 0, press: 0 },
  CH: { open: 0.3, wide: 0.3, round: 0.6, teeth: 0.7, tongue: 0, press: 0 },
  JH: { open: 0.3, wide: 0.3, round: 0.6, teeth: 0.7, tongue: 0, press: 0 },
  T: { open: 0.25, wide: 0.6, round: 0, teeth: 0.8, tongue: 0.3, press: 0 },
  D: { open: 0.28, wide: 0.6, round: 0, teeth: 0.7, tongue: 0.3, press: 0 },
  N: { open: 0.22, wide: 0.5, round: 0, teeth: 0.6, tongue: 0.3, press: 0 },
  K: { open: 0.35, wide: 0.5, round: 0.1, teeth: 0.4, tongue: 0, press: 0 },
  G: { open: 0.35, wide: 0.5, round: 0.1, teeth: 0.4, tongue: 0, press: 0 },
  NG: { open: 0.3, wide: 0.5, round: 0.1, teeth: 0.4, tongue: 0, press: 0 },
  HH: { open: 0.45, wide: 0.5, round: 0.1, teeth: 0.2, tongue: 0, press: 0 },
  Y: { open: 0.3, wide: 0.9, round: 0, teeth: 0.7, tongue: 0, press: 0 },
};

const target = (p: string): Mouth => VISEME[p.replace(/\d/g, "").toUpperCase()] ?? VISEME.AH;

/** Phone active at time t (seconds), or null in a pause. */
const phoneAt = (data: LipsyncData, t: number): Phone | null => {
  for (const line of data.lines) {
    for (const w of line.words) {
      if (t < w.start - 0.02 || t > w.end + 0.02) continue;
      for (const ph of w.phones) if (t >= ph.start && t < ph.end) return ph;
      // inside a word but between phones: nearest phone
      let best: Phone | null = null;
      let d = Infinity;
      for (const ph of w.phones) {
        const dd = t < ph.start ? ph.start - t : t - ph.end;
        if (dd < d) {
          d = dd;
          best = ph;
        }
      }
      if (best && d < 0.03) return best;
    }
  }
  return null;
};

/** Audio envelope (0..1) at frame, lightly smoothed. */
export const envAt = (data: LipsyncData, frame: number): number => {
  const e = data.env;
  const i = Math.max(0, Math.min(e.length - 1, Math.round(frame)));
  const a = e[Math.max(0, i - 1)] ?? 0;
  const b = e[i] ?? 0;
  const c = e[Math.min(e.length - 1, i + 1)] ?? 0;
  return a * 0.25 + b * 0.5 + c * 0.25;
};

/** True while narration is audible around the frame (for head/brow micro-motion). */
export const speakingAt = (data: LipsyncData, frame: number): boolean => phoneAt(data, (frame + 0.5) / data.fps) !== null;

/**
 * Mouth parameters at a video frame: viseme targets sampled over a ±45 ms
 * window (soft transitions), jaw scaled by the audio envelope, closed in
 * pauses. Deterministic.
 */
export const mouthAt = (data: LipsyncData, frame: number): Mouth => {
  const t = (frame + 0.5) / data.fps;
  const samples = [-0.045, -0.025, 0, 0.025, 0.045];
  const weights = [0.12, 0.22, 0.32, 0.22, 0.12];
  const acc: Mouth = { ...CLOSED };
  let any = false;
  samples.forEach((dt, i) => {
    const ph = phoneAt(data, t + dt);
    const m = ph ? target(ph.p) : CLOSED;
    if (ph) any = true;
    for (const k of Object.keys(acc) as (keyof Mouth)[]) acc[k] += m[k] * weights[i];
  });
  if (!any) return CLOSED;
  const env = envAt(data, frame);
  const jaw = Math.min(1, acc.open * (0.5 + 0.7 * Math.min(1, env * 1.4)));
  return { ...acc, open: jaw };
};
