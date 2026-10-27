import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";

type Blob = { x: number; y: number; r: number; color: string; speed: number; phase: number };

// Палитра пятен для каждой сцены: фон «дышит» и плавно меняет оттенок.
const PALETTES: string[][] = [
  [C.orange2, C.blue, C.violet],
  [C.cyan, C.orange2, C.violet],
  [C.orange, C.cyan, C.pink],
  [C.blue, C.violet, C.orange2],
  [C.violet, C.orange2, C.cyan],
  [C.orange, C.violet, C.blue],
];

const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const p = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${p.join(",")})`;
};

export const Background: React.FC<{ sceneIndex: number; sceneProgress: number }> = ({
  sceneIndex,
  sceneProgress,
}) => {
  const frame = useCurrentFrame();
  const from = PALETTES[sceneIndex % PALETTES.length];
  const to = PALETTES[(sceneIndex + 1) % PALETTES.length];
  // Переход цвета — в последние 20% сцены.
  const t = interpolate(sceneProgress, [0.8, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blobs: Blob[] = [
    { x: 0.1, y: 0.12, r: 560, color: mix(from[0], to[0], t), speed: 0.011, phase: 0 },
    { x: 0.95, y: 0.42, r: 620, color: mix(from[1], to[1], t), speed: 0.009, phase: 2 },
    { x: 0.2, y: 0.86, r: 640, color: mix(from[2], to[2], t), speed: 0.013, phase: 4 },
  ];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #F8F9FD 0%, ${C.bg} 55%, #EEF1F9 100%)` }}>
      {blobs.map((b, i) => {
        const dx = Math.sin(frame * b.speed + b.phase) * 70;
        const dy = Math.cos(frame * b.speed * 0.8 + b.phase) * 60;
        const s = 1 + Math.sin(frame * b.speed * 1.3 + b.phase) * 0.08;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x * 1080 - b.r / 2 + dx,
              top: b.y * 1920 - b.r / 2 + dy,
              width: b.r,
              height: b.r,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${b.color} 0%, transparent 68%)`,
              opacity: 0.33,
              transform: `scale(${s})`,
              filter: "blur(30px)",
            }}
          />
        );
      })}
      {/* Мелкая точечная сетка добавляет глубину и «технологичность». */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(14,27,61,0.07) 1.6px, transparent 1.6px)",
          backgroundSize: "36px 36px",
          backgroundPosition: `0 ${-(frame * 0.4) % 36}px`,
          maskImage: "linear-gradient(180deg, transparent 0%, black 25%, black 70%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
