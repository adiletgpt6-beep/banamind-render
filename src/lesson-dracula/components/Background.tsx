// Фон Бюро невозможных доказательств: градиент части фильма. Сцены Бюро —
// тёплая бумага с тонкой сеткой и пятнами света лампы; ночные части — глубокий
// синий с медленными «звёздами»-точками и холодным ореолом луны. Без чёрных кадров:
// даже ночь остаётся синей и читаемой.
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { FPS, PART_BG, PART_TONE } from "../theme";
import type { PartId } from "../types";

const rnd = (i: number, k = 0) => {
  const x = Math.sin(i * 127.1 + k * 311.7 + 74.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Background: React.FC<{ part: PartId; prev: PartId; k: number }> = ({ part, prev, k }) => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1] = PART_BG[prev];
  const [a2, b2] = PART_BG[part];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  const nightOf = (p: PartId) => (PART_TONE[p] === "night" ? 1 : 0);
  const night = nightOf(prev) + (nightOf(part) - nightOf(prev)) * k;
  const paper = 1 - night;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="lampGlow">
            <stop offset="0%" stopColor="#fff3cf" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#fff3cf" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="moonGlow">
            <stop offset="0%" stopColor="#cfe2ff" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#cfe2ff" stopOpacity={0} />
          </radialGradient>
          <pattern id="paperGrid" width={48} height={48} patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#5a4320" strokeWidth={1} opacity={0.06} />
          </pattern>
        </defs>
        {paper > 0.01 && (
          <g opacity={paper}>
            <rect width={1920} height={1080} fill="url(#paperGrid)" />
            {[
              { x: 320, y: 230, r: 330, s: 0.5 },
              { x: 1600, y: 260, r: 360, s: 0.4 },
              { x: 1300, y: 880, r: 260, s: 0.7 },
            ].map((g, i) => (
              <circle key={i} cx={g.x + Math.sin(t * 0.12 * g.s + i) * 40} cy={g.y + Math.cos(t * 0.1 * g.s + i * 2) * 26} r={g.r} fill="url(#lampGlow)" />
            ))}
          </g>
        )}
        {night > 0.01 && (
          <g opacity={night}>
            <circle cx={1500 + Math.sin(t * 0.05) * 20} cy={190} r={420} fill="url(#moonGlow)" />
            {Array.from({ length: 46 }).map((_, i) => {
              const x = rnd(i, 1) * 1920;
              const y = rnd(i, 2) * 640;
              const tw = 0.35 + 0.45 * Math.sin(t * (0.6 + rnd(i, 3)) + i);
              return <circle key={i} cx={x} cy={y} r={1.6 + rnd(i, 4) * 2.2} fill="#e8f0ff" opacity={tw * 0.8} />;
            })}
            {/* дальние холмы — силуэт без деталей */}
            <path d="M 0 900 Q 240 820 480 880 T 960 860 T 1440 890 T 1920 850 L 1920 1080 L 0 1080 Z" fill="#0f1730" opacity={0.35} />
          </g>
        )}
        {/* пол, на котором стоит банан */}
        <path d="M 0 1010 Q 960 985 1920 1010 L 1920 1080 L 0 1080 Z" fill={night > 0.5 ? "#0c1228" : "#3a2a14"} opacity={0.08 + night * 0.12} />
      </svg>
    </AbsoluteFill>
  );
};
