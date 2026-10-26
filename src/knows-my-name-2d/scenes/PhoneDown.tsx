// Сцена 5. Мама откладывает телефон — тот же момент, что в начале фильма.
// A. Тот же план и ракурс, что на вопросе сына в сцене 1 (K01 не
//    повторяется): узнаваемый взгляд мальчика.
// B. Крупно у стола: рука мамы опускает телефон экраном вниз — касание
//    столешницы, пальцы отпускают, кисть освобождается и отходит.
// C. Мама смотрит на сына и отвечает спокойно (M01); камера на уровне
//    ребёнка, неподвижна. Мама не листает экран.
// D. Мальчик немного думает и переводит взгляд на блокнот папы.
import type { PoseIn } from "../rig/Actor";
import { keys, keysV } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Km2Timeline } from "../timing";
import { FLAT } from "../sets/Flat";
import { DAD_SEAT, DiningRoom, momPhoneHand, MOM_SEAT, PHONE_CASE, PHONE_HAND_AT_TABLE, PHONE_ON_TABLE, seated } from "./Room";

export const phoneDownPlan = (tl: Km2Timeline) => {
  const T = sceneTools(tl, "phoneDown");
  const down = 20; // рука начинает опускать телефон
  const contact = down + 24;
  const release = contact + 5;
  const m01 = T.from("M01");
  const m01End = T.to("M01");
  const think = m01End + 4;
  const look = think + 16;
  const momShot = Math.min(release + 16, m01 - 6);
  return { down, contact, release, m01, m01End, think, look, momShot, len: T.len };
};
type P = ReturnType<typeof phoneDownPlan>;

// Кисть у телефона на столе: запястье чуть выше и левее середины телефона.
const AT_TABLE = PHONE_HAND_AT_TABLE;

export const phoneDownCast = (p: P) => ({
  momPose: (t: number): PoseIn => {
    const chest = momPhoneHand().target;
    const hand = keysV(t, [
      [p.down, chest],
      [p.contact, AT_TABLE],
      [p.release, AT_TABLE],
      [p.release + 16, { x: MOM_SEAT.x + 60, y: FLAT.table.top - 2 }],
    ]);
    const holding = t < p.release;
    const flat = keys(t, [[p.contact - 12, 0], [p.contact - 2, 1]]);
    return {
      ...seated(MOM_SEAT),
      expr: t > p.m01 - 10 ? "softSmile" : "calm",
      lookY: keys(t, [[p.down, 0.05], [p.down + 6, 0.5], [p.release + 2, 0.5], [p.release + 10, 0.05]]),
      armR: holding
        ? { target: hand, shape: "phone", item: "phone", itemColor: PHONE_CASE, glow: -1, flat, itemTilt: 0, elbow: "down", behind: false }
        : { target: hand, shape: "open", elbow: "down", behind: false },
      armL: { target: { x: MOM_SEAT.x - 70, y: FLAT.table.top + 2 }, shape: "relax", elbow: "down", behind: false },
    };
  },
  momFace: (t: number) => keys(t, [[p.down, 0.62], [p.down + 8, 0.35], [p.release + 4, 0.35], [p.release + 14, 0.62]]),
  dadPose: (): PoseIn => ({
    ...seated(DAD_SEAT),
    expr: "calm",
    lookY: 0.1,
    armR: { target: { x: FLAT.notebook.x + 50, y: FLAT.table.top - 4 }, shape: "fist", item: "pen", elbow: "down", behind: false },
    armL: { target: { x: FLAT.notebook.x - 70, y: FLAT.table.top - 6 }, shape: "relax", elbow: "down", behind: false },
  }),
  dadFace: () => 0.7,
  boyPose: (t: number): PoseIn => ({
    expr: t > p.think ? "thinking" : t > p.m01End - 20 ? "calm" : { browIn: 4, browOut: 2, lid: 0.06, smile: 0 },
    lookY: keys(t, [[p.look, 0.08], [p.look + 8, 0.5]]),
    armL: { target: { x: 928, y: FLAT.table.top - 4 }, shape: "relax", elbow: "down", behind: false },
  }),
  boyFace: (t: number) => keys(t, [[p.look, -0.55], [p.look + 14, -0.35]]),
});

export const PhoneDownScene: React.FC = () => {
  const { f } = useScene("phoneDown");
  const p = usePlan(phoneDownPlan);
  const cast = phoneDownCast(p);
  const props = { phone: f >= p.release ? ("table" as const) : ("hand" as const), car: "cabinet" as const, notebookRows: 3 };
  // A. тот же план, что на вопросе в сцене 1
  if (f < p.down) return <DiningRoom f={f} cam={{ x: 930, y: 930, zoom: 1.85 }} cast={cast} props={props} />;
  // B. крупно: телефон ложится на стол
  if (f < p.momShot) return <DiningRoom f={f} cam={{ x: PHONE_ON_TABLE.x - 10, y: PHONE_ON_TABLE.y - 120, zoom: 2.7 }} cast={cast} props={props} />;
  // C. мама отвечает (средний план на уровне ребёнка)
  if (f < p.think) return <DiningRoom f={f} cam={{ x: MOM_SEAT.x + 120, y: 960, zoom: 1.75 }} cast={cast} props={props} />;
  // D. мальчик думает и смотрит на блокнот
  return <DiningRoom f={f} cam={{ x: 900, y: 960, zoom: 1.75 }} cast={cast} props={props} />;
};
