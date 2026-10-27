// Реквизит фильма 80-1-13 в комнате серии (px мира, одни и те же координаты
// во всех планах): низкая открытая полка (два отделения верхнего яруса для
// ключевых книжек, верхняя доска для коробки, нижний ярус — обычные книги
// класса и закрытая папка «Наши вопросы»); четыре обычные детские книжки с
// картинками (без надписей и без священного текста); коробка от деревянной
// картинки с крышкой; бумажная лодочка; карандаши на ковре; карточки задания
// на полочке доски; книга Билала. Остальная обстановка — из 80-1-12 (дверь,
// плакат, полочка с Кораном на стене, столик с ростком и карточкой, стол).
import { fontFamily } from "../../fonts";
import { PaperBoat } from "../film-1-7/set";
import { BOX, planeToRoom, TABLE_PLANE } from "../film-1-12/puzzle";
import type { BookState, BoxState, CardState } from "./choreo";
import { BOOK, BOOK_COLORS, COMP, SHELF, SHELF_TOP_Y, SHELF_UP_Y, TABLE, type BookId } from "./layout";
import { TEXTS } from "./script";

const WOOD = "#8A6240";
const WOOD_DARK = "#6E4C31";
const WOOD_LIGHT = "#B58A5E";
const svgAbs = { position: "absolute", left: 0, top: 0, overflow: "visible" } as const;
const FS = TABLE_PLANE.fs;

// ---------- книжка ----------
// Простой рисунок на обложке (солнце, холм, облако — у каждой свой), без букв.
const CoverArt: React.FC<{ readonly id: BookId; readonly w: number; readonly h: number }> = ({ id, w, h }) => {
  const c = BOOK_COLORS[id];
  switch (id) {
    case "green":
      return (
        <g>
          <circle cx={w * 0.66} cy={h * 0.3} r={w * 0.12} fill={c.art} />
          <path d={`M ${w * 0.12} ${h * 0.82} Q ${w * 0.4} ${h * 0.52} ${w * 0.88} ${h * 0.8} Z`} fill={c.dark} />
        </g>
      );
    case "blue":
      return (
        <g>
          <ellipse cx={w * 0.45} cy={h * 0.36} rx={w * 0.22} ry={h * 0.08} fill={c.art} />
          <path d={`M ${w * 0.14} ${h * 0.8} L ${w * 0.86} ${h * 0.8}`} stroke={c.art} strokeWidth={h * 0.05} strokeLinecap="round" opacity={0.8} />
        </g>
      );
    case "orange":
      return (
        <g>
          <circle cx={w * 0.5} cy={h * 0.44} r={w * 0.2} fill={c.art} />
          <path d={`M ${w * 0.5} ${h * 0.24} l 0 ${-h * 0.06}`} stroke="#6E8F3E" strokeWidth={2} />
        </g>
      );
    default:
      return (
        <g>
          <path d={`M ${w * 0.18} ${h * 0.7} L ${w * 0.5} ${h * 0.3} L ${w * 0.82} ${h * 0.7} Z`} fill={c.art} />
          <rect x={w * 0.42} y={h * 0.58} width={w * 0.16} height={h * 0.12} fill={c.dark} />
        </g>
      );
  }
};

// Книжка: стоит (up = 1) — обложка лицом к комнате; лежит (up = 0) — видна
// сверху, сжата по глубине, снизу — торец страниц. Между ними — поворот.
// (x, y) — середина нижнего края.
export const BookView: React.FC<{ readonly b: BookState }> = ({ b }) => {
  const c = BOOK_COLORS[b.id];
  const w = BOOK.w;
  const hh = BOOK.h * (FS + (1 - FS) * b.up);
  const edge = BOOK.t * (1 - b.up) + 1.2;
  const x0 = b.x - w / 2;
  const top = b.y - edge - hh;
  return (
    <svg width={1} height={1} style={svgAbs}>
      {b.where === "floor" || b.where === "table" ? <ellipse cx={b.x} cy={b.y + 1} rx={w * 0.56} ry={4} fill="#3A2614" opacity={0.16} /> : null}
      <g transform={`rotate(${b.tilt} ${b.x} ${b.y})`}>
        {/* торец страниц (виден, пока книжка лежит) */}
        <rect x={x0 + 1} y={b.y - edge} width={w - 2} height={edge} fill="#F4EFE4" stroke={c.dark} strokeWidth={0.8} />
        <rect x={x0} y={top} width={w} height={hh} rx={2.5} fill={c.cover} stroke={c.dark} strokeWidth={1.2} />
        {/* корешок */}
        <rect x={x0} y={top} width={5} height={hh} rx={2} fill={c.dark} opacity={0.7} />
        <g transform={`translate(${x0 + 4} ${top}) scale(${(w - 6) / w} ${hh / BOOK.h})`}>
          <CoverArt id={b.id} w={w} h={BOOK.h} />
        </g>
      </g>
    </svg>
  );
};

