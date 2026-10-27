// Сцена 7. «Больше не люблю» (M01, D02).
// A. Семья за ужином (средний план): мама слева, дочка в середине, папа
//    справа; тарелки и ложки на столе, кисти не проваливаются в стол.
// B. Встречные планы: мама мягко спрашивает (M01) — дочка, глядя на ложку
//    у края тарелки, старается сказать обычно и тише (D02).
// C. Короткая реакция родителей без рассказчика: папа поднимает взгляд —
//    ответ не похож на её обычный интерес; мама смотрит на папу. Стол,
//    посуда и руки — в тех же местах во всех планах.
import { keys } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { Plate } from "../sets/Home";
import { K_PLACE, K_SEAT, K_SEAT_H, K_TABLE_Y, KitchenShot } from "./kitchen";
import type { ActorSpec } from "./shots";

export const dinnerPlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "dinner");
  return { m01: T.from("M01"), m01End: T.to("M01"), d02: T.from("D02"), d02End: T.to("D02"), len: T.len };
};

export const DinnerScene: React.FC = () => {
  const { f } = useScene("dinner");
  const p = usePlan(dinnerPlan);
  const mom: ActorSpec = {
    uid: "d-mom",
    look: "momHome",
    place: () => K_PLACE.mom,
    face: (t) => (t < p.d02End + 16 ? 0.45 : keys(t, [[p.d02End + 16, 0.45], [p.d02End + 30, 0.6]])),
    pose: (t) => ({
      sit: 1,
      seat: K_SEAT_H.adult,
      expr: t < p.d02End ? ({ browIn: 3, browOut: 1, lid: 0.12, smile: 0.25 } as const) : ({ browIn: 5, browOut: 0, lid: 0.1, smile: 0.05 } as const),
      lookX: 0.4,
      lookY: 0.15,
      armL: { target: { x: K_SEAT.mom - 42, y: K_TABLE_Y }, shape: "relax", elbow: "hang" },
      armR: { target: { x: K_SEAT.mom + 44, y: K_TABLE_Y + 4 }, shape: "relax", elbow: "hang", behind: false },
    }),
    role: "mother",
    seed: 5,
    blinkShift: 19,
  };
  const girl: ActorSpec = {
    uid: "d-girl",
    look: "girlHome",
    place: () => K_PLACE.girl,
    face: (t) => (t < p.m01End ? -0.3 : -0.1),
    pose: (t) => ({
      sit: 1,
      seat: K_SEAT_H.girl,
      // слушает маму, затем смотрит вниз, на ложку у края тарелки
      expr: t < p.m01End ? ("calm" as const) : ({ browIn: 4, browOut: -1, lid: 0.3, smile: 0.02 } as const),
      lookY: t < p.m01End + 4 ? 0.1 : 0.85,
      lookX: t < p.m01End + 4 ? -0.4 : 0.1,
      nod: keys(t, [[p.m01End, 0], [p.m01End + 10, 8]]),
      armL: { target: { x: K_SEAT.girl - 36, y: K_TABLE_Y }, shape: "relax", elbow: "hang" },
      armR: { target: { x: K_SEAT.girl + 40, y: K_TABLE_Y - 4 }, shape: "fist", elbow: "hang", behind: false },
    }),
    role: "daughter",
    seed: 4,
    blinkShift: 37,
  };
  const dad: ActorSpec = {
    uid: "d-dad",
    look: "dadSuit",
    place: () => K_PLACE.dad,
    face: (t) => (t < p.d02End + 6 ? -0.4 : keys(t, [[p.d02End + 6, -0.4], [p.d02End + 22, -0.25]])),
    pose: (t) => ({
      sit: 1,
      seat: K_SEAT_H.adult,
      expr: t < p.d02End + 4 ? ("calm" as const) : ({ browIn: 6, browOut: 2, lid: 0.08, smile: 0 } as const),
      lookX: -0.4,
      lookY: t < p.d02End + 4 ? 0.2 : 0.05,
      armL: { target: { x: K_SEAT.dad - 46, y: K_TABLE_Y }, shape: "relax", elbow: "hang", behind: false },
      armR: { target: { x: K_SEAT.dad + 48, y: K_TABLE_Y }, shape: "relax", elbow: "hang" },
    }),
    role: "father",
    seed: 2,
  };
  const onTable = (
    <>
      <Plate x={K_SEAT.mom} spoon={{ x: K_SEAT.mom + 70, y: K_TABLE_Y + 6 }} />
      <Plate x={K_SEAT.girl} spoon={{ x: K_SEAT.girl + 70, y: K_TABLE_Y + 6 }} />
      <Plate x={K_SEAT.dad} spoon={{ x: K_SEAT.dad + 70, y: K_TABLE_Y + 6 }} />
    </>
  );
  const WIDE = { x: 560, y: 1130, zoom: 1.75 };
  const MOM = { x: 360, y: 1010, zoom: 2.3 };
  const GIRL = { x: 560, y: 1090, zoom: 2.4 };
  const DAD = { x: 770, y: 1010, zoom: 2.3 };
  const cam = f < p.m01 - 8 ? WIDE : f < p.m01End + 6 ? MOM : f < p.d02End + 12 ? GIRL : f < p.d02End + 50 ? DAD : WIDE;
  return <KitchenShot f={f} cam={cam} seated={[mom, girl, dad]} chairs={[K_SEAT.mom, K_SEAT.girl, K_SEAT.dad]} onTable={onTable} />;
};
