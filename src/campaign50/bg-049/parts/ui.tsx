// Общие элементы рисовки BG-049: бумага, плашки, иконки (контур + мягкая
// заливка), кинетический заголовок.
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeBack } from "../anim";
import { C, STROKE } from "../palette";

// ---------- Бумага ----------
export const Paper: React.FC<{ readonly tint?: string }> = ({
  tint = C.paper,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: tint,
      overflow: "hidden",
    }}
  >
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <defs>
        <pattern
          id="bg49-dots"
          width={36}
          height={36}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={18} cy={18} r={1.6} fill="#E7E0CF" />
        </pattern>
        <radialGradient id="bg49-vignette" cx="50%" cy="45%" r="75%">
          <stop offset="70%" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="100%" stopColor="#EFE7D4" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#bg49-dots)" />
      <rect width={1080} height={1920} fill="url(#bg49-vignette)" />
    </svg>
  </div>
);

// ---------- Плашка ----------
export const Chip: React.FC<{
  readonly children: React.ReactNode;
  readonly x: number; // центр по горизонтали
  readonly y: number; // верх
  readonly f: number;
  readonly at: number;
  readonly out?: number;
  readonly tone?: "navy" | "yellow" | "white" | "green" | "coral";
  readonly size?: number;
  readonly align?: "center" | "left";
}> = ({
  children,
  x,
  y,
  f,
  at,
  out,
  tone = "navy",
  size = 40,
  align = "center",
}) => {
  const k = appear(f, at, 12);
  const kOut = out === undefined ? 0 : appear(f, out, 10);
  const bg = {
    navy: C.navy,
    yellow: C.yellow,
    white: "#FFFFFF",
    green: C.greenSoft,
    coral: C.coralSoft,
  }[tone];
  const color = {
    navy: "#FFFFFF",
    yellow: C.navy,
    white: C.navy,
    green: "#17663A",
    coral: "#9A3A26",
  }[tone];
  const border =
    tone === "white"
      ? `3px solid ${C.rule}`
      : tone === "green"
        ? "3px solid #BFE3CB"
        : tone === "coral"
          ? "3px solid #F4C3B5"
          : "none";
  const sc = 0.86 + 0.14 * easeBack(clamp((f - at) / 14));
  return (
    <div
      style={{
        position: "absolute",
        left: align === "center" ? x : x,
        top: y,
        transform: `translate(${align === "center" ? "-50%" : "0"}, ${(1 - k) * 18 - kOut * 14}px) scale(${f < at ? 0.86 : sc})`,
        transformOrigin: align === "center" ? "50% 50%" : "0% 50%",
        opacity: k * (1 - kOut),
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: `${size * 0.3}px ${size * 0.72}px`,
        borderRadius: 999,
        backgroundColor: bg,
        color,
        border,
        fontFamily,
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1.12,
        whiteSpace: "nowrap",
        boxShadow:
          tone === "white"
            ? "0 10px 26px rgba(20,40,90,0.10)"
            : "0 12px 28px rgba(20,40,90,0.16)",
      }}
    >
      {children}
    </div>
  );
};

