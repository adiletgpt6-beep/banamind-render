// Табличка главы вверху слева: монетка-значок и название текущего урока
// (зритель видит, где он в книге). Без счётчиков и времени.
import React from "react";
import { C, CHAPTERS, FONT } from "../theme";
import type { ChapterId } from "../types";

export const ChapterBar: React.FC<{ chapter: ChapterId; opacity: number }> = ({ chapter, opacity }) => {
  const ch = CHAPTERS.find((c) => c.id === chapter);
  if (opacity <= 0 || !ch) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: 28, display: "flex", alignItems: "center", gap: 14, opacity }}>
      <div style={{ width: 46, height: 46, borderRadius: 23, background: C.gold, border: `4px solid ${C.goldDeep}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(31,42,68,0.18)" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.ink }}>¤</div>
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 26, color: C.ink, padding: "6px 18px", borderRadius: 22, background: "rgba(255,255,255,0.78)" }}>{ch.label}</div>
    </div>
  );
};
