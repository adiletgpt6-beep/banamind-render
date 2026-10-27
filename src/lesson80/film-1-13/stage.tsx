// Стейдж фильма 80-1-13: комната со всеми 26 персонажами и вид на стол сверху
// (руки Амира кладут детали в коробку). Оба вида рисуют одну модель: детали,
// коробку и крышку берут из хореографии в плоскости стола (u, w, z) и только
// проецируют по-разному. Порядок рисования в комнате — по глубине (y):
// ученики на ковре (тело → предмет → руки), полка с книжками и коробкой,
// главные герои (тело → предмет в руках → руки), стол и предметы на нём.
// Дети у стола всегда за ним (стол ближе к камере).
import { useMemo } from "react";
import { nestingBirdPose } from "../bird/birdPose";
import { Shot, type Cam } from "../core/shots";
import { Actor } from "../rig/Actor";
import { RoomBack } from "../sets/Classroom";
import { CurtainLayer } from "../film-1-7/set";
import { Door, PlantCorner, Poster, PuzzleTable, QuranShelf, BgItemView } from "../film-1-12/set";
import { AMIR_HANDS, TopArm } from "../film-1-12/hands";
import { BOX, PIECES, TABLE_PLANE } from "../film-1-12/puzzle";
import { RoomPiece, TopPiece } from "../film-1-12/puzzleArt";
import { CAST, TEACHER, bgPlace } from "./cast";
import { BOOKS_ALL, buildChoreo, type Choreo, type HandState, type P3 } from "./choreo";
import { BOOK, BOOK_COLORS, SHELF, SPOT, TABLE, TABLE_STACK } from "./layout";
import { BilalBook, BOAT13, BookView, CardStack, LedgeCards, LowShelf, Pencils, RoomLid, TableBoat, TableBox } from "./set";
import type { L80Timeline } from "./timeline";

// учитель в классе мечети без обуви — серые носки
const TEACHER_LOOK = { ...TEACHER.look, socks: "#6E7380" };

export const useChoreo = (tl: L80Timeline): Choreo => useMemo(() => buildChoreo(tl), [tl]);

const svgAbs = { position: "absolute", left: 0, top: 0, overflow: "visible" } as const;

