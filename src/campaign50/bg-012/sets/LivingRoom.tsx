// Гостиная вечером (мировые координаты, 1 px ≈ 2 мм): тёплый свет
// торшера, в окне — сумерки над Ала-Тоо и окна бишкекских домов, на стене
// детские рисунки на скотче, диван, журнальный столик. Задний план
// (RoomBack) рисуется за героями, передний (RoomFront) — перед ними.
import { interpolate } from "remotion";

export const ROOM = {
  w: 1720,
  wallBase: 1430,
  seatY: 1362, // уровень бёдер сидящих
  tableTop: 1520,
  floor: 1700,
  mom: 650,
  dad: 1010,
  sofaL: 400,
  sofaR: 1280,
} as const;

const NAVY = "#1E3A6E";

// Детский рисунок на стене (простые формы фломастером).
const WallDrawing: React.FC<{ x: number; y: number; w: number; h: number; rot: number; kind: "sun" | "car" | "house" }> = ({ x, y, w, h, rot, kind }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} fill="#000" opacity={0.08} rx={4} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#FFFDF7" rx={4} />
    {kind === "sun" ? (
      <>
        <circle cx={0} cy={-8} r={h * 0.2} fill="#FFC928" />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * h * 0.26} y1={-8 + Math.sin(a) * h * 0.26} x2={Math.cos(a) * h * 0.36} y2={-8 + Math.sin(a) * h * 0.36} stroke="#FFB300" strokeWidth={5} strokeLinecap="round" />;
        })}
        <path d={`M ${-w * 0.42} ${h * 0.36} Q 0 ${h * 0.22} ${w * 0.42} ${h * 0.36}`} stroke="#58B368" strokeWidth={7} fill="none" strokeLinecap="round" />
      </>
    ) : kind === "car" ? (
      <>
        <path d={`M ${-w * 0.36} ${h * 0.12} L ${-w * 0.3} ${-h * 0.06} L ${-w * 0.12} ${-h * 0.2} L ${w * 0.16} ${-h * 0.2} L ${w * 0.3} ${-h * 0.04} L ${w * 0.38} ${h * 0.12} Z`} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={-w * 0.2} cy={h * 0.16} r={h * 0.08} fill={NAVY} />
        <circle cx={w * 0.22} cy={h * 0.16} r={h * 0.08} fill={NAVY} />
        <path d={`M ${-w * 0.42} ${h * 0.3} L ${w * 0.42} ${h * 0.3}`} stroke="#9AA3AE" strokeWidth={5} strokeDasharray="14 10" />
      </>
    ) : (
      <>
        <path d={`M ${-w * 0.26} ${h * 0.3} L ${-w * 0.26} ${-h * 0.02} L 0 ${-h * 0.28} L ${w * 0.26} ${-h * 0.02} L ${w * 0.26} ${h * 0.3} Z`} fill="#FF8A65" stroke="#D84315" strokeWidth={4} strokeLinejoin="round" />
        <rect x={-w * 0.07} y={h * 0.08} width={w * 0.14} height={h * 0.22} fill="#FFE082" />
        <path d={`M ${-w * 0.4} ${h * 0.32} L ${w * 0.4} ${h * 0.32}`} stroke="#58B368" strokeWidth={7} strokeLinecap="round" />
      </>
    )}
    <rect x={-22} y={-h / 2 - 10} width={44} height={20} fill="#F6E7A8" opacity={0.85} transform="rotate(-4)" />
  </g>
);

