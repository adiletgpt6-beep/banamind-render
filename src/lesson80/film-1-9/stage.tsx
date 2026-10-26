// Стейдж фильма 80-1-9: комната со всеми 26 персонажами, столик с угощением,
// дастарханы с тарелками учеников, поднос и 25 салфеток; вставка сада.
// Порядок рисования — по глубине (y точки опоры). У персонажа с предметом в
// руке: тело → руки с ладонями → предмет → пальцы (предмет зажат между ладонью
// и пальцами). За столиком (как в 80-1-8): тела → столик → лежащие предметы →
// предметы в руках → кисти, касающиеся предметов. Всё состояние — функция
// номера кадра.
import { useMemo } from "react";
import { fontFamily } from "../../fonts";
import { nestingBirdPose } from "../bird/birdPose";
import { Shot, type Cam } from "../core/shots";
import type { L80Role } from "../core/roles";
import { Actor, actorAnchors } from "../rig/Actor";
import { RoomBack } from "../sets/Classroom";
import { CurtainLayer } from "../film-1-7/set";
import { GlobeOnFloor, LampAside, Table } from "../film-1-8/set";
import { BG_IDS, castById, TEACHER } from "./cast";
import { buildChoreo, type AnchorFn, type Choreo, type Ctl, type NapkinPose } from "./choreo";
import { AppleSlice, CupView, Dastarkhan, JugView, NapkinView, PlateView, QuranOnShelf, SillDisplay, TrayView } from "./props";
import { BG_PLATE_DY, BG_PLATE_W, CLOTHS, CUPS, GLOBE_FLOOR, JUG, PLATE_W, PLATES, QURAN_SHELF, ROWS, SILL_ITEMS, TABLE, TRAY_W } from "./layout";
import type { L80Timeline } from "./timeline";

// Рот и кисти — по тем же построениям, что рисует Actor.
const anchorsOf: AnchorFn = (a) => actorAnchors(a);
export const useChoreo = (tl: L80Timeline): Choreo => useMemo(() => buildChoreo(tl, anchorsOf), [tl]);

type Item = { readonly y: number; readonly key: string; readonly node: React.ReactNode };
const TABLE_IDS = ["amir", "bilal", "yusuf"] as const;

const napkinNode = (n: NapkinPose) => <NapkinView key={n.id} x={n.pos.x} y={n.pos.y} w={n.w} rot={n.rot} flat={n.flat} />;
const holds = (n: NapkinPose, who: string) => n.holder === who || (n.holder === "both" && (n.ev.giver === who || n.ev.recipient === who));

