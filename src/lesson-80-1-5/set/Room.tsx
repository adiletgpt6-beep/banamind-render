// Светлая учебная комната мечети (мир 1920×1080 при zoom 1): молочные
// стены, ковёр, доска слева, низкая полка с книгами, окно справа с обычным
// деревом за ним и ростком из фильма 4 на подоконнике, низкий столик.
// Размеры и расположение предметов постоянны во всех планах.
import { box } from "../shots";

export const ROOM = {
  horizon: 430,
  board: { x: 150, y: 48, w: 620, h: 280 },
  shelf: { x: 880, y: 196, w: 380, h: 234 },
  window: { x: 1400, y: 40, w: 360, h: 300, sill: 346 },
  sprout: { x: 1690, y: 346 }, // горшок стоит на подоконнике, справа
  table: { x: 610, y: 712, w: 760, d: 88, front: 40 },
  // места у столика (y — место на ковре; таз скрыт столешницей)
  seats: { teacher: { x: 540, y: 824 }, yusuf: { x: 790, y: 792 }, amir: { x: 975, y: 782 }, bilal: { x: 1160, y: 778 } },
  rows: { 1: { y: 634, x0: 410, x1: 1600 }, 2: { y: 556, x0: 330, x1: 1640 }, 3: { y: 492, x0: 440, x1: 1560 } },
  // предметы на столешнице (мировые px)
  props: { stack: { x: 698, y: 754 }, boatDry: { x: 868, y: 746 }, sheetDemo: { x: 790, y: 802 }, work: { x: 968, y: 760 }, basin: { x: 1105, y: 788 }, towel: { x: 1290, y: 752 } },
} as const;

// Масштаб глубины: ближе к камере (больше y) — крупнее.
export const depthK = (y: number) => 0.54 + (0.46 * (Math.min(y, 800) - ROOM.horizon)) / (ROOM.seats.amir.y - ROOM.horizon);

const WALL = "#F4EEE3";
const WALL_SHADE = "#EAE2D4";
const CARPET = "#8FA98B";
const CARPET_DARK = "#7B9477";
const WOOD = "#C9A67A";
const WOOD_DARK = "#A8865C";

// Задний план: стена, ковёр, доска, полка, окно.
export const RoomBack: React.FC<{ readonly board?: React.ReactNode; readonly f: number }> = ({ board, f }) => (
  <div style={box({ left: -400, top: -300, width: 2720, height: 1680 })}>
    <svg width={2720} height={1680} viewBox="-400 -300 2720 1680" style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="l815-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F8F3EA" />
          <stop offset="1" stopColor={WALL} />
        </linearGradient>
        <linearGradient id="l815-carpet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={CARPET_DARK} />
          <stop offset="1" stopColor={CARPET} />
        </linearGradient>
        <linearGradient id="l815-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFE4F2" />
          <stop offset="1" stopColor="#E6F0F5" />
        </linearGradient>
      </defs>
      <rect x={-400} y={-300} width={2720} height={ROOM.horizon + 300} fill="url(#l815-wall)" />
      {/* плинтус */}
      <rect x={-400} y={ROOM.horizon - 14} width={2720} height={14} fill={WALL_SHADE} />
      {/* пол и ковёр */}
      <rect x={-400} y={ROOM.horizon} width={2720} height={1380} fill="#D9CBB4" />
      <path d={`M 120 ${ROOM.horizon} L 1800 ${ROOM.horizon} L 2100 1380 L -180 1380 Z`} fill="url(#l815-carpet)" />
      <path d={`M 170 ${ROOM.horizon + 30} L 1750 ${ROOM.horizon + 30} L 2020 1340 L -100 1340 Z`} fill="none" stroke="#A9BFA3" strokeWidth={6} opacity={0.7} />
      <path d={`M 230 ${ROOM.horizon + 70} L 1690 ${ROOM.horizon + 70} L 1930 1300 L -20 1300 Z`} fill="none" stroke="#6E8A6B" strokeWidth={3} opacity={0.55} />
      {/* мягкий свет из окна на стене */}
      <ellipse cx={1580} cy={260} rx={520} ry={360} fill="#FFF8E8" opacity={0.35} />
      <Board f={f} />
      <Shelf />
      <Window f={f} />
    </svg>
    {/* рисунки на доске (React-содержимое) */}
    {board ? <div style={box({ left: 400 + ROOM.board.x + 16, top: 300 + ROOM.board.y + 16, width: ROOM.board.w - 32, height: ROOM.board.h - 32, overflow: "hidden" })}>{board}</div> : null}
  </div>
);

