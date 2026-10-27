// Декорация BG-016: светлая кухня бишкекской квартиры. В окне — снежные
// вершины Ала-Тоо, тополя и панельные дома. Стол на переднем плане,
// холодильник справа, настенные часы. Все размеры — пиксели кадра 1080×1920.
import { fontFamily } from "../../fonts";

export const K = {
  tableTop: 1180, // верх столешницы
  tableFront: 1214,
  tableBottom: 1500,
  tableX0: 30,
  tableX1: 770,
  window: { x: 90, y: 230, w: 470, h: 400 },
  clock: { x: 672, y: 372, r: 74 },
  fridge: { x: 790, y: 440, w: 250, h: 800 },
} as const;

export const PAL = {
  wall: "#FFF5E6",
  wallShade: "#F6E7CF",
  tile: "#FDFBF6",
  tileLine: "#EADFCB",
  wood: "#D9A877",
  woodTop: "#E8BE90",
  woodDark: "#B98657",
  floor: "#E9CFA9",
  floorLine: "#DDBF95",
  navy: "#1E2F5C",
  yellow: "#FFC928",
  white: "#FFFFFF",
};

// Вид из окна: небо, горы Ала-Тоо со снегом, тополя, дома. dusk 0…1 —
// дымка мечты (теплее и мягче).
const WindowView: React.FC<{ readonly w: number; readonly h: number; readonly dream: number }> = ({ w, h, dream }) => (
  <g>
    <defs>
      <linearGradient id="bg16sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={dream > 0.5 ? "#BFE3FF" : "#9FD3F7"} />
        <stop offset="1" stopColor={dream > 0.5 ? "#FFEBD2" : "#E4F3FB"} />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={w} height={h} fill="url(#bg16sky)" />
    {/* дальний хребет */}
    <path
      d={`M0 ${h * 0.55} L${w * 0.12} ${h * 0.36} L${w * 0.22} ${h * 0.44} L${w * 0.36} ${h * 0.24} L${w * 0.5} ${h * 0.4} L${w * 0.63} ${h * 0.27} L${w * 0.78} ${h * 0.42} L${w * 0.9} ${h * 0.31} L${w} ${h * 0.4} L${w} ${h * 0.7} L0 ${h * 0.7} Z`}
      fill="#A9B9D6"
    />
    {/* снежные шапки */}
    <path
      d={`M${w * 0.3} ${h * 0.3} L${w * 0.36} ${h * 0.24} L${w * 0.42} ${h * 0.31} L${w * 0.39} ${h * 0.3} L${w * 0.36} ${h * 0.33} L${w * 0.33} ${h * 0.31} Z M${w * 0.58} ${h * 0.31} L${w * 0.63} ${h * 0.27} L${w * 0.69} ${h * 0.33} L${w * 0.65} ${h * 0.32} L${w * 0.62} ${h * 0.34} Z M${w * 0.86} ${h * 0.34} L${w * 0.9} ${h * 0.31} L${w * 0.95} ${h * 0.36} L${w * 0.91} ${h * 0.355} Z M${w * 0.08} ${h * 0.39} L${w * 0.12} ${h * 0.36} L${w * 0.16} ${h * 0.4} L${w * 0.12} ${h * 0.395} Z`}
      fill="#FFFFFF"
    />
    {/* ближние предгорья */}
    <path d={`M0 ${h * 0.62} Q${w * 0.25} ${h * 0.5} ${w * 0.5} ${h * 0.6} T${w} ${h * 0.58} L${w} ${h} L0 ${h} Z`} fill="#C7D8C2" />
    {/* панельные дома */}
    {[
      [0.04, 0.6, 0.2, 0.4],
      [0.27, 0.66, 0.16, 0.34],
      [0.66, 0.62, 0.22, 0.38],
    ].map(([x, y, ww, hh], i) => (
      <g key={i}>
        <rect x={w * x} y={h * y} width={w * ww} height={h * hh} fill={i === 1 ? "#F2E2C8" : "#EFE7DB"} />
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 4 }).map((__, c) => (
            <rect
              key={`${r}-${c}`}
              x={w * x + w * ww * (0.1 + c * 0.22)}
              y={h * y + 10 + r * 26}
              width={w * ww * 0.13}
              height={14}
              fill="#A8C4DA"
            />
          )),
        )}
      </g>
    ))}
    {/* тополя */}
    {[0.46, 0.53, 0.6, 0.94].map((x, i) => (
      <g key={i}>
        <rect x={w * x - 3} y={h * 0.8} width={6} height={h * 0.2} fill="#7A6250" />
        <ellipse cx={w * x} cy={h * 0.68} rx={16} ry={h * 0.17} fill={i % 2 ? "#6FAE6A" : "#7DBA72"} />
      </g>
    ))}
  </g>
);

