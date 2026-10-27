// Сцена 8 «toy» (N06): «Кичинекей кызы да оюнчугун сунду. Аял уулунун
// сөзүн бөлбөй, кызы менен да ойной баштады.» Малышка подходит к дивану и
// протягивает зайчика; воспитатель берёт его одной рукой (левая держит
// раскрытую книгу на коленях), «прыг-прыг» по колену — и взглядом
// возвращается к сыну, который показывает в книгу. Без больших объятий.
import { Actor, type PoseIn } from "../rig/Actor";
import { cruise, keys, keysV, lerp } from "../rig/motion";
import { camMove, Shot, Svg, useScene } from "../kit";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { OpenBook } from "../props/Book";
import { LIVING } from "../sets/Living";
import { BUNNY_SCALE, H, seatedAt } from "./common";
import { TODDLER_SPOT } from "./Arrival";
import { holdOpenBook, LAP_OPEN, SON_SEAT } from "./Reading";
import { Room } from "./Room";

const L = LIVING;
export const TODDLER_AT_KNEE = { x: 1652, y: 1640 } as const;

export const toyPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "toy");
  const walk0 = 0;
  const walk1 = 46;
  const offer = T.wordEnd("N06", "сунду") - 16; // протягивает
  const take = offer + 20; // зайчик переходит к воспитателю
  const hop0 = take + 8;
  const play = T.word("N06", "кызы") ;
  const hop1 = Math.min(T.len - 30, hop0 + 70);
  const look = T.word("N06", "уулунун");
  const close0 = offer - 6; // передача — уже в близком плане
  const close1 = hop0 + 44;
  return { walk0, walk1, offer, take, hop0, hop1, play, look, close0, close1, len: T.len, words: { bolboy: T.word("N06", "бөлбөй") } };
};

