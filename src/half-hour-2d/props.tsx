import { useId } from "react";
import { COLORS } from "../config";
import { fontFamily } from "../fonts";

// Предметы истории: телефон и экраны (нейтральное вымышленное приложение
// такси — без фирменных цветов и логотипов реальных сервисов), часы, машины.

export const INK = "#1E2A44";

// ---------- Телефон ----------
// Экран рисуется в базовом размере 600×1230 и масштабируется под ширину w.
export const PHONE_W = 600;
export const PHONE_H = 1230;

export const Phone: React.FC<{
  readonly w: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly shake?: number;
}> = ({ w, children, style, shake = 0 }) => {
  const k = w / PHONE_W;
  const bezel = 22;
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: PHONE_H * k,
        borderRadius: 78 * k,
        backgroundColor: INK,
        boxShadow: `0 ${40 * k}px ${90 * k}px rgba(20, 40, 90, 0.28)`,
        rotate: shake ? `${shake}deg` : undefined,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: bezel * k,
          top: bezel * k,
          width: (PHONE_W - 2 * bezel) * k,
          height: (PHONE_H - 2 * bezel) * k,
          borderRadius: 58 * k,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div
          style={{
            width: PHONE_W - 2 * bezel,
            height: PHONE_H - 2 * bezel,
            transform: `scale(${k})`,
            transformOrigin: "0 0",
            position: "relative",
            fontFamily,
            color: INK,
          }}
        >
          {children}
          {/* «чёлка» */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: (PHONE_W - 2 * bezel) / 2 - 70,
              width: 140,
              height: 34,
              borderRadius: 17,
              backgroundColor: INK,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Внутренний размер экрана (для вёрстки экранов).
export const SCREEN_W = PHONE_W - 44;
export const SCREEN_H = PHONE_H - 44;

// ---------- Часы ----------
export const ClockFace: React.FC<{
  readonly size: number;
  readonly minutes: number; // минуты от 00:00 (дробные — плавный ход)
  readonly rim?: string;
  readonly face?: string;
}> = ({ size, minutes, rim = INK, face = "#FFFFFF" }) => {
  const hA = ((minutes / 60) % 12) * 30;
  const mA = (minutes % 60) * 6;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle cx={100} cy={100} r={94} fill={face} stroke={rim} strokeWidth={10} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1={100}
          y1={16}
          x2={100}
          y2={i % 3 === 0 ? 34 : 26}
          stroke={rim}
          strokeWidth={i % 3 === 0 ? 7 : 4}
          strokeLinecap="round"
          transform={`rotate(${i * 30} 100 100)`}
        />
      ))}
      <line
        x1={100}
        y1={100}
        x2={100}
        y2={56}
        stroke={rim}
        strokeWidth={10}
        strokeLinecap="round"
        transform={`rotate(${hA} 100 100)`}
      />
      <line
        x1={100}
        y1={100}
        x2={100}
        y2={30}
        stroke={COLORS.yellow}
        strokeWidth={7}
        strokeLinecap="round"
        transform={`rotate(${mA} 100 100)`}
      />
      <circle cx={100} cy={100} r={8} fill={rim} />
    </svg>
  );
};

