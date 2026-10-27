// Фон «лаборатории цепной реакции»: светлый градиент части фильма, тонкая
// миллиметровка исследователя, мягкие пятна света и лабораторный стол внизу.
// Без размытия, шума и чёрного кадра.
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { C, FPS, PART_BG } from "../theme";
import type { PartId } from "../types";

export const Background: React.FC<{ part: PartId; prev: PartId; k: number }> = ({ part, prev, k }) => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1] = PART_BG[prev];
  const [a2, b2] = PART_BG[part];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  const glows = [
    { x: 320, y: 200, r: 360, s: 0.5 },
    { x: 1620, y: 220, r: 380, s: 0.4 },
    { x: 1300, y: 760, r: 300, s: 0.7 },
  ];
  const grid = [];
  for (let gx = 0; gx <= 20; gx++) grid.push(<line key={`v${gx}`} x1={gx * 96} y1={0} x2={gx * 96} y2={1000} stroke={C.ink} strokeOpacity={gx % 5 === 0 ? 0.07 : 0.035} strokeWidth={2} />);
  for (let gy = 0; gy <= 10; gy++) grid.push(<line key={`h${gy}`} x1={0} y1={gy * 96 + 40} x2={1920} y2={gy * 96 + 40} stroke={C.ink} strokeOpacity={gy % 5 === 0 ? 0.07 : 0.035} strokeWidth={2} />);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="bgGlow">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.75} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#c9d1e6" stopOpacity={0.55} />
          </linearGradient>
        </defs>
        {glows.map((g, i) => (
          <circle key={i} cx={g.x + Math.sin(t * 0.12 * g.s + i) * 40} cy={g.y + Math.cos(t * 0.1 * g.s + i * 2) * 26} r={g.r} fill="url(#bgGlow)" />
        ))}
        {grid}
        <rect x={0} y={1000} width={1920} height={80} fill="url(#bench)" />
        <line x1={0} y1={1000} x2={1920} y2={1000} stroke={C.ink} strokeOpacity={0.18} strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};
