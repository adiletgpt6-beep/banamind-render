// Подпись части фильма вверху слева: зритель видит, какой вопрос сейчас
// разбирается. Без номеров времени и прогресс-полос.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, FONT } from "../theme";
import { ROOMS } from "../rooms";
import type { PartId } from "../types";

export { ROOMS };

export const RoomTag: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => (
  <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14, opacity }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.ink, background: BRAND.yellow, padding: "6px 16px", borderRadius: 20 }}>BanaMind</div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: "#fff", background: "rgba(31,42,61,0.72)", padding: "6px 18px", borderRadius: 20 }}>{ROOMS[part]}</div>
  </div>
);
