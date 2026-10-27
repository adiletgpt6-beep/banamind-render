// Табличка главы вверху слева: колба-значок лаборатории и название текущего блока
// (зритель видит, где он в книге). Без счётчиков и времени.
import React from "react";
import { C, CHAPTERS, FONT } from "../theme";
import type { ChapterId } from "../types";

export const ChapterBar: React.FC<{ chapter: ChapterId; opacity: number }> = ({ chapter, opacity }) => {
  const ch = CHAPTERS.find((c) => c.id === chapter);
  if (opacity <= 0 || !ch) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: 28, display: "flex", alignItems: "center", gap: 14, opacity }}>
      <svg width={50} height={50} viewBox="-25 -25 50 50" style={{ filter: "drop-shadow(0 4px 8px rgba(29,39,64,0.18))" }}>
        <circle r={23} fill={C.white} stroke={C.cyanDeep} strokeWidth={3} />
        <path d="M -5 -14 L 5 -14 L 5 -3 L 13 11 Q 14 15 10 15 L -10 15 Q -14 15 -13 11 L -5 -3 Z" fill={C.cyanLight} stroke={C.ink} strokeWidth={2.6} strokeLinejoin="round" />
        <path d="M -9 6 L 9 6 L 12 12 Q 12 14 10 14 L -10 14 Q -12 14 -12 12 Z" fill={C.teal} />
      </svg>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 26, color: C.ink, padding: "6px 18px", borderRadius: 22, background: "rgba(255,255,255,0.8)" }}>{ch.label}</div>
    </div>
  );
};
