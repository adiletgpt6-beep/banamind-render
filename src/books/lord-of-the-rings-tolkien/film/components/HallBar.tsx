// Табличка зала вверху слева: номер и название текущего зала музея
// (зритель видит, где он в расследовании). Без счётчиков и времени.
import React from "react";
import { C, FONT, HALLS } from "../theme";
import type { HallId } from "../types";

export const HallBar: React.FC<{ hall: HallId; opacity: number }> = ({ hall, opacity }) => {
  const idx = HALLS.findIndex((h) => h.id === hall);
  if (opacity <= 0) return null;
  const h = HALLS[idx];
  const label = idx === 0 ? "Вход в музей" : idx === HALLS.length - 1 ? "Выход из музея" : `Зал ${idx} · ${h.label}`;
  return (
    <div style={{ position: "absolute", left: 40, top: 28, display: "flex", alignItems: "center", gap: 14, opacity }}>
      <div style={{ width: 46, height: 46, borderRadius: 23, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(35,42,68,0.18)" }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, border: `5px solid ${C.ink}` }} />
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 26, color: C.ink, padding: "6px 18px", borderRadius: 22, background: "rgba(255,255,255,0.72)" }}>{label}</div>
    </div>
  );
};
