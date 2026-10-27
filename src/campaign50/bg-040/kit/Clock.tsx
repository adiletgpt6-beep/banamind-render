// Часы — сквозной мотив ролика: большая настенная секундная стрелка идёт
// тактами (шаг с лёгким «дотягиванием»), длинная минутная стрелка
// пересекает лист в начале, «стрелочная шторка» (ClockWipe) — переход
// между сценами: стрелка обходит циферблат и открывает следующий кадр.
import { box } from "../context";
import { fontFamily } from "../../../fonts";
import { C } from "./theme";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Такт: значение растёт ступенями step каждые every кадров; переход
// ступени занимает ≈ 5 кадров с небольшим перелётом (механическая
// стрелка). from — кадр первого такта.
export const ticks = (f: number, from: number, every: number, step: number, count = Infinity) => {
  if (f < from) return 0;
  const k = Math.floor((f - from) / every);
  const n = Math.min(k, count - 1);
  const u = k >= count ? 1 : clamp01(((f - from) % every) / 5);
  // перелёт ≈ 8 % и возврат
  const e = u < 1 ? 1 - Math.pow(1 - u, 3) + 0.08 * Math.sin(Math.PI * u) : 1;
  return (n + e) * step;
};

// Секундная стрелка «тик-так»: каждые 30 кадров (1 с) шаг 6°.
export const secondsAngle = (f: number, start = 0) => ticks(f, 0, 30, 6) + start;

type BigClockProps = {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly minutes: number; // время суток в минутах (может быть дробным)
  readonly sec?: number; // угол секундной стрелки, градусы
  readonly rim?: string;
  readonly glow?: number; // 0…1 — мягкое жёлтое свечение (акцент)
  readonly numbers?: boolean;
};

// Настенные часы: белый циферблат, тёмно-синий обод, жёлтая секундная.
export const BigClock: React.FC<BigClockProps> = ({ x, y, r, minutes, sec = 0, rim = C.navy, glow = 0, numbers = true }) => {
  const h = ((minutes / 60) % 12) * 30;
  const m = (minutes % 60) * 6;
  return (
    <svg width={r * 2.6} height={r * 2.6} viewBox="-130 -130 260 260" style={box({ left: x - r * 1.3, top: y - r * 1.3, overflow: "visible" })}>
      {glow > 0 ? <circle r={122} fill={C.yellow} opacity={0.22 * glow} /> : null}
      <circle r={104} cy={5} fill="rgba(20,30,60,0.14)" />
      <circle r={100} fill={rim} />
      <circle r={88} fill="#FFFFFF" />
      <circle r={88} fill="url(#bg40-clock-face)" />
      <defs>
        <radialGradient id="bg40-clock-face" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E9EEF5" />
        </radialGradient>
      </defs>
      {Array.from({ length: 60 }).map((_, i) => (
        <line
          key={i}
          x1={0}
          y1={-82}
          x2={0}
          y2={i % 5 === 0 ? -70 : -77}
          stroke={C.navy}
          strokeWidth={i % 5 === 0 ? 4.5 : 1.6}
          strokeLinecap="round"
          transform={`rotate(${i * 6})`}
          opacity={i % 5 === 0 ? 1 : 0.55}
        />
      ))}
      {numbers
        ? [12, 3, 6, 9].map((n) => {
            const a = ((n % 12) * 30 * Math.PI) / 180;
            return (
              <text key={n} x={Math.sin(a) * 56} y={-Math.cos(a) * 56 + 7} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={20} fill={C.navy}>
                {n}
              </text>
            );
          })
        : null}
      <line x1={0} y1={10} x2={0} y2={-44} stroke={C.navy} strokeWidth={8} strokeLinecap="round" transform={`rotate(${h})`} />
      <line x1={0} y1={12} x2={0} y2={-66} stroke={C.navy} strokeWidth={5.5} strokeLinecap="round" transform={`rotate(${m})`} />
      <g transform={`rotate(${sec})`}>
        <line x1={0} y1={18} x2={0} y2={-74} stroke="#E0A800" strokeWidth={2.4} strokeLinecap="round" />
        <circle cy={-60} r={4.2} fill={C.yellow} />
      </g>
      <circle r={6.5} fill={C.yellow} stroke={C.navy} strokeWidth={2.5} />
    </svg>
  );
};

