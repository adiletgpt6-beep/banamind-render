// Графика BG-004: палитра BalaGo, белая машина BalaGo (вид сверху и сбоку),
// үй, мектеп, горы Ала-Тоо, значки таблицы (часы, песочные часы, портфель,
// календарь) и курсор родителя. Машина — условная белая легковая с жёлтой
// полосой BalaGo, без марки.
import { Easing, interpolate } from "remotion";

export const NAVY = "#14284B";
export const NAVY_SOFT = "#4A5D80";
export const YELLOW = "#FFC928";
export const YELLOW_SOFT = "#FFF3C4";
export const BG = "#F6F8FC";
export const ROAD = "#D9E0EA";
export const GREEN = "#7CC48B";
export const WA_GREEN = "#25A55A";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => ease(clamp01(x));
// 0→1 за dur секунд начиная с at (t — секунды)
export const prog = (t: number, at: number, dur: number) => clamp01((t - at) / dur);
// мягкий «выстрел» масштаба при появлении
export const popScale = (u: number) =>
  interpolate(u, [0, 0.6, 0.85, 1], [0.6, 1.08, 0.98, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ---------- Белая машина BalaGo, вид сверху (носом вправо) ----------
export const CarTop: React.FC<{ readonly x: number; readonly y: number; readonly angle: number; readonly scale?: number }> = ({
  x,
  y,
  angle,
  scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <ellipse cx={2} cy={4} rx={36} ry={19} fill="rgba(20,40,75,0.18)" />
    <rect x={-34} y={-17} width={68} height={34} rx={12} fill="#FFFFFF" stroke={NAVY} strokeWidth={2.6} />
    {/* жёлтая полоса BalaGo вдоль борта */}
    <rect x={-30} y={-17} width={60} height={5} rx={2} fill={YELLOW} />
    <rect x={-30} y={12} width={60} height={5} rx={2} fill={YELLOW} />
    {/* лобовое и заднее стёкла, крыша */}
    <path d="M 10 -12 Q 20 0 10 12 L 4 10 Q 10 0 4 -10 Z" fill="#3D5A8A" />
    <path d="M -20 -11 Q -26 0 -20 11 L -16 9 Q -20 0 -16 -9 Z" fill="#3D5A8A" />
    <rect x={-14} y={-9} width={16} height={18} rx={4} fill="#EEF2F8" />
    <circle cx={-6} cy={0} r={5} fill={YELLOW} stroke={NAVY} strokeWidth={1.4} />
    {/* фары */}
    <rect x={30} y={-13} width={4} height={6} rx={2} fill="#FFE58A" />
    <rect x={30} y={7} width={4} height={6} rx={2} fill="#FFE58A" />
  </g>
);

// ---------- Белая машина BalaGo, вид сбоку (носом вправо) ----------
export const CarSide: React.FC<{ readonly width?: number; readonly wheelTurn?: number; readonly flip?: boolean; readonly bounce?: number }> = ({
  width = 300,
  wheelTurn = 0,
  flip = false,
  bounce = 0,
}) => {
  const h = width * 0.44;
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} 108)`}>
      <circle r={20} fill="#1E2B42" />
      <circle r={10} fill="#C9D2E0" />
      <g transform={`rotate(${wheelTurn})`}>
        <rect x={-1.6} y={-10} width={3.2} height={20} fill="#7F8BA0" />
        <rect x={-10} y={-1.6} width={20} height={3.2} fill="#7F8BA0" />
      </g>
    </g>
  );
  return (
    <svg width={width} height={h} viewBox="0 0 300 132" style={{ overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}>
      <ellipse cx={150} cy={126} rx={132} ry={7} fill="rgba(20,40,75,0.16)" />
      <g transform={`translate(0 ${bounce})`}>
        {/* кузов */}
        <path
          d="M 18 104 Q 10 104 10 92 L 12 74 Q 14 62 28 60 L 74 56 L 108 26 Q 116 18 130 18 L 196 18 Q 210 18 220 28 L 250 58 L 278 64 Q 292 68 292 82 L 292 96 Q 292 104 282 104 Z"
          fill="#FFFFFF"
          stroke={NAVY}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* окна */}
        <path d="M 86 58 L 114 32 Q 120 27 130 27 L 156 27 L 156 58 Z" fill="#9CC0EA" stroke={NAVY} strokeWidth={3} />
        <path d="M 166 27 L 194 27 Q 204 27 212 35 L 236 58 L 166 58 Z" fill="#9CC0EA" stroke={NAVY} strokeWidth={3} />
        {/* жёлтая полоса и надпись BalaGo */}
        <rect x={14} y={70} width={276} height={20} fill={YELLOW} />
        <text
          x={150}
          y={86}
          textAnchor="middle"
          fontSize={17}
          fontWeight={900}
          fill={NAVY}
          fontFamily="Nunito"
          transform={flip ? "translate(300 0) scale(-1 1)" : undefined}
        >
          BalaGo
        </text>
        <rect x={276} y={66} width={12} height={8} rx={3} fill="#FFE58A" stroke={NAVY} strokeWidth={2} />
        <rect x={12} y={66} width={8} height={8} rx={2} fill="#FF8A80" stroke={NAVY} strokeWidth={2} />
        <path d="M 160 60 L 160 102" stroke="#C9D2E0" strokeWidth={3} />
      </g>
      {wheel(72)}
      {wheel(232)}
    </svg>
  );
};

// ---------- Үй (дом), центр основания в (0,0) ----------
export const House: React.FC<{ readonly glow?: number }> = ({ glow = 0 }) => (
  <g>
    {glow > 0 ? <circle cx={0} cy={-34} r={58} fill={YELLOW} opacity={0.35 * glow} /> : null}
    <rect x={-34} y={-46} width={68} height={46} rx={4} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
    <path d="M -42 -44 L 0 -78 L 42 -44 Z" fill="#E86F5A" stroke={NAVY} strokeWidth={3} strokeLinejoin="round" />
    <rect x={-8} y={-26} width={16} height={26} rx={2} fill={YELLOW} stroke={NAVY} strokeWidth={2.4} />
    <rect x={-27} y={-36} width={13} height={12} rx={2} fill="#9CC0EA" stroke={NAVY} strokeWidth={2} />
    <rect x={14} y={-36} width={13} height={12} rx={2} fill="#9CC0EA" stroke={NAVY} strokeWidth={2} />
  </g>
);

// ---------- Мектеп (школа), центр основания в (0,0) ----------
export const School: React.FC<{ readonly glow?: number }> = ({ glow = 0 }) => (
  <g>
    {glow > 0 ? <circle cx={0} cy={-50} r={80} fill={YELLOW} opacity={0.3 * glow} /> : null}
    <rect x={-56} y={-74} width={112} height={74} rx={4} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
    <rect x={-22} y={-100} width={44} height={30} rx={3} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
    <path d="M -28 -98 L 0 -118 L 28 -98 Z" fill="#5B8DEF" stroke={NAVY} strokeWidth={3} strokeLinejoin="round" />
    <circle cx={0} cy={-86} r={8} fill={YELLOW_SOFT} stroke={NAVY} strokeWidth={2} />
    <path d="M 0 -86 L 0 -90 M 0 -86 L 3 -84" stroke={NAVY} strokeWidth={1.6} />
    {/* флагшток */}
    <path d="M 44 -74 L 44 -124" stroke={NAVY} strokeWidth={2.6} />
    <path d="M 44 -124 L 66 -118 L 44 -110 Z" fill="#E8463A" />
    {[-42, -20, 8, 30].map((wx) => (
      <rect key={wx} x={wx} y={-62} width={12} height={14} rx={2} fill="#9CC0EA" stroke={NAVY} strokeWidth={1.8} />
    ))}
    <rect x={-10} y={-30} width={20} height={30} rx={2} fill={YELLOW} stroke={NAVY} strokeWidth={2.4} />
    <rect x={-48} y={-34} width={26} height={14} rx={2} fill="#9CC0EA" stroke={NAVY} strokeWidth={1.8} />
    <rect x={22} y={-34} width={26} height={14} rx={2} fill="#9CC0EA" stroke={NAVY} strokeWidth={1.8} />
  </g>
);

// ---------- Горы Ала-Тоо со снежными шапками ----------
export const Mountains: React.FC<{ readonly width: number; readonly y: number; readonly shift?: number; readonly tone?: number }> = ({
  width,
  y,
  shift = 0,
  tone = 0,
}) => {
  const far = tone ? "#C9D6EA" : "#D5E0F0";
  const near = tone ? "#AFC2DE" : "#BCCDE6";
  return (
    <g transform={`translate(${shift} ${y})`}>
      <path
        d={`M -60 120 L 40 30 L 120 80 L 230 -10 L 330 70 L 420 10 L 540 90 L 640 -20 L 760 60 L 860 0 L 980 80 L ${width + 80} 20 L ${width + 80} 120 Z`}
        fill={far}
      />
      <path d="M 230 -10 L 262 18 L 244 14 L 230 26 L 214 12 L 200 16 Z" fill="#FFFFFF" />
      <path d="M 640 -20 L 676 12 L 656 8 L 640 20 L 622 6 L 606 10 Z" fill="#FFFFFF" />
      <path d="M 860 0 L 890 24 L 872 20 L 860 30 L 846 18 L 832 22 Z" fill="#FFFFFF" />
      <path d="M 420 10 L 444 30 L 430 28 L 420 36 L 408 26 L 398 28 Z" fill="#FFFFFF" />
      <path
        d={`M -60 140 L 90 70 L 190 120 L 330 60 L 470 130 L 600 70 L 740 125 L 880 75 L ${width + 80} 130 L ${width + 80} 150 L -60 150 Z`}
        fill={near}
      />
    </g>
  );
};

// ---------- Тополь (типичные деревья бишкекских улиц) ----------
export const Poplar: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-2.5} y={-14} width={5} height={14} fill="#8A6A4F" />
    <ellipse cx={0} cy={-38} rx={11} ry={30} fill={GREEN} />
    <ellipse cx={-3} cy={-44} rx={5} ry={16} fill="#9AD6A7" />
  </g>
);

// ---------- Пин-подпись (МЕКТЕП / ҮЙ) ----------
export const Pin: React.FC<{ readonly x: number; readonly y: number; readonly label: string; readonly dark?: boolean; readonly s?: number; readonly opacity?: number }> = ({
  x,
  y,
  label,
  dark = true,
  s = 1,
  opacity = 1,
}) => {
  const w = label.length * 17 + 30;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <rect x={-w / 2} y={-40} width={w} height={36} rx={18} fill={dark ? NAVY : YELLOW} />
      <path d="M -8 -5 L 0 6 L 8 -5 Z" fill={dark ? NAVY : YELLOW} />
      <text x={0} y={-15} textAnchor="middle" fontSize={22} fontWeight={900} fill={dark ? "#FFFFFF" : NAVY} fontFamily="Nunito" letterSpacing={1}>
        {label}
      </text>
    </g>
  );
};

// ---------- Значки (SVG, не зависят от шрифтов эмодзи) ----------
export const SunIcon: React.FC<{ readonly size?: number; readonly color?: string }> = ({ size = 40, color = "#F5B400" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={5} fill={color} />
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d="M 12 2.5 L 12 5" stroke={color} strokeWidth={2.2} strokeLinecap="round" transform={`rotate(${i * 45} 12 12)`} />
    ))}
  </svg>
);

export const BellIcon: React.FC<{ readonly size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M 6 17 L 6 11 Q 6 5 12 5 Q 18 5 18 11 L 18 17 Z" fill="#FF9F43" stroke={NAVY} strokeWidth={1.8} strokeLinejoin="round" />
    <path d="M 4.5 17.5 L 19.5 17.5" stroke={NAVY} strokeWidth={2} strokeLinecap="round" />
    <circle cx={12} cy={20} r={1.8} fill={NAVY} />
    <path d="M 12 3 L 12 5" stroke={NAVY} strokeWidth={2} strokeLinecap="round" />
  </svg>
);

export const CheckIcon: React.FC<{ readonly size?: number; readonly color?: string }> = ({ size = 32, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M 4 12.5 L 9.5 18 L 20 6.5" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CrossIcon: React.FC<{ readonly size?: number; readonly color?: string }> = ({ size = 32, color = "#E8463A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M 6 6 L 18 18 M 18 6 L 6 18" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
  </svg>
);

// Стрелки → и ↔ рисуются SVG (в Nunito их нет — без подмены шрифтом).
export const ArrowGlyph: React.FC<{ readonly both?: boolean; readonly size: number; readonly color?: string }> = ({ both, size, color = "currentColor" }) => (
  <svg width={size * 1.1} height={size * 0.62} viewBox="0 0 22 12" style={{ display: "inline-block", verticalAlign: "middle", margin: `0 ${size * 0.18}px`, flexShrink: 0 }}>
    <path d={both ? "M 2 6 L 20 6 M 15 1.5 L 20 6 L 15 10.5 M 7 1.5 L 2 6 L 7 10.5" : "M 2 6 L 20 6 M 15 1.5 L 20 6 L 15 10.5"} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowText: React.FC<{ readonly text: string; readonly size: number; readonly arrowColor?: string }> = ({ text, size, arrowColor }) => (
  <>
    {text.split(/(→|↔)/).map((part, i) =>
      part === "→" || part === "↔" ? <ArrowGlyph key={i} both={part === "↔"} size={size} color={arrowColor} /> : <span key={i}>{part.trim()}</span>,
    )}
  </>
);

// ---------- Значки строк таблицы ----------
export const ClockIcon: React.FC<{ readonly size?: number; readonly turn?: number; readonly color?: string }> = ({ size = 40, turn = 0, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <circle cx={12} cy={12} r={9.5} fill="#FFFFFF" stroke={color} strokeWidth={2.2} />
    <path d="M 12 12 L 12 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" transform={`rotate(${turn / 12} 12 12)`} />
    <path d="M 12 12 L 12 4.8" stroke="#E8463A" strokeWidth={1.6} strokeLinecap="round" transform={`rotate(${turn} 12 12)`} />
    <circle cx={12} cy={12} r={1.6} fill={color} />
  </svg>
);

export const HourglassIcon: React.FC<{ readonly size?: number; readonly fill?: number }> = ({ size = 40, fill = 0.5 }) => {
  const top = 8 * (1 - clamp01(fill));
  const bottom = 8 * clamp01(fill);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M 6 3 L 18 3 M 6 21 L 18 21" stroke={NAVY} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M 7 3.5 Q 7 9 12 12 Q 17 9 17 3.5 M 7 20.5 Q 7 15 12 12 Q 17 15 17 20.5" fill="none" stroke={NAVY} strokeWidth={2} />
      <path d={`M ${12 - top * 0.55} ${12 - top} L ${12 + top * 0.55} ${12 - top} L 12 12 Z`} fill={YELLOW} />
      <path d={`M ${12 - bottom * 0.6} 20.3 L ${12 + bottom * 0.6} 20.3 L 12 ${20.3 - bottom} Z`} fill={YELLOW} />
    </svg>
  );
};

export const BriefcaseIcon: React.FC<{ readonly size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <rect x={3} y={7.5} width={18} height={12.5} rx={2.4} fill="#8B6A4E" stroke={NAVY} strokeWidth={1.8} />
    <path d="M 9 7.5 L 9 5.5 Q 9 4.5 10 4.5 L 14 4.5 Q 15 4.5 15 5.5 L 15 7.5" fill="none" stroke={NAVY} strokeWidth={1.8} />
    <path d="M 3 12.5 L 21 12.5" stroke={NAVY} strokeWidth={1.6} />
    <rect x={10.5} y={11.2} width={3} height={2.8} rx={0.6} fill={YELLOW} stroke={NAVY} strokeWidth={1.2} />
  </svg>
);

export const SchoolBagIcon: React.FC<{ readonly size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M 8.5 6 Q 8.5 3 12 3 Q 15.5 3 15.5 6" fill="none" stroke={NAVY} strokeWidth={1.8} />
    <rect x={5} y={6} width={14} height={15} rx={4} fill="#5B8DEF" stroke={NAVY} strokeWidth={1.8} />
    <rect x={7.5} y={12.5} width={9} height={6} rx={1.8} fill={YELLOW} stroke={NAVY} strokeWidth={1.4} />
  </svg>
);

export const CalendarIcon: React.FC<{ readonly size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <rect x={3} y={5} width={18} height={16} rx={2.6} fill="#FFFFFF" stroke={NAVY} strokeWidth={1.9} />
    <path d="M 3 10 L 21 10" stroke={NAVY} strokeWidth={1.9} />
    <rect x={3.9} y={5.9} width={16.2} height={3.4} rx={1.4} fill="#E8463A" />
    <path d="M 8 3 L 8 7 M 16 3 L 16 7" stroke={NAVY} strokeWidth={2} strokeLinecap="round" />
    {[0, 1, 2].map((r) =>
      [0, 1, 2, 3].map((c) => <rect key={`${r}-${c}`} x={5.4 + c * 3.5} y={11.6 + r * 3} width={2.2} height={1.9} rx={0.5} fill={r === 1 ? YELLOW : "#C9D2E0"} />),
    )}
  </svg>
);

// ---------- Курсор родителя (условный персонаж) ----------
// Стрелка мыши и маленький значок-аватар: таблицу ведёт родитель.
export const ParentCursor: React.FC<{ readonly x: number; readonly y: number; readonly press?: number; readonly grab?: boolean; readonly opacity?: number }> = ({
  x,
  y,
  press = 0,
  grab = false,
  opacity = 1,
}) => (
  <div style={{ position: "absolute", left: x, top: y, opacity, pointerEvents: "none", transform: `scale(${1 - press * 0.12})`, transformOrigin: "0 0" }}>
    {press > 0 ? <div style={{ position: "absolute", left: -34, top: -34, width: 68, height: 68, borderRadius: 34, border: `5px solid ${YELLOW}`, opacity: 1 - press, transform: `scale(${0.6 + press})` }} /> : null}
    <svg width={64} height={74} viewBox="0 0 22 26" style={{ position: "absolute", left: -4, top: -3, filter: "drop-shadow(0 4px 6px rgba(20,40,75,0.3))" }}>
      {grab ? (
        <path d="M 6 10 L 6 5 Q 6 3.6 7.3 3.6 Q 8.6 3.6 8.6 5 L 8.6 9 L 8.6 3.4 Q 8.6 2 9.9 2 Q 11.2 2 11.2 3.4 L 11.2 9 L 11.2 4.2 Q 11.2 2.8 12.5 2.8 Q 13.8 2.8 13.8 4.2 L 13.8 9.6 L 13.8 6 Q 13.8 4.8 15 4.8 Q 16.2 4.8 16.2 6 L 16.2 14 Q 16.2 20 11 20 Q 7 20 5 16 L 3 12 Q 2.4 10.6 3.6 10.2 Q 4.8 9.8 6 11.4 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={1.4} strokeLinejoin="round" />
      ) : (
        <path d="M 2 1.5 L 2 19.5 L 6.6 15.4 L 9.6 22.4 L 12.8 21 L 9.8 14.2 L 16 14 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={1.5} strokeLinejoin="round" />
      )}
    </svg>
    <div
      style={{
        position: "absolute",
        left: 46,
        top: 52,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: YELLOW,
        border: `4px solid #FFFFFF`,
        boxShadow: "0 4px 10px rgba(20,40,75,0.25)",
        overflow: "hidden",
      }}
    >
      <svg width={58} height={58} viewBox="0 0 30 30">
        <circle cx={15} cy={13} r={6.4} fill="#E9B98F" />
        <path d="M 8.6 12 Q 8.6 5.4 15 5.4 Q 21.4 5.4 21.4 12 Q 18.6 8.6 15 9.2 Q 11.4 8.6 8.6 12 Z" fill="#2B2136" />
        <path d="M 4 30 Q 4 20.5 15 20.5 Q 26 20.5 26 30 Z" fill={NAVY} />
        <circle cx={12.8} cy={13.4} r={0.9} fill="#2B2136" />
        <circle cx={17.2} cy={13.4} r={0.9} fill="#2B2136" />
        <path d="M 13 16 Q 15 17.4 17 16" fill="none" stroke="#8A4B3A" strokeWidth={0.9} strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

// Бегущая полоска времени (иллюстрация, без цифр): u — заполнение 0…1.
export const TimeBar: React.FC<{ readonly width: number; readonly u: number; readonly color?: string; readonly height?: number; readonly stripes?: boolean }> = ({
  width,
  u,
  color = YELLOW,
  height = 30,
  stripes = true,
}) => (
  <div style={{ width, height, borderRadius: height / 2, backgroundColor: "#EDF1F7", overflow: "hidden", position: "relative" }}>
    <div
      style={{
        width: `${clamp01(u) * 100}%`,
        height: "100%",
        borderRadius: height / 2,
        backgroundColor: color,
        backgroundImage: stripes ? "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 8px, rgba(255,255,255,0) 8px 16px)" : undefined,
      }}
    />
  </div>
);
