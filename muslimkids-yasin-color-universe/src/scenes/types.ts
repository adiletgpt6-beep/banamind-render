import type { Keyframe } from "../engines/DotMorphEngine";

export type Span = string | { t: string; c: string };
export type TextItem = {
  from: number;
  to: number;
  y: number;
  x?: number;
  size: number;
  weight?: number;
  font?: "manrope" | "unbounded" | "amiri";
  color: string;
  spans: Span[];
  anim?: "words" | "rise" | "fade" | "scale";
  align?: "center" | "left";
  letterSpacing?: number;
  lineHeight?: number;
  dir?: "rtl";
};

export type Cue = { at: number; kind: "whoosh" | "chime" | "rain" | "rustle" | "sparkle"; dur?: number; gain?: number };

export type Scene = { id: string; title: string; from: number; to: number; keyframes: Keyframe[]; texts: TextItem[]; cues?: Cue[] };

export const NAVY = "#14143A";
export const WHITE = "#FFFFFF";
export const MUTED_DARK = "#C3CBFF";
export const MUTED_LIGHT = "#5A5F8C";
export const C = {
  cyan: "#00E5FF", pink: "#FF2D9A", yellow: "#FFD600", green: "#39F77D", orange: "#FF8A00",
  purple: "#A855F7", blue: "#238BFF", coral: "#FF586B", turquoise: "#00E5C3", lime: "#BBFF33", lilac: "#C77DFF", sky: "#5CC8FF",
};

/** Подпись с номерами аятов — под заголовком, одинаково во всех сценах. */
export const ayahCaption = (from: number, to: number, text: string, dark = true): TextItem => ({
  from, to, y: 385, size: 34, weight: 600, font: "manrope", color: dark ? MUTED_DARK : MUTED_LIGHT, spans: [text], anim: "fade",
});

export const heading = (from: number, to: number, spans: Span[], color: string, size = 72, y = 300): TextItem => ({
  from, to, y, size, weight: 800, font: "unbounded", color, spans, anim: "rise", letterSpacing: 1,
});
