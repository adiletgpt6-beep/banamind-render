// Сцена 3 — горы из нитей: тканая диорама.
// Те же утки и основа, что были Землёй, ложатся на рельеф: многослойные хребты с
// естественными силуэтами (гауссовы вершины + «хребтовый» шум), долина с рекой,
// снежные вершины (бывшие полярные шапки Земли), облака (бывшие облака Земли), луга.
import { buildPath, buildColors, Path } from "../engines/ThreadContinuityEngine";
import { weftOffset, warpOffset } from "../engines/ThreadWeavingEngine";
import { drapeHeightfield, heightNormal } from "../engines/WovenSculptureEngine";
import { COL } from "../engines/palette";
import { V3, clamp, fbm2, mix3, ridged2, smoothstep } from "../utils/math";

export const TERRAIN = {
  baseY: -1.0,
  xMin: -3.2, xMax: 3.2,
  zMin: -4.8, zMax: 1.0,
  rows: 35, // = параллели Земли
  cols: 48, // = меридианы Земли
  A: 0.026,
  rowN: 170,
  colN: 130,
};

export const riverX = (z: number) => 0.32 * Math.sin(0.9 * z + 0.5) + 0.1;

const PEAKS: [number, number, number, number, number][] = [
  // x, z, высота, σx, σz
  [-1.75, -3.5, 2.15, 0.72, 0.85],
  [1.7, -2.9, 1.85, 0.66, 0.8],
  [-0.45, -4.45, 1.95, 0.8, 0.55],
  [0.85, -4.15, 2.25, 0.58, 0.62],
  [-2.45, -1.55, 1.25, 0.6, 0.7],
  [2.35, -1.15, 1.1, 0.62, 0.7],
  [2.85, -3.95, 1.6, 0.6, 0.8],
  [-2.95, -3.95, 1.7, 0.62, 0.8],
];

/** Полная высота рельефа (без анимационного множителя). */
export const terrainH = (x: number, z: number) => {
  const d = Math.abs(x - riverX(z));
  const valley = smoothstep(0.12, 1.25, d);
  const front = smoothstep(0.85, -1.9, z);
  let peaks = 0;
  for (const [px, pz, h, sx, sz] of PEAKS) {
    peaks += h * Math.exp(-(((x - px) ** 2) / (2 * sx * sx) + ((z - pz) ** 2) / (2 * sz * sz)));
  }
  const detail = 0.5 * ridged2(x * 0.95 + 3.3, z * 0.95 - 1.7, 4) - 0.16;
  const mountains = front * valley * (peaks * 0.88 + detail * (0.35 + 0.65 * Math.min(1, peaks)));
  const meadow = 0.05 * fbm2(x * 1.3, z * 1.3, 3) + 0.04;
  return Math.max(0.01, mountains + meadow);
};

/** Рельеф в момент анимации: hs — рост гор 0..1, волна — пока полотно ещё «плывёт». */
export const animatedH = (hs: number, f: number) => (x: number, z: number) =>
  terrainH(x, z) * hs + (1 - hs) * (0.1 * Math.sin(x * 1.8 + f * 0.07 + z * 0.9) + 0.06 * Math.sin(z * 2.3 - f * 0.05));

export const rowZ = (i: number) => TERRAIN.zMax - (i * (TERRAIN.zMax - TERRAIN.zMin)) / (TERRAIN.rows - 1);
export const colX = (j: number) => TERRAIN.xMin + ((j + 0.5) * (TERRAIN.xMax - TERRAIN.xMin)) / TERRAIN.cols;
const DX = (TERRAIN.xMax - TERRAIN.xMin) / TERRAIN.cols;
const DZ = (TERRAIN.zMax - TERRAIN.zMin) / (TERRAIN.rows - 1);

/** Ряд (уток) i, лежащий на рельефе H. */
export const rowShape = (i: number, H: (x: number, z: number) => number): Path => {
  const z = rowZ(i);
  return buildPath(TERRAIN.rowN, (s) => {
    const x = TERRAIN.xMin + s * (TERRAIN.xMax - TERRAIN.xMin);
    const h = weftOffset(i, x, colX(0), DX, TERRAIN.A);
    return drapeHeightfield(H, x, z, TERRAIN.baseY, h);
  });
};

/** Столбец (основа) j: от ближнего края к дальнему, как меридиан от юга к северу. */
export const colShape = (j: number, H: (x: number, z: number) => number, ext = 0.12): Path => {
  const x = colX(j);
  return buildPath(TERRAIN.colN, (s) => {
    const z = TERRAIN.zMax + ext - s * (TERRAIN.zMax - TERRAIN.zMin + 2 * ext);
    const v = TERRAIN.zMax - z; // растёт вместе с индексом ряда
    const h = warpOffset(j, v, 0, DZ, TERRAIN.A);
    return drapeHeightfield(H, x, z, TERRAIN.baseY, h);
  });
};

