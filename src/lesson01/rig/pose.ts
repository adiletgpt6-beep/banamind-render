// Позы и выражения лица. Поза — набор углов и смещений, которые плавно
// смешиваются между подготовленными состояниями (сидя по-турецки, сидя на
// коленях, стоя). Длина звеньев не меняется ни в одной позе.
import { type P, lerp, lerpAngle, lerpP } from "./geom.ts";

export type HandShape = "relaxed" | "open" | "point" | "grip" | "fist" | "flat" | "palmUp" | "pinch";

// Рука: углы плеча и предплечья (абсолютные) либо цель кисти для IK
// (относительно корня персонажа) с направлением сгиба локтя.
export type ArmPose = {
  a1: number;
  a2: number;
  target?: P;
  bend?: number;
  hand: HandShape;
  handRot: number; // поворот кисти относительно предплечья
  handAbs?: number; // абсолютный угол кисти (захват сверху: 0 — пальцы вниз)
  front?: boolean; // рисовать поверх корпуса (жест перед грудью)
  palm?: boolean; // ладонь к зрителю
  f?: number; // перспективное укорочение всей руки (рука уходит вперёд, к столу); 1 — без укорочения
};

export type LegPose = {
  a1: number; // бедро
  a2: number; // голень
  f1: number; // перспективное укорочение бедра (1 — без укорочения)
  f2: number;
  footA: number; // угол стопы
  footF: number; // видимая длина стопы (носок к зрителю — короче)
};

export type Pose = {
  hip: P; // таз относительно корня (корень — точка на полу)
  lean: number; // наклон корпуса, ° (+ — к правому краю экрана)
  bodyYaw: number; // -1…1 (+ — разворот к правому краю экрана)
  headYaw: number;
  headPitch: number; // + — взгляд вниз
  headTilt: number; // °
  shoulderUp: number; // ед.
  armL: ArmPose; // рука у левого края экрана
  armR: ArmPose;
  legL: LegPose;
  legR: LegPose;
  legsFront: boolean; // ноги перед корпусом (сидя)
  legOrder: "LR" | "RL"; // какая нога рисуется последней
};

export type Face = {
  gaze: P; // -1…1 по каждой оси (направление взгляда в кадре)
  blink: number; // 0 — открыты, 1 — закрыты
  eyeOpen: number; // 1 — обычно, >1 — шире (удивление), <1 — прищур
  browL: number; // подъём брови -1…1
  browR: number;
  browIn: number; // + — внутренние концы вверх (интерес, сочувствие), − — нахмурены
  smile: number; // 0…1
  mouthOpen: number; // 0…1
  mouthWide: number; // 0…1
  mouthRound: number; // 0…1
};

export const FACE0: Face = {
  gaze: { x: 0, y: 0 },
  blink: 0,
  eyeOpen: 1,
  browL: 0,
  browR: 0,
  browIn: 0,
  smile: 0.25,
  mouthOpen: 0,
  mouthWide: 0,
  mouthRound: 0,
};

const mixArm = (a: ArmPose, b: ArmPose, t: number): ArmPose => ({
  a1: lerpAngle(a.a1, b.a1, t),
  a2: lerpAngle(a.a2, b.a2, t),
  target: a.target && b.target ? lerpP(a.target, b.target, t) : t < 0.5 ? a.target : b.target,
  bend: t < 0.5 ? a.bend : b.bend,
  hand: t < 0.5 ? a.hand : b.hand,
  handRot: lerp(a.handRot, b.handRot, t),
  handAbs: a.handAbs !== undefined && b.handAbs !== undefined ? lerp(a.handAbs, b.handAbs, t) : t < 0.5 ? a.handAbs : b.handAbs,
  front: t < 0.5 ? a.front : b.front,
  palm: t < 0.5 ? a.palm : b.palm,
  ...(a.f !== undefined || b.f !== undefined ? { f: lerp(a.f ?? 1, b.f ?? 1, t) } : {}),
});

const mixLeg = (a: LegPose, b: LegPose, t: number): LegPose => ({
  a1: lerpAngle(a.a1, b.a1, t),
  a2: lerpAngle(a.a2, b.a2, t),
  f1: lerp(a.f1, b.f1, t),
  f2: lerp(a.f2, b.f2, t),
  footA: lerpAngle(a.footA, b.footA, t),
  footF: lerp(a.footF, b.footF, t),
});

export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return {
    hip: lerpP(a.hip, b.hip, t),
    lean: lerp(a.lean, b.lean, t),
    bodyYaw: lerp(a.bodyYaw, b.bodyYaw, t),
    headYaw: lerp(a.headYaw, b.headYaw, t),
    headPitch: lerp(a.headPitch, b.headPitch, t),
    headTilt: lerp(a.headTilt, b.headTilt, t),
    shoulderUp: lerp(a.shoulderUp, b.shoulderUp, t),
    armL: mixArm(a.armL, b.armL, t),
    armR: mixArm(a.armR, b.armR, t),
    legL: mixLeg(a.legL, b.legL, t),
    legR: mixLeg(a.legR, b.legR, t),
    legsFront: t < 0.5 ? a.legsFront : b.legsFront,
    legOrder: t < 0.5 ? a.legOrder : b.legOrder,
  };
};

export const mixFace = (a: Face, b: Face, t: number): Face => ({
  gaze: lerpP(a.gaze, b.gaze, t),
  blink: lerp(a.blink, b.blink, t),
  eyeOpen: lerp(a.eyeOpen, b.eyeOpen, t),
  browL: lerp(a.browL, b.browL, t),
  browR: lerp(a.browR, b.browR, t),
  browIn: lerp(a.browIn, b.browIn, t),
  smile: lerp(a.smile, b.smile, t),
  mouthOpen: lerp(a.mouthOpen, b.mouthOpen, t),
  mouthWide: lerp(a.mouthWide, b.mouthWide, t),
  mouthRound: lerp(a.mouthRound, b.mouthRound, t),
});
