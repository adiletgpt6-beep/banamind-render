// Полоска частей фильма вверху: зритель видит, в каком блоке разбора он сейчас.
import React from "react";
import { C, FONT } from "../theme";
import type { PartId } from "../types";

const PARTS: { id: PartId; label: string }[] = [
  { id: "intro", label: "Начало" },
  { id: "world", label: "Мир романа" },
  { id: "dagny", label: "Дагни" },
  { id: "rearden", label: "Риарден" },
  { id: "rules", label: "Правила игры" },
  { id: "choice", label: "Выбор и цена" },
  { id: "end", label: "Итоги" },
];

export const PartBar: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => {
  const idx = PARTS.findIndex((p) => p.id === part);
  return (
    <div style={{ position: "absolute", left: 40, top: 28, display: "flex", gap: 10, opacity }}>
      {PARTS.map((p, i) => (
        <div
          key={p.id}
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 22,
            padding: "6px 16px",
            borderRadius: 20,
            color: i === idx ? C.ink : C.inkSoft,
            background: i === idx ? C.yellow : "rgba(255,255,255,0.6)",
            opacity: i <= idx ? 1 : 0.7,
          }}
        >
          {p.label}
        </div>
      ))}
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, padding: "7px 14px", borderRadius: 20, color: C.inkSoft, background: "rgba(255,255,255,0.45)", marginLeft: 14 }}>
        только ознакомительный фрагмент · ч. I
      </div>
    </div>
  );
};
