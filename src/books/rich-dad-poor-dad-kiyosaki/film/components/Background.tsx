// Фон «Пути одной монеты»: мягкий градиент главы, тонкая сетка-миллиметровка
// (мир схем и отчётов), медленно плывущие золотые монетки и светлый пол.
// Смена главы — плавный переход цвета. Кадр всегда светлый и чёткий.
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { CHAPTER_BG, FPS } from "../theme";
import type { ChapterId } from "../types";

export const Background: React.FC<{ chapter: ChapterId; prev: ChapterId; k: number }> = ({ chapter, prev, k }) => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1] = CHAPTER_BG[prev];
  const [a2, b2] = CHAPTER_BG[chapter];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="10%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* сетка-миллиметровка */}
        {Array.from({ length: 25 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={1000} stroke="#1f2a44" strokeOpacity={0.045} strokeWidth={2} />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 80} x2={1920} y2={i * 80} stroke="#1f2a44" strokeOpacity={0.045} strokeWidth={2} />
        ))}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#bgGlow)" />
        {/* плывущие монетки */}
        {Array.from({ length: 12 }).map((_, i) => {
          const x = (i * 331 + 90 + Math.sin(t * 0.25 + i) * 30) % 1920;
          const y = 1000 - (((i * 157 + t * (10 + (i % 4) * 4)) % 1060) + 20);
          const r = 7 + (i % 3) * 3;
          const spin = Math.abs(Math.cos(t * 0.8 + i));
          return (
            <g key={i} opacity={0.22}>
              <ellipse cx={x} cy={y} rx={r * (0.35 + 0.65 * spin)} ry={r} fill="#f5b52e" stroke="#c98612" strokeWidth={2} />
            </g>
          );
        })}
        {/* пол */}
        <rect x={0} y={1000} width={1920} height={80} fill="#000" opacity={0.04} />
      </svg>
    </AbsoluteFill>
  );
};