const Board: React.FC<{ f: number }> = () => {
  const b = ROOM.board;
  return (
    <g>
      <rect x={b.x - 10} y={b.y - 10} width={b.w + 20} height={b.h + 20} rx={10} fill={WOOD} />
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={4} fill="#3F6B5C" />
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={4} fill="url(#l815-wall)" opacity={0.05} />
      {/* полочка для мела */}
      <rect x={b.x + 60} y={b.y + b.h + 8} width={b.w - 120} height={10} rx={4} fill={WOOD_DARK} />
      <rect x={b.x + 90} y={b.y + b.h + 2} width={30} height={6} rx={3} fill="#FFFFFF" />
    </g>
  );
};

const Shelf: React.FC = () => {
  const s = ROOM.shelf;
  const books = [
    ["#5E7FB2", 30], ["#B86A62", 26], ["#D9B86A", 22], ["#4F8E8B", 34], ["#8E7CC3", 24], ["#C96F8A", 28], ["#6E9F6B", 30], ["#E0A35A", 22], ["#5E7FB2", 26], ["#A86B4F", 32],
  ] as const;
  const row = (y: number, offset: number) => {
    let x = s.x + 18 + offset;
    return books.map(([c, w], i) => {
      const h = 70 + ((i * 7) % 18);
      const el = <rect key={`${y}-${i}`} x={x} y={y - h} width={w} height={h} rx={3} fill={c} />;
      x += w + 6;
      return x < s.x + s.w - 20 ? el : null;
    });
  };
  return (
    <g>
      <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={6} fill={WOOD} />
      <rect x={s.x + 10} y={s.y + 10} width={s.w - 20} height={s.h - 20} fill="#E8D8BE" />
      {row(s.y + 104, 0)}
      <rect x={s.x + 10} y={s.y + 106} width={s.w - 20} height={10} fill={WOOD_DARK} />
      {row(s.y + 214, 14)}
      <rect x={s.x + 10} y={s.y + 216} width={s.w - 20} height={10} fill={WOOD_DARK} />
      {/* пара книг лежит плашмя */}
      <rect x={s.x + 250} y={s.y + 190} width={90} height={12} rx={3} fill="#B86A62" />
      <rect x={s.x + 258} y={s.y + 178} width={80} height={12} rx={3} fill="#4F8E8B" />
    </g>
  );
};

// Окно: дневной свет, обычное дерево во дворе, росток на подоконнике.
const Window: React.FC<{ f: number }> = ({ f }) => {
  const w = ROOM.window;
  const sway = Math.sin(f / 70) * 3;
  return (
    <g>
      <rect x={w.x - 12} y={w.y - 12} width={w.w + 24} height={w.h + 24} rx={8} fill="#FFFFFF" />
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="url(#l815-sky)" />
      {/* двор: трава и дерево */}
      <rect x={w.x} y={w.y + w.h * 0.72} width={w.w} height={w.h * 0.28} fill="#A8C98E" />
      <g transform={`translate(${w.x + w.w * 0.58} ${w.y + w.h * 0.74})`}>
        <path d={`M -14 0 L -10 -90 Q 0 -110 10 -90 L 14 0 Z`} fill="#7E5A3C" />
        <path d={`M -4 -70 Q -40 -95 -52 -120`} stroke="#7E5A3C" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d={`M 4 -80 Q 38 -100 50 -126`} stroke="#7E5A3C" strokeWidth={7} fill="none" strokeLinecap="round" />
        <g transform={`rotate(${sway * 0.4} 0 -120)`}>
          <ellipse cx={-30} cy={-140} rx={58} ry={46} fill="#6EA362" />
          <ellipse cx={34} cy={-150} rx={62} ry={50} fill="#79B06B" />
          <ellipse cx={2} cy={-186} rx={66} ry={50} fill="#86BB74" />
          <ellipse cx={0} cy={-150} rx={50} ry={40} fill="#8FC47E" />
        </g>
      </g>
      {/* рама */}
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="none" stroke="#FFFFFF" strokeWidth={12} />
      <rect x={w.x + w.w / 2 - 5} y={w.y} width={10} height={w.h} fill="#FFFFFF" />
      <rect x={w.x} y={w.y + w.h * 0.46} width={w.w} height={10} fill="#FFFFFF" />
      {/* подоконник */}
      <rect x={w.x - 26} y={w.sill - 6} width={w.w + 52} height={16} rx={4} fill="#FFFFFF" />
      <rect x={w.x - 26} y={w.sill + 10} width={w.w + 52} height={6} fill="#E3DCCF" />
      <Sprout x={ROOM.sprout.x} y={ROOM.sprout.y} f={f} />
    </g>
  );
};

