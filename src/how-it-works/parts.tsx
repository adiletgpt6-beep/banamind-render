import { COLORS } from "../config";

// Общие элементы третьего ролика: номер шага, заголовок, подпись, иконки.

export const StepBadge: React.FC<{
  readonly n: number;
  readonly size?: number;
  readonly active?: boolean;
}> = ({ n, size = 110, active = true }) => (
  <div
    style={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: "50%",
      backgroundColor: active ? COLORS.yellow : COLORS.white,
      border: `${Math.round(size * 0.07)}px solid ${active ? COLORS.yellow : COLORS.block}`,
      boxSizing: "border-box",
      color: COLORS.navy,
      fontSize: size * 0.55,
      fontWeight: 900,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: active ? `0 12px 30px ${COLORS.shadow}` : "none",
    }}
  >
    {n}
  </div>
);

// Заголовок шага: «1. Баланы каттаңыз» — номер «1.» в жёлтом круге.
export const StepTitle: React.FC<{
  readonly n: number;
  readonly title: string;
  readonly fontSize?: number;
  readonly style?: React.CSSProperties;
}> = ({ n, title, fontSize = 68, style }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 24,
      fontSize,
      fontWeight: 900,
      lineHeight: 1.08,
      color: COLORS.navy,
      ...style,
    }}
  >
    <div
      style={{
        width: 112,
        height: 112,
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: COLORS.yellow,
        boxShadow: `0 12px 30px ${COLORS.shadow}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 60,
      }}
    >
      {n}.
    </div>
    <span>{title}</span>
  </div>
);

export const Caption: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 16,
      padding: "14px 32px",
      borderRadius: 999,
      backgroundColor: COLORS.navy,
      color: COLORS.white,
      fontSize: 46,
      fontWeight: 800,
      lineHeight: 1.15,
      ...style,
    }}
  >
    {children}
  </div>
);

export const LinkIcon: React.FC<{ readonly size?: number }> = ({
  size = 48,
}) => (
  <svg width={size} height={size} viewBox="0 0 52 52">
    <path
      d="M22 30 L30 22 M20 16 L25 11 A9 9 0 0 1 41 27 L36 32 M32 36 L27 41 A9 9 0 0 1 11 25 L16 20"
      fill="none"
      stroke={COLORS.yellow}
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
);

const stroke = {
  fill: "none",
  strokeWidth: 5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Иконки шагов (рисуются в квадрате 64×64).
export const StepIcon: React.FC<{
  readonly kind: "form" | "school" | "home";
  readonly size?: number;
  readonly color?: string;
}> = ({ kind, size = 96, color = COLORS.navy }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    {kind === "form" ? (
      <g stroke={color} {...stroke}>
        <rect x="14" y="10" width="36" height="46" rx="6" />
        <path d="M24 10 V6 H40 V10" />
        <path d="M22 24 H42 M22 33 H42 M22 42 H34" />
      </g>
    ) : kind === "school" ? (
      <g stroke={color} {...stroke}>
        {/* школа: широкое здание, окна, флаг */}
        <path d="M6 56 H58" />
        <path d="M10 56 V30 H54 V56" />
        <path d="M22 30 V20 H42 V30" />
        <path d="M32 20 V6 L44 10 L32 14" />
        <path d="M17 38 H23 M41 38 H47 M17 47 H23 M41 47 H47" />
        <path d="M28 56 V44 H36 V56" />
      </g>
    ) : (
      <g stroke={color} {...stroke}>
        <path d="M8 32 L32 12 L56 32" />
        <path d="M16 28 V54 H48 V28" />
        <path d="M27 54 V40 H37 V54" />
      </g>
    )}
  </svg>
);
