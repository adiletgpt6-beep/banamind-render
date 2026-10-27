// Экранный текст ролика 80-1-3: короткое название (рус. «А если я не вижу?»)
// на первом общем плане, финальная фраза (рус. «Не всё можно узнать только
// глазами», две строки, после реплики 42) и отключаемые субтитры. Настоящий шрифт
// Nunito с полной кириллицей (и «ё», и кыргызские ү, ө, ң); безопасные поля ≥ 5 %. Появление —
// спокойное растворение без пословного прыгания и свечения.
import React from "react";
import { fontFamily } from "../fonts";
import { clamp, easeOut } from "../lesson01/rig/geom";

const INK = "#234467";

const Panel: React.FC<{ children: React.ReactNode; opacity: number; style?: React.CSSProperties }> = ({ children, opacity, style }) => (
  <div
    style={{
      position: "absolute",
      fontFamily,
      background: "rgba(251, 248, 241, 0.94)",
      borderRadius: 26,
      boxShadow: "0 10px 30px rgba(35, 68, 103, 0.14)",
      border: "3px solid rgba(35, 68, 103, 0.12)",
      opacity,
      ...style,
    }}
  >
    {children}
  </div>
);

export type OverlayTimes = { titleIn: number; titleOut: number; finalIn: number };
export type FinalPlace = { left: number; top: number };

// texts — название и финальная фраза языковой версии.
export type OverlayTexts = { readonly title: string; readonly final: readonly string[] };

export const Overlays: React.FC<{ t: number; o: OverlayTimes; finalAt: FinalPlace; subtitle?: string | null; texts: OverlayTexts }> = ({ t, o, finalAt, subtitle, texts }) => {
  const titleVis = clamp((t - o.titleIn) / 0.6) * (1 - clamp((t - o.titleOut) / 0.6));
  const finK = easeOut(clamp((t - o.finalIn) / 0.8));
  return (
    <>
      {titleVis > 0.001 ? (
        <Panel opacity={titleVis} style={{ left: 120, top: 96, padding: "18px 44px", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: 60, fontWeight: 800, color: INK }}>{texts.title}</span>
        </Panel>
      ) : null}
      {finK > 0.001 ? (
        <Panel opacity={finK} style={{ left: finalAt.left, top: finalAt.top + (1 - finK) * 8, padding: "24px 52px", textAlign: "center" }}>
          {texts.final.map((row, i) => (
            <div key={i} style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.18, color: INK, whiteSpace: "nowrap" }}>
              {row}
            </div>
          ))}
        </Panel>
      ) : null}
      {subtitle ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center", fontFamily }}>
          <div style={{ maxWidth: 1480, background: "rgba(20, 32, 48, 0.78)", color: "#fff", fontSize: 40, fontWeight: 700, padding: "10px 26px", borderRadius: 14, textAlign: "center", lineHeight: 1.25, whiteSpace: "pre-line" }}>{subtitle}</div>
        </div>
      ) : null}
    </>
  );
};
