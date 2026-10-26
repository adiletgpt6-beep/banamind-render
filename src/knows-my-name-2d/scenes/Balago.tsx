// Сцена 7. Родители находят BalaGo — самостоятельный поиск.
// A. Крупно у стола: мама снова берёт тот же телефон (рука → касание →
//    хват → подъём).
// B. Телефон крупно: среди результатов — карточка BalaGo (бренд появляется
//    впервые); касание; страница «Балдар үчүн такси»; блок Адилета —
//    сведения появляются по одному вместе со словами рассказчика.
// C. Средний план: папа наклоняется к экрану, у обоих общий взгляд на
//    телефон; затем мама поворачивается к папе и говорит (M02).
import type { PoseIn } from "../rig/Actor";
import { CloseHand } from "../props/CloseHand";
import { Phone30, phonePoint, PHONE_TARGETS } from "../props/Phone30";
import { clamp, easeInOut, keys, keysV } from "../rig/motion";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Km2Timeline } from "../timing";
import { TINT } from "../theme";
import { FLAT } from "../sets/Flat";
import { HANDS } from "./common";
import { DAD_SEAT, DiningRoom, momPhoneHand, MOM_SEAT, PHONE_CASE, PHONE_HAND_AT_TABLE, PHONE_ON_TABLE, seated } from "./Room";

export const balagoPlan = (tl: Km2Timeline) => {
  const T = sceneTools(tl, "balago");
  const reach = 4;
  const grip = reach + 18;
  const lifted = grip + 18;
  const screen = Math.min(lifted + 6, T.from("N05") + 4);
  const tap = Math.max(screen + 24, T.word("N05", "БалаГо") + 4);
  const page = tap + 6;
  const scroll: [number, number] = [Math.max(page + 20, T.word("N05", "Адилет") - 14), Math.max(page + 20, T.word("N05", "Адилет") - 14) + 18];
  const facts = [T.word("N05", "беш"), T.word("N05", "Балдар"), T.word("N05", "араб")];
  const room = T.to("N05") + 6;
  const momTurn = T.from("M02") - 14;
  return { reach, grip, lifted, screen, tap, page, scroll, facts, room, momTurn, len: T.len };
};
type P = ReturnType<typeof balagoPlan>;

const AT_TABLE = PHONE_HAND_AT_TABLE;

const cast = (p: P) => ({
  momPose: (t: number): PoseIn => {
    const chest = momPhoneHand(30, -150).target;
    const rest = { x: MOM_SEAT.x + 60, y: FLAT.table.top - 2 };
    const hand = keysV(t, [
      [p.reach, rest],
      [p.grip, AT_TABLE],
      [p.grip + 4, AT_TABLE],
      [p.lifted, chest],
    ]);
    const holding = t >= p.grip;
    return {
      ...seated(MOM_SEAT),
      expr: t > p.momTurn ? "calm" : "neutral",
      lookY: t < p.momTurn ? 0.55 : keys(t, [[p.momTurn, 0.55], [p.momTurn + 5, 0.1]]),
      armR: holding
        ? { target: hand, shape: "phone", item: "phone", itemColor: PHONE_CASE, glow: -1, flat: keys(t, [[p.grip + 4, 1], [p.grip + 14, 0]]), itemTilt: -8, elbow: "down", behind: false }
        : { target: hand, shape: "open", elbow: "down", behind: false },
      armL: { target: { x: MOM_SEAT.x - 20, y: FLAT.table.top - 120 }, shape: "relax", elbow: "down", behind: false },
    };
  },
  momFace: (t: number) => keys(t, [[p.momTurn, 0.15], [p.momTurn + 14, 0.65]]),
  dadPose: (t: number): PoseIn => ({
    ...seated(DAD_SEAT),
    expr: "thinking",
    lean: keys(t, [[p.room - 30, 0], [p.room, 12]]),
    lookY: 0.4,
    lookX: -0.2,
    armR: { target: { x: FLAT.notebook.x + 50, y: FLAT.table.top - 4 }, shape: "fist", item: "pen", elbow: "down", behind: false },
    armL: { target: { x: FLAT.notebook.x - 80, y: FLAT.table.top - 6 }, shape: "relax", elbow: "down", behind: false },
  }),
  dadFace: () => -0.55,
  boyPose: (): PoseIn => ({ expr: "calm", lookY: 0.2, armL: { target: { x: 928, y: FLAT.table.top - 4 }, shape: "relax", elbow: "down", behind: false } }),
  boyFace: () => -0.6,
});

const PX = 560;
const PY = 950;
const PS = 1.4;

export const PhoneCloseUp: React.FC<{ f: number; y?: number; s: Parameters<typeof Phone30>[0]["s"]; finger?: { x: number; y: number; press: boolean } | null }> = ({ f, y = PY, s, finger }) => (
  <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3A2E26">
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "radial-gradient(ellipse at 50% 30%, #8A6A4E, #3A2E26 75%)" })} />
    <Phone30 x={PX} y={y} scale={PS} s={s} />
    <Svg>
      <CloseHand x={250} y={1640} angle={200} size={190} {...HANDS.momHome} shape="grip" />
      {finger ? <CloseHand x={finger.x + 70} y={finger.y + 190} angle={160} size={170} {...HANDS.momHome} shape="point" lift={finger.press ? 0 : 1} /> : null}
    </Svg>
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: TINT.warm })} />
  </Shot>
);
export const phoneScreenPt = (pt: { x: number; y: number }, y = PY) => phonePoint(PX, y, PS, pt);

export const BalagoScene: React.FC = () => {
  const { f } = useScene("balago");
  const p = usePlan(balagoPlan);
  const props = { phone: f >= p.grip ? ("hand" as const) : ("table" as const), car: "cabinet" as const, notebookRows: 5 };
  if (f < p.screen) return <DiningRoom f={f} cam={{ x: PHONE_ON_TABLE.x - 10, y: PHONE_ON_TABLE.y - 150, zoom: 2.4 }} cast={cast(p)} props={props} />;
  if (f < p.room) {
    const card = phoneScreenPt(PHONE_TARGETS.balagoCard);
    const facts = p.facts.reduce((a, t, i) => a + clamp((f - t) / 10) * (i < 3 ? 1 : 0), 0);
    if (f < p.page) {
      const fp = keysV(f, [
        [p.tap - 16, { x: card.x + 160, y: card.y + 260 }],
        [p.tap, card],
        [p.tap + 6, card],
      ]);
      return <PhoneCloseUp f={f} s={{ view: "results", typed: 1, tap: f >= p.tap }} finger={{ ...fp, press: f >= p.tap - 1 }} />;
    }
    const fpOut = keysV(f, [
      [p.page, card],
      [p.page + 14, { x: card.x + 200, y: card.y + 420 }],
    ]);
    return <PhoneCloseUp f={f} s={{ view: "page", scroll: easeInOut(clamp((f - p.scroll[0]) / (p.scroll[1] - p.scroll[0]))), facts }} finger={f < p.page + 14 ? { ...fpOut, press: false } : null} />;
  }
  return <DiningRoom f={f} cam={{ x: 560, y: 960, zoom: 1.7 }} cast={cast(p)} props={props} />;
};
