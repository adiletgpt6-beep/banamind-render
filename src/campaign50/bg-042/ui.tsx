// Графика «телевыпуска» BG-042: логотип канала, плашка «Ойдон чыгарылган
// тамаша», бегущий баннер срочной новости, нижняя плашка (lower third),
// метка «Шарттуу мисал», переходная «шторка» и иконки. Всё светлое, в
// фирменных цветах; без мигания и слепящих вспышек.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { BG42_TEXT } from "./script";
import { C, clamp, pop, ramp } from "./theme";

// ---------- иконки (SVG, размер size) ----------
type IconProps = { readonly size?: number; readonly color?: string; readonly accent?: string };

export const TvIcon: React.FC<IconProps> = ({ size = 40, color = C.navy, accent = C.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M14 4 L20 10 L26 4" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x={3} y={10} width={34} height={25} rx={6} fill={color} />
    <rect x={7} y={14} width={22} height={17} rx={3} fill={accent} />
    <circle cx={33} cy={18} r={1.8} fill={accent} />
    <circle cx={33} cy={25} r={1.8} fill={accent} />
  </svg>
);

export const PinIcon: React.FC<IconProps> = ({ size = 40, color = C.navy, accent = C.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M20 37 C12 27 7 21 7 15 A13 13 0 0 1 33 15 C33 21 28 27 20 37 Z" fill={color} />
    <circle cx={20} cy={15} r={5.5} fill={accent} />
  </svg>
);

export const HouseIcon: React.FC<IconProps> = ({ size = 40, color = C.navy, accent = C.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M5 19 L20 6 L35 19" stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 17 L9 35 L31 35 L31 17 L20 8 Z" fill={color} />
    <rect x={16} y={23} width={8} height={12} rx={1.5} fill={accent} />
  </svg>
);

export const SchoolIcon: React.FC<IconProps> = ({ size = 40, color = C.navy, accent = C.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M3 16 L20 7 L37 16 Z" fill={color} />
    <rect x={6} y={16} width={28} height={19} fill={color} />
    <rect x={16.5} y={24} width={7} height={11} fill={accent} />
    <rect x={9} y={20} width={5} height={5} fill={accent} />
    <rect x={26} y={20} width={5} height={5} fill={accent} />
    <path d="M20 7 L20 1 L27 3 L20 5" fill={accent} />
  </svg>
);

export const ClockIcon: React.FC<IconProps & { readonly minutes?: number }> = ({ size = 40, color = C.navy, accent = C.yellow, minutes = 45 }) => {
  const m = (minutes / 60) * 360;
  const h = ((minutes / 60 + 3) / 12) * 360;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx={20} cy={20} r={17} fill={color} />
      <circle cx={20} cy={20} r={13} fill={C.white} />
      <line x1={20} y1={20} x2={20 + 7 * Math.sin((h * Math.PI) / 180)} y2={20 - 7 * Math.cos((h * Math.PI) / 180)} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <line x1={20} y1={20} x2={20 + 10 * Math.sin((m * Math.PI) / 180)} y2={20 - 10 * Math.cos((m * Math.PI) / 180)} stroke={accent} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={20} cy={20} r={2} fill={color} />
    </svg>
  );
};

export const HourglassIcon: React.FC<IconProps> = ({ size = 40, color = C.navy, accent = C.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect x={8} y={3} width={24} height={4} rx={2} fill={color} />
    <rect x={8} y={33} width={24} height={4} rx={2} fill={color} />
    <path d="M11 7 L29 7 C29 15 22 17 22 20 C22 23 29 25 29 33 L11 33 C11 25 18 23 18 20 C18 17 11 15 11 7 Z" fill="none" stroke={color} strokeWidth={2.6} />
    <path d="M14 30 L26 30 C25 26 21 25 20 22 C19 25 15 26 14 30 Z" fill={accent} />
  </svg>
);

export const LinkIcon: React.FC<IconProps> = ({ size = 40, color = C.navy }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M17 23 L23 17" stroke={color} strokeWidth={3.6} strokeLinecap="round" />
    <path d="M14 19 L10 23 A6 6 0 0 0 18 31 L22 27" stroke={color} strokeWidth={3.6} fill="none" strokeLinecap="round" />
    <path d="M26 21 L30 17 A6 6 0 0 0 22 9 L18 13" stroke={color} strokeWidth={3.6} fill="none" strokeLinecap="round" />
  </svg>
);

export const WaIcon: React.FC<IconProps> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M20 4 A16 16 0 0 0 6.2 28 L4 36 L12.3 33.8 A16 16 0 1 0 20 4 Z" fill="#25D366" />
    <path
      d="M14 12.5 C13 12.5 11.5 14 11.5 16.3 C11.5 19.5 14 23 17.5 25.6 C21 28.3 24.4 28.9 26 28 C27.4 27.3 28 25.8 27.8 25 L24.8 23.4 C24.2 23.1 23.7 23.3 23.3 23.8 L22.4 25 C20.2 24.2 17.6 22 16.4 19.6 L17.5 18.4 C17.9 18 18 17.4 17.8 16.9 L16.4 13.3 C16.2 12.8 15.7 12.5 15.2 12.5 Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 40, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={18} fill={color} />
    <path d="M11 20.5 L17.5 27 L29.5 14" stroke="#FFFFFF" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ParentIcon: React.FC<IconProps> = ({ size = 40, color = C.navy, accent = C.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={16} cy={11} r={6} fill={color} />
    <path d="M5 37 C5 26 9 20 16 20 C23 20 27 26 27 37 Z" fill={color} />
    <circle cx={30} cy={20} r={4.2} fill={accent} />
    <path d="M23.5 37 C23.5 30 26 27 30 27 C34 27 36.5 30 36.5 37 Z" fill={accent} />
  </svg>
);

/** Белая легковая машина сбоку с жёлтой полосой бренда (без деталей салона). */
export const CarIcon: React.FC<{ readonly width?: number; readonly wheel?: number }> = ({ width = 120, wheel = 0 }) => {
  const h = width * 0.5;
  return (
    <svg width={width} height={h} viewBox="0 0 120 60">
      <ellipse cx={60} cy={55} rx={50} ry={4} fill="rgba(20,40,90,0.18)" />
      <path d="M8 40 C8 32 12 29 20 28 L34 26 L46 14 C49 11 52 10 56 10 L80 10 C85 10 88 12 91 15 L101 26 L108 28 C113 29 114 33 114 38 L114 44 C114 46 113 47 111 47 L11 47 C9 47 8 46 8 44 Z" fill="#FFFFFF" stroke={C.navy} strokeWidth={2.5} />
      <path d="M50 15 C52 13 54 13 56 13 L66 13 L66 26 L39 26 Z" fill={C.sky} />
      <path d="M70 13 L80 13 C83 13 85 14 87 16 L96 26 L70 26 Z" fill={C.sky} />
      <rect x={10} y={33} width={102} height={5} fill={C.yellow} />
      {[30, 92].map((x) => (
        <g key={x} transform={`rotate(${wheel} ${x} 47)`}>
          <circle cx={x} cy={47} r={9.5} fill={C.navy} />
          <circle cx={x} cy={47} r={4} fill="#D7DEEA" />
          <rect x={x - 0.9} y={39} width={1.8} height={16} fill="#D7DEEA" opacity={0.7} />
        </g>
      ))}
    </svg>
  );
};

// ---------- телевизионные элементы ----------

/** Логотип канала шуточных новостей (левый верхний угол). */
export const ChannelBug: React.FC<{ readonly f: number; readonly at?: number; readonly x?: number; readonly y?: number; readonly scale?: number }> = ({
  f,
  at = 0,
  x = 90,
  y = 262,
  scale = 1,
}) => {
  const p = pop(f, at, 16);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 20px 10px 12px",
        borderRadius: 18,
        background: C.navy,
        color: C.white,
        fontFamily,
        fontWeight: 900,
        fontSize: 30,
        letterSpacing: 1,
        boxShadow: `0 10px 26px ${C.shadow}`,
        transformOrigin: "0 50%",
        transform: `scale(${scale * (0.6 + 0.4 * p)})`,
        opacity: interpolate(p, [0, 0.35], [0, 1], clamp),
      }}
    >
      <TvIcon size={42} color={C.white} accent={C.yellow} />
      {BG42_TEXT.channel}
    </div>
  );
};

/** Чёткая плашка «Ойдон чыгарылган тамаша» — видна всё время шуточного выпуска. */
export const JokePlate: React.FC<{ readonly f: number; readonly at?: number; readonly x?: number; readonly y?: number; readonly text?: string }> = ({
  f,
  at = 0,
  x = 90,
  y = 340,
  text = BG42_TEXT.jokePlate,
}) => {
  const p = pop(f, at, 18);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        padding: "8px 20px",
        borderRadius: 999,
        background: C.yellow,
        border: `3px solid ${C.navy}`,
        color: C.navy,
        fontFamily,
        fontWeight: 900,
        fontSize: 28,
        whiteSpace: "nowrap",
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        transform: `translateX(${(1 - p) * -30}px)`,
      }}
    >
      {text}
    </div>
  );
};

