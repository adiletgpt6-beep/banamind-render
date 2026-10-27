// Общие элементы интерфейса BG-016: подпись «Баланын кыялы», дымка мечты,
// эффект перемотки, всплывающие плашки.
import { fontFamily } from "../../fonts";
import { clamp, easeOut } from "../../two-schedules-2d/rig/motion";
import { DREAM_LABEL } from "./script";
import { PAL } from "./Kitchen";

// Пружинящее появление 0…1 (небольшой перелёт).
export const pop = (x: number) => {
  const t = clamp(x);
  return t >= 1 ? 1 : 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI) * 0.12;
};

export const DreamLabel: React.FC<{ readonly opacity: number; readonly y?: number; readonly scale?: number }> = ({ opacity, y = 176, scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y,
      display: "flex",
      justifyContent: "center",
      opacity,
      transform: `scale(${scale})`,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 30px 14px 22px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 8px 28px rgba(30,47,92,0.18)",
        border: `4px solid ${PAL.yellow}`,
        fontFamily,
        fontWeight: 900,
        fontSize: 44,
        color: PAL.navy,
      }}
    >
      <svg width={54} height={36} viewBox="0 0 54 36">
        <path d="M14 34 Q2 34 2 24 Q2 14 13 14 Q15 3 27 3 Q39 3 41 14 Q52 14 52 24 Q52 34 40 34 Z" fill="#BFE3FF" stroke={PAL.navy} strokeWidth={3} />
      </svg>
      {DREAM_LABEL}
    </div>
  </div>
);

// Тёплая дымка мечты: мягкие края, лучи, искорки.
export const DreamHaze: React.FC<{ readonly f: number; readonly amount: number }> = ({ f, amount }) => (
  <div style={{ position: "absolute", inset: 0, opacity: amount, pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 70% 62% at 50% 46%, rgba(255,255,255,0) 58%, rgba(255,247,235,0.88) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(120deg, rgba(255,226,150,0.28) 0%, rgba(255,255,255,0) 38%, rgba(255,226,150,0.18) 60%, rgba(255,255,255,0) 100%)",
        mixBlendMode: "screen",
      }}
    />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 16 }).map((_, i) => {
        const x = (i * 263 + 90) % 1000 + 40;
        const y0 = (i * 397 + 300) % 1300 + 250;
        const y = y0 - ((f * (0.6 + (i % 4) * 0.25)) % 120);
        const tw = 0.5 + 0.5 * Math.sin(f / 9 + i * 1.7);
        const r = 5 + (i % 3) * 3;
        return (
          <g key={i} transform={`translate(${x} ${y})`} opacity={0.35 + tw * 0.55}>
            <path d={`M0 ${-r * 2} Q ${r * 0.3} ${-r * 0.3} ${r * 2} 0 Q ${r * 0.3} ${r * 0.3} 0 ${r * 2} Q ${-r * 0.3} ${r * 0.3} ${-r * 2} 0 Q ${-r * 0.3} ${-r * 0.3} 0 ${-r * 2} Z`} fill="#FFFFFF" />
          </g>
        );
      })}
    </svg>
  </div>
);

// Перемотка назад: полосы, сдвиг, значок ◀◀.
export const RewindFx: React.FC<{ readonly f: number; readonly amount: number }> = ({ f, amount }) => {
  if (amount <= 0.01) return null;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: amount }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const y = ((f * 53 + i * 431) % 2100) - 100;
          return <rect key={i} x={0} y={y} width={1080} height={18 + (i % 3) * 14} fill="#FFFFFF" opacity={0.28} />;
        })}
        {Array.from({ length: 64 }).map((_, i) => (
          <rect key={`s${i}`} x={0} y={i * 30} width={1080} height={3} fill="#1E2F5C" opacity={0.05} />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 250,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 24px",
          borderRadius: 18,
          background: "rgba(30,47,92,0.8)",
          color: "#FFFFFF",
          fontFamily,
          fontWeight: 900,
          fontSize: 46,
          letterSpacing: 2,
        }}
      >
        <svg width={70} height={40} viewBox="0 0 70 40">
          <path d="M34 4 L4 20 L34 36 Z M66 4 L36 20 L66 36 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
};

// Всплывающая плашка (время, подпись).
export const Chip: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly t: number; // 0…1 появление
  readonly text: string;
  readonly sub?: string;
  readonly color: string;
  readonly size?: number;
}> = ({ x, y, t, text, sub, color, size = 40 }) => {
  if (t <= 0) return null;
  const s = pop(t);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s})`,
        opacity: clamp(t * 3),
        padding: "12px 26px",
        borderRadius: 22,
        background: "#FFFFFF",
        border: `5px solid ${color}`,
        boxShadow: "0 10px 26px rgba(30,47,92,0.18)",
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        color: PAL.navy,
        whiteSpace: "nowrap",
        textAlign: "center",
        lineHeight: 1.1,
      }}
    >
      {text}
      {sub ? <div style={{ fontSize: size * 0.95, color }}>{sub}</div> : null}
    </div>
  );
};

// Деликатная подпись города.
export const CityTag: React.FC<{ readonly x: number; readonly y: number; readonly opacity: number; readonly text?: string }> = ({ x, y, opacity, text = "Бишкек" }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 16px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.85)",
      fontFamily,
      fontWeight: 800,
      fontSize: 28,
      color: PAL.navy,
    }}
  >
    <svg width={22} height={28} viewBox="0 0 22 28">
      <path d="M11 27 C 4 17 1 13 1 9 A10 10 0 0 1 21 9 C21 13 18 17 11 27 Z" fill="#E5677A" />
      <circle cx={11} cy={9} r={4} fill="#FFFFFF" />
    </svg>
    {text}
  </div>
);

export const fadeIn = (f: number, from: number, len = 10) => easeOut((f - from) / len);

// Стрелка (в шрифте Nunito нет «→»): встроенный SVG по высоте строки.
export const Arrow: React.FC<{ readonly color?: string; readonly size?: number }> = ({ color = "currentColor", size = 0.9 }) => (
  <svg width={`${size * 1.2}em`} height={`${size}em`} viewBox="0 0 24 20" style={{ display: "inline-block", verticalAlign: "-0.08em", margin: "0 0.18em" }}>
    <path d="M2 10 L19 10 M12 3 L20 10 L12 17" stroke={color} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// «ҮЙ → МЕКТЕП → ҮЙ»
export const RouteText: React.FC<{ readonly color?: string }> = ({ color }) => (
  <span style={{ whiteSpace: "nowrap" }}>
    ҮЙ
    <Arrow color={color} />
    МЕКТЕП
    <Arrow color={color} />
    ҮЙ
  </span>
);

export const Sun: React.FC<{ readonly size?: number }> = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" style={{ display: "inline-block", verticalAlign: "-0.15em", marginRight: 8 }}>
    <circle cx={17} cy={17} r={7} fill="#F2A541" />
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x={15.5} y={1} width={3} height={7} rx={1.5} fill="#F2A541" transform={`rotate(${i * 45} 17 17)`} />
    ))}
  </svg>
);
