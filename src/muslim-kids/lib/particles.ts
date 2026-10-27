// Система частиц Muslim Kids: формации (функция «индекс, кадр → состояние»)
// и морфинг между ними. Всё детерминировано: состояние частицы зависит только
// от номера кадра, поэтому кадры рендерятся параллельно без скачков.
import type { Rgb } from "../theme";
import { clamp01, ease, hash01, lerp } from "./math";

export type P = {
  x: number;
  y: number;
  r: number; // радиус, px
  a: number; // непрозрачность 0…1
  c: [number, number, number];
  g: number; // свечение 0…1 (ореол на тёмном фоне)
};

export const newP = (): P => ({
  x: 0,
  y: 0,
  r: 0,
  a: 0,
  c: [255, 255, 255],
  g: 0,
});

// Формация пишет состояние i-й частицы на кадре f в out.
export type Formation = (i: number, f: number, out: P) => void;

export const setP = (
  out: P,
  x: number,
  y: number,
  r: number,
  a: number,
  c: Rgb,
  g = 0,
) => {
  out.x = x;
  out.y = y;
  out.r = r;
  out.a = a;
  out.c[0] = c[0];
  out.c[1] = c[1];
  out.c[2] = c[2];
  out.g = g;
};

export type Morph = {
  dur: number; // кадров
  // порядок запуска частиц 0…1 (по умолчанию случайный); доля разброса stagger
  order?: (i: number) => number;
  stagger?: number;
  // боковой изгиб траектории в px (знак/величина на частицу задаются хэшем)
  swirl?: number;
  easing?: (t: number) => number;
};

export type Segment = { from: number; shape: Formation; morph?: Morph };

const tmpA = newP();
const tmpB = newP();

// Состояние частицы на кадре: последняя начавшаяся формация, морф из предыдущей.
export const sample = (
  segments: readonly Segment[],
  i: number,
  f: number,
  out: P,
) => {
  let k = 0;
  for (let s = 0; s < segments.length; s++) if (segments[s].from <= f) k = s;
  const seg = segments[k];
  const m = seg.morph;
  if (k === 0 || !m || f >= seg.from + m.dur) {
    seg.shape(i, f, out);
    return;
  }
  const raw = (f - seg.from) / m.dur;
  const st = m.stagger ?? 0.45;
  const o = m.order ? m.order(i) : hash01(i, 77);
  const p = (m.easing ?? ease.inOutCubic)(
    clamp01((raw * (1 + st) - o * st) / 1),
  );
  segments[k - 1].shape(i, f, tmpA);
  seg.shape(i, f, tmpB);
  mixP(tmpA, tmpB, p, i, m.swirl ?? 120, out);
};

export const mixP = (
  A: P,
  B: P,
  p: number,
  i: number,
  swirl: number,
  out: P,
) => {
  // квадратичная Безье с контрольной точкой, смещённой поперёк пути
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const len = Math.hypot(dx, dy) || 1;
  const side = (hash01(i, 5) - 0.5) * 2 * swirl * Math.min(1, len / 500);
  const cx = (A.x + B.x) / 2 + (-dy / len) * side;
  const cy = (A.y + B.y) / 2 + (dx / len) * side;
  const u = 1 - p;
  out.x = u * u * A.x + 2 * u * p * cx + p * p * B.x;
  out.y = u * u * A.y + 2 * u * p * cy + p * p * B.y;
  // в полёте частица чуть ярче и мельче — читается как поток
  const mid = Math.sin(p * Math.PI);
  out.r = lerp(A.r, B.r, p) * (1 - 0.15 * mid);
  // если одна из точек невидима — частица плавно появляется/гаснет на месте
  out.a = lerp(A.a, B.a, p);
  out.c[0] = lerp(A.c[0], B.c[0], p);
  out.c[1] = lerp(A.c[1], B.c[1], p);
  out.c[2] = lerp(A.c[2], B.c[2], p);
  out.g = Math.max(lerp(A.g, B.g, p), 0.5 * mid * Math.max(A.g, B.g));
};

// Формация из готового облака точек (единичные координаты) с трансформом по кадру.
export type Cloud = { x: Float32Array; y: Float32Array; n: number };

export const cloudFrom = (
  pts: readonly (readonly [number, number])[],
): Cloud => {
  const x = new Float32Array(pts.length);
  const y = new Float32Array(pts.length);
  pts.forEach(([a, b], i) => {
    x[i] = a;
    y[i] = b;
  });
  return { x, y, n: pts.length };
};

// i-я частица из N берёт точку облака с равномерным шагом (облако любого размера)
export const pick = (cloud: Cloud, i: number, N: number) =>
  Math.floor(((i + 0.5) * cloud.n) / N) % cloud.n;
