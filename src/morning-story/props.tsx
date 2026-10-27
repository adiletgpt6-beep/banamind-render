import { COLORS } from "../config";
import { fontFamily } from "../fonts";

// Предметы истории: телефон и экраны (нейтральное вымышленное приложение
// такси — без фирменных цветов и логотипов реальных сервисов), карта,
// часы, машины.

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

// ---------- Карта (нейтральная) ----------
export const MapView: React.FC<{
  readonly width: number;
  readonly height: number;
  readonly car?: { x: number; y: number; angle?: number };
  readonly home?: { x: number; y: number };
  readonly school?: { x: number; y: number };
  readonly route?: string;
  readonly routeProgress?: number;
  readonly zoom?: number;
  readonly jam?: boolean;
  readonly carColor?: string;
}> = ({
  width,
  height,
  car,
  home,
  school,
  route,
  routeProgress = 1,
  zoom = 1,
  jam = false,
  carColor = "#5B6B82",
}) => {
  // Улицы — простая сетка, не похожая на интерфейсы реальных сервисов.
  const streets = [];
  for (let i = -6; i <= 12; i++) {
    streets.push(
      <line
        key={`h${i}`}
        x1={-400}
        y1={i * 120 + 40}
        x2={1400}
        y2={i * 120 + 40}
        stroke="#FFFFFF"
        strokeWidth={i % 3 === 0 ? 30 : 16}
      />,
    );
    streets.push(
      <line
        key={`v${i}`}
        x1={i * 140 - 20}
        y1={-400}
        x2={i * 140 - 20}
        y2={1600}
        stroke="#FFFFFF"
        strokeWidth={i % 3 === 1 ? 30 : 16}
      />,
    );
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect width={width} height={height} fill="#E9EEF3" />
      <g
        transform={`translate(${width / 2} ${height / 2}) scale(${zoom}) translate(${-width / 2} ${-height / 2})`}
      >
        <rect x={-400} y={-400} width={2000} height={2400} fill="#E9EEF3" />
        {/* парк и река */}
        <rect x={300} y={180} width={190} height={170} rx={24} fill="#D5EBD0" />
        <rect x={-200} y={560} width={260} height={200} rx={24} fill="#D5EBD0" />
        <path
          d={`M -400 900 C 0 820, 300 1000, 1400 860`}
          stroke="#CFE3F5"
          strokeWidth={60}
          fill="none"
        />
        {streets}
        {jam ? (
          <line
            x1={-400}
            y1={400}
            x2={1400}
            y2={400}
            stroke="#F2A38F"
            strokeWidth={14}
            strokeLinecap="round"
          />
        ) : null}
        {route ? (
          <path
            d={route}
            stroke={INK}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - routeProgress}
          />
        ) : null}
        {home ? <MapPin x={home.x} y={home.y} kind="home" /> : null}
        {school ? <MapPin x={school.x} y={school.y} kind="school" /> : null}
        {car ? (
          <g
            transform={`translate(${car.x} ${car.y}) rotate(${car.angle ?? 0})`}
          >
            <circle r={34} fill="#FFFFFF" opacity={0.9} />
            <rect x={-14} y={-22} width={28} height={44} rx={9} fill={carColor} />
            <rect x={-10} y={-12} width={20} height={12} rx={3} fill="#CFE3F5" />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

const MapPin: React.FC<{ x: number; y: number; kind: "home" | "school" }> = ({
  x,
  y,
  kind,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <path
      d="M 0 0 C -30 -40, -34 -64, 0 -86 C 34 -64, 30 -40, 0 0 Z"
      fill={kind === "home" ? INK : COLORS.yellow}
      stroke="#FFFFFF"
      strokeWidth={5}
    />
    {kind === "home" ? (
      <path
        d="M -14 -50 L 0 -64 L 14 -50 L 14 -36 L -14 -36 Z"
        fill="#FFFFFF"
      />
    ) : (
      <path d="M -14 -42 L 0 -66 L 14 -42 Z" fill={INK} />
    )}
  </g>
);

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
          <clipPath id={`win-${kind}`}>
            <path d="M 136 98 Q 168 60 214 56 L 258 56 L 258 98 Z M 270 56 L 316 56 Q 344 58 372 96 L 270 98 Z" />
          </clipPath>
          <g clipPath={`url(#win-${kind})`}>
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
