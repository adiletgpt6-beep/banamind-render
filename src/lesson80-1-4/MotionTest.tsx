// Технический лист движений ролика 80-1-4: раскадровки ходьбы, подъёма с
// ковра и посадки (12 моментов в ряд). Точки — мировые положения щиколоток:
// у опорной стопы точка не должна смещаться между соседними кадрами.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { scaleAt } from "../lesson01/layout";
import { Character } from "../lesson01/rig/Character";
import { AMIR, BILAL, type Look, TEACHER, YUSUF } from "../lesson01/rig/looks";
import { FACE0, type Pose } from "../lesson01/rig/pose";
import { kneel, sitCross, stand } from "../lesson01/rig/presets";
import { RoomBack } from "../lesson01/sets/Room";
import { ankleWorld, halfKneel, kneelTall, poseSeq, type Walk, walkAt } from "./rig/motion";

type Sample = { look: Look; pose: Pose; root: { x: number; y: number }; sc: number };

const Panel: React.FC<{ s: Sample; i: number; cam: { cx: number; cy: number; w: number }; marks: { x: number; y: number }[] }> = ({ s, i, cam, marks }) => {
  const vh = cam.w * 1.6875;
  const col = i % 6;
  const row = Math.floor(i / 6);
  return (
    <svg x={col * 320} y={row * 540} width={320} height={540} viewBox={`${cam.cx - cam.w / 2} ${cam.cy - vh / 2} ${cam.w} ${vh}`}>
      <RoomBack t={0} />
      <Character uid={`m${i}`} look={s.look} pose={s.pose} face={FACE0} x={s.root.x} y={s.root.y} scale={s.sc} />
      {marks.map((m, k) => (
        <circle key={k} cx={m.x} cy={m.y} r={cam.w * 0.008} fill={k % 2 ? "#ff3b30" : "#ffd60a"} stroke="#000" strokeWidth={cam.w * 0.002} />
      ))}
      <line x1={cam.cx - cam.w} x2={cam.cx + cam.w} y1={s.root.y} y2={s.root.y} stroke="#fff" strokeOpacity={0.35} strokeWidth={cam.w * 0.002} />
      <text x={cam.cx - cam.w / 2 + cam.w * 0.03} y={cam.cy - vh / 2 + cam.w * 0.08} fontSize={cam.w * 0.07} fill="#fff" stroke="#000" strokeWidth={cam.w * 0.004}>
        {i}
      </text>
    </svg>
  );
};

const walkStrip = (look: Look, w: Walk): Sample[] =>
  Array.from({ length: 12 }, (_, i) => {
    const t = w.t0 - 0.1 + ((w.dur + 0.3) * i) / 11;
    const ws = walkAt(look, w, t);
    return { look, pose: ws.pose, root: ws.root, sc: ws.scale };
  });

const seqStrip = (look: Look, keys: { at: number; pose: Pose }[], root: { x: number; y: number }): Sample[] => {
  const T = keys[keys.length - 1].at;
  return Array.from({ length: 12 }, (_, i) => ({ look, pose: poseSeq(keys, (T * i) / 11), root, sc: scaleAt(root.y) }));
};

export const YUSUF_WALK: Walk = { path: [{ x: 1862, y: 2070 }, { x: 1895, y: 1985 }, { x: 1880, y: 1925 }, { x: 1720, y: 1906 }], t0: 0, dur: 2.6, steps: 5, yaw: -0.55, lift: 0.18, bounce: 0.03 };
export const AMIR_WALK: Walk = { path: [{ x: 2250, y: 2070 }, { x: 1855, y: 2055 }], t0: 0, dur: 2.2, steps: 4, yaw: -0.55, bounce: 0.02 };
export const BILAL_WALK: Walk = { path: [{ x: 2085, y: 1900 }, { x: 1400, y: 1886 }], t0: 0, dur: 3.2, steps: 6, yaw: -0.55 };

export const MotionTest: React.FC = () => {
  const fr = useCurrentFrame();
  let samples: Sample[] = [];
  let camW = 420;
  if (fr === 0) samples = walkStrip(YUSUF, YUSUF_WALK);
  if (fr === 1) {
    samples = walkStrip(AMIR, AMIR_WALK);
    camW = 520;
  }
  if (fr === 2) {
    samples = walkStrip(BILAL, BILAL_WALK);
    camW = 600;
  }
  if (fr === 3) {
    const y = -0.5;
    samples = seqStrip(
      YUSUF,
      [
        { at: 0, pose: sitCross(YUSUF, y) },
        { at: 0.5, pose: kneel(YUSUF, y) },
        { at: 0.9, pose: kneelTall(YUSUF, y) },
        { at: 1.35, pose: halfKneel(YUSUF, y) },
        { at: 1.85, pose: stand(YUSUF, y) },
      ],
      { x: 1862, y: 2070 },
    );
  }
  if (fr === 4) {
    const y = -0.5;
    samples = seqStrip(
      YUSUF,
      [
        { at: 0, pose: stand(YUSUF, y) },
        { at: 0.45, pose: halfKneel(YUSUF, y) },
        { at: 0.85, pose: kneelTall(YUSUF, y) },
        { at: 1.3, pose: kneel(YUSUF, y) },
      ],
      { x: 1720, y: 1906 },
    );
  }
  if (fr === 5) {
    const y = -0.5;
    camW = 520;
    samples = seqStrip(
      AMIR,
      [
        { at: 0, pose: stand(AMIR, y) },
        { at: 0.45, pose: halfKneel(AMIR, y) },
        { at: 0.85, pose: kneelTall(AMIR, y) },
        { at: 1.3, pose: kneel(AMIR, y) },
      ],
      { x: 1855, y: 2055 },
    );
  }
  if (fr === 6) {
    const y = 0.5;
    camW = 760;
    samples = seqStrip(
      TEACHER,
      [
        { at: 0, pose: stand(TEACHER, y) },
        { at: 0.5, pose: halfKneel(TEACHER, y) },
        { at: 0.95, pose: kneelTall(TEACHER, y) },
        { at: 1.4, pose: kneel(TEACHER, y) },
      ],
      { x: 1290, y: 2004 },
    );
  }
  return (
    <AbsoluteFill style={{ background: "#222" }}>
      <svg width={1920} height={1080}>
        {samples.map((s, i) => {
          const a = ankleWorld(s.look, s.pose, s.root, s.sc);
          const cx = s.root.x;
          const cy = s.root.y - s.look.body.height * s.sc * 0.45;
          return <Panel key={i} s={s} i={i} cam={{ cx, cy, w: camW }} marks={[a.L, a.R]} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
