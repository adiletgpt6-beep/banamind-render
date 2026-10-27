// Фон «Лаборатории невидимых кнопок»: светлый градиент части фильма, тонкая
// сетка-калька и медленно плывущие пятна света трёх цветов петли (сигнал,
// действие, награда) — едва заметные. Никаких тёмных кадров.
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
    { x: 300, y: 220, r: 300, s: 0.5, c: "bgGlow" },
    { x: 1620, y: 240, r: 340, s: 0.4, c: "bgGlow" },
    { x: 1350, y: 860, r: 260, s: 0.7, c: "bgGlow" },
    { x: 540, y: 820, r: 220, s: 0.6, c: "bgCue" },
    { x: 1500, y: 520, r: 200, s: 0.55, c: "bgRoutine" },
    { x: 980, y: 160, r: 210, s: 0.45, c: "bgReward" },
  ];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="bgGlow">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          {[["bgCue", "#ff7a3d"], ["bgRoutine", "#2f8fd8"], ["bgReward", "#f2b01e"]].map(([id, c]) => (
            <radialGradient key={id} id={id}>
              <stop offset="0%" stopColor={c} stopOpacity={0.07} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          ))}
          <pattern id="bgGrid" width={48} height={48} patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1f2a3d" strokeWidth={1} opacity={0.045} />
          </pattern>
        </defs>
        <rect width={1920} height={1080} fill="url(#bgGrid)" />
        {glows.map((g, i) => (
          <circle key={i} cx={g.x + Math.sin(t * 0.12 * g.s + i) * 40} cy={g.y + Math.cos(t * 0.1 * g.s + i * 2) * 26} r={g.r} fill={`url(#${g.c})`} />
        ))}
        {/* пол кабинета — мягкая полоса, на которой стоит банан */}
        <path d="M 0 1010 Q 960 985 1920 1010 L 1920 1080 L 0 1080 Z" fill="#1f2a3d" opacity={0.05} />
      </svg>
    </AbsoluteFill>
  );
};
