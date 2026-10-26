// Сцена 5 — тканое небо и большой объёмный гобелен.
// Тёмно-синие уточные нити неба вытягиваются из верхних веточек дерева, уходят назад и
// ложатся рядами на «стену» неба; сверху вниз прорастает основа — получается настоящее
// переплетение. Звёзды вышиты серебром. Затем камера отъезжает: всё, что мы видели —
// горы, дерево, Земля, Солнце и небо — оказывается одной объёмной тканой картиной в раме.
import { buildPath, Path } from "../engines/ThreadContinuityEngine";
import { weftOffset, warpOffset } from "../engines/ThreadWeavingEngine";
import { V3, add, lerp, rng, scale } from "../utils/math";
import { COL } from "../engines/palette";
import { mix3 } from "../utils/math";

export const SKY = {
  z: -5.3,
  xMin: -4.6, xMax: 4.6,
  yMin: -0.9, yMax: 12.4,
  rows: 40,
  cols: 30,
  A: 0.05,
  r: 0.045,
};
export const skyRowY = (m: number) => SKY.yMin + (m * (SKY.yMax - SKY.yMin)) / (SKY.rows - 1);
export const skyColX = (j: number) => SKY.xMin + ((j + 0.5) * (SKY.xMax - SKY.xMin)) / SKY.cols;
const DXS = (SKY.xMax - SKY.xMin) / SKY.cols;
const DYS = (SKY.yMax - SKY.yMin) / (SKY.rows - 1);

/** Цвет ряда неба: светлее у горизонта, глубже в зените. */
export const skyRowColor = (m: number): V3 => {
  const t = m / (SKY.rows - 1);
  return mix3(COL.skyThreadLight, COL.skyThreadDeep, t) ;
};

/** Ряд неба (уток) m: от края entry к противоположному краю, со смещениями «над/под» по z. */
export const skyRowPath = (m: number, fromLeft: boolean, n = 200): Path => {
  const y = skyRowY(m);
  return buildPath(n, (s) => {
    const u = fromLeft ? s : 1 - s;
    const x = lerp(SKY.xMin, SKY.xMax, u);
    const h = weftOffset(m, x, skyColX(0), DXS, SKY.A);
    return [x, y + 0.03 * Math.sin(x * 1.3 + m), SKY.z + h];
  });
};

/**
 * Нить неба, только что вытянутая из веточки: от кончика ветки вверх-назад к краю неба,
 * затем вдоль ряда. Доля «перелёта» — legFrac от длины.
 */
