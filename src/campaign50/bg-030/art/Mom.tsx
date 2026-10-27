// Мама BG-030 на проверенном риге 2D-роликов (src/two-schedules-2d/rig,
// импорт без изменений). Свой образ (горчичный кардиган, волосы в
// пучок — не мама ролика №12) и губы только по своей реплике m01:
// реплики BG-030 передаются в lipAt в формате рига.
import { useMemo } from "react";
import { lipAt, type Viseme } from "../../../two-schedules-2d/context";
import { Figure, type FigureLayer } from "../../../two-schedules-2d/rig/Figure";
import { LOOKS, type Look } from "../../../two-schedules-2d/rig/looks";
import { blinkAt } from "../../../two-schedules-2d/rig/motion";
import { EXPR, REST, type ArmState, type Expression, type ExprId, type Pose } from "../../../two-schedules-2d/rig/pose";
import type { Ts2Cue } from "../../../two-schedules-2d/timing";
import { useScene, useTimeline } from "../context";
import { C } from "../palette";

export const MOM_LOOK: Look = {
  ...LOOKS.mom,
  hair: "#231A17",
  hairStyle: "bun",
  top: "cardigan",
  topColor: C.momTop,
  topShade: C.momTopShade,
  inner: "#FFFFFF",
  bottom: "#2F3D63",
  lips: "#B0625C",
};

export type MomPose = {
  readonly armL?: ArmState; // цели кистей — в единицах рисунка (ступни в 0,0)
  readonly armR?: ArmState;
  readonly expr?: ExprId | Expression;
  readonly bodyTurn?: number;
  readonly headTurn?: number;
  readonly lookX?: number;
  readonly lookY?: number;
  readonly headTilt?: number;
  readonly nod?: number;
  readonly lean?: number;
  readonly sit?: number;
  readonly seat?: number;
};

// Персонаж в точке (x, y) мира (ступни), рост h px.
export const Mom: React.FC<{
  readonly uid: string;
  readonly f: number; // кадр сцены
  readonly x: number;
  readonly y: number;
  readonly h: number;
  readonly pose: MomPose;
  readonly layer?: FigureLayer;
  readonly speaks?: boolean;
}> = ({ uid, f, x, y, h, pose, layer, speaks }) => {
  const tl = useTimeline();
  const { from } = useScene();
  const cues = useMemo(() => tl.cues.filter((c) => c.role === "mother") as unknown as Ts2Cue[], [tl]);
  const mouth: Viseme = speaks ? lipAt(cues, "mother", f + from) : { open: 0, round: 0, wide: 0 };
  const k = h / 1000;
  const expr: Expression = typeof pose.expr === "string" ? EXPR[pose.expr] : (pose.expr ?? EXPR.calm);
  const full: Pose = {
    bodyTurn: pose.bodyTurn ?? 0,
    headTurn: pose.headTurn ?? 0,
    lookX: pose.lookX ?? 0,
    lookY: pose.lookY ?? 0,
    headTilt: pose.headTilt ?? 0,
    nod: pose.nod ?? 0,
    lean: pose.lean ?? 0,
    sit: pose.sit ?? 0,
    seat: pose.seat ?? 0,
    crouch: 0,
    walkPhase: 0,
    walkAmt: 0,
    walkDir: 0,
    armL: pose.armL ?? REST,
    armR: pose.armR ?? REST,
    expr,
    mouth,
    blink: blinkAt(f, 3),
    shoulders: 0,
    breath: Math.sin((f + 40) / 26),
    hairSway: 0,
    packSway: 0,
    bagOnShoulder: 0,
    strapTug: 0,
    exhale: 0,
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <Figure uid={uid} look={MOM_LOOK} pose={full} layer={layer} />
    </g>
  );
};
