// PatternGenerator — симметричные узоры из правильных фигур.
//
// • triangleRosette — шестиугольная розетка из треугольников: 6 секторов
//   (радиальная симметрия 6), каждый разбит на n² треугольников по рядам.
//   У каждого треугольника есть «родитель» и общее с ним ребро — по нему
//   треугольник раскрывается (edgeUnfold), так узор растёт волной от центра.
//   Цвета заданы правилом, зеркально симметричным внутри сектора.
// • starPolygon, ring — элементы орнамента; radial / mirror — симметрии.
import { regularPolygon, type Vec2 } from "./GeometryWondersEngine";
import { PALETTE } from "../styles/palette";

export type RosetteTri = {
  index: number;
  sector: number;
  row: number; // кольцо (расстояние от центра в рядах)
  col: number;
  up: boolean; // вершиной к центру (true) или основанием к центру
  v: [Vec2, Vec2, Vec2]; // вершины в плоскости
  centroid: Vec2;
  parent: number; // индекс треугольника, из которого раскрывается (-1 — центр)
  hinge: [Vec2, Vec2] | null; // общее ребро с родителем
  step: number; // номер волны раскрытия
  rho: [number, number, number]; // нормированный радиус вершин (0 центр … 1 край)
  color: string;
};

const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];
const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Vec2, k: number): Vec2 => [a[0] * k, a[1] * k];

/** Расстояние от центра до края правильного шестиугольника (угол вершины rot) по направлению phi. */
export function hexRadius(R: number, phi: number, rot = Math.PI / 2) {
  const seg = Math.PI / 3;
  let a = (phi - rot) % seg;
  if (a < 0) a += seg;
  return (R * Math.cos(Math.PI / 6)) / Math.cos(a - Math.PI / 6);
}

function rosetteColor(row: number, col: number, up: boolean, n: number): string {
  const m = Math.min(col, row - col + (up ? 0 : -1)); // зеркальная симметрия сектора
  const edge = up && (col === 0 || col === row);
  if (row === 0) return PALETTE.gold;
  if (edge) return row % 2 === 0 ? PALETTE.gold : PALETTE.turquoise;
  if (row % 3 === 0 && up) return PALETTE.gold;
  if (up && m === Math.floor(row / 2)) return PALETTE.emerald;
  if (!up && (row + m) % 3 === 0) return PALETTE.turquoise;
  if (row === n - 1) return up ? PALETTE.turquoise : PALETTE.royal;
  return up ? PALETTE.royal : PALETTE.royalDeep;
}

/** Розетка радиуса R из 6·n² треугольников. */
export function triangleRosette(n: number, R: number): RosetteTri[] {
  const tris: RosetteTri[] = [];
  const O: Vec2 = [0, 0];
  const corner = (s: number): Vec2 => {
    const a = Math.PI / 2 + (s * Math.PI) / 3;
    return [Math.cos(a) * R, Math.sin(a) * R];
  };
  const id = new Map<string, number>();
  for (let s = 0; s < 6; s++) {
    const A = corner(s);
    const B = corner(s + 1);
    const P = (i: number, j: number): Vec2 => add(add(O, mul(sub(A, O), i / n)), mul(sub(B, A), j / n));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        // «Вверх» — вершиной к центру.
        const v: [Vec2, Vec2, Vec2] = [P(i, j), P(i + 1, j), P(i + 1, j + 1)];
        id.set(`${s}:${i}:${j}:u`, tris.length);
        tris.push(mk(tris.length, s, i, j, true, v));
        if (j < i) {
          const w: [Vec2, Vec2, Vec2] = [P(i, j), P(i + 1, j + 1), P(i, j + 1)];
          id.set(`${s}:${i}:${j}:d`, tris.length);
          tris.push(mk(tris.length, s, i, j, false, w));
        }
      }
    }
  }
  function mk(index: number, s: number, i: number, j: number, up: boolean, v: [Vec2, Vec2, Vec2]): RosetteTri {
    const c: Vec2 = [(v[0][0] + v[1][0] + v[2][0]) / 3, (v[0][1] + v[1][1] + v[2][1]) / 3];
    const rho = v.map((p) => {
      const r = Math.hypot(p[0], p[1]);
      return r < 1e-9 ? 0 : r / hexRadius(R, Math.atan2(p[1], p[0]));
    }) as [number, number, number];
    return { index, sector: s, row: i, col: j, up, v, centroid: c, parent: -1, hinge: null, step: 0, rho, color: rosetteColor(i, j, up, n) };
  }
  // Родители и волны: вниз(i,j) ← вверх(i-1,j) через ребро P(i,j)-P(i,j+1);
  // вверх(i,j) ← вниз(i,j) (или вниз(i,j-1) у правого края) — через общее ребро.
  for (const t of tris) {
    if (t.row === 0) {
      t.step = 0;
      continue;
    }
    if (!t.up) {
      const p = id.get(`${t.sector}:${t.row - 1}:${t.col}:u`)!;
      t.parent = p;
      t.hinge = [t.v[0], t.v[2]];
      t.step = 2 * t.row - 1;
    } else {
      const left = t.col < t.row ? id.get(`${t.sector}:${t.row}:${t.col}:d`) : undefined;
      if (left !== undefined) {
        t.parent = left;
        t.hinge = [t.v[0], t.v[2]];
      } else {
        t.parent = id.get(`${t.sector}:${t.row}:${t.col - 1}:d`)!;
        t.hinge = [t.v[0], t.v[1]];
      }
      t.step = 2 * t.row;
    }
  }
  return tris;
}

/** Звёздчатый многоугольник: k лучей, внешний и внутренний радиусы. */
export function starPolygon(k: number, rOut: number, rIn: number, rot = Math.PI / 2): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < k * 2; i++) {
    const r = i % 2 === 0 ? rOut : rIn;
    const a = rot + (i * Math.PI) / k;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

/** Ромб с диагоналями d1 (вдоль оси x) и d2. */
export const rhombus = (d1: number, d2: number): Vec2[] => [
  [d1 / 2, 0],
  [0, d2 / 2],
  [-d1 / 2, 0],
  [0, -d2 / 2],
];

/** «Воздушный змей» — ромб с вытянутым внешним концом. */
export const kite = (inner: number, outer: number, half: number): Vec2[] => [
  [outer, 0],
  [0, half],
  [-inner, 0],
  [0, -half],
];

export const hexagon = (r: number, rot = 0) => regularPolygon(6, r, rot);

/** Радиальная симметрия: count копий по окружности радиуса r. */
export function radial(count: number, r: number, phase = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = phase + (i / count) * Math.PI * 2;
    return { i, angle: a, x: Math.cos(a) * r, y: Math.sin(a) * r };
  });
}

/** Зеркальная симметрия относительно оси под углом axis. */
export function mirror(p: Vec2, axis: number): Vec2 {
  const c = Math.cos(2 * axis);
  const s = Math.sin(2 * axis);
  return [p[0] * c + p[1] * s, p[0] * s - p[1] * c];
}