// Длинная минутная стрелка (мотив хука и переходов): тёмно-синяя,
// с жёлтым наконечником и противовесом. (px, py) — ось, angle — градусы
// (0 — вверх, по часовой), len — длина до острия.
export const LongHand: React.FC<{ readonly px: number; readonly py: number; readonly angle: number; readonly len: number; readonly w?: number; readonly shadow?: boolean }> = ({ px, py, angle, len, w = 34, shadow = true }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", pointerEvents: "none" })}>
    <defs>
      <linearGradient id="bg40-hand" x1="0" x2="1">
        <stop offset="0%" stopColor="#1C3470" />
        <stop offset="55%" stopColor={C.navy} />
        <stop offset="100%" stopColor="#0E1D45" />
      </linearGradient>
    </defs>
    <g transform={`translate(${px} ${py}) rotate(${angle})`}>
      {shadow ? (
        <g transform="translate(16 22)" opacity={0.18}>
          <path d={`M ${-w / 2} 0 L ${-w * 0.28} ${-len + w * 2.4} L 0 ${-len} L ${w * 0.28} ${-len + w * 2.4} L ${w / 2} 0 Z`} fill="#0A1430" />
        </g>
      ) : null}
      {/* противовес */}
      <rect x={-w * 0.32} y={0} width={w * 0.64} height={len * 0.16} rx={w * 0.3} fill={C.navy} />
      <circle cy={len * 0.16} r={w * 0.75} fill={C.yellow} stroke={C.navy} strokeWidth={w * 0.18} />
      {/* лезвие */}
      <path d={`M ${-w / 2} 0 L ${-w * 0.28} ${-len + w * 2.4} L 0 ${-len} L ${w * 0.28} ${-len + w * 2.4} L ${w / 2} 0 Z`} fill="url(#bg40-hand)" />
      <path d={`M ${-w * 0.28} ${-len + w * 2.4} L 0 ${-len} L ${w * 0.28} ${-len + w * 2.4} Z`} fill={C.yellow} />
      <line x1={-w * 0.1} y1={-w} x2={-w * 0.06} y2={-len + w * 3} stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={w * 0.12} strokeLinecap="round" />
      <circle r={w * 0.62} fill={C.yellow} stroke={C.navy} strokeWidth={w * 0.2} />
      <circle r={w * 0.18} fill={C.navy} />
    </g>
  </svg>
);

// Многоугольник сектора круга с центром (cx, cy): от угла a0 по часовой
// стрелке до угла a1 (градусы, 0 — 12 часов). Радиус — с запасом.
const sector = (cx: number, cy: number, a0: number, a1: number) => {
  const R = 4200;
  const pts = [`${cx}px ${cy}px`];
  const steps = Math.max(2, Math.ceil((a1 - a0) / 5));
  for (let i = 0; i <= steps; i++) {
    const t = (a0 + ((a1 - a0) * i) / steps - 90) * (Math.PI / 180);
    pts.push(`${cx + Math.cos(t) * R}px ${cy + Math.sin(t) * R}px`);
  }
  return `polygon(${pts.join(", ")})`;
};

// Стрелочная шторка: новый кадр (children) открывается сектором, который
// обходит стрелка по часовой от a0 до a1; p — 0…1. По умолчанию — полный
// оборот вокруг центра кадра от 12 часов.
export const ClockWipe: React.FC<{
  readonly p: number;
  readonly cx?: number;
  readonly cy?: number;
  readonly a0?: number;
  readonly a1?: number;
  readonly len?: number;
  readonly children: React.ReactNode;
}> = ({ p, cx = 540, cy = 960, a0 = 0, a1 = 360, len = 1180, children }) => {
  if (p >= 1) return <>{children}</>;
  if (p <= 0) return null;
  const a = a0 + (a1 - a0) * p;
  return (
    <>
      <div style={box({ inset: 0, clipPath: sector(cx, cy, a0, a) })}>{children}</div>
      <LongHand px={cx} py={cy} angle={a} len={len} w={44} />
    </>
  );
};

// Край большого циферблата вокруг оси (px, py): обод, минутные риски и
// цифры; виден только кусок, попавший в кадр (хук, финал).
export const DialRim: React.FC<{ readonly px: number; readonly py: number; readonly r: number; readonly a?: number }> = ({ px, py, r, a = 1 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", opacity: a, pointerEvents: "none" })}>
    <circle cx={px + 10} cy={py + 16} r={r + 24} fill="rgba(40,25,10,0.18)" />
    <circle cx={px} cy={py} r={r + 24} fill={C.navy} />
    <defs>
      <radialGradient id="bg40-dial-rim" cx="60%" cy="60%" r="70%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E6ECF4" />
      </radialGradient>
    </defs>
    <circle cx={px} cy={py} r={r} fill="url(#bg40-dial-rim)" />
    {Array.from({ length: 60 }).map((_, i) => (
      <line key={i} x1={px} y1={py - r + 10} x2={px} y2={py - r + (i % 5 === 0 ? 46 : 26)} stroke={C.navy} strokeWidth={i % 5 === 0 ? 9 : 3.5} strokeLinecap="round" transform={`rotate(${i * 6} ${px} ${py})`} opacity={i % 5 === 0 ? 1 : 0.55} />
    ))}
    {[1, 2, 3, 4, 5, 6].map((n) => {
      const ang = (n * 30 * Math.PI) / 180;
      return (
        <text key={n} x={px + Math.sin(ang) * (r - 86)} y={py - Math.cos(ang) * (r - 86) + 22} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={62} fill={C.navy}>
          {n}
        </text>
      );
    })}
  </svg>
);

// Подпись-чип «время» у часов (12:30 и т. п.).
export const TimeChip: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly a?: number; readonly s?: number }> = ({ x, y, text, a = 1, s = 1 }) => (
  <div
    style={box({
      left: x,
      top: y,
      padding: `${10 * s}px ${22 * s}px`,
      borderRadius: 40 * s,
      backgroundColor: C.navy,
      color: "#FFFFFF",
      fontFamily,
      fontWeight: 900,
      fontSize: 40 * s,
      letterSpacing: 1,
      opacity: a,
      scale: `${0.85 + 0.15 * a}`,
      boxShadow: "0 8px 20px rgba(20,40,90,0.25)",
      whiteSpace: "nowrap",
    })}
  >
    {text}
  </div>
);
