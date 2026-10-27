// Светлая учебная комната мечети — постоянная планировка в мировых координатах
// (3200 × 1800). Все ракурсы фильма — камеры над этим же миром, поэтому
// предметы не меняют места между планами.
import React from "react";

export const WORLD = { w: 3200, h: 1800, floorY: 840 } as const;

export const LAYOUT = {
  window: { x: 170, y: 130, w: 500, h: 470 },
  sprout: { x: 585, y: 600 },
  board: { x: 1290, y: 270, w: 820, h: 390 },
  poster: { x: 1325, y: 290, w: 380, h: 360 }, // рисуется с масштабом 0,9
  // место нового листа на доске — рядом с плакатом, не поверх
  pinned: { x: 1765, y: 340, w: 240, h: 170 },
  quranShelf: { x: 960, y: 395, w: 210 },
  bookshelf: { x: 2600, y: 560, w: 520, h: 280 },
  sideTable: { x: 2150, y: 1000, w: 250 },
  table: { backY: 1150, frontY: 1300, backL: 1010, backR: 2010, frontL: 960, frontR: 2060 },
} as const;

const Wall: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="wallG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#F6EBD8" />
        <stop offset="0.5" stopColor="#F2E5CF" />
        <stop offset="1" stopColor="#EADBC2" />
      </linearGradient>
      <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#C99B6B" />
        <stop offset="1" stopColor="#D8AC7C" />
      </linearGradient>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#BFE0F2" />
        <stop offset="1" stopColor="#E7F4EE" />
      </linearGradient>
      <linearGradient id="lightG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF6DD" stopOpacity="0.55" />
        <stop offset="1" stopColor="#FFF6DD" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={WORLD.w} height={WORLD.floorY} fill="url(#wallG)" />
    {/* деревянная панель внизу стены */}
    <rect x={0} y={WORLD.floorY - 150} width={WORLD.w} height={150} fill="#E2C8A2" />
    <rect x={0} y={WORLD.floorY - 156} width={WORLD.w} height={10} fill="#CDAA7C" />
    {Array.from({ length: 20 }, (_, i) => (
      <line key={i} x1={i * 165 + 60} y1={WORLD.floorY - 140} x2={i * 165 + 60} y2={WORLD.floorY - 6} stroke="#D3B68C" strokeWidth={3} />
    ))}
    <rect x={0} y={WORLD.floorY - 8} width={WORLD.w} height={10} fill="#B98C5E" />
    {/* пол */}
    <rect x={0} y={WORLD.floorY} width={WORLD.w} height={WORLD.h - WORLD.floorY} fill="url(#floorG)" />
    {Array.from({ length: 14 }, (_, i) => (
      <line key={i} x1={-400 + i * 300} y1={WORLD.h} x2={600 + i * 150} y2={WORLD.floorY} stroke="#BE8F60" strokeWidth={2} opacity={0.5} />
    ))}
  </g>
);

const Carpet: React.FC = () => (
  <g>
    <path d={`M 90 900 L 3110 900 L 3330 1800 L -130 1800 Z`} fill="#B5564A" />
    <path d={`M 140 925 L 3060 925 L 3270 1800 L -70 1800 Z`} fill="#E9D6B2" />
    <path d={`M 175 945 L 3025 945 L 3225 1800 L -25 1800 Z`} fill="#C9665A" />
    <path d={`M 215 968 L 2985 968 L 3175 1800 L 25 1800 Z`} fill="#D9A27E" />
    <path d={`M 255 990 L 2945 990 L 3130 1800 L 70 1800 Z`} fill="#E8C9A0" />
    {/* мягкий орнамент */}
    {Array.from({ length: 13 }, (_, i) => {
      const x = 300 + i * 215;
      return <path key={i} d={`M ${x} 957 l 18 -9 l 18 9 l -18 9 Z`} fill="#F1E1C4" opacity={0.9} />;
    })}
    <ellipse cx={1600} cy={1390} rx={720} ry={260} fill="#E2BC8E" opacity={0.55} />
    <ellipse cx={1600} cy={1390} rx={560} ry={190} fill="none" stroke="#C9806A" strokeWidth={6} opacity={0.35} />
    {/* мягкий свет из окна на ковре — обычное освещение */}
    <path d="M 160 940 L 700 940 L 1300 1650 L 400 1650 Z" fill="url(#lightG)" opacity={0.55} />
  </g>
);

