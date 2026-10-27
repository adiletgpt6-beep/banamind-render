// Фон «Масштаба выбора»: освещённый градиент части фильма, тонкая сетка
// старой карты (меридианы и параллели медленно плывут) и несколько чётких
// точек-решений. Без блюра и мерцания, детерминированно; кадр не уходит в чёрное.
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { C, FPS, PART_BG } from "../theme";
import type { PartId } from "../types";

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Background: React.FC<{ part: PartId; prev: PartId; k: number }> = ({ part, prev, k }) => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1] = PART_BG[prev];
  const [a2, b2] = PART_BG[part];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  const off = (t * 4) % 160;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="bgLight" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#bgLight)" />
        <g stroke="#fff" strokeOpacity={0.07} strokeWidth={2} fill="none">
          {Array.from({ length: 14 }).map((_, i) => (
            <path key={`m${i}`} d={`M ${i * 160 - off} -20 Q ${i * 160 - off + 60} 540 ${i * 160 - off} 1100`} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={`p${i}`} d={`M -20 ${i * 150 + 40} Q 960 ${i * 150 + 10} 1940 ${i * 150 + 40}`} />
          ))}
        </g>
        {Array.from({ length: 22 }).map((_, i) => {
          const x = (rnd(i) * 1920 + t * (3 + rnd(i + 50) * 5)) % 1920;
          const y = 60 + rnd(i + 100) * 960 + Math.sin(t * 0.15 + i) * 12;
          return <circle key={i} cx={x} cy={y} r={2.6 + (i % 3)} fill={C.dots[i % C.dots.length]} opacity={0.32} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
