// Экранный текст: «Урок 1», «Кто построил домик?», «Утром», финальная
// надпись «Создатель мира — Аллах» и необязательный слой субтитров.
// Появление мягкое и короткое (по словам, как в референсе), затем текст стоит.
import React from "react";
import { fontFamily } from "../fonts";
import { clamp, easeOut } from "./rig/geom";

const INK = "#234467";

const Words: React.FC<{ text: string; u: number; size: number; weight?: number; color?: string; stagger?: number }> = ({ text, u, size, weight = 800, color = INK, stagger = 0.11 }) => {
  const words = text.split(" ");
  return (
    <span>
      {words.map((w, i) => {
        const k = easeOut(clamp((u - i * stagger) / 0.35));
        return (
          <span key={i} style={{ display: "inline-block", opacity: k, transform: `translateY(${(1 - k) * 14}px)`, marginRight: i < words.length - 1 ? size * 0.28 : 0, fontSize: size, fontWeight: weight, color }}>
            {w}
          </span>
        );
      })}
    </span>
  );
};

const Panel: React.FC<{ children: React.ReactNode; opacity: number; style?: React.CSSProperties }> = ({ children, opacity, style }) => (
  <div
    style={{
      position: "absolute",
      fontFamily,
      background: "rgba(251, 248, 241, 0.94)",
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

export type OverlayTimes = { titleIn: number; titleOut: number; morningIn: number; morningOut: number; finalIn: number };

export const Overlays: React.FC<{ t: number; o: OverlayTimes; subtitle?: string | null }> = ({ t, o, subtitle }) => {
  const titleVis = clamp((t - o.titleIn) / 0.35) * (1 - clamp((t - o.titleOut) / 0.45));
  const mornVis = clamp((t - o.morningIn) / 0.4) * (1 - clamp((t - o.morningOut) / 0.4));
  const finVis = clamp((t - o.finalIn) / 0.5);
  return (
    <>
      {titleVis > 0.001 ? (
        <>
          <Panel opacity={titleVis} style={{ left: 96, top: 70, padding: "10px 24px" }}>
            <span style={{ fontSize: 34, fontWeight: 800, color: "#c65c49" }}>Урок 1</span>
          </Panel>
          <Panel opacity={titleVis} style={{ left: "50%", top: 64, transform: "translateX(-50%)", padding: "18px 44px", whiteSpace: "nowrap" }}>
            <Words text="Кто построил домик?" u={t - o.titleIn} size={60} />
          </Panel>
        </>
      ) : null}
      {mornVis > 0.001 ? (
        <Panel opacity={mornVis} style={{ left: 96, top: 70, padding: "12px 30px" }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#b8732f" }}>Утром</span>
        </Panel>
      ) : null}
      {finVis > 0.001 ? (
        <Panel opacity={finVis} style={{ left: "50%", bottom: 92, transform: "translateX(-50%)", padding: "20px 52px", whiteSpace: "nowrap" }}>
          <Words text="Создатель мира — Аллах" u={t - o.finalIn} size={64} stagger={0.13} />
        </Panel>
      ) : null}
      {subtitle ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center", fontFamily }}>
          <div style={{ maxWidth: 1500, background: "rgba(20, 32, 48, 0.78)", color: "#fff", fontSize: 40, fontWeight: 700, padding: "10px 26px", borderRadius: 14, textAlign: "center" }}>{subtitle}</div>
        </div>
      ) : null}
    </>
  );
};
