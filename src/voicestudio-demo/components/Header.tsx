import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT, SHADOW } from "../theme";
import { useEnter } from "./ui";

/** Шапка возможности «#N Название» и трекер прогресса N/3. */
export const FeatureHeader: React.FC<{
  n: number;
  title: string;
  color: string;
  icon: React.ReactNode;
  delay: number;
}> = ({ n, title, color, icon, delay }) => {
  const frame = useCurrentFrame();
  const p = useEnter(delay, 16);
  const fill = interpolate(frame, [delay + 6, delay + 22], [n - 1, n], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 214,
        left: 60,
        right: 60,
        height: 104,
        borderRadius: 34,
        background: "rgba(255,255,255,0.94)",
        border: "1.5px solid rgba(214,221,236,0.9)",
        boxShadow: SHADOW.card,
        display: "flex",
        alignItems: "center",
        padding: "0 30px",
        gap: 20,
        opacity: p,
        transform: `translateY(${(1 - p) * -40}px)`,
      }}
    >
      <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color }}>#{n}</div>
      <div style={{ width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div data-fit="header" style={{ fontFamily: FONT.text, fontWeight: 800, fontSize: 40, color: C.navy, flex: 1, whiteSpace: "nowrap" }}>
        {title}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 34,
              height: 14,
              borderRadius: 7,
              background: C.soft,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(0, Math.min(1, fill - i)) * 100}%`,
                height: "100%",
                background: [C.orange, C.blue, C.violet][i],
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
