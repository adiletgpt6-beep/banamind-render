// TypographySystem — Unbounded (headings) + Manrope (text), both OFL with
// full Cyrillic. Calm fades and small rises, no rotating or deforming text.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { continueRender, delayRender, staticFile } from "remotion";

export const HEAD = "Unbounded";
export const BODY = "Manrope";
export const C = {
  deep: "#081627", sapphire: "#194F88", teal: "#59CED6", gold: "#EFC374",
  emerald: "#45AD80", sky: "#A0DCF1", milk: "#F7F5EF", brown: "#967354",
};

const CYR = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";
const LAT = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
let fontsReady: Promise<unknown> | null = null;
export const loadFonts = () => {
  if (fontsReady) return fontsReady;
  const h = delayRender("fonts");
  const f = (family: string, file: string, weight: string, range: string) =>
    loadFont({ family, url: staticFile(`fonts/${file}`), weight, unicodeRange: range, format: "woff2" });
  fontsReady = Promise.all([
    ...["500", "600", "700"].flatMap((w) => [
      f(HEAD, `unbounded-cyrillic-${w}-normal.woff2`, w, CYR),
      f(HEAD, `unbounded-latin-${w}-normal.woff2`, w, LAT),
    ]),
    ...["500", "600", "700", "800"].flatMap((w) => [
      f(BODY, `manrope-cyrillic-${w}-normal.woff2`, w, CYR),
      f(BODY, `manrope-latin-${w}-normal.woff2`, w, LAT),
    ]),
  ]).then(() => continueRender(h));
  return fontsReady;
};

const shadow = "0 2px 18px rgba(4,12,24,0.75), 0 1px 3px rgba(4,12,24,0.8)";

/** Fade + gentle rise + slight unblur, driven by k ∈ [0,1]. */
export const reveal = (k: number): React.CSSProperties => ({
  opacity: k,
  transform: `translateY(${(1 - k) * 18}px)`,
  filter: k < 0.999 ? `blur(${(1 - k) * 6}px)` : undefined,
});

export const Label: React.FC<{
  x: number; y: number; dx: number; dy: number; text: string; k: number; size?: number; align?: "left" | "right";
}> = ({ x, y, dx, dy, text, k, size = 40, align = dx >= 0 ? "left" : "right" }) => {
  if (k <= 0.001) return null;
  // keep the whole label inside the frame (40 px margins)
  const w = text.length * size * 0.92 + 40;
  let lx = x + dx;
  const ly = y + dy;
  if (align === "right" && lx - 14 - w < 40) lx = 54 + w;
  if (align === "left" && lx + 14 + w > 1040) lx = 1026 - w;
  dx = lx - x;
  const len = Math.hypot(dx, dy);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={x} y1={y} x2={x + dx * k} y2={y + dy * k} stroke={C.gold} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={len} strokeDashoffset={0} opacity={0.95} />
        <circle cx={x} cy={y} r={9 * Math.min(1, k * 2)} fill={C.gold} stroke={C.deep} strokeWidth={3} />
      </svg>
      <div
        style={{
          position: "absolute", top: ly - size * 0.75,
          ...(align === "left" ? { left: lx + 14 } : { right: 1080 - lx + 14 }),
          fontFamily: HEAD, fontWeight: 600, fontSize: size, letterSpacing: 2, color: C.milk,
          textShadow: shadow, whiteSpace: "nowrap", padding: "6px 16px", borderRadius: 14,
          background: "rgba(8,22,39,0.62)", ...reveal(k),
        }}
      >
        {text}
      </div>
    </>
  );
};

export const Note: React.FC<{ text: string; k: number; y?: number }> = ({ text, k, y = 1540 }) =>
  k <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", ...reveal(k) }}>
      <span
        style={{
          fontFamily: BODY, fontWeight: 600, fontSize: 34, color: C.sky, letterSpacing: 0.5,
          padding: "10px 26px", borderRadius: 40, background: "rgba(8,22,39,0.62)",
          border: "1.5px solid rgba(160,220,241,0.35)",
        }}
      >
        {text}
      </span>
    </div>
  );

export { shadow };
