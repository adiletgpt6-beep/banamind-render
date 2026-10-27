import React from "react";
import { COLORS, FONT } from "../styles/theme";
import { easeOutCubic, smoothstep } from "../engines/math";

// TypographyEngine — one calm, readable title system: large uppercase term, optional
// small sub-line; enters with a short rise and letter-spacing settle, leaves with a fade.
export type Caption = {
  t0: number; t1: number;
  lines: string[];
  sub?: string;
  x?: number; y: number;
  size?: number;
  color?: string;
  align?: "center" | "left";
  stagger?: number; // seconds between lines
};

export const Title: React.FC<{ c: Caption; t: number }> = ({ c, t }) => {
  const out = 1 - smoothstep(c.t1 - 0.45, c.t1, t);
  if (t < c.t0 || out <= 0) return null;
  const size = c.size ?? 76;
  const x = c.x ?? 540;
  return (
    <div style={{ position: "absolute", left: x - 470, top: c.y, width: 940, textAlign: c.align ?? "center", fontFamily: FONT }}>
      {c.lines.map((line, i) => {
        const tin = c.t0 + i * (c.stagger ?? 0.35);
        const a = easeOutCubic(Math.min(1, Math.max(0, (t - tin) / 0.6)));
        return (
          <div key={i} style={{
            fontSize: size, fontWeight: 850, lineHeight: 1.12, color: c.color ?? COLORS.white,
            letterSpacing: `${0.04 + (1 - a) * 0.08}em`, opacity: a * out,
            transform: `translateY(${(1 - a) * 26}px)`,
            textShadow: "0 0 34px rgba(8,20,38,0.75), 0 3px 10px rgba(8,20,38,0.9), 0 0 2px rgba(8,20,38,0.8)",
          }}>{line}</div>
        );
      })}
      {c.sub && (() => {
        const tin = c.t0 + c.lines.length * (c.stagger ?? 0.35) + 0.15;
        const a = easeOutCubic(Math.min(1, Math.max(0, (t - tin) / 0.6)));
        return (
          <div style={{
            marginTop: 18, fontSize: Math.round(size * 0.44), fontWeight: 650, color: COLORS.sky,
            letterSpacing: "0.03em", opacity: a * out * 0.95, transform: `translateY(${(1 - a) * 14}px)`,
            textShadow: "0 0 22px rgba(8,20,38,0.85), 0 2px 6px rgba(8,20,38,0.95)",
          }}>{c.sub}</div>
        );
      })()}
    </div>
  );
};

/** small label with a hairline pointer to a screen point */
export const PointerLabel: React.FC<{ t: number; t0: number; t1: number; text: string; at: { x: number; y: number }; to: { x: number; y: number } }> = ({ t, t0, t1, text, at, to }) => {
  const a = smoothstep(t0, t0 + 0.5, t) * (1 - smoothstep(t1 - 0.4, t1, t));
  if (a <= 0) return null;
  const right = at.x > to.x;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: a }}>
        <line x1={at.x} y1={at.y} x2={to.x} y2={to.y} stroke={COLORS.white} strokeOpacity={0.8} strokeWidth={2} />
        <circle cx={to.x} cy={to.y} r={6} fill={COLORS.gold} />
      </svg>
      <div style={{
        position: "absolute", top: at.y - 26, left: right ? at.x + 12 : undefined, right: right ? undefined : 1080 - at.x + 12,
        fontFamily: FONT, fontSize: 40, fontWeight: 800, color: COLORS.white, opacity: a,
        textShadow: "0 2px 12px rgba(8,20,38,0.95)",
      }}>{text}</div>
    </>
  );
};
