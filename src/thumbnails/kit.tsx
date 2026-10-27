// Набор для YouTube-обложек канала BanaMind (1280×720).
// Общие детали всех книг: крупные заголовки с обводкой и тенью, фирменный значок
// канала, обложка книги, банан-ведущий в нужной позе/роли, свечение и виньетка.
// Сюжет и цвета каждой обложки задаёт модуль книги (src/books/<slug>/thumbnails.tsx).
import React from "react";
import { Banana, MOODS, POSES, type Face, type MoodName, type PoseName } from "../banana-host";
import { BRAND } from "../banamind/brand";
import { FONTS } from "../banamind/fonts";

export const TW = 1280;
export const TH = 720;

export { BRAND };

export const Frame: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <div style={{ width: TW, height: TH, background: bg, position: "relative", overflow: "hidden" }}>
    <svg viewBox={`0 0 ${TW} ${TH}`} width={TW} height={TH} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.35" />
        </filter>
        <filter id="blur8">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="blur24">
          <feGaussianBlur stdDeviation="24" />
        </filter>
      </defs>
      {children}
    </svg>
  </div>
);

// Заголовок-плакат: заливка + толстая обводка (paint-order) + тень.
export const Headline: React.FC<{
  x: number;
  y: number;
  lines: string[];
  size: number;
  font?: string;
  weight?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  anchor?: "start" | "middle" | "end";
  lineGap?: number;
  letterSpacing?: number;
  rotate?: number;
  colors?: (string | undefined)[]; // цвет отдельной строки
  sizes?: (number | undefined)[]; // размер отдельной строки
}> = ({ x, y, lines, size, font = FONTS.display, weight = 400, fill = "#fff", stroke = BRAND.ink, strokeWidth = 14, anchor = "start", lineGap = 1.02, letterSpacing = 0, rotate = 0, colors = [], sizes = [] }) => {
  let yy = 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} filter="url(#shadow)">
      {lines.map((l, i) => {
        const sz = sizes[i] ?? size;
        if (i > 0) yy += sz * lineGap;
        return (
          <text
            key={i}
            x={0}
            y={yy}
            fontFamily={font}
            fontWeight={weight}
            fontSize={sz}
            textAnchor={anchor}
            fill={colors[i] ?? fill}
            stroke={stroke}
            strokeWidth={strokeWidth * (sz / size)}
            strokeLinejoin="round"
            paintOrder="stroke"
            letterSpacing={letterSpacing}
          >
            {l}
          </text>
        );
      })}
    </g>
  );
};

// Плашка с текстом (подзаголовок).
export const Pill: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; color?: string; font?: string; weight?: number; anchor?: "start" | "middle"; rotate?: number; padX?: number }> = ({
  x,
  y,
  text,
  size = 36,
  bg = BRAND.yellow,
  color = BRAND.ink,
  font = FONTS.heavy,
  weight = 800,
  anchor = "start",
  rotate = 0,
  padX,
}) => {
  const w = text.length * size * 0.56 + (padX ?? size * 0.9) * 2;
  const h = size * 1.55;
  const x0 = anchor === "middle" ? -w / 2 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} filter="url(#shadow)">
      <rect x={x0} y={-h * 0.68} width={w} height={h} rx={h / 2} fill={bg} />
      <text x={x0 + w / 2} y={size * 0.12} fontFamily={font} fontWeight={weight} fontSize={size} textAnchor="middle" fill={color}>
        {text}
      </text>
    </g>
  );
};

// Словесный знак BanaMind: «Bana» + «Mind» фирменным жёлтым (на светлом — тёмно-жёлтым).
export const Wordmark: React.FC<{ x: number; y: number; size: number; dark?: boolean; anchor?: "start" | "middle" }> = ({ x, y, size, dark = true, anchor = "start" }) => (
  <text x={x} y={y} fontFamily={FONTS.heavy} fontWeight={900} fontSize={size} textAnchor={anchor} letterSpacing={-0.5}>
    <tspan fill={dark ? "#fff" : BRAND.ink}>{BRAND.wordmark[0]}</tspan>
    <tspan fill={dark ? BRAND.yellow : "#e09a00"}>{BRAND.wordmark[1]}</tspan>
  </text>
);