/** Верхняя строка телевыпуска: логотип канала и плашка шутки рядом. */
export const NewsTopBar: React.FC<{ readonly f: number; readonly at?: number; readonly plate?: string; readonly y?: number }> = ({ f, at = 0, plate = BG42_TEXT.jokePlate, y = 262 }) => {
  const p = pop(f, at, 16);
  const q = pop(f, at + 5, 18);
  return (
    <div style={{ position: "absolute", left: 90, top: y, display: "flex", alignItems: "center", gap: 12, fontFamily }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 18px 8px 10px",
          borderRadius: 16,
          background: C.navy,
          color: C.white,
          fontWeight: 900,
          fontSize: 28,
          letterSpacing: 1,
          whiteSpace: "nowrap",
          boxShadow: `0 10px 26px ${C.shadow}`,
          opacity: interpolate(p, [0, 0.35], [0, 1], clamp),
          transform: `translateY(${(1 - p) * -16}px)`,
        }}
      >
        <TvIcon size={38} color={C.white} accent={C.yellow} />
        {BG42_TEXT.channel}
      </div>
      <div
        style={{
          padding: "7px 18px",
          borderRadius: 999,
          background: C.yellow,
          border: `3px solid ${C.navy}`,
          color: C.navy,
          fontWeight: 900,
          fontSize: 26,
          whiteSpace: "nowrap",
          opacity: interpolate(q, [0, 0.4], [0, 1], clamp),
          transform: `translateX(${(1 - q) * -24}px)`,
        }}
      >
        {plate}
      </div>
    </div>
  );
};

