import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { BG23_CTA, type Bg23Sub } from "./script";
import { C, clamp } from "./theme";

// Короткие титры фразами по таймингам слов. Нижняя позиция выше безопасной
// зоны Reels (≥ 400 px снизу); в финале — под карточкой контактов, ниже номера.
export const Subtitles: React.FC<{ readonly subs: readonly Bg23Sub[] }> = ({ subs }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const cur = subs.find((s) => t >= s.from && t < s.to);
  // финальная фраза уже крупно в кадре — второй слой титров не нужен
  if (!cur || cur.text === BG23_CTA.go) return null;
  const k = interpolate(t, [cur.from, cur.from + 0.12], [0, 1], clamp);
  const top = cur.scene === "cta" ? 1418 : 1408;
  return (
    <div style={{ position: "absolute", left: 90, right: 150, top, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 840,
          padding: "14px 30px",
          borderRadius: 26,
          background: "rgba(255,255,255,0.94)",
          border: `4px solid ${C.yellow}`,
          boxShadow: `0 12px 30px ${C.shadow}`,
          fontFamily,
          fontWeight: 900,
          fontSize: 46,
          lineHeight: 1.15,
          color: C.navy,
          textAlign: "center",
          opacity: k,
          transform: `translateY(${(1 - k) * 8}px)`,
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};
