// Фон фильма: ночной «стол картографа». Тонкие контурные линии условной
// местности и редкие чёткие цветные точки — люди на большой карте. Положение
// и яркость точек постоянны (без мерцания, блюра и тумана: на телефоне и после
// сжатия H.264 они остаются точками). Мягкое свечение части — одно, неподвижное.
import React from "react";
import { AbsoluteFill, interpolateColors } from "remotion";
import { PART_BG } from "../theme";
import type { PartId } from "../types";

// псевдослучайные числа с зерном — одинаковые в каждом рендере
export const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const DOT_COLORS = ["#ffd23f", "#86d6ff", "#ff83d3", "#4fdc94", "#ffb347", "#ad92ff", "#ff8a7a"];

// точки не меньше 2,2 px в радиусе — не исчезают при уменьшении до 640×360
const DOTS = Array.from({ length: 90 }).map((_, i) => ({
  x: 50 + rnd(i) * 1820,
  y: 60 + rnd(i + 500) * 960,
  r: 2.2 + rnd(i + 900) * 1.4,
  c: DOT_COLORS[i % DOT_COLORS.length],
  o: 0.32 + rnd(i + 1300) * 0.22,
}));

// контурные линии «местности»: синусоиды с зерном
const CONTOURS = Array.from({ length: 9 }).map((_, i) => {
  const y0 = 90 + i * 115;
  const pts: string[] = [];
  for (let x = -40; x <= 1960; x += 40) {
    const y = y0 + Math.sin(x / 210 + i * 1.7) * 26 + Math.sin(x / 83 + i) * 9;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return pts.join(" ");
});

export const Background: React.FC<{ part: PartId; prev: PartId; k: number }> = ({ part, prev, k }) => {
  const [a1, b1, n1] = PART_BG[prev];
  const [a2, b2, n2] = PART_BG[part];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  const glow = interpolateColors(k, [0, 1], [n1, n2]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="bg-glow">
            <stop offset="0%" stopColor={glow} stopOpacity={0.26} />
            <stop offset="60%" stopColor={glow} stopOpacity={0.07} />
            <stop offset="100%" stopColor={glow} stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={1300} cy={360} rx={820} ry={460} fill="url(#bg-glow)" />
        {CONTOURS.map((p, i) => (
          <polyline key={i} points={p} fill="none" stroke="#9fb4ff" strokeWidth={1.6} opacity={0.07} />
        ))}
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity={d.o} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
