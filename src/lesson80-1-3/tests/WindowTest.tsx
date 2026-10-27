// Технический лист уголка у окна: комната урока 1, открытая створка,
// занавеска на ветру, столик с настоящей вертушкой в подставке, учитель
// держит палочку (кулак — как в режиссуре), 25 учеников на ковре.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HERO_SEATS, SEATS, scaleAt } from "../../lesson01/layout";
import { Character } from "../../lesson01/rig/Character";
import { dist, mul, sub, type P } from "../../lesson01/rig/geom";
import { AMIR, BILAL, EXTRA_KIDS, TEACHER, YUSUF } from "../../lesson01/rig/looks";
import { FACE0, type Pose } from "../../lesson01/rig/pose";
import { sitCross, stand, toLocal } from "../../lesson01/rig/presets";
import { solveRig } from "../../lesson01/rig/solve";
import { RoomBack } from "../../lesson01/sets/Room";
import { PW_GRIP, PinwheelInStand, pinwheelInStandPoint } from "../sets/pinwheel";
import { Curtain, OpenWindow, WT, WT_HUB, WT_S, WT_STAND, WT_TEACHER, WT_TOP_Y, WindowTable } from "../sets/windowCorner";

const f = (n: number) => n.toFixed(2);

export type WindowTestProps = { view: "room" | "corner" | "window" | "table" };

const VB: Record<WindowTestProps["view"], string> = {
  room: "0 0 3840 2160",
  corner: "1633 150 2134 1200",
  window: "2080 180 1334 750",
  table: "2160 700 640 360",
};

// Кулак на вертикальной палочке (как fistOn в режиссуре): локоть наружу и
// вниз, середина кулака — в точке захвата.
const fistOn = (pose: Pose, root: P, sc: number, grip: P): Pose => {
  let wrist = grip;
  let p = pose;
  for (let i = 0; i < 3; i++) {
    let best: { p: Pose; score: number } | null = null;
    for (const bend of [1, -1]) {
      const q: Pose = { ...pose, armR: { ...pose.armR, a1: 0, a2: 0, target: toLocal(wrist, root, sc), bend, hand: "fist", handRot: 0, handAbs: undefined, front: true } };
      const E = solveRig(TEACHER, q).arms.R.E;
      const score = E.x + 0.8 * E.y;
      if (!best || score > best.score) best = { p: q, score };
    }
    p = best!.p;
    const g = solveRig(TEACHER, p).arms.R;
    const d = sub(g.W, g.E);
    wrist = sub(grip, mul(d, (TEACHER.body.hand * 0.42 * sc) / (Math.hypot(d.x, d.y) || 1)));
  }
  return p;
};

export const WindowTest: React.FC<WindowTestProps> = ({ view = "room" }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const heroes: Record<number, typeof YUSUF> = { [HERO_SEATS.yusuf]: YUSUF, [HERO_SEATS.amir]: AMIR, [HERO_SEATS.bilal]: BILAL };
  type Item = { y: number; el: React.ReactNode };
  const items: Item[] = [];
  let k = 0;
  SEATS.forEach((seat, i) => {
    const look = heroes[i] ?? EXTRA_KIDS[k++].look;
    const face = { ...FACE0, gaze: { x: -0.5, y: 0.1 } };
    items.push({ y: seat.y, el: <Character key={look.key} uid={look.key} look={look} pose={sitCross(look, -0.45)} face={face} x={seat.x} y={seat.y} scale={scaleAt(seat.y)} /> });
  });
  // учитель держит палочку вертушки, стоящей в подставке
  const root = WT_TEACHER;
  const ts = scaleAt(root.y);
  const grip = pinwheelInStandPoint(PW_GRIP, WT_STAND.x, WT_STAND.y, WT_S);
  const pose = fistOn(stand(TEACHER, 0.45), root, ts, grip);
  const rig = solveRig(TEACHER, pose);
  const reach = dist(rig.arms.R.S, pose.armR.target!) / (TEACHER.body.upperArm + TEACHER.body.foreArm);
  const elbow = { x: root.x + rig.arms.R.E.x * ts, y: root.y + rig.arms.R.E.y * ts };
  items.push({ y: root.y, el: <Character key="teacher" uid="teacher" look={TEACHER} pose={pose} face={{ ...FACE0, gaze: { x: 0.6, y: 0.3 } }} x={root.x} y={root.y} scale={ts} /> });
  items.push({ y: WT.floorY, el: <WindowTable key="table" /> });
  items.push({ y: WT.floorY + 0.5, el: <PinwheelInStand key="pw" x={WT_STAND.x} y={WT_STAND.y} s={WT_S} angle={-290 * t} /> });
  items.sort((a, b) => a.y - b.y);
  return (
    <AbsoluteFill style={{ background: "#F6F1E8" }}>
      <svg width={1920} height={1080} viewBox={VB[view]}>
        <RoomBack t={t} />
        <OpenWindow t={t} />
        <Curtain t={t} wind={1} />
        {items.map((i) => i.el)}
        {view === "table" ? (
          <g>
            <circle cx={f(WT_HUB.x)} cy={f(WT_HUB.y)} r={2.5} fill="#c8352e" />
            <text x={2170} y={720} fontSize={12} fill="#3b2c26" fontFamily="monospace">
              {`reach ${(reach * 100).toFixed(0)}%  hub ${f(WT_HUB.x)},${f(WT_HUB.y)}  stand ${f(WT_STAND.x)},${f(WT_STAND.y)}  top ${f(WT_TOP_Y)}  elbow ${f(elbow.x)},${f(elbow.y)}`}
            </text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
