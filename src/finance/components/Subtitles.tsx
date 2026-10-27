// Экранные субтитры: две строки максимум, внизу по центру, на светлой
// плашке; ключевые слова реплики (hl) умеренно подсвечены.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "../captions";
import { C, FONT } from "../theme";

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}$]/gu, "");

export const Subtitles: React.FC<{ caps: Caption[]; hl: Record<string, string[]> }> = ({ caps, hl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cap = caps.find((c) => t >= c.from && t < c.to);
  if (!cap) return null;
  const keys = (hl[cap.lineId] ?? []).map(norm);
  const inK = interpolate(t, [cap.from, cap.from + 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 34,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.94)",
          borderRadius: 22,
          padding: "10px 28px 12px",
          boxShadow: "0 6px 24px rgba(20,37,74,0.16)",
          border: `2px solid ${C.line}`,
          opacity: inK,
          transform: `translateY(${(1 - inK) * 8}px)`,
          maxWidth: 1240,
        }}
      >
        {cap.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, lineHeight: 1.22, color: C.navy, textAlign: "center", whiteSpace: "nowrap" }}>
            {l.split(" ").map((w, j) => {
              const on = keys.some((k) => k && norm(w) === k);
              return (
                <span key={j} style={on ? { color: C.greenDark, background: C.yellowSoft, borderRadius: 8, padding: "0 6px" } : undefined}>
                  {w}
                  {j < l.split(" ").length - 1 ? " " : ""}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
