// LivingLineEngine — the heart of THE LIVING LINE.
//
// A film is ONE continuous journey of a golden line. The journey is a list
// of strokes; every "main"/"travel" stroke starts exactly where the previous
// one ended (validated by `validateJourney`), so the bright tip never
// teleports. The engine answers, for any frame:
//   • which part of each stroke is visible (drawn head / retracting tail),
//   • where the tip is, where it points, how fast it moves,
//   • what colour / width the line has there.
// It is pure TypeScript (no React), so QA scripts can scan all frames.

import { Easing } from "remotion";
import { clamp, dist, lerp, type Vec } from "../utils/geometry.ts";
import { pathEnd, pathStart, pointAt, samplePath } from "./PathSampler.ts";
import type { EaseFn } from "./CameraController.ts";

export type StrokeKind =
  | "main" // drawn by the tip, stays as a contour
  | "travel" // drawn by the tip, tail follows the tip (no clutter left)
  | "branch"; // auxiliary contour growing from the main line (tree branches…)

export type Frameish<T> = T | ((f: number) => T);

export type Stroke = {
  id: string;
  d: Frameish<string>; // world-space path (a function = live morph)
  from: number;
  to: number;
  kind?: StrokeKind;
  ease?: EaseFn;
  color?: Frameish<string>;
  width?: number; // screen px at the zoom the stroke was drawn at
  glow?: number; // 0..1
  trail?: number; // travel: visible tail length in world units
  tailDelay?: number; // travel: frames the tail waits after arrival
  opacity?: Frameish<number>;
  clip?: string; // clipPath id (world space)
  mask?: string; // mask id (world space)
  layer?: "back" | "mid" | "front";
  nativeZoom?: number; // filled in by prepareJourney
};

export const ease = {
  draw: Easing.bezier(0.55, 0.05, 0.3, 1) as EaseFn, // artist's hand: accelerate, settle
  flow: Easing.bezier(0.33, 0, 0.67, 1) as EaseFn,
  glide: Easing.bezier(0.25, 0.1, 0.25, 1) as EaseFn,
  linear: ((t: number) => t) as EaseFn,
  rush: Easing.bezier(0.7, 0, 0.3, 1) as EaseFn,
};

export const at = <T>(v: Frameish<T>, f: number): T =>
  typeof v === "function" ? (v as (f: number) => T)(f) : v;

const isTipStroke = (s: Stroke) => (s.kind ?? "main") !== "branch";

/** Drawn fraction 0..1 of a stroke at frame f. */
export const strokeProgress = (s: Stroke, f: number): number => {
  if (f <= s.from) return 0;
  if (f >= s.to) return 1;
  return (s.ease ?? ease.draw)((f - s.from) / (s.to - s.from));
};

export const TAIL_FRAMES = 14;

/** Visible [start, end] arc length of a stroke at frame f (null = nothing). */
export const visibleRange = (s: Stroke, f: number): [number, number] | null => {
  if (f < s.from) return null;
  const smp = samplePath(at(s.d, f));
  const head = strokeProgress(s, f) * smp.length;
  if (s.kind !== "travel") return head > 0.01 ? [0, head] : null;
  const trail = s.trail ?? 120;
  let tail = Math.max(0, head - trail);
  if (f > s.to) {
    // After arrival the tail catches up with the end point.
    const k = Easing.inOut(Easing.quad)(clamp((f - s.to - (s.tailDelay ?? 0)) / TAIL_FRAMES));
    tail = lerp(Math.max(0, smp.length - trail), smp.length, k);
  }
  return head - tail > 0.01 ? [tail, head] : null;
};

export type TipState = {
  p: Vec; // world position
  dir: Vec; // unit direction of travel
  speed: number; // 0..1 (normalised drawing speed)
  stroke: Stroke | null;
  color: string;
  width: number;
  idle: boolean;
};

/** The main tip at frame f: on the active stroke, or resting at the last end. */
export const tipAt = (journey: Stroke[], f: number): TipState => {
  const chain = journey.filter(isTipStroke);
  let active: Stroke | null = null;
  for (const s of chain) if (s.from <= f && f <= s.to) active = s;
  let idle = false;
  if (!active) {
    idle = true;
    const done = chain.filter((s) => s.to < f);
    active = done.length ? done[done.length - 1] : chain[0];
  }
  const d = at(active.d, f);
  const smp = samplePath(d);
  const pr = idle ? (f < chain[0].from ? 0 : 1) : strokeProgress(active, f);
  const { p, t } = pointAt(smp, pr * smp.length);
  let speed = 0;
  if (!idle) {
    const e = active.ease ?? ease.draw;
    const span = active.to - active.from;
    const x = clamp((f - active.from) / span);
    const dv = (e(clamp(x + 0.01)) - e(clamp(x - 0.01))) / 0.02; // d(progress)/dx
    speed = clamp((dv * smp.length) / span / 30);
  }
  return {
    p,
    dir: t,
    speed,
    stroke: active,
    color: at(active.color ?? "#F8C96A", f),
    width: active.width ?? 6,
    idle,
  };
};

/**
 * Records the camera zoom at which each stroke is finished, so later the
 * line keeps a consistent, gently scaling thickness on screen.
 */
export const prepareJourney = (journey: Stroke[], zoomAt: (f: number) => number): Stroke[] =>
  journey.map((s) => ({ ...s, nativeZoom: s.nativeZoom ?? zoomAt(s.to) }));

/** On-screen width → world units for the current zoom (soft scaling). */
export const worldWidth = (s: Stroke, zoom: number): number => {
  const base = s.width ?? 6;
  const native = s.nativeZoom ?? zoom;
  const k = clamp(Math.pow(zoom / native, 0.55), 0.35, 1.5);
  return (base * k) / zoom;
};

/**
 * Continuity check: every tip stroke must start where the previous tip
 * stroke ended (measured at the moment of hand-over).
 */
export const validateJourney = (journey: Stroke[], tolerance = 0.75): string[] => {
  const chain = journey.filter(isTipStroke);
  const problems: string[] = [];
  for (let i = 1; i < chain.length; i++) {
    const a = chain[i - 1];
    const b = chain[i];
    const end = pathEnd(at(a.d, b.from));
    const start = pathStart(at(b.d, b.from));
    const gap = dist(end, start);
    if (gap > tolerance) problems.push(`${a.id} → ${b.id}: gap ${gap.toFixed(2)}`);
    if (b.from < a.to) problems.push(`${a.id} → ${b.id}: overlap ${a.to - b.from} frames`);
  }
  return problems;
};
