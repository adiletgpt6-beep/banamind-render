// Сцена 10. Он слышит её (F04) и тот же лист расписания.
// A. Двое у доски: папа чуть наклоняется к дочке и спокойно отвечает
//    (F04), не хватает её за плечи, ничего не обещает.
// B. Дочка достаёт лист из тетради: кисть к тетради → лист поднимается
//    в её пальцах → она протягивает его над столом → папа берётся за
//    другой край (оба держат один лист) → лист у папы, её рука
//    возвращается. Осторожное облегчение на её лице.
// C. Папа смотрит на лист и встаёт с ним (переход к родителям).
import { clamp, easeInOut, keys, lerp, type Vec } from "../rig/motion";
import { POSITION_A } from "../script";
import { Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { NotebookFlat } from "../sets/Home";
import { ScheduleArt } from "../props/Schedule";
import { RoomShot, TABLE_Y, type ActorSpec } from "./shots";
import { GIRL_SPEC, girlAtBoard } from "./Light";
import { DAD_SEATED_PLACE, dadSeated, ROOM_CAMS } from "./Reason";
import { standUp } from "./common";

export const heardPlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "heard");
  const e = T.to("F04");
  return {
    f04: T.from("F04"),
    second: T.word("F04", "Машыгуулар") - 3,
    e,
    reach: [e + 4, e + 16] as const,
    lift: [e + 16, e + 30] as const,
    extend: [e + 30, e + 52] as const,
    take: [e + 64, e + 82] as const,
    read: e + 84,
    stand: e + 104,
    len: T.len,
  };
};
type P = ReturnType<typeof heardPlan>;

const NB: Vec = { x: 452, y: TABLE_Y - 4 };
const SW = 72; // ширина листа в среднем плане

// Центр листа и кто его держит.
const sheetAt = (t: number, p: P) => {
  const atNb = { x: NB.x, y: NB.y - 6 };
  const up = { x: 452, y: 1150 };
  const mid = { x: 566, y: 1168 };
  const dad = { x: 690, y: 1118 };
  if (t < p.lift[0]) return { c: atNb, girl: t >= p.reach[1] - 2, dad: false, flat: 1 };
  if (t < p.lift[1]) {
    const u = easeInOut((t - p.lift[0]) / (p.lift[1] - p.lift[0]));
    return { c: { x: lerp(atNb.x, up.x, u), y: lerp(atNb.y, up.y, u) }, girl: true, dad: false, flat: 1 - u };
  }
  if (t < p.extend[1]) {
    const u = easeInOut((t - p.extend[0]) / (p.extend[1] - p.extend[0]));
    return { c: { x: lerp(up.x, mid.x, u), y: lerp(up.y, mid.y, u) }, girl: true, dad: t >= p.extend[1] - 6, flat: 0 };
  }
  if (t < p.take[0]) return { c: mid, girl: true, dad: true, flat: 0 };
  const u = easeInOut(clamp((t - p.take[0]) / (p.take[1] - p.take[0])));
  return { c: { x: lerp(mid.x, dad.x, u), y: lerp(mid.y, dad.y, u) }, girl: t < p.take[0] + 4, dad: true, flat: 0 };
};

const Sheet: React.FC<{ c: Vec; flat: number; tilt: number }> = ({ c, flat, tilt }) => (
  <Svg>
    <g transform={`translate(${c.x} ${c.y}) rotate(${tilt}) scale(1 ${1 - 0.76 * flat})`}>
      <ScheduleArt w={SW} detail={false} />
    </g>
  </Svg>
);

// Когда папа встаёт, лист в его руке поднимается вместе с ним.
const sheetFinal = (t: number, p: P) => (t >= p.stand ? { c: { x: 690, y: lerp(1118, 1030, easeInOut(clamp((t - p.stand) / 34))) }, flat: 0 } : sheetAt(t, p));

