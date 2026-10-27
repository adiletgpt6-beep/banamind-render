// Бумажные фигурки pop-up карты: горы Ала-Тоо, тополя, пятиэтажки,
// дом героя, школа. Все — плоские SVG «вырезанные из бумаги» с белой
// кромкой и лёгкой тенью: их ставит в объём Standee (Stage.tsx).
import { fontFamily } from "../../../fonts";
import { BG47_TEXT } from "../script";
import { C } from "./palette";

const edge = { stroke: "#FFFFFF", strokeWidth: 6, strokeLinejoin: "round" as const };

// Горы Ала-Тоо: три слоя хребта со снежными шапками. 1200 × 360.
export const Mountains: React.FC<{ readonly label?: number; readonly width?: number; readonly height?: number }> = ({ label = 1, width = 1200, height = 360 }) => (
  <svg width={width} height={height} viewBox="0 0 1200 360" preserveAspectRatio="none" style={{ overflow: "visible", display: "block" }}>
    <path d="M0 360 L0 210 L120 120 L210 180 L330 60 L450 170 L560 90 L690 190 L800 70 L930 170 L1040 100 L1200 200 L1200 360 Z" fill="#C9D9EE" {...edge} />
    <path d="M330 60 L380 108 L352 102 L330 122 L306 100 L286 108 Z" fill="#FFFFFF" />
    <path d="M800 70 L846 112 L818 106 L800 126 L780 104 L758 110 Z" fill="#FFFFFF" />
    <path d="M560 90 L598 126 L574 120 L560 136 L544 120 L526 124 Z" fill="#FFFFFF" />
    <path d="M1040 100 L1078 132 L1054 128 L1040 142 L1026 128 L1006 132 Z" fill="#FFFFFF" />
    <path d="M120 120 L156 150 L134 146 L120 160 L106 146 L88 150 Z" fill="#FFFFFF" />
    <path d="M0 360 L0 270 L150 200 L260 250 L400 170 L520 240 L660 180 L780 250 L900 190 L1040 250 L1200 220 L1200 360 Z" fill="#A9C2E2" {...edge} />
    <path d="M0 360 L0 320 L200 280 L420 310 L640 270 L860 305 L1050 280 L1200 300 L1200 360 Z" fill="#8FB0D8" {...edge} />
    {label > 0 ? (
      <text x={720} y={300} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={40} fill="#FFFFFF" opacity={label} letterSpacing={4}>
        {BG47_TEXT.hook.mountains}
      </text>
    ) : null}
  </svg>
);

// Пирамидальный тополь — узнаваемая деталь бишкекских улиц. 40 × 150.
export const Poplar: React.FC<{ readonly tone?: number }> = ({ tone = 0 }) => (
  <svg width={40} height={150} viewBox="0 0 40 150" style={{ overflow: "visible" }}>
    <rect x={17} y={110} width={6} height={40} rx={2} fill="#9C7A55" />
    <path d="M20 0 C 34 30, 36 80, 30 118 C 26 124, 14 124, 10 118 C 4 80, 6 30, 20 0 Z" fill={tone ? "#6FBF6A" : "#5DB25F"} stroke="#FFFFFF" strokeWidth={4} />
    <path d="M20 14 C 26 40, 27 80, 24 110" fill="none" stroke="#88D483" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
  </svg>
);

// Пятиэтажка: светлый фасад, сетка окон. w × h.
export const Block: React.FC<{ readonly w?: number; readonly h?: number; readonly color?: string; readonly floors?: number }> = ({
  w = 150,
  h = 110,
  color = "#F4EEDF",
  floors = 5,
}) => {
  const cols = Math.max(3, Math.round(w / 30));
  const fh = (h - 14) / floors;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <rect x={0} y={0} width={w} height={h} rx={4} fill={color} stroke="#FFFFFF" strokeWidth={5} />
      <rect x={0} y={0} width={w} height={8} fill="#DCCFB0" />
      {Array.from({ length: floors }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={8 + (c * (w - 16)) / cols + 3}
            y={14 + r * fh + 3}
            width={(w - 16) / cols - 6}
            height={fh - 7}
            rx={2}
            fill={(r * 7 + c * 3) % 5 === 0 ? "#FFE38A" : "#BFD6EE"}
          />
        )),
      )}
    </svg>
  );
};

// Дом героя: тёплый домик с жёлтой крышей. 150 × 150.
export const Home: React.FC<{ readonly mark?: boolean }> = ({ mark = true }) => (
  <svg width={150} height={150} viewBox="0 0 150 150" style={{ overflow: "visible" }}>
    <path d="M12 68 L75 14 L138 68 Z" fill={C.yellow} stroke="#FFFFFF" strokeWidth={7} strokeLinejoin="round" />
    <rect x={26} y={64} width={98} height={84} rx={6} fill="#FFFFFF" stroke={C.navy} strokeWidth={5} />
    <rect x={62} y={98} width={28} height={50} rx={4} fill={C.navySoft} />
    <rect x={36} y={80} width={20} height={20} rx={3} fill="#BFD6EE" stroke={C.navy} strokeWidth={3} />
    <rect x={96} y={80} width={20} height={20} rx={3} fill="#FFE38A" stroke={C.navy} strokeWidth={3} />
    <path d="M12 68 L75 14 L138 68" fill="none" stroke={C.navy} strokeWidth={5} strokeLinejoin="round" />
    {mark ? (
      <text x={75} y={58} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={22} fill={C.navy}>
        {BG47_TEXT.fields.home}
      </text>
    ) : null}
  </svg>
);

