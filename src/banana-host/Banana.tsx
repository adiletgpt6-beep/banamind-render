// Банан — постоянный ведущий серии анимационных объяснений книг. Одна модель на все фильмы:
// тело-банан с плодоножкой, большие глаза с бликами, брови, рот под речь,
// руки в белых перчатках и ножки в ботинках. Точка опоры — между ступнями (0, 0).
import React from "react";
// цвета модели фиксированы, чтобы персонаж выглядел одинаково в любом фильме серии
const C = { banana: "#ffe066", bananaShade: "#f2c230", bananaDark: "#c9961a" };
import type { Face, Pose } from "./rig";

export type BananaProps = {
  pose: Pose;
  face: Face;
  mouthOpen: number; // 0…1
  mouthRound: number; // 0…1
  blink: number; // 0 — открыты, 1 — закрыты
  t: number; // секунды — для дыхания
  talk: number; // 0…1 — активность речи
  // аксессуары «роли» (не меняют модель): очки преподавателя, галстук-бабочка
  glasses?: boolean;
  bowtie?: boolean;
};

const OUTLINE = "#3b2a10";
const LIMB = "#4a3410";

const BODY =
  "M 10 -560 C -92 -522 -152 -385 -142 -250 C -134 -130 -84 -52 -8 -30 C 38 -18 70 -28 82 -52 C 124 -150 134 -302 108 -424 C 92 -494 56 -546 10 -560 Z";
const SHADE =
  "M 10 -560 C 56 -546 92 -494 108 -424 C 134 -302 124 -150 82 -52 C 70 -28 50 -22 34 -22 C 76 -110 92 -280 72 -420 C 62 -488 40 -540 10 -560 Z";
const HIGHLIGHT = "M -96 -430 C -124 -360 -128 -280 -116 -200";

const arm = (side: -1 | 1, sx: number, sy: number, p: Pose["l"], wiggle: number) => {
  const d2r = Math.PI / 180;
  const a1 = (p.a + wiggle) * d2r;
  const a2 = (p.a + p.e + wiggle * 1.6) * d2r;
  const L1 = 92;
  const L2 = 84;
  const ex = sx + side * Math.sin(a1) * L1;
  const ey = sy + Math.cos(a1) * L1;
  const hx = ex + side * Math.sin(a2) * L2;
  const hy = ey + Math.cos(a2) * L2;
  const handAngle = Math.atan2(hy - ey, hx - ex) * (180 / Math.PI);
  return { ex, ey, hx, hy, handAngle };
};