// Окно: сумерки, горы Ала-Тоо со снежными вершинами, панельные дома.
const Window: React.FC<{ x: number; y: number; w: number; h: number; t: number }> = ({ x, y, w, h, t }) => {
  const twinkle = (i: number) => (Math.sin(t * 0.7 + i * 2.3) > 0.85 ? 0.55 : 1);
  return (
    <g>
      <defs>
        <linearGradient id="b12sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2C3E73" />
          <stop offset="0.55" stopColor="#6F6FA6" />
          <stop offset="0.85" stopColor="#E9A27D" />
          <stop offset="1" stopColor="#F4C38C" />
        </linearGradient>
        <clipPath id="b12win">
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <rect x={x - 22} y={y - 22} width={w + 44} height={h + 44} rx={8} fill="#FBF6EE" />
      <g clipPath="url(#b12win)">
        <rect x={x} y={y} width={w} height={h} fill="url(#b12sky)" />
        {/* Ала-Тоо */}
        <path
          d={`M ${x} ${y + h * 0.62} L ${x + w * 0.12} ${y + h * 0.46} L ${x + w * 0.22} ${y + h * 0.52} L ${x + w * 0.38} ${y + h * 0.34} L ${x + w * 0.5} ${y + h * 0.45} L ${x + w * 0.62} ${y + h * 0.3} L ${x + w * 0.78} ${y + h * 0.46} L ${x + w * 0.9} ${y + h * 0.4} L ${x + w} ${y + h * 0.5} L ${x + w} ${y + h} L ${x} ${y + h} Z`}
          fill="#4B5A8C"
        />
        <path
          d={`M ${x + w * 0.31} ${y + h * 0.4} L ${x + w * 0.38} ${y + h * 0.34} L ${x + w * 0.45} ${y + h * 0.4} L ${x + w * 0.41} ${y + h * 0.39} L ${x + w * 0.38} ${y + h * 0.41} L ${x + w * 0.35} ${y + h * 0.39} Z M ${x + w * 0.56} ${y + h * 0.36} L ${x + w * 0.62} ${y + h * 0.3} L ${x + w * 0.69} ${y + h * 0.37} L ${x + w * 0.65} ${y + h * 0.355} L ${x + w * 0.62} ${y + h * 0.375} L ${x + w * 0.59} ${y + h * 0.355} Z`}
          fill="#F2F2FA"
          opacity={0.95}
          transform={`translate(0 ${h * 0.012}) scale(1 1.25)`}
          style={{ transformBox: "fill-box", transformOrigin: "top" }}
        />
        {/* городские дома с огнями */}
        {[
          [0.0, 0.8, 0.2],
          [0.18, 0.74, 0.16],
          [0.36, 0.82, 0.22],
          [0.6, 0.76, 0.17],
          [0.78, 0.8, 0.24],
        ].map(([bx, by, bw], i) => (
          <g key={i}>
            <rect x={x + w * bx} y={y + h * by} width={w * bw} height={h} fill={i % 2 ? "#3B3F66" : "#444873"} />
            {Array.from({ length: 12 }, (_, k) => (
              <rect
                key={k}
                x={x + w * bx + 12 + (k % 3) * ((w * bw - 24) / 3)}
                y={y + h * by + 14 + Math.floor(k / 3) * 26}
                width={12}
                height={14}
                fill="#FFD27A"
                opacity={(k * 7 + i * 3) % 5 === 0 ? 0 : 0.8 * twinkle(k + i * 12)}
              />
            ))}
          </g>
        ))}
      </g>
      <rect x={x + w / 2 - 6} y={y} width={12} height={h} fill="#FBF6EE" />
      <rect x={x} y={y + h * 0.42} width={w} height={10} fill="#FBF6EE" />
      <rect x={x - 34} y={y + h + 14} width={w + 68} height={20} rx={6} fill="#EFE4D3" />
      {/* шторы */}
      <path d={`M ${x - 70} ${y - 40} L ${x + 34} ${y - 40} Q ${x + 10} ${y + h * 0.5} ${x + 40} ${y + h + 60} L ${x - 80} ${y + h + 60} Z`} fill="#E7C66E" />
      <path d={`M ${x + w + 70} ${y - 40} L ${x + w - 34} ${y - 40} Q ${x + w - 10} ${y + h * 0.5} ${x + w - 40} ${y + h + 60} L ${x + w + 80} ${y + h + 60} Z`} fill="#E7C66E" />
      <rect x={x - 100} y={y - 56} width={w + 200} height={14} rx={7} fill="#B08850" />
    </g>
  );
};

