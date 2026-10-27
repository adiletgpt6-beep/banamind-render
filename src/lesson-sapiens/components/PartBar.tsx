// Полоска частей фильма вверху: зритель видит, в какой эпохе рассуждения мы сейчас.
import React from "react";
import { C, FONT } from "../theme";
import type { PartId } from "../types";

const PARTS: { id: PartId; label: string }[] = [
  { id: "intro", label: "Загадка" },
  { id: "cognitive", label: "Язык" },
  { id: "agrarian", label: "Поле" },
  { id: "order", label: "Порядок" },
  { id: "unity", label: "Деньги" },
  { id: "science", label: "Наука" },
  { id: "future", label: "Счастье" },
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
    </div>
  );
};
