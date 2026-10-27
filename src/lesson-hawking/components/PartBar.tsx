// Полоска частей фильма вверху: зритель видит, в какой теме рассуждения мы сейчас.
import React from "react";
import { C, FONT } from "../theme";
import type { PartId } from "../types";

export const PARTS: { id: PartId; label: string }[] = [
  { id: "intro", label: "Загадка" },
  { id: "models", label: "Модели" },
  { id: "light", label: "Свет и время" },
  { id: "expand", label: "Расширение" },
  { id: "quantum", label: "Кванты" },
  { id: "holes", label: "Чёрные дыры" },
  { id: "arrows", label: "Стрелы" },
  { id: "unity", label: "Единство" },
  { id: "end", label: "Итоги" },
];

export const PartBar: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => {
  const idx = PARTS.findIndex((p) => p.id === part);
  return (
    <div style={{ position: "absolute", left: 36, top: 28, display: "flex", gap: 8, opacity }}>
      {PARTS.map((p, i) => (
        <div
          key={p.id}
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 20,
            padding: "5px 13px",
            borderRadius: 18,
            color: i === idx ? C.night : C.dim,
            background: i === idx ? C.yellow : "rgba(20, 28, 64, 0.72)",
            border: i === idx ? "none" : "1px solid rgba(160,190,255,0.25)",
            opacity: i <= idx ? 1 : 0.75,
          }}
        >
          {p.label}
        </div>
      ))}
    </div>
  );
};