export const RoomBack: React.FC<{ readonly t: number; readonly lamp?: number }> = ({ t, lamp = 1 }) => {
  const R = ROOM;
  const flick = 1 + 0.01 * Math.sin(t * 3.1);
  return (
    <g>
      <defs>
        <linearGradient id="b12wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3E3CC" />
          <stop offset="1" stopColor="#EBD3B5" />
        </linearGradient>
        <radialGradient id="b12lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE2A8" stopOpacity={0.85} />
          <stop offset="0.45" stopColor="#FFD08A" stopOpacity={0.35} />
          <stop offset="1" stopColor="#FFD08A" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="b12floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C89A6E" />
          <stop offset="1" stopColor="#B08359" />
        </linearGradient>
        <linearGradient id="b12sofa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7E93B8" />
          <stop offset="1" stopColor="#6A7FA6" />
        </linearGradient>
      </defs>
      <rect x={-400} y={-400} width={R.w + 800} height={R.wallBase + 400} fill="url(#b12wall)" />
      {/* плинтус и пол */}
      <rect x={-400} y={R.wallBase} width={R.w + 800} height={1400} fill="url(#b12floor)" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={-400} y1={R.wallBase + 40 + i * i * 14} x2={R.w + 400} y2={R.wallBase + 40 + i * i * 14} stroke="#A97E55" strokeWidth={3} opacity={0.25} />
      ))}
      <rect x={-400} y={R.wallBase - 18} width={R.w + 800} height={20} fill="#FBF4EA" />
      {/* ковёр */}
      <ellipse cx={850} cy={1760} rx={760} ry={150} fill="#E9D7B9" />
      <ellipse cx={850} cy={1760} rx={700} ry={124} fill="none" stroke="#F4C430" strokeWidth={8} opacity={0.6} />

      <Window x={930} y={430} w={420} h={430} t={t} />
      {/* часы */}
      <g transform="translate(560 470)">
        <circle r={52} fill="#FFFFFF" stroke={NAVY} strokeWidth={7} />
        <line x1={0} y1={0} x2={0} y2={-34} stroke={NAVY} strokeWidth={6} strokeLinecap="round" transform={`rotate(${210 + t * 0.6})`} />
        <line x1={0} y1={0} x2={0} y2={-24} stroke={NAVY} strokeWidth={7} strokeLinecap="round" transform="rotate(255)" />
        <line x1={0} y1={0} x2={0} y2={-40} stroke="#E0A800" strokeWidth={2.5} transform={`rotate(${Math.floor(t) * 6})`} />
        <circle r={6} fill={NAVY} />
      </g>
      {/* рисунки сына на стене */}
      <WallDrawing x={300} y={700} w={190} h={150} rot={-4} kind="sun" />
      <WallDrawing x={520} y={760} w={170} h={140} rot={3} kind="house" />
      <WallDrawing x={760} y={690} w={180} h={140} rot={-2} kind="car" />

      {/* торшер */}
      <g>
        <ellipse cx={210} cy={880} rx={520 * flick * lamp} ry={520 * flick * lamp} fill="url(#b12lamp)" />
        <rect x={204} y={900} width={12} height={560} fill="#7A5B3A" />
        <ellipse cx={210} cy={1462} rx={70} ry={14} fill="#7A5B3A" />
        <path d="M 130 900 L 290 900 L 255 780 L 165 780 Z" fill="#FFF1CF" />
        <path d="M 130 900 L 290 900" stroke="#E8C47A" strokeWidth={6} />
      </g>
      {/* растение */}
      <g transform="translate(1500 1430)">
        <path d="M -50 0 L 50 0 L 38 110 L -38 110 Z" fill="#E9E2D6" />
        {[-60, -30, 0, 25, 55].map((a, i) => (
          <ellipse key={i} cx={Math.sin((a * Math.PI) / 180) * 70} cy={-80 - (i % 2) * 30} rx={22} ry={70} fill={i % 2 ? "#5FA36E" : "#4D8F5E"} transform={`rotate(${a} ${Math.sin((a * Math.PI) / 180) * 70} ${-80 - (i % 2) * 30})`} />
        ))}
      </g>

      {/* диван */}
      <g>
        <ellipse cx={(R.sofaL + R.sofaR) / 2} cy={1528} rx={470} ry={26} fill="#000" opacity={0.12} />
        <rect x={R.sofaL + 20} y={1070} width={R.sofaR - R.sofaL - 40} height={300} rx={48} fill="url(#b12sofa)" />
        <rect x={R.sofaL + 60} y={1100} width={(R.sofaR - R.sofaL - 120) / 2 - 8} height={250} rx={40} fill="#8CA0C3" />
        <rect x={(R.sofaL + R.sofaR) / 2 + 8} y={1100} width={(R.sofaR - R.sofaL - 120) / 2 - 8} height={250} rx={40} fill="#8CA0C3" />
        {/* подушки */}
        <rect x={R.sofaL + 70} y={1160} width={130} height={120} rx={26} fill="#E58C6E" transform={`rotate(-8 ${R.sofaL + 135} 1220)`} />
        <rect x={R.sofaR - 200} y={1160} width={130} height={120} rx={26} fill="#FFFFFF" transform={`rotate(7 ${R.sofaR - 135} 1220)`} />
        <rect x={R.sofaL + 30} y={1330} width={R.sofaR - R.sofaL - 60} height={70} rx={26} fill="#93A7C9" />
        <rect x={R.sofaL + 10} y={1390} width={R.sofaR - R.sofaL - 20} height={120} rx={22} fill="#6A7FA6" />
        <rect x={R.sofaL - 40} y={1230} width={110} height={290} rx={44} fill="#7389B0" />
        <rect x={R.sofaR - 70} y={1230} width={110} height={290} rx={44} fill="#7389B0" />
        <rect x={R.sofaL + 20} y={1506} width={20} height={26} fill="#5B4632" />
        <rect x={R.sofaR - 40} y={1506} width={20} height={26} fill="#5B4632" />
      </g>
    </g>
  );
};

