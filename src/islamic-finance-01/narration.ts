// Narration manifest types and pure helpers (no Remotion imports, so Node
// scripts and tests can use them). Actual speech timings are produced by
// scripts/generate-if01-voice.mjs; visuals and captions read from them so key
// moments ("$22,000", "installments", "murabaha") land on the spoken word.
import { IF01_LINES, IF01_VIDEO, type If01Line } from "./script.ts";

export type If01Word = { readonly text: string; readonly start: number; readonly end: number };

export type If01ManifestLine = {
  readonly id: string;
  readonly text: string;
  readonly start: number;
  readonly end: number;
  readonly words: readonly If01Word[];
};

export type If01Manifest = {
  readonly version: 1;
  readonly provider: string;
  readonly draft: boolean;
  readonly voice?: string;
  readonly file: string | null;
  readonly durationSec: number;
  readonly lines: readonly If01ManifestLine[];
};

const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9'-]/g, "");

// Estimated timings from the planned start of each line and 150 words/min —
// used in Studio before the voice exists.
export const estimateIf01Manifest = (): If01Manifest => ({
  version: 1,
  provider: "estimate",
  draft: true,
  file: null,
  durationSec: IF01_VIDEO.durationSec,
  lines: IF01_LINES.map((l: If01Line) => {
    const words = l.text.split(/\s+/).filter(Boolean);
    const weights = words.map((w) => clean(w).length + 1.5);
    const total = weights.reduce((a, b) => a + b, 0);
    const dur = Math.min(l.endBy - l.at, words.length * 0.4);
    let t = l.at;
    const out = words.map((w, i) => {
      const d = (dur * weights[i]) / total;
      const word = { text: w, start: t, end: t + d };
      t += d;
      return word;
    });
    return { id: l.id, text: l.text, start: l.at, end: l.at + dur, words: out };
  }),
});

export const manifestLine = (m: If01Manifest, id: string): If01ManifestLine => {
  const line = m.lines.find((l) => l.id === id);
  if (!line) throw new Error(`Narration line ${id} missing from manifest`);
  return line;
};

/** Start time (seconds) of the first word in line `id` matching `word` (case-insensitive, punctuation ignored). */
export const wordStart = (m: If01Manifest, id: string, word: string, fallback: number): number => {
  const line = m.lines.find((l) => l.id === id);
  const w = line?.words.find((x) => clean(x.text) === clean(word));
  return w ? w.start : fallback;
};

export const wordEnd = (m: If01Manifest, id: string, word: string, fallback: number): number => {
  const line = m.lines.find((l) => l.id === id);
  const w = line?.words.find((x) => clean(x.text) === clean(word));
  return w ? w.end : fallback;
};

/** Speech intervals [start, end] in seconds, for ducking the music. */
export const speechSpans = (m: If01Manifest): [number, number][] =>
  m.lines.map((l) => [l.start, l.end]);