// ---------- низкая полка ----------
// Обычные книги класса в нижнем ярусе (корешки приглушённых цветов, не похожие
// на четыре ключевые книжки) и закрытая папка «Наши вопросы».
const CLASS_BOOKS = [
  ["#7B6A8C", 12],
  ["#5E7A6B", 10],
  ["#8C6E52", 14],
  ["#6D7F96", 11],
  ["#9A8A6A", 12],
  ["#6E5F55", 10],
  ["#7F9488", 13],
] as const;
export const LowShelf: React.FC<{ readonly books: readonly BookState[]; readonly box: BoxState }> = ({ books, box }) => {
  const s = SHELF;
  const yFloor = s.floor;
  const yLowTop = yFloor - s.lowTop;
  const yUpBottom = SHELF_UP_Y;
  const yUpTop = yFloor - s.upTop;
  const yTop = SHELF_TOP_Y;
  const w = s.x2 - s.x1;
  const onShelf = books.filter((b) => b.where === "shelf").sort((a, b2) => a.x - b2.x);
  return (
    <svg width={1} height={1} style={svgAbs}>
      {/* тень на ковре */}
      <ellipse cx={(s.x1 + s.x2) / 2} cy={yFloor + 2} rx={w * 0.56} ry={9} fill="#2A140C" opacity={0.2} />
      {/* задняя стенка */}
      <rect x={s.x1 + 6} y={yTop + 10} width={w - 12} height={yFloor - yTop - 12} fill="#9C7650" />
      <rect x={s.x1 + 6} y={yUpTop} width={w - 12} height={yUpBottom - yUpTop} fill="#A98259" />
      {/* нижний ярус: книги класса */}
      {CLASS_BOOKS.map(([col, bw], i) => {
        const x = s.x1 + 18 + CLASS_BOOKS.slice(0, i).reduce((a, [, v]) => a + v + 2, 0);
        const hgt = 70 + ((i * 7) % 3) * 6;
        return <rect key={i} x={x} y={yLowTop + 8 + (82 - hgt)} width={bw} height={hgt} rx={1.5} fill={col} stroke="rgba(0,0,0,0.18)" strokeWidth={0.8} />;
      })}
      {/* папка «Наши вопросы» — закрыта, стоит лицом к комнате */}
      <g transform={`translate(${s.x1 + 132} ${yLowTop + 10})`}>
        <rect x={0} y={0} width={78} height={80} rx={3} fill="#E9C46A" stroke="#C49A3A" strokeWidth={1.4} />
        <rect x={0} y={0} width={7} height={80} rx={2} fill="#C49A3A" />
        <rect x={14} y={22} width={58} height={34} rx={2} fill="#FFFBF0" stroke="#D9C38A" strokeWidth={0.8} />
        <text x={43} y={36} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={11.5} fill="#5B4A1E">
          {TEXTS.folder[0]}
        </text>
        <text x={43} y={50} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={11.5} fill="#5B4A1E">
          {TEXTS.folder[1]}
        </text>
      </g>
      {/* ключевые книжки в верхнем ярусе */}
      {onShelf.map((b) => (
        <ShelfBook key={b.id} b={b} />
      ))}
      {/* каркас: боковины, доски, перегородка, цоколь */}
      <rect x={s.x1} y={yTop} width={12} height={yFloor - yTop} rx={2} fill={WOOD} />
      <rect x={s.x2 - 12} y={yTop} width={12} height={yFloor - yTop} rx={2} fill={WOOD} />
      <rect x={s.mid - 5} y={yUpTop} width={10} height={yUpBottom - yUpTop} fill={WOOD} />
      <rect x={s.x1 - 6} y={yTop} width={w + 12} height={14} rx={3} fill={WOOD_LIGHT} />
      <rect x={s.x1 - 6} y={yTop + 11} width={w + 12} height={3} fill={WOOD_DARK} opacity={0.5} />
      <rect x={s.x1} y={yUpBottom} width={w} height={8} fill={WOOD_LIGHT} />
      <rect x={s.x1} y={yFloor - s.plinth} width={w} height={s.plinth} rx={2} fill={WOOD_DARK} />
      <rect x={s.x1} y={yLowTop} width={w} height={8} fill={WOOD_LIGHT} opacity={0.9} />
      {/* коробка на верхней доске */}
      {box.where === "shelf" ? <ClosedBox x={box.x} y={box.y} /> : null}
    </svg>
  );
};
const ShelfBook: React.FC<{ readonly b: BookState }> = ({ b }) => {
  const c = BOOK_COLORS[b.id];
  const x0 = b.x - BOOK.w / 2;
  const top = b.y - BOOK.h;
  return (
    <g>
      <rect x={x0 + 3} y={top + 2} width={BOOK.w} height={BOOK.h} rx={2.5} fill="#000" opacity={0.14} />
      <rect x={x0} y={top} width={BOOK.w} height={BOOK.h} rx={2.5} fill={c.cover} stroke={c.dark} strokeWidth={1.2} />
      <rect x={x0} y={top} width={5} height={BOOK.h} rx={2} fill={c.dark} opacity={0.7} />
      <g transform={`translate(${x0 + 4} ${top}) scale(${(BOOK.w - 6) / BOOK.w} 1)`}>
        <CoverArt id={b.id} w={BOOK.w} h={BOOK.h} />
      </g>
    </g>
  );
};
export { COMP };

