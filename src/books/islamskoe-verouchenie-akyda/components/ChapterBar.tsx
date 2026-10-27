// Подпись текущей части вверху кадра: зритель видит, в какой части книги мы сейчас.
// Без таймеров и счётчиков времени.
import React from "react";
import { C, FONT, PART_LABEL } from "../theme";
import type { PartId } from "../types";

const ORDER: PartId[] = ["intro", "religion", "iman", "allah", "attributes", "qadar", "prophets", "books", "unseen", "akhira", "finale"];

export const ChapterBar: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => {
  const idx = ORDER.indexOf(part);
  if (idx <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14, opacity }}>
      <div style={{ display: "flex", gap: 6 }}>
        {ORDER.slice(1).map((p, i) => (
          <div key={p} style={{ width: i + 1 === idx ? 30 : 12, height: 12, borderRadius: 6, background: i + 1 <= idx ? C.gold : "rgba(255,255,255,0.65)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
        ))}
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, padding: "6px 18px", borderRadius: 20, color: C.ink, background: "rgba(255,255,255,0.85)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>{PART_LABEL[part]}</div>
    </div>
  );
};
