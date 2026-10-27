// Надписи и значки ролика: заголовок сцены, плашки, метка «Шарттуу мисал»,
// стрелки и галочки (SVG — в шрифте Nunito нет знака «→»).
// Надписи — в безопасной зоне Reels: сверху ≥ 250 px, снизу ≥ 400 px,
// справа ≥ 150 px (там кнопки интерфейса).
import type React from "react";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { clamp, easeOut } from "./motion";

// Стрелка → (или ↔) в цвет текста, по высоте строки.
export const ArrowGlyph: React.FC<{ readonly both?: boolean; readonly color?: string }> = ({ both, color = "currentColor" }) => (
  <svg
    viewBox="0 0 40 20"
    style={{ width: "0.95em", height: "0.62em", margin: "0 0.22em", verticalAlign: "0.02em", display: "inline-block" }}
  >
    <path d="M 3 10 L 35 10" stroke={color} strokeWidth={4.2} strokeLinecap="round" />
    <path d="M 26 3 L 35 10 L 26 17" fill="none" stroke={color} strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" />
    {both ? <path d="M 14 3 L 5 10 L 14 17" fill="none" stroke={color} strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" /> : null}
  </svg>
);

// Текст, в котором «→» и «↔» заменены SVG-стрелками.
export const Txt: React.FC<{ readonly children: string }> = ({ children }) => {
  const parts = children.split(/\s*(→|↔)\s*/);
  return (
    <>
      {parts.map((p, i) =>
        p === "→" ? <ArrowGlyph key={i} /> : p === "↔" ? <ArrowGlyph key={i} both /> : <span key={i}>{p}</span>,
      )}
    </>
  );
};

// Галочка.
export const Check: React.FC<{ readonly size: number; readonly color?: string; readonly draw?: number }> = ({
  size,
  color = "#FFFFFF",
  draw = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: "block" }}>
    <path
      d="M 4 10.5 L 8.5 15 L 16 5.5"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={`${clamp(draw)} 1`}
    />
  </svg>
);

// Появление: прозрачность и подъём.
const appear = (f: number, at: number, d = 12, dist = 24): React.CSSProperties => {
  const a = easeOut((f - at) / d);
  return { opacity: a, transform: `translateY(${(1 - a) * dist}px) scale(${0.96 + 0.04 * a})` };
};

// Заголовок сцены вверху кадра (в безопасной зоне): белая карточка,
// тёмно-синий крупный текст. out — кадр начала исчезновения.
export const Headline: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly out?: number;
  readonly top?: number;
  readonly size?: number;
  readonly children: React.ReactNode;
}> = ({ f, at, out, top = 280, size = 64, children }) => {
  const o = out === undefined ? 1 : 1 - clamp((f - out) / 10);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        opacity: o,
      }}
    >
      <div
        style={{
          ...appear(f, at),
          padding: "14px 34px 16px",
          borderRadius: 30,
          backgroundColor: "rgba(255,255,255,0.97)",
          boxShadow: "0 14px 34px rgba(20,40,90,0.16)",
          border: `4px solid ${C.yellow}`,
          fontFamily,
          fontSize: size,
          fontWeight: 1000,
          color: C.navy,
          lineHeight: 1.08,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Плашка-пилюля (жёлтая, тёмно-синяя или белая).
export const Pill: React.FC<{
  readonly tone?: "yellow" | "navy" | "white" | "green";
  readonly size?: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ tone = "yellow", size = 40, children, style }) => {
  const bg = { yellow: C.yellow, navy: C.navy, white: C.white, green: C.greenSoft }[tone];
  const fg = { yellow: C.navy, navy: C.white, white: C.navy, green: "#1F7A45" }[tone];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: `${size * 0.22}px ${size * 0.62}px ${size * 0.26}px`,
        borderRadius: 999,
        backgroundColor: bg,
        color: fg,
        border: tone === "white" ? `3px solid ${C.yellow}` : tone === "green" ? "3px solid #BFE3CB" : undefined,
        fontFamily,
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 20px rgba(20,40,90,0.14)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Метка «Шарттуу мисал» — условный пример (видна всё время, пока виден
// условный сюжет). Позиция задаётся снаружи.
export const ExampleTag: React.FC<{ readonly text: string; readonly size?: number; readonly style?: React.CSSProperties }> = ({
  text,
  size = 30,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: `${size * 0.25}px ${size * 0.7}px`,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.96)",
      border: `3px dashed ${C.muted}`,
      color: C.ink,
      fontFamily,
      fontSize: size,
      fontWeight: 800,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 20 20">
      <circle cx={10} cy={10} r={8.5} fill="none" stroke={C.muted} strokeWidth={2} />
      <rect x={9} y={8.5} width={2} height={6.5} rx={1} fill={C.muted} />
      <circle cx={10} cy={5.6} r={1.3} fill={C.muted} />
    </svg>
    {text}
  </div>
);

// Фигурная скобка (горизонтальная, «смотрит» вниз или вверх) длиной w.
export const Brace: React.FC<{
  readonly w: number;
  readonly dir?: "down" | "up";
  readonly color?: string;
  readonly draw?: number;
  readonly stroke?: number;
}> = ({ w, dir = "down", color = C.navy, draw = 1, stroke = 5 }) => {
  const h = 34;
  const m = w / 2;
  const d = `M 4 4 Q 4 ${h / 2} ${h / 2} ${h / 2} L ${m - h / 2} ${h / 2} Q ${m} ${h / 2} ${m} ${h - 4} Q ${m} ${h / 2} ${m + h / 2} ${h / 2} L ${w - h / 2} ${h / 2} Q ${w - 4} ${h / 2} ${w - 4} 4`;
  return (
    <svg width={w} height={h} style={{ display: "block", transform: dir === "up" ? "scaleY(-1)" : undefined, overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${clamp(draw)} 1`} />
    </svg>
  );
};