// ---------- коробка ----------
// Закрытая коробка (в руках, на полке): передняя стенка с наклейкой, крышка
// чуть шире стенок; (x, y) — середина нижнего края.
export const ClosedBox: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => {
  const hw = BOX.w / 2;
  const H = BOX.h;
  const topD = BOX.d * FS;
  return (
    <g>
      <ellipse cx={x} cy={y + 1} rx={hw * 0.95} ry={4} fill="#3A2614" opacity={0.18} />
      {/* верх крышки (виден сверху, сжат) */}
      <path d={`M ${x - hw - 2} ${y - H - 2} L ${x - hw + 4} ${y - H - 2 - topD} L ${x + hw - 4} ${y - H - 2 - topD} L ${x + hw + 2} ${y - H - 2} Z`} fill="#EBCB95" stroke="#B98F5B" strokeWidth={1.2} />
      {/* стенка */}
      <rect x={x - hw} y={y - H} width={BOX.w} height={H} fill="#E2BE86" stroke="#B98F5B" strokeWidth={1.5} rx={2} />
      {/* обод крышки */}
      <rect x={x - hw - 2} y={y - H - 3} width={BOX.w + 4} height={9} rx={2} fill="#E8C690" stroke="#B98F5B" strokeWidth={1.2} />
      <BoxSticker x={x} y={y - H + 9} />
    </g>
  );
};
const BoxSticker: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <g transform={`translate(${x - 20} ${y})`}>
    <rect width={40} height={17} rx={2} fill="#D9EEF2" stroke="#9FB6CE" strokeWidth={0.8} />
    <rect y={12} width={40} height={5} fill="#86BC60" />
    <rect x={8} y={6} width={3} height={8} fill="#8A5B3C" />
    <circle cx={9.5} cy={6} r={5} fill="#58A44C" />
    <path d="M 11 8 L 34 6" stroke="#7A4E31" strokeWidth={1.4} />
    <circle cx={30} cy={4.6} r={2} fill="#8A5B3C" />
  </g>
);

