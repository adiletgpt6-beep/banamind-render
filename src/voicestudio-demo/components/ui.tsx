import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, GRAD, SHADOW, levelAt } from "../theme";

/** Пружинное появление с задержкой в кадрах. */
export const useEnter = (delay = 0, damping = 14, durationInFrames?: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.7 }, durationInFrames });
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  dark?: boolean;
}> = ({ style, children, dark }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: 40,
      background: dark ? "linear-gradient(160deg, #18264F 0%, #0E1B3D 100%)" : "rgba(255,255,255,0.92)",
      border: dark ? "1px solid rgba(255,255,255,0.08)" : "1.5px solid rgba(214,221,236,0.9)",
      boxShadow: SHADOW.card,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Карточка, «влетающая» пружиной снизу с лёгким масштабом. */
export const PopCard: React.FC<{
  delay: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  dark?: boolean;
  from?: "bottom" | "left" | "right" | "scale";
}> = ({ delay, style, children, dark, from = "bottom" }) => {
  const p = useEnter(delay, 15);
  const off = (1 - p) * 90;
  const tr =
    from === "left"
      ? `translateX(${-off * 1.6}px)`
      : from === "right"
        ? `translateX(${off * 1.6}px)`
        : from === "scale"
          ? `scale(${0.6 + 0.4 * p})`
          : `translateY(${off}px) scale(${0.94 + 0.06 * p})`;
  return (
    <Card dark={dark} style={{ ...style, opacity: Math.min(1, p * 1.4), transform: tr }}>
      {children}
    </Card>
  );
};

export const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  active?: number;
  style?: React.CSSProperties;
  size?: number;
}> = ({ children, color = C.orange, active = 1, style, size = 34 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: `${size * 0.36}px ${size * 0.7}px`,
      borderRadius: 999,
      fontFamily: FONT.text,
      fontWeight: 800,
      fontSize: size,
      color: active > 0.5 ? "#FFFFFF" : C.ink,
      background: active > 0.5 ? color : "#FFFFFF",
      border: `2px solid ${active > 0.5 ? color : C.soft}`,
      boxShadow: active > 0.5 ? `0 10px 26px ${color}55` : "none",
      transform: `scale(${1 + 0.08 * Math.sin(Math.min(1, active) * Math.PI)})`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Звуковая волна. В режиме `live` высота столбиков следует за реальной
 * громкостью озвучки (огибающая из timing.json), иначе — мягкая «idle» волна.
 */
export const Waveform: React.FC<{
  width: number;
  height: number;
  bars?: number;
  live?: boolean;
  progress?: number;
  colors?: [string, string];
  seed?: number;
  intensity?: number;
  style?: React.CSSProperties;
}> = ({ width, height, bars = 36, live = true, progress = 1, colors = [C.orange2, C.violet], seed = 0, intensity = 1, style }) => {
  const frame = useCurrentFrame();
  const gap = width / bars;
  const bw = Math.max(4, gap * 0.56);
  return (
    <svg width={width} height={height} style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={`wf-${seed}`} x1="0" x2="1">
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      {Array.from({ length: bars }, (_, i) => {
        const shape = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.55 + seed) * Math.cos(i * 0.21 + seed * 0.3));
        const lvl = live ? levelAt(frame - Math.abs(i - bars / 2) * 0.6) : 0.5;
        const motion = 0.55 + 0.45 * Math.sin(frame * 0.32 + i * 0.8 + seed);
        const amp = live ? 0.18 + 0.82 * Math.min(1, lvl * 1.15) : 0.6;
        const h = Math.max(bw, height * shape * motion * amp * intensity);
        const on = i / bars <= progress;
        return (
          <rect
            key={i}
            x={i * gap + (gap - bw) / 2}
            y={(height - h) / 2}
            width={bw}
            height={h}
            rx={bw / 2}
            fill={on ? `url(#wf-${seed})` : "#D9DFEC"}
          />
        );
      })}
    </svg>
  );
};

