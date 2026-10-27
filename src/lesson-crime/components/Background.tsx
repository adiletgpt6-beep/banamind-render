// Фон «лаборатории совести»: освещённый сумеречный градиент части фильма,
// медленно плывущие пятна света и тонкая пыль в воздухе (без чёрного кадра).
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { FPS, PART_BG } from "../theme";
import type { PartId } from "../types";

export const Background: React.FC<{ part: PartId; prev: PartId; k: number }> = ({ part, prev, k }) => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1] = PART_BG[prev];
  const [a2, b2] = PART_BG[part];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  const glows = [
    { x: 260, y: 200, r: 260, s: 0.5 },
    { x: 1650, y: 260, r: 300, s: 0.4 },
    { x: 1400, y: 880, r: 220, s: 0.7 },
    { x: 500, y: 860, r: 200, s: 0.6 },
  ];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="bgGlow">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {glows.map((g, i) => (
          <circle key={i} cx={g.x + Math.sin(t * 0.12 * g.s + i) * 40} cy={g.y + Math.cos(t * 0.1 * g.s + i * 2) * 26} r={g.r} fill="url(#bgGlow)" />
        ))}
        {Array.from({ length: 26 }).map((_, i) => {
          const x = (i * 271 + Math.sin(t * 0.2 + i) * 30) % 1920;
          const y = ((i * 157 + 80 - t * (6 + (i % 5) * 2)) % 1080 + 1080) % 1080;
          return <circle key={i} cx={x} cy={y} r={1.6 + (i % 3)} fill="#fff" opacity={0.18 + 0.12 * Math.sin(t + i)} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