// Коробка на столе (вид из комнаты): открытая — дальняя стенка изнутри и дно,
// затем то, что внутри (inner), затем передняя стенка; закрытая — с крышкой.
export const TableBox: React.FC<{ readonly b: BoxState; readonly inner?: React.ReactNode }> = ({ b, inner }) => {
  const hw = BOX.w / 2;
  const front = planeToRoom(TABLE.top, b.u, b.w - BOX.d / 2);
  const back = planeToRoom(TABLE.top, b.u, b.w + BOX.d / 2);
  const H = BOX.h;
  if (b.lid.on) return <ClosedBox x={b.u} y={front.y} />;
  return (
    <g>
      <ellipse cx={b.u} cy={front.y + 1} rx={hw * 0.95} ry={4} fill="#3A2614" opacity={0.16} />
      <path d={`M ${b.u - hw + 3} ${back.y - H} L ${b.u + hw - 3} ${back.y - H} L ${b.u + hw - 3} ${back.y - 2} L ${b.u - hw + 3} ${back.y - 2} Z`} fill="#C99E66" />
      <path d={`M ${b.u - hw + 4} ${back.y - 2} L ${b.u + hw - 4} ${back.y - 2} L ${b.u + hw - 4} ${front.y - H + 3} L ${b.u - hw + 4} ${front.y - H + 3} Z`} fill="#B98F5B" />
      {inner}
      <rect x={b.u - hw} y={front.y - H} width={BOX.w} height={H} fill="#E2BE86" stroke="#B98F5B" strokeWidth={1.5} rx={2} />
      <rect x={b.u - hw} y={front.y - H} width={BOX.w} height={4} fill="#EED3A6" />
      <BoxSticker x={b.u} y={front.y - H + 7} />
    </g>
  );
};

// Крышка (лежит на столе или в руках, пока не надета): верх сжат по глубине и обод.
export const RoomLid: React.FC<{ readonly u: number; readonly w: number; readonly z: number }> = ({ u, w, z }) => {
  const hw = BOX.w / 2 + 2;
  const f = planeToRoom(TABLE.top, u, w - BOX.d / 2 - 2, z);
  const k = planeToRoom(TABLE.top, u, w + BOX.d / 2 + 2, z);
  return (
    <g>
      {z > 0.5 ? <ellipse cx={u} cy={planeToRoom(TABLE.top, u, w).y + 2} rx={hw * 0.85} ry={4} fill="#3A2614" opacity={0.12} /> : null}
      <path d={`M ${u - hw} ${f.y - 8} L ${u - hw + 3} ${k.y - 8} L ${u + hw - 3} ${k.y - 8} L ${u + hw} ${f.y - 8} Z`} fill="#EBCB95" stroke="#B98F5B" strokeWidth={1.2} />
      <rect x={u - hw} y={f.y - 8} width={hw * 2} height={8} rx={2} fill="#E8C690" stroke="#B98F5B" strokeWidth={1.2} />
    </g>
  );
};

// ---------- лодочка на правом конце стола (из 80-1-5) ----------
export const BOAT13 = { u: 2372, w: 40 } as const;
export const TableBoat: React.FC = () => {
  const p = planeToRoom(TABLE.top, BOAT13.u, BOAT13.w);
  return <PaperBoat x={p.x} y={p.y - 12} />;
};

// ---------- карандаши на ковре (рядом с рисующими младшими) ----------
export const PENCILS = { x: 628, y: 1318 } as const;
export const Pencils: React.FC = () => {
  const cols = ["#E5654F", "#F2C53D", "#4F8A3C", "#3F5E8C", "#8A6BB4"];
  return (
    <svg width={1} height={1} style={svgAbs}>
      <ellipse cx={PENCILS.x + 6} cy={PENCILS.y + 6} rx={44} ry={6} fill="#2A140C" opacity={0.14} />
      {cols.map((c, i) => {
        const a = -14 + i * 9;
        const x = PENCILS.x - 30 + i * 9;
        const y = PENCILS.y - 2 + (i % 2) * 4;
        return (
          <g key={c} transform={`rotate(${a} ${x} ${y})`}>
            <rect x={x} y={y - 2.6} width={46} height={5.2} rx={1.5} fill={c} />
            <path d={`M ${x + 46} ${y - 2.6} L ${x + 54} ${y} L ${x + 46} ${y + 2.6} Z`} fill="#E9CFA4" />
            <path d={`M ${x + 51} ${y - 1} L ${x + 54} ${y} L ${x + 51} ${y + 1} Z`} fill="#3A2E26" />
          </g>
        );
      })}
    </svg>
  );
};

