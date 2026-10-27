// Бытовая вставка: прихожая дома перед уроком. Папа поправляет Амиру
// воротник куртки, мама — рукав. Без реплик. Здесь можно быть в обуви:
// это дом, а не ковёр учебной комнаты.
import React from "react";
import { Character, solveRig } from "../rig/Character";
import { type P, add, mul } from "../rig/geom";
import { AMIR, FATHER, type Look, MOTHER, OUTLINE } from "../rig/looks";
import { FACE0, type Face, type Pose } from "../rig/pose";
import { kneel, stand, toLocal } from "../rig/presets";
import { lookAt } from "../anim";

const f = (n: number) => n.toFixed(1);

// Амир в куртке: под ней тот же голубой свитшот.
export const AMIR_COAT: Look = {
  ...AMIR,
  key: "amirCoat",
  top: "jacket",
  coat: true,
  topColor: "#d0843f",
  topShade: "#b46d2f",
  undershirt: AMIR.topColor,
};
const SHOE = "#4a3426";

const Shoe: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <path d={`M ${f(x)} ${f(y)} q ${f(-4 * s)} ${f(-22 * s)} ${f(18 * s)} ${f(-24 * s)} l ${f(30 * s)} ${f(6 * s)} q ${f(26 * s)} ${f(6 * s)} ${f(24 * s)} ${f(18 * s)} Z`} fill={c} stroke={OUTLINE} strokeWidth={3} />
);

const HomeBack: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#f1e4cf" />
    <rect x={0} y={760} width={1920} height={320} fill="#b98a5e" />
    {Array.from({ length: 12 }, (_, i) => (
      <path key={i} d={`M ${i * 170} 760 L ${i * 170 - 60} 1080`} stroke="#a77a50" strokeWidth={3} />
    ))}
    <rect x={0} y={740} width={1920} height={22} fill="#d8c3a2" />
    {/* дверь */}
    <rect x={110} y={140} width={330} height={620} rx={8} fill="#9c6a40" stroke={OUTLINE} strokeWidth={4} />
    <rect x={150} y={190} width={250} height={240} rx={6} fill="#8a5b36" />
    <rect x={150} y={470} width={250} height={240} rx={6} fill="#8a5b36" />
    <circle cx={400} cy={460} r={14} fill="#e2c37a" stroke={OUTLINE} strokeWidth={3} />
    {/* вешалка */}
    <rect x={1460} y={250} width={340} height={20} rx={6} fill="#8a5b36" stroke={OUTLINE} strokeWidth={3} />
    {[1500, 1590, 1680, 1760].map((x) => (
      <circle key={x} cx={x} cy={282} r={9} fill="#d9b46a" stroke={OUTLINE} strokeWidth={2} />
    ))}
    <path d="M 1590 290 C 1560 360 1560 520 1585 560 L 1665 560 C 1680 500 1660 360 1630 290 Z" fill="#6d7f99" stroke={OUTLINE} strokeWidth={3} />
    <path d="M 1680 290 C 1690 380 1700 470 1690 520 L 1730 520 C 1740 450 1730 360 1705 290 Z" fill="#c65c49" stroke={OUTLINE} strokeWidth={3} />
    {/* полка для обуви */}
    <rect x={1470} y={660} width={340} height={100} rx={6} fill="#a87347" stroke={OUTLINE} strokeWidth={3} />
    <rect x={1480} y={700} width={320} height={8} fill="#8a5b36" />
    <Shoe x={1490} y={700} s={1} c={SHOE} />
    <Shoe x={1560} y={700} s={1} c={SHOE} />
    <Shoe x={1650} y={700} s={0.8} c="#2f4f6f" />
    <Shoe x={1710} y={700} s={0.8} c="#2f4f6f" />
    {/* коврик */}
    <ellipse cx={980} cy={1010} rx={520} ry={60} fill="#7d9bb5" opacity={0.85} />
    {/* окно с занавеской */}
    <rect x={620} y={120} width={330} height={300} rx={8} fill="#cde6f2" stroke={OUTLINE} strokeWidth={4} />
    <path d="M 620 120 h 120 v 300 h -120 Z" fill="#e8d3b0" opacity={0.9} />
  </g>
);

