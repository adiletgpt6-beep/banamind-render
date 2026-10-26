// Сцена 9. Ещё один важный вопрос.
// A. Средний план: мальчик делает пару шагов к комоду, берёт синюю
//    машинку (рука → касание → хват → подъём), возвращается к торцу стола
//    и показывает её родителям (K04).
// B. После вопроса кладёт машинку на стол рядом с блокнотом (опора →
//    отпускание); папа смотрит на машинку, потом на сына; мама мягко
//    улыбается. Никто не смеётся.
// C. Лист: папа записывает «Машинкасын алса болобу?» (N07). Вопрос
//    записан для разговора, ответа за будущего водителя нет.
// D. Мальчик забирает машинку со стола и держит её в руке.
import type { Place, PoseIn } from "../rig/Actor";
import { clamp, cruise, keys, keysV, lerp } from "../rig/motion";
import { NB, nbPenTip, NotebookTop } from "../props/Notebook30";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Km2Timeline } from "../timing";
import { KM2_TEXT } from "../script";
import { FLAT } from "../sets/Flat";
import { H } from "./common";
import { DadPen, TableTop } from "./Hook";
import { NotebookLines } from "./Request";
import { CAR_ON_TABLE, DAD_SEAT, DiningRoom, MOM_SEAT, seated } from "./Room";

// Опора колёс машинки в руке мальчика — на 47 px ниже запястья (кисть
// направлена вниз): хват за крышу.
const CAR_BELOW_WRIST = 47;
const CABINET_X = 1135; // мальчик у комода (машинка слева от него)

export const toyCarPlan = (tl: Km2Timeline) => {
  const T = sceneTools(tl, "toyCar");
  const walk1: [number, number] = [4, 30];
  const reach = walk1[1] + 2;
  const grab = reach + 12;
  const lift = grab + 10;
  const walk2: [number, number] = [lift + 2, lift + 26];
  const show = Math.max(walk2[1] + 2, T.from("K04") - 6);
  const k04End = T.to("K04");
  const place = k04End + 4;
  const contact = place + 14;
  const release = contact + 4;
  const sheet = T.from("N07") + 8;
  const write: [number, number] = [sheet + 6, sheet + 44];
  const back = Math.max(write[1] + 8, T.to("N07") + 4);
  const takeBack = back + 14;
  return { walk1, reach, grab, lift, walk2, show, k04End, place, contact, release, sheet, write, back, takeBack, len: T.len };
};
type P = ReturnType<typeof toyCarPlan>;

const boyPlace = (p: P) => (t: number): Place => {
  const u1 = cruise(clamp((t - p.walk1[0]) / (p.walk1[1] - p.walk1[0])), 0.35);
  const u2 = cruise(clamp((t - p.walk2[0]) / (p.walk2[1] - p.walk2[0])), 0.35);
  return { x: lerp(lerp(FLAT.boyStand, CABINET_X, u1), FLAT.boyStand, u2), y: FLAT.floorY + 24, h: H.boy };
};

const carOnCabinet = { x: FLAT.carOnCabinet.x, y: FLAT.carOnCabinet.y - CAR_BELOW_WRIST };
const carOnTable = { x: CAR_ON_TABLE.x, y: CAR_ON_TABLE.y - CAR_BELOW_WRIST };

// Где машинка в каждый момент: на комоде, в руке, на столе.
export const carState = (p: P, t: number): "cabinet" | "hand" | "table" => (t < p.grab ? "cabinet" : t < p.release ? "hand" : t < p.takeBack ? "table" : "hand");

