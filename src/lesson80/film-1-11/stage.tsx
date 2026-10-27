// Стейдж фильма 80-1-11: одна комната со всеми 26 персонажами (25 мальчиков и
// учитель) и реквизитом; два вида — комната (с камерой) и «карточка сверху».
// Порядок рисования по глубине (y ступней): задняя стена с доской и плакатом,
// полочка с Кораном, дверь (Амир в проёме рисуется между коридором и
// створкой), столик с ростком и подносом у стены, ученики (тело → книга или
// тетрадь → кисти), главные герои (тело → предмет в руках → кисти),
// низкий столик с папкой, лодочкой, карточками и карандашом. Кто стоит или
// сидит за низким столиком, рисуется до столешницы; его кисти с предметом —
// поверх неё.
import { Fragment, useMemo } from "react";
import { nestingBirdPose } from "../bird/birdPose";
import { box, Shot, type Cam } from "../core/shots";
import type { L80Role } from "../core/roles";
import { Actor } from "../rig/Actor";
import type { Look } from "../rig/looks";
import { RoomBack, Sprout } from "../sets/Classroom";
import { ROOM } from "../sets/roomLayout";
import { CurtainLayer, PaperBoat } from "../film-1-7/set";
import { FlatSheet, Pencil } from "../film-1-8/drawings";
import { Table } from "../film-1-8/set";
import { CAST, TEACHER } from "./cast";
import { CARD_UNITS } from "./card";
import { ReminderCardContent } from "./cardview";
import { buildChoreo, type BgItem, type Choreo, type Ctl } from "./choreo";
import { BAG_SPOT, BOAT, CARD_SPOT, CARD_WORK, CARDS, DOOR, FOLDER, JUG, PENCIL, PLANT_TABLE, POT, SAUCER, TABLE, TEACHER_BOOK, TRAY } from "./layout";
import { Bag, CardStack, ClosedFolder, Cup, cupLip, DoorCasing, DoorOpening, DoorPanel, HeldBook, Jug, jugSpout, LyingBook, Notebook, OpenBook, PlantTable, Poster, QuranShelf, Saucer, Stream, Tray } from "./props";
import type { L80Timeline } from "./timeline";

export { CardView } from "./cardview";

export const useChoreo = (tl: L80Timeline): Choreo => useMemo(() => buildChoreo(tl), [tl]);

const TEACHER_BOOK_COLOR = "#6B4E8C";

// Зелёный карандаш Билала в комнате (кончик в точке, angle — наклон корпуса).
const GreenPencil: React.FC<{ x: number; y: number; angle: number }> = ({ x, y, angle }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <g transform={`rotate(${angle})`}>
      <rect x={-3} y={-54} width={6} height={50} fill="#3E8E52" stroke="#2C6B3C" strokeWidth={1} />
      <path d="M -3 -4 L 0 4 L 3 -4 Z" fill="#E8D2A6" />
      <path d="M -1 1 L 0 4 L 1 1 Z" fill="#2E6B3C" />
      <rect x={-3} y={-58} width={6} height={5} fill="#E2E2DC" />
    </g>
  </svg>
);

// Закрытая книга, лежащая плашмя (на коленях или на столе).
const FlatBook: React.FC<{ x: number; y: number; w: number; color: string }> = ({ x, y, w, color }) => {
  const h = w * 0.34;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <ellipse cx={0} cy={h * 0.55} rx={w * 0.56} ry={h * 0.32} fill="#000" opacity={0.1} />
      <rect x={-w / 2} y={-h / 2 + 2} width={w} height={h} rx={3} fill="#EDE5D3" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.82} rx={3} fill={color} />
      <rect x={-w / 2} y={-h / 2} width={w * 0.08} height={h * 0.82} rx={2} fill="#000" opacity={0.16} />
    </svg>
  );
};

