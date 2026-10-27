// Графические элементы BalaGoBG021: фирменные цвета, плашки, машина, дни
// недели, курсор, иконки. Только векторная графика (SVG/CSS).
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CarTopView } from "../../components/CarTopView";
import { COLORS } from "../../config";
import { fontFamily } from "../../fonts";

export const C = {
  ...COLORS,
  ink: "#14285A",
  muted: "#6B7A9C",
  line: "#C9D6EA",
  card: "#FFFFFF",
  green: "#1FA855",
  paleNavy: "#F3F6FB",
} as const;

export const FONT = fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Плавное появление: 0 → 1 с пружиной, начиная с кадра `at`.
export const usePop = (at: number, damping = 16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, mass: 0.7 } });
};

export const ease = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

export const Card: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ x, y, w, h, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 44,
      background: C.card,
      boxShadow: "0 24px 60px rgba(20, 40, 90, 0.13), 0 2px 0 rgba(20,40,90,0.04)",
      border: `3px solid ${C.paleNavy}`,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{
  readonly children: React.ReactNode;
  readonly tone?: "yellow" | "navy" | "pale" | "green";
  readonly size?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, tone = "yellow", size = 40, style }) => {
  const bg = { yellow: C.yellow, navy: C.ink, pale: C.yellowSoft, green: "#E3F6EA" }[tone];
  const fg = { yellow: C.ink, navy: C.white, pale: C.ink, green: "#137A3C" }[tone];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: `${size * 0.32}px ${size * 0.62}px`,
        borderRadius: 999,
        background: bg,
        color: fg,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.05,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Белая машина (вид сверху), носом по направлению `angle` (0 — вправо).
export const Car: React.FC<{ readonly x: number; readonly y: number; readonly size?: number; readonly angle?: number; readonly opacity?: number }> = ({
  x,
  y,
  size = 120,
  angle = 0,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 0,
      height: 0,
      opacity,
      transform: `rotate(${angle + 90}deg)`,
    }}
  >
    <div style={{ position: "absolute", left: (-size * 0.56) / 2, top: -size / 2 }}>
      <CarTopView size={size} />
    </div>
  </div>
);

export const DAYS = ["Дүй", "Шей", "Шар", "Бей", "Жум"] as const;

