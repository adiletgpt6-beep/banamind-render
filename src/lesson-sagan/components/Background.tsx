// Фон фильма: небо за большим окном обсерватории. Звёзды — чёткие точки с
// постоянным положением и яркостью (без мерцания и тумана: на телефоне и после
// сжатия H.264 они остаются точками). Мягкое свечение части — одно, неподвижное.
// Рама окна и подоконник-пульт рисуются поверх (WindowFrame).
import React from "react";
import { AbsoluteFill, interpolateColors } from "remotion";
import { PART_BG } from "../theme";
import type { PartId } from "../types";

// псевдослучайные числа с зерном — одинаковые в каждом рендере
export const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// звёзды не меньше 1,6 px в радиусе — не исчезают при уменьшении до 640×360
const STARS = Array.from({ length: 120 }).map((_, i) => ({
  x: 60 + rnd(i) * 1800,
  y: 70 + rnd(i + 500) * 880,
  r: i % 11 === 0 ? 3.2 : 1.6 + rnd(i + 900) * 0.9,
  o: 0.5 + rnd(i + 1300) * 0.4,
  warm: rnd(i + 1700) > 0.8,
}));

export const Background: React.FC<{ part: PartId; prev: PartId; k: number }> = ({ part, prev, k }) => {
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
            <stop offset="0%" stopColor={neb} stopOpacity={0.3} />
            <stop offset="60%" stopColor={neb} stopOpacity={0.08} />
            <stop offset="100%" stopColor={neb} stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={1420} cy={300} rx={720} ry={400} fill="url(#bg-neb)" />
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.warm ? "#ffe6b8" : "#e6eeff"} opacity={s.o * 0.75} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
