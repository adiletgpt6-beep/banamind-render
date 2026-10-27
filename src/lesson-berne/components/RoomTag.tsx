// Подпись части фильма вверху слева: какая тема разбирается сейчас.
// Без номеров времени и прогресс-полос.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, FONT } from "../theme";
import type { PartId } from "../types";

export const ROOMS: Record<PartId, string> = {
  intro: "Монтажный стол",
  time: "Зачем людям ритуалы",
  game: "Что Берн называет игрой",
  states: "Родитель · Взрослый · Ребёнок",
  trans: "Куда идёт ответ",
  yesbut: "«Почему бы вам не… — Да, но»",
  caught: "Спор об ошибке",
  guest: "Неловкость и прощение",
  help: "Когда помощь не помогает",
  good: "Не все игры одинаковы",
  free: "Независимость",
  end: "Другой финал",
};

export const RoomTag: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => (
  <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14, opacity }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.ink, background: BRAND.yellow, padding: "6px 16px", borderRadius: 20 }}>BanaMind</div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: "#fff", background: "rgba(24,30,60,0.6)", padding: "6px 18px", borderRadius: 20 }}>{ROOMS[part]}</div>
  </div>
);