// ---------- комната ----------
export const RoomView: React.FC<{ readonly f: number; readonly ch: Choreo }> = ({ f, ch }) => {
  type Item = { y: number; key: string; node: React.ReactNode };
  const items: Item[] = [];
  // 22 ученика на ковре: тело → предмет занятия → руки
  for (const p of CAST) {
    if (p.main) continue;
    const ctl = ch.bg(p);
    const pl = bgPlace(p);
    const it = ch.bgItem(p, f);
    items.push({ y: pl.y, key: `${p.id}-b`, node: <Actor key={`${p.id}-b`} uid={`r-${p.id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} seed={p.seed} layer="body" /> });
    items.push({ y: pl.y + 0.1, key: `${p.id}-i`, node: <BgItemView key={`${p.id}-i`} it={it} h={pl.h} /> });
    items.push({ y: pl.y + 0.2, key: `${p.id}-a`, node: <Actor key={`${p.id}-a`} uid={`r-${p.id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} seed={p.seed} layer="arms" /> });
  }
  items.push({ y: 1318, key: "pencils", node: <Pencils key="pencils" /> });
  // Билал и его книга
  const bilal = CAST.find((x) => x.id === "bilal")!;
  const bb = ch.bilalBook(f);
  items.push({ y: SPOT.bilal.y, key: "bilal-b", node: <Actor key="bilal-b" uid="r-bilal" look={bilal.look} f={f} place={ch.bilal.place} face={ch.bilal.face} pose={ch.bilal.pose} role="bilal" seed={bilal.seed} layer="body" /> });
  items.push({ y: bb.floor ? bb.pos.y : SPOT.bilal.y + 0.1, key: "bilal-book", node: <BilalBook key="bilal-book" pos={bb.pos} open={bb.open} floor={bb.floor} /> });
  items.push({ y: SPOT.bilal.y + 0.2, key: "bilal-a", node: <Actor key="bilal-a" uid="r-bilal" look={bilal.look} f={f} place={ch.bilal.place} face={ch.bilal.face} pose={ch.bilal.pose} role="bilal" seed={bilal.seed} layer="arms" /> });
  // учитель
  const tp = ch.teacher.place(f);
  const tCard = ch.teacherCard(f);
  items.push({ y: tp.y, key: "teacher-b", node: <Actor key="teacher-b" uid="r-teacher" look={TEACHER_LOOK} f={f} place={ch.teacher.place} face={ch.teacher.face} pose={ch.teacher.pose} role="muhammad" seed={3} layer="body" /> });
  // стопка чистых карточек в руке учителя, пока он у доски
  const tArmR = ch.teacher.pose(f).armR;
  if (tArmR?.shape === "pinch" && tArmR.target && !ch.teacher.pose(f).floorSit) {
    const s = tArmR.target;
    items.push({ y: tp.y + 0.1, key: "teacher-stack", node: <CardStack key="teacher-stack" x={s.x} y={s.y + 8} /> });
  }
  items.push({ y: tp.y + 0.2, key: "teacher-a", node: <Actor key="teacher-a" uid="r-teacher" look={TEACHER_LOOK} f={f} place={ch.teacher.place} face={ch.teacher.face} pose={ch.teacher.pose} role="muhammad" seed={3} layer="arms" /> });
  // полка: книжки на полке и коробка на верхней доске
  const books = BOOKS_ALL.map((id) => ch.book(id, f));
  const box = ch.box(f);
  items.push({ y: SHELF.floor, key: "shelf", node: <LowShelf key="shelf" books={books} box={box} /> });
  // книжка на ковре
  for (const b of books) if (b.where === "floor") items.push({ y: b.y, key: `book-${b.id}`, node: <BookView key={`book-${b.id}`} b={b} /> });
  // Юсуф и Амир: тело → предмет в руках → руки. У стола — всегда за ним.
  const sortY = (p: { x: number; y: number }) => (p.x > TABLE.x1 - 90 && p.y > TABLE.top - 60 ? TABLE.top - 0.5 : p.y);
  for (const id of ["yusuf", "amir"] as const) {
    const p = CAST.find((x) => x.id === id)!;
    const ctl = ch[id];
    const pl = ctl.place(f);
    const y = sortY(pl);
    items.push({ y, key: `${id}-b`, node: <Actor key={`${id}-b`} uid={`r-${id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} role={id} seed={p.seed} layer="body" /> });
    const held = books.filter((b) => b.holder === id);
    // у стола в руках — поверх столешницы (книжка поднимается со стола)
    const heldY = held.some((b) => b.up < 0.6) && y === TABLE.top - 0.5 ? TABLE.top + 2.5 : y + 0.1;
    for (const b of held) items.push({ y: heldY, key: `held-${b.id}`, node: <BookView key={`held-${b.id}`} b={b} /> });
    if (id === "amir" && box.where === "hands") items.push({ y: y === TABLE.top - 0.5 && box.y > TABLE.top - 80 ? TABLE.top + 2.5 : y + 0.1, key: "box-held", node: <HeldBox key="box-held" x={box.x} y={box.y} /> });
    const armsOverTable = (id === "amir" && pl.x > TABLE.x1 && ctl.front(f) && y === TABLE.top - 0.5) || heldY === TABLE.top + 2.5;
    items.push({ y: armsOverTable ? TABLE.top + 3 : y + 0.2, key: `${id}-a`, node: <Actor key={`${id}-a`} uid={`r-${id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} role={id} seed={p.seed} layer="arms" /> });
  }
  items.push({ y: TABLE.top, key: "table", node: <PuzzleTable key="table" /> });
  items.push({ y: TABLE.top + 1, key: "table-props", node: <TableProps key="table-props" f={f} ch={ch} /> });
  items.push({ y: TABLE.top + 2, key: "table-held", node: <TableHeld key="table-held" f={f} ch={ch} /> });
  items.sort((a, b) => a.y - b.y);
  return (
    <>
      <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} sprout={false} softLight />
      <Door />
      <Poster />
      <QuranShelf />
      <CurtainLayer curtain={0} />
      <PlantCorner />
      <LedgeCards cards={ch.cards(f)} inHand={tCard} handIndex={ch.cards(f).length} />
      {items.map((i) => i.node)}
    </>
  );
};
const HeldBox: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => {
  const hw = BOX.w / 2;
  const H = BOX.h;
  return (
    <svg width={1} height={1} style={svgAbs}>
      <path d={`M ${x - hw - 2} ${y - H - 2} L ${x - hw + 4} ${y - H - 2 - BOX.d * TABLE_PLANE.fs} L ${x + hw - 4} ${y - H - 2 - BOX.d * TABLE_PLANE.fs} L ${x + hw + 2} ${y - H - 2} Z`} fill="#EBCB95" stroke="#B98F5B" strokeWidth={1.2} />
      <rect x={x - hw} y={y - H} width={BOX.w} height={H} fill="#E2BE86" stroke="#B98F5B" strokeWidth={1.5} rx={2} />
      <rect x={x - hw - 2} y={y - H - 3} width={BOX.w + 4} height={9} rx={2} fill="#E8C690" stroke="#B98F5B" strokeWidth={1.2} />
      <g transform={`translate(${x - 20} ${y - H + 9})`}>
        <rect width={40} height={17} rx={2} fill="#D9EEF2" stroke="#9FB6CE" strokeWidth={0.8} />
        <rect y={12} width={40} height={5} fill="#86BC60" />
        <circle cx={9.5} cy={6} r={5} fill="#58A44C" />
      </g>
    </svg>
  );
};

// Предметы на столе: стопка книжек, коробка (с деталями внутри), крышка,
// картинка, лодочка — дальние раньше ближних.
const TableProps: React.FC<{ readonly f: number; readonly ch: Choreo }> = ({ f, ch }) => {
  const box = ch.box(f);
  const poses = PIECES.map((p) => ({ p, pose: ch.piece(p.id, f) }));
  const lying = poses.filter((x) => !x.pose.held && !x.pose.inBox).sort((a, b) => b.pose.w - a.pose.w);
  const inBox = poses.filter((x) => x.pose.inBox).sort((a, b) => b.pose.w - a.pose.w);
  const books = BOOKS_ALL.map((id) => ch.book(id, f)).filter((b) => b.where === "table");
  return (
    <svg width={1} height={1} style={svgAbs}>
      {/* крышка лежит позади коробки, пока её не взяли */}
      {!box.lid.on && !box.lid.held ? <RoomLid u={box.lid.u} w={box.lid.w} z={0} /> : null}
      {lying.length ? (
        <g>
          {lying.map(({ p, pose }) => <RoomPiece key={`s-${p.id}`} p={p} pose={pose} tableTop={TABLE.top} uid={`rp-${p.id}`} part="side" />)}
          {lying.map(({ p, pose }) => <RoomPiece key={`f-${p.id}`} p={p} pose={pose} tableTop={TABLE.top} uid={`rp-${p.id}`} part="face" />)}
        </g>
      ) : null}
      {box.where === "table" ? (
        <TableBox
          b={box}
          inner={
            <g>
              {inBox.map(({ p, pose }) => <RoomPiece key={`b-${p.id}`} p={p} pose={pose} tableTop={TABLE.top} uid={`rb-${p.id}`} />)}
            </g>
          }
        />
      ) : null}
      {books.map((b) => (
        <InlineBook key={`ib-${b.id}`} b={b} />
      ))}
    </svg>
  );
};
// книжка в стопке на столе (svg внутри общего svg)
const InlineBook: React.FC<{ readonly b: ReturnType<Choreo["book"]> }> = ({ b }) => {
  const c = BOOK_COLORS[b.id];
  const w = BOOK.w;
  const hh = BOOK.h * TABLE_PLANE.fs;
  const edge = BOOK.t;
  const x0 = b.x - w / 2;
  return (
    <g transform={`rotate(${b.tilt} ${b.x} ${b.y})`}>
      <rect x={x0 + 1} y={b.y - edge} width={w - 2} height={edge} fill="#F4EFE4" stroke={c.dark} strokeWidth={0.8} />
      <rect x={x0} y={b.y - edge - hh} width={w} height={hh} rx={2} fill={c.cover} stroke={c.dark} strokeWidth={1} />
    </g>
  );
};

// Детали и крышка в руках (над столом, под кистями).
const TableHeld: React.FC<{ readonly f: number; readonly ch: Choreo }> = ({ f, ch }) => {
  const box = ch.box(f);
  return (
    <svg width={1} height={1} style={svgAbs}>
      {PIECES.map((p) => {
        const pose = ch.piece(p.id, f);
        return pose.held ? <RoomPiece key={p.id} p={p} pose={pose} tableTop={TABLE.top} uid={`rh-${p.id}`} /> : null;
      })}
      {box.lid.held ? <RoomLid u={box.lid.u} w={box.lid.w} z={box.lid.z} /> : null}
    </svg>
  );
};

// ---------- план комнаты с камерой ----------
export const RoomShot: React.FC<{ readonly f: number; readonly ch: Choreo; readonly cam: Cam }> = ({ f, ch, cam }) => (
  <Shot f={f} from={-1} to={Number.MAX_SAFE_INTEGER} cam={cam} bg="#F1E7D6">
    <RoomView f={f} ch={ch} />
    <TableBoat />
  </Shot>
);

// ---------- вид сверху ----------
// Камера над столом, Амир внизу кадра: X = 960 − k·(u − u0), Y = 540 + k·(w − w0).
export type TopCam = { readonly u: number; readonly w: number; readonly k: number };

export const TopView: React.FC<{ readonly f: number; readonly ch: Choreo; readonly cam: TopCam }> = ({ f, ch, cam }) => {
  const k = cam.k;
  const X = (u: number) => 960 - k * (u - cam.u);
  const Y = (w: number) => 540 + k * (w - cam.w);
  const edgeY = Y(TABLE_PLANE.depth);
  const poses = PIECES.map((p) => ({ p, pose: ch.piece(p.id, f) }));
  const lying = poses.filter((x) => !x.pose.held && !x.pose.inBox);
  const inBox = poses.filter((x) => x.pose.inBox);
  const held = poses.filter((x) => x.pose.held);
  const box = ch.box(f);
  const L = 34 * k * 0.95;
  const handNode = (h: HandState, shoulder: P3, side: 1 | -1, key: string) => {
    if (h.lap > 0.985) return null;
    const drop = h.lap * 760;
    const anchor = { x: X(shoulder.u), y: Y(shoulder.w) + 40 + drop };
    const tip = { x: X(h.at.u), y: Y(Math.min(h.at.w, shoulder.w - 40)) - h.at.z * k * 0.25 + drop };
    const dx = tip.x - anchor.x;
    const dy = tip.y - anchor.y;
    const len = Math.hypot(dx, dy) || 1;
    const ang = (Math.atan2(dx, -dy) * 180) / Math.PI + h.twist;
    const reach = h.pose === "point" || h.pose === "trace" ? 0.92 : h.pose === "grip" || h.pose === "pinch" ? 0.62 : 0.72;
    const wrist = { x: tip.x - (dx / len) * L * reach, y: tip.y - (dy / len) * L * reach };
    return <TopArm key={key} wrist={wrist} anchor={anchor} L={L} angle={ang} side={side} pose={h.pose} blend={h.blend} look={AMIR_HANDS} shadow={8 + h.at.z * k * 0.3} />;
  };
  const ax = SPOT.amirSit.x;
  const bw = BOX.w * k;
  const bd = BOX.d * k;
  const bx = X(box.u);
  const by = Y(box.w);
  const wall = 4 * k;
  const lid = box.lid;
  const lidNode = (z: number) => {
    const grow = 1 + z * 0.004;
    const lx = X(lid.u);
    const ly = Y(lid.w) - z * k * 0.25;
    const lw = (BOX.w + 4) * k * grow;
    const ld = (BOX.d + 4) * k * grow;
    return (
      <g>
        <rect x={lx - lw / 2 + 6 + z * k * 0.1} y={ly - ld / 2 - 4} width={lw} height={ld} rx={6} fill="#3A2614" opacity={0.22} style={{ filter: "blur(4px)" }} />
        <rect x={lx - lw / 2} y={ly - ld / 2} width={lw} height={ld} rx={6} fill="#EBCB95" stroke="#B98F5B" strokeWidth={2} />
        <g transform={`translate(${lx - 20 * k * 0.6} ${ly - 8.5 * k * 0.6}) scale(${k * 0.6})`}>
          <rect width={40} height={17} rx={2} fill="#D9EEF2" stroke="#9FB6CE" strokeWidth={0.8} />
          <rect y={12} width={40} height={5} fill="#86BC60" />
          <circle cx={9.5} cy={6} r={5} fill="#58A44C" />
          <path d="M 11 8 L 34 6" stroke="#7A4E31" strokeWidth={1.4} />
        </g>
      </g>
    );
  };
  const stack = BOOKS_ALL.map((id) => ch.book(id, f)).filter((b) => b.where === "table");
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#9E4A3C" }}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="l8113-top-wood" x1="0" y1="0" x2="1" y2="0.25">
            <stop offset="0" stopColor="#C99E6E" />
            <stop offset="0.5" stopColor="#D2AA7A" />
            <stop offset="1" stopColor="#C79B6A" />
          </linearGradient>
          <radialGradient id="l8113-top-light" cx={420} cy={860} r={900} gradientUnits="userSpaceOnUse" gradientTransform="translate(420 860) scale(1 0.58) translate(-420 -860)">
            <stop offset={0} stopColor="#FFF3D6" stopOpacity={0.2} />
            <stop offset={0.55} stopColor="#FFF3D6" stopOpacity={0.09} />
            <stop offset={1} stopColor="#FFF3D6" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={0} y={edgeY} width={1920} height={1080} fill="#A9503F" />
        <rect x={0} y={edgeY + 30} width={1920} height={14} fill="#B8604F" opacity={0.8} />
        <rect x={X(TABLE.x2)} y={Y(-40)} width={X(TABLE.x1) - X(TABLE.x2)} height={edgeY - Y(-40)} fill="url(#l8113-top-wood)" />
        {Array.from({ length: 16 }, (_, i) => {
          const yy = Y(-40) + ((edgeY - Y(-40)) * (i + 0.5)) / 16;
          return <path key={i} d={`M ${X(TABLE.x2)} ${yy} C ${600} ${yy + ((i % 3) - 1) * 9} ${1300} ${yy - ((i % 2) * 2 - 1) * 7} ${X(TABLE.x1)} ${yy + 3}`} stroke="#A57B4E" strokeOpacity={0.18 + (i % 3) * 0.05} strokeWidth={2 + (i % 2)} fill="none" />;
        })}
        <rect x={X(TABLE.x2)} y={edgeY - 10} width={X(TABLE.x1) - X(TABLE.x2)} height={10} fill="#B48659" />
        <rect x={-600} y={0} width={3000} height={1600} fill="url(#l8113-top-light)" />
        {/* стопка книжек (сверху видна синяя, по краям — оранжевая и красная) */}
        {stack.length ? (
          <g>
            {stack.map((b, i) => {
              const c = BOOK_COLORS[b.id];
              const off = (b.id === "red" ? -5 : b.id === "orange" ? 0 : 5) * k * 0.6;
              return <rect key={b.id} x={X(TABLE_STACK.u) - (BOOK.w * k) / 2 + off} y={Y(TABLE_STACK.w) - (BOOK.h * k) / 2 - i * 3} width={BOOK.w * k} height={BOOK.h * k} rx={4} fill={c.cover} stroke={c.dark} strokeWidth={2} transform={`rotate(${b.tilt * 1.5 + (b.id === "red" ? -4 : 0)} ${X(TABLE_STACK.u)} ${Y(TABLE_STACK.w)})`} />;
            })}
          </g>
        ) : null}
        {/* лодочка сверху */}
        <g transform={`translate(${X(BOAT13.u)} ${Y(BOAT13.w)}) scale(${k * 0.9})`}>
          <path d="M -34 -9 L 34 -9 L 24 9 L -24 9 Z" fill="#EEE9DC" stroke="#CFC7B6" strokeWidth={1.5 / k} />
          <path d="M -16 0 L 0 -6 L 16 0 L 0 6 Z" fill="#FFFFFF" stroke="#CFC7B6" strokeWidth={1.2 / k} />
        </g>
        {/* крышка лежит, пока её не взяли */}
        {!lid.on && !lid.held ? lidNode(0) : null}
        {/* коробка: стенки, дно, детали внутри */}
        {box.where === "table" ? (
          <g>
            <rect x={bx - bw / 2 + 6} y={by - bd / 2 - 4} width={bw} height={bd} rx={6} fill="#3A2614" opacity={0.22} style={{ filter: "blur(4px)" }} />
            <rect x={bx - bw / 2} y={by - bd / 2} width={bw} height={bd} rx={5} fill="#E2BE86" stroke="#B98F5B" strokeWidth={2} />
            <rect x={bx - bw / 2 + wall} y={by - bd / 2 + wall} width={bw - 2 * wall} height={bd - 2 * wall} rx={3} fill="#C99E66" />
            {inBox.map(({ p, pose }) => (
              <TopPiece key={`b-${p.id}`} p={p} pose={pose} X={X(pose.u)} Y={Y(pose.w)} k={k} uid={`tb-${p.id}`} />
            ))}
            <rect x={bx - bw / 2 + wall} y={by - bd / 2 + wall} width={bw - 2 * wall} height={wall * 0.8} fill="#B98F5B" opacity={0.6} />
          </g>
        ) : null}
        {(["under", "face"] as const).map((part) => lying.map(({ p, pose }) => <TopPiece key={`${part}-${p.id}`} part={part} p={p} pose={pose} X={X(pose.u)} Y={Y(pose.w)} k={k} uid={`tp-${p.id}`} />))}
        {held.map(({ p, pose }) => (
          <TopPiece key={`h-${p.id}`} p={p} pose={pose} X={X(pose.u)} Y={Y(pose.w) - pose.z * k * 0.25} k={k} uid={`th-${p.id}`} />
        ))}
        {lid.on && box.where === "table" ? lidNode(BOX.h * 0.3) : null}
        {lid.held ? lidNode(lid.z) : null}
        {/* руки Амира (снизу кадра) */}
        {handNode(ch.aHand("L", f), { u: ax + 46, w: 226, z: 0 }, -1, "aL")}
        {handNode(ch.aHand("R", f), { u: ax - 46, w: 226, z: 0 }, 1, "aR")}
      </svg>
    </div>
  );
};
