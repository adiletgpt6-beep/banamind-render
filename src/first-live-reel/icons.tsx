// Собственные векторные иконки живого ролика: единый линейный стиль
// (тёмно-синий контур, жёлтые акценты), viewBox 100×100. Без emoji.
import { COLORS } from "../config";

const NAVY = COLORS.navy;
const YELLOW = COLORS.yellow;

type IconProps = {
  readonly size: number;
  readonly color?: string;
  readonly accent?: string;
  readonly style?: React.CSSProperties;
};

const Svg: React.FC<
  IconProps & { readonly children: React.ReactNode; readonly viewBox?: string }
> = ({ size, style, children, viewBox = "0 0 100 100" }) => (
  <svg width={size} height={size} viewBox={viewBox} style={{ display: "block", overflow: "visible", ...style }}>
    {children}
  </svg>
);

const line = (color: string, w = 6) =>
  ({
    fill: "none",
    stroke: color,
    strokeWidth: w,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }) as const;

export const PinIcon: React.FC<IconProps> = ({ size, style, accent = YELLOW, color = NAVY }) => (
  <Svg size={size} style={style}>
    <path d="M50 94 C50 94 18 60 18 38 a32 32 0 0 1 64 0 C82 60 50 94 50 94Z" fill={accent} stroke={color} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={50} cy={38} r={12} fill={color} />
  </Svg>
);

export const HouseIcon: React.FC<IconProps> = ({ size, style, color = NAVY, accent = YELLOW }) => (
  <Svg size={size} style={style}>
    <path d="M14 48 L50 18 L86 48" {...line(color, 7)} />
    <path d="M24 42 V84 H76 V42" {...line(color, 7)} />
    <rect x={43} y={60} width={14} height={24} rx={2} fill={accent} stroke={color} strokeWidth={5} />
    <rect x={30} y={52} width={10} height={10} rx={1.5} fill={color} />
    <rect x={60} y={52} width={10} height={10} rx={1.5} fill={color} />
  </Svg>
);

export const SchoolIcon: React.FC<IconProps> = ({ size, style, color = NAVY, accent = YELLOW }) => (
  <Svg size={size} style={style}>
    <path d="M50 8 V24" {...line(color, 4)} />
    <path d="M50 9 H66 L62 14 L66 19 H50" fill={accent} stroke={color} strokeWidth={3} strokeLinejoin="round" />
    <path d="M10 44 L50 24 L90 44" {...line(color, 7)} />
    <path d="M18 44 V86 H82 V44" {...line(color, 7)} />
    <circle cx={50} cy={40} r={5} fill={color} />
    <path d="M30 54 V74 M43 54 V74 M57 54 V74 M70 54 V74" {...line(color, 5)} />
    <path d="M12 86 H88" {...line(color, 7)} />
  </Svg>
);

// Белый седан сбоку (силуэт в духе Volkswagen Polo), смотрит вправо.
// wheelTurn — поворот колёс в градусах (вращение при движении).
export const WhiteCar: React.FC<{
  readonly width: number;
  readonly wheelTurn?: number;
  readonly style?: React.CSSProperties;
}> = ({ width, wheelTurn = 0, style }) => (
  <svg width={width} height={width * 0.42} viewBox="0 0 200 84" style={{ display: "block", overflow: "visible", ...style }}>
    <ellipse cx={100} cy={78} rx={86} ry={5} fill="rgba(10,20,45,0.28)" />
    <path
      d="M12 58 C10 48 14 42 26 40 L58 36 C70 22 84 16 104 16 C124 16 136 22 148 34 L176 40 C188 42 192 50 190 60 L188 66 H12 Z"
      fill="#FFFFFF"
      stroke={NAVY}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path d="M66 37 C76 26 86 22 102 22 L102 38 Z" fill="#C9D6E8" stroke={NAVY} strokeWidth={3} strokeLinejoin="round" />
    <path d="M108 22 C122 22 132 26 142 37 L108 38 Z" fill="#C9D6E8" stroke={NAVY} strokeWidth={3} strokeLinejoin="round" />
    <path d="M20 52 H184" stroke={YELLOW} strokeWidth={4} strokeLinecap="round" />
    <rect x={180} y={44} width={8} height={6} rx={2} fill="#FFE9A6" />
    <rect x={12} y={45} width={6} height={6} rx={2} fill="#E85A4F" />
    {[52, 152].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={66} r={15} fill={NAVY} />
        <circle cx={cx} cy={66} r={7} fill="#D7DEE8" />
        <path
          d={`M ${cx - 10} 66 H ${cx + 10} M ${cx} 56 V 76`}
          stroke="#8C9AB0"
          strokeWidth={2.5}
          strokeLinecap="round"
          transform={`rotate(${wheelTurn} ${cx} 66)`}
        />
      </g>
    ))}
  </svg>
);

export const ClockIcon: React.FC<IconProps & { readonly minuteAngle: number; readonly hourAngle: number }> = ({
  size,
  style,
  color = NAVY,
  accent = YELLOW,
  minuteAngle,
  hourAngle,
}) => (
  <Svg size={size} style={style}>
    <circle cx={50} cy={50} r={42} fill="#FFFFFF" stroke={color} strokeWidth={7} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      const r1 = i % 3 === 0 ? 30 : 33;
      return (
        <line
          key={i}
          x1={50 + Math.sin(a) * r1}
          y1={50 - Math.cos(a) * r1}
          x2={50 + Math.sin(a) * 36}
          y2={50 - Math.cos(a) * 36}
          stroke={color}
          strokeWidth={i % 3 === 0 ? 4 : 2.5}
          strokeLinecap="round"
        />
      );
    })}
    <line x1={50} y1={50} x2={50 + Math.sin(hourAngle) * 18} y2={50 - Math.cos(hourAngle) * 18} stroke={color} strokeWidth={6} strokeLinecap="round" />
    <line x1={50} y1={50} x2={50 + Math.sin(minuteAngle) * 28} y2={50 - Math.cos(minuteAngle) * 28} stroke={accent} strokeWidth={5} strokeLinecap="round" />
    <circle cx={50} cy={50} r={5} fill={color} />
  </Svg>
);