// Позиции в кадре (1920×1080): корень — точка на полу. Папа и мама
// присели по сторонам от Амира: руки не перекрывают лица.
const AM = { x: 1000, y: 1010, s: 1.08 };
const DAD = { x: 760, y: 1030, s: 1.0 };
const MOM = { x: 1250, y: 1025, s: 1.0 };

export const HomeSet: React.FC<{ t: number; u: number }> = ({ t, u }) => {
  // Амир стоит; правая (у края экрана) рука чуть отведена к маме
  const aPose: Pose = { ...stand(AMIR_COAT, 0.05), armR: { a1: 24, a2: 14, hand: "relaxed", handRot: 0 } };
  const ar = solveRig(AMIR_COAT, aPose);
  const W = (p: P) => add({ x: AM.x, y: AM.y }, mul(p, AM.s));
  const collarL = W({ x: ar.shoulderL.x + 8, y: ar.shoulderL.y - 6 });
  const wristR = W(ar.arms.R.W);
  // папа: дальняя рука поправляет воротник (небольшое движение), ближняя — на колене
  const k = Math.sin(t * 3.1) * 5;
  const dBase = kneel(FATHER, 0.5);
  const dPose: Pose = {
    ...dBase,
    headPitch: -0.1,
    armR: { a1: 0, a2: 0, target: toLocal({ x: collarL.x - 6, y: collarL.y + 4 + k }, DAD, DAD.s), bend: 1, hand: "grip", handRot: 0, handAbs: 150 },
  };
  // мама: дальняя рука поправляет манжету рукава
  const m = Math.sin(t * 2.4 + 1) * 6;
  const mBase = kneel(MOTHER, -0.5);
  const mPose: Pose = {
    ...mBase,
    headPitch: 0.1,
    armL: { a1: 0, a2: 0, target: toLocal({ x: wristR.x + 26 + m, y: wristR.y - 18 }, MOM, MOM.s), bend: -1, hand: "grip", handRot: 0, handAbs: -100 },
  };
  // Амир смотрит на папу, потом на маму и улыбается
  const aHead = W(ar.headC);
  const tgt = u < 0.55 ? { x: DAD.x, y: 520 } : { x: MOM.x, y: 560 };
  const la = lookAt(tgt.x - aHead.x, tgt.y - aHead.y);
  const aFace: Face = { ...FACE0, smile: 0.75, gaze: la.gaze, blink: (t % 3.1) < 0.18 ? 1 - Math.abs((t % 3.1) - 0.09) / 0.09 : 0 };
  const dFace: Face = { ...FACE0, smile: 0.6, gaze: { x: 0.6, y: 0.1 } };
  const mFace: Face = { ...FACE0, smile: 0.65, gaze: { x: -0.6, y: 0.1 } };
  return (
    <g>
      <HomeBack />
      <Character uid="home-amir" look={AMIR_COAT} pose={{ ...aPose, headYaw: la.yaw * 0.8, headPitch: la.pitch * 0.6 }} face={aFace} x={AM.x} y={AM.y} scale={AM.s} />
      <ShoesOn x={AM.x} y={AM.y} s={AM.s} look={AMIR_COAT} pose={aPose} />
      <Character uid="home-dad" look={FATHER} pose={dPose} face={dFace} x={DAD.x} y={DAD.y} scale={DAD.s} />
      <Character uid="home-mom" look={MOTHER} pose={mPose} face={mFace} x={MOM.x} y={MOM.y} scale={MOM.s} />
    </g>
  );
};

// Уличная обувь Амира в прихожей (поверх носков).
const ShoesOn: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose }> = ({ x, y, s, look, pose }) => {
  const r = solveRig(look, pose);
  return (
    <g>
      {(["L", "R"] as const).map((side) => {
        const A = r.legs[side].A;
        return <Shoe key={side} x={x + (A.x - 30) * s} y={y + 4} s={0.95 * s} c="#3a4a5a" />;
      })}
    </g>
  );
};
