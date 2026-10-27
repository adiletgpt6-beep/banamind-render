import { COLORS } from "../config";

// Иконки пятого ролика (SVG, фирменные цвета).

const line = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Взрослый человек: голова и плечи. accent — цвет «одежды».
export const AdultFigure: React.FC<{
  readonly size: number;
  readonly accent?: string;
  readonly busy?: number; // 0…1 — фигура «занята» (бледнеет)
}> = ({ size, accent = COLORS.navy, busy = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g opacity={1 - 0.45 * busy}>
      <circle
        cx={50}
        cy={32}
        r={18}
        fill={COLORS.yellowSoft}
        stroke={COLORS.navy}
        strokeWidth={5}
      />
      <path
        d="M16 92 C16 66 30 56 50 56 C70 56 84 66 84 92 Z"
        fill={accent}
        stroke={COLORS.navy}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

// Маленькие часы (для «занят»).
export const MiniClock: React.FC<{
  readonly size: number;
  readonly angle: number;
}> = ({ size, angle }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle
      cx={20}
      cy={20}
      r={17}
      fill={COLORS.white}
      stroke={COLORS.navy}
      strokeWidth={4}
    />
    <path d="M20 20 V10" stroke={COLORS.navy} strokeWidth={4} {...line} />
    <path
      d="M20 20 V13"
      stroke={COLORS.yellow}
      strokeWidth={4}
      {...line}
      transform={`rotate(${angle} 20 20)`}
    />
  </svg>
);

// Руль — опыт за рулём.
export const WheelIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <g stroke={COLORS.navy} strokeWidth={5} {...line}>
      <circle cx={32} cy={32} r={24} />
      <circle cx={32} cy={32} r={6} />
      <path d="M10 28 C20 24 44 24 54 28 M32 38 V56" />
    </g>
  </svg>
);

// Открытая книга — уроки с детьми.
export const BookIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <g stroke={COLORS.navy} strokeWidth={5} {...line}>
      <path d="M32 16 C24 10 14 10 6 12 V52 C14 50 24 50 32 56 C40 50 50 50 58 52 V12 C50 10 40 10 32 16 Z" />
      <path d="M32 16 V56" />
      <path d="M14 24 H24 M14 32 H24 M40 24 H50 M40 32 H50" />
    </g>
  </svg>
);

// Значок WhatsApp: зелёный круг, «облачко» и трубка.
export const WhatsAppIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={32} fill="#25D366" />
    <path
      d="M32 13 A19 19 0 0 0 15.6 41.6 L13 51 L22.7 48.5 A19 19 0 1 0 32 13 Z"
      fill="none"
      stroke={COLORS.white}
      strokeWidth={3.6}
      strokeLinejoin="round"
    />
    <path
      d="M24.5 23.5 C25.5 22.3 27 22.4 27.6 23.6 L29.3 27.3 C29.7 28.2 29.4 29 28.7 29.6 L27.6 30.6 C28.8 33.4 30.7 35.3 33.4 36.5 L34.5 35.3 C35.1 34.6 36 34.4 36.8 34.8 L40.5 36.6 C41.6 37.2 41.7 38.6 40.6 39.6 C38.9 41.2 36.7 41.9 34.4 41.1 C28.5 39 25 35.4 23 29.6 C22.3 27.4 23 25.2 24.5 23.5 Z"
      fill={COLORS.white}
    />
  </svg>
);
