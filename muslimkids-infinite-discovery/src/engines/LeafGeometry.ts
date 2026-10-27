// Shared leaf geometry (same shape at every scale: tree crown sprites, the hero leaf, the margin).
// Local frame: a ∈ [-450, 450] along the midrib (base → tip), b across (right side positive).
import { Vec2 } from "./math";

export const LEAF_LEN = 900;
/** half-width profile of an ovate leaf with an acuminate tip */
export const halfWidth = (a: number) => {
  const u = (a + 450) / 900; // 0 base → 1 tip
  if (u <= 0 || u >= 1) return 0;
  const body = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.85)), 0.8);
  const tip = 1 - Math.pow(Math.max(0, u - 0.7) / 0.3, 1.6) * 0.35;
  return 305 * body * tip;
};

/** outline polygon (local frame) with fine serration on the margin */
export const leafOutline = (n = 140, serr = 5): Vec2[] => {
  const right: Vec2[] = [], left: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = -450 + (900 * i) / n;
    const tooth = serr * (i % 2 === 0 ? 1 : -0.3) * (i > 4 && i < n - 3 ? 1 : 0);
    const w = halfWidth(a);
    right.push({ x: a, y: w + (w > 4 ? tooth : 0) });
    left.push({ x: a, y: -w - (w > 4 ? tooth : 0) });
  }
  return [...right, ...left.reverse()];
};

/** Secondary veins: pairs at 40° to the midrib, straight near the midrib, curving to the tip. */
export const SECONDARY_A0 = Array.from({ length: 8 }, (_, i) => -89.4 + 95 * (i - 3)); // includes -89.4 (drop vein)
export const secondaryVein = (a0: number, side: 1 | -1, steps = 24): Vec2[] => {
  const dirA = 0.769, dirB = 0.642; // cos/sin 40°
  const pts: Vec2[] = [];
  let a = a0, b = 0;
  for (let k = 0; k <= steps; k++) {
    pts.push({ x: a, y: side * b });
    const w = halfWidth(a);
    if (b > w * 0.86 || w <= 0) break;
    const bend = Math.max(0, (b - 120) / 160); // straight first, then curls toward the tip
    const da = dirA + bend * 0.5, db = dirB * Math.max(0.15, 1 - bend * 0.8);
    const l = Math.hypot(da, db);
    a += (da / l) * 16; b += (db / l) * 16;
  }
  return pts;
};

/** leaf local → world: axis u (tip direction) and v (right side) */
export const LEAF_U: Vec2 = { x: -0.42, y: -0.91 };
export const LEAF_V: Vec2 = { x: 0.91, y: -0.42 };
export const leafToWorld = (p: Vec2, c: Vec2 = { x: 0, y: 0 }, s = 1, u = LEAF_U, v = LEAF_V): Vec2 => ({
  x: c.x + (p.x * u.x + p.y * v.x) * s,
  y: c.y + (p.x * u.y + p.y * v.y) * s,
});
