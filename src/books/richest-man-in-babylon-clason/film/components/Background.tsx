// Фон «Десятой монеты»: светлая мастерская — тёплый градиент главы, едва заметная кладка из
// глиняных кирпичей, полка с табличками и светлый пол. Смена главы — плавный переход цвета.
// Никакой дымки и затемнения: кадр всегда светлый и чёткий.
import React from "react";
import { AbsoluteFill, interpolateColors } from "remotion";
import { CHAPTER_BG } from "../theme";
import type { ChapterId } from "../types";

export const Background: React.FC<{ chapter: ChapterId; prev: ChapterId; k: number }> = ({ chapter, prev, k }) => {
  const [a1, b1] = CHAPTER_BG[prev];
  const [a2, b2] = CHAPTER_BG[chapter];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="bm36Glow" cx="50%" cy="8%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* кладка из глиняного кирпича — очень светлая */}
        {Array.from({ length: 13 }).map((_, row) =>
          Array.from({ length: 13 }).map((__, i) => (
            <rect key={`${row}-${i}`} x={i * 160 - (row % 2 ? 80 : 0) + 4} y={row * 76 + 4} width={152} height={68} rx={10} fill="#8a5a2b" opacity={0.035} />
          )),
        )}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#bm36Glow)" />
        {/* пол мастерской */}
        <rect x={0} y={1000} width={1920} height={80} fill="#7a4a22" opacity={0.06} />
        <rect x={0} y={996} width={1920} height={6} fill="#7a4a22" opacity={0.07} />
      </svg>
    </AbsoluteFill>
  );
};
