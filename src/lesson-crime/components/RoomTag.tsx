// Подпись «комнаты» лаборатории совести вверху слева: зритель видит, в какой
// части разбора мы сейчас. Без номеров времени и прогресс-полос.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, FONT } from "../theme";
import type { PartId } from "../types";

export const ROOMS: Record<PartId, string> = {
  intro: "Лаборатория совести",
  city: "Город, который давит",
  theory: "Теория и расчёт",
  after: "После «расчёта»",
  people: "Живые люди",
  duel: "Дуэль с Порфирием",
  sonya: "Соня",
  mirrors: "Зеркала",
  turn: "Раскаяние или страх?",
  siberia: "Наказание",
  end: "Выводы",
};

export const RoomTag: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => (
  <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14, opacity }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.ink, background: BRAND.yellow, padding: "6px 16px", borderRadius: 20 }}>BanaMind</div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: "#fff", background: "rgba(31,36,64,0.55)", padding: "6px 18px", borderRadius: 20 }}>{ROOMS[part]}</div>
  </div>
);
