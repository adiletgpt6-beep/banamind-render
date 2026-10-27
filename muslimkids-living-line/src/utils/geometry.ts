// Vector geometry helpers shared by every engine.
// All shapes are built as plain point lists or SVG path strings in WORLD
// coordinates; the CameraController maps the world to the 1080×1920 screen.

export type Vec = { x: number; y: number };

export const v = (x: number, y: number): Vec => ({ x, y });
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
export const len = (a: Vec): number => Math.hypot(a.x, a.y);
export const dist = (a: Vec, b: Vec): number => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const lerpV = (a: Vec, b: Vec, t: number): Vec => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});
export const norm = (a: Vec): Vec => {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
};
export const rotate = (a: Vec, ang: number, o: Vec = { x: 0, y: 0 }): Vec => {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const dx = a.x - o.x;
  const dy = a.y - o.y;
  return { x: o.x + dx * c - dy * s, y: o.y + dx * s + dy * c };
};
export const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));
export const deg = (d: number): number => (d * Math.PI) / 180;

const f = (n: number): string => (Math.round(n * 100) / 100).toString();

/** Point on a circle. Angle 0 = right, angles grow clockwise (SVG y-down). */
export const polar = (c: Vec, r: number, ang: number): Vec => ({
  x: c.x + r * Math.cos(ang),
  y: c.y + r * Math.sin(ang),
});

/**
 * Circular arc as cubic Béziers (exact enough for getPointAtLength and
 * morphing). `sweep` may be negative (counter-clockwise) and > 2π.
 */
export const arcPath = (
  c: Vec,
  r: number,
  start: number,
  sweep: number,
  moveTo = true,
): string => {
  const n = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2)));
  const step = sweep / n;
  const k = (4 / 3) * Math.tan(step / 4);
  const p0 = polar(c, r, start);
  let d = moveTo ? `M ${f(p0.x)} ${f(p0.y)}` : "";
  for (let i = 0; i < n; i++) {
    const a0 = start + step * i;
    const a1 = a0 + step;
    const s = polar(c, r, a0);
    const e = polar(c, r, a1);
    const c1 = { x: s.x - k * r * Math.sin(a0), y: s.y + k * r * Math.cos(a0) };
    const c2 = { x: e.x + k * r * Math.sin(a1), y: e.y - k * r * Math.cos(a1) };
    d += ` C ${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(e.x)} ${f(e.y)}`;
  }
  return d;
};

/** Arc sampled as points (useful for morph sources). */
export const arcPoints = (c: Vec, r: number, start: number, sweep: number, n = 48): Vec[] =>
  Array.from({ length: n + 1 }, (_, i) => polar(c, r, start + (sweep * i) / n));

/** Polyline path. */
export const linePath = (pts: Vec[]): string =>
  pts.map((p, i) => `${i ? "L" : "M"} ${f(p.x)} ${f(p.y)}`).join(" ");

/**
 * Smooth path through points (centripetal-ish Catmull-Rom → cubic Bézier).
 * `tension` 0..1: 1 = classic Catmull-Rom, smaller = tighter.
 */
export const smoothPath = (pts: Vec[], tension = 1, closed = false, moveTo = true): string => {
  if (pts.length < 2) return "";
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = moveTo ? `M ${f(pts[0].x)} ${f(pts[0].y)}` : "";
  const segs = closed ? pts.length : pts.length - 1;
  for (let i = 1; i <= segs; i++) {
    const p0 = P[i - 1];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[i + 2];
    const t = tension / 6;
    const c1 = { x: p1.x + (p2.x - p0.x) * t, y: p1.y + (p2.y - p0.y) * t };
    const c2 = { x: p2.x - (p3.x - p1.x) * t, y: p2.y - (p3.y - p1.y) * t };
    d += ` C ${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
};

/** Cubic Bézier "travel" curve between two points with given exit/enter tangents. */
export const travelPath = (a: Vec, b: Vec, outDir: Vec, inDir: Vec, k = 0.4): string => {
  const d = dist(a, b) * k;
  const c1 = add(a, scale(norm(outDir), d));
  const c2 = sub(b, scale(norm(inDir), d));
  return `M ${f(a.x)} ${f(a.y)} C ${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(b.x)} ${f(b.y)}`;
};

/** Translate every coordinate of a points list. */
export const offsetPts = (pts: Vec[], o: Vec): Vec[] => pts.map((p) => add(p, o));

/** Deterministic pseudo random in [0,1) from an integer seed. */
export const rand = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

/** Intersections of two circles (empty if none). */
export const circleIntersections = (c0: Vec, r0: number, c1: Vec, r1: number): Vec[] => {
  const d = dist(c0, c1);
  if (d > r0 + r1 || d < Math.abs(r0 - r1) || d === 0) return [];
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
  const m = { x: c0.x + (a * (c1.x - c0.x)) / d, y: c0.y + (a * (c1.y - c0.y)) / d };
  return [
    { x: m.x + (h * (c1.y - c0.y)) / d, y: m.y - (h * (c1.x - c0.x)) / d },
    { x: m.x - (h * (c1.y - c0.y)) / d, y: m.y + (h * (c1.x - c0.x)) / d },
  ];
};

/** Angle of point p seen from centre c. */
export const angleOf = (c: Vec, p: Vec): number => Math.atan2(p.y - c.y, p.x - c.x);

/** Shortest signed angular difference b - a in (-π, π]. */
export const angleDiff = (a: number, b: number): number => {
  let d = b - a;
  while (d <= -Math.PI) d += 2 * Math.PI;
  while (d > Math.PI) d -= 2 * Math.PI;
  return d;
};

/** Four-pointed sparkle outline around c (closed, starts at the top point). */
export const sparklePoints = (c: Vec, r: number, inner = 0.28): Vec[] => {
  const pts: Vec[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 4;
    const rr = i % 2 === 0 ? r : r * inner;
    pts.push(polar(c, rr, a));
  }
  return pts;
};

/** Concatenate paths: drops the leading "M x y" of every path after the first. */
export const joinPaths = (...ds: string[]): string =>
  ds.map((d, i) => (i === 0 ? d : d.replace(/^M\s*[-\d.e]+\s+[-\d.e]+/, ""))).join(" ");