export const Clock: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly minutes: number }> = ({ x, y, r, minutes }) => {
  const h = (minutes / 60) % 12;
  const m = minutes % 60;
  const ha = (h / 12) * 360;
  const ma = (m / 60) * 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 8} fill="#2B3A62" />
      <circle r={r} fill="#FFFFFF" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-2.5} y={-r + 8} width={5} height={i % 3 ? 10 : 18} rx={2} fill="#2B3A62" transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-5} y={-r * 0.5} width={10} height={r * 0.56} rx={5} fill="#2B3A62" transform={`rotate(${ha})`} />
      <rect x={-3.5} y={-r * 0.78} width={7} height={r * 0.84} rx={3.5} fill="#2B3A62" transform={`rotate(${ma})`} />
      <circle r={7} fill={PAL.yellow} />
    </g>
  );
};

// Задник кухни (за персонажами).
export const KitchenBack: React.FC<{
  readonly dream?: number; // 0…1 тёплая дымка мечты
  readonly clockMin: number; // время на часах, минуты от 0:00
  readonly fridgeNote?: number; // 0…1 записка «Мектеп» на холодильнике
}> = ({ dream = 0, clockMin, fridgeNote = 0 }) => {
  const { window: W, fridge: F, clock: C } = K;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <rect width={1080} height={1920} fill={PAL.wall} />
      <rect y={0} width={1080} height={120} fill={PAL.wallShade} />
      {/* фартук из плитки */}
      <rect x={0} y={900} width={1080} height={290} fill={PAL.tile} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 92} y1={900} x2={i * 92} y2={1190} stroke={PAL.tileLine} strokeWidth={3} />
      ))}
      {[972, 1044, 1116].map((y) => (
        <line key={y} x1={0} y1={y} x2={1080} y2={y} stroke={PAL.tileLine} strokeWidth={3} />
      ))}
      {/* кыргызский орнамент — тонкая полоса */}
      <rect x={0} y={884} width={1080} height={16} fill="#F2C76B" opacity={0.8} />
      {/* окно */}
      <g transform={`translate(${W.x} ${W.y})`}>
        <rect x={-22} y={-22} width={W.w + 44} height={W.h + 44} rx={10} fill="#FFFFFF" />
        <svg x={0} y={0} width={W.w} height={W.h}>
          <WindowView w={W.w} h={W.h} dream={dream} />
        </svg>
        <rect x={W.w / 2 - 7} y={0} width={14} height={W.h} fill="#FFFFFF" />
        <rect x={0} y={W.h * 0.42 - 7} width={W.w} height={14} fill="#FFFFFF" />
        <rect x={-40} y={W.h + 18} width={W.w + 80} height={22} rx={6} fill="#F1E6D4" />
        {/* шторы */}
        <path d={`M-30 -30 Q 10 ${W.h * 0.5} -18 ${W.h + 20} L -60 ${W.h + 20} L -60 -30 Z`} fill="#F6C66A" opacity={0.9} />
        <path d={`M${W.w + 30} -30 Q ${W.w - 10} ${W.h * 0.5} ${W.w + 18} ${W.h + 20} L ${W.w + 60} ${W.h + 20} L ${W.w + 60} -30 Z`} fill="#F6C66A" opacity={0.9} />
      </g>
      {/* растение на подоконнике */}
      <g transform={`translate(${W.x + W.w - 30} ${W.y + W.h + 18})`}>
        <path d="M-26 0 L26 0 L20 -40 L-20 -40 Z" fill="#E07A5F" transform="scale(1,-1) translate(0,0)" />
        <ellipse cx={-14} cy={-52} rx={14} ry={30} fill="#6FAE6A" transform="rotate(-20 -14 -52)" />
        <ellipse cx={12} cy={-56} rx={14} ry={32} fill="#7DBA72" transform="rotate(18 12 -56)" />
        <ellipse cx={0} cy={-64} rx={12} ry={34} fill="#5E9C5A" />
      </g>
      <Clock x={C.x} y={C.y} r={C.r} minutes={clockMin} />
      {/* холодильник */}
      <g transform={`translate(${F.x} ${F.y})`}>
        <rect width={F.w} height={F.h} rx={26} fill="#F4F6F8" stroke="#DDE3EA" strokeWidth={4} />
        <line x1={6} y1={F.h * 0.36} x2={F.w - 6} y2={F.h * 0.36} stroke="#DDE3EA" strokeWidth={5} />
        <rect x={24} y={60} width={12} height={150} rx={6} fill="#C9D1DB" />
        <rect x={24} y={F.h * 0.36 + 40} width={12} height={220} rx={6} fill="#C9D1DB" />
        {/* записка «Мектеп» */}
        <g opacity={fridgeNote} transform={`translate(${F.w * 0.36} 70) rotate(4)`}>
          <rect width={140} height={110} rx={6} fill="#FFF3A8" />
          <circle cx={70} cy={6} r={9} fill="#E5677A" />
          <text x={70} y={52} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={30} fill={PAL.navy}>
            Мектеп
          </text>
          <text x={70} y={90} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={30} fill="#D9473F">
            8:00
          </text>
        </g>
      </g>
      {/* пол */}
      <rect x={0} y={1440} width={1080} height={480} fill={PAL.floor} />
      {[1520, 1620, 1740, 1880].map((y) => (
        <line key={y} x1={0} y1={y} x2={1080} y2={y} stroke={PAL.floorLine} strokeWidth={3} />
      ))}
    </svg>
  );
};