export const hhmm = (minutes: number) => {
  const m = Math.floor(minutes);
  const h = Math.floor(m / 60) % 24;
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

// ---------- Машины (вид сбоку) ----------
// kind: "taxi" — обычное такси (серый седан, табличка «ТАКСИ» на крыше);
// "polo" — белый седан BalaGo (белый Volkswagen Polo, без «такси»-раскраски).
export const Sedan: React.FC<{
  readonly kind: "taxi" | "polo" | "car";
  readonly width: number;
  readonly color?: string;
  readonly wheel?: number; // угол колёс, °
  readonly driver?: React.ReactNode; // голова водителя в окне
  readonly passengers?: React.ReactNode;
  readonly flip?: boolean;
  readonly style?: React.CSSProperties;
}> = ({
  kind,
  width,
  color,
  wheel = 0,
  driver,
  passengers,
  flip = false,
  style,
}) => {
  const windowId = `car-window-${useId().replace(/:/g, "")}`;
  const body =
    color ?? (kind === "polo" ? "#FFFFFF" : kind === "taxi" ? "#D3D9E2" : "#8FA3BF");
  const dark = kind === "polo" ? "#DCE3EC" : "#B6BFCC";
  return (
    <svg
      width={width}
      height={width * 0.42}
      viewBox="0 0 500 210"
      overflow="visible"
      style={{ overflow: "visible", ...style }}
    >
      <g transform={flip ? "translate(500 0) scale(-1 1)" : undefined}>
        {/* тень */}
        <ellipse cx={250} cy={196} rx={230} ry={12} fill="rgba(20,40,90,0.18)" />
        {/* кузов седана: капот справа, багажник слева */}
        <path
          d="M 18 150 Q 14 112 40 104 L 120 96 Q 160 52 214 46 L 318 46 Q 352 48 388 92 L 456 104 Q 486 110 488 140 L 488 160 Q 486 172 470 172 L 30 172 Q 18 172 18 160 Z"
          fill={body}
          stroke={kind === "polo" ? "#C6D0DC" : "#9AA6B6"}
          strokeWidth={4}
        />
        {/* окна */}
        <path d="M 136 98 Q 168 60 214 56 L 258 56 L 258 98 Z" fill="#CFE3F5" />
        <path d="M 270 56 L 316 56 Q 344 58 372 96 L 270 98 Z" fill="#CFE3F5" />
        <g>
          {/* люди в окнах — обрезаются окнами */}
          <clipPath id={windowId}>
            <path d="M 136 98 Q 168 60 214 56 L 258 56 L 258 98 Z M 270 56 L 316 56 Q 344 58 372 96 L 270 98 Z" />
          </clipPath>
          <g clipPath={`url(#${windowId})`}>
            {passengers}
            {driver}
          </g>
        </g>
        <rect x={262} y={54} width={8} height={46} fill={dark} />
        {/* двери, ручки, фары */}
        <path d="M 262 100 L 262 168" stroke={dark} strokeWidth={4} />
        <path d="M 150 100 L 150 168" stroke={dark} strokeWidth={4} />
        <rect x={286} y={114} width={26} height={7} rx={3} fill={dark} />
        <rect x={176} y={114} width={26} height={7} rx={3} fill={dark} />
        <path d="M 458 112 Q 482 116 484 132 L 462 130 Z" fill="#FFE9A8" />
        <path d="M 22 118 L 40 112 L 40 132 L 22 134 Z" fill="#F08A7A" />
        {kind === "taxi" ? (
          <g>
            <rect x={232} y={22} width={92} height={26} rx={7} fill="#F2F2F2" stroke="#9AA6B6" strokeWidth={3} />
            <text
              x={278}
              y={42}
              textAnchor="middle"
              fontSize={19}
              fontWeight={900}
              fill={INK}
              fontFamily={fontFamily}
            >
              ТАКСИ
            </text>
          </g>
        ) : null}
        {/* колёса */}
        {[110, 390].map((x) => (
          <g key={x} transform={`translate(${x} 170) rotate(${wheel})`}>
            <circle r={36} fill="#2A2F3A" />
            <circle r={18} fill="#C8CED8" />
            <rect x={-3} y={-17} width={6} height={34} fill="#9AA3B2" />
            <rect x={-17} y={-3} width={34} height={6} fill="#9AA3B2" />
          </g>
        ))}
      </g>
    </svg>
  );
};

// Голова в окне машины (для водителя/пассажиров): круг лица + волосы.
export const WindowHead: React.FC<{
  x: number;
  y: number;
  r: number;
  skin: string;
  hair: string;
  cap?: boolean;
  tired?: boolean;
  mouth?: number;
  shirt?: string;
}> = ({ x, y, r, skin, hair, cap, tired, mouth = 0, shirt }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-r * 0.9} y={r * 0.7} width={r * 1.8} height={r * 1.6} rx={r * 0.5} fill={shirt ?? (cap ? "#7A5C45" : "#E07A5F")} />
    <circle r={r} fill={skin} />
    {cap ? (
      <path d={`M ${-r} ${-r * 0.2} Q 0 ${-r * 1.5} ${r} ${-r * 0.2} Z`} fill="#4B5563" />
    ) : (
      <path d={`M ${-r} 0 Q ${-r} ${-r * 1.2} 0 ${-r * 1.1} Q ${r} ${-r * 1.2} ${r} 0 Q ${r * 0.4} ${-r * 0.6} ${-r} 0 Z`} fill={hair} />
    )}
    <circle cx={r * 0.38} cy={0} r={r * 0.1} fill={INK} />
    {tired ? (
      <path d={`M ${r * 0.2} ${-r * 0.12} L ${r * 0.56} ${-r * 0.08}`} stroke={INK} strokeWidth={r * 0.08} />
    ) : null}
    <ellipse cx={r * 0.5} cy={r * 0.45} rx={r * 0.16} ry={Math.max(r * 0.03, r * 0.16 * mouth)} fill="#7A2E33" />
  </g>
);
