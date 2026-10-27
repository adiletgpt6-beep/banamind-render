// Графика BG-009 (на основе графики BG-032): палитра BalaGo, белая машина
// BalaGo, үй, мектеп, горы Ала-Тоо, тополя, значки; плюс школьная метка дня,
// двери недели, часы, телефон.
// Машина — условная белая легковая с жёлтой полосой BalaGo, без марки.
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
// (до начала появления — 0: элемент не виден)
export const popScale = (u: number) =>
  u <= 0
    ? 0
    : interpolate(u, [0, 0.6, 0.85, 1], [0.6, 1.08, 0.98, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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

// ---------- BG-009: общие элементы недели ----------
export const box = (s: { left: number; top: number; width?: number; height?: number }): React.CSSProperties => ({ position: "absolute", ...s });

// Маленькая школа (иконка-метка дня).
export const SchoolIcon: React.FC<{ readonly size?: number; readonly color?: string }> = ({ size = 40, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M 3 21 L 3 10 L 12 4.5 L 21 10 L 21 21 Z" fill="#FFFFFF" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <path d="M 12 4.5 L 12 1.8 L 15.5 2.6 L 12 3.4" fill={YELLOW} stroke={color} strokeWidth={1} />
    <rect x={9.5} y={14.5} width={5} height={6.5} rx={0.8} fill={YELLOW} stroke={color} strokeWidth={1.4} />
    <rect x={5} y={11.5} width={3} height={3} rx={0.5} fill="#9CC0EA" stroke={color} strokeWidth={1} />
    <rect x={16} y={11.5} width={3} height={3} rx={0.5} fill="#9CC0EA" stroke={color} strokeWidth={1} />
    <circle cx={12} cy={10} r={1.8} fill={YELLOW_SOFT} stroke={color} strokeWidth={1} />
  </svg>
);

// Циферблат (стрелки по времени hh:mm, можно «крутить» быстрее).
export const Clock: React.FC<{ readonly size: number; readonly h: number; readonly m: number; readonly color?: string }> = ({ size, h, m, color = NAVY }) => {
  const ma = (m / 60) * 360;
  const ha = ((h % 12) / 12) * 360 + (m / 60) * 30;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      <circle cx={50} cy={50} r={46} fill="#FFFFFF" stroke={color} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={48.5} y={9} width={3} height={i % 3 === 0 ? 10 : 6} rx={1.5} fill={color} transform={`rotate(${i * 30} 50 50)`} />
      ))}
      <rect x={47} y={24} width={6} height={30} rx={3} fill={color} transform={`rotate(${ha} 50 50)`} />
      <rect x={48.25} y={14} width={3.5} height={40} rx={1.75} fill={color} transform={`rotate(${ma} 50 50)`} />
      <circle cx={50} cy={50} r={5} fill={YELLOW} stroke={color} strokeWidth={2} />
    </svg>
  );
};

// Школьная метка дня: «07:40 • Мектеп» и вопрос.
export const SchoolChip: React.FC<{ readonly color: string; readonly scale?: number; readonly question?: string; readonly glow?: number }> = ({ color, scale = 1, question, glow = 0 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14 * scale,
      padding: `${10 * scale}px ${22 * scale}px ${10 * scale}px ${12 * scale}px`,
      borderRadius: 999,
      backgroundColor: "#FFFFFF",
      border: `${4 * scale}px solid ${color}`,
      boxShadow: `0 ${8 * scale}px ${22 * scale}px rgba(20,40,75,0.18)${glow ? `, 0 0 0 ${10 * glow * scale}px rgba(255,201,40,${0.55 * glow})` : ""}`,
      whiteSpace: "nowrap",
    }}
  >
    <div style={{ width: 62 * scale, height: 62 * scale, borderRadius: 31 * scale, backgroundColor: YELLOW_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <SchoolIcon size={44 * scale} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
      <div style={{ fontSize: 38 * scale, fontWeight: 1000, color: NAVY }}>07:40 • Мектеп</div>
      {question ? <div style={{ fontSize: 30 * scale, fontWeight: 900, color }}>{question}</div> : null}
    </div>
  </div>
);