export const BriefcaseIcon: React.FC<IconProps> = ({ size, style, color = NAVY, accent = YELLOW }) => (
  <Svg size={size} style={style}>
    <path d="M38 30 V22 a5 5 0 0 1 5 -5 H57 a5 5 0 0 1 5 5 V30" {...line(color, 6)} />
    <rect x={14} y={30} width={72} height={52} rx={9} fill="none" stroke={color} strokeWidth={7} />
    <path d="M14 52 H86" {...line(color, 5)} />
    <rect x={43} y={46} width={14} height={12} rx={3} fill={accent} stroke={color} strokeWidth={4} />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size, style, color = NAVY, accent = YELLOW }) => (
  <Svg size={size} style={style}>
    <rect x={14} y={22} width={72} height={64} rx={10} fill="none" stroke={color} strokeWidth={7} />
    <path d="M14 42 H86" {...line(color, 6)} />
    <path d="M34 14 V28 M66 14 V28" {...line(color, 7)} />
    <rect x={52} y={54} width={18} height={16} rx={3} fill={accent} stroke={color} strokeWidth={4} />
    <circle cx={32} cy={58} r={3.5} fill={color} />
    <circle cx={32} cy={72} r={3.5} fill={color} />
  </Svg>
);

export const ChecklistIcon: React.FC<IconProps> = ({ size, style, color = NAVY, accent = YELLOW }) => (
  <Svg size={size} style={style}>
    <rect x={18} y={12} width={64} height={78} rx={10} fill="none" stroke={color} strokeWidth={7} />
    <path d="M30 34 L36 40 L46 28" {...line(accent, 6)} />
    <path d="M30 56 L36 62 L46 50" {...line(accent, 6)} />
    <path d="M54 35 H70 M54 57 H70 M30 76 H70" {...line(color, 5)} />
  </Svg>
);

// Взрослый и ребёнок держатся за руки — минимально, без мультяшности.
export const FamilyIcon: React.FC<IconProps> = ({ size, style, color = NAVY, accent = YELLOW }) => (
  <Svg size={size} style={style}>
    <circle cx={36} cy={20} r={10} fill="none" stroke={color} strokeWidth={6} />
    <path d="M22 88 V54 a14 14 0 0 1 28 0 V88" {...line(color, 6)} />
    <circle cx={72} cy={46} r={8} fill={accent} stroke={color} strokeWidth={5} />
    <path d="M62 88 V72 a10 10 0 0 1 20 0 V88" {...line(color, 6)} />
    <path d="M50 64 Q57 70 63 70" {...line(color, 5)} />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({ size, style, color = NAVY, accent = YELLOW }) => (
  <Svg size={size} style={style}>
    <path d="M24 70 C28 62 28 54 28 44 a22 22 0 0 1 44 0 C72 54 72 62 76 70 Z" fill={accent} stroke={color} strokeWidth={6} strokeLinejoin="round" />
    <path d="M42 80 a8 8 0 0 0 16 0" {...line(color, 6)} />
    <path d="M50 14 V22" {...line(color, 6)} />
  </Svg>
);

export const ChatIcon: React.FC<IconProps> = ({ size, style, color = NAVY, accent = YELLOW }) => (
  <Svg size={size} style={style}>
    <path d="M50 12 a38 36 0 1 1 -22 66 L12 86 L18 70 a38 36 0 0 1 32 -58Z" fill={accent} stroke={color} strokeWidth={6} strokeLinejoin="round" />
    <path d="M36 42 H64 M36 56 H56" {...line(color, 6)} />
  </Svg>
);

export const ArrowDownIcon: React.FC<IconProps> = ({ size, style, color = NAVY }) => (
  <Svg size={size} style={style}>
    <path d="M50 14 V82 M24 58 L50 84 L76 58" {...line(color, 10)} />
  </Svg>
);

export const LinkIcon: React.FC<IconProps> = ({ size, style, color = NAVY }) => (
  <Svg size={size} style={style}>
    <path d="M44 58 L58 44" {...line(color, 9)} />
    <path d="M38 48 L28 58 a14 14 0 0 0 20 20 L58 68" {...line(color, 9)} />
    <path d="M62 52 L72 42 a14 14 0 0 0 -20 -20 L42 32" {...line(color, 9)} />
  </Svg>
);

// Узнаваемый значок WhatsApp: зелёный круг-«пузырь» с трубкой.
export const WhatsAppIcon: React.FC<IconProps> = ({ size, style, color = "#25D366" }) => (
  <Svg size={size} style={style}>
    <path d="M50 8 a42 42 0 1 1 -21 78.4 L10 92 L15.8 73.6 A42 42 0 0 1 50 8Z" fill={color} />
    <path
      d="M36 28 c2 -1 5 -1 6 1 l5 11 c1 2 0 4 -1 5 l-3 3 c3 7 8 12 15 15 l3 -3 c1 -1 3 -2 5 -1 l11 5 c2 1 2 4 1 6 c-3 6 -9 9 -16 7 C45 73 27 55 25 39 c-1 -5 4 -10 11 -11Z"
      fill="#FFFFFF"
    />
  </Svg>
);
