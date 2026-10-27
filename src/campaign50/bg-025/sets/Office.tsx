// Светлый рабочий кабинет мамы (мировые координаты сцены, SVG):
// тёплая стена, окно с узнаваемым Бишкеком (хребет Ала-Тоо со снегом,
// пирамидальные тополя, панельные дома), полка с папками и растением,
// стол с ноутбуком. Средний план мамы стоит перед этим фоном.
// Слой back — всё позади персонажа, front — стол перед ним.
import { Block, Mountains, Poplar } from "../art";
import { C } from "../theme";

export const OFFICE = {
  win: { x: 190, y: 300, w: 290, h: 540 },
  deskY: 1085,
} as const;

const WALL = "#F8F2E7";
const WALL_LOW = "#F1E8D8";
const FRAME = "#FFFFFF";

// f — кадр (лёгкое дыхание сцены: тополя чуть качаются, облако плывёт).
export const OfficeBack: React.FC<{ readonly f: number }> = ({ f }) => {
  const { x, y, w, h } = OFFICE.win;
  const sway = Math.sin(f / 34) * 1.2;
  const cloud = (f * 0.18) % 420;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="bg25-office-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={WALL} />
          <stop offset="1" stopColor={WALL_LOW} />
        </linearGradient>
        <radialGradient id="bg25-office-sun" cx="0.25" cy="0.35" r="0.65">
          <stop offset="0" stopColor="rgba(255,214,120,0.30)" />
          <stop offset="1" stopColor="rgba(255,214,120,0)" />
        </radialGradient>
        <linearGradient id="bg25-office-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFE5FA" />
          <stop offset="0.7" stopColor="#EAF4FC" />
          <stop offset="1" stopColor="#FFF3DA" />
        </linearGradient>
        <clipPath id="bg25-office-win">
          <rect x={x} y={y} width={w} height={h} rx={6} />
        </clipPath>
      </defs>
      <rect x={-600} y={-400} width={2400} height={2400} fill="url(#bg25-office-wall)" />
      <rect x={-600} y={-400} width={2400} height={2400} fill="url(#bg25-office-sun)" />
      {/* окно */}
      <rect x={x - 22} y={y - 22} width={w + 44} height={h + 44} rx={14} fill="rgba(120,90,50,0.10)" transform="translate(10 12)" />
      <g clipPath="url(#bg25-office-win)">
        <rect x={x} y={y} width={w} height={h} fill="url(#bg25-office-sky)" />
        <g opacity={0.9} transform={`translate(${x - 120 + cloud} ${y + 70})`}>
          <ellipse cx={0} cy={0} rx={46} ry={14} fill="#FFFFFF" />
          <ellipse cx={30} cy={-8} rx={30} ry={14} fill="#FFFFFF" />
        </g>
        <Mountains w={w + 120} h={170} x={x - 70} y={y + 330} far />
        <Mountains w={w + 60} h={120} x={x - 10} y={y + 372} />
        <rect x={x} y={y + 370} width={w} height={h - 370} fill="#E9EFE4" />
        <Block x={x + 14} y={y + h - 6} w={118} floors={5} />
        <Poplar x={x + 152} y={y + h - 8} h={190} sway={sway} />
        <Poplar x={x + 178} y={y + h - 8} h={150} sway={-sway * 0.8} />
        <Block x={x + 196} y={y + h - 6} w={96} floors={4} color="#EBDDC6" />
        <rect x={x} y={y + h - 14} width={w} height={14} fill="#DCE3D6" />
      </g>
      {/* рама и переплёт */}
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx={10} fill="none" stroke={FRAME} strokeWidth={18} />
      <rect x={x + w / 2 - 6} y={y} width={12} height={h} fill={FRAME} />
      <rect x={x} y={y + h * 0.36} width={w} height={12} fill={FRAME} />
      <rect x={x - 34} y={y + h + 8} width={w + 68} height={20} rx={6} fill="#E7D7BC" />
      {/* полка справа: папки и растение */}
      <g transform="translate(700 742)">
        <rect x={0} y={0} width={240} height={14} rx={4} fill={C.wood} />
        <rect x={14} y={-96} width={30} height={96} rx={4} fill={C.navy} />
        <rect x={48} y={-104} width={30} height={104} rx={4} fill={C.yellow} />
        <rect x={82} y={-90} width={28} height={90} rx={4} fill={C.skyDeep} />
        <rect x={20} y={-70} width={18} height={8} rx={2} fill="#FFFFFF" opacity={0.7} />
        <rect x={54} y={-78} width={18} height={8} rx={2} fill="#FFFFFF" opacity={0.7} />
        <g transform="translate(168 0)">
          <path d="M -26 0 L -20 -44 L 20 -44 L 26 0 Z" fill="#E8D2B4" />
          <path d={`M 0 -44 C ${-30 + sway} -70 ${-34 + sway} -100 ${-12 + sway} -118 C -6 -90 -4 -66 0 -44 Z`} fill={C.poplar} />
          <path d={`M 0 -44 C ${24 - sway} -66 ${36 - sway} -96 ${18 - sway} -124 C 8 -96 4 -70 0 -44 Z`} fill={C.poplarDark} />
          <path d={`M 0 -44 C ${4 + sway} -74 ${2 + sway} -104 ${2 + sway} -132 C 8 -104 8 -74 0 -44 Z`} fill={C.poplar} />
        </g>
      </g>
    </svg>
  );
};

// Стол перед мамой: столешница, ноутбук (крышкой к зрителю), стопка
// бумаг и жёлтый стикер — фирменный акцент.
export const OfficeFront: React.FC = () => {
  const y = OFFICE.deskY;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <rect x={-600} y={y} width={2400} height={30} rx={6} fill={C.wood} />
      <rect x={-600} y={y + 26} width={2400} height={600} fill="#D9B48A" />
      <rect x={-600} y={y + 26} width={2400} height={10} fill="rgba(90,60,30,0.12)" />
      {/* ноутбук: крышка к зрителю */}
      <g transform={`translate(250 ${y + 4})`}>
        <path d="M 0 0 L 12 -150 L 220 -150 L 232 0 Z" fill="#D7DDE7" />
        <path d="M 12 -150 L 220 -150 L 222 -138 L 10 -138 Z" fill="#E8ECF2" />
        <circle cx={116} cy={-80} r={14} fill="#C7CFDB" />
        <rect x={-14} y={-4} width={260} height={12} rx={5} fill="#BCC6D4" />
      </g>
      {/* стопка бумаг и стикер */}
      <g transform={`translate(760 ${y + 6})`}>
        <rect x={0} y={-22} width={150} height={10} rx={3} fill="#FFFFFF" stroke="#E2D8C6" strokeWidth={2} />
        <rect x={6} y={-14} width={150} height={10} rx={3} fill="#FBF7EE" stroke="#E2D8C6" strokeWidth={2} />
        <rect x={-2} y={-6} width={150} height={10} rx={3} fill="#FFFFFF" stroke="#E2D8C6" strokeWidth={2} />
        <rect x={40} y={-46} width={44} height={40} rx={4} fill={C.yellow} transform="rotate(-6 62 -26)" />
      </g>
    </svg>
  );
};
