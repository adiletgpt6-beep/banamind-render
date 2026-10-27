// Векторные иконки живых роликов BalaGo (собственная отрисовка, без чужих
// логотипов). Все — в квадрате 100×100, цвет задаётся пропсами.
import { LIVE_COLORS as C } from "./theme";

type IconProps = {
  readonly size?: number;
  readonly color?: string;
  readonly accent?: string;
  readonly style?: React.CSSProperties;
};

const Svg: React.FC<IconProps & { readonly children: React.ReactNode }> = ({ size = 96, style, children }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", ...style }}>
    {children}
  </svg>
);

export const HouseIcon: React.FC<IconProps> = ({ color = C.navy, accent = C.yellow, ...p }) => (
  <Svg {...p}>
    <path d="M14 48 L50 18 L86 48" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 44 V82 H76 V44" fill={accent} stroke={color} strokeWidth={7} strokeLinejoin="round" />
    <rect x={42} y={58} width={16} height={24} rx={3} fill={color} />
    <rect x={62} y={22} width={9} height={16} rx={2} fill={color} />
  </Svg>
);

export const SchoolIcon: React.FC<IconProps> = ({ color = C.navy, accent = C.yellow, ...p }) => (
  <Svg {...p}>
    <path d="M10 84 V46 L50 26 L90 46 V84 Z" fill={accent} stroke={color} strokeWidth={7} strokeLinejoin="round" />
    <path d="M50 26 V8" stroke={color} strokeWidth={5} strokeLinecap="round" />
    <path d="M50 9 L66 14 L50 19 Z" fill={C.red} />
    <circle cx={50} cy={48} r={9} fill={C.white} stroke={color} strokeWidth={5} />
    <path d="M50 43 V48 L54 51" stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" />
    <rect x={20} y={62} width={14} height={12} rx={2} fill={color} />
    <rect x={66} y={62} width={14} height={12} rx={2} fill={color} />
    <rect x={43} y={64} width={14} height={20} rx={2} fill={color} />
  </Svg>
);

export const BriefcaseIcon: React.FC<IconProps> = ({ color = C.navy, accent = C.yellow, ...p }) => (
  <Svg {...p}>
    <rect x={12} y={30} width={76} height={52} rx={10} fill={accent} stroke={color} strokeWidth={7} />
    <path d="M36 30 V22 Q36 16 42 16 H58 Q64 16 64 22 V30" fill="none" stroke={color} strokeWidth={7} />
    <path d="M12 52 H88" stroke={color} strokeWidth={6} />
    <rect x={44} y={46} width={12} height={12} rx={2} fill={color} />
  </Svg>
);

export const RoadIcon: React.FC<IconProps> = ({ color = C.navy, accent = C.yellow, ...p }) => (
  <Svg {...p}>
    <path d="M30 90 L42 10 H58 L70 90 Z" fill={color} />
    <path d="M50 18 V30 M50 44 V56 M50 70 V84" stroke={accent} strokeWidth={6} strokeLinecap="round" />
  </Svg>
);

export const PauseIcon: React.FC<IconProps> = ({ color = C.white, accent = C.red, ...p }) => (
  <Svg {...p}>
    <circle cx={50} cy={50} r={42} fill={accent} />
    <rect x={34} y={30} width={11} height={40} rx={3} fill={color} />
    <rect x={55} y={30} width={11} height={40} rx={3} fill={color} />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ color = C.white, accent = C.green, ...p }) => (
  <Svg {...p}>
    <circle cx={50} cy={50} r={42} fill={accent} />
    <path d="M30 51 L44 65 L71 36" fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SunIcon: React.FC<IconProps> = ({ color = C.yellowDeep, accent = C.yellow, ...p }) => (
  <Svg {...p}>
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return (
        <path
          key={i}
          d={`M${50 + Math.cos(a) * 32} ${50 + Math.sin(a) * 32} L${50 + Math.cos(a) * 44} ${50 + Math.sin(a) * 44}`}
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
        />
      );
    })}
    <circle cx={50} cy={50} r={22} fill={accent} stroke={color} strokeWidth={5} />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({ color = C.navy, accent = C.yellow, ...p }) => (
  <Svg {...p}>
    <path d="M24 70 Q28 62 28 50 Q28 26 50 24 Q72 26 72 50 Q72 62 76 70 Z" fill={accent} stroke={color} strokeWidth={7} strokeLinejoin="round" />
    <circle cx={50} cy={80} r={8} fill={color} />
    <circle cx={50} cy={18} r={5} fill={color} />
  </Svg>
);

export const LinkIcon: React.FC<IconProps> = ({ color = C.navy, ...p }) => (
  <Svg {...p}>
    <path d="M44 58 L58 44" stroke={color} strokeWidth={9} strokeLinecap="round" />
    <path d="M40 46 L30 56 Q20 68 32 78 Q44 88 56 76 L64 68" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
    <path d="M60 54 L70 44 Q80 32 68 22 Q56 12 44 24 L36 32" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
  </Svg>
);

// Обобщённый значок чата с трубкой (не логотип мессенджера).
export const ChatPhoneIcon: React.FC<IconProps> = ({ color = C.white, accent = C.green, ...p }) => (
  <Svg {...p}>
    <circle cx={52} cy={48} r={40} fill={accent} />
    <path d="M22 70 L12 92 L38 84 Z" fill={accent} />
    <path
      d="M36 30 Q32 30 31 35 Q30 48 42 60 Q54 71 66 70 Q71 69 71 64 L71 59 Q71 56 68 55 L60 52 Q57 51 55 54 L52 57 Q44 53 41 46 L44 43 Q47 41 46 38 L43 31 Q42 29 39 29 Z"
      fill={color}
    />
  </Svg>
);

export const MailIcon: React.FC<IconProps> = ({ color = C.navy, accent = C.white, ...p }) => (
  <Svg {...p}>
    <rect x={12} y={24} width={76} height={54} rx={9} fill={accent} stroke={color} strokeWidth={7} />
    <path d="M14 28 L50 56 L86 28" fill="none" stroke={color} strokeWidth={7} strokeLinejoin="round" />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ color = C.navy, accent = C.yellow, ...p }) => (
  <Svg {...p}>
    <rect x={12} y={18} width={76} height={70} rx={10} fill={C.white} stroke={color} strokeWidth={7} />
    <path d="M12 38 H88" stroke={color} strokeWidth={7} />
    <rect x={14} y={21} width={72} height={15} fill={accent} />
    <path d="M32 10 V26 M68 10 V26" stroke={color} strokeWidth={7} strokeLinecap="round" />
    {[0, 1, 2].map((r) =>
      [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={22 + c * 16} y={46 + r * 13} width={9} height={8} rx={2} fill={color} opacity={0.75} />),
    )}
  </Svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ color = C.navy, ...p }) => (
  <Svg {...p}>
    <path
      d="M30 14 Q22 14 20 22 Q16 48 38 70 Q58 88 80 82 Q88 80 88 72 L88 64 Q88 59 83 57 L70 52 Q65 50 62 55 L58 60 Q44 54 38 42 L43 37 Q47 33 45 28 L40 18 Q38 14 33 14 Z"
      fill={color}
    />
  </Svg>
);
