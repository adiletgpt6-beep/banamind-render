// Сцена 2. «Бул — эстеликке» (M01, C01).
// A. Мама и сын, конверты между ними. Мама тянется к «Эмир», пальцы
//    касаются края, затем конверт поднимается — на столе остаются 24.
//    «Баарын бир жакка чакырып жатасыңбы?» (M01).
// B. Встречный план Аяна: он чуть качает головой, смотрит на конверт —
//    «Жок. Бул — эстеликке.» (C01).
// C. Реакция мамы: лёгкое удивление (брови), без раскрытого рта; она ещё не
//    понимает причины. Возвращает конверт на его место — снова 25.
// D. Сверху крупно: «Эмир» лежит на столе — прямоугольник конверта
//    в центре кадра; следующий план (коробка переезда) повторяет его форму.
import { keys, keysV, type Vec } from "../rig/motion";
import { EMIR } from "../script";
import { camMove, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { gridLayout, TOP } from "../sets/Room";
import { DeskTop } from "./desk";
import { ayanSeated, AYAN_SEAT, MOM_STAND, onDesk, RoomFront, ROOM_CAM, type ActorSpec } from "./room";

export const memoryPlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "memory");
  const m01 = T.from("M01");
  const c01 = T.from("C01");
  const c01End = T.to("C01");
  return {
    touch: Math.max(8, m01 - 30),
    lift: Math.max(20, m01 - 14),
    m01,
    m01End: T.to("M01"),
    c01,
    c01End,
    react: [c01End + 2, c01End + 24] as const,
    put: c01End + 40,
    release: c01End + 52,
    top: T.len - 20, // крупный план конверта сверху
    len: T.len,
  };
};
type P = ReturnType<typeof memoryPlan>;

// «Эмир» во фронтальном плане и точка над ним (рука).
const EMIR_TOP = TOP.grid(EMIR.row, EMIR.col);
const EMIR_FRONT = onDesk(EMIR_TOP.x, EMIR_TOP.y, -6);
const HOLD: Vec = { x: 838, y: 1150 };

const momSpec = (p: P): ActorSpec => ({
  uid: "m-mom",
  look: "momHome",
  place: () => MOM_STAND,
  face: (t) => keys(t, [[p.touch - 10, -0.45], [p.m01 + 6, -0.5], [p.m01End + 4, -0.75]]),
  pose: (t) => {
    const holding = t >= p.lift && t < p.release;
    const target = keysV(t, [
      [p.touch - 16, { x: MOM_STAND.x - 110, y: 1262 }],
      [p.touch, EMIR_FRONT],
      [p.lift, EMIR_FRONT],
      [p.lift + 14, HOLD],
      [p.put - 12, HOLD],
      [p.put, EMIR_FRONT],
      [p.release, EMIR_FRONT],
      [p.release + 16, { x: MOM_STAND.x - 110, y: 1262 }],
    ]);
    const surprised = { browIn: 6, browOut: 6, lid: 0.04, smile: 0.05 } as const;
    return {
      expr: t < p.c01End ? ("calm" as const) : t < p.put ? surprised : ("thinking" as const),
      lookY: t < p.lift + 10 ? 0.7 : t < p.m01End ? 0.35 : t < p.put - 14 ? 0.3 : 0.65,
      nod: t < p.lift + 10 ? 8 : 3,
      lean: keys(t, [[p.touch - 18, 2], [p.touch, 14], [p.lift + 12, 5], [p.put - 12, 5], [p.put, 13], [p.release + 14, 3]]),
      headTilt: keys(t, [[p.react[0], 0], [p.react[1], -4]]),
      armL: {
        target,
        shape: holding ? ("pinch" as const) : t >= p.touch - 4 && t < p.release + 4 ? ("pinch" as const) : ("relax" as const),
        elbow: "down" as const,
        item: holding ? ("envelope" as const) : ("none" as const),
        label: EMIR.name,
        itemTilt: -8,
        behind: false,
      },
      armR: { target: null },
    };
  },
  role: "mother",
  seed: 12,
});

const ayanSpec = (p: P): ActorSpec => ({
  uid: "m-ayan",
  look: "ayanHome",
  place: () => AYAN_SEAT,
  face: (t) => keys(t, [[p.touch, 0.3], [p.m01, 0.55], [p.c01 - 4, 0.5]]),
  pose: (t) => {
    // короткое покачивание головой на «Жок», затем взгляд на конверт
    const shake = t >= p.c01 && t < p.c01 + 14 ? Math.sin(((t - p.c01) / 14) * Math.PI * 2) * 0.12 : 0;
    return ayanSeated({
      expr: t < p.c01 ? { browIn: 3, browOut: 1, lid: 0.08, smile: 0 } : { browIn: 2, browOut: 0, lid: 0.16, smile: 0.08 },
      lookY: t < p.c01 + 14 ? -0.15 : 0.15,
      lookX: shake * 4,
      headTilt: shake * 30,
      nod: t >= p.c01 + 14 ? 4 : 0,
      armL: { target: onDesk(TOP.grid(4, 4).x, TOP.grid(4, 4).y + 40), shape: "open", elbow: "down" },
    });
  },
  role: "son",
  seed: 11,
});

export const MemoryScene: React.FC = () => {
  const { f } = useScene("memory");
  const p = usePlan(memoryPlan);
  const holding = f >= p.lift && f < p.release;
  const items = gridLayout().map((e) => (e.env.id === EMIR.id ? { ...e, hidden: holding } : e));
  if (f >= p.top) {
    // D: конверт сверху — прямоугольник в центре кадра
    const cam = camMove(f, p.top, p.len, { x: EMIR_TOP.x, y: EMIR_TOP.y, zoom: 2.9 }, { x: EMIR_TOP.x, y: EMIR_TOP.y, zoom: 3.0 });
    return <DeskTop f={f} cam={cam} items={items} />;
  }
  const mom = momSpec(p);
  const ayan = ayanSpec(p);
  // A — двое; B — Аян; C — мама; затем двое (конверт возвращается)
  if (f < p.c01 - 4) return <RoomFront f={f} cam={camMove(f, 0, p.c01, ROOM_CAM.two, { ...ROOM_CAM.two, zoom: 1.52, x: 740 })} items={items} ayan={ayan} mom={mom} />;
  if (f < p.c01End + 6) return <RoomFront f={f} cam={ROOM_CAM.ayan} items={items} ayan={ayan} mom={mom} />;
  if (f < p.put - 16) return <RoomFront f={f} cam={ROOM_CAM.mom} items={items} ayan={ayan} mom={mom} />;
  return <RoomFront f={f} cam={ROOM_CAM.two} items={items} ayan={ayan} mom={mom} />;
};
