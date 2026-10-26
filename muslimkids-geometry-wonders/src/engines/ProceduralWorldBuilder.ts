// ProceduralWorldBuilder — процедурные миры из геометрии (фиксированный seed).
//
// • noise2 / fbm / ridged — детерминированный шум для рельефа.
// • terrainHeight — горы позади, долина спереди (там растёт лес).
// • buildTree — дерево: ствол и ветви рекурсивно (Procedural Branch
//   Generation), крона — кластеры многогранников на концах ветвей; хвойное —
//   ярусы шестигранных конусов. Возвращает описания сегментов и частей кроны,
//   которые рисуются InstancedMesh.
import { seeded, type Vec3 } from "./GeometryWondersEngine";

// ---------- шум ----------
function hash2(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function noise2(x: number, y: number, seed = 7) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x: number, y: number, oct = 5, seed = 7) {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    s += amp * noise2(x * f, y * f, seed + i * 31);
    f *= 2.03;
    amp *= 0.5;
  }
  return s;
}

export function ridged(x: number, y: number, oct = 5, seed = 11) {
  let s = 0;
  let amp = 0.55;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    const n = 1 - Math.abs(noise2(x * f, y * f, seed + i * 17) * 2 - 1);
    s += amp * n * n;
    f *= 2.1;
    amp *= 0.48;
  }
  return s;
}

/** Высота рельефа. z < 0 — даль (горы), z > 0 — передний план (долина). */
export function terrainHeight(x: number, z: number) {
  const back = Math.min(1, Math.max(0, (-z + 3) / 14)); // 0 спереди → 1 вдали
  const mountains = ridged(x * 0.09 + 3.1, z * 0.09 + 1.7) * 8.5 * back ** 1.3;
  const peak = 5.5 * Math.exp(-((x + 2) ** 2 + (z + 17) ** 2) / 40) + 4 * Math.exp(-((x - 9) ** 2 + (z + 13) ** 2) / 30);
  const hills = fbm(x * 0.12, z * 0.12, 4, 3) * 1.6;
  return Math.max(0, mountains + peak * back + hills - 0.7);
}

// ---------- деревья ----------
export type Segment = { from: Vec3; to: Vec3; radius: number; order: number; start: number };
export type CrownPiece = {
  pos: Vec3;
  size: number;
  kind: "poly" | "cone";
  color: string;
  rot: Vec3;
  start: number; // доля времени сборки дерева, когда часть прилетает
  height?: number;
};
export type Tree = { base: Vec3; kind: "broadleaf" | "conifer"; segments: Segment[]; crown: CrownPiece[]; scale: number };

const LEAF = ["#3CA68B", "#2f8f76", "#4bb894", "#5fc39a", "#2a7d6b", "#7ccf8f"];
const NEEDLE = ["#1f6b5c", "#2a7d6b", "#25745f", "#34917a"];

export function buildTree(base: Vec3, kind: "broadleaf" | "conifer", seed: number, scale = 1): Tree {
  const rnd = seeded(seed);
  const segments: Segment[] = [];
  const crown: CrownPiece[] = [];
  if (kind === "conifer") {
    const h = (3.4 + rnd() * 1.4) * scale;
    segments.push({ from: base, to: [base[0], base[1] + h * 0.98, base[2]], radius: 0.12 * scale, order: 0, start: 0 });
    const tiers = 6 + Math.floor(rnd() * 2);
    for (let i = 0; i < tiers; i++) {
      const k = i / (tiers - 1);
      const y = base[1] + h * (0.22 + k * 0.66);
      crown.push({
        pos: [base[0], y, base[2]],
        size: (1.25 - k * 0.95) * scale,
        height: (0.95 - k * 0.25) * scale,
        kind: "cone",
        color: NEEDLE[(i + seed) % NEEDLE.length],
        rot: [0, (i * Math.PI) / 6 + rnd() * 0.3, 0],
        start: 0.25 + k * 0.6,
      });
    }
    return { base, kind, segments, crown, scale };
  }
  // Лиственное: ствол → 3–4 ветви → 2 побега на каждой; крона на концах.
  const trunkH = (1.6 + rnd() * 0.6) * scale;
  const top: Vec3 = [base[0], base[1] + trunkH, base[2]];
  segments.push({ from: base, to: top, radius: 0.16 * scale, order: 0, start: 0 });
  const branches = 3 + Math.floor(rnd() * 2);
  const tips: Vec3[] = [];
  for (let b = 0; b < branches; b++) {
    const az = (b / branches) * Math.PI * 2 + rnd() * 0.8;
    const el = 0.75 + rnd() * 0.35;
    const len = (1.1 + rnd() * 0.4) * scale;
    const end: Vec3 = [
      top[0] + Math.cos(az) * Math.cos(el) * len,
      top[1] + Math.sin(el) * len,
      top[2] + Math.sin(az) * Math.cos(el) * len,
    ];
    segments.push({ from: top, to: end, radius: 0.085 * scale, order: 1, start: 0.15 + b * 0.04 });
    for (let k = 0; k < 2; k++) {
      const az2 = az + (k ? 0.7 : -0.7);
      const len2 = (0.6 + rnd() * 0.3) * scale;
      const tip: Vec3 = [
        end[0] + Math.cos(az2) * len2 * 0.7,
        end[1] + len2 * 0.75,
        end[2] + Math.sin(az2) * len2 * 0.7,
      ];
      segments.push({ from: end, to: tip, radius: 0.05 * scale, order: 2, start: 0.28 + b * 0.04 + k * 0.02 });
      tips.push(tip);
    }
  }
  tips.push([top[0], top[1] + 1.9 * scale, top[2]]);
  // Крона: многогранники вокруг концов ветвей (кластеры).
  tips.forEach((tip, ti) => {
    const count = 3;
    for (let k = 0; k < count; k++) {
      const a = rnd() * Math.PI * 2;
      const r = (0.25 + rnd() * 0.3) * scale;
      crown.push({
        pos: [tip[0] + Math.cos(a) * r, tip[1] + (rnd() - 0.3) * 0.5 * scale, tip[2] + Math.sin(a) * r],
        size: (0.42 + rnd() * 0.28) * scale,
        kind: "poly",
        color: LEAF[Math.floor(rnd() * LEAF.length)],
        rot: [rnd() * 3, rnd() * 3, rnd() * 3],
        start: 0.35 + (ti / tips.length) * 0.45 + k * 0.03,
      });
    }
  });
  return { base, kind, segments, crown, scale };
}

/** Лес: деревья на пологих участках переднего плана, детерминированно. */
export function buildForest(seed: number, count: number) {
  const rnd = seeded(seed);
  const trees: Tree[] = [];
  let guard = 0;
  while (trees.length < count && guard++ < 2000) {
    const x = (rnd() - 0.5) * 22;
    const z = -1 + rnd() * 9.5;
    const h = terrainHeight(x, z);
    if (h > 1.4) continue;
    if (Math.abs(x) < 1.8 && z > 5.2) continue; // поляна для цветка
    if (trees.some((t) => Math.hypot(t.base[0] - x, t.base[2] - z) < 1.75)) continue;
    const kind = rnd() < 0.42 ? "conifer" : "broadleaf";
    trees.push(buildTree([x, h, z], kind, seed * 97 + trees.length * 13, 0.85 + rnd() * 0.35));
  }
  return trees;
}