// Заголовок, буквы которого «встают» по очереди.
export const KineticTitle: React.FC<{
  readonly text: string;
  readonly y: number;
  readonly f: number;
  readonly at: number;
  readonly size?: number;
  readonly color?: string;
  readonly spacing?: number;
}> = ({ text, y, f, at, size = 84, color = C.navy, spacing = 6 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y,
      display: "flex",
      justifyContent: "center",
      fontFamily,
      fontSize: size,
      fontWeight: 900,
      letterSpacing: spacing,
      color,
      whiteSpace: "pre",
    }}
  >
    {[...text].map((ch, i) => {
      const k = clamp((f - at - i * 2) / 10);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: k,
            transform: `translateY(${(1 - easeBack(k)) * 40}px)`,
          }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);

// ---------- Иконки (контур тёмно-синий, заливка мягкая) ----------
const st = {
  stroke: C.navy,
  strokeWidth: STROKE,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

export const HouseIcon: React.FC<{
  readonly size?: number;
  readonly fill?: string;
}> = ({ size = 64, fill = C.yellowSoft }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path d="M 8 30 L 32 9 L 56 30" fill="none" {...st} />
    <path d="M 14 26 L 14 56 L 50 56 L 50 26" fill={fill} {...st} />
    <path d="M 27 56 L 27 40 L 37 40 L 37 56" fill="#FFFFFF" {...st} />
  </svg>
);

export const SchoolIcon: React.FC<{
  readonly size?: number;
  readonly fill?: string;
}> = ({ size = 64, fill = C.sky }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path d="M 6 26 L 32 12 L 58 26" fill="none" {...st} />
    <path d="M 10 26 L 10 56 L 54 56 L 54 26" fill={fill} {...st} />
    <path d="M 27 56 L 27 42 L 37 42 L 37 56" fill="#FFFFFF" {...st} />
    <path d="M 16 34 h 7 M 41 34 h 7" {...st} />
    <path
      d="M 32 12 L 32 3 L 42 6 L 32 9"
      fill={C.yellow}
      {...st}
      strokeWidth={3}
    />
  </svg>
);

export const ClockIcon: React.FC<{ readonly size?: number }> = ({
  size = 64,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={32} cy={33} r={23} fill={C.yellowSoft} {...st} />
    <path d="M 32 20 L 32 33 L 42 39" fill="none" {...st} />
  </svg>
);

export const CheckIcon: React.FC<{
  readonly size?: number;
  readonly k?: number;
  readonly color?: string;
}> = ({ size = 48, k = 1, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={21} fill={color} opacity={clamp(k * 2)} />
    <path
      d="M 13 25 L 21 33 L 36 16"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={40}
      strokeDashoffset={40 * (1 - clamp(k))}
    />
  </svg>
);

export const WhatsAppIcon: React.FC<{ readonly size?: number }> = ({
  size = 56,
}) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <path
      d="M 28 5 C 15 5 5 15 5 27.5 C 5 32 6.3 36.2 8.6 39.7 L 6 50 L 16.6 47.4 C 20 49.5 24 50.6 28 50.6 C 40.7 50.6 51 40.5 51 27.8 C 51 15.2 40.7 5 28 5 Z"
      fill={C.waGreen}
    />
    <path
      d="M 20 17 C 18.6 17 17.2 18.4 17 20.2 C 16.6 24 19.4 29.4 23.4 33.2 C 27.4 37 32.4 39.6 36 39 C 37.7 38.7 39 37.2 39.2 35.6 L 39.3 34 L 34 31.5 L 31.4 34.2 C 28.4 33 24.8 29.6 23.4 26.4 L 26 23.6 L 23.8 18 Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const ProfileIcon: React.FC<{ readonly size?: number }> = ({
  size = 56,
}) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <circle
      cx={28}
      cy={28}
      r={24}
      fill={C.yellowSoft}
      {...st}
      strokeWidth={3.5}
    />
    <circle cx={28} cy={22} r={8} fill="#FFFFFF" {...st} strokeWidth={3.5} />
    <path
      d="M 14 42 C 16 33 40 33 42 42"
      fill="#FFFFFF"
      {...st}
      strokeWidth={3.5}
    />
  </svg>
);

export const LinkIcon: React.FC<{ readonly size?: number }> = ({
  size = 48,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M 20 28 L 28 20" {...st} />
    <path
      d="M 22 14 L 26 10 C 30 6 36 6 39 9 C 42 12 42 18 38 22 L 34 26"
      fill="none"
      {...st}
    />
    <path
      d="M 26 34 L 22 38 C 18 42 12 42 9 39 C 6 36 6 30 10 26 L 14 22"
      fill="none"
      {...st}
    />
  </svg>
);

export const SearchGlyph: React.FC<{ readonly size?: number }> = ({
  size = 40,
}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle
      cx={17}
      cy={17}
      r={11}
      fill="none"
      stroke={C.muted}
      strokeWidth={4}
    />
    <path
      d="M 25 25 L 34 34"
      stroke={C.muted}
      strokeWidth={4}
      strokeLinecap="round"
    />
  </svg>
);

// Ребёнок-пассажир (голова и плечи) с диагональным ремнём безопасности.
export const Kid: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly girl?: boolean;
  readonly wave?: number;
}> = ({ x, y, s = 1, girl = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M -46 70 C -44 38 -24 26 0 26 C 24 26 44 38 46 70 Z"
      fill={girl ? "#F28DB2" : "#4F8FDD"}
      {...st}
      strokeWidth={3.5}
    />
    {/* ремень безопасности: через плечо и грудь */}
    <path
      d="M -36 28 L 34 46"
      stroke="#1B2A55"
      strokeWidth={13}
      strokeLinecap="round"
    />
    <path
      d="M -36 28 L 34 46"
      stroke="#9AA6BF"
      strokeWidth={4}
      strokeLinecap="round"
    />
    <circle cx={0} cy={-6} r={27} fill={C.skin} {...st} strokeWidth={3.5} />
    <path
      d={
        girl
          ? "M -28 -6 C -30 -36 28 -40 28 -8 C 18 -22 -6 -26 -28 -6 Z"
          : "M -27 -10 C -26 -36 26 -38 27 -12 C 14 -24 -10 -24 -27 -10 Z"
      }
      fill={C.hair}
      {...st}
      strokeWidth={3}
    />
    {girl ? (
      <circle
        cx={24}
        cy={-24}
        r={7}
        fill={C.yellow}
        stroke={C.navy}
        strokeWidth={2}
      />
    ) : null}
    <circle cx={-9} cy={-4} r={3.2} fill={C.navy} />
    <circle cx={9} cy={-4} r={3.2} fill={C.navy} />
    <path
      d="M -8 8 Q 0 14 8 8"
      fill="none"
      stroke="#8E3E3E"
      strokeWidth={3}
      strokeLinecap="round"
    />
  </g>
);
