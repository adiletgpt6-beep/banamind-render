// Стейдж фильма 80-1-12: комната со всеми 26 персонажами и вид на стол сверху.
// Оба вида рисуют одну и ту же модель: детали картинки, коробку и точки
// касания рук берут из хореографии в плоскости стола (u, w, z) и только
// проецируют по-разному. Порядок рисования в комнате — по глубине (y):
// ученики на ковре (тело → предмет → руки), Билал, стол; у стола — тела
// детей и учителя → столешница → лежащие предметы → предметы в руках →
// кисти, касающиеся предметов.
import { useMemo } from "react";
import { nestingBirdPose } from "../bird/birdPose";
import { Shot, type Cam } from "../core/shots";
import { Actor } from "../rig/Actor";
import { RoomBack } from "../sets/Classroom";
import { CurtainLayer } from "../film-1-7/set";
import { CAST, TEACHER, bgPlace } from "./cast";
import { buildChoreo, type Choreo, type HandState, type P3 } from "./choreo";
import { AMIR_HANDS, TopArm, YUSUF_HANDS } from "./hands";
import { AMIR_BOOK, BOAT, BOOKS, SEAT, TABLE } from "./layout";
import { BOX, PIECES, TABLE_PLANE, type PiecePose } from "./puzzle";
import { RoomPiece, TopPiece } from "./puzzleArt";
import { AmirBook, BgItemView, BilalBookView, BooksAndBoat, Door, PlantCorner, Poster, PuzzleTable, QuranShelf, RoomBox } from "./set";
import type { L80Timeline } from "./timeline";

// учитель в классе мечети без обуви — серые носки (тёмные овалы читались как ботинки)
const TEACHER_LOOK = { ...TEACHER.look, socks: "#6E7380" };

export const useChoreo = (tl: L80Timeline): Choreo => useMemo(() => buildChoreo(tl), [tl]);

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
  // Билал и его книга
  const bilal = CAST.find((x) => x.id === "bilal")!;
  const bb = ch.bilalBook(f);
  items.push({ y: SEAT.bilal.y, key: "bilal-b", node: <Actor key="bilal-b" uid="r-bilal" look={bilal.look} f={f} place={ch.bilal.place} face={ch.bilal.face} pose={ch.bilal.pose} role="bilal" seed={bilal.seed} layer="body" /> });
  items.push({ y: bb.where === "floor" ? bb.pos.y : SEAT.bilal.y + 0.1, key: "bilal-book", node: <BilalBookView key="bilal-book" b={bb} /> });
  items.push({ y: SEAT.bilal.y + 0.2, key: "bilal-a", node: <Actor key="bilal-a" uid="r-bilal" look={bilal.look} f={f} place={ch.bilal.place} face={ch.bilal.face} pose={ch.bilal.pose} role="bilal" seed={bilal.seed} layer="arms" /> });
  // учитель: стоит в проходе, идёт, садится у стола
  const tp = ch.teacher.place(f);
  const tFront = ch.teacher.front(f);
  items.push({ y: Math.min(tp.y, TABLE.top - 0.6), key: "teacher", node: <Actor key="teacher" uid="r-teacher" look={TEACHER_LOOK} f={f} place={ch.teacher.place} face={ch.teacher.face} pose={ch.teacher.pose} role="muhammad" seed={3} layer={tFront ? "body" : "all"} /> });
  if (tFront) items.push({ y: TABLE.top + 4, key: "teacher-arms", node: <Actor key="teacher-arms" uid="r-teacher" look={TEACHER_LOOK} f={f} place={ch.teacher.place} face={ch.teacher.face} pose={ch.teacher.pose} role="muhammad" seed={3} layer="arms" /> });
  // за столом: тела до столешницы, кисти поверх предметов при касании
  for (const id of ["yusuf", "amir"] as const) {
    const p = CAST.find((x) => x.id === id)!;
    const ctl = ch[id];
    const front = ctl.front(f);
    items.push({ y: TABLE.top - 0.5, key: id, node: <Actor key={id} uid={`r-${id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} role={id} seed={p.seed} layer={front ? "body" : "all"} /> });
    if (front) items.push({ y: TABLE.top + 4, key: `${id}-arms`, node: <Actor key={`${id}-arms`} uid={`r-${id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} role={id} seed={p.seed} layer="arms" /> });
  }
  items.push({ y: TABLE.top, key: "table", node: <PuzzleTable key="table" /> });
  items.push({ y: TABLE.top + 1, key: "table-props", node: <TableProps key="table-props" f={f} ch={ch} /> });
  items.push({ y: TABLE.top + 3, key: "held", node: <HeldProps key="held" f={f} ch={ch} /> });
  items.sort((a, b) => a.y - b.y);
  return (
    <>
      <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} sprout={false} softLight />
      <Door />
      <Poster />
      <QuranShelf />
      <CurtainLayer curtain={0} />
      <PlantCorner />
      {items.map((i) => i.node)}
    </>
  );
};

