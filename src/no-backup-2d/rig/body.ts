// Точки тела в мировых координатах для неподвижной позы (стоя, сидя,
// присев). Формулы совпадают с Figure.tsx: сцены используют их, чтобы
// кисти, ремень и предметы касались фактического тела, а не «примерного
// места». Без React (проверяется тестом).
import type { Build } from "./looks.ts";
import { clamp, lerp, type Vec } from "./motion.ts";
import { twoBone } from "./ik.ts";

export type BodyPlace = { readonly x: number; readonly y: number; readonly h: number };

export type BodyIn = {
  readonly turn: number; // поворот корпуса (как bodyTurn в Figure), −0,85…0,85
  readonly seat?: number; // высота сиденья, мировые px от точки персонажа (только сидя)
  readonly crouch?: number;
  readonly lean?: number;
};

export const bodyPoints = (b: Build, P: BodyPlace, pose: BodyIn) => {
  const k = P.h / 1000;
  const bt = clamp(pose.turn, -0.85, 0.85);
  const at = Math.abs(bt);
  const sgn = bt >= 0 ? 1 : -1;
  const ws = 1 - 0.36 * at;
  const sit = pose.seat !== undefined;
  const dy = sit ? -pose.seat! / k + 6 - b.hipJointY : (pose.crouch ?? 0) * b.thigh * 0.75;
  const leanY = (1 - at) * (pose.lean ?? 0) * 1.6;
  const w = (x: number, y: number): Vec => ({ x: P.x + k * x, y: P.y + k * y });
  const sy = b.shoulderY + dy + leanY;
  const hipY = b.hipJointY + dy;
  const shoulder = (side: -1 | 1) => w(side * (b.shoulderHalf - b.limb * 0.45) * ws + bt * 6, sy + b.limb * 0.45);
  const hip = (side: -1 | 1) => w(side * b.hipJointX * (1 - 0.55 * at), hipY);
  const knee = (side: -1 | 1) => {
    const hx = side * b.hipJointX * (1 - 0.55 * at);
    return w(hx + sgn * at * b.thigh * 0.92 + side * 6 * (1 - at), hipY + lerp(34, 6, at));
  };
  return {
    k,
    at,
    sgn,
    // ближняя к зрителю сторона: дальняя рука/плечо — со стороны поворота
    near: (sgn > 0 ? -1 : 1) as -1 | 1,
    shoulder,
    hip,
    knee,
    neck: w(bt * 8, b.neckTop + dy + leanY),
    chest: w(bt * b.shoulderHalf * ws * 0.45, sy + 70),
    collar: w(bt * b.shoulderHalf * ws * 0.45, sy + 6),
    head: w(bt * 12, b.headY + dy + leanY * 1.15),
    // ухо (как в Head.tsx) при повороте головы headTurn
    ear: (side: -1 | 1, headTurn = bt) => w(bt * 12 + side * b.headRx * 0.97 - headTurn * b.headRx * 0.32, b.headY + dy + leanY * 1.15 + b.headRy * 0.1),
    headR: b.headRx * k,
    waist: w(0, b.waistY + dy + leanY * 0.5),
    pelvis: w(0, b.hipY + dy),
    reach: (b.upperArm + b.forearm - 2) * k,
    hand: b.hand * k,
  };
};

// Цель запястья, при которой центр хвата кисти (там держится предмет)
// окажется в точке grip. Кисть продолжает предплечье, поэтому запястье
// отстоит от хвата на полкисти вдоль предплечья; направление предплечья
// берётся из того же решения двух костей, что и в Figure.
export const wristForGrip = (
  b: Build,
  P: BodyPlace,
  pose: BodyIn,
  side: -1 | 1,
  grip: Vec,
  elbow: "out" | "down" | "in" = "out",
): Vec => {
  const bp = bodyPoints(b, P, pose);
  const S = bp.shoulder(side);
  const pref = elbow === "down" ? { x: side * 0.5, y: 1 } : elbow === "in" ? { x: -side, y: 0.4 } : { x: side, y: 0.35 };
  let W = grip;
  for (let i = 0; i < 5; i++) {
    const { mid: E } = twoBone(S, W, b.upperArm * bp.k, b.forearm * bp.k, pref);
    const d = Math.hypot(W.x - E.x, W.y - E.y) || 1;
    W = { x: grip.x - ((W.x - E.x) / d) * 0.5 * b.hand * bp.k, y: grip.y - ((W.y - E.y) / d) * 0.5 * b.hand * bp.k };
  }
  return W;
};
