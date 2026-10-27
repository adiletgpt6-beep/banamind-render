// Каталог точечных форм. Каждая функция возвращает части (PartSpec[]):
// маску силуэта, плотность (шаг сетки), градиент и характер движения.
import { PartSpec, ShapeSpec } from "../engines/ShapeSamplingEngine";
import { hash01 } from "../engines/rng";
import * as d from "./draw";

export const SP = 10; // базовый шаг точек, px
const RM = 1.12; // базовый радиус = шаг × 0.36 × RM

export const shape = (name: string, ...parts: PartSpec[][]): ShapeSpec => ({ name, parts: parts.flat() });

export const seed = (): PartSpec[] => [{ points: [[540, 960]], r: 10, grad: "seeds", map: "const", u0: 0, noise: 0 }];

export const seeds5 = (): PartSpec[] => {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
    pts.push([540 + Math.cos(a) * 78, 960 + Math.sin(a) * 78]);
  }
  return [{ points: pts, r: 10, grad: "seeds", map: "index", noise: 0 }];
};

export const swirl = (): PartSpec[] => {
  const pts: Array<[number, number]> = [];
  for (let arm = 0; arm < 5; arm++) {
    for (let k = 0; k < 170; k++) {
      const s = k / 170;
      const a = (arm / 5) * Math.PI * 2 + s * 3.3;
      const rad = 30 + s * 400 + (hash01(arm * 1000 + k, 3) - 0.5) * 40 * s;
      pts.push([540 + Math.cos(a) * rad, 960 + Math.sin(a) * rad * 1.05]);
    }
  }
  return [{ points: pts, r: 4.6, rJitter: 0.35, grad: "rainbow", map: "angle", noise: 0.04, motion: { type: "rotate", cx: 540, cy: 960, speed: 0.35 }, shimmer: 0.05 }];
};

export const question = (cx: number, cy: number, size: number, grad: string): PartSpec[] => [
  { draw: (c) => d.glyph(c, "?", cx, cy, size), spacing: SP, rMul: RM, grad, map: "y", noise: 0.05, shimmer: 0.04 },
];

export const ribbons = (top: number[], bottom: number[], width = 22, full = false): PartSpec[] => {
  const grads = ["ribbonA", "ribbonB", "ribbonC"];
  const out: PartSpec[] = [];
  [...top, ...bottom].forEach((y, i) => {
    const g = full ? "rainbow" : grads[i % 3];
    out.push({
      draw: (c) => d.waveBand(c, 70, 1010, y, 26, 1.6, i * 1.1 + (i >= top.length ? Math.PI : 0), width),
      spacing: 9.5, rMul: RM, grad: g, map: "x", u0: full ? (i * 0.17) % 1 : 0, u1: full ? ((i * 0.17) % 1) + 0.6 : 1, shimmer: 0.07,
    });
  });
  return out;
};

export const digits = (text: string, grad: string, cx = 540, cy = 1000, size = 700): PartSpec[] => [
  { draw: (c) => d.glyph(c, text, cx, cy, size), spacing: 9.5, rMul: RM, grad, map: "diag", noise: 0.08, shimmer: 0.04 },
];

/** РОВНО 83 точки: 8 рядов по 10 + 3. */
export const GRID83 = (() => {
  const pts: Array<[number, number]> = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 10; c++) pts.push([540 + (c - 4.5) * 78, 700 + r * 78]);
  for (let c = 0; c < 3; c++) pts.push([540 + (c - 1) * 78, 700 + 8 * 78]);
  return pts;
})();

export const grid83 = (): PartSpec[] => [
  { points: GRID83, r: 17, rJitter: 0, grad: "gridRainbow", map: "index", noise: 0, shimmer: 0.02, motion: { type: "sweep", period: 1.9, width: 0.07, delay: 11.3 } },
];

export const bookParts = (cx: number, cy: number, w: number, h: number, grad: string, spacing = 9.5): PartSpec[] => [
  { draw: (c) => d.book(c, cx, cy, w, h), spacing, rMul: RM, grad, map: "x", noise: 0.06, shimmer: 0.05 },
];

export const heartParts = (cx: number, cy: number, w: number, spacing = SP): PartSpec[] => [
  { draw: (c) => d.heart(c, cx, cy, w), spacing, rMul: RM, grad: "heart", map: "y", shimmer: 0.05, motion: { type: "pulse", amp: 0.1, speed: 3.2 } },
];

