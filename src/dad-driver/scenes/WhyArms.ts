// Сцена 4: точные точки кистей сидящего персонажа. Повторяет расчёт
// плеча, локтя и кисти из rig/Figure.tsx (сидя, без шага), чтобы
// указательный палец одной руки касался именно того пальца другой руки,
// который сейчас загибается (рука shape "count").
import type { Place } from "../rig/Actor";
import { twoBone } from "../rig/Figure";
import { LOOKS, type LookId } from "../rig/looks";
import { clamp, deg, rad, soften, smoothstep, type Vec } from "../rig/motion";

type Elbow = "out" | "down" | "in";

export type SitRig = {
  readonly look: LookId;
  readonly P: Place;
  readonly seat: number; // высота сиденья, мировые px
  readonly face: (t: number) => number;
  readonly seed: number;
  readonly turnBody?: number;
};

// Поворот корпуса, как в Actor: сглаженное face с задержкой 6 кадров.
export const bodyTurnAt = (r: SitRig, f: number) => clamp(soften(r.face, f - 6, 4) * (r.turnBody ?? 0.8), -0.85, 0.85);

// Плечо (единицы рисунка, от точки персонажа).
const shoulderLocal = (r: SitRig, f: number, side: -1 | 1, lean = 0, shoulders = 0): Vec => {
  const b = LOOKS[r.look].build;
  const k = r.P.h / 1000;
  const bt = bodyTurnAt(r, f);
  const at = Math.abs(bt);
  const ws = 1 - 0.36 * at;
  const seatU = r.seat / k;
  const sitE = smoothstep(1);
  const drop = (-seatU + 6 - b.hipJointY) * sitE;
  const leanY = (1 - at) * lean * 1.6;
  const breath = Math.sin((f + r.seed * 17) / 26);
  const shy = -shoulders * 12 - breath * 1.5;
  const sy = b.shoulderY + drop + leanY + shy;
  return { x: side * (b.shoulderHalf - b.limb * 0.45) * ws + bt * 6, y: sy + b.limb * 0.45 };
};

const prefOf = (side: -1 | 1, elbow: Elbow): Vec =>
  elbow === "down" ? { x: side * 0.5, y: 1 } : elbow === "in" ? { x: -side, y: 0.4 } : { x: side, y: 0.35 };

// Угол предплечья (как foreAng в Figure) для цели кисти в мире.
export const foreAngle = (r: SitRig, f: number, side: -1 | 1, target: Vec, elbow: Elbow, lean = 0): number => {
  const b = LOOKS[r.look].build;
  const k = r.P.h / 1000;
  const S = shoulderLocal(r, f, side, lean);
  const T = { x: (target.x - r.P.x) / k, y: (target.y - r.P.y) / k };
  const { mid: E, end: W } = twoBone(S, T, b.upperArm, b.forearm, prefOf(side, elbow));
  return deg(Math.atan2(W.y - E.y, W.x - E.x)) - 90;
};

// Точка кисти (единицы кисти) → мир: кисть в W, повёрнута на angle.
const handToWorld = (r: SitRig, W: Vec, angle: number, p: Vec): Vec => {
  const k = r.P.h / 1000;
  const a = rad(angle);
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: W.x + k * (p.x * c - p.y * s), y: W.y + k * (p.x * s + p.y * c) };
};

// Кончик пальца руки "count" (0 — большой, 1 — указательный … 4 — мизинец)
// при загибе fold, кисть в W (мир) под углом angle. Геометрия — из Hand.tsx.
export const countTip = (r: SitRig, side: -1 | 1, W: Vec, angle: number, fold: number, finger: number): Vec => {
  const L = LOOKS[r.look].build.hand;
  const Wd = L * 0.62;
  const s = side;
  if (finger === 0) {
    const ft = clamp(fold);
    const piv = { x: s * Wd * 0.4, y: L * 0.25 };
    const tip0 = { x: s * Wd * 0.42, y: L * 0.18 + L * 0.38 * (1 - 0.45 * ft) - Wd * 0.06 };
    const a = rad(-s * (38 - 70 * ft));
    const dx = tip0.x - piv.x;
    const dy = tip0.y - piv.y;
    const p = { x: piv.x + dx * Math.cos(a) - dy * Math.sin(a), y: piv.y + dx * Math.sin(a) + dy * Math.cos(a) };
    return handToWorld(r, W, angle, p);
  }
  const kk = [1.5 * s, 0.5 * s, -0.5 * s, -1.5 * s][finger - 1];
  const fo = clamp(fold - finger);
  const full = L * (0.5 - Math.abs(kk) * 0.04);
  const h = full * (1 - 0.68 * fo);
  const piv = { x: kk * Wd * 0.22, y: L * 0.52 };
  const tip0 = { x: kk * Wd * 0.22, y: L * 0.5 + h - Wd * 0.08 };
  const a = rad(kk * 4);
  const dy = tip0.y - piv.y;
  const p = { x: piv.x - dy * Math.sin(a), y: piv.y + dy * Math.cos(a) };
  return handToWorld(r, W, angle, p);
};

// Кисть "point": куда поставить запястье, чтобы кончик указательного
// пальца оказался в точке F (мир), а кисть смотрела под углом angle
// (градусы, 0 — вниз, −90 — вправо). Возвращает цель запястья и wrist.
export const pointAt = (r: SitRig, f: number, side: -1 | 1, F: Vec, elbow: Elbow, angle: number, lean = 0) => {
  const L = LOOKS[r.look].build.hand;
  const Wd = L * 0.62;
  const tip = { x: side * Wd * 0.2, y: L * 1.12 };
  const t = handToWorld(r, { x: 0, y: 0 }, angle, tip);
  const W = { x: F.x - t.x, y: F.y - t.y };
  const fa = foreAngle(r, f, side, W, elbow, lean);
  let w = angle - fa;
  while (w > 180) w -= 360;
  while (w < -180) w += 360;
  return { target: W, wrist: w };
};

// Рука "count" ровно вертикально (пальцы вверх) с наклоном tilt.
export const countWrist = (r: SitRig, f: number, side: -1 | 1, W: Vec, elbow: Elbow, tilt = 0, lean = 0) => {
  const fa = foreAngle(r, f, side, W, elbow, lean);
  let w = -180 + tilt - fa;
  while (w > 180) w -= 360;
  while (w < -180) w += 360;
  return { wrist: w, angle: -180 + tilt };
};