const leftEdge = (c: Vec) => ({ x: c.x - SW * 0.42, y: c.y + SW * 0.25 });
const rightEdge = (c: Vec) => ({ x: c.x + SW * 0.42, y: c.y + SW * 0.2 });

export const HeardScene: React.FC = () => {
  const { f } = useScene("heard");
  const p = usePlan(heardPlan);
  const girlPose = (t: number) => {
    const base = girlAtBoard({ expr: "calm", lookY: 0.05 });
    const st = sheetAt(t, p);
    const reach = easeInOut(clamp((t - p.reach[0]) / (p.reach[1] - p.reach[0])));
    const back = easeInOut(clamp((t - p.take[0] - 4) / 16));
    const handOff = leftEdge(sheetAt(p.take[0] + 4, p).c);
    let armR: { target: Vec; shape: "relax" | "pinch"; elbow: "down" } = base.armR;
    if (t >= p.reach[0] && t < p.take[0] + 4) armR = { target: st.girl ? leftEdge(st.c) : { x: lerp(base.armR.target.x, NB.x - 30, reach), y: lerp(base.armR.target.y, NB.y, reach) }, shape: "pinch", elbow: "down" };
    else if (t >= p.take[0] + 4) armR = { target: { x: lerp(handOff.x, base.armR.target.x, back), y: lerp(handOff.y, base.armR.target.y, back) }, shape: "relax", elbow: "down" };
    const relief = t >= p.take[0] + 6;
    return {
      ...base,
      armR,
      lookY: t >= p.reach[0] && t < p.lift[1] ? 0.55 : 0.05,
      expr: relief ? ({ browIn: 3, browOut: 2, lid: 0.12, smile: 0.35 } as const) : ({ browIn: 5, browOut: 0, lid: 0.12, smile: 0.08 } as const),
    };
  };
  const dadPose = (t: number) => {
    const base = dadSeated({ lean: 8 });
    const st = sheetAt(t, p);
    const lean = keys(t, [[p.f04 - 6, 8], [p.f04 + 10, 15], [p.e + 10, 15], [p.e + 30, 9]]);
    const up = standUp(t, p.stand, 34);
    const reachK = easeInOut(clamp((t - (p.extend[1] - 18)) / 14));
    const meet = rightEdge(sheetAt(p.extend[1], p).c);
    const armL =
      t >= p.extend[1] - 18
        ? { target: st.dad ? rightEdge(st.c) : { x: lerp(base.armL.target.x, meet.x, reachK), y: lerp(base.armL.target.y, meet.y, reachK) }, shape: "pinch" as const, elbow: "down" as const }
        : base.armL;
    return {
      ...base,
      sit: up.sit,
      lean: t >= p.stand ? up.lean : lean,
      armL,
      armR: t >= p.take[1] ? { target: rightEdge(sheetFinal(t, p).c), shape: "pinch" as const, elbow: "down" as const, behind: false } : base.armR,
      lookY: t >= p.read ? 0.45 : 0.1,
      expr: t < p.e ? ({ browIn: 3, browOut: 1, lid: 0.12, smile: 0.25 } as const) : ("softSmile" as const),
    };
  };
  const dad: ActorSpec = { uid: "r-dad", look: "dadSuit", place: () => DAD_SEATED_PLACE, face: () => -0.85, pose: dadPose, role: "father", seed: 2 };
  const sheet = sheetFinal(f, p);
  const cam = f < p.second ? ROOM_CAMS.dad : f < p.reach[0] ? ROOM_CAMS.two : f < p.read ? { x: 560, y: 1150, zoom: 1.95 } : ROOM_CAMS.wide;
  return (
    <RoomShot
      f={f}
      cam={cam}
      girl={GIRL_SPEC(girlPose)}
      dad={dad}
      pieces={POSITION_A.pieces}
      notebook={false}
      overTable={
        <>
          <NotebookFlat x={NB.x} />
          <Sheet c={sheet.c} flat={sheet.flat} tilt={f >= p.take[0] ? -4 : 3} />
        </>
      }
    />
  );
};