/** Баннер «ШАШЫЛЫШ КАБАР»: выезжает слева, жёлтая полоса пробегает один раз. */
export const BreakingBanner: React.FC<{ readonly f: number; readonly at: number; readonly y: number; readonly width?: number; readonly x?: number; readonly size?: number }> = ({
  f,
  at,
  y,
  x = 90,
  width = 840,
  size = 64,
}) => {
  const p = pop(f, at, 15, 140);
  const shine = ramp(f, at + 8, at + 30);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        overflow: "hidden",
        borderRadius: 22,
        background: C.navy,
        boxShadow: `0 18px 40px ${C.shadowDeep}`,
        transform: `translateX(${(1 - p) * -(width + 120)}px)`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${shine * 120 - 30}%, rgba(255,201,14,0.35) ${shine * 120 - 15}%, transparent ${shine * 120}%)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 26px" }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, background: C.yellow, boxShadow: `0 0 0 8px rgba(255,201,14,0.25)` }} />
        <div style={{ fontFamily, fontWeight: 1000, fontSize: size, color: C.white, letterSpacing: 2, lineHeight: 1.05, whiteSpace: "nowrap" }}>{BG42_TEXT.breaking}</div>
      </div>
      <div style={{ height: 12, background: C.yellow }} />
    </div>
  );
};