const Window: React.FC<{ frame: number }> = ({ frame }) => {
  const { x, y, w, h } = LAYOUT.window;
  const sway = Math.sin(frame / 55) * 2.5;
  return (
    <g>
      <rect x={x - 18} y={y - 18} width={w + 36} height={h + 36} rx={10} fill="#FBF7EE" />
      <clipPath id="winClip">
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <g clipPath="url(#winClip)">
        <rect x={x} y={y} width={w} height={h} fill="url(#skyG)" />
        <ellipse cx={x + 380} cy={y + 120} rx={90} ry={26} fill="#FFFFFF" opacity={0.8} />
        <ellipse cx={x + 130} cy={y + 80} rx={70} ry={20} fill="#FFFFFF" opacity={0.7} />
        <path d={`M ${x - 20} ${y + 330} Q ${x + 150} ${y + 260} ${x + 300} ${y + 320} T ${x + w + 30} ${y + 300} L ${x + w + 30} ${y + h} L ${x - 20} ${y + h} Z`} fill="#A9CF96" />
        <path d={`M ${x - 20} ${y + 390} Q ${x + 200} ${y + 350} ${x + w + 30} ${y + 400} L ${x + w + 30} ${y + h} L ${x - 20} ${y + h} Z`} fill="#8DBE7B" />
        {/* дерево за окном */}
        <path d={`M ${x + 300} ${y + h} L ${x + 312} ${y + 250} L ${x + 330} ${y + 250} L ${x + 345} ${y + h} Z`} fill="#8A6244" />
        <path d={`M ${x + 320} ${y + 300} L ${x + 270} ${y + 230} M ${x + 324} ${y + 290} L ${x + 380} ${y + 225}`} stroke="#8A6244" strokeWidth={12} strokeLinecap="round" />
        <g transform={`translate(${sway} 0)`}>
          <circle cx={x + 320} cy={y + 170} r={115} fill="#5FA864" />
          <circle cx={x + 235} cy={y + 215} r={78} fill="#6DB56E" />
          <circle cx={x + 405} cy={y + 210} r={82} fill="#57A05C" />
          <circle cx={x + 300} cy={y + 110} r={70} fill="#79C07A" />
          <circle cx={x + 360} cy={y + 140} r={50} fill="#86C886" opacity={0.8} />
        </g>
      </g>
      {/* рама */}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#F4EEE1" strokeWidth={14} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#F4EEE1" strokeWidth={12} />
      <line x1={x} y1={y + h * 0.45} x2={x + w} y2={y + h * 0.45} stroke="#F4EEE1" strokeWidth={12} />
      <rect x={x - 30} y={y + h + 2} width={w + 60} height={22} rx={4} fill="#F7F2E6" />
      <rect x={x - 30} y={y + h + 22} width={w + 60} height={6} fill="#DCCFB6" />
    </g>
  );
};