export const skyStreamPath = (m: number, tip: V3, fromLeft: boolean, n = 240): Path => {
  const row = skyRowPath(m, fromLeft, 160);
  const entry: V3 = [row[0], row[1], row[2]];
  const c1: V3 = add(tip, [0, 0.9, -0.3]);
  const c2: V3 = [lerp(tip[0], entry[0], 0.55), lerp(tip[1] + 1.6, entry[1], 0.5), lerp(tip[2], entry[2], 0.7)];
  const legN = 80;
  const pts: V3[] = [];
  for (let i = 0; i < legN; i++) {
    const t = i / legN;
    const u = 1 - t;
    pts.push([
      u * u * u * tip[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * entry[0],
      u * u * u * tip[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * entry[1],
      u * u * u * tip[2] + 3 * u * u * t * c1[2] + 3 * u * t * t * c2[2] + t * t * t * entry[2],
    ]);
  }
  for (let i = 0; i < row.length / 3; i++) pts.push([row[i * 3], row[i * 3 + 1], row[i * 3 + 2]]);
  void n;
  return buildPath(pts.length, (_s, i) => pts[i]);
};

/** Основа неба j: сверху вниз. */
export const skyColPath = (j: number): Path => {
  const x = skyColX(j);
  return buildPath(220, (s) => {
    const y = lerp(SKY.yMax + 0.15, SKY.yMin - 0.15, s);
    const v = y - SKY.yMin;
    const h = warpOffset(j, v, 0, DYS, SKY.A);
    return [x + 0.02 * Math.sin(y * 1.1 + j), y, SKY.z + h];
  });
};

// ---------- звёзды: серебряная вышивка ----------
export interface Star { x: number; y: number; size: number; rot: number }
export const STARS: Star[] = (() => {
  const R = rng(777);
  const out: Star[] = [];
  const avoid: [number, number, number][] = [[-2.0, 8.2, 1.7], [1.8, 8.3, 1.3]]; // Земля и Солнце на стене
  let guard = 0;
  while (out.length < 17 && guard++ < 2000) {
    const x = lerp(-4.1, 4.1, R()), y = lerp(4.6, 11.9, R());
    if (avoid.some(([ax, ay, ar]) => Math.hypot(x - ax, y - ay) < ar)) continue;
    if (out.some((s) => Math.hypot(s.x - x, s.y - y) < 1.05)) continue;
    out.push({ x, y, size: 0.16 + R() * 0.16, rot: R() * 0.8 });
  }
  return out;
})();
/** Луч k звезды: короткая нить через центр (4 луча = 8-лучевая звёздочка). */
export const starStrokePath = (st: Star, k: number): Path => {
  const a = st.rot + (k * Math.PI) / 4;
  const len = st.size * (k % 2 === 0 ? 1 : 0.62);
  const z = SKY.z + 0.12 + k * 0.012;
  return buildPath(24, (s) => {
    const t = (s - 0.5) * 2 * len;
    return [st.x + Math.cos(a) * t, st.y + Math.sin(a) * t, z + 0.02 * Math.cos(s * Math.PI)];
  });
};

// ---------- рама гобелена ----------
export const FRAME = { x: 3.4, yMin: -1.45, yMax: 10.7, z: 1.3, corner: 0.32 };
const roundedRect = (inset: number, n: number, zOff: number, wave: (p: number) => number = () => 0): Path => {
  const X = FRAME.x - inset, Y0 = FRAME.yMin + inset, Y1 = FRAME.yMax - inset, rc = FRAME.corner;
  const w = 2 * X - 2 * rc, h = Y1 - Y0 - 2 * rc, arc = (Math.PI / 2) * rc;
  const per = 2 * w + 2 * h + 4 * arc;
  // старт — середина нижней стороны, обход против часовой
  return buildPath(n, (s) => {
    let d = s * per;
    const seq: [number, (t: number) => [number, number]][] = [
      [w / 2, (t) => [t * (w / 2), Y0]],
      [arc, (t) => { const a = -Math.PI / 2 + (t / arc) * (Math.PI / 2); return [X - rc + Math.cos(a) * rc, Y0 + rc + Math.sin(a) * rc]; }],
      [h, (t) => [X, Y0 + rc + t]],
      [arc, (t) => { const a = (t / arc) * (Math.PI / 2); return [X - rc + Math.cos(a) * rc, Y1 - rc + Math.sin(a) * rc]; }],
      [w, (t) => [X - rc - t, Y1]],
      [arc, (t) => { const a = Math.PI / 2 + (t / arc) * (Math.PI / 2); return [-X + rc + Math.cos(a) * rc, Y1 - rc + Math.sin(a) * rc]; }],
      [h, (t) => [-X, Y1 - rc - t]],
      [arc, (t) => { const a = Math.PI + (t / arc) * (Math.PI / 2); return [-X + rc + Math.cos(a) * rc, Y0 + rc + Math.sin(a) * rc]; }],
      [w / 2, (t) => [-X + rc + t, Y0]],
    ];
    for (const [L, fn] of seq) {
      if (d <= L) {
        const [x, y] = fn(d);
        return [x, y, FRAME.z + zOff + wave(s * per)];
      }
      d -= L;
    }
    return [0, Y0, FRAME.z];
  });
};
export const FRAME_LOOPS: { inset: number; color: V3; mat: "gold" | "silk" | "cotton" }[] = [
  { inset: 0.0, color: COL.gold, mat: "gold" },
  { inset: 0.1, color: COL.turquoise, mat: "silk" },
  { inset: 0.2, color: COL.goldDeep, mat: "gold" },
  { inset: 0.3, color: COL.emerald, mat: "cotton" },
];
export const frameLoopPath = (k: number): Path => roundedRect(FRAME_LOOPS[k].inset, 700, 0);
/** Зигзаг-стежок поверх/под рамочными нитями. */
export const frameZigzagPath = (k: number): Path => {
  const base = roundedRect(0.15, 900, 0);
  const n = base.length / 3;
  // смещение поперёк рамки (к центру) и по z: над (k=0) или под (k=1)
  return buildPath(n, (_s, i) => {
    const p: V3 = [base[i * 3], base[i * 3 + 1], base[i * 3 + 2]];
    const ph = (i / n) * 150 * Math.PI + k * Math.PI;
    const lateral = 0.15 * Math.sin(ph);
    // направление к центру рамки (приближённо)
    const cx = Math.abs(p[0]) > FRAME.x - 0.4 ? -Math.sign(p[0]) : 0;
    const cy = cx === 0 ? (p[1] < (FRAME.yMin + FRAME.yMax) / 2 ? 1 : -1) : 0;
    return add(p, add(scale([cx, cy, 0], lateral), [0, 0, k === 0 ? 0.075 : -0.075]));
  });
};
