// Реквизит фильма 80-1-8 на столике и рядом с ним: папка «Наши вопросы»,
// рисунок Земли (из 80-1-7), место для отдельного листа, лодочка (из 80-1-5),
// карточка, карандаш, Коран и подставка; стопка листов на ковре; глобус из
// 80-1-7 на полу справа; светильник отставлен на подоконник и выключен.
// Координаты — мир комнаты (px), одни и те же во всех планах.
import { box } from "../core/shots";
import { GlobeView } from "../film-1-7/globe/GlobeView";
import { L80_PHI } from "../film-1-7/script";
import { PaperBoat } from "../film-1-7/set";
import type { Choreo } from "./choreo";
import { BlankSheet, BookStand, CardContent, EarthDrawing, FlatSheet, FOLDER_H, FOLDER_W, FolderContent, Pencil, QuranBook, Stack } from "./drawings";
import { CARD, FOLDER, GLOBE_FLOOR, LAMP_ASIDE, QURAN_FLAT, STACK, STAND, TABLE } from "./layout";
import { CARD_UNITS } from "./card";

const WOOD = "#8A6240";
const WOOD_DARK = "#6E4C31";

// Столик (тот же, что в 80-1-7).
export const Table: React.FC = () => {
  const t = TABLE;
  const w = t.x2 - t.x1;
  return (
    <div style={box({ left: t.x1, top: t.top, width: w, height: t.h + t.legH })}>
      <div style={box({ left: 22, top: t.h - 8, width: 26, height: t.legH + 8, backgroundColor: WOOD_DARK, borderRadius: 5 })} />
      <div style={box({ left: w - 48, top: t.h - 8, width: 26, height: t.legH + 8, backgroundColor: WOOD_DARK, borderRadius: 5 })} />
      <div style={box({ left: 0, top: 0, width: w, height: t.h, borderRadius: 10, background: `linear-gradient(180deg, #B08358, ${WOOD})`, boxShadow: "0 8px 14px rgba(60,40,20,0.22)" })} />
      <div style={box({ left: 0, top: 0, width: w, height: 14, borderRadius: "10px 10px 0 0", backgroundColor: "#C19468" })} />
    </div>
  );
};

// Предметы, лежащие на столе (не в руках). Порядок: папка → рисунок → лист →
// лодочка → карточка → подставка → Коран.
export const TableProps: React.FC<{ readonly f: number; readonly ch: Choreo; readonly uid?: string }> = ({ f, ch, uid = "set" }) => {
  const earth = ch.earth(f);
  const loose = ch.loose(f);
  const boat = ch.boat(f);
  const card = ch.card(f);
  const q = ch.quran(f);
  return (
    <>
      <FlatSheet x={FOLDER.x} y={FOLDER.y} w={FOLDER.w} units={{ w: FOLDER_W, h: FOLDER_H }} flat={1} rot={FOLDER.rot}>
        <FolderContent />
      </FlatSheet>
      {!earth.carried ? <EarthDrawing x={earth.pos.x} y={earth.pos.y} w={98} flat={1} rot={earth.rot} /> : null}
      {loose && !loose.carried ? <BlankSheet x={loose.pos.x} y={loose.pos.y} w={100} flat={1} rot={loose.rot} /> : null}
      <PaperBoat x={boat.x} y={boat.y} />
      {!card.carrier && !card.onStack ? (
        <FlatSheet x={card.pos.x} y={card.pos.y} w={CARD.w} units={CARD_UNITS} flat={1} rot={card.rot}>
          <CardContent progress={card.progress} uid={`${uid}-card`} />
        </FlatSheet>
      ) : null}
      <BookStand x={STAND.x} y={STAND.y} w={STAND.w} />
      {!q.carried ? <QuranBook x={q.pos.x} y={q.pos.y} w={QURAN_FLAT.w} tilt={q.tilt} /> : null}
    </>
  );
};

