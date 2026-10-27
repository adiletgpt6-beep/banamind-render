// LineMorphEngine — turns one contour into another.
//
// Both contours are resampled to the same number of points by arc length
// (so any two paths are compatible, whatever their commands), optionally
// aligned (start point / direction), then interpolated point-by-point and
// re-smoothed into a Bézier path. Used for: horizon → planet curve,
// sun rim → crescent, ornament → logo → the final small stroke.

import { lerp, smoothPath, type Vec } from "../utils/geometry.ts";
import { pointAt, samplePath } from "./PathSampler.ts";

const resampleCache = new Map<string, Vec[]>();

/** `n` points evenly spaced by arc length (n ≥ 2). */
export const resample = (d: string, n = 96): Vec[] => {
  const key = `${n}|${d}`;
  const hit = resampleCache.get(key);
  if (hit) return hit;
  const s = samplePath(d);
  const out = Array.from({ length: n }, (_, i) => pointAt(s, (s.length * i) / (n - 1)).p);
  if (resampleCache.size > 2000) resampleCache.clear();
  resampleCache.set(key, out);
  return out;
};

export const morphPoints = (a: Vec[], b: Vec[], t: number): Vec[] =>
  a.map((p, i) => ({ x: lerp(p.x, b[i].x, t), y: lerp(p.y, b[i].y, t) }));

/**
 * Interpolates between two paths. `t` is usually already eased.
 * With `wave` the in-between contour bends like a living string
 * (a sine displacement that vanishes at t = 0 and t = 1).
 */
export const morphPath = (
  from: string,
  to: string,
  t: number,
  opts: { n?: number; wave?: number; closed?: boolean } = {},
): string => {
  const n = opts.n ?? 96;
  if (t <= 0) return from;
  if (t >= 1) return to;
  const a = resample(from, n);
  const b = resample(to, n);
  let pts = morphPoints(a, b, t);
  if (opts.wave) {
    const amp = opts.wave * Math.sin(Math.PI * t);
    pts = pts.map((p, i) => {
      const q = pts[Math.min(n - 1, i + 1)];
      const r = pts[Math.max(0, i - 1)];
      const nx = -(q.y - r.y);
      const ny = q.x - r.x;
      const l = Math.hypot(nx, ny) || 1;
      const w = amp * Math.sin((i / (n - 1)) * Math.PI * 3 + t * 5);
      return { x: p.x + (nx / l) * w, y: p.y + (ny / l) * w };
    });
  }
  return smoothPath(pts, 1, opts.closed ?? false);
};

/** Points → smooth path (re-export for scenes that morph raw point lists). */
export const pointsToPath = (pts: Vec[], closed = false): string => smoothPath(pts, 1, closed);