export const ToyScene: React.FC = () => {
  const { f, tl } = useScene("toy");
  const P = toyPlan(tl);
  const cg = seatedAt("caregiver", L.sofa.seats[0]);
  const son = seatedAt("son", SON_SEAT);
  const dad = seatedAt("dad", L.sofa.seats[2]);
  const mom = seatedAt("mom", L.armchair.seatX);
  const tdPlace = (t: number) => {
    const u = cruise((t - P.walk0) / (P.walk1 - P.walk0), 0.3);
    return { x: lerp(TODDLER_SPOT.x, TODDLER_AT_KNEE.x, u), y: lerp(TODDLER_SPOT.y, TODDLER_AT_KNEE.y, u), h: H.toddler };
  };
  // точка передачи зайчика: левее лица малышки, над краем раскрытой книги
  const handoff = { x: cg.x + 66, y: LAP_OPEN.y - 72 };
  // «колено» для игры — верхний край раскрытой книги и её правая страница
  const knee = { x: cg.x + 70, y: LAP_OPEN.y - 30 };
  const bunnyAt = (t: number) => {
    if (t < P.offer) return null;
    // малышка поднимает зайчика сбоку от лица, не заслоняя его
    if (t < P.take - 6) return keysV(t, [[P.offer, { x: TODDLER_AT_KNEE.x - 20, y: TODDLER_AT_KNEE.y - 0.56 * H.toddler }], [P.offer + 8, { x: handoff.x + 28, y: TODDLER_AT_KNEE.y - 0.62 * H.toddler }], [P.take - 6, handoff]]);
    if (t < P.take) return handoff;
    const hop = t > P.hop0 && t < P.hop1 ? Math.abs(Math.sin(((t - P.hop0) / 11) * Math.PI)) * 26 : 0;
    const base = keysV(t, [[P.take, handoff], [P.hop0, { x: knee.x, y: knee.y - 34 }]]);
    return { x: base.x + (t > P.hop0 ? Math.sin((t - P.hop0) / 22) * 8 : 0), y: base.y - hop };
  };
  const tdPose = (t: number): PoseIn => {
    const p = tdPlace(t);
    const giving = t >= P.offer - 8 && t < P.take;
    const b = bunnyAt(Math.max(t, P.offer));
    const after = t >= P.take;
    return {
      expr: "smile",
      lookY: keys(t, [[0, 0.3], [P.walk1, 0.3], [P.offer - 10, -0.35], [P.take + 10, -0.35], [P.hop0 + 6, 0.1]]),
      lean: giving ? 6 : after ? keys(t, [[P.take, 0], [P.take + 14, 7]]) : 0,
      armL: after
        ? { target: { x: p.x - 30, y: L.sofa.seatY + 82 }, shape: "open", elbow: "down" }
        : giving && b
          ? { target: { x: b.x - 16, y: b.y + 24 }, shape: "fist", elbow: "down" }
          : { target: { x: p.x - 18, y: p.y - 0.5 * p.h }, shape: "fist", elbow: "hang" },
      armR: after
        ? { target: { x: p.x + 24, y: L.sofa.seatY + 86 }, shape: "open", elbow: "down" }
        : giving && b
          ? { target: { x: b.x + 14, y: b.y + 26 }, shape: "fist", elbow: "down", item: "bunny", itemScale: BUNNY_SCALE(H.toddler) }
          : { target: { x: p.x + 18, y: p.y - 0.5 * p.h }, shape: "fist", elbow: "hang", item: "bunny", itemScale: BUNNY_SCALE(H.toddler) },
    };
  };
  const cgPose = (t: number): PoseIn => {
    const b = bunnyAt(t);
    const hold = holdOpenBook(null);
    const reach = t >= P.offer + 4 && t < P.take;
    const has = t >= P.take;
    return {
      sit: 1,
      seat: L.sofa.seat,
      expr: t > P.take - 4 ? "smile" : "softSmile",
      lookY: keys(t, [[0, 0.45], [P.offer - 12, 0.45], [P.offer, 0.2], [P.hop0 + 30, 0.25], [P.hop1, 0.2]]),
      nod: keys(t, [[P.hop1 + 4, 0], [P.hop1 + 12, 4], [P.hop1 + 22, 0]]),
      armL: { ...hold.armL!, behind: false },
      armR: has && b
        ? { target: { x: b.x + 6, y: b.y + 36 }, shape: "fist", elbow: "down", item: "bunny", itemScale: BUNNY_SCALE(H.caregiver), behind: false }
        : reach
          ? { target: keysV(t, [[P.offer + 4, { x: LAP_OPEN.x + LAP_OPEN.w / 2 - 14, y: LAP_OPEN.y + 10 }], [P.take - 6, { x: handoff.x - 2, y: handoff.y + 6 }], [P.take, { x: handoff.x - 2, y: handoff.y + 6 }]]), shape: t > P.take - 8 ? "fist" : "open", elbow: "down", behind: false }
          : { ...hold.armR!, behind: false },
    };
  };
  // голова: книга → малышка (берёт зайчика, играет) → сын (слушает его)
  const cgFace = (t: number) => keys(t, [[0, 0.5], [P.offer - 12, 0.5], [P.offer, 0.3], [P.hop0 + 26, 0.3], [P.hop0 + 40, 0.62], [P.hop1, 0.62]]);
  const sonPose = (t: number): PoseIn => {
    const point = keys(t, [[P.walk1, 0], [P.walk1 + 14, 1], [P.hop1 - 10, 1], [P.hop1 + 4, 0]]);
    return {
      sit: 1,
      seat: L.sofa.seat,
      expr: "smile",
      lean: 6,
      lookY: keys(t, [[0, 0.45], [P.offer, 0.45], [P.offer + 8, 0.2], [P.take + 20, 0.45]]),
      legSwing: Math.sin(t / 11) * 0.5,
      armL: { target: { x: son.x - 20, y: son.y - L.sofa.seat - 18 }, shape: "relax", elbow: "down" },
      armR: { target: { x: lerp(son.x + 30, LAP_OPEN.x + 60, point), y: lerp(son.y - L.sofa.seat - 18, LAP_OPEN.y - 6, point) }, shape: point > 0.5 ? "point" : "relax", elbow: "down" },
    };
  };
  const lap = (p: { x: number; y: number; h: number }, side: -1 | 1) => ({ x: p.x + side * 0.07 * p.h, y: p.y - 0.27 * p.h - 8 });
  const book = (
    <Svg>
      <OpenBook x={LAP_OPEN.x} y={LAP_OPEN.y} w={LAP_OPEN.w} spread={1} />
    </Svg>
  );
  const care = (layer: "body" | "arms") => <Actor uid="s8-cg" look="caregiver" f={f} place={() => cg} face={cgFace} pose={cgPose} seed={3} layer={layer} />;
  // с протянутой игрушки её руки рисуются поверх малышки: ладонь видна на зайчике
  const armsFront = f >= P.offer - 10;
  const seated = (
    <>
      {care("body")}
      <Actor uid="s8-son" look="son" f={f} place={() => son} face={(t) => keys(t, [[0, -0.5], [P.offer, -0.5], [P.offer + 8, -0.35], [P.take + 20, -0.5]])} pose={sonPose} seed={4} />
      {book}
      {armsFront ? null : care("arms")}
      <Actor uid="s8-dad" look="dad" f={f} place={() => dad} face={() => -0.45} pose={() => ({ sit: 1, seat: L.sofa.seat, expr: "smile", armL: { target: lap(dad, -1), shape: "relax", elbow: "down" }, armR: { target: lap(dad, 1), shape: "relax", elbow: "down" } })} seed={2} />
      <Actor uid="s8-mom" look="mom" f={f} place={() => mom} face={() => -0.62} pose={() => ({ sit: 1, seat: L.armchair.seat, expr: "smile", armL: { target: lap(mom, -1), shape: "relax", elbow: "down" }, armR: { target: lap(mom, 1), shape: "relax", elbow: "down" } })} seed={1} />
    </>
  );
  const front = (
    <>
      <Actor uid="s8-td" look="toddler" f={f} place={tdPlace} face={(t) => keys(t, [[0, -0.6], [P.walk1, -0.6], [P.walk1 + 10, -0.35]])} pose={tdPose} walkFrom={0} seed={5} />
      {armsFront ? care("arms") : null}
    </>
  );
  const world = <Room bag cushion={{ x: cg.x + 70, y: L.sofa.seatY - 128, rot: 12 }} seated={seated} front={front} />;
  return (
    <>
      <Shot f={f} from={0} to={P.close0} cam={camMove(f, 0, P.close0, { x: 1700, y: 1235, zoom: 1.25 }, { x: 1650, y: 1240, zoom: 1.36 })}>
        {world}
      </Shot>
      <Shot f={f} from={P.close0} to={P.close1} cam={camMove(f, P.close0, P.close1, { x: 1580, y: 1250, zoom: 2.05 }, { x: 1585, y: 1246, zoom: 2.12 })}>
        {world}
      </Shot>
      <Shot f={f} from={P.close1} to={P.len + 1} cam={camMove(f, P.close1, P.len, { x: 1620, y: 1220, zoom: 1.5 }, { x: 1615, y: 1215, zoom: 1.56 })}>
        {world}
      </Shot>
    </>
  );
};
