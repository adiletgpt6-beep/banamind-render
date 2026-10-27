// Фон части фильма: глубокий космос — градиент, мягкие туманности своего цвета,
// три слоя звёзд с медленным параллаксом и мерцанием. Всё детерминировано
// (без Math.random): кадр зависит только от времени.
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { FPS, PART_BG } from "../theme";
import type { PartId } from "../types";

// псевдослучайные числа с зерном — одинаковые в каждом рендере
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const STARS = Array.from({ length: 170 }).map((_, i) => ({
  x: rnd(i) * 1920,
  y: rnd(i + 500) * 1080,
  r: 0.7 + rnd(i + 900) * (i % 9 === 0 ? 2.6 : 1.4),
  layer: i % 3,
  ph: rnd(i + 1300) * 6.28,
  warm: rnd(i + 1700) > 0.82,
}));

export const Background: React.FC<{ part: PartId; prev: PartId; k: number }> = ({ part, prev, k }) => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1, n1] = PART_BG[prev];
  const [a2, b2, n2] = PART_BG[part];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  const neb = interpolateColors(k, [0, 1], [n1, n2]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="bg-neb">
            <stop offset="0%" stopColor={neb} stopOpacity={0.42} />
            <stop offset="55%" stopColor={neb} stopOpacity={0.12} />
            <stop offset="100%" stopColor={neb} stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={1500 + Math.sin(t * 0.03) * 60} cy={260} rx={760} ry={420} fill="url(#bg-neb)" />
        <ellipse cx={300 + Math.cos(t * 0.025) * 50} cy={860} rx={620} ry={330} fill="url(#bg-neb)" opacity={0.8} />
        {STARS.map((s, i) => {
          const speed = [1.2, 2.6, 4.5][s.layer];
          const x = (s.x - t * speed + 1920 * 4) % 1920;
          const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * (0.6 + s.layer * 0.4) + s.ph));
          return <circle key={i} cx={x} cy={s.y} r={s.r} fill={s.warm ? "#ffe2b0" : "#dfe8ff"} opacity={tw * (0.45 + s.layer * 0.2)} />;
        })}
        {/* редкие крупные звёзды с лучами */}
        {[0, 1, 2, 3].map((i) => {
          const x = (rnd(i + 40) * 1920 - t * 3 + 1920 * 4) % 1920;
          const y = rnd(i + 80) * 900 + 60;
          const tw = 0.5 + 0.5 * Math.sin(t * 0.9 + i * 2);
          return (
            <g key={`b${i}`} transform={`translate(${x} ${y})`} opacity={0.35 + 0.4 * tw}>
              <path d="M 0 -14 L 2 -2 L 14 0 L 2 2 L 0 14 L -2 2 L -14 0 L -2 -2 Z" fill="#fff" />
            </g>
          );
        })}
        <rect x={0} y={1000} width={1920} height={80} fill="#000" opacity={0.12} />
      </svg>
    </AbsoluteFill>
  );
};
