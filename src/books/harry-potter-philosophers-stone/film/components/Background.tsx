// Фон «студии решений»: освещённый градиент части фильма, мягкие пятна света и
// редкая чёткая сетка точек (как миллиметровка исследователя) — без размытия и
// без чёрного кадра.
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
    { x: 300, y: 220, r: 300, s: 0.5 },
    { x: 1640, y: 240, r: 320, s: 0.4 },
    { x: 1380, y: 900, r: 260, s: 0.7 },
    { x: 520, y: 880, r: 240, s: 0.6 },
  ];
  // сетка точек медленно «дышит» по диагонали
  const dots = [];
  for (let gy = 0; gy < 12; gy++)
    for (let gx = 0; gx < 21; gx++) {
      const x = 48 + gx * 92;
      const y = 50 + gy * 92;
      const w = 0.5 + 0.5 * Math.sin(t * 0.6 - (gx + gy) * 0.35);
      dots.push(<circle key={`${gx}-${gy}`} cx={x} cy={y} r={2.2} fill="#fff" opacity={0.07 + 0.08 * w} />);
    }
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="bgGlow">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {glows.map((g, i) => (
          <circle key={i} cx={g.x + Math.sin(t * 0.12 * g.s + i) * 40} cy={g.y + Math.cos(t * 0.1 * g.s + i * 2) * 26} r={g.r} fill="url(#bgGlow)" />
        ))}
        {dots}
      </svg>
    </AbsoluteFill>
  );
};