// Предметы, лежащие на столе: дальние раньше ближних.
const TableProps: React.FC<{ readonly f: number; readonly ch: Choreo }> = ({ f, ch }) => {
  type It = { w: number; node: React.ReactNode; key: string };
  const its: It[] = [];
  const b = ch.box(f);
  if (!b.holder) its.push({ w: b.w, key: "box", node: <RoomBox key="box" b={b} /> });
  its.push({ w: BOOKS.w, key: "books", node: <BooksAndBoat key="books" /> });
  its.push({ w: AMIR_BOOK.w, key: "amir-book", node: <AmirBook key="amir-book" open={ch.amirBook(f).open} u={AMIR_BOOK.u} /> });
  // лежащие детали — двумя проходами (все торцы, затем все лица), дальние раньше ближних
  const lying = PIECES.map((p) => ({ p, pose: ch.piece(p.id, f) }))
    .filter((x) => !x.pose.held && x.pose.z <= 0.5)
    .sort((a, b2) => b2.pose.w - a.pose.w);
  if (lying.length) {
    its.push({
      w: lying[0].pose.w,
      key: "pieces",
      node: (
        <svg key="pieces" width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {lying.map(({ p, pose }) => <RoomPiece key={`s-${p.id}`} p={p} pose={pose} tableTop={TABLE.top} uid={`rp-${p.id}`} part="side" />)}
          {lying.map(({ p, pose }) => <RoomPiece key={`f-${p.id}`} p={p} pose={pose} tableTop={TABLE.top} uid={`rp-${p.id}`} part="face" />)}
        </svg>
      ),
    });
  }
  for (const p of PIECES) {
    const pose = ch.piece(p.id, f);
    if (pose.held || pose.z <= 0.5) continue;
    its.push({
      w: pose.w - 1000,
      key: p.id,
      node: (
        <svg key={p.id} width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <RoomPiece p={p} pose={pose} tableTop={TABLE.top} uid={`rp-${p.id}`} />
        </svg>
      ),
    });
  }
  its.sort((a, b2) => b2.w - a.w);
  return <>{its.map((i) => i.node)}</>;
};

// Предметы в руках (над столом, под кистями).
const HeldProps: React.FC<{ readonly f: number; readonly ch: Choreo }> = ({ f, ch }) => {
  const b = ch.box(f);
  return (
    <>
      {PIECES.map((p) => {
        const pose = ch.piece(p.id, f);
        return pose.held ? (
          <svg key={p.id} width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <RoomPiece p={p} pose={pose} tableTop={TABLE.top} uid={`rh-${p.id}`} />
          </svg>
        ) : null;
      })}
      {b.holder ? <RoomBox b={b} /> : null}
    </>
  );
};

// ---------- план комнаты с камерой ----------
export const RoomShot: React.FC<{ readonly f: number; readonly ch: Choreo; readonly cam: Cam; readonly overlay?: React.ReactNode }> = ({ f, ch, cam, overlay }) => (
  <Shot f={f} from={-1} to={Number.MAX_SAFE_INTEGER} cam={cam} bg="#F1E7D6" overlay={overlay}>
    <RoomView f={f} ch={ch} />
  </Shot>
);

// ---------- вид сверху ----------
// Камера над столом, Юсуф внизу кадра: X = 960 − k·(u − u0), Y = 540 + k·(w − w0).
export type TopCam = { readonly u: number; readonly w: number; readonly k: number };

