// Сцена 6 «ask» (S01): сын останавливается перед воспитателем, поднимает
// книгу двумя руками и показывает обложку: «Сиз бул китепти окуп бере
// аласызбы?» Она поворачивается к нему, принимает книгу, отодвигает
// подушку — место рядом свободно; мальчик сам садится (опора рукой на
// диван). Средний план → крупнее сын с книгой → двойной план.
import { Actor, type PoseIn } from "../rig/Actor";
import { cruise, easeInOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { camMove, Shot, useScene } from "../kit";
import { LIVING, SOFA_CUSHION } from "../sets/Living";
import { H, seatedAt, sitDown } from "./common";
import { carryBook, HeldBook, SON_ENTER, TODDLER_SPOT } from "./Arrival";
import { Room } from "./Room";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";

const L = LIVING;
export const SON_STOP = { x: 1668, y: 1604 } as const;
// Книга на коленях воспитателя: стоит обложкой к камере (центр).
export const LAP_BOOK = { x: L.sofa.seats[0] + 8, y: L.feetY - L.sofa.seat - 52 } as const;

// Ключевые кадры сцены (от реплики S01) — для анимации и звука.
export const askPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "ask");
  const s01 = { a: T.from("S01"), b: T.to("S01") };
  const reach = s01.b + 6; // руки воспитателя тянутся к книге
  const take = reach + 16; // книга переходит к ней
  const lapAt = take + 18;
  const cushion0 = lapAt + 2;
  const cushion1 = cushion0 + 22;
  const sit0 = cushion1 - 2; // сын садится
  return { s01, reach, take, lapAt, cushion0, cushion1, sit0, len: T.len };
};

