// Фон части фильма: мягкий градиент эпохи/места и медленно плывущий
// геометрический орнамент (восьмиконечные звёзды) — без людей и символов-заменителей.
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { FPS, PART_BG } from "../theme";
import type { PartId } from "../types";

const DARK: PartId[] = ["intro", "revelation"];

export const star8 = (r: number, inner = 0.72) => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
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
  const dark = DARK.includes(part);
  const ink = dark ? "#ffffff" : "#8a5a2b";
  const drift = (t * 6) % 240;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <g opacity={dark ? 0.07 : 0.06} transform={`translate(${-drift} 0)`}>
          {Array.from({ length: 10 * 6 }).map((_, i) => {
            const cx = (i % 10) * 240 + (Math.floor(i / 10) % 2 ? 120 : 0);
            const cy = Math.floor(i / 10) * 200 + 40;
            return (
              <g key={i} transform={`translate(${cx} ${cy}) rotate(${(t * 3 + i * 7) % 45})`}>
                <path d={star8(56)} fill="none" stroke={ink} strokeWidth={4} />
                <path d={star8(26)} fill={ink} opacity={0.5} />
              </g>
            );
          })}
        </g>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#vign)" />
        <defs>
          <radialGradient id="vign" cx="50%" cy="45%" r="75%">
            <stop offset="60%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={dark ? 0.35 : 0.12} />
          </radialGradient>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};