export const TopView: React.FC<{ readonly f: number; readonly ch: Choreo; readonly cam: TopCam }> = ({ f, ch, cam }) => {
  const k = cam.k;
  const X = (u: number) => 960 - k * (u - cam.u);
  const Y = (w: number) => 540 + k * (w - cam.w);
  const edgeY = Y(TABLE_PLANE.depth);
  const poses = PIECES.map((p) => ({ p, pose: ch.piece(p.id, f) }));
  const lying = poses.filter((x) => !x.pose.held && x.pose.z < 0.5);
  const raised = poses.filter((x) => x.pose.held || x.pose.z >= 0.5).sort((a, b) => a.pose.z - b.pose.z);
  const b = ch.box(f);
  const L = 34 * k * 0.95;
  // руки: точка касания → запястье (кисть продолжает предплечье от плеча)
  const handNode = (h: HandState, shoulder: P3, side: 1 | -1, look: typeof YUSUF_HANDS, key: string) => {
    if (h.lap > 0.985) return null;
    // уход руки «на колени» — вся рука целиком сдвигается вниз за кадр (без
    // переворота предплечья и без кисти, спрятанной под рукавом)
    const drop = h.lap * 760;
    const anchor = { x: X(shoulder.u), y: Y(shoulder.w) + 40 + drop };
    // точка кисти при уходе на колени не заходит за плечо (иначе рука переворачивается)
    const tip = { x: X(h.at.u), y: Y(Math.min(h.at.w, shoulder.w - 40)) - h.at.z * k * 0.25 + drop };
    const dx = tip.x - anchor.x;
    const dy = tip.y - anchor.y;
    const len = Math.hypot(dx, dy) || 1;
    const ang = (Math.atan2(dx, -dy) * 180) / Math.PI + h.twist;
    const reach = h.pose === "point" || h.pose === "trace" ? 0.92 : h.pose === "grip" || h.pose === "pinch" ? 0.62 : 0.72;
    const wrist = { x: tip.x - (dx / len) * L * reach, y: tip.y - (dy / len) * L * reach };
    return <TopArm key={key} wrist={wrist} anchor={anchor} L={L} angle={ang} side={side} pose={h.pose} blend={h.blend} look={look} shadow={8 + h.at.z * k * 0.3} />;
  };
  const yx = SEAT.yusuf.x;
  const ax = ch.amir.place(f).x;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#9E4A3C" }}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="l8112-top-wood" x1="0" y1="0" x2="1" y2="0.25">
            <stop offset="0" stopColor="#C99E6E" />
            <stop offset="0.5" stopColor="#D2AA7A" />
            <stop offset="1" stopColor="#C79B6A" />
          </linearGradient>
        </defs>
        {/* ковёр за краем стола (там сидят дети) */}
        <rect x={0} y={edgeY} width={1920} height={1080} fill="#A9503F" />
        <rect x={0} y={edgeY + 30} width={1920} height={14} fill="#B8604F" opacity={0.8} />
        {/* столешница с волокнами */}
        <rect x={X(TABLE.x2)} y={Y(-40)} width={X(TABLE.x1) - X(TABLE.x2)} height={edgeY - Y(-40)} fill="url(#l8112-top-wood)" />
        {Array.from({ length: 16 }, (_, i) => {
          const yy = Y(-40) + ((edgeY - Y(-40)) * (i + 0.5)) / 16;
          return <path key={i} d={`M ${X(TABLE.x2)} ${yy} C ${600} ${yy + ((i % 3) - 1) * 9} ${1300} ${yy - ((i % 2) * 2 - 1) * 7} ${X(TABLE.x1)} ${yy + 3}`} stroke="#A57B4E" strokeOpacity={0.18 + (i % 3) * 0.05} strokeWidth={2 + (i % 2)} fill="none" />;
        })}
        <rect x={X(TABLE.x2)} y={edgeY - 10} width={X(TABLE.x1) - X(TABLE.x2)} height={10} fill="#B48659" />
        {/* свет из окна — мягкое тёплое пятно */}
        <radialGradient id="l8112-top-light" cx={420} cy={860} r={900} gradientUnits="userSpaceOnUse" gradientTransform="translate(420 860) scale(1 0.58) translate(-420 -860)">
          <stop offset={0} stopColor="#FFF3D6" stopOpacity={0.2} />
          <stop offset={0.55} stopColor="#FFF3D6" stopOpacity={0.09} />
          <stop offset={1} stopColor="#FFF3D6" stopOpacity={0} />
        </radialGradient>
        <rect x={-600} y={0} width={3000} height={1600} fill="url(#l8112-top-light)" />
        {/* предметы на столе вне картинки */}
        <TopBooks X={X} Y={Y} k={k} />
        <TopAmirBook X={X} Y={Y} k={k} open={ch.amirBook(f).open} />
        {!b.holder ? <TopBox X={X} Y={Y} k={k} u={b.u} w={b.w} z={b.z} /> : null}
        {/* лежащие детали: сначала торцы и тени, потом лица */}
        {(["under", "face"] as const).map((part) => lying.map(({ p, pose }) => <TopPiece key={`${part}-${p.id}`} part={part} p={p} pose={pose} X={X(pose.u)} Y={Y(pose.w)} k={k} uid={`tp-${p.id}`} />))}
        {raised.map(({ p, pose }) => (
          <TopPiece key={`r-${p.id}`} p={p} pose={pose} X={X(pose.u)} Y={Y(pose.w) - pose.z * k * 0.25} k={k} uid={`tr-${p.id}`} />
        ))}
        {b.holder ? <TopBox X={X} Y={Y} k={k} u={b.u} w={b.w} z={b.z} /> : null}
        {/* руки: Амир (слева в этом виде), Юсуф (снизу) */}
        {handNode(ch.aHand("R", f), { u: ax - 50, w: 232, z: 0 }, 1, AMIR_HANDS, "aR")}
        {handNode(ch.aHand("L", f), { u: ax + 50, w: 232, z: 0 }, -1, AMIR_HANDS, "aL")}
        {handNode(ch.yHand("L", f), { u: yx + 46, w: 226, z: 0 }, -1, YUSUF_HANDS, "yL")}
        {handNode(ch.yHand("R", f), { u: yx - 46, w: 226, z: 0 }, 1, YUSUF_HANDS, "yR")}
      </svg>
    </div>
  );
};

