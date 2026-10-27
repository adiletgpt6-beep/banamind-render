// Значок слоя вверху слева: три стопкой лежащих листа карты, активный подсвечен,
// рядом — номер и название слоя и акт фильма. Без счётчиков и времени.
import React from "react";
import { ACTS, C, FONT, LAYERS } from "../theme";
import type { ActId } from "../types";

export const LayerBar: React.FC<{ act: ActId; opacity: number }> = ({ act, opacity }) => {
  if (opacity <= 0) return null;
  const a = ACTS.find((x) => x.id === act)!;
  const L = LAYERS.find((x) => x.id === a.layer)!;
  return (
    <div style={{ position: "absolute", left: 36, top: 26, display: "flex", alignItems: "center", gap: 14, opacity }}>
      <svg width={64} height={56} viewBox="0 0 64 56">
        {LAYERS.map((l, i) => {
          const y = 40 - i * 13;
          const on = l.id === a.layer;
          return <path key={l.id} d={`M 6 ${y} L 32 ${y - 9} L 58 ${y} L 32 ${y + 9} Z`} fill={on ? l.color : "#ffffff"} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" opacity={on ? 1 : 0.85} />;
        })}
      </svg>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 25, color: C.ink, padding: "6px 18px", borderRadius: 22, background: "rgba(255,255,255,0.84)", display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ color: L.color }}>Слой {L.n}</span>
        <span>· {a.label}</span>
      </div>
    </div>
  );
};
