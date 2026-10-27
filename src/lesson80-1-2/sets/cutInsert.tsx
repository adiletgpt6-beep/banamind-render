// Крупная вставка разреза (сцена 1): то же яблоко на той же тарелке, крупно.
// Левая кисть учителя придерживает яблоко за левый бок, правая держит нож
// (рукоять справа, лезвие влево) и ведёт его сверху вниз через середину.
// Лезвие внутри яблока скрыто (разрез проходит в плоскости кадра); на
// поверхности остаётся тонкая линия разреза. Цвета кожи и одежды — учителя.
import React from "react";
import { OUTLINE } from "../../lesson01/rig/looks";
import { TEACHER } from "../../lesson01/rig/looks";
import { APPLE, Apple, appleOutline, Knife, Plate } from "./props";

const f = (n: number) => n.toFixed(1);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

const S = 8; // масштаб предметов во вставке
const PLATE_C = { x: 930, y: 900 };
const APPLE_B = { x: 930, y: PLATE_C.y - 6 * S }; // опора яблока
const SKIN = TEACHER.skin;
const SHADE = TEACHER.skinShade;
const SLEEVE = TEACHER.topColor;
const SLEEVE_D = TEACHER.topShade;
const CUFF = "#f7f7f3";
const OW = 5;

// Левая кисть: тыльная сторона слева, пальцы лежат на левом боку яблока.
const LeftHand: React.FC<{ squeeze: number }> = ({ squeeze }) => {
  const x0 = APPLE_B.x - (APPLE.w / 2) * S + 8; // левый край яблока
  const y0 = APPLE_B.y - (APPLE.h / 2) * S + 10; // середина высоты
  const sq = squeeze * 4;
  const finger = (dy: number, len: number, w: number, k: number) => {
    const sx = x0 - 18;
    const sy = y0 + dy;
    const ex = x0 + len;
    const ey = sy + len * 0.32 + k;
    return (
      <g key={dy}>
        <path d={`M ${f(sx)} ${f(sy)} Q ${f(x0 + len * 0.45)} ${f(sy - 10 - sq)} ${f(ex)} ${f(ey)}`} fill="none" stroke={OUTLINE} strokeWidth={w + OW * 2} strokeLinecap="round" />
        <path d={`M ${f(sx)} ${f(sy)} Q ${f(x0 + len * 0.45)} ${f(sy - 10 - sq)} ${f(ex)} ${f(ey)}`} fill="none" stroke={SKIN} strokeWidth={w} strokeLinecap="round" />
        <path d={`M ${f(ex - 14)} ${f(ey - 6)} q 8 2 12 8`} fill="none" stroke={SHADE} strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${f(x0 + len * 0.42)} ${f(sy + len * 0.08 - 2)} q 4 6 2 12`} fill="none" stroke={SHADE} strokeWidth={3.5} strokeLinecap="round" />
      </g>
    );
  };
  return (
    <g>
      {/* рукав и манжета */}
      <path d={`M -80 ${f(y0 - 150)} L ${f(x0 - 300)} ${f(y0 - 105)} L ${f(x0 - 300)} ${f(y0 + 95)} L -80 ${f(y0 + 150)} Z`} fill={SLEEVE} stroke={OUTLINE} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M -80 ${f(y0 - 40)} L ${f(x0 - 300)} ${f(y0 - 20)}`} stroke={SLEEVE_D} strokeWidth={10} />
      <path d={`M ${f(x0 - 300)} ${f(y0 - 108)} L ${f(x0 - 250)} ${f(y0 - 100)} L ${f(x0 - 250)} ${f(y0 + 90)} L ${f(x0 - 300)} ${f(y0 + 98)} Z`} fill={CUFF} stroke={OUTLINE} strokeWidth={OW} strokeLinejoin="round" />
      {/* тыльная сторона кисти */}
      <path d={`M ${f(x0 - 255)} ${f(y0 - 88)} C ${f(x0 - 170)} ${f(y0 - 112)} ${f(x0 - 60)} ${f(y0 - 100)} ${f(x0 - 10)} ${f(y0 - 76)} L ${f(x0 - 6)} ${f(y0 + 74)} C ${f(x0 - 70)} ${f(y0 + 96)} ${f(x0 - 180)} ${f(y0 + 92)} ${f(x0 - 255)} ${f(y0 + 80)} Z`} fill={SKIN} stroke={OUTLINE} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M ${f(x0 - 200)} ${f(y0 - 50)} q 70 -8 150 6 M ${f(x0 - 205)} ${f(y0 + 10)} q 75 -4 160 8`} fill="none" stroke={SHADE} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      {/* большой палец — сверху на яблоке */}
      <path d={`M ${f(x0 - 70)} ${f(y0 - 92)} C ${f(x0 - 20)} ${f(y0 - 150)} ${f(x0 + 40)} ${f(y0 - 165)} ${f(x0 + 80)} ${f(y0 - 150)}`} fill="none" stroke={OUTLINE} strokeWidth={44 + OW * 2} strokeLinecap="round" />
      <path d={`M ${f(x0 - 70)} ${f(y0 - 92)} C ${f(x0 - 20)} ${f(y0 - 150)} ${f(x0 + 40)} ${f(y0 - 165)} ${f(x0 + 80)} ${f(y0 - 150)}`} fill="none" stroke={SKIN} strokeWidth={44} strokeLinecap="round" />
      {/* четыре пальца обхватывают левый бок */}
      {finger(-62, 96, 40, 0)}
      {finger(-16, 108, 42, 2)}
      {finger(30, 100, 40, 3)}
      {finger(72, 80, 36, 2)}
    </g>
  );
};

// Правая кисть — кулак на рукояти ножа; предплечье уходит вверх из кадра.
const RightFist: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${f(x)} ${f(y)})`}>
    {/* рукав и манжета: предплечье сверху */}
    <path d="M -40 -560 L 130 -560 L 120 -150 L -40 -140 Z" fill={SLEEVE} stroke={OUTLINE} strokeWidth={OW} strokeLinejoin="round" />
    <path d="M 70 -560 L 66 -160" stroke={SLEEVE_D} strokeWidth={12} />
    <path d="M -46 -150 L 124 -158 L 122 -108 L -44 -100 Z" fill={CUFF} stroke={OUTLINE} strokeWidth={OW} strokeLinejoin="round" />
    {/* тыльная сторона кулака, костяшки внизу на рукояти */}
    <path d="M -56 -104 C -40 -116 100 -120 120 -104 C 140 -60 136 0 116 40 C 70 64 -20 66 -60 40 C -80 0 -78 -60 -56 -104 Z" fill={SKIN} stroke={OUTLINE} strokeWidth={OW} strokeLinejoin="round" />
    {/* согнутые пальцы под рукоятью (видны спереди) */}
    {[-36, 6, 48, 88].map((fx, i) => (
      <path key={i} d={`M ${fx} 20 q 20 ${f(30 + (i % 2) * 4)} 40 0`} fill={SKIN} stroke={OUTLINE} strokeWidth={OW} strokeLinejoin="round" />
    ))}
    <path d="M -30 -44 q 60 -14 130 0" fill="none" stroke={SHADE} strokeWidth={4} strokeLinecap="round" />
    {/* большой палец поверх рукояти */}
    <path d="M -64 -10 C -50 34 -10 44 30 30" fill="none" stroke={OUTLINE} strokeWidth={40 + OW * 2} strokeLinecap="round" />
    <path d="M -64 -10 C -50 34 -10 44 30 30" fill="none" stroke={SKIN} strokeWidth={40} strokeLinecap="round" />
  </g>
);

