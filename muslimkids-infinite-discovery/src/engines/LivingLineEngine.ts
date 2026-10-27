// LivingLineEngine — the golden guide line.
//
// A program is a list of timed segments. "stroke" draws a shape progressively in some
// reference frame (it stays drawn until its fade window), "orbit" lets the head wander
// along a parametric curve, "travel" flies the head from wherever the previous segment
// ended to wherever the next one starts — so the head never teleports, even when the
// camera changes scale under it. The comet tail is the head's own recent history.
import { clamp, easeInOutCubic, lerp, smoothstep, Vec2 } from "./math";
import { pointAt, Poly, prefix } from "./ShapeMorphEngine";
import { frameAt, mapPoint, Ref, Frame } from "./SpaceMap";

export type Stroke = {
  kind: "stroke";
  t0: number; t1: number;
  ref: Ref;
  path: Poly | ((t: number) => Poly);
  /** visible until fade window [a,b] */
  keep: [number, number];
  width?: number;
  color?: string;
  ease?: (u: number) => number;
};
export type Orbit = {
  kind: "orbit";
  t0: number; t1: number;
  ref: Ref;
  at: (t: number) => Vec2; // position in ref frame
};
export type Travel = { kind: "travel"; t0: number; t1: number; bulge?: number };
export type Segment = Stroke | Orbit | Travel;

export const GOLD = "#F4C66A";

const strokePath = (s: Stroke, t: number) => (typeof s.path === "function" ? s.path(t) : s.path);

const startOf = (s: Segment, t: number, f: Frame): Vec2 | null => {
  if (s.kind === "stroke") return mapPoint(s.ref, strokePath(s, t)[0], f);
  if (s.kind === "orbit") return mapPoint(s.ref, s.at(s.t0), f);
  return null;
};
const endOf = (s: Segment, t: number, f: Frame): Vec2 | null => {
  if (s.kind === "stroke") { const p = strokePath(s, t); return mapPoint(s.ref, p[p.length - 1], f); }
  if (s.kind === "orbit") return mapPoint(s.ref, s.at(s.t1), f);
  return null;
};

export const makeLine = (segs: Segment[]) => {
  const head = (t: number): Vec2 => {
    const f = frameAt(t);
    let idx = segs.findIndex((s) => t >= s.t0 && t < s.t1);
    if (idx < 0) {
      // idle: rest at the end of the last finished segment
      let last = -1;
      segs.forEach((s, i) => { if (s.t1 <= t) last = i; });
      if (last < 0) return startOf(segs[0], t, f) ?? { x: 540, y: 960 };
      const s = segs[last];
      if (s.kind === "travel") idx = last; else return endOf(s, t, f)!;
    }
    const s = segs[idx];
    const u = clamp((t - s.t0) / (s.t1 - s.t0));
    if (s.kind === "stroke") {
      const e = (s.ease ?? easeInOutCubic)(u);
      return mapPoint(s.ref, pointAt(strokePath(s, t), e), f);
    }
    if (s.kind === "orbit") return mapPoint(s.ref, s.at(t), f);
    // travel
    const a = (idx > 0 ? endOf(segs[idx - 1], t, f) : null) ?? { x: 540, y: 960 };
    const b = (idx < segs.length - 1 ? startOf(segs[idx + 1], t, f) : null) ?? a;
    const e = easeInOutCubic(u);
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const bulge = Math.sin(Math.PI * e) * (s.bulge ?? 0.18) * Math.min(L, 600);
    return { x: lerp(a.x, b.x, e) - (dy / L) * bulge, y: lerp(a.y, b.y, e) + (dx / L) * bulge };
  };

  /** strokes visible at time t, already mapped to screen */
  const strokes = (t: number) => {
    const f = frameAt(t);
    const out: { pts: Vec2[]; alpha: number; width: number; color: string }[] = [];
    for (const s of segs) {
      if (s.kind !== "stroke" || t < s.t0 || t > s.keep[1]) continue;
      const u = clamp((t - s.t0) / (s.t1 - s.t0));
      const e = (s.ease ?? easeInOutCubic)(u);
      const pts = prefix(strokePath(s, t), e).map((p) => mapPoint(s.ref, p, f));
      out.push({ pts, alpha: 1 - smoothstep(s.keep[0], s.keep[1], t), width: s.width ?? 4, color: s.color ?? GOLD });
    }
    return out;
  };

  /** comet tail = recent head history */
  const tail = (t: number, n = 22, dur = 0.42) =>
    Array.from({ length: n }, (_, k) => head(Math.max(0, t - (k * dur) / (n - 1))));

  return { head, strokes, tail };
};
