// Стейдж фильма 80-1-10 — вид комнаты: тот же класс, что в 80-1-6…80-1-9,
// учитель, 25 мальчиков с планшетами для рисования, низкий столик у окна с
// большим листом, карточками, пеналом, папкой «Наши вопросы» и лодочкой
// Амира; Коран — на подставке на отдельной тумбе; прежний рисунок Земли —
// на стене; в сцене 8 плакат висит на доске. Порядок рисования — по глубине
// (y ступней): тела → планшеты → руки учеников; за столиком: тела →
// столик → предметы на нём → предметы в руках → кисти, касающиеся предметов.
import { nestingBirdPose } from "../bird/birdPose";
import { Shot, type Cam } from "../core/shots";
import type { L80Role } from "../core/roles";
import { TEACHER } from "../characters/characterConfig";
import { Actor } from "../rig/Actor";
import { RoomBack } from "../sets/Classroom";
import { PaperBoat } from "./boat";
import type { BoatPlan } from "./boatPlan";
import { posterGrips, type Choreo } from "./choreo";
import { DESK, deskToWorld, LAMP_ASIDE, POSTER, POSTER_ON_BOARD, POSTER_ON_DESK, TABLE, type Vec } from "./layout";
import type { Plan } from "./plan";
import { posterViewAt } from "./posterState";
import { CardProp, ClosedFolderProp, LampAside, LapBoard, MarkerProp, OldEarthOnWall, PencilProp, PencilTray, PosterProp, QuranCorner, Table, TapeHolderProp, TextCardProp } from "./props";
import { classRoster, rosterById } from "./roster";
import { pencilBackAt, pencilInTray, TRAY_PENCILS } from "./deskHands";