const BgItemView: React.FC<{ readonly it: BgItem }> = ({ it }) => {
  if (it.kind === "closed") return <FlatBook x={it.pos.x} y={it.pos.y} w={it.w} color={it.color} />;
  if (it.kind === "book") return <OpenBook x={it.pos.x} y={it.pos.y} w={it.w} flip={it.flip} color={it.color} />;
  return (
    <>
      <Notebook x={it.pos.x} y={it.pos.y} w={it.w} progress={it.progress} color={it.color} />
      {it.pencil ? <Pencil x={it.pencil.x} y={it.pencil.y} angle={28} /> : null}
    </>
  );
};

// Стоит или сидит за низким столиком (рисуется до столешницы).
const behindTable = (x: number, y: number) => x > TABLE.x1 - 70 && x < TABLE.x2 + 60 && y >= TABLE.top - 4 && y < TABLE.top + 110;

type Main = { key: "amir" | "yusuf" | "bilal" | "teacher"; ctl: Ctl; role: L80Role; look: Look; seed: number };

// ---------- комната ----------
export const RoomView: React.FC<{ readonly f: number; readonly tl: L80Timeline; readonly ch: Choreo; readonly diag?: boolean }> = ({ f, ch, diag = false }) => {
  type Item = { y: number; key: string; node: React.ReactNode };
  const items: Item[] = [];
  // 22 ученика на ковре: тело → книга/тетрадь → кисти
  for (const p of CAST) {
    if (p.main) continue;
    const ctl = ch.bg(p);
    const it = ch.bgItem(p, f);
    items.push({
      y: ctl.place(f).y,
      key: p.id,
      node: (
        <Fragment key={p.id}>
          <Actor uid={`r-${p.id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} seed={p.seed} layer="body" />
          <BgItemView it={it} />
          <Actor uid={`r-${p.id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} seed={p.seed} layer="arms" />
        </Fragment>
      ),
    });
  }
  // предметы в руках главных героев
  const bag = ch.bag(f);
  const book = ch.book(f);
  const jug = ch.jug(f);
  const cup = ch.cup(f);
  const stream = ch.stream(f);
  const card = ch.card(f);
  const pencil = ch.pencil(f);
  const inHand = cup.holder === "amir" || cup.holder === "teacher" || cup.holder === "both";
  const cupNode = <Cup key="cup" x={cup.pos.x} y={cup.pos.y} tilt={cup.tilt} fill={cup.fill} shadow={inHand ? 0 : 1} />;
  const cupStream = stream?.kind === "cup" ? <Stream key="stream" from={cupLip({ x: cup.pos.x, y: cup.pos.y, tilt: cup.tilt, scale: 1 })} to={stream.to} amount={stream.amount} t={f} /> : null;
  const carried = (key: Main["key"]): React.ReactNode => {
    const out: React.ReactNode[] = [];
    if (key === "amir") {
      if (bag.state === "carried") out.push(<Bag key="bag" x={bag.pos.x} y={bag.pos.y} state="carried" />);
      if (cup.holder === "amir") out.push(cupNode, cupStream);
    }
    if (key === "teacher") {
      if (book.where === "hands") out.push(<HeldBook key="book" x={book.pos.x} y={book.pos.y} w={78} open={book.open} angle={book.angle} color={TEACHER_BOOK_COLOR} />);
      if (jug.held) {
        out.push(<Jug key="jug" x={jug.pos.x} y={jug.pos.y} tilt={jug.tilt} shadow={jug.pos.y < JUG.y - 2 ? 0 : 1} />);
        if (stream?.kind === "jug") out.push(<Stream key="jstream" from={jugSpout({ x: jug.pos.x, y: jug.pos.y, tilt: jug.tilt, scale: 1 })} to={stream.to} amount={stream.amount} t={f} width={3.5} />);
      }
      if (cup.holder === "teacher" || cup.holder === "both") out.push(cupNode);
    }
    if (key === "bilal") {
      if (card.state === "held")
        out.push(
          <FlatSheet key="card" x={card.pos.x} y={card.pos.y} w={CARD_WORK.w} units={CARD_UNITS} flat={card.flat} rot={card.rot}>
            <ReminderCardContent progress={card.progress} uid="card-held" />
          </FlatSheet>,
        );
      if (pencil.inHand) out.push(<GreenPencil key="pencil" x={pencil.tip.x} y={pencil.tip.y} angle={pencil.angle} />);
    }
    return out.filter(Boolean).length ? <>{out}</> : null;
  };
  const mains: Main[] = [
    ...(["yusuf", "amir", "bilal"] as const).map((id) => {
      const p = CAST.find((x) => x.id === id)!;
      return { key: id, ctl: ch[id], role: id as L80Role, look: p.look, seed: p.seed };
    }),
    { key: "teacher", ctl: ch.teacher, role: "muhammad", look: TEACHER.look, seed: 3 },
  ];
  let doorway: React.ReactNode = null;
  for (const c of mains) {
    const pl = c.ctl.place(f);
    const hold = c.ctl.holding(f);
    const actor = (layer: "all" | "body" | "arms") => <Actor key={`${c.key}-${layer}`} uid={`r-${c.key}`} look={c.look} f={f} place={c.ctl.place} face={c.ctl.face} pose={c.ctl.pose} role={c.role} seed={c.seed} layer={layer} />;
    const things = carried(c.key);
    if (c.key === "amir" && ch.inDoorway(f)) {
      doorway = (
        <>
          {actor("body")}
          {things}
          {actor("arms")}
        </>
      );
      continue;
    }
    const behind = behindTable(pl.x, pl.y);
    // за столиком — раньше столика, но между собой по глубине (кто ближе — впереди)
    const y = behind ? TABLE.top - 0.5 + Math.min(0.39, Math.max(0, pl.y - TABLE.top) / 300) + pl.x / 1e7 : pl.y;
    if (!hold && !things) {
      items.push({ y, key: c.key, node: actor("all") });
      continue;
    }
    items.push({ y, key: `${c.key}-body`, node: actor("body") });
    if (things) items.push({ y: behind ? TABLE.top + 2 : y + 0.1, key: `${c.key}-things`, node: <Fragment key={`${c.key}-things`}>{things}</Fragment> });
    items.push({ y: behind ? TABLE.top + 3 : y + 0.2, key: `${c.key}-arms`, node: actor("arms") });
  }
  // низкий столик и предметы на нём
  items.push({ y: TABLE.top + 1, key: "table", node: <Table key="table" /> });
  items.push({
    y: TABLE.top + 1.5,
    key: "table-props",
    node: (
      <Fragment key="table-props">
        <ClosedFolder x={FOLDER.x} y={FOLDER.y} w={FOLDER.w} />
        <CardStack x={CARDS.x} y={CARDS.y} w={CARDS.w} count={ch.cardsCount(f)} />
        {card.state === "work" ? (
          <FlatSheet x={card.pos.x} y={card.pos.y} w={CARD_WORK.w} units={CARD_UNITS} flat={1} rot={card.rot}>
            <ReminderCardContent progress={card.progress} uid="card-table" />
          </FlatSheet>
        ) : null}
        {!pencil.inHand ? <GreenPencil x={PENCIL.x} y={PENCIL.y} angle={PENCIL.angle} /> : null}
        {book.where === "table" ? <LyingBook x={TEACHER_BOOK.x} y={TEACHER_BOOK.y} w={TEACHER_BOOK.w} color={TEACHER_BOOK_COLOR} /> : null}
        <PaperBoat x={BOAT.x} y={BOAT.y} />
      </Fragment>
    ),
  });
  // подоконник: поднос с кувшином и чашкой (у стены — за столиком с ростком)
  items.push({
    y: PLANT_TABLE.floorY - 1,
    key: "sill-tray",
    node: (
      <Fragment key="sill-tray">
        <Tray x={TRAY.x} y={TRAY.y} w={TRAY.w} />
        {!jug.held ? <Jug x={jug.pos.x} y={jug.pos.y} tilt={0} /> : null}
        {cup.holder === "tray" ? cupNode : null}
      </Fragment>
    ),
  });
  // столик с ростком у окна: росток, поддон, чашка после полива, карточка
  items.push({
    y: PLANT_TABLE.floorY,
    key: "plant-table",
    node: (
      <Fragment key="plant-table">
        <PlantTable />
        <Saucer x={SAUCER.x} y={SAUCER.y} />
        <Sprout x={POT.x} y={POT.base} />
        {cup.holder === "table" ? cupNode : null}
        {card.state === "atPot" ? (
          <FlatSheet x={CARD_SPOT.x} y={CARD_SPOT.y - (CARD_UNITS.h * CARD_SPOT.w) / CARD_UNITS.w / 2} w={CARD_SPOT.w} units={CARD_UNITS} flat={0}>
            <ReminderCardContent progress={1} uid="card-pot" />
          </FlatSheet>
        ) : null}
      </Fragment>
    ),
  });
  if (bag.state === "down") items.push({ y: BAG_SPOT.y, key: "bag", node: <Bag key="bag" x={BAG_SPOT.x} y={BAG_SPOT.y} state="down" /> });
  items.sort((a, b) => a.y - b.y);
  return (
    <>
      <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} sprout={false} softLight />
      <CurtainLayer curtain={0} />
      <Poster />
      <QuranShelf />
      <DoorOpening />
      {doorway ? (
        <div style={box({ left: 0, top: 0, width: ROOM.w, height: ROOM.h, clipPath: `inset(${DOOR.top}px ${ROOM.w - DOOR.x - DOOR.w}px ${ROOM.h - DOOR.bottom}px ${DOOR.x}px)` })}>{doorway}</div>
      ) : null}
      <DoorCasing />
      <DoorPanel open={ch.door(f)} />
      {items.map((i) => (
        <Fragment key={i.key}>{i.node}</Fragment>
      ))}
      {diag ? <DiagLabels f={f} ch={ch} /> : null}
    </>
  );
};