// ---------- карточки задания на полочке доски ----------
// Простые рисунки природы (солнце, яблоко, дерево, облако) — задание по теме
// урока, без ответов на вопросы фильма.
const CARD_ART = ["sun", "apple", "tree", "cloud"] as const;
const CardArt: React.FC<{ readonly i: number }> = ({ i }) => {
  const k = CARD_ART[i % 4];
  if (k === "sun") return <circle cx={21} cy={20} r={8} fill="#F7D35C" stroke="#E8B53A" strokeWidth={2} />;
  if (k === "apple")
    return (
      <g>
        <circle cx={21} cy={22} r={8} fill="#E5654F" />
        <path d="M 22 14 q 5 -4 8 0 q -4 3 -8 0" fill="#5DB04A" />
      </g>
    );
  if (k === "tree")
    return (
      <g>
        <rect x={19} y={20} width={4} height={10} fill="#8A5B3C" />
        <circle cx={21} cy={17} r={8} fill="#5EAA4F" />
      </g>
    );
  return <path d="M 10 26 q 0 -8 8 -6 q 3 -6 9 -2 q 7 0 5 8 Z" fill="#DDE9F2" stroke="#9FB6CE" strokeWidth={1.6} />;
};
export const CARD = { w: 42, h: 36 } as const;
export const LedgeCards: React.FC<{ readonly cards: readonly CardState[]; readonly inHand: { readonly x: number; readonly y: number } | null; readonly handIndex: number }> = ({ cards, inHand, handIndex }) => (
  <svg width={1} height={1} style={svgAbs}>
    {cards.map((c, i) => (
      <g key={i} transform={`translate(${c.x - CARD.w / 2} ${c.y - CARD.h}) rotate(${(i % 2 ? 2 : -2)} ${CARD.w / 2} ${CARD.h})`}>
        <rect width={CARD.w} height={CARD.h} rx={2} fill="#FFFDF6" stroke="#D9D2C2" strokeWidth={1} />
        <CardArt i={i} />
      </g>
    ))}
    {inHand ? (
      <g transform={`translate(${inHand.x - CARD.w / 2} ${inHand.y - CARD.h + 6})`}>
        <rect width={CARD.w} height={CARD.h} rx={2} fill="#FFFDF6" stroke="#D9D2C2" strokeWidth={1} />
        <CardArt i={handIndex} />
      </g>
    ) : null}
  </svg>
);
// Стопка чистых карточек в руке учителя (обращена к нему — видна оборотная сторона).
export const CardStack: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <svg width={1} height={1} style={svgAbs}>
    <rect x={x - 16} y={y - 24} width={32} height={26} rx={2} fill="#F1E9D6" stroke="#CFC5AE" strokeWidth={1} />
    <rect x={x - 14} y={y - 27} width={32} height={26} rx={2} fill="#FBF6EA" stroke="#CFC5AE" strokeWidth={1} />
  </svg>
);

// ---------- книга Билала ----------
export const BilalBook: React.FC<{ readonly pos: { readonly x: number; readonly y: number }; readonly open: number; readonly floor: boolean }> = ({ pos, open, floor }) => {
  if (floor) {
    return (
      <svg width={1} height={1} style={svgAbs}>
        <ellipse cx={pos.x} cy={pos.y + 2} rx={34} ry={5} fill="#3A2614" opacity={0.14} />
        <rect x={pos.x - 30} y={pos.y - 7} width={60} height={8} rx={2} fill="#4E6A8C" />
        <rect x={pos.x - 28} y={pos.y - 5} width={56} height={2} fill="#F4EFE4" />
      </svg>
    );
  }
  const half = 29 * (0.5 + 0.5 * open);
  return (
    <svg width={1} height={1} style={svgAbs}>
      <path d={`M ${pos.x} ${pos.y - 26} L ${pos.x - half} ${pos.y - 26 + 6 * open} L ${pos.x - half} ${pos.y + 14 + 6 * open} L ${pos.x} ${pos.y + 14} Z`} fill="#4E6A8C" stroke="#3B526E" strokeWidth={1.4} />
      <path d={`M ${pos.x} ${pos.y - 26} L ${pos.x + half} ${pos.y - 26 + 6 * open} L ${pos.x + half} ${pos.y + 14 + 6 * open} L ${pos.x} ${pos.y + 14} Z`} fill="#5A799E" stroke="#3B526E" strokeWidth={1.4} />
      {open > 0.3 ? <path d={`M ${pos.x - half + 2} ${pos.y - 27 + 6 * open} L ${pos.x} ${pos.y - 30} L ${pos.x + half - 2} ${pos.y - 27 + 6 * open}`} stroke="#F4EFE4" strokeWidth={3} fill="none" /> : null}
    </svg>
  );
};

export { COMP as SHELF_COMP, WOOD };
export const SHELF_FRONT_Y = SHELF.floor;
