// Экранный текст ролика 80-1-4 — ровно две смысловые надписи:
// «Аллах Един» (сцена 5) и «Аллах — Единственный Создатель» (финал), плюс
// отключаемые субтитры (по умолчанию выключены). Оформление — как в
// предыдущих фильмах: шрифт Nunito (полная кириллица), светлая плашка,
// мягкое появление без эффектов. Надписи — вверху кадра, над головами
// персонажей; безопасные поля ≥ 5 %.
import React from "react";
import { fontFamily } from "../fonts";
import { clamp, easeOut } from "../lesson01/rig/geom";
import { A4_TEXT } from "./script";

const INK = "#234467";
const GREEN = "#2f6f4a";

const Panel: React.FC<{ children: React.ReactNode; opacity: number; rise: number; style?: React.CSSProperties }> = ({ children, opacity, rise, style }) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: 78,
      transform: `translate(-50%, ${((1 - rise) * 14).toFixed(1)}px)`,
      fontFamily,
      background: "rgba(251, 248, 241, 0.95)",
      borderRadius: 26,
      boxShadow: "0 10px 30px rgba(35, 68, 103, 0.16)",
      border: "3px solid rgba(35, 68, 103, 0.12)",
      whiteSpace: "nowrap",
      opacity,
      ...style,
    }}
  >
    {children}
  </div>
);

export type OverlayTimes = { oneIn: number; oneOut: number; finalIn: number; finalOut: number };

export const captionVisibility = (t: number, o: OverlayTimes) => ({
  one: clamp((t - o.oneIn) / 0.5) * (1 - clamp((t - o.oneOut) / 0.5)),
  final: clamp((t - o.finalIn) / 0.6) * (1 - clamp((t - o.finalOut) / 0.6)),
});

// text — надписи языковой версии (по умолчанию русские)
export const Overlays: React.FC<{ t: number; o: OverlayTimes; subtitle?: string | null; text?: { one: string; final: string } }> = ({ t, o, subtitle, text = A4_TEXT }) => {
  const v = captionVisibility(t, o);
  return (
    <>
      {v.one > 0.001 ? (
        <Panel opacity={v.one} rise={easeOut(clamp((t - o.oneIn) / 0.5))} style={{ padding: "18px 54px" }}>
          <span style={{ fontSize: 76, fontWeight: 800, color: INK }}>{text.one}</span>
        </Panel>
      ) : null}
      {v.final > 0.001 ? (
        <Panel opacity={v.final} rise={easeOut(clamp((t - o.finalIn) / 0.6))} style={{ padding: "22px 60px" }}>
          <span style={{ fontSize: 74, fontWeight: 800, color: GREEN }}>{text.final}</span>
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
