// Сцена 1. Двадцать пять имён (N01).
// A. Сверху крупно: обычный конверт «Эмир» на детском столе. Слева входят
//    кончики пальцев мамы и останавливаются у края — конверт не поднят.
// B. Камера отъезжает: ещё несколько имён, затем вся раскладка 5×5 на
//    столе (контактные тени). Внизу справа «Мээрим» лежит оборотом с
//    открытым клапаном: рука Аяна закрывает клапан по линии сгиба и
//    переворачивает конверт — это 25-й, а не новый. Когда видны все 25 —
//    подпись «25 конверт».
// C. На словах о празднике — стена у стола: детские рисунки и календарь
//    обычного месяца (будни, без праздничных отметок).
// D. Комната спереди: мама смотрит на имена, потом на сына; Аян держит
//    ладонь на «Мээрим», останавливается и поднимает глаза.
import { clamp, easeInOut, keys } from "../rig/motion";
import { EMIR, ENVELOPES, TE2_TEXT } from "../script";
import { camMove, Tag, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { SKIN } from "../props/CloseHand";
import { gridLayout, TOP, type EnvState } from "../sets/Room";
import { DeskTop, reach, wristFor } from "./desk";
import { ayanSeated, AYAN_SEAT, MOM_STAND, onDesk, RoomFront, ROOM_CAM, type ActorSpec } from "./room";

const MEERIM = ENVELOPES[24];

export const namesPlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "names");
  const n01 = T.from("N01");
  const holiday = T.word("N01", "Ал");
  const room = holiday + Math.round((T.to("N01") - holiday) * 0.62);
  return {
    momIn: [8, 30] as const,
    pull: [26, Math.min(holiday - 40, 118)] as const,
    flapClose: [72, 92] as const,
    flip: [100, 122] as const,
    tag: 128,
    n01,
    holiday,
    room,
    len: T.len,
  };
};

export const NamesScene: React.FC = () => {
  const { f } = useScene("names");
  const p = usePlan(namesPlan);
  // «Мээрим»: оборотом, клапан открыт → закрыт → лицом вверх
  const meerimOpen = 1 - easeInOut(clamp((f - p.flapClose[0]) / (p.flapClose[1] - p.flapClose[0])));
  const meerimTurn = 1 - easeInOut(clamp((f - p.flip[0]) / (p.flip[1] - p.flip[0])));
  const items: EnvState[] = gridLayout().map((e) => (e.env.id === MEERIM.id ? { ...e, turn: meerimTurn, open: meerimOpen, empty: false } : e));

  if (f < p.holiday) {
    // ---- A + B: вид сверху ----
    const emir = TOP.grid(EMIR.row, EMIR.col);
    const cam = camMove(f, p.pull[0], p.pull[1], { x: emir.x - 70, y: emir.y + 40, zoom: 2.5 }, { x: 1110, y: 900, zoom: 0.6 });
    // мама: кончики пальцев у левого края «Эмир», без захвата
    const momTip = { x: emir.x - 175, y: emir.y + 30 };
    const momAt = wristFor(momTip, 230, -96);
    const momW = reach(f, { x: momAt.x - 150, y: momAt.y + 30 }, momAt, p.momIn[1], 1e9, p.momIn[1] - p.momIn[0] + 8);
    // Аян: ладонь на клапане «Мээрим», затем переворот за край
    const m = TOP.grid(MEERIM.row, MEERIM.col);
    const ayanTip = { x: m.x - 20, y: m.y + (f < p.flip[0] ? -40 : 30) };
    const ayanAt = wristFor(ayanTip, 240, 180);
    const ayanW = reach(f, { x: ayanAt.x + 60, y: ayanAt.y + 420 }, ayanAt, p.flapClose[0], p.flip[1] + 6, 18);
    const tagT = f - p.tag;
    return (
      <DeskTop
        f={f}
        cam={cam}
        items={items}
        hands={[
          { x: momW.x, y: momW.y, angle: -96, skin: SKIN.mom, shape: "open", mirror: true },
          { x: ayanW.x, y: ayanW.y, angle: 180, size: 240, skin: SKIN.ayan, shape: f < p.flip[0] ? "open" : "pinch" },
        ]}
        overlay={<Tag text={TE2_TEXT.count} t={tagT} x={290} y={230} out={p.holiday - p.tag - 10} size={84} />}
      />
    );
  }
  if (f < p.room) {
    // ---- C: стена с рисунками и календарём ----
    const cam = camMove(f, p.holiday, p.room, ROOM_CAM.calendar, { ...ROOM_CAM.calendar, zoom: ROOM_CAM.calendar.zoom * 1.04 });
    return <RoomFront f={f} cam={cam} items={items} ayan={ayanSpec(p)} mom={momSpec(p)} />;
  }
  // ---- D: мама и сын ----
  const cam = camMove(f, p.room, p.len, ROOM_CAM.two, { ...ROOM_CAM.two, zoom: ROOM_CAM.two.zoom * 1.03 });
  return <RoomFront f={f} cam={cam} items={items} ayan={ayanSpec(p)} mom={momSpec(p)} />;
};

type P = ReturnType<typeof namesPlan>;

const ayanSpec = (p: P): ActorSpec => ({
  uid: "n-ayan",
  look: "ayanHome",
  place: () => AYAN_SEAT,
  // смотрит на конверт, замечает интерес мамы — поднимает глаза к ней
  face: (t) => keys(t, [[p.room + 6, 0.1], [p.room + 22, 0.55]]),
  pose: (t) =>
    ayanSeated({
      expr: t < p.room + 20 ? "thinking" : { browIn: 3, browOut: 2, lid: 0.08, smile: 0.05 },
      lookY: keys(t, [[p.room + 8, 0.55], [p.room + 22, -0.1]]),
      nod: keys(t, [[p.room + 8, 6], [p.room + 22, 0]]),
      // ладонь лежит на «Мээрим» и останавливается
      armL: { target: onDesk(TOP.grid(4, 4).x, TOP.grid(4, 4).y + 40), shape: "open", elbow: "down" },
    }),
  seed: 11,
});

const momSpec = (p: P): ActorSpec => ({
  uid: "n-mom",
  look: "momHome",
  place: () => MOM_STAND,
  // сначала смотрит на имена, потом на сына
  face: (t) => keys(t, [[p.room + 14, -0.35], [p.room + 30, -0.7]]),
  pose: (t) => ({
    expr: t < p.room + 24 ? "thinking" : { browIn: 4, browOut: 3, lid: 0.06, smile: 0.12 },
    lookY: keys(t, [[p.room + 14, 0.75], [p.room + 30, 0.25]]),
    nod: keys(t, [[p.room + 14, 9], [p.room + 30, 3]]),
    lean: keys(t, [[p.room + 14, 8], [p.room + 30, 4]]),
    armR: { target: null },
    armL: { target: { x: MOM_STAND.x - 150, y: 1268 }, shape: "relax", elbow: "down" },
  }),
  seed: 12,
});