/** Цвет рельефа: луга → склоны → снег; русло — бирюзой. */
export const terrainColor = (x: number, z: number): V3 => {
  const h = terrainH(x, z);
  const nrm = heightNormal(terrainH, x, z);
  const slope = 1 - nrm[1];
  const n = fbm2(x * 2.2, z * 2.2, 3);
  let c = mix3(COL.emerald, COL.emeraldLight, clamp(0.5 + n));
  c = mix3(c, COL.emeraldDeep, smoothstep(0.25, 0.6, h) * 0.6);
  c = mix3(c, mix3(COL.brown, COL.brownLight, clamp(0.5 + n)), smoothstep(0.5, 1.15, h + slope * 0.5));
  c = mix3(c, COL.milk, smoothstep(1.62, 1.85, h + n * 0.08));
  const d = Math.abs(x - riverX(z));
  c = mix3(c, COL.turquoise, smoothstep(0.22, 0.08, d) * smoothstep(0.35, 0.1, h) * 0.8);
  return c;
};

export const rowColors = (i: number, n: number) => {
  const z = rowZ(i);
  return buildColors(n, (s) => terrainColor(TERRAIN.xMin + s * (TERRAIN.xMax - TERRAIN.xMin), z));
};
export const colColors = (j: number, n: number, ext = 0.12) => {
  const x = colX(j);
  return buildColors(n, (s) => terrainColor(x, TERRAIN.zMax + ext - s * (TERRAIN.zMax - TERRAIN.zMin + 2 * ext)));
};

/** Снежная шапка — спираль белой шерсти на вершине (бывшая полярная шапка Земли). */
export const SNOW_PEAKS: [number, number][] = [[0.85, -4.15], [-1.75, -3.5]];
export const snowCapShape = (k: number, H: (x: number, z: number) => number): Path => {
  const [cx, cz] = SNOW_PEAKS[k];
  const R = k === 0 ? 0.42 : 0.46;
  return buildPath(220, (s) => {
    const r = Math.sqrt(s) * R;
    const a = Math.sqrt(s) * 4.6 * 2 * Math.PI;
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r * 0.9;
    return drapeHeightfield(H, x, z, TERRAIN.baseY, TERRAIN.A * 2.2);
  });
};

/** Горные облака — петлистые нити у вершин, медленно плывут. */
export const MCLOUDS: { x: number; y: number; z: number; w: number; loops: number }[] = [
  { x: -1.3, y: 1.55, z: -3.0, w: 1.3, loops: 9 },
  { x: 1.4, y: 1.25, z: -2.4, w: 1.1, loops: 8 },
  { x: 0.2, y: 1.95, z: -4.0, w: 1.4, loops: 10 },
  { x: -2.4, y: 1.0, z: -2.2, w: 0.9, loops: 7 },
  { x: 2.6, y: 1.65, z: -3.6, w: 1.0, loops: 7 },
  { x: -0.6, y: 1.15, z: -1.9, w: 0.8, loops: 6 },
  { x: 1.9, y: 2.15, z: -4.4, w: 1.0, loops: 7 },
  { x: -2.0, y: 2.1, z: -4.3, w: 1.1, loops: 8 },
  { x: 0.9, y: 0.85, z: -1.4, w: 0.7, loops: 5 },
];
export const mCloudShape = (c: number, f: number): Path => {
  const m = MCLOUDS[c];
  const drift = 0.0016 * (f - 600);
  return buildPath(200, (s) => {
    const th = s * m.loops * 2 * Math.PI;
    const x = m.x + drift + (s - 0.5) * m.w - Math.sin(th) * 0.07;
    const y = m.y + Math.cos(th) * 0.06 + Math.sin(s * Math.PI) * 0.06;
    const z = m.z + Math.sin(th * 0.5) * 0.05;
    return [x, y, z];
  });
};

/** Река — три шёлковые голубые нити по долине (растут от истока к зрителю). */
export const riverShape = (k: number): Path =>
  buildPath(160, (s) => {
    const z = TERRAIN.zMin + 0.1 + s * (TERRAIN.zMax - TERRAIN.zMin - 0.05);
    const off = (k - 1) * 0.055;
    const x = riverX(z) + off + 0.015 * Math.sin(z * 9 + k);
    return [x, TERRAIN.baseY + terrainH(x, z) + 0.072 + 0.006 * k, z];
  });

/** Луга: зелёные хлопковые нити поверх полотна на переднем плане (позже — листья дерева). */
export const MEADOW_COUNT = 16;
export const meadowShape = (m: number): Path =>
  buildPath(150, (s) => {
    const x = -3.0 + s * 6.0;
    const z0 = 0.92 - m * 0.115;
    const z = z0 + 0.045 * Math.sin(x * 3 + m * 1.7);
    return [x, TERRAIN.baseY + terrainH(x, z) + 0.072, z];
  });

export const groundY = (x: number, z: number) => TERRAIN.baseY + terrainH(x, z);