export const AskScene: React.FC = () => {
  const { f, tl } = useScene("ask");
  const P = askPlan(tl);
  const cg = seatedAt("caregiver", L.sofa.seats[0]);
  const dad = seatedAt("dad", L.sofa.seats[2]);
  const mom = seatedAt("mom", L.armchair.seatX);
  const td = { x: TODDLER_SPOT.x, y: TODDLER_SPOT.y, h: H.toddler };
  const seatX = L.sofa.seats[1];
  // сын: дошёл до воспитателя → после передачи книги садится на среднее место
  const sonPlace = (t: number) => {
    if (t < 22) {
      const u = cruise(t / 22, 0.4);
      return { x: lerp(SON_ENTER.x1, SON_STOP.x, u), y: SON_STOP.y, h: H.son };
    }
    const u = easeInOut((t - P.sit0) / 26);
    return { x: lerp(SON_STOP.x, seatX, u), y: lerp(SON_STOP.y, L.feetY, u), h: H.son };
  };
  const raise = (t: number) => keys(t, [[12, 0], [30, 1], [P.reach, 1], [P.take, 0.85]]);
  // книга: у сына → протягивает → у воспитателя на коленях
  const bookAt = (t: number): Vec => {
    const held = carryBook(sonPlace(Math.min(t, P.take)).x, SON_STOP.y, H.son, raise(Math.min(t, P.take))).book;
    const offered = { x: held.x - 34, y: held.y + 6 };
    if (t < P.reach) return held;
    if (t < P.take) return keysV(t, [[P.reach, held], [P.take, offered]]);
    return keysV(t, [[P.take, offered], [P.lapAt, LAP_BOOK]]);
  };
  const cushionAt = (t: number) => {
    const u = easeInOut((t - P.cushion0) / (P.cushion1 - P.cushion0));
    return { x: lerp(SOFA_CUSHION.x, cg.x + 70, u), y: lerp(SOFA_CUSHION.y, L.sofa.seatY - 128, u), rot: lerp(SOFA_CUSHION.rot, 12, u) };
  };
  const sonPose = (t: number): PoseIn => {
    const b = bookAt(t);
    const sd = sitDown(t, P.sit0 + 4, 26);
    const holding = t < P.take + 2;
    return {
      expr: t < P.s01.a ? "softSmile" : t < P.take ? "calm" : "smile",
      sit: sd.sit,
      seat: L.sofa.seat,
      lean: sd.lean,
      headTilt: keys(t, [[P.s01.a, 0], [P.s01.a + 12, -5], [P.s01.b, -5], [P.s01.b + 12, 0]]),
      legSwing: t > P.sit0 + 34 ? Math.sin(t / 10) * 0.5 : 0,
      armL: holding ? { target: { x: b.x - 40, y: b.y + 44 }, shape: "fist", elbow: "hang" } : { target: null, shape: "relax" },
      armR: holding
        ? { target: { x: b.x + 40, y: b.y + 44 }, shape: "fist", elbow: "hang" }
        : t < P.sit0 - 4
          ? { target: null, shape: "relax" }
          : { target: keysV(t, [[P.sit0 - 4, { x: SON_STOP.x + 40, y: 1500 }], [P.sit0 + 8, { x: seatX + 70, y: L.sofa.seatY + 4 }], [P.sit0 + 34, { x: seatX + 70, y: L.sofa.seatY + 4 }], [P.sit0 + 46, { x: seatX + 30, y: L.feetY - L.sofa.seat - 30 }]]), shape: t < P.sit0 + 36 ? "open" : "relax", elbow: "down" },
    };
  };
  const cgPose = (t: number): PoseIn => {
    const b = bookAt(t);
    const lapL = { x: cg.x - 0.07 * cg.h, y: cg.y - 0.27 * cg.h - 8 };
    const lapR = { x: cg.x + 0.07 * cg.h, y: cg.y - 0.27 * cg.h - 8 };
    const onBook = t >= P.reach + 8;
    const movingCushion = t >= P.cushion0 - 6 && t < P.cushion1 + 6;
    const c = cushionAt(t);
    return {
      sit: 1,
      seat: L.sofa.seat,
      expr: t < P.s01.a + 20 ? "softSmile" : "smile",
      lean: keys(t, [[P.reach, 0], [P.reach + 10, 7], [P.lapAt, 0], [P.cushion0, 0], [P.cushion0 + 8, 6], [P.cushion1, 0]]),
      nod: keys(t, [[P.s01.b - 4, 0], [P.s01.b + 4, 5], [P.s01.b + 14, 0]]),
      lookY: t > P.lapAt - 4 && t < P.cushion0 ? 0.4 : 0.1,
      armL: onBook ? { target: { x: b.x - 54, y: b.y + 10 }, shape: "fist", elbow: "down" } : { target: keysV(t, [[P.reach, lapL], [P.reach + 8, { x: b.x - 54, y: b.y + 10 }]]), shape: "relax", elbow: "down" },
      armR: movingCushion
        ? { target: { x: c.x - 40, y: c.y + 10 }, shape: "open", elbow: "down", behind: false }
        : onBook && t < P.cushion0 - 6
          ? { target: { x: b.x + 54, y: b.y + 10 }, shape: "fist", elbow: "down", behind: false }
          : t >= P.cushion1 + 6
            ? { target: keysV(t, [[P.cushion1 + 6, { x: c.x - 40, y: c.y + 10 }], [P.cushion1 + 18, { x: LAP_BOOK.x + 54, y: LAP_BOOK.y + 10 }]]), shape: "fist", elbow: "down", behind: false }
            : { target: keysV(t, [[P.reach, lapR], [P.reach + 8, { x: b.x + 54, y: b.y + 10 }]]), shape: "relax", elbow: "down" },
    };
  };
  const cgFace = (t: number) => keys(t, [[0, 0.1], [10, 0.45], [P.cushion0 - 4, 0.45], [P.cushion0 + 4, 0.75], [P.cushion1, 0.75], [P.cushion1 + 10, 0.45]]);
  const dadPose = (): PoseIn => ({ sit: 1, seat: L.sofa.seat, expr: "softSmile", armL: { target: { x: dad.x - 52, y: dad.y - 0.27 * dad.h - 8 }, shape: "relax", elbow: "down" }, armR: { target: { x: dad.x + 52, y: dad.y - 0.27 * dad.h - 8 }, shape: "relax", elbow: "down" } });
  const momPose = (): PoseIn => ({ sit: 1, seat: L.armchair.seat, expr: "softSmile", armL: { target: { x: mom.x - 52, y: mom.y - 0.27 * mom.h - 8 }, shape: "relax", elbow: "down" }, armR: { target: { x: mom.x + 52, y: mom.y - 0.27 * mom.h - 8 }, shape: "relax", elbow: "down" } });
  const tdPose = (t: number): PoseIn => ({
    expr: "smile",
    lookY: 0.3,
    armL: { target: { x: td.x - 18, y: td.y - 0.5 * td.h + Math.sin(t / 7) * 6 }, shape: "fist", elbow: "hang" },
    armR: { target: { x: td.x + 18, y: td.y - 0.5 * td.h + Math.sin(t / 7) * 6 }, shape: "fist", elbow: "hang", item: "bunny", itemScale: 0.92 / (td.h / 1000) },
  });
  const sonFace = (t: number) => keys(t, [[0, 0.5], [20, -0.45], [P.sit0, -0.45], [P.sit0 + 14, 0.1], [P.sit0 + 40, -0.35]]);
  const b = bookAt(f);
  const son = (layer: "body" | "arms") => <Actor uid="s6-son" look="son" f={f} place={sonPlace} face={sonFace} pose={sonPose} role="son" walkFrom={0} seed={4} layer={layer} />;
  const care = (layer: "body" | "arms") => <Actor uid="s6-cg" look="caregiver" f={f} place={() => cg} face={cgFace} pose={cgPose} seed={3} layer={layer} />;
  // Сын стоит перед диваном (передний план), пока не сядет: тогда он в ряду
  // сидящих. Книга — между телами и руками тех, кто её держит.
  const sonSeated = f >= P.sit0 + 14;
  const seated = (
    <>
      {care("body")}
      {sonSeated ? son("body") : null}
      <HeldBook x={b.x} y={b.y} title />
      {care("arms")}
      {sonSeated ? son("arms") : null}
      <Actor uid="s6-dad" look="dad" f={f} place={() => dad} face={(t) => (t < P.take ? -0.3 : -0.45)} pose={dadPose} seed={2} />
      <Actor uid="s6-mom" look="mom" f={f} place={() => mom} face={() => -0.6} pose={momPose} seed={1} />
    </>
  );
  const front = (
    <>
      <Actor uid="s6-td" look="toddler" f={f} place={() => td} face={() => -0.2} pose={tdPose} seed={5} />
      {!sonSeated ? (
        <>
          {son("body")}
          {f < P.take ? <HeldBook x={b.x} y={b.y} title /> : null}
          {son("arms")}
        </>
      ) : null}
    </>
  );
  const bTo = P.s01.a - 2;
  const cTo = P.s01.b + 4;
  const world = <Room bag cushion={cushionAt(f)} seated={seated} front={front} />;
  return (
    <>
      <Shot f={f} from={0} to={bTo} cam={camMove(f, 0, bTo, { x: 1660, y: 1240, zoom: 1.25 }, { x: 1640, y: 1235, zoom: 1.3 })}>
        {world}
      </Shot>
      <Shot f={f} from={bTo} to={cTo} cam={camMove(f, bTo, cTo, { x: 1610, y: 1200, zoom: 1.75 }, { x: 1612, y: 1196, zoom: 1.8 })}>
        {world}
      </Shot>
      <Shot f={f} from={cTo} to={P.len + 1} cam={camMove(f, cTo, P.len, { x: 1630, y: 1245, zoom: 1.32 }, { x: 1620, y: 1245, zoom: 1.4 })}>
        {world}
      </Shot>
    </>
  );
};