// Здоровый росток в горшке и карточка «Проверить росток».
const Sprout: React.FC<{ frame: number }> = ({ frame }) => {
  const { x, y } = LAYOUT.sprout;
  const s = Math.sin(frame / 40) * 1.5;
  return (
    <g>
      <path d={`M ${x - 34} ${y - 50} L ${x + 34} ${y - 50} L ${x + 26} ${y} L ${x - 26} ${y} Z`} fill="#C8744E" />
      <rect x={x - 38} y={y - 58} width={76} height={12} rx={4} fill="#B5643F" />
      <path d={`M ${x} ${y - 56} Q ${x + 2 + s} ${y - 95} ${x + s} ${y - 125}`} stroke="#4E9A4E" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M ${x + s * 0.7} ${y - 100} Q ${x - 30} ${y - 120} ${x - 38} ${y - 98} Q ${x - 18} ${y - 88} ${x + s * 0.7} ${y - 100} Z`} fill="#62B35E" />
      <path d={`M ${x + s} ${y - 118} Q ${x + 34} ${y - 140} ${x + 40} ${y - 116} Q ${x + 20} ${y - 104} ${x + s} ${y - 118} Z`} fill="#6FC06A" />
      <path d={`M ${x + s * 0.5} ${y - 80} Q ${x + 26} ${y - 92} ${x + 30} ${y - 74} Q ${x + 14} ${y - 68} ${x + s * 0.5} ${y - 80} Z`} fill="#58A955" />
      {/* карточка */}
      <g transform={`translate(${x - 150} ${y - 74}) rotate(-4)`}>
        <rect x={0} y={0} width={104} height={64} rx={6} fill="#FFFDF6" stroke="#D8CCB4" strokeWidth={2} />
        <text x={52} y={27} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={16} fill="#3F5E3A">
          Проверить
        </text>
        <text x={52} y={48} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={16} fill="#3F5E3A">
          росток
        </text>
      </g>
    </g>
  );
};

// Доска с общим плакатом «Аллах — наш Создатель» (детская работа: природа).
const Board: React.FC = () => {
  const b = LAYOUT.board;
  const p = LAYOUT.poster;
  return (
    <g>
      <rect x={b.x + 8} y={b.y + 10} width={b.w} height={b.h} rx={8} fill="rgba(90,60,30,0.15)" />
      <rect x={b.x - 14} y={b.y - 14} width={b.w + 28} height={b.h + 28} rx={10} fill="#B58A5C" />
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={4} fill="#F3F1EA" />
      <rect x={b.x + 20} y={b.y + b.h - 6} width={b.w - 40} height={16} rx={4} fill="#A47A4D" />
      <rect x={b.x + 600} y={b.y + b.h - 14} width={60} height={10} rx={3} fill="#3B5D9E" />
      {/* плакат */}
      <g transform={`translate(${p.x} ${p.y}) scale(0.9) translate(${-p.x} ${-p.y})`}>
        <rect x={p.x + 5} y={p.y + 6} width={p.w} height={p.h} fill="rgba(80,60,40,0.18)" />
        <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#FFFBEF" />
        <text x={p.x + p.w / 2} y={p.y + 62} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={46} fill="#2E5A8F">
          Аллах —
        </text>
        <text x={p.x + p.w / 2} y={p.y + 116} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={42} fill="#2E5A8F">
          наш Создатель
        </text>
        <clipPath id="posterArt">
          <rect x={p.x + 20} y={p.y + 140} width={p.w - 40} height={p.h - 160} rx={10} />
        </clipPath>
        <g clipPath="url(#posterArt)">
          <rect x={p.x + 20} y={p.y + 140} width={p.w - 40} height={p.h - 160} fill="#DDF0F7" />
          <path d={`M ${p.x + 10} ${p.y + 290} L ${p.x + 110} ${p.y + 190} L ${p.x + 190} ${p.y + 260} L ${p.x + 260} ${p.y + 200} L ${p.x + 380} ${p.y + 300} L ${p.x + 380} ${p.y + 360} L ${p.x + 10} ${p.y + 360} Z`} fill="#9DB7C9" />
          <path d={`M ${p.x + 90} ${p.y + 210} L ${p.x + 110} ${p.y + 190} L ${p.x + 128} ${p.y + 207} Z`} fill="#FFFFFF" />
          <path d={`M ${p.x + 10} ${p.y + 300} Q ${p.x + 190} ${p.y + 270} ${p.x + 380} ${p.y + 305} L ${p.x + 380} ${p.y + 360} L ${p.x + 10} ${p.y + 360} Z`} fill="#8CC77C" />
          <circle cx={p.x + 300} cy={p.y + 180} r={22} fill="#F7D560" />
          <rect x={p.x + 70} y={p.y + 255} width={8} height={40} fill="#8A6244" />
          <circle cx={p.x + 74} cy={p.y + 248} r={24} fill="#5FA864" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <line x1={p.x + 150 + i * 40} y1={p.y + 330} x2={p.x + 150 + i * 40} y2={p.y + 312} stroke="#4E8F45" strokeWidth={3} />
              <circle cx={p.x + 150 + i * 40} cy={p.y + 309} r={6} fill={["#F08A8A", "#F7D560", "#B79AE0", "#F2A65A"][i]} />
            </g>
          ))}
          <path d={`M ${p.x + 200} ${p.y + 175} q 8 -6 16 0 q 8 -6 16 0`} stroke="#5C6F80" strokeWidth={3} fill="none" />
        </g>
        {/* кнопки */}
        <circle cx={p.x + 14} cy={p.y + 12} r={7} fill="#D2463F" />
        <circle cx={p.x + p.w - 14} cy={p.y + 12} r={7} fill="#D2463F" />
      </g>
    </g>
  );
};

// Коран на отдельной подставке на настенной полке — вдали от воды.
const QuranShelf: React.FC = () => {
  const q = LAYOUT.quranShelf;
  return (
    <g>
      <rect x={q.x} y={q.y} width={q.w} height={16} rx={3} fill="#B58A5C" />
      <path d={`M ${q.x + 20} ${q.y + 16} L ${q.x + 34} ${q.y + 50} L ${q.x + 42} ${q.y + 16} Z`} fill="#A47A4D" />
      <path d={`M ${q.x + q.w - 20} ${q.y + 16} L ${q.x + q.w - 34} ${q.y + 50} L ${q.x + q.w - 42} ${q.y + 16} Z`} fill="#A47A4D" />
      {/* подставка-рехал */}
      <path d={`M ${q.x + 50} ${q.y} L ${q.x + 150} ${q.y - 95} M ${q.x + 160} ${q.y} L ${q.x + 60} ${q.y - 95}`} stroke="#9A6B40" strokeWidth={10} strokeLinecap="round" />
      {/* закрытая книга в зелёной обложке */}
      <g transform={`translate(${q.x + 105} ${q.y - 82})`}>
        <path d="M -66 0 L -6 -18 L -6 44 L -66 62 Z" fill="#2F7A56" />
        <path d="M 66 0 L 6 -18 L 6 44 L 66 62 Z" fill="#2B6F4F" />
        <path d="M -6 -18 Q 0 -22 6 -18 L 6 44 Q 0 40 -6 44 Z" fill="#225C41" />
        <path d="M -56 8 L -14 -5 L -14 38 L -56 51 Z" fill="none" stroke="#D9B65A" strokeWidth={2.5} />
        <path d="M 56 8 L 14 -5 L 14 38 L 56 51 Z" fill="none" stroke="#D9B65A" strokeWidth={2.5} />
      </g>
    </g>
  );
};

// Низкая книжная полка: книги стоят; сверху закрытая коробка с деталями,
// бумажная лодочка и папка — на прежних местах.
const Bookshelf: React.FC = () => {
  const s = LAYOUT.bookshelf;
  const books = ["#3E78C9", "#D2463F", "#4FA36B", "#E5B23A", "#8A5A3B", "#7E64B5", "#2F8C8C", "#C96F53", "#5E7B9A", "#D9A441", "#4B6E3A", "#B04F5E"];
  return (
    <g>
      <rect x={s.x - 6} y={s.y} width={s.w + 12} height={s.h} rx={6} fill="#B58A5C" />
      <rect x={s.x + 12} y={s.y + 18} width={s.w - 24} height={118} fill="#8C6440" />
      <rect x={s.x + 12} y={s.y + 150} width={s.w - 24} height={112} fill="#8C6440" />
      {books.map((c, i) => (
        <rect key={i} x={s.x + 20 + i * 39} y={s.y + 30 + (i % 3) * 6} width={32} height={104 - (i % 3) * 6} rx={3} fill={c} />
      ))}
      {books.slice(0, 11).map((c, i) => (
        <rect key={`b${i}`} x={s.x + 24 + i * 43} y={s.y + 160 + (i % 2) * 8} width={36} height={100 - (i % 2) * 8} rx={3} fill={books[(i + 5) % books.length]} />
      ))}
      {/* закрытая коробка с шестью деревянными деталями */}
      <g transform={`translate(${s.x + 30} ${s.y - 62})`}>
        <rect x={0} y={10} width={150} height={52} rx={4} fill="#C99A62" />
        <rect x={-6} y={0} width={162} height={18} rx={4} fill="#B98950" />
        <rect x={60} y={28} width={30} height={14} rx={3} fill="#E9D5B3" />
      </g>
      {/* бумажная лодочка */}
      <g transform={`translate(${s.x + 250} ${s.y - 4})`}>
        <path d="M -48 -26 L 48 -26 L 32 0 L -32 0 Z" fill="#F7F7F2" stroke="#C9C4B6" strokeWidth={2} />
        <path d="M -20 -26 L 0 -62 L 20 -26 Z" fill="#EDEDE6" stroke="#C9C4B6" strokeWidth={2} />
      </g>
      {/* папка */}
      <g transform={`translate(${s.x + 350} ${s.y - 16})`}>
        <rect x={0} y={0} width={140} height={16} rx={3} fill="#3B6FB0" />
        <rect x={6} y={-6} width={126} height={8} rx={2} fill="#F2F0E8" />
      </g>
    </g>
  );
};

export const RoomBack: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <Wall />
    <Window frame={frame} />
    <Sprout frame={frame} />
    <Board />
    <QuranShelf />
    <Bookshelf />
    <Carpet />
  </g>
);

// Низкий столик (рисуется после сидящих за ним детей, до их рук).
export const MainTable: React.FC = () => {
  const t = LAYOUT.table;
  return (
    <g>
      <ellipse cx={(t.frontL + t.frontR) / 2} cy={t.frontY + 75} rx={(t.frontR - t.frontL) * 0.56} ry={30} fill="rgba(70,40,20,0.2)" />
      <rect x={t.frontL + 30} y={t.frontY} width={24} height={70} fill="#9A6A3F" />
      <rect x={t.frontR - 54} y={t.frontY} width={24} height={70} fill="#9A6A3F" />
      <path d={`M ${t.frontL} ${t.frontY} L ${t.frontR} ${t.frontY} L ${t.frontR} ${t.frontY + 34} L ${t.frontL} ${t.frontY + 34} Z`} fill="#B47C49" />
      <path d={`M ${t.backL} ${t.backY} L ${t.backR} ${t.backY} L ${t.frontR} ${t.frontY} L ${t.frontL} ${t.frontY} Z`} fill="#DDB07A" />
      <path d={`M ${t.backL + 60} ${t.backY + 30} L ${t.backR - 120} ${t.backY + 30}`} stroke="#E8C496" strokeWidth={6} opacity={0.7} />
      <path d={`M ${t.backL + 20} ${t.backY + 95} L ${t.backR - 40} ${t.backY + 95}`} stroke="#CFA06B" strokeWidth={3} opacity={0.6} />
      <path d={`M ${t.frontL} ${t.frontY} L ${t.frontR} ${t.frontY}`} stroke="#C99560" strokeWidth={4} />
    </g>
  );
};

// Столик с запасом питьевой воды: два полных кувшина (один учитель берёт)
// и поднос с чистыми стаканами донышком вверх.
export const SideTableBase: React.FC = () => {
  const s = LAYOUT.sideTable;
  return (
    <g>
      <ellipse cx={s.x + s.w / 2} cy={s.y + 92} rx={s.w * 0.6} ry={16} fill="rgba(70,40,20,0.18)" />
      <rect x={s.x + 14} y={s.y + 14} width={16} height={78} fill="#9A6A3F" />
      <rect x={s.x + s.w - 30} y={s.y + 14} width={16} height={78} fill="#9A6A3F" />
      <path d={`M ${s.x - 10} ${s.y - 30} L ${s.x + s.w + 10} ${s.y - 30} L ${s.x + s.w + 20} ${s.y} L ${s.x - 20} ${s.y} Z`} fill="#DDB07A" />
      <rect x={s.x - 20} y={s.y} width={s.w + 40} height={18} fill="#B47C49" />
      {/* салфетка и поднос */}
      <path d={`M ${s.x + 120} ${s.y - 22} L ${s.x + 228} ${s.y - 22} L ${s.x + 236} ${s.y - 4} L ${s.x + 112} ${s.y - 4} Z`} fill="#F4EFE4" />
    </g>
  );
};

// Стопка чистых запасных стаканов на подносе.
export const SpareCups: React.FC = () => {
  const s = LAYOUT.sideTable;
  const cup = (x: number, y: number, k: string) => (
    <path key={k} d={`M ${x - 13} ${y - 34} L ${x + 13} ${y - 34} L ${x + 16} ${y} L ${x - 16} ${y} Z`} fill="rgba(222,238,245,0.6)" stroke="rgba(120,150,165,0.9)" strokeWidth={1.6} />
  );
  return (
    <g>
      {[0, 1, 2].map((i) => cup(s.x + 140 + i * 34, s.y - 8, `a${i}`))}
      {[0, 1].map((i) => cup(s.x + 157 + i * 34, s.y - 42, `b${i}`))}
    </g>
  );
};