export const printGrads = ["printA", "printB", "printC", "printD", "printE", "printF"];
export type Print = [number, number, number, number, number]; // x, y, h, angle, mirror
export const printsParts = (prints: Print[], spacing = 9, gradOffset = 0): PartSpec[] =>
  prints.map(([x, y, h, a, m], i) => ({
    draw: (c) => d.footprint(c, x, y, h, a, m),
    spacing, rMul: RM, grad: printGrads[(i + gradOffset) % printGrads.length], map: "y" as const, shimmer: 0.04,
  }));

export const groundParts = (cx: number, topY: number, w: number, h: number, dry: boolean, spacing = SP): PartSpec[] => [
  { draw: (c) => d.groundBand(c, cx, topY, w, h, dry), spacing, rMul: RM, grad: dry ? "ground" : "groundGreen", map: dry ? "noise" : "y", noise: 0.12, shimmer: 0.03 },
];

export const rainParts = (drops: Array<[number, number]>, s = 1): PartSpec[] =>
  drops.map(([x, y], i) => ({
    draw: (c) => d.raindrop(c, x, y, s),
    spacing: 8.5, rMul: RM, grad: "rain", map: "y" as const,
    motion: { type: "fall" as const, dist: 240, speed: 210, phase: hash01(i, 77) },
  }));

export const sproutParts = (cx: number, groundY: number, s: number, big = false): PartSpec[] => [
  { draw: (c) => d.sproutShape(c, cx, groundY, s, big), spacing: 9, rMul: RM, grad: "leaves", map: "y", u0: 0.9, u1: 0.1, shimmer: 0.05 },
];

export const wheatParts = (x: number, baseY: number, s: number, lean: number): PartSpec[] => [
  { draw: (c) => d.wheatEar(c, x, baseY, s, lean), spacing: 8.5, rMul: RM, grad: "grain", map: "y", shimmer: 0.04 },
];

export const palmParts = (cx: number, baseY: number, s: number, spacing = 9): PartSpec[] => {
  const top: [number, number] = [cx - 18 * s, baseY - 540 * s];
  return [
    { draw: (c) => { d.palmTrunk(c, cx, baseY, s); }, spacing, rMul: RM, grad: "trunk", map: "y", shimmer: 0.03 },
    { draw: (c) => d.palmCrown(c, top[0], top[1], s), spacing: spacing * 0.82, rMul: RM * 1.05, grad: "leaves", map: "radial", shimmer: 0.05 },
    { draw: (c) => d.palmDates(c, top[0], top[1] + 20 * s, s), spacing: spacing * 0.9, rMul: RM, grad: "dates", map: "noise", shimmer: 0.05 },
  ];
};

export const grapesParts = (cx: number, topY: number, s: number, spacing = 9): PartSpec[] => {
  const berries = d.grapeBerries(cx, topY, s);
  const which = (x: number, y: number) => {
    let best = 0, bd = Infinity;
    berries.forEach(([bx, by], i) => {
      const q = (bx - x) ** 2 + (by - y) ** 2;
      if (q < bd) { bd = q; best = i; }
    });
    return best;
  };
  return [
    {
      draw: (c) => berries.forEach(([x, y, r]) => d.circle(c, x, y, r)),
      spacing, rMul: RM, grad: "grapes",
      // каждая ягода — свой оттенок, внутри ягоды лёгкий блик (радиальный сдвиг)
      map: (x, y) => {
        const i = which(x, y);
        const [bx, by, r] = berries[i];
        return hash01(i, 21) * 0.85 + (Math.hypot(x - bx + r * 0.3, y - by + r * 0.3) / r) * 0.15;
      },
      noise: 0.02, shimmer: 0.03,
    },
    { draw: (c) => d.grapeLeafStem(c, cx, topY, s), spacing, rMul: RM, grad: "leaves", map: "radial", shimmer: 0.04 },
  ];
};

export const sunParts = (cx: number, cy: number, R: number, spacing = SP, rotate = true): PartSpec[] => [
  {
    draw: (c) => d.sunShape(c, cx, cy, R), spacing, rMul: RM, grad: "sun", map: "radial", u0: 0, u1: 0.9, shimmer: 0.09,
    motion: rotate ? { type: "rotate", cx, cy, speed: 0.12 } : undefined,
  },
];

export const crescentParts = (cx: number, cy: number, R: number, spacing = SP): PartSpec[] => [
  { draw: (c) => d.crescent(c, cx, cy, R), spacing, rMul: RM, grad: "moon", map: "diag", shimmer: 0.05 },
];

