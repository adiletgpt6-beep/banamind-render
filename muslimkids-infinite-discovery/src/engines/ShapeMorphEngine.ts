// ShapeMorphEngine — polyline geometry: resampling by arc length, morphing between
// shapes with equal sample counts, and generators for the shapes the line draws.
import { lerp, Vec2 } from "./math";

export type Poly = Vec2[];

export const polyLength = (p: Poly) => {
  let s = 0;
  for (let i = 1; i < p.length; i++) s += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
  return s;
};

/** Resample to n points evenly spaced along the curve. */
export const resample = (p: Poly, n: number): Poly => {
  const cum = [0];
  for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y));
  const L = cum[cum.length - 1] || 1;
  const out: Poly = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const s = (k / (n - 1)) * L;
    while (j < p.length - 1 && cum[j] < s) j++;
    const seg = cum[j] - cum[j - 1] || 1;
    const u = (s - cum[j - 1]) / seg;
    out.push({ x: lerp(p[j - 1].x, p[j].x, u), y: lerp(p[j - 1].y, p[j].y, u) });
  }
  return out;
};

/** Point at fraction u (0..1) of arc length. */
export const pointAt = (p: Poly, u: number): Vec2 => {
  if (p.length === 1) return p[0];
  const r = resample(p, 2 + Math.max(2, p.length));
  const idx = Math.min(r.length - 1.0001, Math.max(0, u * (r.length - 1)));
  const i = Math.floor(idx), f = idx - i;
  return { x: lerp(r[i].x, r[i + 1].x, f), y: lerp(r[i].y, r[i + 1].y, f) };
};

/** Prefix of the curve up to fraction u (exact cut, used for progressive drawing). */
export const prefix = (p: Poly, u: number): Poly => {
  if (u >= 1) return p;
  if (u <= 0) return [p[0]];
  const cum = [0];
  for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y));
  const s = u * cum[cum.length - 1];
  const out: Poly = [p[0]];
  for (let i = 1; i < p.length; i++) {
    if (cum[i] <= s) { out.push(p[i]); continue; }
    const f = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
    out.push({ x: lerp(p[i - 1].x, p[i].x, f), y: lerp(p[i - 1].y, p[i].y, f) });
    break;
  }
  return out;
};

export const morph = (a: Poly, b: Poly, t: number, n = 160): Poly => {
  const ra = resample(a, n), rb = resample(b, n);
  return ra.map((p, i) => ({ x: lerp(p.x, rb[i].x, t), y: lerp(p.y, rb[i].y, t) }));
};

export const circle = (c: Vec2, r: number, start = -Math.PI / 2, sweep = Math.PI * 2, n = 96): Poly =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = start + (sweep * i) / n;
    return { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r };
  });

export const roundedRect = (c: Vec2, w: number, h: number, r: number, n = 12): Poly => {
  const pts: Poly = [];
  const corners = [
    [c.x + w / 2 - r, c.y - h / 2 + r, -Math.PI / 2],
    [c.x + w / 2 - r, c.y + h / 2 - r, 0],
    [c.x - w / 2 + r, c.y + h / 2 - r, Math.PI / 2],
    [c.x - w / 2 + r, c.y - h / 2 + r, Math.PI],
  ];
  pts.push({ x: c.x, y: c.y - h / 2 });
  for (const [x, y, a0] of corners) for (let i = 0; i <= n; i++) {
    const a = a0 + (Math.PI / 2) * (i / n);
    pts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r });
  }
  pts.push({ x: c.x, y: c.y - h / 2 });
  return pts;
};

/** Sample an SVG-like path made of M/L/C commands (absolute) into a polyline. */
export const samplePath = (d: string, stepsPerCurve = 16): Poly => {
  const tok = d.match(/[MLC]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const out: Poly = [];
  let i = 0, cmd = "M", cur = { x: 0, y: 0 };
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[MLC]/.test(tok[i])) cmd = tok[i++];
    if (cmd === "M" || cmd === "L") {
      cur = { x: num(), y: num() };
      out.push(cur);
      if (cmd === "M") cmd = "L";
    } else if (cmd === "C") {
      const p1 = { x: num(), y: num() }, p2 = { x: num(), y: num() }, p3 = { x: num(), y: num() };
      for (let k = 1; k <= stepsPerCurve; k++) {
        const t = k / stepsPerCurve, mt = 1 - t;
        out.push({
          x: mt * mt * mt * cur.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
          y: mt * mt * mt * cur.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
        });
      }
      cur = p3;
    }
  }
  return out;
};

export const toPathD = (p: Poly) =>
  p.length ? "M" + p.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" L") : "";
