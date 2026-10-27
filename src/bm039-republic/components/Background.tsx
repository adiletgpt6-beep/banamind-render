// Фон части: глубокий ночной градиент (оттенок своей книги «Государства»),
// мягкие световые пятна и тонкая сетка-«агора»; смена части — плавно.
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
    { x: 320, y: 220, r: 420, c: "#5cc8ff", o: 0.07 },
    { x: 1600, y: 300, r: 480, c: "#a98bff", o: 0.08 },
    { x: 960, y: 980, r: 620, c: "#ffd23f", o: 0.05 },
  ];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          {glows.map((g, i) => (
            <radialGradient key={i} id={`bg-glow-${i}`}>
              <stop offset="0%" stopColor={g.c} stopOpacity={g.o * 2} />
              <stop offset="100%" stopColor={g.c} stopOpacity={0} />
            </radialGradient>
          ))}
          <radialGradient id="bg-vig" cx="50%" cy="50%" r="75%">
            <stop offset="60%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.35} />
          </radialGradient>
        </defs>
        {glows.map((g, i) => (
          <circle key={i} cx={g.x + Math.sin(t * 0.07 + i * 2) * 60} cy={g.y + Math.cos(t * 0.05 + i) * 40} r={g.r} fill={`url(#bg-glow-${i})`} />
        ))}
        {/* тонкая перспективная сетка внизу — «площадь», где идёт спор */}
        <g opacity={0.07} stroke="#c9d4ea" strokeWidth={1.2}>
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={820 + i * i * 4.2} x2={1920} y2={820 + i * i * 4.2} />
          ))}
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`v${i}`} x1={960 + (i - 8) * 60} y1={820} x2={960 + (i - 8) * 420} y2={1080} />
          ))}
        </g>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#bg-vig)" />
      </svg>
    </AbsoluteFill>
  );
};
