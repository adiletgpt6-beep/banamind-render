// Сцена 5. Два направления.
// A. Прихожая: бабушка встречает дочку и мягко касается её плеча; мама в
//    дверях убеждается, что всё хорошо, коротко переглядывается с бабушкой
//    и уходит обратно на работу.
// B. Связка «Мектеп → Үй → Кеңсе» (коротко, между действиями).
// C. То же офисное место: мама возвращается к оставленному блокноту, палец
//    на секунду ищет строку, на которой она остановилась.
import { Actor, type Place } from "../rig/Actor";
import { clamp, cruise, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { box, Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { C, TINT } from "../theme";
import { HALL, HallBack } from "../sets/Home";
import { H } from "./common";
import { RouteLink } from "./RouteLink";
import { NotebookTop } from "./OfficeShared";

export const grandmaPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "grandma");
  const enter: [number, number] = [6, 56];
  const touch = enter[1] + 4;
  const glance = touch + 26;
  const leave = glance + 26;
  const link = Math.min(leave + 34, T.word("N05", "Апасы") - 4);
  const note = link + 40;
  return { enter, touch, glance, leave, link, note, len: T.len };
};

export const GrandmaScene: React.FC = () => {
  const { f } = useScene("grandma");
  const p = usePlan(grandmaPlan);
  if (f < p.link) {
    const door = HALL.door.x + HALL.door.w / 2;
    const girlPlace = (t: number): Place => ({ x: lerp(door + 40, 560, cruise(clamp((t - p.enter[0]) / (p.enter[1] - p.enter[0])), 0.3)), y: HALL.floorY + 30, h: H.girl });
    const grandma: Place = { x: 330, y: HALL.floorY + 10, h: H.grandma };
    const momPlace = (t: number): Place => ({ x: door + 120 + keys(t, [[p.leave, 0], [p.leave + 30, 260]]), y: HALL.floorY - 10, h: H.mom });
    const touch = easeInOut(clamp((f - p.touch) / 12));
    return (
      <Shot f={f} cam={{ x: 620, y: 1150, zoom: 1.12 }} bg={C.wallHome}>
        <HallBack open={1} />
        <Actor uid="g5-mom" look="su2Mom" f={f} place={momPlace} face={(t) => (t < p.leave ? -0.55 : keys(t, [[p.leave, -0.55], [p.leave + 6, 0.7]]))} pose={(t) => ({ expr: t > p.glance - 4 ? "softSmile" : "calm", bagOnShoulder: 1, nod: keys(t, [[p.glance, 0], [p.glance + 6, 6], [p.glance + 14, 0]]), lookY: 0.05 })} seed={5} walkFrom={p.leave - 2} />
        <Actor
          uid="g5-gma"
          look="grandma"
          f={f}
          place={() => grandma}
          face={(t) => (t < p.glance ? 0.55 : keys(t, [[p.glance, 0.55], [p.glance + 8, 0.75]]))}
          pose={(t) => ({
            expr: "softSmile",
            lean: 8 * touch,
            armR: { target: keysV(t, [[p.touch - 2, { x: grandma.x + 110, y: grandma.y - 320 }], [p.touch + 12, { x: 520, y: HALL.floorY + 30 - 0.66 * H.girl }]]), shape: touch > 0.6 ? "open" : "relax", elbow: "down", behind: false },
            nod: keys(t, [[p.glance + 2, 0], [p.glance + 8, 6], [p.glance + 16, 0]]),
          })}
          seed={21}
          blinkShift={5}
        />
        <Actor uid="g5-girl" look="su2Girl" f={f} place={girlPlace} face={(t) => (t < p.enter[1] ? -0.7 : -0.45)} pose={() => ({ expr: "smile", lookY: -0.25 })} seed={7} blinkShift={23} walkFrom={p.enter[0]} />
        <div style={box({ left: -600, top: -600, width: 2400, height: 3200, backgroundColor: TINT.cool })} />
      </Shot>
    );
  }
  if (f < p.note) return <RouteLink t={f - p.link} />;
  // C. Палец ищет строку и останавливается на невыполненной
  const k = f - p.note;
  const y = keys(k, [[0, 560], [14, 690], [24, 800], [32, 820], [44, 930], [60, 930]], easeInOut);
  const x = keys(k, [[0, 300], [44, 260]]);
  return <NotebookTop f={f} finger={{ x, y }} />;
};