/** Логотип VoiceStudio для ролика: волна в градиентном скруглённом квадрате. */
export const VSLogo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => {
  const frame = useCurrentFrame();
  const hs = [0.35, 0.7, 1, 0.6, 0.85, 0.45];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: "linear-gradient(140deg, #2A1A4F 0%, #121A3A 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.05,
        boxShadow: `0 ${size * 0.12}px ${size * 0.3}px rgba(122,92,255,0.35)`,
        ...style,
      }}
    >
      {hs.map((h, i) => (
        <div
          key={i}
          style={{
            width: size * 0.07,
            height: size * 0.62 * h * (0.75 + 0.25 * Math.sin(frame * 0.25 + i)),
            borderRadius: size,
            background: GRAD.brand,
          }}
        />
      ))}
    </div>
  );
};

/** Условная иконка Claude Code: оранжевая «искра» (не официальный логотип). */
export const Spark: React.FC<{ size: number; color?: string; spin?: number }> = ({ size, color = C.orange, spin = 0 }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ transform: `rotate(${spin}deg)` }}>
    {Array.from({ length: 8 }, (_, k) => (
      <rect key={k} x="-5" y="-46" width="10" height="40" rx="5" fill={color} transform={`rotate(${k * 45})`} />
    ))}
  </svg>
);

export const Check: React.FC<{ size: number; color?: string; p?: number }> = ({ size, color = C.green, p = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="19" fill={color} />
    <path
      d="M 11 21 L 17.5 27 L 29 14"
      stroke="#FFF"
      strokeWidth="4.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="30"
      strokeDashoffset={30 * (1 - p)}
    />
  </svg>
);

/** Окно приложения с «точками» в заголовке. */
export const AppWindow: React.FC<{
  title: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ title, style, children }) => (
  <Card style={{ overflow: "hidden", ...style }}>
    <div
      style={{
        height: 70,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 30px",
        borderBottom: `1.5px solid ${C.soft}`,
        background: "#FBFCFF",
      }}
    >
      {["#FF6159", "#FFBD2E", "#28C941"].map((c) => (
        <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
      ))}
      <div style={{ marginLeft: 16, fontFamily: FONT.text, fontWeight: 700, fontSize: 26, color: "#8792AE" }}>{title}</div>
    </div>
    {children}
  </Card>
);

/** Плавный «печатающийся» текст. */
export const typed = (text: string, frame: number, start: number, cps = 22) => {
  const n = Math.max(0, Math.floor(((frame - start) / 30) * cps));
  return text.slice(0, n);
};

export const Cursor: React.FC<{ color?: string; h?: number }> = ({ color = C.orange, h = 40 }) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block",
        width: 4,
        height: h,
        marginLeft: 4,
        verticalAlign: "middle",
        background: color,
        opacity: Math.floor(frame / 12) % 2 ? 0.15 : 1,
      }}
    />
  );
};

/** Анимированная линия-коннектор с бегущими точками. */
export const Connector: React.FC<{
  d: string;
  length: number;
  progress: number;
  color?: string;
  pulse?: boolean;
}> = ({ d, length, progress, color = C.blue, pulse = true }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <path d={d} stroke={C.soft} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path
        d={d}
        stroke={color}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${length}`}
        strokeDashoffset={length * (1 - progress)}
      />
      {pulse && progress >= 1 ? (
        <path
          d={d}
          stroke="#FFFFFF"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`10 ${length}`}
          strokeDashoffset={-((frame * 9) % (length + 10))}
        />
      ) : null}
    </g>
  );
};

/** Крупный номер возможности (#1/#2/#3) с «ударным» появлением. */
export const BigNumber: React.FC<{ n: number; color: string; start: number; end: number }> = ({ n, color, start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 10, mass: 0.6 } });
  const out = interpolate(frame, [end - 8, end], [0, 1], clamp);
  if (frame > end) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 520,
        textAlign: "center",
        fontFamily: FONT.display,
        fontWeight: 900,
        fontSize: 400,
        lineHeight: 1,
        color,
        opacity: Math.min(1, p) * (1 - out),
        transform: `scale(${(2.2 - 1.2 * p) * (1 - 0.5 * out)}) rotate(${(1 - p) * -8}deg)`,
        textShadow: `0 30px 80px ${color}55`,
      }}
    >
      #{n}
    </div>
  );
};

export const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; size?: number; color?: string }> = ({
  children,
  style,
  size = 30,
  color = "#8792AE",
}) => (
  <div style={{ fontFamily: FONT.text, fontWeight: 700, fontSize: size, color, ...style }}>{children}</div>
);
