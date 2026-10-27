// Фон части урока: мягкий градиент, плавающие круги и звёздочки (медленный параллакс).
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
  const blobs = [
    { x: 180, y: 160, r: 120, s: 0.7 },
    { x: 1720, y: 220, r: 160, s: 0.5 },
    { x: 1500, y: 900, r: 110, s: 0.9 },
    { x: 420, y: 820, r: 90, s: 0.6 },
    { x: 980, y: 90, r: 70, s: 1.1 },
  ];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {blobs.map((b, i) => (
          <circle key={i} cx={b.x + Math.sin(t * 0.15 * b.s + i) * 30} cy={b.y + Math.cos(t * 0.12 * b.s + i * 2) * 20} r={b.r} fill="#fff" opacity={0.28} />
        ))}
        {Array.from({ length: 14 }).map((_, i) => {
          const x = (i * 263) % 1920;
          const y = (i * 151 + 60) % 1000;
          const tw = 0.35 + 0.35 * Math.sin(t * 1.2 + i);
          return <path key={i} d={`M ${x} ${y - 9} L ${x + 3} ${y - 3} L ${x + 9} ${y} L ${x + 3} ${y + 3} L ${x} ${y + 9} L ${x - 3} ${y + 3} L ${x - 9} ${y} L ${x - 3} ${y - 3} Z`} fill="#fff" opacity={tw} />;
        })}
        <rect x={0} y={1000} width={1920} height={80} fill="#000" opacity={0.035} />
      </svg>
    </AbsoluteFill>
  );
};
