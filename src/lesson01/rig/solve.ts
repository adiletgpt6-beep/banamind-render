// Решение рига: координаты суставов по позе (без React — используется и
// в расчётах камеры, и в отрисовке).
import { type P, add, along, ik, rad } from "./geom.ts";
import { headMetrics } from "./headMetrics.ts";
import type { Look } from "./looks.ts";
import type { ArmPose, LegPose, Pose } from "./pose.ts";

export type Rig = {
  hip: P;
  shoulderC: P;
  neckTop: P;
  headC: P;
  shoulderL: P;
  shoulderR: P;
  arms: Record<"L" | "R", { S: P; E: P; W: P; a1: number; a2: number }>;
  legs: Record<"L" | "R", { H: P; K: P; A: P; a1: number; a2: number }>;
};

// Координаты относительно корня (точки на полу), без масштаба.
export const solveRig = (look: Look, pose: Pose): Rig => {
  const b = look.body;
  const hip = pose.hip;
  const shoulderC = along(hip, 180 + pose.lean, b.torso);
  const sy = -pose.shoulderUp;
  const sw = (b.shoulderW / 2) * (1 - 0.2 * Math.abs(pose.bodyYaw));
  const yawShift = pose.bodyYaw * b.shoulderW * 0.06;
  const perp = { x: Math.cos(rad(pose.lean)), y: -Math.sin(rad(pose.lean)) };
  const shoulderL = { x: shoulderC.x - perp.x * sw + yawShift, y: shoulderC.y - perp.y * sw + sy + b.limbW * 0.25 };
  const shoulderR = { x: shoulderC.x + perp.x * sw + yawShift, y: shoulderC.y + perp.y * sw + sy + b.limbW * 0.25 };
  const neckTop = along(shoulderC, 180 + pose.lean * 0.6, b.neck + b.neckW * 0.2);
  const hm = headMetrics(look);
  const headC = add(neckTop, { x: Math.sin(rad(pose.headTilt)) * hm.neckY * 0.3, y: -hm.neckY });
  const arm = (S: P, a: ArmPose, side: -1 | 1) => {
    const f = a.f ?? 1;
    if (a.target) {
      const r = ik(S, a.target, b.upperArm * f, b.foreArm * f, a.bend ?? side);
      return { S, E: r.J, W: r.end, a1: r.a1, a2: r.a2 };
    }
    const E = along(S, a.a1, b.upperArm * f);
    return { S, E, W: along(E, a.a2, b.foreArm * f), a1: a.a1, a2: a.a2 };
  };
  const hipW = b.hipW * 0.3 * (1 - 0.25 * Math.abs(pose.bodyYaw));
  const leg = (side: -1 | 1, l: LegPose) => {
    const H = add(hip, { x: side * hipW, y: 0 });
    const K = along(H, l.a1, b.thigh * l.f1);
    const A = along(K, l.a2, b.shin * l.f2);
    return { H, K, A, a1: l.a1, a2: l.a2 };
  };
  return {
    hip,
    shoulderC,
    neckTop,
    headC,
    shoulderL,
    shoulderR,
    arms: { L: arm(shoulderL, pose.armL, -1), R: arm(shoulderR, pose.armR, 1) },
    legs: { L: leg(-1, pose.legL), R: leg(1, pose.legR) },
  };
};