// u: 0…1 — от «нож над яблоком» до «нож поднят после разреза».
export const CutInsert: React.FC<{ u: number; t: number }> = ({ u, t }) => {
  const appleTop = APPLE_B.y - APPLE.h * S;
  const edgeTop = appleTop - 70;
  const edgeBot = APPLE_B.y - 6;
  // фазы: подвод (0–0.15), разрез (0.15–0.82), подъём (0.82–1)
  let edgeY: number;
  let kx = 0;
  if (u < 0.15) edgeY = lerp(edgeTop - 120, appleTop + 4, ease(u / 0.15));
  else if (u < 0.82) {
    const q = (u - 0.15) / 0.67;
    edgeY = lerp(appleTop + 4, edgeBot, ease(q));
    kx = Math.sin(q * Math.PI * 4) * 10;
  } else edgeY = lerp(edgeBot, edgeTop - 160, ease((u - 0.82) / 0.18));
  const cut = clamp((u - 0.15) / 0.67);
  const kxW = APPLE_B.x + 38 * S + kx; // центр рукояти
  const kyW = edgeY - 3.2 * S;
  const zoom = 1.28 + u * 0.03;
  return (
    <svg width={1920} height={1080} viewBox={`${900 - 960 / zoom} ${650 - 540 / zoom} ${1920 / zoom} ${1080 / zoom}`}>
      <defs>
        <linearGradient id="ci-table" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c08757" />
          <stop offset="1" stopColor="#cf9a69" />
        </linearGradient>
        <mask id="ci-blade" maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1200}>
          <rect x={0} y={0} width={1920} height={1200} fill="#fff" />
          {cut > 0 || u > 0.14 ? <path d={appleOutline()} transform={`translate(${APPLE_B.x} ${APPLE_B.y}) scale(${S})`} fill="#000" /> : null}
        </mask>
      </defs>
      {/* ковёр и стена вдали — мягко, без деталей */}
      <rect x={-100} y={-100} width={2120} height={420} fill="#3e74a3" />
      <rect x={-100} y={180} width={2120} height={12} fill="#d8bf86" opacity={0.5} />
      {/* столешница */}
      <path d="M -100 300 L 2020 300 L 2020 1200 L -100 1200 Z" fill="url(#ci-table)" />
      <path d="M -100 300 L 2020 300" stroke={OUTLINE} strokeWidth={6} />
      <path d="M 200 620 Q 900 600 1800 640" fill="none" stroke="#b07a4c" strokeWidth={6} opacity={0.45} />
      <path d="M -100 470 Q 600 455 1300 480" fill="none" stroke="#b07a4c" strokeWidth={4} opacity={0.35} />
      <Plate x={PLATE_C.x} y={PLATE_C.y} s={S} />
      <Apple x={APPLE_B.x} y={APPLE_B.y} s={S} cut={cut} />
      {/* нож: лезвие внутри яблока скрыто */}
      <g mask="url(#ci-blade)">
        <Knife x={kxW} y={kyW} s={S} flip />
      </g>
      <LeftHand squeeze={0.5 + 0.5 * Math.sin(t * 2)} />
      <RightFist x={kxW - 20} y={kyW - 4} />
    </svg>
  );
};