// Значок канала: маленький банан + словесный знак BanaMind. Одинаков на всех обложках.
export const ChannelBadge: React.FC<{ x: number; y: number; scale?: number; dark?: boolean }> = ({ x, y, scale = 1, dark }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} filter="url(#shadow)">
    <rect x={0} y={-34} width={262} height={62} rx={31} fill={dark ? BRAND.ink : "#fff"} />
    <g transform="translate(36 22) scale(0.085)">
      <Banana pose={POSES.idle} face={MOODS.happy} mouthOpen={0} mouthRound={0} blink={0} t={0.3} talk={0} />
    </g>
    <Wordmark x={70} y={11} size={33} dark={!!dark} />
  </g>
);

// Банан-ведущий для обложки (неподвижный кадр): поза, эмоция, рот, аксессуары.
export const Host: React.FC<{
  x: number;
  y: number;
  scale: number;
  pose: PoseName;
  mood: MoodName;
  mouth?: number;
  round?: number;
  flip?: boolean;
  glasses?: boolean;
  bowtie?: boolean;
  face?: Partial<Face>;
  rotate?: number;
}> = ({ x, y, scale, pose, mood, mouth = 0, round = 0, flip, glasses, bowtie, face, rotate = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${flip ? -scale : scale} ${scale})`} filter="url(#softShadow)">
    <Banana pose={POSES[pose]} face={{ ...MOODS[mood], ...face }} mouthOpen={mouth} mouthRound={round} blink={0} t={0.31} talk={0} glasses={glasses} bowtie={bowtie} />
  </g>
);

// Обложка книги (3/4 вид): переплёт, торец страниц, золотая рамка, название.
export const BookCover: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  title: string[];
  subtitle?: string;
  titleSize?: number; // для длинных названий
  color?: string;
  accent?: string;
}> = ({ x, y, scale = 1, rotate = 0, title, subtitle, titleSize = 44, color = "#1f6f52", accent = "#e8c96a" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} filter="url(#softShadow)">
    {/* торец страниц */}
    <path d="M 150 -210 L 176 -196 L 176 224 L 150 210 Z" fill="#f4ecd8" stroke="#3b2a10" strokeWidth={4} />
    {[-160, -100, -40, 20, 80, 140, 190].map((yy) => (
      <line key={yy} x1={152} y1={yy} x2={174} y2={yy + 12} stroke="#d8cbb0" strokeWidth={2} />
    ))}
    <rect x={-150} y={-210} width={300} height={420} rx={14} fill={color} stroke="#3b2a10" strokeWidth={5} />
    <rect x={-150} y={-210} width={30} height={420} rx={10} fill="#000" opacity={0.18} />
    <rect x={-110} y={-176} width={236} height={352} rx={10} fill="none" stroke={accent} strokeWidth={5} />
    <rect x={-100} y={-166} width={216} height={332} rx={8} fill="none" stroke={accent} strokeWidth={2} opacity={0.7} />
    {/* орнамент */}
    <g transform="translate(8 -110)" fill={accent}>
      <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z" />
    </g>
    {title.map((l, i) => (
      <text key={i} x={8} y={-30 + i * titleSize * 1.14} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={titleSize} fill="#fff8e6">
        {l}
      </text>
    ))}
    {subtitle && (
      <text x={8} y={130} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={22} fill={accent}>
        {subtitle}
      </text>
    )}
    <path d="M -60 150 L 76 150" stroke={accent} strokeWidth={3} />
  </g>
);

// Мягкое световое пятно.
export const Glow: React.FC<{ x: number; y: number; r: number; color: string; opacity?: number }> = ({ x, y, r, color, opacity = 0.7 }) => (
  <circle cx={x} cy={y} r={r} fill={color} opacity={opacity} filter="url(#blur24)" />
);

// Виньетка по краям кадра.
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <g>
    <defs>
      <radialGradient id="vig" cx="50%" cy="50%" r="75%">
        <stop offset="55%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={strength} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={TW} height={TH} fill="url(#vig)" />
  </g>
);

// Лучи из точки (для акцента).
export const Rays: React.FC<{ x: number; y: number; color: string; count?: number; opacity?: number; len?: number }> = ({ x, y, color, count = 16, opacity = 0.18, len = 1400 }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    {Array.from({ length: count }).map((_, i) => {
      const a = (i / count) * Math.PI * 2;
      const b = a + Math.PI / count;
      return <path key={i} d={`M 0 0 L ${Math.cos(a) * len} ${Math.sin(a) * len} L ${Math.cos(b) * len} ${Math.sin(b) * len} Z`} fill={color} />;
    })}
  </g>
);