const cast = (p: P) => ({
  momPose: (t: number): PoseIn => ({ ...seated(MOM_SEAT), expr: t > p.show ? "softSmile" : "calm", lookY: 0.15 }),
  momFace: () => 0.62,
  dadPose: (t: number): PoseIn => ({
    ...seated(DAD_SEAT),
    expr: t > p.contact ? "softSmile" : "calm",
    // взгляд: на машинку (на столе) → на сына
    lookY: keys(t, [[p.contact, 0.15], [p.contact + 4, 0.55], [p.contact + 18, 0.55], [p.contact + 24, 0.1]]),
    lookX: keys(t, [[p.contact, 0], [p.contact + 4, 0.35], [p.contact + 18, 0.35], [p.contact + 24, 0]]),
    armR: { target: { x: FLAT.notebook.x + 30, y: FLAT.table.top - 14 }, shape: "fist", item: "pen", elbow: "down", behind: false },
    armL: { target: { x: FLAT.notebook.x - 80, y: FLAT.table.top - 6 }, shape: "relax", elbow: "down", behind: false },
  }),
  dadFace: () => 0.7,
  boyPlace: boyPlace(p),
  boyPose: (t: number): PoseIn => {
    const st = carState(p, t);
    const hand = keysV(t, [
      [p.reach - 10, { x: CABINET_X - 30, y: FLAT.floorY - 220 }],
      [p.grab, carOnCabinet],
      [p.grab + 3, carOnCabinet],
      [p.lift, { x: CABINET_X - 50, y: FLAT.floorY - 330 }],
      [p.walk2[1], { x: FLAT.boyStand - 40, y: FLAT.floorY - 300 }],
      [p.show + 10, { x: FLAT.boyStand - 95, y: FLAT.floorY - 400 }],
      [p.place, { x: FLAT.boyStand - 95, y: FLAT.floorY - 400 }],
      [p.contact, carOnTable],
      [p.release, carOnTable],
      [p.release + 14, { x: 935, y: FLAT.table.top - 4 }],
      [p.back, { x: 935, y: FLAT.table.top - 4 }],
      [p.takeBack, carOnTable],
      [p.takeBack + 3, carOnTable],
      [p.takeBack + 18, { x: FLAT.boyStand - 20, y: FLAT.floorY - 260 }],
    ]);
    const holding = st === "hand";
    const nearCar = (t > p.reach - 10 && t < p.release + 14) || t > p.back;
    return {
      expr: t > p.show - 6 && t < p.k04End + 10 ? { browIn: 4, browOut: 4, lid: 0.05, smile: 0.35 } : "softSmile",
      lookY: t < p.lift ? 0.4 : t > p.place && t < p.release ? 0.45 : 0.05,
      armL: nearCar ? { target: hand, shape: holding ? "fist" : "open", item: holding ? "toycar" : "none", elbow: "down", behind: false } : { target: { x: 928, y: FLAT.table.top - 4 }, shape: "relax", elbow: "down", behind: false },
    };
  },
  boyFace: (t: number) => keys(t, [[p.walk1[0], -0.55], [p.walk1[0] + 8, 0.6], [p.walk1[1], 0.6], [p.reach + 2, -0.2], [p.lift, -0.2], [p.walk2[0] + 4, -0.6]]),
  boyWalkFrom: 0,
});

export const ToyCarScene: React.FC = () => {
  const { f } = useScene("toyCar");
  const p = usePlan(toyCarPlan);
  const props = { phone: "table" as const, car: carState(p, f), notebookRows: 6 };
  const c = cast(p);
  if (f < p.place) return <DiningRoom f={f} cam={{ x: 930, y: 1010, zoom: 1.55 }} cast={c} props={props} />;
  if (f < p.sheet) return <DiningRoom f={f} cam={{ x: 800, y: 1040, zoom: 1.6 }} cast={c} props={props} />;
  if (f < p.back) {
    const u = clamp((f - p.write[0]) / (p.write[1] - p.write[0]));
    const tip = nbPenTip(KM2_TEXT.carQuestion, NB.rows.car, u);
    return (
      <TableTop f={f} cam={{ x: 560, y: 1080, zoom: 1.15 }}>
        <NotebookTop lines={[...NotebookLines(f, []), { text: KM2_TEXT.carQuestion, y: NB.rows.car, u }]} map={1}>
          <DadPen x={tip.x} y={tip.y} lift={f > p.write[1] ? 1 : 0.15 * Math.abs(Math.sin(f / 2.3))} />
        </NotebookTop>
      </TableTop>
    );
  }
  return <DiningRoom f={f} cam={{ x: 900, y: 1010, zoom: 1.7 }} cast={c} props={props} />;
};
