import { COLORS } from "../config";

// Иконки и иллюстрации четвёртого ролика «Утро родителей».
// Всё рисуется SVG-линиями в фирменных цветах; движение задаётся
// пропсами (углы стрелок, прогресс), а не CSS-анимацией.

const line = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Будильник: корпус, «колокольчики», ножки и стрелки.
// hour/minute/second — углы стрелок в градусах (0 = 12 часов).
export const AlarmClock: React.FC<{
  readonly size: number;
  readonly hour: number;
  readonly minute: number;
  readonly second?: number;
  readonly ringing?: number; // 0…1 — сила «звона» (дуги у колокольчиков)
  readonly bells?: boolean;
}> = ({ size, hour, minute, second, ringing = 0, bells = true }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    {bells ? (
      <g>
        {/* дуги звона */}
        <g stroke={COLORS.yellow} strokeWidth={7} {...line} opacity={ringing}>
          <path d="M22 44 A40 40 0 0 1 44 16" />
          <path d="M10 56 A56 56 0 0 1 40 4" />
          <path d="M178 44 A40 40 0 0 0 156 16" />
          <path d="M190 56 A56 56 0 0 0 160 4" />
        </g>
        <path
          d="M34 52 A28 28 0 0 1 72 26 Z"
          fill={COLORS.yellow}
          stroke={COLORS.navy}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <path
          d="M166 52 A28 28 0 0 0 128 26 Z"
          fill={COLORS.yellow}
          stroke={COLORS.navy}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <path
          d="M100 30 V22 M88 20 H112"
          stroke={COLORS.navy}
          strokeWidth={7}
          {...line}
        />
        <path
          d="M58 170 L44 190 M142 170 L156 190"
          stroke={COLORS.navy}
          strokeWidth={9}
          {...line}
        />
      </g>
    ) : null}
    <circle
      cx={100}
      cy={110}
      r={76}
      fill={COLORS.white}
      stroke={COLORS.navy}
      strokeWidth={10}
    />
    {Array.from({ length: 12 }, (_, i) => (
      <line
        key={i}
        x1={100}
        y1={44}
        x2={100}
        y2={i % 3 === 0 ? 58 : 52}
        stroke={i % 3 === 0 ? COLORS.navy : COLORS.navySoft}
        strokeWidth={i % 3 === 0 ? 6 : 4}
        strokeLinecap="round"
        transform={`rotate(${i * 30} 100 110)`}
      />
    ))}
    <line
      x1={100}
      y1={110}
      x2={100}
      y2={74}
      stroke={COLORS.navy}
      strokeWidth={9}
      strokeLinecap="round"
      transform={`rotate(${hour} 100 110)`}
    />
    <line
      x1={100}
      y1={110}
      x2={100}
      y2={56}
      stroke={COLORS.navy}
      strokeWidth={6}
      strokeLinecap="round"
      transform={`rotate(${minute} 100 110)`}
    />
    {second !== undefined ? (
      <line
        x1={100}
        y1={122}
        x2={100}
        y2={52}
        stroke={COLORS.yellow}
        strokeWidth={4}
        strokeLinecap="round"
        transform={`rotate(${second} 100 110)`}
      />
    ) : null}
    <circle
      cx={100}
      cy={110}
      r={8}
      fill={COLORS.yellow}
      stroke={COLORS.navy}
      strokeWidth={4}
    />
  </svg>
);

// Школьный рюкзак.
export const Backpack: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 120 138">
    <path
      d="M42 22 A18 18 0 0 1 78 22"
      stroke={COLORS.navy}
      strokeWidth={7}
      {...line}
    />
    <rect
      x={14}
      y={20}
      width={92}
      height={108}
      rx={30}
      fill={COLORS.yellow}
      stroke={COLORS.navy}
      strokeWidth={7}
    />
    <path d="M16 62 H104" stroke={COLORS.navy} strokeWidth={6} {...line} />
    <rect
      x={32}
      y={76}
      width={56}
      height={38}
      rx={12}
      fill={COLORS.white}
      stroke={COLORS.navy}
      strokeWidth={6}
    />
    <path d="M48 90 H72" stroke={COLORS.navy} strokeWidth={6} {...line} />
  </svg>
);

// Календарь; check (0…1) — отметка рисуется постепенно.
export const CalendarIcon: React.FC<{
  readonly size: number;
  readonly check?: number;
}> = ({ size, check = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect
      x={6}
      y={10}
      width={52}
      height={48}
      rx={9}
      fill={COLORS.white}
      stroke={COLORS.navy}
      strokeWidth={5}
    />
    <path d="M8 24 H56" stroke={COLORS.navy} strokeWidth={5} />
    <path
      d="M8 19 A9 9 0 0 1 15 12 H49 A9 9 0 0 1 56 19 V22 H8 Z"
      fill={COLORS.yellow}
    />
    <path
      d="M20 5 V15 M44 5 V15"
      stroke={COLORS.navy}
      strokeWidth={5}
      {...line}
    />
    <path
      d="M21 41 L29 49 L44 33"
      stroke={COLORS.yellow}
      strokeWidth={6}
      {...line}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - check}
    />
  </svg>
);

// Шестерёнка — «идёт подготовка»; angle — поворот в градусах.
export const Gear: React.FC<{
  readonly size: number;
  readonly angle: number;
}> = ({ size, angle }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <g transform={`rotate(${angle} 32 32)`}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={27}
          y={3}
          width={10}
          height={14}
          rx={3}
          fill={COLORS.navy}
          transform={`rotate(${i * 45} 32 32)`}
        />
      ))}
      <circle cx={32} cy={32} r={19} fill={COLORS.navy} />
      <circle cx={32} cy={32} r={8} fill={COLORS.yellow} />
    </g>
  </svg>
);

// Иконки карточек «Жумуш», «Мектеп», «Жол», «Үй» (квадрат 64×64).
export const MorningIcon: React.FC<{
  readonly kind: "work" | "school" | "road" | "home";
  readonly size: number;
  readonly color?: string;
}> = ({ kind, size, color = COLORS.navy }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <g stroke={color} strokeWidth={5} {...line}>
      {kind === "work" ? (
        <>
          <rect x={8} y={20} width={48} height={34} rx={7} />
          <path d="M24 20 V14 A4 4 0 0 1 28 10 H36 A4 4 0 0 1 40 14 V20" />
          <path d="M8 35 H56 M32 32 V38" />
        </>
      ) : kind === "school" ? (
        <>
          <path d="M6 56 H58" />
          <path d="M10 56 V30 H54 V56" />
          <path d="M22 30 V20 H42 V30" />
          <path d="M32 20 V6 L44 10 L32 14" />
          <path d="M17 38 H23 M41 38 H47 M17 47 H23 M41 47 H47" />
          <path d="M28 56 V44 H36 V56" />
        </>
      ) : kind === "road" ? (
        <>
          <path d="M22 6 L8 58 M42 6 L56 58" />
          <path d="M32 8 V16 M32 26 V36 M32 46 V58" />
        </>
      ) : (
        <>
          <path d="M8 32 L32 12 L56 32" />
          <path d="M16 28 V54 H48 V28" />
          <path d="M27 54 V40 H37 V54" />
        </>
      )}
    </g>
  </svg>
);
