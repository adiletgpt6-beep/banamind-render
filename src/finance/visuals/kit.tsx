// Графические примитивы выпуска: карточки, крупные числа, стрелки, шкалы.
import React from "react";
import { C, FONT } from "../theme";
import { Icon, type IconName } from "../ui/Icons";

export const Abs: React.FC<{ x: number; y: number; w?: number; h?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x,
  y,
  w,
  h,
  children,
  style,
}) => <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>;

/** Появление: масштаб + сдвиг + прозрачность по k (0…1). */
export const appear = (k: number, dy = 24): React.CSSProperties => ({
  opacity: Math.min(1, Math.max(0, k * 1.4)),
  transform: `translateY(${(1 - k) * dy}px) scale(${0.9 + 0.1 * k})`,
});

export const Title: React.FC<{ k: number; children: React.ReactNode; size?: number; color?: string; align?: "left" | "center" }> = ({
  k,
  children,
  size = 76,
  color = C.navy,
  align = "left",
}) => (
  <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.08, color, letterSpacing: -1, textAlign: align, ...appear(k) }}>
    {children}
  </div>
);

export const Kicker: React.FC<{ k: number; children: React.ReactNode; color?: string }> = ({ k, children, color = C.green }) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: 30,
      letterSpacing: 3,
      textTransform: "uppercase",
      color,
      ...appear(k, 12),
    }}
  >
    {children}
  </div>
);

export const Card: React.FC<{
  k: number;
  w: number;
  h?: number;
  icon?: IconName;
  iconBg?: string;
  iconColor?: string;
  label: React.ReactNode;
  value?: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "white" | "green" | "yellow" | "red" | "sky";
  dim?: number;
  style?: React.CSSProperties;
}> = ({ k, w, h, icon, iconBg, iconColor, label, value, sub, tone = "white", dim = 0, style }) => {
  const bg = { white: C.white, green: C.greenSoft, yellow: C.yellowSoft, red: C.redSoft, sky: C.skyDeep }[tone];
  return (
    <div
      style={{
        width: w,
        height: h,
        boxSizing: "border-box",
        background: bg,
        borderRadius: 28,
        padding: "22px 26px",
        boxShadow: "0 10px 30px rgba(20,37,74,0.10)",
        border: `2px solid ${C.line}`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        fontFamily: FONT,
        color: C.navy,
        filter: dim ? `saturate(${1 - dim * 0.8})` : undefined,
        ...appear(k),
        opacity: Math.min(1, Math.max(0, k * 1.4)) * (1 - dim * 0.55),
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={72} color={iconColor ?? C.white} bg={iconBg ?? C.navy} /> : null}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1 }}>{label}</div>
        {sub ? <div style={{ fontSize: 24, fontWeight: 700, color: C.navySoft, marginTop: 4, lineHeight: 1.2 }}>{sub}</div> : null}
      </div>
      {value !== undefined ? <div style={{ fontSize: 44, fontWeight: 900, whiteSpace: "nowrap" }}>{value}</div> : null}
    </div>
  );
};

/** Крупное число / слово-акцент. */
export const Big: React.FC<{ k: number; children: React.ReactNode; size?: number; color?: string }> = ({ k, children, size = 150, color = C.navy }) => (
  <div style={{ fontFamily: FONT, fontWeight: 1000, fontSize: size, lineHeight: 1, color, letterSpacing: -3, ...appear(k, 30) }}>{children}</div>
);

/** Стрелка от (x1,y1) к (x2,y2), прорисовывается по k. */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; color?: string; width?: number; bend?: number }> = ({
  x1,
  y1,
  x2,
  y2,
  k,
  color = C.navy,
  width = 8,
  bend = 0,
}) => {
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1) * (1 + Math.abs(bend));
  const ang = (Math.atan2(y2 - my, x2 - mx) * 180) / Math.PI;
  const kk = Math.max(0, Math.min(1, k));
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - kk)} />
      {kk > 0.92 ? (
        <path
          d={`M 0 0 L -26 -14 L -26 14 Z`}
          fill={color}
          transform={`translate(${x2} ${y2}) rotate(${ang})`}
          opacity={(kk - 0.92) / 0.08}
        />
      ) : null}
    </svg>
  );
};

/** Горизонтальная шкала накопления. */
export const Bar: React.FC<{ k: number; w: number; fill: number; color?: string; label?: React.ReactNode; right?: React.ReactNode; h?: number }> = ({
  k,
  w,
  fill,
  color = C.green,
  label,
  right,
  h = 46,
}) => (
  <div style={{ width: w, fontFamily: FONT, color: C.navy, ...appear(k, 10) }}>
    {label || right ? (
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 800, marginBottom: 10 }}>
        <span>{label}</span>
        <span>{right}</span>
      </div>
    ) : null}
    <div style={{ width: w, height: h, borderRadius: h / 2, background: C.white, border: `3px solid ${C.line}`, overflow: "hidden", boxSizing: "border-box" }}>
      <div style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%`, height: "100%", background: color, borderRadius: h / 2 }} />
    </div>
  </div>
);

export const Pill: React.FC<{ k: number; children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({
  k,
  children,
  bg = C.navy,
  color = C.white,
  size = 30,
}) => (
  <div
    style={{
      display: "inline-block",
      background: bg,
      color,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      borderRadius: 999,
      padding: `${size * 0.3}px ${size * 0.8}px`,
      ...appear(k, 10),
    }}
  >
    {children}
  </div>
);

export const usd = (n: number) => (n < 0 ? "−" : "") + "$" + Math.abs(Math.round(n)).toLocaleString("en-US");
