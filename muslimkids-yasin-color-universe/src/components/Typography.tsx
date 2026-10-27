import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { smoothstep, easeOutCubic } from "../engines/rng";
import type { TextItem, Span } from "../scenes/types";
import { FONT } from "./fonts";

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
};

const spanParts = (spans: Span[]) => spans.map((s) => (typeof s === "string" ? { t: s, c: undefined as string | undefined } : s));

/** Кинетическая типографика: короткие надписи появляются плавно, без мерцания. */
export const TextLayer: React.FC<{ item: TextItem }> = ({ item }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < item.from - 0.01 || t > item.to + 0.01) return null;
  const inF = smoothstep(item.from, item.from + 0.45, t);
  const outF = 1 - smoothstep(item.to - 0.35, item.to, t);
  const anim = item.anim ?? "rise";
  const font = FONT[item.font ?? "manrope"];
  const shadow = isLight(item.color) ? "0 3px 18px rgba(4,8,32,0.55), 0 0 2px rgba(4,8,32,0.35)" : "none";
  const words = anim === "words";
  let k = 0;
  const lines = spanParts(item.spans);
  const content = lines.map((sp, i) => {
    const pieces = sp.t.split(/(\n|\s+)/);
    return (
      <span key={i} style={{ color: sp.c ?? item.color }}>
        {pieces.map((p, j) => {
          if (p === "\n") return <br key={j} />;
          if (!words || /^\s+$/.test(p) || p === "") return <React.Fragment key={j}>{p}</React.Fragment>;
          const d = k++ * 0.08;
          const f = easeOutCubic(smoothstep(item.from + d, item.from + d + 0.4, t));
          return (
            <span key={j} style={{ display: "inline-block", opacity: f, transform: `translateY(${(1 - f) * 26}px)` }}>
              {p}
            </span>
          );
        })}
      </span>
    );
  });
  const e = easeOutCubic(inF);
  const transform =
    anim === "rise" ? `translateY(${(1 - e) * 34}px)` : anim === "scale" ? `scale(${0.88 + 0.12 * e})` : "none";
  const align = item.align ?? "center";
  return (
    <div
      style={{
        position: "absolute",
        left: align === "center" ? (item.x ?? 540) - 520 : item.x,
        width: align === "center" ? 1040 : 1080 - (item.x ?? 0) - 30,
        top: item.y,
        transform: `translateY(-50%)`,
        textAlign: align,
        direction: item.dir ?? "ltr",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: font,
          fontWeight: item.weight ?? 700,
          fontSize: item.size,
          lineHeight: item.lineHeight ?? 1.15,
          letterSpacing: item.letterSpacing ?? 0,
          color: item.color,
          textShadow: shadow,
          opacity: (words ? 1 : inF) * outF,
          transform,
          whiteSpace: "pre-line",
        }}
      >
        {content}
      </div>
    </div>
  );
};

export const Typography: React.FC<{ items: TextItem[] }> = ({ items }) => (
  <>
    {items.map((it, i) => (
      <TextLayer key={i} item={it} />
    ))}
  </>
);
