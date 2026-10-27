// Подпись части фильма вверху слева: какая тема разбирается сейчас.
// Без номеров времени и прогресс-полос.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, FONT } from "../theme";
import type { PartId } from "../types";

export const ROOMS: Record<PartId, string> = {
  intro: "Лаборатория цепной реакции",
  talk: "Почему мы рассказываем",
  currency: "Камера 1 · Социальная валюта",
  triggers: "Камера 2 · Триггеры",
  emotion: "Камера 3 · Эмоции",
  public: "Камера 4 · Общество",
  value: "Камера 5 · Практическая ценность",
  stories: "Камера 6 · Истории",
  mix: "Шесть камер вместе",
  end: "Последний эксперимент",
};

export const RoomTag: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => (
  <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14, opacity }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.ink, background: BRAND.yellow, padding: "6px 16px", borderRadius: 20 }}>BanaMind</div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: "#fff", background: "rgba(29,35,64,0.78)", padding: "6px 18px", borderRadius: 20 }}>{ROOMS[part]}</div>
  </div>
);