// Предметы в руках (рисуются после столика, под кистями).
export const CarriedProps: React.FC<{ readonly f: number; readonly ch: Choreo; readonly uid?: string }> = ({ f, ch, uid = "set" }) => {
  const earth = ch.earth(f);
  const loose = ch.loose(f);
  const card = ch.card(f);
  const q = ch.quran(f);
  return (
    <>
      {earth.carried ? <EarthDrawing x={earth.pos.x} y={earth.pos.y} w={98 + 30 * (1 - earth.flat)} flat={earth.flat} rot={earth.rot} /> : null}
      {loose?.carried ? <BlankSheet x={loose.pos.x} y={loose.pos.y} w={100} flat={loose.flat} rot={loose.rot} /> : null}
      {card.carrier ? (
        <FlatSheet x={card.pos.x} y={card.pos.y} w={CARD.w} units={CARD_UNITS} flat={card.flat} rot={card.rot}>
          <CardContent progress={card.progress} uid={`${uid}-card-carried`} />
        </FlatSheet>
      ) : null}
      {q.carried ? <QuranBook x={q.pos.x} y={q.pos.y} w={QURAN_FLAT.w} tilt={q.tilt} /> : null}
    </>
  );
};

export const PencilProp: React.FC<{ readonly f: number; readonly ch: Choreo }> = ({ f, ch }) => {
  const p = ch.pencil(f);
  return <Pencil x={p.tip.x} y={p.tip.y} angle={p.angle} />;
};

// Стопка чистых листов на ковре между Амиром и Юсуфом (сверху — карточка, пока не взята).
export const StackProp: React.FC<{ readonly f: number; readonly ch: Choreo }> = ({ f, ch }) => <Stack x={STACK.x} y={STACK.y} w={STACK.w} count={ch.stackCount(f)} />;

// Глобус из 80-1-7 на подставке — на полу справа от столика, в положении
// конца предыдущего фильма; лампа выключена, в объяснении не участвует.
// at — другое место на полу (по умолчанию — как в 80-1-8).
export const GlobeOnFloor: React.FC<{ readonly at?: { readonly cx: number; readonly r: number; readonly baseY: number } }> = ({ at }) => {
  const g = at ?? GLOBE_FLOOR;
  const cy = g.baseY - g.r * 1.47;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <ellipse cx={g.cx} cy={g.baseY + 2} rx={g.r * 0.7} ry={g.r * 0.16} fill="#000" opacity={0.16} />
      <GlobeView uid="floor-globe" cx={g.cx} cy={cy} r={g.r} phi={L80_PHI.night2} view="side" lamp={0} />
    </svg>
  );
};

// Отставленный светильник (выключен) на подоконнике справа от ростка.
export const LampAside: React.FC = () => {
  const b = LAMP_ASIDE;
  const hx = b.baseX - 62;
  const hy = b.baseY - 150;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <ellipse cx={b.baseX} cy={b.baseY + 6} rx={40} ry={11} fill="#000" opacity={0.16} />
      <ellipse cx={b.baseX} cy={b.baseY} rx={38} ry={10} fill="#3C4350" />
      <ellipse cx={b.baseX} cy={b.baseY - 5} rx={38} ry={10} fill="#596274" />
      <path d={`M ${b.baseX} ${b.baseY - 7} L ${b.baseX} ${hy + 36} Q ${b.baseX} ${hy + 8} ${hx + 32} ${hy + 4}`} stroke="#4A5160" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M ${hx + 38} ${hy - 19} L ${hx - 30} ${hy - 38} L ${hx - 30} ${hy + 38} L ${hx + 38} ${hy + 19} Z`} fill="#55607A" />
      <path d={`M ${hx + 38} ${hy - 19} L ${hx - 30} ${hy - 38} L ${hx - 30} ${hy - 26} L ${hx + 38} ${hy - 10} Z`} fill="#6B778F" />
      <ellipse cx={hx - 30} cy={hy} rx={9} ry={38} fill="#2E3440" />
      <ellipse cx={hx - 30} cy={hy} rx={5} ry={26} fill="#1F242C" />
      <rect x={b.baseX + 12} y={b.baseY - 19} width={12} height={10} rx={3} fill="#8A8F99" />
    </svg>
  );
};