// Пальцы учителя на лицевой стороне поднятого листа (кисть — за листом).
const PosterFingers: React.FC<{ readonly grips: readonly [Vec, Vec] }> = ({ grips }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    {grips.map((g, i) => {
      const dir = i === 0 ? 1 : -1; // пальцы смотрят внутрь листа
      return (
        <g key={i} transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) scale(${dir} 1)`}>
          {[-7, -1.5, 4, 9].map((dy, k) => (
            <rect key={k} x={-2} y={dy - 2.6} width={k === 3 ? 10 : 13} height={5.2} rx={2.6} fill={TEACHER.look.skin} stroke={TEACHER.look.skinShade} strokeWidth={0.7} />
          ))}
        </g>
      );
    })}
  </svg>
);

// Кадры возврата карандашей в пенал — один раз на план (перебор кадров).
const backCache = new WeakMap<Plan, ReturnType<typeof pencilBackAt>>();
const pencilBackFor = (pl: Plan) => {
  let b = backCache.get(pl);
  if (!b) {
    b = pencilBackAt(pl);
    backCache.set(pl, b);
  }
  return b;
};

type Item = { readonly y: number; readonly key: string; readonly node: React.ReactNode };

const MAIN = ["bilal", "amir", "yusuf"] as const;

export const RoomView: React.FC<{ readonly f: number; readonly pl: Plan; readonly bp: BoatPlan; readonly ch: Choreo }> = ({ f, pl, bp, ch }) => {
  const items: Item[] = [];
  const pv = posterViewAt(pl, f);
  const held = ch.held(f);

  // 22 ученика: тело → планшет с карточкой → руки
  for (const r of classRoster) {
    if (r.main) continue;
    const c = ch.bg(r);
    const P = c.place(f);
    const cs = pl.cardState(r.id, f);
    const b = ch.boardOf(r);
    items.push({ y: P.y, key: r.id, node: <Actor key={r.id} uid={`r-${r.id}`} look={r.pupil.look} f={f} place={c.place} face={c.face} pose={c.pose} seed={r.pupil.seed} layer="body" walkFrom={100000} /> });
    items.push({ y: P.y + 0.3, key: `${r.id}-board`, node: <LapBoard key={`${r.id}-board`} center={b.center} w={b.w} kind={r.drawing} progress={cs.progress} cardOn={cs.where === "owner"} uid={`lb-${r.id}`} /> });
    items.push({ y: P.y + 0.6, key: `${r.id}-arms`, node: <Actor key={`${r.id}-arms`} uid={`r-${r.id}`} look={r.pupil.look} f={f} place={c.place} face={c.face} pose={c.pose} seed={r.pupil.seed} layer="arms" walkFrom={100000} /> });
  }

  // учитель и главные мальчики: за столиком — тела до столешницы, кисти поверх
  // предметов только при касании; у доски и в пути — по глубине.
  const people: { key: string; ctl: Choreo["teacher"]; role: L80Role; look: typeof TEACHER.look; seed: number }[] = [
    ...MAIN.map((id) => ({ key: id, ctl: ch[id], role: id as L80Role, look: rosterById(id).pupil.look, seed: rosterById(id).pupil.seed })),
    { key: "teacher", ctl: ch.teacher, role: "muhammad", look: TEACHER.look, seed: 3 },
  ];
  for (const c of people) {
    const P = c.ctl.place(f);
    // за столиком (сидит, встаёт или проходит за ним): тело рисуется до
    // столешницы, и стол закрывает ноги; иначе — по глубине
    const atTable = P.x > TABLE.x1 - 30 && P.x < TABLE.x2 + 30 && P.y > TABLE.top - 45;
    const front = c.ctl.armsFront(f);
    // учитель сидит чуть дальше мальчиков: рядом с Юсуфом его плечо — за Юсуфом
    const yBody = atTable ? Math.min(P.y, TABLE.top - (c.key === "teacher" ? 0.7 : 0.5)) : P.y;
    const yArms = atTable ? TABLE.top + 3 : P.y + 0.6;
    items.push({ y: yBody, key: c.key, node: <Actor key={c.key} uid={`r-${c.key}`} look={c.look} f={f} place={c.ctl.place} face={c.ctl.face} pose={c.ctl.pose} role={c.role} seed={c.seed} layer={front ? "body" : "all"} /> });
    if (front) items.push({ y: yArms, key: `${c.key}-arms`, node: <Actor key={`${c.key}-arms`} uid={`r-${c.key}`} look={c.look} f={f} place={c.ctl.place} face={c.ctl.face} pose={c.ctl.pose} role={c.role} seed={c.seed} layer="arms" /> });
  }

  // столик и предметы на нём
  items.push({ y: TABLE.top + 1, key: "table", node: <Table key="table" /> });
  const onTable: React.ReactNode[] = [];
  const posterLying = f < pl.posterLift.grip;
  if (posterLying) {
    const c = deskToWorld(POSTER_ON_DESK.u0 + POSTER.w / 2, POSTER_ON_DESK.v0 + POSTER.h / 2);
    onTable.push(<PosterProp key="poster" center={c} v={pv} lift={0} spread={pl.posterSpread(f)} uid="room-poster" />);
  }
  // карточки главных героев на их местах
  for (const id of MAIN) {
    const cs = pl.cardState(id, f);
    if (cs.where === "owner" && cs.desk) onTable.push(<CardProp key={`card-${id}`} center={deskToWorld(cs.desk.x, cs.desk.y)} kind={cs.kind} progress={cs.progress} rot={cs.rot} uid={`room-card-${id}`} />);
  }
  // стопка собранных карточек у учителя
  const collected = pl.cards(f).filter((c) => c.where === "stack" && c.holder === "muhammad" && c.desk).length;
  if (collected) {
    const w = deskToWorld(DESK.collected.x, DESK.collected.y);
    for (let i = 0; i < Math.min(5, collected); i++) onTable.push(<CardProp key={`col-${i}`} center={{ x: w.x + i * 0.6, y: w.y - i * 1.1 }} kind="sun" back rot={DESK.collected.rot} uid={`room-col-${i}`} />);
  }
  // пенал и карандаши: как в виде сверху (deskHands.ts) — Юсуф, Амир и
  // лодочный карандаш возвращают карандаш в пенал, Билал оставляет свой у карточки
  const back = pencilBackFor(pl);
  const missing: string[] = [];
  for (const owner of ["yusuf", "amir", "bilal", "boat"] as const) {
    if (!pencilInTray(pl, owner, f, back)) missing.push(TRAY_PENCILS.find((p) => p.owner === owner)!.color);
  }
  onTable.push(<PencilTray key="tray" center={deskToWorld(DESK.pencilTray.x, DESK.pencilTray.y)} missing={missing} />);
  for (const id of MAIN) {
    const ps = pl.pencil(id, f);
    if (!ps.inHand && f >= pl.pencilTake[id].grab && !pencilInTray(pl, id, f, back)) {
      const w = deskToWorld(ps.desk.x, ps.desk.y);
      onTable.push(<PencilProp key={`pen-${id}`} tip={w} angle={84} color={ps.color} />);
    }
  }
  if (f < pl.write.cap - 2 || f >= pl.markerDown) onTable.push(<MarkerProp key="marker" tip={deskToWorld(DESK.marker.x, DESK.marker.y)} angle={DESK.marker.rot} capOff={false} />);
  onTable.push(<ClosedFolderProp key="folder" center={deskToWorld(DESK.folder.x, DESK.folder.y)} />);
  onTable.push(<TapeHolderProp key="tape" center={deskToWorld(DESK.tapeHolder.x, DESK.tapeHolder.y)} />);
  for (const which of ["two", "one"] as const) {
    const ts = pl.textState(which, f);
    if (ts.where === "stack") onTable.push(<TextCardProp key={`tc-${which}`} which={which} center={deskToWorld(ts.desk.x, ts.desk.y)} back rot={DESK.textStack.rot} />);
  }
  // лодочка Амира
  const bpl = ch.boatPlace(f);
  onTable.push(<PaperBoat key="boat" x={bpl.x} y={bpl.y} w={bpl.w} lift={bpl.lift} tilt={bpl.tilt} pivot={bpl.pivot} open={bp.open(f)} pressed={bp.pressed(f)} />);
  items.push({ y: TABLE.top + 1.5, key: "props", node: <>{onTable}</> });

  // предметы в руках
  const carried: React.ReactNode[] = [];
  let posterNode: React.ReactNode = null;
  let posterLift = 0;
  let gripNode: React.ReactNode = null;
  for (const [i, h] of held.entries()) {
    if (h.type === "card") {
      const r = classRoster.find((x) => x.id === h.id)!;
      const cs = pl.cardState(h.id, f);
      carried.push(<CardProp key={`h-${i}`} center={h.pos} kind={r.drawing} progress={cs.progress} squash={1 - h.squash} rot={h.rot} uid={`held-${h.id}`} />);
    } else if (h.type === "stack") {
      for (let k = 0; k < Math.min(4, h.count); k++) carried.push(<CardProp key={`hs-${i}-${k}`} center={{ x: h.pos.x + k * 0.8, y: h.pos.y - k * 1.4 }} kind="sun" back squash={0.4} uid={`hs-${i}-${k}`} />);
    } else if (h.type === "textCard") {
      carried.push(<TextCardProp key={`ht-${i}`} which={h.which} center={h.pos} back={h.back} squash={0.15} />);
    } else if (h.type === "pencil") {
      carried.push(<PencilProp key={`hp-${i}`} tip={h.tip} angle={h.angle} color={h.color} />);
    } else if (h.type === "marker") {
      carried.push(<MarkerProp key={`hm-${i}`} tip={h.tip} angle={h.angle} capOff={h.capOff} />);
    } else if (h.type === "poster") {
      posterNode = <PosterProp key="held-poster" center={h.center} v={pv} lift={h.lift} uid="held-poster" />;
      posterLift = h.lift;
      if (h.lift > 0.3) gripNode = <PosterFingers grips={posterGrips(h.center, h.lift)} />;
    }
  }
  // предметы в руках учеников и Билала — на глубине того, кто держит
  for (const [i, hb] of ch.heldBg(f).entries()) {
    const h = hb.item;
    let node: React.ReactNode = null;
    if (h.type === "card") {
      const r = classRoster.find((x) => x.id === h.id)!;
      node = <CardProp key={`hb-${i}`} center={h.pos} kind={r.drawing} progress={1} squash={1 - h.squash} rot={h.rot} uid={`hb-${h.id}`} />;
    } else if (h.type === "stack") {
      node = (
        <div key={`hb-${i}`} style={{ display: "contents" }}>
          {Array.from({ length: Math.min(4, h.count) }, (_, k) => (
            <CardProp key={k} center={{ x: h.pos.x + k * 0.7, y: h.pos.y - k * 1.2 }} kind="sun" back squash={0.45} uid={`hbs-${i}-${k}`} />
          ))}
        </div>
      );
    }
    if (node) items.push({ y: hb.y, key: `hb-${i}`, node });
  }
  const tP = ch.teacher.place(f);
  const teacherAtTable = tP.x > TABLE.x1 - 30 && tP.x < TABLE.x2 + 30 && tP.y > TABLE.top - 45;
  items.push({ y: TABLE.top + 2, key: "carried", node: <>{carried}</> });
  // поднятый лист — перед руками учителя, видны только пальцы на краях;
  // пока лист лежит/только отрывается от стола — руки поверх листа
  const raised = posterLift > 0.3;
  if (posterNode) items.push({ y: teacherAtTable ? (raised ? TABLE.top + 3.5 : TABLE.top + 2.5) : tP.y + 0.7, key: "poster-held", node: posterNode });
  if (gripNode) items.push({ y: teacherAtTable ? TABLE.top + 3.6 : tP.y + 0.8, key: "poster-grip", node: gripNode });
  items.sort((a, b) => a.y - b.y);

  const onBoard = ch.posterOnBoard(f);
  const b = POSTER_ON_BOARD;
  return (
    <>
      <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} />
      <LampAside baseX={LAMP_ASIDE.baseX} baseY={LAMP_ASIDE.baseY} />
      <OldEarthOnWall />
      <QuranCorner />
      {onBoard ? <PosterProp center={{ x: b.x + b.w / 2, y: b.y + b.h / 2 }} v={pv} lift={1} uid="board-poster" /> : null}
      {items.map((i) => (
        <div key={i.key} style={{ display: "contents" }}>
          {i.node}
        </div>
      ))}
    </>
  );
};

export const RoomShot: React.FC<{ readonly f: number; readonly pl: Plan; readonly bp: BoatPlan; readonly ch: Choreo; readonly cam: Cam; readonly overlay?: React.ReactNode }> = ({ f, pl, bp, ch, cam, overlay }) => (
  <Shot f={f} from={-1} to={Number.MAX_SAFE_INTEGER} cam={cam} bg="#F1E7D6" overlay={overlay}>
    <RoomView f={f} pl={pl} bp={bp} ch={ch} />
  </Shot>
);
