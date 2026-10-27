// Fast arc-length sampler for the M / L / C / Z paths produced by utils/geometry.
// Every path is flattened once (memoised) into a polyline with cumulative
// lengths, so the LivingLineEngine can ask "where is the tip after N px?"
// thousands of times per frame without re-parsing SVG.

import type { Vec } from "../utils/geometry.ts";

export type Sampled = {
  pts: Vec[];
  acc: number[]; // cumulative length at every point
  length: number;
};

const cache = new Map<string, Sampled>();

const tokenize = (d: string): (string | number)[] =>
  (d.match(/[MLCZmlcz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? []).map((t) =>
    /[MLCZmlcz]/.test(t) ? t : parseFloat(t),
  );

const cubic = (p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const e = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + e * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + e * p3.y,
  };
};

export const samplePath = (d: string): Sampled => {
  const hit = cache.get(d);
  if (hit) return hit;
  const toks = tokenize(d);
  const pts: Vec[] = [];
  let i = 0;
  let cmd = "M";
  let cur: Vec = { x: 0, y: 0 };
  let start: Vec = { x: 0, y: 0 };
  const num = () => toks[i++] as number;
  while (i < toks.length) {
    if (typeof toks[i] === "string") cmd = toks[i++] as string;
    if (cmd === "M") {
      cur = { x: num(), y: num() };
      start = cur;
      pts.push(cur);
      cmd = "L";
    } else if (cmd === "L") {
      cur = { x: num(), y: num() };
      pts.push(cur);
    } else if (cmd === "C") {
      const p1 = { x: num(), y: num() };
      const p2 = { x: num(), y: num() };
      const p3 = { x: num(), y: num() };
      const approx =
        Math.hypot(p1.x - cur.x, p1.y - cur.y) +
        Math.hypot(p2.x - p1.x, p2.y - p1.y) +
        Math.hypot(p3.x - p2.x, p3.y - p2.y);
      const n = Math.max(4, Math.min(64, Math.ceil(approx / 3)));
      for (let k = 1; k <= n; k++) pts.push(cubic(cur, p1, p2, p3, k / n));
      cur = p3;
    } else if (cmd === "Z" || cmd === "z") {
      pts.push(start);
      cur = start;
    } else {
      throw new Error(`PathSampler: unsupported command ${cmd} in ${d.slice(0, 60)}`);
    }
  }
  const acc = [0];
  for (let k = 1; k < pts.length; k++) {
    acc.push(acc[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
  }
  const s = { pts, acc, length: acc[acc.length - 1] };
  if (cache.size > 4000) cache.clear();
  cache.set(d, s);
  return s;
};

/** Point and unit tangent at arc length `l` (clamped). */
export const pointAt = (s: Sampled, l: number): { p: Vec; t: Vec } => {
  const { pts, acc, length } = s;
  if (pts.length === 1) return { p: pts[0], t: { x: 1, y: 0 } };
  const L = Math.min(Math.max(l, 0), length);
  let lo = 0;
  let hi = acc.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (acc[mid] <= L) lo = mid;
    else hi = mid;
  }
  const seg = acc[hi] - acc[lo] || 1;
  const k = (L - acc[lo]) / seg;
  const a = pts[lo];
  const b = pts[hi];
  const tl = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return {
    p: { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k },
    t: { x: (b.x - a.x) / tl, y: (b.y - a.y) / tl },
  };
};

export const pathStart = (d: string): Vec => samplePath(d).pts[0];
export const pathEnd = (d: string): Vec => {
  const s = samplePath(d);
  return s.pts[s.pts.length - 1];
};
export const pathEndTangent = (d: string): Vec => pointAt(samplePath(d), samplePath(d).length).t;
export const pathStartTangent = (d: string): Vec => pointAt(samplePath(d), 0).t;
