// Маленькая подпись-источник в левом верхнем углу: какая глава тома и какой год
// сейчас обсуждаются. Это навигация по книге, не таймер и не индикатор времени.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../theme";

export const ChapterTag: React.FC<{ text?: string; since: number }> = ({ text, since }) => {
  const t = useCurrentFrame() / FPS;
  if (!text) return null;
  const k = interpolate(t, [since + 0.3, since + 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 56, top: 44, opacity: k, transform: `translateY(${(1 - k) * -10}px)`, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.white, letterSpacing: 0.5 }}>
      <svg width={18} height={18}>
        <circle cx={9} cy={9} r={7} fill={C.amber} />
      </svg>
      <span style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{text}</span>
    </div>
  );
};
