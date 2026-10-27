// Подпись части фильма вверху слева: какой блок разбора идёт сейчас и какой из
// трёх рабочих столов в нём главный (цветная метка). Без номеров времени и прогресс-полос.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, DC, FONT, type DeskId } from "../theme";
import type { PartId } from "../types";

export const ROOMS: Record<PartId, { name: string; desk?: DeskId }> = {
  intro: { name: "Цена невозможного" },
  author: { name: "Книга и её взгляд" },
  early: { name: "Начало без мифа", desk: "ppl" },
  zip2: { name: "Zip2 · продукт и управление", desk: "ppl" },
  paypal: { name: "X.com и PayPal · контроль и доверие", desk: "ppl" },
  spacex: { name: "SpaceX · цена ракеты", desk: "eng" },
  tesla: { name: "Tesla · от идеи к машине", desk: "eng" },
  crisis: { name: "2008 · все риски сразу", desk: "res" },
  launch: { name: "Испытание → данные → система", desk: "eng" },
  factory: { name: "Прототип и серия", desk: "eng" },
  horizon: { name: "Горизонт миссии · 2013", desk: "res" },
  cost: { name: "Человеческая цена", desk: "ppl" },
  end: { name: "Три вывода" },
};

export const RoomTag: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => {
  const r = ROOMS[part];
  const d = r.desk ? DC[r.desk] : undefined;
  return (
    <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14, opacity }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.ink, background: BRAND.yellow, padding: "6px 16px", borderRadius: 20 }}>BanaMind</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 800, fontSize: 24, color: "#fff", background: "rgba(22,30,62,0.6)", padding: "6px 18px", borderRadius: 20 }}>
        {d && <span style={{ width: 16, height: 16, borderRadius: 8, background: d.color, boxShadow: "0 0 0 3px rgba(255,255,255,0.85)" }} />}
        {r.name}
      </div>
    </div>
  );
};
