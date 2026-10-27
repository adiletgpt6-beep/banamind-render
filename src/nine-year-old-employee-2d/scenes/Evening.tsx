// Сцена 10. Вечером родители обсуждают постоянную дорогу после школы.
// Папа и мама рядом за кухонным столом, телефон мамы лежит на столе. На
// заднем плане бабушка спокойно наливает чай (она может встречать внука
// дома, но ежедневную дорогу из офиса не делает). Рассказчик молчит:
// F05 — папа, M01 — мама; на последних словах мама берёт телефон.
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, keys, keysV } from "../rig/motion";
import { C } from "../theme";
import { Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { KITCHEN, KitchenBack, KitchenTable } from "../sets/Kitchen";
import { H, seatOf } from "./common";

export const eveningPlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "evening");
  return { f05: T.from("F05"), f05End: T.to("F05"), m01: T.from("M01"), grab: [T.word("M01", "такси") - 6, T.word("M01", "такси") + 12] as const, len: T.len };
};


const MOM: Place = { x: 380, y: KITCHEN.floorY, h: H.mom };
const DAD: Place = { x: 690, y: KITCHEN.floorY, h: H.dad };
const GRANDMA: Place = { x: 960, y: KITCHEN.floorY - 60, h: 700 };
export const MOM_PHONE = { x: 470, y: KITCHEN.tableTop - 6 };
const PHONE_HELD = { x: 470, y: 1110 };

export const EveningScene: React.FC = () => {
  const { f } = useScene("evening");
  const p = usePlan(eveningPlan);
  const holding = (tt: number) => tt >= p.grab[0] + 6;
  const momPose = (tt: number) => ({
    sit: 1,
    seat: seatOf(H.mom),
    expr: tt < p.m01 - 10 ? ("calm" as const) : ("softSmile" as const),
    lookX: tt < p.f05End + 4 ? 0.5 : 0.35,
    lookY: holding(tt) ? 0.5 : 0.05,
    armR: { target: keysV(tt, [[p.grab[0], { x: 415, y: KITCHEN.tableTop + 8 }], [p.grab[0] + 6, MOM_PHONE], [p.grab[1], PHONE_HELD]], anticipate), shape: holding(tt) ? ("phone" as const) : ("relax" as const), item: holding(tt) ? ("phone" as const) : ("none" as const), itemColor: C.pink, glow: holding(tt) ? clamp((tt - p.grab[1]) / 6) : 0, elbow: "down" as const, behind: false },
    armL: { target: { x: 345, y: KITCHEN.tableTop + 8 }, shape: "relax" as const, elbow: "down" as const },
  });
  const dadPose = (tt: number) => ({
    sit: 1,
    seat: seatOf(H.dad),
    expr: tt < p.m01 ? ("thinking" as const) : ("calm" as const),
    lookX: -0.4,
    lookY: holding(tt) ? 0.45 : 0.05,
    armL: { target: { x: 655, y: KITCHEN.tableTop + 8 }, shape: "relax" as const, elbow: "down" as const },
    armR: { target: { x: 725, y: KITCHEN.tableTop + 8 }, shape: "relax" as const, elbow: "down" as const },
    nod: keys(tt, [[p.m01 + 30, 0], [p.m01 + 38, 4], [p.m01 + 48, 0]]),
  });
  const grandmaPose = (tt: number) => ({ expr: "calm" as const, armR: { target: { x: 1010, y: 1130 + Math.sin(tt / 20) * 4 }, shape: "fist" as const, item: "teapot" as const, elbow: "down" as const }, armL: { target: { x: 910, y: 1150 }, shape: "relax" as const, item: "cup" as const, elbow: "down" as const }, lookY: 0.4 });
  const cam = { x: 600, y: 1120, zoom: keys(f, [[0, 1.25], [p.len, 1.32]]) };
  return (
    <Shot f={f} cam={cam} bg="#F3E3C4">
      <KitchenBack />
      <Actor uid="e10-gma" look="grandma" f={f} place={() => GRANDMA} face={() => -0.4} pose={grandmaPose} seed={21} />
      <Actor uid="e10-mom" look="momHome" f={f} place={() => MOM} face={(tt) => (holding(tt) ? 0.2 : 0.55)} pose={momPose} role="mother" seed={5} layer="body" />
      <Actor uid="e10-dad" look="dadIT" f={f} place={() => DAD} face={(tt) => (holding(tt) ? -0.35 : -0.5)} pose={dadPose} role="father" seed={2} layer="body" />
      <KitchenTable />
      {holding(f) ? null : (
        <Svg>
          <g transform={`translate(${MOM_PHONE.x} ${MOM_PHONE.y}) scale(1 0.3)`}>
            <rect x={-38} y={-70} width={76} height={140} rx={12} fill={C.pink} />
            <rect x={-32} y={-62} width={64} height={124} rx={8} fill="#2C3B5C" />
          </g>
        </Svg>
      )}
      <Actor uid="e10-mom" look="momHome" f={f} place={() => MOM} face={(tt) => (holding(tt) ? 0.2 : 0.55)} pose={momPose} role="mother" seed={5} layer="arms" />
      <Actor uid="e10-dad" look="dadIT" f={f} place={() => DAD} face={(tt) => (holding(tt) ? -0.35 : -0.5)} pose={dadPose} role="father" seed={2} layer="arms" />
    </Shot>
  );
};
