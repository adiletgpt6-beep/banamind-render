// Подпись участка фильма вверху слева: часть книги (цветная метка) и тема
// разговора. Без номеров времени, счётчиков и полос прогресса.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { accentOf, C, FONT, SECTIONS } from "../theme";
import type { PartId } from "../types";

export const RoomTag: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => {
  const a = accentOf(part);
  return (
    <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14, opacity }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.ink, background: BRAND.yellow, padding: "6px 16px", borderRadius: 20 }}>BanaMind</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 800, fontSize: 24, color: "#fff", background: "rgba(40,24,40,0.55)", padding: "6px 18px", borderRadius: 20 }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: a.color, boxShadow: "0 0 0 3px rgba(255,255,255,0.85)" }} />
        {SECTIONS[part].title}
      </div>
    </div>
  );
};
