// Подготовленные состояния тела: сидя по-турецки, сидя на коленях (учитель
// присаживается к младшим), стоя. Переходы — смешивание этих поз; персонаж
// не «сжимается» по вертикали, звенья сохраняют длину.
import { type P, add, along } from "./geom.ts";
import type { Look } from "./looks.ts";
import type { ArmPose, LegPose, Pose } from "./pose.ts";

export const ARM_DOWN_L: ArmPose = { a1: -9, a2: -4, hand: "relaxed", handRot: 0 };
export const ARM_DOWN_R: ArmPose = { a1: 9, a2: 4, hand: "relaxed", handRot: 0 };

const sgn = (yaw: number) => (yaw >= 0 ? 1 : -1);

export const sitCross = (look: Look, yaw: number): Pose => {
  const b = look.body;
  // колени ниже таза (ближе к зрителю), голени перекрещены перед корпусом
  const legL: LegPose = { a1: -60 + yaw * 8, a2: 80 + yaw * 6, f1: 0.74, f2: (0.78 * b.thigh) / b.shin, footA: 100 + yaw * 10, footF: 0.45 };
  const legR: LegPose = { a1: 60 + yaw * 8, a2: -80 + yaw * 6, f1: 0.74, f2: (0.78 * b.thigh) / b.shin, footA: -100 + yaw * 10, footF: 0.45 };
  const hip = { x: 0, y: -(b.thigh * 0.42 + b.legW * 0.5) };
  const hipW = b.hipW * 0.3 * (1 - 0.25 * Math.abs(yaw));
  const kneeL = along({ x: -hipW, y: hip.y }, legL.a1, b.thigh * legL.f1);
  const kneeR = along({ x: hipW, y: hip.y }, legR.a1, b.thigh * legR.f1);
  return {
    hip,
    lean: yaw * 3,
    bodyYaw: yaw,
    headYaw: yaw,
    headPitch: 0,
    headTilt: 0,
    shoulderUp: 0,
    // кисти спокойно лежат на коленях / голенях
    armL: { a1: 0, a2: 0, target: add(kneeL, { x: b.legW * 0.9, y: -b.legW * 0.55 }), bend: 1, hand: "relaxed", handRot: -25 },
    armR: { a1: 0, a2: 0, target: add(kneeR, { x: -b.legW * 0.9, y: -b.legW * 0.55 }), bend: -1, hand: "relaxed", handRot: 25 },
    legL,
    legR,
    legsFront: true,
    legOrder: yaw >= 0 ? "RL" : "LR",
  };
};

const thighPoint = (look: Look, hip: { x: number; y: number }, side: -1 | 1, l: LegPose, k: number) => {
  const b = look.body;
  const H = { x: hip.x + side * b.hipW * 0.3, y: hip.y };
  const p = along(H, l.a1, b.thigh * l.f1 * k);
  return { x: p.x, y: p.y - b.legW * 0.55 };
};

export const kneel = (look: Look, yaw: number): Pose => {
  const b = look.body;
  const s = sgn(yaw);
  // бёдра направлены к зрителю (сильно укорочены), голени лежат на ковре под ними
  const legNear: LegPose = { a1: s * 38, a2: -s * 96, f1: 0.46, f2: 0.42, footA: -s * 92, footF: 0.3 };
  const legFar: LegPose = { a1: s * 26, a2: -s * 98, f1: 0.44, f2: 0.42, footA: -s * 92, footF: 0.3 };
  const hip = { x: 0, y: -b.legW * 1.95 };
  return {
    hip,
    lean: s * 4,
    bodyYaw: yaw,
    headYaw: yaw,
    headPitch: 0,
    headTilt: 0,
    shoulderUp: 0,
    // кисти лежат на своих бёдрах
    armL: { a1: 0, a2: 0, target: thighPoint(look, hip, -1, s > 0 ? legNear : legFar, 0.75), bend: 1, hand: "relaxed", handRot: -30 },
    armR: { a1: 0, a2: 0, target: thighPoint(look, hip, 1, s > 0 ? legFar : legNear, 0.8), bend: 1, hand: "relaxed", handRot: -30 },
    legL: s > 0 ? legNear : legFar,
    legR: s > 0 ? legFar : legNear,
    legsFront: true,
    legOrder: s > 0 ? "RL" : "LR",
  };
};

export const stand = (look: Look, yaw: number): Pose => {
  const b = look.body;
  const s = sgn(yaw);
  return {
    hip: { x: 0, y: -(b.thigh + b.shin + b.legW * 0.35) },
    lean: 0,
    bodyYaw: yaw,
    headYaw: yaw,
    headPitch: 0,
    headTilt: 0,
    shoulderUp: 0,
    armL: ARM_DOWN_L,
    armR: ARM_DOWN_R,
    legL: { a1: -3, a2: -1, f1: 1, f2: 1, footA: s * 70 - 10, footF: 0.62 },
    legR: { a1: 3, a2: 1, f1: 1, f2: 1, footA: s * 70 + 10, footF: 0.62 },
    legsFront: false,
    legOrder: s > 0 ? "LR" : "RL",
  };
};

// Цель кисти в координатах корня персонажа (без масштаба) по мировой точке.
export const toLocal = (world: P, root: P, scale: number): P => ({ x: (world.x - root.x) / scale, y: (world.y - root.y) / scale });