type Proj = { readonly X: (u: number) => number; readonly Y: (w: number) => number; readonly k: number };

// Пустая коробка сверху: стенки и пустое дно.
const TopBox: React.FC<Proj & { readonly u: number; readonly w: number; readonly z: number }> = ({ X, Y, k, u, w, z }) => {
  const grow = 1 + z * 0.004;
  const bw = BOX.w * k * grow;
  const bd = BOX.d * k * grow;
  const cx = X(u);
  const cy = Y(w) - z * k * 0.25;
  const wall = 4 * k;
  return (
    <g>
      <rect x={cx - bw / 2 + 6 + z * k * 0.1} y={cy - bd / 2 - 4 - z * k * 0.06} width={bw} height={bd} rx={6} fill="#3A2614" opacity={0.22} style={{ filter: "blur(4px)" }} />
      <rect x={cx - bw / 2} y={cy - bd / 2} width={bw} height={bd} rx={5} fill="#E2BE86" stroke="#B98F5B" strokeWidth={2} />
      <rect x={cx - bw / 2 + wall} y={cy - bd / 2 + wall} width={bw - 2 * wall} height={bd - 2 * wall} rx={3} fill="#C99E66" />
      <rect x={cx - bw / 2 + wall} y={cy - bd / 2 + wall} width={bw - 2 * wall} height={wall * 0.8} fill="#B98F5B" opacity={0.6} />
    </g>
  );
};

const TopBooks: React.FC<Proj> = ({ X, Y, k }) => {
  const cx = X(BOOKS.u);
  const cy = Y(BOOKS.w);
  const boat = { x: X(BOAT.u), y: Y(BOAT.w) };
  return (
    <g>
      <rect x={cx - 34 * k + 6} y={cy - 46 * k - 4} width={68 * k} height={92 * k} rx={6} fill="#3A2614" opacity={0.2} style={{ filter: "blur(4px)" }} />
      <rect x={cx - 34 * k} y={cy - 46 * k} width={68 * k} height={92 * k} rx={5} fill="#3F5E8C" />
      <g transform={`rotate(6 ${cx} ${cy})`}>
        <rect x={cx - 30 * k} y={cy - 42 * k} width={62 * k} height={84 * k} rx={5} fill="#C85A4A" />
        <rect x={cx - 22 * k} y={cy - 30 * k} width={46 * k} height={30 * k} rx={3} fill="#F4EFE4" opacity={0.85} />
        <circle cx={cx + 1 * k} cy={cy - 15 * k} r={8 * k} fill="#F7D35C" />
      </g>
      {/* лодочка сверху */}
      <g transform={`translate(${boat.x} ${boat.y}) scale(${k * 0.9})`}>
        <path d="M -34 -9 L 34 -9 L 24 9 L -24 9 Z" fill="#EEE9DC" stroke="#CFC7B6" strokeWidth={1.5 / k} />
        <path d="M -16 0 L 0 -6 L 16 0 L 0 6 Z" fill="#FFFFFF" stroke="#CFC7B6" strokeWidth={1.2 / k} />
      </g>
    </g>
  );
};

const TopAmirBook: React.FC<Proj & { readonly open: number }> = ({ X, Y, k, open }) => {
  const cx = X(AMIR_BOOK.u);
  const cy = Y(AMIR_BOOK.w);
  const pw = 34 * k;
  return (
    <g>
      <rect x={cx - pw - 4} y={cy - 24 * k - 2} width={2 * pw + 8} height={48 * k + 4} rx={4} fill="#5E7A6B" />
      {open > 0.05 ? (
        <>
          <rect x={cx} y={cy - 23 * k} width={pw * 0.98} height={46 * k} fill="#FBF8F1" />
          <rect x={cx - pw * open} y={cy - 23 * k} width={pw * open} height={46 * k} fill="#FBF8F1" stroke="#E2DACB" strokeWidth={1} />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M ${cx + 6} ${cy - 16 * k + i * 6 * k} l ${pw * 0.8} 0`} stroke="#B9B2A4" strokeWidth={2} />
          ))}
        </>
      ) : (
        <rect x={cx - 2} y={cy - 24 * k} width={pw + 4} height={48 * k} rx={4} fill="#6D8B7A" />
      )}
    </g>
  );
};

export type { PiecePose };
