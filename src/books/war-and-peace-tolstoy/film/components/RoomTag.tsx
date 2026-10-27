// Подпись части разбора вверху слева: зритель видит, на каком слое карты мы
// сейчас. Без номеров времени и прогресс-полос.
import React from "react";
import { BRAND } from "../../../../banamind/brand";
import { FONT } from "../theme";
import type { PartId } from "../types";
import { ROOMS } from "../rooms";

export { ROOMS };

export const RoomTag: React.FC<{ part: PartId; opacity: number }> = ({ part, opacity }) => (
  <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14, opacity }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: "#1d2340", background: BRAND.yellow, padding: "6px 16px", borderRadius: 20 }}>BanaMind</div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: "#fff", background: "rgba(29,35,64,0.6)", padding: "6px 18px", borderRadius: 20 }}>{ROOMS[part]}</div>
  </div>
);