// Стол (перед мамой; закрывает её ниже пояса).
export const TableFront: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <rect x={K.tableX0} y={K.tableTop} width={K.tableX1 - K.tableX0} height={K.tableFront - K.tableTop} rx={6} fill={PAL.woodTop} />
    <rect x={K.tableX0 + 10} y={K.tableFront} width={K.tableX1 - K.tableX0 - 20} height={K.tableBottom - K.tableFront} fill={PAL.wood} />
    <rect x={K.tableX0 + 10} y={K.tableFront} width={K.tableX1 - K.tableX0 - 20} height={16} fill={PAL.woodDark} opacity={0.5} />
    <rect x={K.tableX0 + 40} y={K.tableBottom - 4} width={30} height={60} fill={PAL.woodDark} />
    <rect x={K.tableX1 - 70} y={K.tableBottom - 4} width={30} height={60} fill={PAL.woodDark} />
    <ellipse cx={(K.tableX0 + K.tableX1) / 2} cy={K.tableBottom + 66} rx={380} ry={18} fill="#000" opacity={0.06} />
  </svg>
);

// ---------- Реквизит на столе ----------

// Ноутбук в три четверти: open 1 — открыт, 0 — закрыт.
export const Laptop: React.FC<{ readonly x: number; readonly y: number; readonly open: number; readonly glow?: number }> = ({ x, y, open, glow = 0.6 }) => {
  const lidH = 170 * open;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-130 0 L130 0 L112 -22 L-112 -22 Z" fill="#C3CAD6" />
      <rect x={-130} y={-2} width={260} height={8} rx={3} fill="#9FA8B8" />
      <g transform={`translate(0 -22)`}>
        <rect x={-108} y={-Math.max(6, lidH)} width={216} height={Math.max(6, lidH)} rx={8} fill="#5A6476" />
        {open > 0.15 ? (
          <rect x={-98} y={-lidH + 10} width={196} height={Math.max(0, lidH - 20)} rx={4} fill={`rgba(170,215,255,${0.35 + glow * 0.5})`} />
        ) : null}
      </g>
    </g>
  );
};

