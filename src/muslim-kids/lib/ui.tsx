// Общие элементы оформления Muslim Kids: сетка-фон, кинетическая типографика,
// водяной знак. Всё зависит только от кадра.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT, MK } from "../theme";
import { clamp01, ease, range } from "./math";

// тонкая инфографическая сетка (как в референсе): шаг 60 px
export const Grid: React.FC<{ dark: boolean; opacity?: number }> = ({
  dark,
  opacity = 1,
}) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage: `linear-gradient(${dark ? "rgba(255,255,255,0.045)" : "rgba(8,9,13,0.05)"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(255,255,255,0.045)" : "rgba(8,9,13,0.05)"} 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
      backgroundPosition: "0 0",
    }}
  />
);

export type Part = string | { t: string; c: string };

type RevealProps = {
  parts: Part[];
  at: number; // кадр начала (локальный)
  out?: number; // кадр ухода
  by?: "char" | "word";
  stagger?: number;
  dur?: number;
  rise?: number;
  color?: string;
  style?: React.CSSProperties;
  align?: "left" | "center" | "right";
};

// Появление по буквам/словам: подъём, проявление и снятие размытия.
export const Reveal: React.FC<RevealProps> = ({
  parts,
  at,
  out,
  by = "word",
  stagger = 3,
  dur = 16,
  rise = 36,
  color = MK.white,
  style,
  align = "center",
}) => {
  const f = useCurrentFrame();
  const units: { t: string; c: string }[] = [];
  for (const p of parts) {
    const { t, c } = typeof p === "string" ? { t: p, c: color } : p;
    if (by === "char") for (const ch of [...t]) units.push({ t: ch, c });
    else for (const w of t.split(/(\s+)/)) if (w) units.push({ t: w, c });
  }
  const q = out === undefined ? 0 : ease.inOutCubic(range(f, out, out + 14));
  let k = 0;
  return (
    <div
      style={{
        textAlign: align,
        opacity: 1 - q,
        transform: `translateY(${-q * 28}px)`,
        ...style,
      }}
    >
      {units.map((u, i) => {
        if (/^\s+$/.test(u.t)) return <span key={i}>{u.t}</span>;
        const p = ease.outCubic(clamp01((f - at - k * stagger) / dur));
        k++;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              color: u.c,
              opacity: p,
              transform: `translateY(${(1 - p) * rise}px)`,
              filter:
                p < 1 ? `blur(${((1 - p) * 10).toFixed(2)}px)` : undefined,
            }}
          >
            {u.t}
          </span>
        );
      })}
    </div>
  );
};

// Заголовок в верхней части кадра (стиль инфографики референса)
export const Header: React.FC<{
  parts: Part[];
  at: number;
  out?: number;
  color?: string;
  top?: number;
  size?: number;
}> = ({ parts, at, out, color = MK.white, top = 210, size = 50 }) => (
  <AbsoluteFill style={{ top, height: "auto", padding: "0 80px" }}>
    <Reveal
      parts={parts}
      at={at}
      out={out}
      color={color}
      stagger={2}
      style={{
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.22,
        letterSpacing: -0.5,
      }}
    />
  </AbsoluteFill>
);

export const Watermark: React.FC<{ dark: boolean; opacity?: number }> = ({
  dark,
  opacity = 1,
}) => (
  <AbsoluteFill
    style={{ top: 1745, height: 40, alignItems: "center", opacity }}
  >
    <div
      style={{
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: 6,
        color: dark ? "rgba(255,255,255,0.42)" : "rgba(8,9,13,0.42)",
      }}
    >
      MUSLIM KIDS
    </div>
  </AbsoluteFill>
);
