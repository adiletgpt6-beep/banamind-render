// Блокнот папы (№30) — один блокнот и одна тёмная ручка во всех сценах.
//
// NotebookTop — крупный план сверху: лист на пружине, рукописные строки.
// Строка проявляется слева направо вслед за кончиком ручки (u — доля
// написанного), поэтому кисть всегда у последней появившейся буквы; бумага
// неподвижна. Сразу после начала фильма на листе: «Дарек», «Убакыт»,
// «Каттам». Позже: «3 «Б»», «Спорт залдын чыгышы» и схема школы, затем
// вопросы для разговора (без галочек) и вопрос про машинку.
//
// NotebookFlat — тот же блокнот лежит на столе (вид спереди, чуть сверху).
import { C, F } from "../theme";

export const NB = {
  x0: 130,
  x1: 950,
  y0: 360,
  y1: 1640,
  textX: 190,
  size: 54,
  rows: {
    address: 470,
    time: 552,
    route: 634,
    classB: 760,
    gymExit: 842,
    q0: 990,
    q1: 1072,
    q2: 1154,
    q3: 1236,
    car: 1340,
  },
  map: { x: 560, y: 410, w: 360 },
} as const;

// Ширина строки на листе (оценка для положения кончика ручки).
export const nbTextW = (text: string) => text.length * NB.size * 0.56;
// Кончик ручки для строки text на высоте y при доле u.
export const nbPenTip = (text: string, y: number, u: number) => ({ x: NB.textX + nbTextW(text) * Math.max(0, Math.min(1, u)), y: y - NB.size * 0.25 });

export type NbLine = { readonly text: string; readonly y: number; readonly u: number };

const Spiral: React.FC = () => (
  <g>
    {Array.from({ length: 14 }).map((_, i) => (
      <g key={i}>
        <circle cx={NB.x0 + 40 + i * ((NB.x1 - NB.x0 - 80) / 13)} cy={NB.y0 - 6} r={13} fill="none" stroke="#8C93A0" strokeWidth={6} />
      </g>
    ))}
  </g>
);

export const NotebookTop: React.FC<{
  readonly lines: readonly NbLine[];
  readonly map?: number; // 0…1 — схема школы нарисована
  readonly mapHi?: number; // 0…1 — выход спортзала обведён
  readonly children?: React.ReactNode; // кисти, ручка (поверх листа)
}> = ({ lines, map = 0, mapHi = 0, children }) => {
  const m = NB.map;
  const k = m.w / 900;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        {lines.map((l, i) => (
          <clipPath key={i} id={`nbclip-${i}-${l.y}`}>
            <rect x={NB.textX - 10} y={l.y - NB.size} width={(nbTextW(l.text) + 30) * Math.max(0, Math.min(1, l.u))} height={NB.size * 1.5} />
          </clipPath>
        ))}
        <clipPath id="nbmap">
          <rect x={m.x - 10} y={m.y - 10} width={(m.w + 20) * map} height={m.w} />
        </clipPath>
      </defs>
      {/* обложка и лист */}
      <rect x={NB.x0 - 20} y={NB.y0 - 20} width={NB.x1 - NB.x0 + 40} height={NB.y1 - NB.y0 + 40} rx={22} fill="#2A3B5E" />
      <rect x={NB.x0} y={NB.y0} width={NB.x1 - NB.x0} height={NB.y1 - NB.y0} rx={8} fill="#FFFDF6" />
      {Array.from({ length: 15 }).map((_, i) => (
        <line key={i} x1={NB.x0 + 20} x2={NB.x1 - 20} y1={NB.y0 + 128 + i * 82} y2={NB.y0 + 128 + i * 82} stroke="#D9E4EE" strokeWidth={3} />
      ))}
      <line x1={NB.textX - 30} x2={NB.textX - 30} y1={NB.y0 + 10} y2={NB.y1 - 10} stroke="#F0C4C4" strokeWidth={3} />
      <Spiral />
      {/* строки */}
      {lines.map((l, i) =>
        l.u > 0 ? (
          <text key={i} x={NB.textX} y={l.y} clipPath={l.u >= 1 ? undefined : `url(#nbclip-${i}-${l.y})`} fontFamily={F.kid} fontWeight={700} fontSize={NB.size} fill={C.navy} transform={`rotate(-0.8 ${NB.textX} ${l.y})`}>
            {l.text}
          </text>
        ) : null,
      )}
      {/* схема школы: основной вход в центре здания, выход спортзала справа */}
      {map > 0 ? (
        <g clipPath="url(#nbmap)">
        <g transform={`translate(${m.x} ${m.y}) scale(${k})`}>
          <rect x={0} y={60} width={560} height={300} rx={8} fill="none" stroke={C.navy} strokeWidth={9} />
          <rect x={560} y={150} width={340} height={210} rx={8} fill="none" stroke={C.navy} strokeWidth={9} />
          <rect x={240} y={250} width={80} height={110} fill={C.navy} opacity={0.85} />
          <line x1={220} y1={374} x2={340} y2={374} stroke={C.navy} strokeWidth={7} />
          <rect x={760} y={265} width={64} height={95} fill="#C9733F" />
          <text x={730} y={120} textAnchor="middle" fontFamily={F.kid} fontWeight={800} fontSize={88} fill={C.navy}>Спорт зал</text>
        </g>
        </g>
      ) : null}
      {mapHi > 0 ? (
        <ellipse cx={m.x + 792 * k} cy={m.y + 312 * k} rx={96 * k} ry={88 * k} fill="none" stroke="#E2574C" strokeWidth={7} strokeDasharray={`${560 * k * mapHi} 900`} />
      ) : null}
      {children}
    </svg>
  );
};

