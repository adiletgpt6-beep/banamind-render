// Полоска частей фильма вверху: зритель видит, в какой части книги мы сейчас.
import React from "react";
import { C, FONT } from "../theme";
import type { PartId } from "../types";

const PARTS: { id: PartId; label: string }[] = [
  { id: "intro", label: "Начало" },
  { id: "first", label: "Быть первым" },
  { id: "word", label: "Одно слово" },
  { id: "ladder", label: "Лестница" },
  { id: "focus", label: "Фокус" },
  { id: "time", label: "Время и честность" },
  { id: "ego", label: "Эго и ошибки" },
  { id: "hype", label: "Шум и ресурсы" },
  { id: "end", label: "Итоги" },
];

export const PartBar: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => {
  const idx = PARTS.findIndex((p) => p.id === part);
  return (
    <div style={{ position: "absolute", left: 36, top: 26, display: "flex", gap: 8, opacity }}>
      {PARTS.map((p, i) => (
        <div
          key={p.id}
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 20,
            padding: "5px 14px",
            borderRadius: 18,
            color: i === idx ? C.ink : C.inkSoft,
            background: i === idx ? C.yellow : "rgba(255,255,255,0.6)",
            opacity: i <= idx ? 1 : 0.65,
          }}
        >
          {p.label}
        </div>
      ))}
    </div>
  );
};
