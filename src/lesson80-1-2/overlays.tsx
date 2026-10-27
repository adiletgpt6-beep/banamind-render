// Экранный текст ролика 80-1-2: название «Что спрятано в яблоке?»,
// пояснение «Проходят годы», финальная надпись «Замечай. Размышляй.
// Благодари Аллаха» (части появляются по словам), отключаемые субтитры.
// Настоящий шрифт Nunito с полной кириллицей; безопасные поля ≥ 5 %.
import React from "react";
import { fontFamily } from "../fonts";
import { clamp, easeOut } from "../lesson01/rig/geom";
import { A2_TEXT } from "./script";

const INK = "#234467";

const Panel: React.FC<{ children: React.ReactNode; opacity: number; style?: React.CSSProperties }> = ({ children, opacity, style }) => (
  <div
    style={{
      position: "absolute",
      fontFamily,
      background: "rgba(251, 248, 241, 0.95)",
      borderRadius: 26,
      boxShadow: "0 10px 30px rgba(35, 68, 103, 0.16)",
      border: "3px solid rgba(35, 68, 103, 0.12)",
      opacity,
      ...style,
    }}
  >
    {children}
  </div>
);

const Words: React.FC<{ text: string; u: number; size: number; color?: string; stagger?: number }> = ({ text, u, size, color = INK, stagger = 0.11 }) => {
  const words = text.split(" ");
  return (
    <span>
      {words.map((w, i) => {
        const k = easeOut(clamp((u - i * stagger) / 0.35));
        return (
          <span key={i} style={{ display: "inline-block", opacity: k, transform: `translateY(${(1 - k) * 12}px)`, marginRight: i < words.length - 1 ? size * 0.28 : 0, fontSize: size, fontWeight: 800, color }}>
            {w}
          </span>
        );
      })}
    </span>
  );
};

export type OverlayTimes = { titleIn: number; titleOut: number; yearsIn: number; yearsOut: number; finalIn: [number, number, number] };

export const Overlays: React.FC<{ t: number; o: OverlayTimes; subtitle?: string | null }> = ({ t, o, subtitle }) => {
  const titleVis = clamp((t - o.titleIn) / 0.4) * (1 - clamp((t - o.titleOut) / 0.5));
  const yearsVis = clamp((t - o.yearsIn) / 0.4) * (1 - clamp((t - o.yearsOut) / 0.4));
  const finVis = clamp((t - o.finalIn[0]) / 0.5);
  return (
    <>
      {titleVis > 0.001 ? (
        <Panel opacity={titleVis} style={{ left: "50%", top: 72, transform: "translateX(-50%)", padding: "18px 46px", whiteSpace: "nowrap" }}>
          <Words text={A2_TEXT.title} u={t - o.titleIn} size={62} />
        </Panel>
      ) : null}
      {yearsVis > 0.001 ? (
        <Panel opacity={yearsVis} style={{ left: 110, top: 72, padding: "12px 32px" }}>
          <span style={{ fontSize: 52, fontWeight: 800, color: "#7a5238" }}>{A2_TEXT.years}</span>
        </Panel>
      ) : null}
      {finVis > 0.001 ? (
        <Panel opacity={finVis} style={{ left: "50%", bottom: subtitle ? 150 : 86, transform: "translateX(-50%)", padding: "22px 56px", whiteSpace: "nowrap" }}>
          {A2_TEXT.final.map((part, i) => {
            const k = easeOut(clamp((t - o.finalIn[i]) / 0.45));
            return (
              <span key={i} style={{ display: "inline-block", opacity: k, transform: `translateY(${(1 - k) * 12}px)`, marginRight: i < 2 ? 26 : 0, fontSize: 72, fontWeight: 800, color: i === 2 ? "#2f6f4a" : INK }}>
                {part}
              </span>
            );
          })}
        </Panel>
      ) : null}
      {subtitle ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", fontFamily }}>
          <div style={{ maxWidth: 1500, background: "rgba(20, 32, 48, 0.78)", color: "#fff", fontSize: 40, fontWeight: 700, padding: "10px 26px", borderRadius: 14, textAlign: "center", lineHeight: 1.25 }}>{subtitle}</div>
        </div>
      ) : null}
    </>
  );
};
