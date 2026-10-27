// Фон «Лаборатории гипотез»: мягкий градиент главы, чертёжная сетка (мир схем и
// экспериментов), медленно всплывающие стеклянные пузырьки и шестигранники-«молекулы»,
// светлый лабораторный стол внизу. Смена главы — плавный переход цвета. Кадр светлый и чёткий.
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { CHAPTER_BG, FPS } from "../theme";
import type { ChapterId } from "../types";

const hex = (r: number) =>
  Array.from({ length: 6 })
    .map((_, i) => `${i ? "L" : "M"} ${(Math.cos((i * Math.PI) / 3) * r).toFixed(1)} ${(Math.sin((i * Math.PI) / 3) * r).toFixed(1)}`)
    .join(" ") + " Z";

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
          <radialGradient id="lsrGlow" cx="50%" cy="8%" r="72%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.65} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* чертёжная сетка: крупная и мелкая */}
        {Array.from({ length: 49 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={1000} stroke="#1d2740" strokeOpacity={i % 4 ? 0.022 : 0.05} strokeWidth={2} />
        ))}
        {Array.from({ length: 26 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={1920} y2={i * 40} stroke="#1d2740" strokeOpacity={i % 4 ? 0.022 : 0.05} strokeWidth={2} />
        ))}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#lsrGlow)" />
        {/* всплывающие пузырьки */}
        {Array.from({ length: 14 }).map((_, i) => {
          const x = (i * 293 + 70 + Math.sin(t * 0.3 + i) * 26) % 1920;
          const y = 1000 - (((i * 173 + t * (12 + (i % 4) * 5)) % 1060) + 10);
          const r = 6 + (i % 4) * 4;
          return <circle key={i} cx={x} cy={y} r={r} fill="#fff" fillOpacity={0.35} stroke="#27b4e6" strokeOpacity={0.35} strokeWidth={2} />;
        })}
        {/* шестигранники-«молекулы» */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = [160, 1760, 1460, 420, 990][i];
          const y = [180, 260, 880, 860, 70][i];
          return (
            <g key={i} transform={`translate(${x + Math.sin(t * 0.2 + i) * 18} ${y + Math.cos(t * 0.17 + i * 2) * 12}) rotate(${t * 4 + i * 20})`} opacity={0.18}>
              <path d={hex(34 + (i % 2) * 14)} fill="none" stroke="#1d2740" strokeWidth={3} />
              <circle r={5} fill="#1d2740" />
            </g>
          );
        })}
        {/* лабораторный стол */}
        <rect x={0} y={1000} width={1920} height={80} fill="#1d2740" opacity={0.045} />
        <rect x={0} y={998} width={1920} height={4} fill="#fff" opacity={0.5} />
      </svg>
    </AbsoluteFill>
  );
};
