// Сцена 4. Вечерний поиск («Кечинде»), тот же стол, что в начале.
// A. Общий план: мама с телефоном, папа с блокнотом; сын у комода в стороне.
// B. Телефон крупно (со стороны мамы): набирается «Мектептен үйгө
//    жеткирүү», общие результаты — без бренда.
// C. Средний план: сын слышит, оборачивается и подходит к торцу стола. K02.
// D. Папа сначала переводит взгляд на сына, затем поворачивает голову и
//    корпус; отвечает (F01). Мама тоже смотрит на сына.
import type { Place, PoseIn } from "../rig/Actor";
import { CloseHand } from "../props/CloseHand";
import { Phone30 } from "../props/Phone30";
import { clamp, cruise, keys, lerp } from "../rig/motion";
import { box, camMove, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Km2Timeline } from "../timing";
import { TINT } from "../theme";
import { KM2_TEXT } from "../script";
import { FLAT } from "../sets/Flat";
import { H, HANDS } from "./common";
import { TimeCaption } from "./Work";
import { DAD_SEAT, DiningRoom, momPhoneHand, MOM_SEAT, seated } from "./Room";

export const eveningPlan = (tl: Km2Timeline) => {
  const T = sceneTools(tl, "evening");
  const phone = 50;
  const room = Math.max(phone + 70, T.word("N04", "Уулу") - 4);
  const turn = T.word("N04", "сөзүн") + 2; // сын оборачивается
  const walk: [number, number] = [turn + 10, turn + 10 + 46];
  const k02 = T.from("K02");
  const k02End = T.to("K02");
  const dadEyes = k02End + 4;
  const dadTurn = dadEyes + 6;
  const dadShot = k02End + 2;
  return { phone, room, turn, walk, k02, k02End, dadEyes, dadTurn, dadShot, len: T.len };
};
type P = ReturnType<typeof eveningPlan>;

export const BOY_AT_CABINET = 1170;
const boyPlace = (p: P) => (t: number): Place => {
  const u = cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3);
  return { x: lerp(BOY_AT_CABINET, FLAT.boyStand, u), y: FLAT.floorY + 24, h: H.boy };
};

const cast = (p: P) => ({
  momPose: (t: number): PoseIn => ({
    ...seated(MOM_SEAT),
    expr: "calm",
    lookY: keys(t, [[p.k02 - 4, 0.55], [p.k02 + 4, 0.15]]),
    armR: momPhoneHand(),
    armL: { target: { x: MOM_SEAT.x - 20, y: FLAT.table.top - 120 }, shape: "relax", elbow: "down", behind: false },
  }),
  momFace: (t: number) => keys(t, [[p.k02, 0.12], [p.k02 + 14, 0.6]]),
  dadPose: (t: number): PoseIn => ({
    ...seated(DAD_SEAT),
    expr: t > p.dadTurn + 10 ? "softSmile" : "thinking",
    lookY: keys(t, [[p.dadEyes, 0.6], [p.dadEyes + 4, 0.1]]),
    // глаза опережают голову: короткий взгляд в сторону сына до поворота
    lookX: keys(t, [[p.dadEyes, 0], [p.dadEyes + 3, 0.7], [p.dadTurn + 10, 0.1]]),
    turnBody: keys(t, [[p.dadTurn, 0.4], [p.dadTurn + 20, 0.9]]),
    armR: t < p.dadTurn ? { target: { x: FLAT.notebook.x + 30, y: FLAT.table.top - 14 }, shape: "fist", item: "pen", elbow: "down", behind: false } : { target: { x: FLAT.notebook.x + 50, y: FLAT.table.top - 4 }, shape: "fist", item: "pen", elbow: "down", behind: false },
    armL: { target: { x: FLAT.notebook.x - 70, y: FLAT.table.top - 6 }, shape: "relax", elbow: "down", behind: false },
  }),
  dadFace: (t: number) => keys(t, [[p.dadTurn, 0.05], [p.dadTurn + 14, 0.7]]),
  boyPlace: boyPlace(p),
  boyPose: (t: number): PoseIn => ({
    expr: t >= p.k02 - 6 ? { browIn: 5, browOut: 1, lid: 0.06, smile: -0.05 } : "calm",
    lookY: t < p.turn ? 0.35 : 0.08,
    armL: t > p.walk[1] + 4 ? { target: { x: 928, y: FLAT.table.top - 4 }, shape: "relax", elbow: "down", behind: false } : undefined,
  }),
  boyFace: (t: number) => keys(t, [[p.turn, 0.75], [p.turn + 14, -0.6]]),
  boyWalkFrom: 0,
});

export const EveningScene: React.FC = () => {
  const { f } = useScene("evening");
  const p = usePlan(eveningPlan);
  const props = { phone: "hand" as const, car: "cabinet" as const, notebookRows: 3 };
  let shot: React.ReactNode;
  if (f < p.phone) shot = <DiningRoom f={f} cam={camMove(f, 0, p.phone, { x: 720, y: 1060, zoom: 1.0 }, { x: 700, y: 1050, zoom: 1.05 })} cast={cast(p)} props={props} />;
  else if (f < p.room) {
    const typed = clamp((f - p.phone - 6) / 40);
    shot = (
      <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#3A2E26">
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "radial-gradient(ellipse at 50% 30%, #8A6A4E, #3A2E26 75%)" })} />
        <Phone30 x={560} y={950} scale={1.4} tilt={-3} s={{ view: "search", typed }} />
        <Svg>
          <CloseHand x={250} y={1640} angle={200} size={190} {...HANDS.momHome} shape="grip" />
          <CloseHand x={860} y={1330} angle={150} size={170} {...HANDS.momHome} shape="point" lift={typed < 1 ? Math.abs(Math.sin(f / 2.2)) : 0} />
        </Svg>
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: TINT.warm })} />
      </Shot>
    );
  } else if (f < p.dadShot) {
    shot = <DiningRoom f={f} cam={camMove(f, p.room, p.walk[1], { x: 960, y: 1000, zoom: 1.5 }, { x: 900, y: 960, zoom: 1.65 })} cast={cast(p)} props={props} />;
  } else {
    shot = <DiningRoom f={f} cam={{ x: 840, y: 960, zoom: 1.6 }} cast={cast(p)} props={props} />;
  }
  return (
    <>
      {shot}
      <TimeCaption text={KM2_TEXT.evening} t={f - 4} out={48} />
    </>
  );
};