// Стакан воды: fill 0…1.
export const Glass: React.FC<{ readonly x: number; readonly y: number; readonly fill: number }> = ({ x, y, fill }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M-30 -96 L30 -96 L24 0 L-24 0 Z`} fill="rgba(220,240,255,0.55)" stroke="#9CC6E6" strokeWidth={4} />
    {fill > 0.01 ? <path d={`M${-24 - 6 * fill} ${-90 * fill} L${24 + 6 * fill} ${-90 * fill} L24 -2 L-24 -2 Z`} fill="rgba(120,190,245,0.55)" /> : null}
    <path d="M-20 -86 L-16 -12" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
  </g>
);

// Бутылка негазированной воды 0,5 л (без еды и сладостей).
export const Bottle: React.FC<{ readonly x: number; readonly y: number; readonly rot?: number; readonly level?: number }> = ({ x, y, rot = 0, level = 0.8 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-11} y={-170} width={22} height={18} rx={4} fill="#2F7FD0" />
    <path d="M-12 -152 Q -30 -130 -30 -100 L-30 -6 Q -30 0 -24 0 L24 0 Q 30 0 30 -6 L30 -100 Q 30 -130 12 -152 Z" fill="rgba(215,236,255,0.75)" stroke="#8DBCE3" strokeWidth={4} />
    <rect x={-30} y={-100 + 94 * (1 - level)} width={60} height={94 * level} fill="rgba(120,190,245,0.45)" />
    <rect x={-30} y={-84} width={60} height={34} fill="#FFFFFF" />
    <text x={0} y={-60} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={15} fill="#2F7FD0">
      0,5 л
    </text>
  </g>
);

// Будильник: ring 0…1 — дрожит и звенит.
export const AlarmClock: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly ring: number; readonly f: number; readonly color?: string; readonly label?: string }> = ({
  x,
  y,
  s = 1,
  ring,
  f,
  color = "#E5677A",
  label,
}) => {
  const shake = ring * Math.sin(f * 2.4) * 7;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${shake})`}>
      <rect x={-52} y={40} width={14} height={30} rx={6} fill="#2B3A62" transform="rotate(20 -45 55)" />
      <rect x={38} y={40} width={14} height={30} rx={6} fill="#2B3A62" transform="rotate(-20 45 55)" />
      <circle cx={-46} cy={-58} r={26} fill={color} />
      <circle cx={46} cy={-58} r={26} fill={color} />
      <circle r={72} fill={color} />
      <circle r={58} fill="#FFFFFF" />
      <rect x={-4} y={-40} width={8} height={42} rx={4} fill="#2B3A62" />
      <rect x={-3} y={-4} width={34} height={7} rx={3} fill="#2B3A62" />
      <circle r={6} fill={PAL.yellow} />
      {label ? (
        <text y={112} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={34} fill={PAL.navy}>
          {label}
        </text>
      ) : null}
      {ring > 0.05
        ? [-1, 1].map((side) => (
            <g key={side} opacity={ring} stroke="#2B3A62" strokeWidth={7} strokeLinecap="round" fill="none">
              <path d={`M${side * 100} -50 Q ${side * 118} -20 ${side * 100} 10`} />
              <path d={`M${side * 124} -70 Q ${side * 148} -20 ${side * 124} 30`} />
            </g>
          ))
        : null}
    </g>
  );
};

// Папка с работой.
export const Folder: React.FC<{ readonly x: number; readonly y: number; readonly label?: string }> = ({ x, y, label = "Жумуш" }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-110 0 L110 0 L104 -26 L-104 -26 Z" fill="#3E6FB0" />
    <rect x={-96} y={-40} width={70} height={18} rx={4} fill="#3E6FB0" />
    <path d="M-104 -26 L104 -26 L98 -36 L-98 -36 Z" fill="#F4F6F8" />
    <text x={0} y={-6} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={20} fill="#FFFFFF">
      {label}
    </text>
  </g>
);

// Кухонный таймер-«часики» с подписью.
export const Timer: React.FC<{ readonly x: number; readonly y: number; readonly label: string; readonly color: string; readonly rot?: number; readonly s?: number; readonly alert?: number }> = ({
  x,
  y,
  label,
  color,
  rot = 0,
  s = 1,
  alert = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {alert > 0.01 ? <circle cy={-64} r={92 + alert * 10} fill="none" stroke="#FFB020" strokeWidth={10} opacity={alert} /> : null}
    <ellipse cx={0} cy={4} rx={70} ry={10} fill="#000" opacity={0.08} />
    <path d="M-66 0 L66 0 L60 -20 L-60 -20 Z" fill="#2B3A62" />
    <circle cy={-74} r={66} fill={color} />
    <circle cy={-74} r={52} fill="#FFFFFF" />
    <text x={0} y={-82} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={28} fill={PAL.navy}>
      8:00
    </text>
    <rect x={-3} y={-122} width={6} height={18} rx={3} fill="#2B3A62" />
    <text x={0} y={-44} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={17} fill={color}>
      {label}
    </text>
  </g>
);

// Рюкзак на полу/стуле.
export const Backpack: React.FC<{ readonly x: number; readonly y: number; readonly color?: string }> = ({ x, y, color = "#3E9C6B" }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-60} y={-150} width={120} height={150} rx={30} fill={color} />
    <rect x={-44} y={-70} width={88} height={50} rx={14} fill="#000" opacity={0.12} />
    <path d="M-30 -150 Q 0 -190 30 -150" stroke={color} strokeWidth={12} fill="none" />
  </g>
);
