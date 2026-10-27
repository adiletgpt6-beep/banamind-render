// Фон «инженерной мастерской»: светлый градиент участка, тонкая чертёжная сетка
// и две крупные полупрозрачные шестерни по краям, которые медленно вращаются.
// Без размытия и без тёмного кадра.
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { accentOf, FPS, PART_BG } from "../theme";
import type { PartId } from "../types";

export const gearPath = (r: number, teeth: number, depth = 0.12) => {
  const pts: string[] = [];
  const n = teeth * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const q = i % 4;
    const rr = q === 1 || q === 2 ? r : r * (1 - depth);
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
};

export const Background: React.FC<{ part: PartId; prev: PartId; k: number }> = ({ part, prev, k }) => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1] = PART_BG[prev];
  const [a2, b2] = PART_BG[part];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  const acc = accentOf(part);
  const lines = [];
  for (let x = 0; x <= 1920; x += 96) lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={1080} stroke="#2b3245" strokeOpacity={0.045} strokeWidth={2} />);
  for (let y = 0; y <= 1080; y += 96) lines.push(<line key={`h${y}`} x1={0} y1={y} x2={1920} y2={y} stroke="#2b3245" strokeOpacity={0.045} strokeWidth={2} />);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {lines}
        <g transform={`translate(1840 120) rotate(${(t * 6) % 360})`} opacity={0.09}>
          <path d={gearPath(230, 14)} fill={acc.color} />
          <circle r={70} fill={top} />
        </g>
        <g transform={`translate(60 1010) rotate(${(-t * 8) % 360})`} opacity={0.08}>
          <path d={gearPath(170, 11)} fill={acc.color} />
          <circle r={52} fill={bottom} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
