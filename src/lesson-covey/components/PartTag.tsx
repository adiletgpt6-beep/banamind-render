// Подпись части фильма вверху слева: зритель видит, на какой развилке мы сейчас.
// Номер навыка — это номер главы книги, а не время: без часов, отсчётов и прогресс-полос.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, FONT, HABIT } from "../theme";
import type { PartId } from "../types";

export const PARTS: Record<PartId, { label: string; color: string }> = {
  cold: { label: "Один обычный день", color: C.coral },
  frame: { label: "Карта и характер", color: C.violet },
  h1: { label: `Навык 1 · ${HABIT[1].name}`, color: HABIT[1].color },
  h2: { label: `Навык 2 · Начинайте с конечной цели`, color: HABIT[2].color },
  h3: { label: `Навык 3 · Сначала — главное`, color: HABIT[3].color },
  bridge: { label: "Доверие между людьми", color: C.teal },
  h4: { label: `Навык 4 · Выиграл/Выиграл`, color: HABIT[4].color },
  h5: { label: `Навык 5 · Сначала понять`, color: HABIT[5].color },
  h6: { label: `Навык 6 · ${HABIT[6].name}`, color: HABIT[6].color },
  h7: { label: `Навык 7 · ${HABIT[7].name}`, color: HABIT[7].color },
  system: { label: "Семь навыков вместе", color: C.sunDeep },
};

export const PartTag: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => (
  <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14, opacity }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.ink, background: BRAND.yellow, padding: "6px 16px", borderRadius: 20 }}>BanaMind</div>
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 800, fontSize: 24, color: "#fff", background: "rgba(29,42,68,0.62)", padding: "6px 18px 6px 12px", borderRadius: 20 }}>
      <span style={{ width: 16, height: 16, borderRadius: 8, background: PARTS[part].color, boxShadow: "0 0 0 3px rgba(255,255,255,0.75)" }} />
      {PARTS[part].label}
    </div>
  </div>
);