export const phasesParts = (y: number, R: number): PartSpec[] =>
  [0, 0.25, 0.5, 0.75, 1].map((ph, i) => ({
    draw: (c: CanvasRenderingContext2D) => d.moonPhase(c, 156 + i * 192, y, R, ph),
    spacing: 8, rMul: RM, grad: "moon", map: "y" as const, u0: i * 0.18, u1: i * 0.18 + 0.4, alpha: ph === 0 ? 0.75 : 1, shimmer: 0.04,
  }));

export const starsParts = (seedN: number, n: number, y0 = 330, y1 = 1600, avoid?: (x: number, y: number) => boolean): PartSpec[] => [
  { points: d.starPoints(seedN, n, 40, y0, 1040, y1, avoid), r: 3.4, rJitter: 0.5, grad: "stars", map: "index", noise: 0.3, motion: { type: "twinkle", speed: 1.4 }, shimmer: 0.03 },
];

export const sunArcParts = (): PartSpec[] => {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 44; i++) {
    const t = i / 44, u = 1 - t;
    pts.push([u * u * 130 + 2 * u * t * 540 + t * t * 950, u * u * 1400 + 2 * u * t * 140 + t * t * 1400]);
  }
  return [{ points: pts, r: 4.2, rJitter: 0, grad: "sunset", map: "index", noise: 0, alpha: 0.9, shimmer: 0.04 }];
};

export type Orbit = { rx: number; ry: number; tilt: number; speed: number; phase: number; body: number; ring: string; bodyGrad: string };

export const orbitParts = (cx: number, cy: number, coreR: number, orbits: Orbit[]): PartSpec[] => {
  const parts: PartSpec[] = [
    { draw: (c) => d.circle(c, cx, cy, coreR), spacing: 8.5, rMul: RM, grad: "orbitCore", map: "radial", shimmer: 0.06, motion: { type: "rotate", cx, cy, speed: 0.15 } },
  ];
  orbits.forEach((o) => {
    parts.push({ points: d.ellipsePoints(cx, cy, o.rx, o.ry, o.tilt, 19), r: 3.4, rJitter: 0, grad: o.ring, map: "angle", noise: 0, alpha: 0.7, shimmer: 0.08 });
  });
  orbits.forEach((o) => {
    parts.push({
      draw: (c) => d.circle(c, cx, cy, o.body), spacing: 8, rMul: RM, grad: o.bodyGrad, map: "radial", shimmer: 0.05,
      motion: { type: "orbit", cx, cy, rx: o.rx, ry: o.ry, tilt: o.tilt, speed: o.speed, phase: o.phase, bx: cx, by: cy },
    });
  });
  return parts;
};

export const arcsParts = (cx: number, cy: number): PartSpec[] => [
  { points: d.ellipsePoints(cx, cy, 600, 600, 0, 22, Math.PI * 1.08, Math.PI * 1.42), r: 4, rJitter: 0, grad: "ring2", map: "index", noise: 0, alpha: 0.8 },
  { points: d.ellipsePoints(cx, cy, 640, 640, 0, 22, Math.PI * 1.58, Math.PI * 1.92), r: 4, rJitter: 0, grad: "ring3", map: "index", noise: 0, alpha: 0.8 },
  { points: d.ellipsePoints(cx, cy, 600, 600, 0, 22, Math.PI * 0.08, Math.PI * 0.42), r: 4, rJitter: 0, grad: "ring1", map: "index", noise: 0, alpha: 0.8 },
  { points: d.ellipsePoints(cx, cy, 640, 640, 0, 22, Math.PI * 0.58, Math.PI * 0.92), r: 4, rJitter: 0, grad: "ring2", map: "index", noise: 0, alpha: 0.8 },
];

export const handParts = (cx: number, cy: number, s: number): PartSpec[] => [
  { draw: (c) => d.hand(c, cx, cy, s), spacing: 8.5, rMul: RM, grad: "hand", map: "y", shimmer: 0.04 },
];

export const checkParts = (cx: number, cy: number, R: number): PartSpec[] => [
  { draw: (c) => d.checkCircle(c, cx, cy, R), spacing: 8.5, rMul: RM, grad: "check", map: "angle", shimmer: 0.05 },
];

export const earthParts = (cx: number, cy: number, R: number, spacing = 9): PartSpec[] => [
  { draw: (c) => d.earthOcean(c, cx, cy, R), spacing, rMul: RM, grad: "earth", map: "noise", shimmer: 0.04, motion: { type: "float", amp: 1 } },
  { draw: (c) => d.earthLand(c, cx, cy, R), spacing, rMul: RM, grad: "land", map: "noise", shimmer: 0.04, motion: { type: "float", amp: 1 } },
];