const Hand: React.FC<{ x: number; y: number; angle: number; kind?: string; side: -1 | 1 }> = ({ x, y, angle, kind, side }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    {kind === "point" ? (
      <>
        <rect x={6} y={-7} width={34} height={14} rx={7} fill="#fff" stroke={OUTLINE} strokeWidth={4} />
        <circle r={20} fill="#fff" stroke={OUTLINE} strokeWidth={4} />
      </>
    ) : (
      <>
        <circle r={kind === "fist" ? 19 : 22} fill="#fff" stroke={OUTLINE} strokeWidth={4} />
        {kind !== "fist" && <ellipse cx={4} cy={-18 * side} rx={9} ry={7} fill="#fff" stroke={OUTLINE} strokeWidth={4} />}
      </>
    )}
    <path d="M -10 -14 Q -16 0 -10 14" stroke="#d9d9d9" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

export const Banana: React.FC<BananaProps> = ({ pose, face, mouthOpen, mouthRound, blink, t, talk, glasses, bowtie }) => {
  const breath = Math.sin(t * 2.2) * 0.012;
  const hop = (pose.hop ?? 0) * Math.max(0, Math.sin(t * 7)) * 14;
  const sway = Math.sin(t * 1.3) * 1.2 + talk * Math.sin(t * 4.1) * 1.6;
  const wiggleL = Math.sin(t * 2.6) * 3 + talk * Math.sin(t * 5.3) * 5;
  const wiggleR = Math.sin(t * 2.3 + 1) * 3 + talk * Math.sin(t * 4.7 + 2) * 6;
  const L = arm(-1, -132, -262, pose.l, wiggleL);
  const R = arm(1, 112, -262, pose.r, wiggleR);

  // лицо
  const fx = -14 + face.lookX * 3;
  const fy = -338;
  const eyeRy = 42 * face.eye * Math.max(0.06, 1 - blink);
  const eyeRx = 34 * (0.92 + face.eye * 0.08);
  const px = face.lookX * 12;
  const py = face.lookY * 12;
  const browY = -58 - face.brow * 16;
  const tilt = face.tilt * 14;

  const open = Math.max(0, Math.min(1, mouthOpen));
  const mw = 46 - mouthRound * 16 + face.smile * 6;
  const curve = face.smile * 22;
  const mouthY = 64;
  const top = mouthY - curve * 0.25 - open * 6;
  const bottom = mouthY + curve * 0.6 + 6 + open * 50;

  return (
    <g transform={`translate(0 ${-hop}) rotate(${pose.lean + sway} 0 -20) scale(${1 - breath * 0.5} ${1 + breath})`}>
      {/* ножки */}
      <path d="M -34 -46 L -46 -8" stroke={LIMB} strokeWidth={15} strokeLinecap="round" />
      <path d="M 40 -44 L 50 -8" stroke={LIMB} strokeWidth={15} strokeLinecap="round" />
      <ellipse cx={-62} cy={-6} rx={34} ry={15} fill="#e2574c" stroke={OUTLINE} strokeWidth={4} />
      <ellipse cx={66} cy={-6} rx={34} ry={15} fill="#e2574c" stroke={OUTLINE} strokeWidth={4} />
      <ellipse cx={-70} cy={-12} rx={10} ry={4} fill="#ff9c8f" />
      <ellipse cx={58} cy={-12} rx={10} ry={4} fill="#ff9c8f" />

      {/* рука за телом (левая) */}
      <path d={`M -132 -262 L ${L.ex} ${L.ey} L ${L.hx} ${L.hy}`} stroke={LIMB} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* тело */}
      <path d={BODY} fill={C.banana} stroke={OUTLINE} strokeWidth={6} />
      <path d={SHADE} fill={C.bananaShade} opacity={0.75} />
      <path d="M 24 -548 C 70 -470 84 -300 60 -110" stroke={C.bananaDark} strokeWidth={5} fill="none" opacity={0.45} strokeLinecap="round" />
      <path d={HIGHLIGHT} stroke="#fff8c9" strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.8} />
      <circle cx={-112} cy={-470} r={5} fill="#fff8c9" opacity={0.9} />
      {/* пятнышки */}
      <circle cx={70} cy={-170} r={6} fill={C.bananaDark} opacity={0.5} />
      <circle cx={88} cy={-205} r={4} fill={C.bananaDark} opacity={0.5} />
      <circle cx={-100} cy={-130} r={5} fill={C.bananaDark} opacity={0.4} />
      {/* кончик и плодоножка */}
      <ellipse cx={22} cy={-30} rx={16} ry={10} fill="#5a3d14" />
      <path d="M -6 -552 L 0 -604 Q 8 -620 26 -612 L 30 -600 L 28 -552 Z" fill="#8a6a2c" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={15} cy={-612} rx={14} ry={7} fill="#5a3d14" />

      {/* лицо */}
      <g transform={`translate(${fx} ${fy})`}>
        <ellipse cx={-82} cy={44} rx={22} ry={13} fill="#ff8a7a" opacity={face.cheek} />
        <ellipse cx={78} cy={44} rx={22} ry={13} fill="#ff8a7a" opacity={face.cheek} />
        {[-48, 46].map((ex, i) => (
          <g key={i} transform={`translate(${ex} 0)`}>
            <ellipse rx={eyeRx} ry={eyeRy} fill="#fff" stroke={OUTLINE} strokeWidth={5} />
            {blink < 0.8 && (
              <g transform={`scale(1 ${Math.max(0.1, 1 - blink)})`}>
                <circle cx={px} cy={py + 4} r={17} fill="#2b1d0e" />
                <circle cx={px + 6} cy={py - 3} r={6} fill="#fff" />
                <circle cx={px - 5} cy={py + 11} r={3} fill="#fff" opacity={0.8} />
              </g>
            )}
            <path
              d={`M -30 ${browY + (i === 0 ? tilt : -tilt) * 0.5} Q 0 ${browY - 12} 30 ${browY + (i === 0 ? -tilt : tilt) * 0.5}`}
              stroke={OUTLINE}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              transform={`rotate(${(i === 0 ? 1 : -1) * tilt * 0.6})`}
            />
          </g>
        ))}
        {glasses && (
          <g stroke="#2b1d0e" strokeWidth={7} fill="none">
            <rect x={-48 - 46} y={-44} width={92} height={86} rx={30} fill="#dff3ff" fillOpacity={0.18} />
            <rect x={46 - 46} y={-44} width={92} height={86} rx={30} fill="#dff3ff" fillOpacity={0.18} />
            <path d="M -2 -8 Q 0 -16 2 -8" />
            <path d="M -94 -14 L -128 -24 M 92 -14 L 116 -24" />
          </g>
        )}
        {/* рот */}
        {open < 0.06 ? (
          <path d={`M ${-mw} ${mouthY} Q 0 ${mouthY + curve * 1.4} ${mw} ${mouthY}`} stroke={OUTLINE} strokeWidth={7} fill="none" strokeLinecap="round" />
        ) : (
          <g>
            <path
              d={`M ${-mw} ${mouthY} Q 0 ${top - 6} ${mw} ${mouthY} Q ${mw * 0.7} ${bottom} 0 ${bottom} Q ${-mw * 0.7} ${bottom} ${-mw} ${mouthY} Z`}
              fill="#7a1f2b"
              stroke={OUTLINE}
              strokeWidth={6}
              strokeLinejoin="round"
            />
            {open > 0.35 && <ellipse cx={0} cy={bottom - 9 - open * 3} rx={mw * 0.45} ry={6 + open * 6} fill="#ff7d8a" />}
            <path d={`M ${-mw * 0.6} ${mouthY + 2} Q 0 ${top + 6} ${mw * 0.6} ${mouthY + 2}`} stroke="#fff" strokeWidth={6} fill="none" opacity={open > 0.25 ? 0.9 : 0} />
          </g>
        )}
      </g>

      {bowtie && (
        <g transform="translate(-14 -200)">
          <path d="M 0 0 L -46 -26 Q -54 0 -46 26 Z M 0 0 L 46 -26 Q 54 0 46 26 Z" fill="#c0392b" stroke="#3b2a10" strokeWidth={5} strokeLinejoin="round" />
          <rect x={-12} y={-13} width={24} height={26} rx={7} fill="#e5484d" stroke="#3b2a10" strokeWidth={5} />
        </g>
      )}
      {/* рука перед телом (правая) */}
      <path d={`M 112 -262 L ${R.ex} ${R.ey} L ${R.hx} ${R.hy}`} stroke={LIMB} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Hand x={L.hx} y={L.hy} angle={L.handAngle} kind={pose.l.hand} side={-1} />
      <Hand x={R.hx} y={R.hy} angle={R.handAngle} kind={pose.r.hand} side={1} />
    </g>
  );
};
