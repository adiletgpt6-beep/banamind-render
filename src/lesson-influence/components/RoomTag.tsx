// Подпись части фильма вверху слева: зритель видит, какой фильтр согласия
// разбирается сейчас (цветная метка фильтра). Без номеров времени и прогресс-полос.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, FC, FONT, type FilterId } from "../theme";
import type { PartId } from "../types";

export const ROOMS: Record<PartId, string> = {
  intro: "Студия решений",
  auto: "Автопилот согласия",
  recip: "Фильтр 1 · Взаимность",
  liking: "Фильтр 2 · Симпатия",
  social: "Фильтр 3 · Социальное доказательство",
  authority: "Фильтр 4 · Авторитет",
  scarcity: "Фильтр 5 · Дефицит",
  commit: "Фильтр 6 · Последовательность",
  unity: "Фильтр 7 · Единство",
  story: "Семь фильтров в одной истории",
  defense: "Как вернуть себе выбор",
  end: "Выводы",
};

export const RoomTag: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => {
  const f = (FC as Record<string, (typeof FC)[FilterId] | undefined>)[part];
  return (
    <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14, opacity }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.ink, background: BRAND.yellow, padding: "6px 16px", borderRadius: 20 }}>BanaMind</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 800, fontSize: 24, color: "#fff", background: "rgba(24,30,60,0.6)", padding: "6px 18px", borderRadius: 20 }}>
        {f && <span style={{ width: 16, height: 16, borderRadius: 8, background: f.color, boxShadow: "0 0 0 3px rgba(255,255,255,0.85)" }} />}
        {ROOMS[part]}
      </div>
    </div>
  );
};