export const DayPill: React.FC<{ readonly label: string; readonly on: number; readonly mark?: "check" | "ask" | "none"; readonly w?: number }> = ({
  label,
  on,
  mark = "check",
  w = 92,
}) => (
  <div
    style={{
      width: w,
      height: w * 1.18,
      borderRadius: 26,
      border: `4px ${on > 0.05 ? "solid" : "dashed"} ${on > 0.05 ? C.yellow : C.line}`,
      background: `rgba(255, 201, 14, ${0.22 * on})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      fontFamily: FONT,
      color: C.ink,
      transform: `scale(${0.92 + 0.08 * on})`,
    }}
  >
    <div style={{ fontSize: w * 0.3, fontWeight: 900 }}>{label}</div>
    <div style={{ fontSize: w * 0.34, fontWeight: 900, color: mark === "ask" ? C.muted : "#137A3C", opacity: mark === "none" ? 0 : Math.max(on, mark === "ask" ? 0.7 : 0) }}>
      {mark === "ask" ? "?" : "✓"}
    </div>
  </div>
);

export const Cursor: React.FC<{ readonly x: number; readonly y: number; readonly press?: number }> = ({ x, y, press = 0 }) => (
  <svg
    width={70}
    height={84}
    viewBox="0 0 70 84"
    style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - 0.15 * press})`, transformOrigin: "10px 6px", filter: "drop-shadow(0 8px 14px rgba(20,40,90,0.3))" }}
  >
    <path d="M8 4 L8 66 L24 52 L35 78 L47 73 L36 48 L58 48 Z" fill={C.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

export const Pin: React.FC<{ readonly x: number; readonly y: number; readonly label: string; readonly s: number; readonly tone?: "home" | "school" }> = ({
  x,
  y,
  label,
  s,
  tone = "home",
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `scale(${s})`, opacity: Math.min(1, s * 1.5) }}>
    <div
      style={{
        position: "absolute",
        left: -34,
        top: -78,
        width: 68,
        height: 68,
        borderRadius: "50% 50% 50% 0",
        transform: "rotate(-45deg)",
        background: tone === "school" ? C.ink : C.yellow,
        boxShadow: "0 8px 16px rgba(20,40,90,0.25)",
      }}
    />
    <div style={{ position: "absolute", left: -20, top: -64, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {tone === "school" ? <SchoolGlyph /> : <HomeGlyph />}
    </div>
    <div
      style={{
        position: "absolute",
        top: 4,
        left: -120,
        width: 240,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 30,
        color: C.ink,
        textShadow: "0 0 8px #fff, 0 0 8px #fff",
      }}
    >
      {label}
    </div>
  </div>
);

export const HomeGlyph: React.FC<{ readonly color?: string; readonly size?: number }> = ({ color = C.ink, size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 34 34">
    <path d="M4 16 L17 5 L30 16 L30 30 L4 30 Z" fill={color} />
    <rect x="13" y="19" width="8" height="11" fill={C.yellow} />
  </svg>
);

export const SchoolGlyph: React.FC<{ readonly size?: number }> = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 34 34">
    <path d="M3 13 L17 5 L31 13 Z" fill={C.white} />
    <rect x="6" y="14" width="22" height="16" fill={C.white} />
    <rect x="14" y="20" width="6" height="10" fill={C.ink} />
    <rect x="9" y="17" width="4" height="4" fill={C.ink} />
    <rect x="21" y="17" width="4" height="4" fill={C.ink} />
  </svg>
);

export const WhatsAppGlyph: React.FC<{ readonly size?: number }> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx="32" cy="31" r="26" fill={C.green} />
    <path d="M12 56 L17 42 L26 50 Z" fill={C.green} />
    <path
      d="M23 19 q3 -2 5 1 l3 6 q1 2 -1 4 l-2 2 q3 6 9 9 l2 -2 q2 -2 4 -1 l6 3 q3 2 1 5 q-3 5 -9 4 q-18 -4 -22 -22 q-1 -6 4 -9 Z"
      fill={C.white}
    />
  </svg>
);

export const LinkGlyph: React.FC<{ readonly size?: number }> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill={C.ink} />
    <path d="M32 46 L32 20 M21 30 L32 18 L43 30" stroke={C.yellow} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Простой нейтральный портрет водителя (стилизованный, без реального лица).
export const DriverAvatar: React.FC<{ readonly size?: number }> = ({ size = 150 }) => (
  <svg width={size} height={size} viewBox="0 0 150 150">
    <circle cx="75" cy="75" r="74" fill={C.yellowSoft} />
    <path d="M28 150 Q32 104 75 102 Q118 104 122 150 Z" fill={C.ink} />
    <path d="M62 100 L75 118 L88 100 Z" fill={C.white} />
    <rect x="66" y="84" width="18" height="20" rx="6" fill="#D9A27A" />
    <ellipse cx="75" cy="64" rx="27" ry="31" fill="#E2AE86" />
    <path d="M47 60 Q48 30 76 31 Q104 31 103 60 Q96 44 76 44 Q56 44 47 60 Z" fill="#2B2420" />
    <circle cx="65" cy="66" r="3.4" fill="#2B2420" />
    <circle cx="85" cy="66" r="3.4" fill="#2B2420" />
    <path d="M66 80 Q75 86 84 80" stroke="#8C4A33" strokeWidth={3.2} fill="none" strokeLinecap="round" />
  </svg>
);

// Пассажир-ребёнок на сиденье, пристёгнутый ремнём (вид сбоку, условно).
export const SeatedChild: React.FC<{ readonly x: number; readonly y: number; readonly hue: string; readonly belt: number }> = ({ x, y, hue, belt }) => (
  <svg width={130} height={170} viewBox="0 0 130 170" style={{ position: "absolute", left: x, top: y }}>
    {/* сиденье */}
    <rect x="22" y="22" width="34" height="112" rx="14" fill="#B9C6DC" />
    <rect x="22" y="112" width="96" height="32" rx="12" fill="#B9C6DC" />
    {/* ребёнок */}
    <circle cx="66" cy="40" r="20" fill="#E2AE86" />
    <path d="M46 34 Q48 16 66 17 Q86 18 86 36 Q78 26 64 27 Q52 28 46 34 Z" fill="#2B2420" />
    <rect x="48" y="60" width="38" height="56" rx="16" fill={hue} />
    <rect x="66" y="104" width="50" height="18" rx="9" fill={C.ink} />
    {/* ремень: плечевой и поясной */}
    <path d={`M52 62 L${52 + 32 * belt} ${62 + 50 * belt}`} stroke="#3B3B3B" strokeWidth={7} strokeLinecap="round" opacity={belt > 0.02 ? 1 : 0} />
    <path d={`M46 112 L${46 + 42 * belt} 112`} stroke="#3B3B3B" strokeWidth={7} strokeLinecap="round" opacity={belt > 0.02 ? 1 : 0} />
    <circle cx="86" cy="112" r="6" fill={C.yellow} opacity={belt > 0.95 ? 1 : 0} />
  </svg>
);
