// Процедурный горный мир: долина с рекой, хребты, снег, лес.
// Высота — чистая функция координат, поэтому камера, деревья, река и
// трава согласованы между собой без общей «огромной сцены».
import { BufferAttribute, BufferGeometry, Color, PlaneGeometry } from "three";
import { fbm2, mulberry32, ridged2 } from "../utils/random";
import { smoothstep } from "../engines/CameraTransitionEngine";

export const riverZ = (x: number) => 140 * Math.sin(x / 600) + 60 * Math.sin(x / 230 + 1);

/** Расстояние до русла (по z — для плавного русла этого достаточно). */
export const riverDist = (x: number, z: number) => Math.abs(z - riverZ(x));

export function heightAt(x: number, z: number) {
  const d = riverDist(x, z);
  const valley = smoothstep(55, 1150, d);
  const ridge = ridged2(x / 1250 + 7.3, z / 1250 - 2.1, 6, 3);
  const base = fbm2(x / 2600, z / 2600, 3, 9);
  const mountains = (Math.pow(ridge, 1.5) * 1500 + base * 380) * Math.pow(valley, 1.35);
  const floor = 2.2 * fbm2(x / 70, z / 70, 3, 5) + 0.012 * x * smoothstep(400, 0, d);
  const carve = -3.2 * (1 - smoothstep(9, 24, d));
  return mountains + floor + carve;
}

export function slopeAt(x: number, z: number) {
  const e = 6;
  const dx = (heightAt(x + e, z) - heightAt(x - e, z)) / (2 * e);
  const dz = (heightAt(x, z + e) - heightAt(x, z - e)) / (2 * e);
  return Math.hypot(dx, dz);
}

const C = {
  meadow: new Color("#6DAA4F"),
  meadowGold: new Color("#A9B25A"),
  forest: new Color("#2F6B45"),
  rock: new Color("#7E6A58"),
  rockCool: new Color("#6F7480"),
  snow: new Color("#F4F6F8"),
  bank: new Color("#9C8A66"),
};

/** Цвет склона: луг → лес → скалы → снег, с учётом крутизны. */
export function groundColor(x: number, z: number, h: number, slope: number, out: Color) {
  const n = fbm2(x / 90, z / 90, 4, 21);
  const n2 = fbm2(x / 15, z / 15, 2, 22);
  out.copy(C.meadow).lerp(C.meadowGold, smoothstep(0.45, 0.75, n) * 0.6);
  out.lerp(C.forest, smoothstep(60, 220, h) * (1 - smoothstep(780, 1000, h)) * 0.85);
  const rocky = Math.max(smoothstep(0.55, 1.0, slope), smoothstep(850, 1150, h));
  out.lerp(n > 0.5 ? C.rock : C.rockCool, rocky * 0.9);
  const snowLine = 1050 + 160 * (n - 0.5) - 120 * (1 - smoothstep(0.4, 1.0, slope));
  out.lerp(C.snow, smoothstep(snowLine, snowLine + 90, h) * (1 - smoothstep(0.9, 1.4, slope) * 0.6));
  out.lerp(C.bank, (1 - smoothstep(14, 30, riverDist(x, z))) * 0.7);
  out.multiplyScalar(0.9 + 0.2 * n2);
  return out;
}

/**
 * Сетка рельефа. Ближняя — детальная; дальняя — крупная, а внутри ближней
 * опущена на несколько метров, чтобы сетки не «спорили» по глубине.
 */
export function buildTerrain(size: number, segs: number, cx: number, cz: number, holeHalf = 0) {
  const g = new PlaneGeometry(size, size, segs, segs);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const col = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + cx;
    const z = pos.getZ(i) + cz;
    let h = heightAt(x, z);
    if (holeHalf && Math.abs(x) < holeHalf && Math.abs(z) < holeHalf) h -= 14;
    pos.setXYZ(i, x, h, z);
    groundColor(x, z, h, slopeAt(x, z), col);
    colors.set([col.r, col.g, col.b], i * 3);
  }
  g.setAttribute("color", new BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

/** Лента реки, повторяющая русло. */
export function buildRiver(x0: number, x1: number, steps: number): BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const z = riverZ(x);
    const dz = (riverZ(x + 1) - riverZ(x - 1)) / 2;
    const len = Math.hypot(1, dz);
    const nx = -dz / len;
    const nz = 1 / len;
    const w = 15 + 5 * Math.sin(x / 170);
    const y = heightAt(x, z) + 2.2;
    pos.push(x + nx * w, y, z + nz * w, x - nx * w, y, z - nz * w);
    uv.push(x / 40, 0, x / 40, 1);
    if (i < steps) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("uv", new BufferAttribute(new Float32Array(uv), 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export type TreeSpot = { x: number; y: number; z: number; scale: number; rot: number; kind: 0 | 1; hue: number };

/**
 * Лес: детерминированная расстановка по высоте, крутизне и «пятнам» шума.
 * avoid — точки траектории камеры: рядом с ними деревья не ставим.
 */
export function placeForest(count: number, half: number, avoid: { x: number; y: number; z: number }[]) {
  const rnd = mulberry32(2024);
  const spots: TreeSpot[] = [];
  let guard = 0;
  while (spots.length < count && guard++ < count * 30) {
    // Плотнее у долины: квадратичное распределение по удалённости.
    const x = (rnd() * 2 - 1) * half;
    const z = riverZ(x) + (rnd() < 0.5 ? -1 : 1) * Math.pow(rnd(), 1.6) * half * 0.9;
    const d = riverDist(x, z);
    if (d < 30) continue;
    if (Math.hypot(x, z - TREE_SPOT.z) < 34) continue;
    const h = heightAt(x, z);
    if (h > 900 + 120 * fbm2(x / 200, z / 200, 2, 4)) continue;
    const slope = slopeAt(x, z);
    if (slope > 0.85) continue;
    const dens = fbm2(x / 260, z / 260, 3, 11);
    if (dens < 0.42 + 0.25 * smoothstep(400, 900, h)) continue;
    const s = 0.7 + rnd() * 0.7;
    const top = h + 22 * s;
    let blocked = false;
    for (const p of avoid) {
      const dd = Math.hypot(p.x - x, p.z - z);
      if (dd < 40 && p.y < top + 16) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;
    const conifer = h > 120 || rnd() < 0.55;
    spots.push({ x, y: h - 0.5, z, scale: s, rot: rnd() * Math.PI * 2, kind: conifer ? 0 : 1, hue: rnd() });
  }
  return spots;
}

/** Главное дерево стоит на лугу у реки, в начале координат по x. */
export const TREE_SPOT = { x: 0, z: riverZ(0) - 36, y: 0 };
TREE_SPOT.y = heightAt(TREE_SPOT.x, TREE_SPOT.z);
