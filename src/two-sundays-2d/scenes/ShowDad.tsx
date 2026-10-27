// Сцена 10. Мама показывает лист папе (позже вечером, тише; дочки нет).
// A. Кухня: папа за столом, перед ним чашка. Мама подходит с тем же
//    календарём и кладёт его перед мужем; он отодвигает чашку, освобождая
//    место, и садится ближе.
// B. Через плечо папы читается «Биздин жекшемби».
// C. Крупно взгляд папы: он понимает.
// D. Взгляд между супругами — без пузырей и надписей.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { box, camMove, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { C, TINT } from "../theme";
import { KITCHEN, KitchenBack, KitchenChairs, KitchenTable } from "../sets/Home";
import { H, seatOf, sitDown } from "./common";
import { OUR_SUNDAY_TOP, OverShoulder } from "./DeskTalk";
import { SHEET_CENTER } from "./CalendarTop";

const K = KITCHEN;
const DAD: Place = { x: K.seats.dad, y: K.floorY - 30, h: H.dad };
const CUP0 = { x: 760, y: K.table.top - 2 };
const CUP1 = { x: 940, y: K.table.top - 2 };
const SHEET = { x: 760, y: K.table.top - 4 };

export const showDadPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "showDad");
  const walk: [number, number] = [0, 46];
  const place = walk[1] + 6; // лист ложится на стол
  const cup: [number, number] = [place + 6, place + 26];
  const over = Math.max(cup[1] + 8, T.word("N09", "Экөө") - 14);
  const face = over + 48;
  const glance = face + 40;
  return { walk, place, cup, over, face, glance, len: T.len };
};

const Cup: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <Svg>
    <rect x={x - 30} y={y - 62} width={60} height={62} rx={8} fill={C.white} stroke="#D5DCE6" strokeWidth={3} />
    <path d={`M ${x + 30} ${y - 48} q 22 0 18 20 q -2 14 -18 14`} fill="none" stroke="#D5DCE6" strokeWidth={6} />
  </Svg>
);

export const ShowDadScene: React.FC = () => {
  const { f } = useScene("showDad");
  const p = usePlan(showDadPlan);
  if (f >= p.over && f < p.face) {
    const a = { x: SHEET_CENTER.x, y: SHEET_CENTER.y + 120, zoom: 0.95 };
    const b = { x: OUR_SUNDAY_TOP.x, y: OUR_SUNDAY_TOP.y + 220, zoom: 1.7 };
    return (
      <Shot f={f} cam={camMove(f, p.over + 6, p.over + 34, a, b)} bg={C.woodLight}>
        <OverShoulder who="dad" />
        <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
      </Shot>
    );
  }
  const momPlace = (t: number): Place => ({ x: lerp(-200, K.seats.girl, cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3)), y: K.floorY - 10, h: H.mom });
  const holding = f < p.place;
  const momPose = (t: number): PoseIn => ({
    expr: "softSmile",
    sit: sitDown(t, p.place + 12, 30).sit,
    seat: seatOf(H.mom) + 30,
    lean: keys(t, [[p.walk[1] - 6, 0], [p.place, 14], [p.place + 12, 6]]) + sitDown(t, p.place + 12, 30).lean,
    lookY: 0.35,
    armR: { target: t < p.walk[1] - 6 ? { x: momPlace(t).x + 120, y: K.floorY - 10 - 360 } : keysV(t, [[p.walk[1] - 6, { x: 740, y: K.table.top - 120 }], [p.place, { x: SHEET.x - 20, y: SHEET.y - 4 }], [p.place + 14, { x: 680, y: K.table.top + 6 }]], anticipate), shape: t < p.place ? "pinch" : "relax", item: t < p.place ? "calendar" : "none", elbow: "down", behind: false },
    armL: t > p.place + 30 ? { target: { x: 540, y: K.table.top + 6 }, shape: "relax", elbow: "down", behind: false } : undefined,
  });
  const cupK = easeInOut(clamp((f - p.cup[0]) / (p.cup[1] - p.cup[0])));
  const cup = { x: lerp(CUP0.x, CUP1.x, cupK), y: CUP0.y };
  const dadPose = (t: number): PoseIn => ({
    sit: 1,
    seat: seatOf(H.dad) + 30,
    expr: t < p.face ? "calm" : "softSmile",
    lookY: t >= p.glance ? 0.05 : t > p.walk[1] - 10 ? 0.55 : 0.2,
    lean: t > p.cup[1] ? 6 : 0,
    armL: { target: { x: 780, y: K.table.top + 6 }, shape: "relax", elbow: "down", behind: false },
    armR: { target: t >= p.cup[0] - 6 && t < p.cup[1] + 4 ? { x: cup.x + 10, y: cup.y - 40 } : { x: 900, y: K.table.top + 6 }, shape: t >= p.cup[0] && t < p.cup[1] ? "fist" : "relax", elbow: "down", behind: false },
  });
  const dadFace = (t: number) => (t >= p.glance ? -0.6 : -0.35);
  const momFace = (t: number) => (t < p.walk[1] ? 0.7 : 0.55);
  const wide = { x: 720, y: 1080, zoom: 1.35 };
  const dadCu = { x: DAD.x - 10, y: 980, zoom: 2.4 };
  const two = { x: 730, y: 1040, zoom: 1.75 };
  const cam = f < p.over ? wide : f < p.glance ? dadCu : two;
  return (
    <Shot f={f} cam={cam} bg={C.wallKitchen}>
      <KitchenBack warm={1} />
      <KitchenChairs seats={[K.seats.girl, K.seats.dad]} />
      <Actor uid="sd-dad" look="su2Dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} seed={2} layer="body" />
      <Actor uid="sd-mom" look="su2MomHome" f={f} place={momPlace} face={momFace} pose={momPose} seed={5} walkFrom={0} layer="body" />
      <KitchenTable />
      <Cup x={cup.x} y={cup.y} />
      {!holding ? <div style={box({ left: SHEET.x - 110, top: SHEET.y - 6, width: 220, height: 10, backgroundColor: "#FFFEFA", borderRadius: 3, boxShadow: "0 2px 0 #D8D2C4" })} /> : null}
      <Actor uid="sd-dad" look="su2Dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} seed={2} layer="arms" />
      <Actor uid="sd-mom" look="su2MomHome" f={f} place={momPlace} face={momFace} pose={momPose} seed={5} walkFrom={0} layer="arms" />
      <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
    </Shot>
  );
};