// Школа: широкое здание с флажком и вывеской «МЕКТЕП». 240 × 170.
export const School: React.FC<{ readonly flag?: number; readonly color?: string; readonly sign?: string }> = ({
  flag = 0,
  color = "#FFFFFF",
  sign = BG47_TEXT.fields.school,
}) => (
  <svg width={240} height={170} viewBox="0 0 240 170" style={{ overflow: "visible" }}>
    <line x1={120} y1={6} x2={120} y2={56} stroke={C.navy} strokeWidth={4} />
    <path d={`M122 8 Q ${140 + 6 * Math.sin(flag)} ${12 + 3 * Math.cos(flag)} 156 10 L 156 30 Q ${140 + 6 * Math.sin(flag + 1)} ${34 + 2 * Math.cos(flag)} 122 30 Z`} fill={C.yellow} stroke={C.navy} strokeWidth={3} />
    <path d="M70 70 L120 46 L170 70 Z" fill={C.navySoft} stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round" />
    <rect x={8} y={70} width={224} height={98} rx={6} fill={color} stroke={C.navy} strokeWidth={5} />
    <rect x={64} y={78} width={112} height={26} rx={6} fill={C.navy} />
    <text x={120} y={98} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={19} fill="#FFFFFF" letterSpacing={1}>
      {sign}
    </text>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={20 + (i % 3) * 30 + (i > 2 ? 0 : 0)} y={i > 2 ? 136 : 112} width={20} height={18} rx={2} fill="#BFD6EE" />
    ))}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={`r${i}`} x={160 + (i % 3) * 22} y={i > 2 ? 136 : 112} width={16} height={18} rx={2} fill="#BFD6EE" />
    ))}
    <rect x={104} y={124} width={32} height={44} rx={4} fill={C.yellow} stroke={C.navy} strokeWidth={4} />
  </svg>
);

// Иконки полей ҮЙ / МЕКТЕП / УБАКЫТ (контур — пустое поле, заливка — заполнено).
export const FieldIcon: React.FC<{ readonly kind: "home" | "school" | "time"; readonly filled: number; readonly size?: number }> = ({
  kind,
  filled,
  size = 64,
}) => {
  const stroke = filled > 0.5 ? C.navy : "#A9B4CC";
  const fill = (c: string) => (filled > 0.5 ? c : "none");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {kind === "home" ? (
        <>
          <path d="M8 30 L32 10 L56 30" fill={fill(C.yellow)} stroke={stroke} strokeWidth={4} strokeLinejoin="round" />
          <rect x={14} y={29} width={36} height={27} rx={3} fill={fill("#FFFFFF")} stroke={stroke} strokeWidth={4} />
          <rect x={28} y={40} width={9} height={16} fill={fill(C.navySoft)} stroke={stroke} strokeWidth={2} />
        </>
      ) : kind === "school" ? (
        <>
          <line x1={32} y1={6} x2={32} y2={20} stroke={stroke} strokeWidth={3} />
          <path d="M33 7 L46 10 L33 14 Z" fill={fill(C.yellow)} stroke={stroke} strokeWidth={2.5} />
          <path d="M18 28 L32 19 L46 28 Z" fill={fill(C.navySoft)} stroke={stroke} strokeWidth={3} strokeLinejoin="round" />
          <rect x={6} y={28} width={52} height={28} rx={3} fill={fill("#FFFFFF")} stroke={stroke} strokeWidth={4} />
          <rect x={27} y={40} width={10} height={16} fill={fill(C.yellow)} stroke={stroke} strokeWidth={2} />
        </>
      ) : (
        <>
          <circle cx={32} cy={33} r={23} fill={fill("#FFFFFF")} stroke={stroke} strokeWidth={4} />
          <path d="M32 19 L32 33 L42 39" fill="none" stroke={filled > 0.5 ? C.navy : stroke} strokeWidth={4} strokeLinecap="round" />
          <circle cx={32} cy={33} r={3} fill={stroke} />
        </>
      )}
    </svg>
  );
};

// Галочка в кружке.
export const Check: React.FC<{ readonly size?: number; readonly p?: number; readonly color?: string }> = ({ size = 46, p = 1, color = C.check }) => (
  <svg width={size} height={size} viewBox="0 0 46 46" style={{ overflow: "visible" }}>
    <circle cx={23} cy={23} r={21 * Math.min(1, p * 1.6)} fill={color} />
    <path d="M13 24 L20 31 L34 15" fill="none" stroke="#FFFFFF" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, Math.min(1, (p - 0.35) / 0.65))} />
  </svg>
);

// Мягкий знак «не совпадает» (без тревожного красного).
export const Mismatch: React.FC<{ readonly size?: number; readonly p?: number }> = ({ size = 46, p = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 46 46" style={{ overflow: "visible" }}>
    <circle cx={23} cy={23} r={21 * Math.min(1, p * 1.6)} fill="#9AA6C2" />
    <path d="M15 19 L31 19 M15 27 L31 27 M28 12 L18 34" fill="none" stroke="#FFFFFF" strokeWidth={4.5} strokeLinecap="round" opacity={Math.max(0, Math.min(1, (p - 0.35) / 0.65))} />
  </svg>
);