/** Нижняя плашка телевыпуска: жёлтый ярлык + тёмно-синяя строка. */
export const LowerThird: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly out?: number;
  readonly tag?: string;
  readonly text: string;
  readonly y: number;
  readonly x?: number;
  readonly maxWidth?: number;
  readonly size?: number;
}> = ({ f, at, out, tag, text, y, x = 90, maxWidth = 840, size = 40 }) => {
  const p = pop(f, at, 17);
  const o = out === undefined ? 1 : 1 - ramp(f, out, out + 10);
  const wipe = interpolate(p, [0, 1], [0, 100], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        maxWidth,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        fontFamily,
        opacity: o,
        clipPath: `inset(0 ${100 - wipe}% 0 0 round 16px)`,
      }}
    >
      {tag ? (
        <div style={{ padding: "6px 18px", background: C.yellow, color: C.navy, fontWeight: 1000, fontSize: size * 0.62, letterSpacing: 1.5, borderRadius: "14px 14px 0 0" }}>{tag}</div>
      ) : null}
      <div
        style={{
          padding: "12px 24px 14px",
          background: C.navy,
          color: C.white,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.12,
          borderRadius: tag ? "0 16px 16px 16px" : 16,
          borderLeft: `10px solid ${C.yellow}`,
          boxShadow: `0 14px 30px ${C.shadowDeep}`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Метка «Шарттуу мисал» (условный пример). */
export const ConditionalBadge: React.FC<{ readonly f: number; readonly at?: number; readonly x?: number; readonly y?: number; readonly text?: string }> = ({
  f,
  at = 0,
  x = 90,
  y = 400,
  text = BG42_TEXT.conditional,
}) => {
  const p = pop(f, at, 18);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 20px 8px 14px",
        borderRadius: 999,
        background: C.white,
        border: `3px dashed ${C.navy}`,
        color: C.navy,
        fontFamily,
        fontWeight: 900,
        fontSize: 30,
        whiteSpace: "nowrap",
        boxShadow: `0 8px 20px ${C.shadow}`,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        transform: `scale(${0.85 + 0.15 * p})`,
        transformOrigin: "0 50%",
      }}
    >
      <span style={{ fontSize: 30 }}>✦</span>
      {text}
    </div>
  );
};

/**
 * Переходная «шторка» телевыпуска: две полосы (жёлтая и тёмно-синяя)
 * проходят по диагонали; в середине (progress≈0,5) кадр полностью закрыт и
 * в центре виден логотип канала. progress: 0…1.
 */
export const Stinger: React.FC<{ readonly progress: number }> = ({ progress }) => {
  if (progress <= 0 || progress >= 1) return null;
  const e = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const span = 2600;
  const pos = (lag: number) => -span + e(Math.max(0, Math.min(1, (progress - lag) / (1 - 0.18)))) * span * 2;
  const logo = interpolate(progress, [0.32, 0.45, 0.58, 0.7], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -700, top: -400, width: span, height: 2800, transform: `translateX(${pos(0)}px) rotate(-14deg)`, background: C.yellow }} />
      <div style={{ position: "absolute", left: -600, top: -400, width: span - 300, height: 2800, transform: `translateX(${pos(0.09)}px) rotate(-14deg)`, background: C.navy }} />
      <div style={{ position: "absolute", left: -500, top: -400, width: span - 700, height: 2800, transform: `translateX(${pos(0.18)}px) rotate(-14deg)`, background: C.white }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: logo }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "22px 36px",
            borderRadius: 28,
            background: C.navy,
            color: C.white,
            fontFamily,
            fontWeight: 1000,
            fontSize: 54,
            letterSpacing: 2,
            transform: `scale(${0.9 + 0.1 * logo})`,
            boxShadow: `0 20px 50px ${C.shadowDeep}`,
          }}
        >
          <TvIcon size={66} color={C.white} accent={C.yellow} />
          {BG42_TEXT.channel}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Логотип BalaGo в круге. */
export const BrandLogo: React.FC<{ readonly size: number; readonly style?: React.CSSProperties }> = ({ size, style }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", background: C.white, boxShadow: `0 ${size * 0.08}px ${size * 0.22}px ${C.shadow}`, ...style }}>
    <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
  </div>
);

/** Надпись BalaGo (Go — жёлтым с контуром). */
export const BrandWord: React.FC<{ readonly size: number; readonly color?: string }> = ({ size, color = C.navy }) => (
  <span style={{ fontFamily, fontWeight: 1000, fontSize: size, color, letterSpacing: 0.5 }}>
    Bala<span style={{ color: C.yellow, WebkitTextStroke: `${Math.max(1, size / 34)}px ${C.navy}` }}>Go</span>
  </span>
);