// Диагностика (только для проверки, не для экспорта детям): ID над головой
// каждого персонажа — чтобы посчитать 25 мальчиков и учителя по кадру.
const DiagLabels: React.FC<{ readonly f: number; readonly ch: Choreo }> = ({ f, ch }) => {
  const rows: { id: string; x: number; y: number }[] = [];
  for (const p of CAST) {
    const ctl = p.main ? ch[p.id as "yusuf" | "amir" | "bilal"] : ch.bg(p);
    const pl = ctl.place(f);
    const sit = ctl.pose(f).floorSit ?? 0;
    rows.push({ id: p.id, x: pl.x, y: pl.y - pl.h * (sit > 0.5 ? 0.62 : 1.02) });
  }
  const tp = ch.teacher.place(f);
  const ts = ch.teacher.pose(f).floorSit ?? 0;
  rows.push({ id: "muhammad", x: tp.x, y: tp.y - tp.h * (ts > 0.5 ? 0.62 : 1.02) });
  return (
    <>
      {rows.map((r, i) => (
        <div key={r.id} style={box({ left: r.x - 60, top: r.y - 34 - (i % 2) * 18, width: 120, textAlign: "center", fontSize: 22, fontWeight: 800, color: "#FFFFFF", backgroundColor: r.id === "muhammad" ? "rgba(40,60,140,0.85)" : "rgba(200,30,30,0.85)", borderRadius: 8, fontFamily: "sans-serif" })}>
          {r.id.replace("pupil", "bg-")}
        </div>
      ))}
    </>
  );
};

// ---------- план комнаты с камерой ----------
export const RoomShot: React.FC<{ readonly f: number; readonly tl: L80Timeline; readonly ch: Choreo; readonly cam: Cam; readonly overlay?: React.ReactNode; readonly diag?: boolean }> = ({ f, tl, ch, cam, overlay, diag }) => (
  <Shot f={f} from={-1} to={Number.MAX_SAFE_INTEGER} cam={cam} bg="#F1E7D6" overlay={overlay}>
    <RoomView f={f} tl={tl} ch={ch} diag={diag} />
  </Shot>
);