// Ручка с кистью папы для крупного плана сверху: кончик в (x, y). Папа
// сидит у нижнего края кадра: ручка идёт от кончика вниз-вправо, через
// пальцы к кисти (кисть — penHand(x, y)).
export const PenInHand: React.FC<{ readonly x: number; readonly y: number; readonly lift?: number; readonly hand: React.ReactNode }> = ({ x, y, lift = 0, hand }) => (
  <g transform={`translate(0 ${-lift * 14})`}>
    <g transform={`translate(${x} ${y}) rotate(56)`}>
      <path d="M 0 0 L 22 -7 L 22 7 Z" fill="#C9CED6" />
      <rect x={22} y={-8} width={230} height={16} rx={6} fill="#1E2A44" />
      <rect x={200} y={-10} width={52} height={20} rx={6} fill="#2E3D5E" />
    </g>
    {hand}
  </g>
);
// Запястье и угол кисти (CloseHand, pinch) для кончика ручки в (x, y).
export const penHand = (x: number, y: number) => ({ x: x + 112, y: y + 176, angle: 147 });

// Блокнот на столе (вид спереди-сверху): тонкий прямоугольник с пружиной и
// парой строк. (x, y) — середина ближнего края.
export const NotebookFlat: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly rows?: number }> = ({ x, y, w = 190, rows = 3 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 - 14} ${y - 34} L ${x - w / 2 + 14} ${y - 34} Z`} fill="#2A3B5E" />
    <path d={`M ${x - w / 2 + 6} ${y - 3} L ${x + w / 2 - 6} ${y - 3} L ${x + w / 2 - 18} ${y - 31} L ${x - w / 2 + 18} ${y - 31} Z`} fill="#FFFDF6" />
    {Array.from({ length: Math.min(rows, 5) }).map((_, i) => (
      <line key={i} x1={x - w / 2 + 30 + i * 2} x2={x - w / 2 + 30 + i * 2 + w * (0.35 + ((i * 37) % 30) / 100)} y1={y - 26 + i * 5} y2={y - 26 + i * 5} stroke={C.navy} strokeWidth={2.5} opacity={0.7} />
    ))}
  </svg>
);
