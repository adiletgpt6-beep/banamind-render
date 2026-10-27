// Фон «Музея искушений»: мягкий градиент зала, светлые арки галереи,
// медленно плывущие золотые пылинки в луче света и пол из каменных плит.
// Смена зала — плавный переход цвета.
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { FPS, HALL_BG } from "../theme";
import type { HallId } from "../types";

export const Background: React.FC<{ hall: HallId; prev: HallId; k: number }> = ({ hall, prev, k }) => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1] = HALL_BG[prev];
  const [a2, b2] = HALL_BG[hall];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="bgBeam" cx="50%" cy="0%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* арки галереи */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 120 + i * 420;
          return <path key={i} d={`M ${x} 1000 L ${x} 330 Q ${x + 150} 150 ${x + 300} 330 L ${x + 300} 1000`} fill="#fff" opacity={0.16} />;
        })}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#bgBeam)" />
        {/* золотые пылинки в луче */}
        {Array.from({ length: 22 }).map((_, i) => {
          const x = (i * 337 + Math.sin(t * 0.2 + i) * 40) % 1920;
          const y = ((i * 173 + t * (8 + (i % 5) * 3)) % 1040) + 10;
          const tw = 0.25 + 0.3 * Math.sin(t * 1.3 + i * 2);
          return <circle key={i} cx={x} cy={1040 - y} r={2.5 + (i % 3)} fill="#f2b630" opacity={tw} />;
        })}
        {/* пол из плит */}
        <rect x={0} y={1000} width={1920} height={80} fill="#000" opacity={0.04} />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={i * 240} y1={1000} x2={i * 240 - 60} y2={1080} stroke="#000" strokeOpacity={0.04} strokeWidth={3} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
