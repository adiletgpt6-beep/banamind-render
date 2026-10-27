// Полоска частей вверху: в какой книге «Государства» мы сейчас.
import React from "react";
import { C, FONT } from "../theme";
import type { PartId } from "../types";

const PARTS: { id: PartId; label: string }[] = [
  { id: "intro", label: "Вопрос" },
  { id: "b1", label: "I" },
  { id: "b23", label: "II–III" },
  { id: "b4", label: "IV" },
  { id: "b5", label: "V" },
  { id: "b67", label: "VI–VII" },
  { id: "b89", label: "VIII–IX" },
  { id: "b10", label: "X" },
  { id: "end", label: "Итог" },
];

export const PartBar: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => {
  const idx = PARTS.findIndex((p) => p.id === part);
  return (
    <div style={{ position: "absolute", left: 40, top: 28, display: "flex", gap: 8, opacity, alignItems: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 21, color: C.soft, marginRight: 6, letterSpacing: 0.5 }}>Книги</div>
      {PARTS.map((p, i) => (
        <div
          key={p.id}
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 21,
            padding: "5px 14px",
            borderRadius: 18,
            color: i === idx ? C.ink : C.soft,
            background: i === idx ? C.yellow : "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            opacity: i <= idx ? 1 : 0.6,
          }}
        >
          {p.label}
        </div>
      ))}
    </div>
  );
};
