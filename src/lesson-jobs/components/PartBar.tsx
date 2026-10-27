// Полоска частей фильма вверху: зритель видит, в какой главе истории мы сейчас.
import React from "react";
import { C, FONT } from "../theme";
import type { PartId } from "../types";

const PARTS: { id: PartId; label: string }[] = [
  { id: "intro", label: "Вопрос" },
  { id: "roots", label: "Истоки" },
  { id: "garage", label: "Гараж" },
  { id: "mac", label: "Mac" },
  { id: "exile", label: "Изгнание" },
  { id: "return", label: "Возврат" },
  { id: "system", label: "Система" },
  { id: "iphone", label: "iPhone" },
  { id: "price", label: "Цена" },
  { id: "end", label: "Итоги" },
];

export const PartBar: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => {
  const idx = PARTS.findIndex((p) => p.id === part);
  return (
    <div style={{ position: "absolute", left: 40, top: 28, display: "flex", gap: 8, opacity }}>
      {PARTS.map((p, i) => (
        <div
          key={p.id}
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 20,
            padding: "5px 13px",
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
