import React from "react";
import { Poly, samplePath } from "../engines/ShapeMorphEngine";
import { smoothstep } from "../engines/math";

// Final scene geometry. The hill is the same circle as the Earth's limb at the end of the
// camera move (shape matching), the boy and the question mark are drawn by the golden line.
export const HILL = { cx: 540, cy: 3310, r: 2037 };
export const FEET = { x: 540, y: HILL.cy - HILL.r + 2 };

const BOY_LOCAL =
  "M -24 0 L -4 0 L -6 -64 L 0 -70 L 6 -64 L 6 0 L 28 0 C 28 -4 22 -6 18 -6 L 18 -64 L 24 -98 L 20 -150 " +
  "C 22 -160 26 -168 30 -174 C 36 -178 40 -186 44 -194 L 40 -200 C 40 -206 36 -212 32 -216 " +
  "C 26 -236 -6 -238 -14 -214 C -20 -200 -16 -184 -6 -176 L -8 -166 C -16 -158 -20 -140 -22 -120 " +
  "L -26 -98 L -20 -64 L -24 -6 C -28 -4 -28 -2 -24 0";
const tf = (p: Poly, ox: number, oy: number, s: number) => p.map((q) => ({ x: ox + q.x * s, y: oy + q.y * s }));

export const BOY_POLY: Poly = tf(samplePath(BOY_LOCAL, 14), FEET.x, FEET.y, 1.6);
export const QUESTION_POLY: Poly = tf(
  samplePath("M -30 -40 C -30 -80 30 -84 32 -44 C 34 -14 0 -6 0 22 L 0 40", 18), 742, 760, 1.25);
export const QUESTION_DOT = { x: 742, y: 760 + 66 * 1.25 };
export const FINAL_ARC: Poly = samplePath("M 400 1488 C 470 1530 610 1530 680 1488", 30);

export const MOON = { x: 812, y: 520, r: 58 };

export const NightHill: React.FC<{ t: number }> = ({ t }) => {
  const a = smoothstep(55.2, 56.4, t);
  const moon = smoothstep(55.6, 56.8, t);
  const dot = smoothstep(57.65, 57.85, t);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="hillFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123257" />
          <stop offset="0.12" stopColor="#0b1d36" />
          <stop offset="1" stopColor="#081426" />
        </linearGradient>
        <radialGradient id="moonGlow">
          <stop offset="0" stopColor="#F8F7F3" stopOpacity={0.35} />
          <stop offset="0.35" stopColor="#A9E5F2" stopOpacity={0.12} />
          <stop offset="1" stopColor="#A9E5F2" stopOpacity={0} />
        </radialGradient>
        <mask id="crescent">
          <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="#fff" />
          <circle cx={MOON.x + 26} cy={MOON.y - 16} r={MOON.r * 0.9} fill="#000" />
        </mask>
      </defs>
      <g opacity={moon}>
        <circle cx={MOON.x} cy={MOON.y} r={260} fill="url(#moonGlow)" />
        <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="#F8F7F3" mask="url(#crescent)" />
      </g>
      <g opacity={a}>
        <circle cx={HILL.cx} cy={HILL.cy} r={HILL.r} fill="url(#hillFill)" />
        <circle cx={HILL.cx} cy={HILL.cy} r={HILL.r} fill="none" stroke="#58D6DB" strokeOpacity={0.35} strokeWidth={2.5} />
      </g>
      <g opacity={dot}>
        <circle cx={QUESTION_DOT.x} cy={QUESTION_DOT.y} r={16} fill="#F4C66A" opacity={0.25} />
        <circle cx={QUESTION_DOT.x} cy={QUESTION_DOT.y} r={7} fill="#F4C66A" />
      </g>
    </svg>
  );
};