// Росток из фильма 4: тот же терракотовый горшок, два листа, тот же размер.
export const Sprout: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const sway = Math.sin(f / 55) * 1.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -26 0 L -20 -44 L 20 -44 L 26 0 Z`} fill="#C8785A" />
      <rect x={-24} y={-50} width={48} height={10} rx={3} fill="#D98C6B" />
      <ellipse cx={0} cy={-44} rx={19} ry={4} fill="#5E4530" />
      <g transform={`rotate(${sway} 0 -44)`}>
        <path d={`M 0 -44 Q 2 -70 0 -92`} stroke="#5F9E4E" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={`M 0 -72 Q -24 -80 -28 -98 Q -8 -96 0 -72 Z`} fill="#79B86A" />
        <path d={`M 0 -82 Q 22 -92 28 -110 Q 8 -106 0 -82 Z`} fill="#86C274" />
      </g>
    </g>
  );
};

// Низкий столик: столешница (вид сверху-спереди) и передняя кромка.
// Рисуется двумя частями: Table (столешница) и TableFront (кромка) — между
// ними лежат предметы и руки.
export const TableTop: React.FC = () => {
  const t = ROOM.table;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={`M ${t.x + 30} ${t.y} L ${t.x + t.w - 30} ${t.y} L ${t.x + t.w} ${t.y + t.d} L ${t.x} ${t.y + t.d} Z`} fill="#D7B88E" />
      <path d={`M ${t.x + 30} ${t.y} L ${t.x + t.w - 30} ${t.y} L ${t.x + t.w} ${t.y + t.d} L ${t.x} ${t.y + t.d} Z`} fill="none" stroke="#C4A277" strokeWidth={3} />
      {/* лёгкая текстура дерева */}
      {[0.25, 0.5, 0.75].map((k) => (
        <path key={k} d={`M ${t.x + 30 - 30 * k + 4} ${t.y + t.d * k} L ${t.x + t.w - 30 + 30 * k - 4} ${t.y + t.d * k}`} stroke="#CFAE82" strokeWidth={2} opacity={0.6} />
      ))}
    </svg>
  );
};
export const TableFront: React.FC = () => {
  const t = ROOM.table;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <rect x={t.x} y={t.y + t.d} width={t.w} height={t.front} fill="#B8905F" />
      <rect x={t.x} y={t.y + t.d} width={t.w} height={8} fill="#C9A270" />
      {/* ножки */}
      <rect x={t.x + 26} y={t.y + t.d + t.front} width={26} height={46} rx={4} fill="#A17A4E" />
      <rect x={t.x + t.w - 52} y={t.y + t.d + t.front} width={26} height={46} rx={4} fill="#A17A4E" />
      <ellipse cx={t.x + t.w / 2} cy={t.y + t.d + t.front + 48} rx={t.w / 2 + 10} ry={16} fill="rgba(40,35,60,0.14)" />
    </svg>
  );
};

// Точка на столешнице (мировые px).
export const onTable = (x: number, y: number) => ({ x, y });