// Передний план: журнальный столик (на нём — книга и горшочек с цветком).
export const RoomFront: React.FC<{ readonly children?: React.ReactNode }> = ({ children }) => {
  const top = ROOM.tableTop;
  return (
    <g>
      <ellipse cx={840} cy={top + 196} rx={380} ry={20} fill="#000" opacity={0.12} />
      <rect x={520} y={top + 40} width={22} height={150} rx={6} fill="#8A6440" />
      <rect x={1140} y={top + 40} width={22} height={150} rx={6} fill="#8A6440" />
      <path d={`M 470 ${top} L 1210 ${top} L 1240 ${top + 46} L 440 ${top + 46} Z`} fill="#C99A68" />
      <rect x={440} y={top + 46} width={800} height={24} rx={6} fill="#A77B4F" />
      <g transform={`translate(1110 ${top + 22})`}>
        <path d="M -26 -6 L 26 -6 L 20 30 L -20 30 Z" fill="#FFFFFF" transform="translate(0 -30)" />
        <ellipse cx={-10} cy={-56} rx={10} ry={26} fill="#4D8F5E" transform="rotate(-20 -10 -56)" />
        <ellipse cx={10} cy={-58} rx={10} ry={26} fill="#5FA36E" transform="rotate(18 10 -58)" />
      </g>
      <g transform={`translate(560 ${top + 20}) rotate(-4)`}>
        <rect x={-50} y={-14} width={100} height={22} rx={3} fill={NAVY} />
        <rect x={-46} y={-20} width={96} height={10} rx={2} fill="#F6F0E4" />
      </g>
      {children}
    </g>
  );
};

// Тёплый свет и мягкая виньетка поверх кадра (экранные координаты).
export const WarmGrade: React.FC<{ readonly strength?: number }> = ({ strength = 1 }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <defs>
      <radialGradient id="b12vig" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#3A1E10" stopOpacity={0} />
        <stop offset="1" stopColor="#3A1E10" stopOpacity={0.38 * strength} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="#FFB567" opacity={0.06 * strength} />
    <rect width={1080} height={1920} fill="url(#b12vig)" />
  </svg>
);

export const fadeIn = (t: number, a: number, d = 0.4) => interpolate(t, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