// ---------- комната ----------
export const RoomView: React.FC<{ readonly f: number; readonly ch: Choreo }> = ({ f, ch }) => {
  const items: Item[] = [];
  const napkins = ch.napkins(f);
  const tray = ch.tray(f);
  const bilalPlace = ch.bilal.place(f);
  const bilalSeated = !tray.carried || f >= ch.route.sitDown.from;
  const atTable = (n: NapkinPose) => n.pos.y >= TABLE.top - 60 && n.pos.x >= TABLE.x1 - 20 && n.pos.x <= TABLE.x2 + 20;

  // дастарханы
  for (const c of CLOTHS) items.push({ y: c.y - 18, key: `cloth-${c.row}`, node: <Dastarkhan key={`cloth-${c.row}`} x1={c.x1} x2={c.x2} y={c.y} uid={`cloth-${c.row}`} /> });

  // фоновые ученики: тело, салфетка/кусочек в руке, кисти; тарелка и лежащая салфетка
  for (const id of BG_IDS) {
    const p = castById(id);
    const ctl = ch.bg(p);
    const pl = ctl.place(f);
    const held = napkins.find((n) => holds(n, id));
    const slice = ch.bgSlice(id, f);
    const y = pl.y;
    if (held || slice) {
      items.push({ y, key: id, node: <Actor key={id} uid={`r-${id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} seed={p.seed} layer="body" /> });
      items.push({ y: y + 0.2, key: `${id}-armsb`, node: <Actor key={`${id}-armsb`} uid={`r-${id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} seed={p.seed} layer="armsBack" /> });
      if (held) items.push({ y: y + 0.3, key: `${id}-napkin`, node: napkinNode(held) });
      if (slice) items.push({ y: y + 0.3, key: `${id}-slice`, node: <AppleSlice key={`${id}-slice`} x={slice.pos.x} y={slice.pos.y} w={slice.w} rot={slice.rot} bite={slice.bite} /> });
      items.push({ y: y + 0.6, key: `${id}-fingers`, node: <Actor key={`${id}-fingers`} uid={`r-${id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} seed={p.seed} layer="fingers" /> });
    } else {
      items.push({ y, key: id, node: <Actor key={id} uid={`r-${id}`} look={p.look} f={f} place={ctl.place} face={ctl.face} pose={ctl.pose} seed={p.seed} /> });
    }
    const row = p.seat.row as "A" | "B" | "C";
    const plateY = ROWS[row] + BG_PLATE_DY;
    items.push({ y: plateY, key: `${id}-plate`, node: <PlateView key={`${id}-plate`} x={pl.x} y={plateY} w={BG_PLATE_W} slices={ch.bgPlate(id, f)} uid={`plate-${id}`} /> });
  }
  // лежащие на ковре салфетки учеников
  for (const n of napkins) {
    if (n.holder !== null) continue;
    if (atTable(n)) continue;
    items.push({ y: n.pos.y + 0.1, key: `${n.id}-rest`, node: napkinNode(n) });
  }

  // Билал стоя (с подносом) — среди рядов; сидя — за столиком
  if (!bilalSeated) {
    const p = castById("bilal");
    const held = napkins.filter((n) => n.holder === "bilal" || n.holder === "both");
    items.push({ y: bilalPlace.y, key: "bilal", node: <Actor key="bilal" uid="r-bilal" look={p.look} f={f} place={ch.bilal.place} face={ch.bilal.face} pose={ch.bilal.pose} role="bilal" seed={p.seed} layer="body" /> });
    items.push({ y: bilalPlace.y + 0.2, key: "bilal-armsb", node: <Actor key="bilal-armsb" uid="r-bilal" look={p.look} f={f} place={ch.bilal.place} face={ch.bilal.face} pose={ch.bilal.pose} role="bilal" seed={p.seed} layer="armsBack" /> });
    items.push({ y: bilalPlace.y + 0.3, key: "tray", node: <TrayView key="tray" x={tray.pos.x} y={tray.pos.y} w={TRAY_W} count={tray.count} uid="tray" /> });
    for (const n of held) items.push({ y: bilalPlace.y + 0.35, key: `${n.id}-b`, node: napkinNode(n) });
    items.push({ y: bilalPlace.y + 0.6, key: "bilal-fingers", node: <Actor key="bilal-fingers" uid="r-bilal" look={p.look} f={f} place={ch.bilal.place} face={ch.bilal.face} pose={ch.bilal.pose} role="bilal" seed={p.seed} layer="fingers" /> });
  }

  // за столиком: тела до столешницы, кисти поверх предметов только при касании
  const table: { key: string; ctl: Ctl; role: L80Role; look: (typeof TEACHER)["look"]; seed: number }[] = [
    ...TABLE_IDS.filter((id) => id !== "bilal" || bilalSeated).map((id) => {
      const p = castById(id);
      return { key: id, ctl: ch[id], role: id as L80Role, look: p.look, seed: p.seed };
    }),
    { key: "teacher", ctl: ch.teacher, role: "muhammad", look: TEACHER.look, seed: 3 },
  ];
  const yPlateNow = ch.yusufPlate(f);
  const ysliceNow = ch.yusufSlice(f);
  const holding: Record<string, boolean> = {
    yusuf: ysliceNow !== null || napkins.some((n) => holds(n, "yusuf")),
    amir: napkins.some((n) => holds(n, "amir")),
    bilal: tray.carried || napkins.some((n) => holds(n, "bilal")),
    teacher: yPlateNow.carried,
  };
  for (const c of table) {
    const front = c.ctl.armsFront(f);
    const actor = (key: string, layer: "all" | "body" | "arms" | "armsBack" | "fingers") => (
      <Actor key={key} uid={`r-${c.key}`} look={c.look} f={f} place={c.ctl.place} face={c.ctl.face} pose={c.ctl.pose} role={c.role} seed={c.seed} layer={layer} />
    );
    if (holding[c.key] && front) {
      // предмет в руке над столиком: ладони — под предметом, пальцы — поверх
      items.push({ y: TABLE.top - 0.5, key: c.key, node: actor(c.key, "body") });
      items.push({ y: TABLE.top + 1.95, key: `${c.key}-armsb`, node: actor(`${c.key}-armsb`, "armsBack") });
      items.push({ y: TABLE.top + 3, key: `${c.key}-fingers`, node: actor(`${c.key}-fingers`, "fingers") });
    } else {
      items.push({ y: TABLE.top - 0.5, key: c.key, node: actor(c.key, front ? "body" : "all") });
      if (front) items.push({ y: TABLE.top + 3, key: `${c.key}-arms`, node: actor(`${c.key}-arms`, "arms") });
    }
  }
  items.push({ y: TABLE.top + 1, key: "table", node: <Table key="table" /> });
  // лежащее на столике: тарелки, салфетки, поднос, вода
  const yPlate = ch.yusufPlate(f);
  const plates = [
    { key: "plate-amir", x: PLATES.amir.x, y: PLATES.amir.y, slices: ch.bgPlate("amir", f) },
    { key: "plate-bilal", x: PLATES.bilal.x, y: PLATES.bilal.y, slices: ch.bgPlate("bilal", f) },
  ];
  items.push({
    y: TABLE.top + 1.5,
    key: "table-props",
    node: (
      <div key="table-props">
        {plates.map((p) => (
          <PlateView key={p.key} x={p.x} y={p.y} w={PLATE_W} slices={p.slices} uid={p.key} />
        ))}
        {!yPlate.carried ? <PlateView x={yPlate.pos.x} y={yPlate.pos.y} w={PLATE_W} slices={yPlate.slices} uid="plate-yusuf" /> : null}
        {!tray.carried ? <TrayView x={tray.pos.x} y={tray.pos.y} w={TRAY_W} count={tray.count} uid="tray" /> : null}
        {napkins.filter((n) => n.holder === null && atTable(n)).map((n) => napkinNode(n))}
        <JugView x={JUG.x} y={JUG.y} h={JUG.h} />
        {CUPS.map((c, i) => (
          <CupView key={i} x={c.x} y={c.y} h={c.h} />
        ))}
      </div>
    ),
  });
  // в руках за столиком: тарелка учителя, поднос Билала (садится), салфетки, кусочек Юсуфа
  const yslice = ch.yusufSlice(f);
  items.push({
    y: TABLE.top + 2,
    key: "carried",
    node: (
      <div key="carried">
        {yPlate.carried ? <PlateView x={yPlate.pos.x} y={yPlate.pos.y} w={PLATE_W} slices={yPlate.slices} uid="plate-yusuf-c" /> : null}
        {tray.carried && bilalSeated ? <TrayView x={tray.pos.x} y={tray.pos.y} w={TRAY_W} count={tray.count} uid="tray-c" /> : null}
        {napkins.filter((n) => n.holder === "yusuf" || n.holder === "amir" || (bilalSeated && (n.holder === "bilal" || n.holder === "both"))).map((n) => napkinNode(n))}
        {yslice ? <AppleSlice x={yslice.pos.x} y={yslice.pos.y} w={yslice.w} rot={yslice.rot} bite={yslice.bite} /> : null}
      </div>
    ),
  });
  items.push({ y: GLOBE_FLOOR.baseY, key: "globe", node: <GlobeOnFloor key="globe" at={GLOBE_FLOOR} /> });
  items.sort((a, b) => a.y - b.y);
  return (
    <>
      <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} softLight />
      <CurtainLayer curtain={0} />
      <QuranOnShelf x={QURAN_SHELF.x} y={QURAN_SHELF.y} w={QURAN_SHELF.w} />
      <SillDisplay boatX={SILL_ITEMS.boat.x} folderX={SILL_ITEMS.folder.x} folderW={SILL_ITEMS.folder.w} y={SILL_ITEMS.boat.y} />
      <LampAside />
      {items.map((i) => i.node)}
    </>
  );
};

// ---------- план комнаты с камерой ----------
export const RoomShot: React.FC<{ readonly f: number; readonly ch: Choreo; readonly cam: Cam; readonly overlay?: React.ReactNode }> = ({ f, ch, cam, overlay }) => (
  <Shot f={f} from={-1} to={Number.MAX_SAFE_INTEGER} cam={cam} bg="#F1E7D6" overlay={overlay}>
    <RoomView f={f} ch={ch} />
  </Shot>
);

// Поясняющая надпись (одна строка, в безопасной области, не на лицах).
export const Caption: React.FC<{ readonly text: string; readonly opacity?: number; readonly big?: boolean }> = ({ text, opacity = 1, big = false }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center", pointerEvents: "none", opacity }}>
    <div style={{ padding: big ? "12px 34px" : "8px 26px", borderRadius: 16, backgroundColor: "rgba(30,42,68,0.78)", color: "#FFFFFF", fontFamily, fontSize: big ? 52 : 40, fontWeight: 700, letterSpacing: 0.3 }}>{text}</div>
  </div>
);
