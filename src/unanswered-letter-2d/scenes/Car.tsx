// Сцены 4–5 (повседневность).
// 4. «Кызы айтып берет»: дочка ждёт у школы, белая машина мамы подъезжает,
//    задняя дверь открывается, дочка подходит; салон: дочка сзади
//    пристёгнута, держит папку с листами для рисования: «Апа, бизде сүрөт
//    сынагы болот! Мен да катышам.» Айжан тепло: «Абдан жакшы!» — короткая
//    улыбка и взгляд в зеркало, руки на руле, взгляд на дорогу. Машина
//    уезжает вправо; линия «Мектеп → Үй» растёт в ту же сторону. Готовый
//    рисунок пока не раскрывается.
// 5. «Күн кайталанат»: бабушка встречает дочку дома; Айжан возвращается
//    в офис к отложенным документам. Смена 1-күн → 2-күн → 3-күн: короткие
//    повторы школьной поездки, незавершённых документов и того же черновика.
import { fontFamily } from "../../fonts";
import { Icon } from "../graphics/Icons";
import { caretOn } from "../graphics/Letter";
import { MOMENTS } from "../layout";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { UL2_LETTER, UL2_TEXT } from "../script";
import { CabinBack, CabinFront, FrontSeats } from "../sets/CarViews";
import { HomeBack } from "../sets/Home";
import { PanelHouse, Sky } from "../sets/Outdoor";
import { Sedan, sedanHandle, sedanSeat } from "../sets/Sedan";
import { SchoolBack, SchoolFence, SidewalkTrees } from "../sets/School";
import { LaptopOver, SCREEN } from "../graphics/LaptopOver";
import { Depth, box as wbox } from "../shots";
import { C } from "../theme";
import { H, placeAt, typingAt } from "./common";
import { box, PanelArea, Stage, useScene } from "./kit";

export const CAR_WHITE = "#F4F6F9";
export const FOLDER_BLUE = "#6FA8DC";

// Ремень безопасности: плечевая часть и поясная (мир кадра, px).
const Belt: React.FC<{ anchor: Vec; buckle: Vec; lap: Vec; w?: number }> = ({ anchor, buckle, lap, w = 18 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <path d={`M ${anchor.x} ${anchor.y} L ${buckle.x} ${buckle.y}`} stroke="#1F2228" strokeWidth={w} strokeLinecap="round" />
    <path d={`M ${anchor.x} ${anchor.y} L ${buckle.x} ${buckle.y}`} stroke="#3A3F4A" strokeWidth={w * 0.45} strokeLinecap="round" />
    <path d={`M ${lap.x} ${lap.y} L ${buckle.x} ${buckle.y}`} stroke="#1F2228" strokeWidth={w} strokeLinecap="round" />
    <rect x={buckle.x - 12} y={buckle.y - 8} width={24} height={16} rx={4} fill="#9AA3B2" />
  </svg>
);

// Маршрут «Мектеп → Үй» (чип внизу карточки), progress 0…1.
export const RouteChip: React.FC<{ progress: number; a: number; bottom?: number }> = ({ progress, a, bottom = 24 }) => (
  <div style={box({ left: 130, right: 130, bottom, height: 92, borderRadius: 46, backgroundColor: "rgba(23,28,38,0.92)", display: "flex", alignItems: "center", gap: 16, padding: "0 28px", fontFamily, fontSize: 34, fontWeight: 900, color: C.text, opacity: a })}>
    <Icon id="school" size={38} color="#8FD3A6" stroke={4} />
    <span>{UL2_TEXT.school}</span>
    <div style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: "#3A4558", position: "relative" }}>
      <div style={{ width: `${100 * progress}%`, height: 8, borderRadius: 4, backgroundColor: "#8FD3A6" }} />
      <div style={{ position: "absolute", left: `calc(${100 * progress}% - 11px)`, top: -7, width: 22, height: 22, borderRadius: 11, backgroundColor: C.yellow }} />
    </div>
    <Icon id="home" size={38} color="#FFC46B" stroke={4} />
    <span>{UL2_TEXT.home}</span>
  </div>
);

// ---------- 4. Дочка рассказывает ----------
// Порядок и масштаб: машина и девочка в одном масштабе во всех планах
// (кузов 2000 px мира ≈ 4,6 м, девочка 560 px ≈ 1,3 м). Правостороннее
// движение: машина останавливается у школьного тротуара правым бортом.
//   A. Общий план через дорогу: школа, дочка ждёт на тротуаре; седан
//      подъезжает справа налево (виден борт водителя, мама за рулём) и
//      останавливается у тротуара.
//   B. Обратная точка — с тротуара (напротив — дома): машина смотрит
//      вправо, виден пассажирский борт. Дочка идёт вдоль машины к ЗАДНЕЙ
//      двери (за передней, где мама), берётся за ручку, дверь открывается
//      на шарнире у переднего края.
//   C. Дочка поворачивается и садится в проём: тело оказывается за порогом
//      и внутри салона (слой между салоном и кузовом), ноги убираются,
//      дверь закрывается — девочку видно только через стекло задней двери.
//   D. Салон: она на том же заднем месте, пристёгивается, машина едет.
//   E. С тротуара: машина уезжает вправо — туда же растёт линия
//      «Мектеп → Үй».
const CAR_S = 2; // длина кузова 2000 px мира
const KID_H = 560; // рост девочки в том же масштабе
const ROAD = 2160; // земля под колёсами в общем плане
const STOP = 1250; // где останавливается машина (общий план)
const KID_A = 2420; // дочка на тротуаре у школы (общий план)
// с тротуара: машина смотрит вправо
const B_CAR = { x: 1300, y: 2100 };
const WALK_Y = 2150; // тротуар перед машиной
export const CarScene: React.FC = () => {
  const { f, from, to } = useScene("car");
  const d01 = from("d01");
  const m02 = from("m02");
  const arrive = 34;
  const cutB = 40; // → вид с тротуара
  const reach = 72; // дошла до задней двери
  const handle = 78; // рука на ручке
  const doorOpen = [80, 92] as const;
  const enter = [94, 118] as const; // поворот, шаг в проём, садится, ноги внутрь
  const doorClose = [120, 130] as const;
  const cutD = 132; // → салон
  const outCut = to("m02") + 12; // салон → машина уезжает (≈ 1 с)
  // A. машина подъезжает справа налево и тормозит
  const carX = keys(f, [[0, STOP + 1700], [arrive, STOP]], easeOut);
  const wheelA = -(carX / (64 * CAR_S)) * 57.3;
  const kidA = (): Place => ({ x: KID_A, y: 1950, h: KID_H });
  const kidAPose = (tt: number): PoseIn => ({
    expr: tt < 14 ? "calm" : "smile",
    armR: tt > 16 && tt < cutB ? { target: { x: KID_A - 0.22 * KID_H, y: 1950 - 0.98 * KID_H + Math.sin(tt * 0.55) * 14 }, shape: "wave", elbow: "out" } : { target: null, shape: "relax" },
    strapTug: 0.3,
  });
  // B/C. дочка идёт к задней двери, открывает её и садится
  const h = sedanHandle(B_CAR.x, B_CAR.y, CAR_S, 1);
  const seat = sedanSeat(B_CAR.x, B_CAR.y, CAR_S, 1);
  const standX = h.x - 70; // у заднего края двери
  const floorY = B_CAR.y - 112; // пол салона (стопы сидящей)
  const kidB = (tt: number): Place => {
    if (tt < enter[0]) return { x: keys(tt, [[cutB, standX + 620], [reach, standX]], (x) => cruise(x, 0.25)), y: WALK_Y, h: KID_H };
    // шаг в проём: вперёд-вверх на порог, затем таз на сиденье
    const u = clamp((tt - enter[0]) / (enter[1] - enter[0]));
    return { x: lerp(standX, seat.x + 10, easeInOut(u)), y: lerp(WALK_Y, floorY, easeInOut(clamp(u * 1.3))), h: KID_H };
  };
  const inside = f >= enter[0] + 9; // тело уже за порогом — рисуется за кузовом
  const sitU = (tt: number) => clamp((tt - (enter[0] + 8)) / (enter[1] - enter[0] - 8));
  const kidBPose = (tt: number): PoseIn => {
    const opening = tt >= handle - 8 && tt < doorOpen[1] + 2;
    return {
      expr: "smile",
      sit: easeInOut(sitU(tt)),
      seat: floorY - seat.y,
      lean: keys(tt, [[enter[0], 0], [enter[0] + 8, 16], [enter[1] - 6, 10], [enter[1] + 6, 0]]),
      // рука на ручке — тянет дверь на себя (к зрителю)
      armL: opening ? { target: keysV(tt, [[handle - 8, { x: standX + 40, y: WALK_Y - 0.5 * KID_H }], [handle, h], [doorOpen[0], h], [doorOpen[1], { x: h.x + 60, y: h.y + 30 }]], anticipate), shape: tt >= handle ? "fist" : "open", elbow: "down" } : { target: null, shape: "relax" },
      strapTug: 0.4,
      packOff: false,
    };
  };
  // идёт влево вдоль машины; у двери — к ручке; садясь, поворачивается
  // лицом вперёд по ходу машины (вправо)
  const kidBFace = (tt: number) => (tt < reach ? -0.75 : tt < enter[0] ? keys(tt, [[reach, -0.75], [reach + 6, 0.35]]) : keys(tt, [[enter[0], 0.35], [enter[1], 0.7]]));
  const door = f < doorClose[0] ? keys(f, [[doorOpen[0], 0], [doorOpen[1], 1]]) : keys(f, [[doorClose[0], 1], [doorClose[1], 0]]);
  // D. салон
  const mom: Place = { x: 830, y: 1980, h: 1150 };
  const girl: Place = { x: 470, y: 1360, h: 760 };
  const momPose = (tt: number): PoseIn => ({
    expr: tt < d01 + 10 ? "calm" : tt < m02 - 4 ? "softSmile" : tt < to("m02") + 20 ? "smile" : "softSmile",
    sit: 1,
    seat: 760,
    // кисти на ободе руля (на «10 и 2 часа»)
    armL: { target: { x: 690, y: 1236 }, shape: "fist", elbow: "down" },
    armR: { target: { x: 950, y: 1236 }, shape: "fist", elbow: "down" },
    // взгляд на дорогу; короткий взгляд в зеркало на дочку и снова на дорогу
    lookX: keys(tt, [[d01 + 4, 0], [d01 + 12, -0.5], [d01 + 34, -0.5], [d01 + 44, 0], [m02 - 6, 0], [m02 + 2, -0.45], [to("m02") + 6, -0.45], [to("m02") + 16, 0]]),
    lookY: -0.05,
    nod: keys(tt, [[m02 - 2, 0], [m02 + 5, 4], [m02 + 14, 0]]),
  });
  const momFace = (tt: number) => keys(tt, [[d01 + 4, 0], [d01 + 14, -0.12], [d01 + 34, -0.12], [d01 + 46, 0]]);
  // дочка: пристёгивается (правой рукой ведёт ремень к замку), затем
  // «…сүрөт сынагы болот!» — ладонь поднята; «Мен да катышам» — к груди
  const fold = { x: 500, y: 1010 };
  const buckle = [cutD, cutD + 16] as const;
  const anchor = { x: 392, y: 800 };
  const lock = { x: 552, y: 1060 };
  const beltEnd = keysV(f, [[buckle[0], { x: 420, y: 860 }], [buckle[1], lock]], easeInOut);
  const self = d01 + Math.round((cueWord(d01, to("d01"), 0.55)));
  const girlPose = (tt: number): PoseIn => ({
    expr: tt < d01 - 4 ? "calm" : tt < to("m02") + 30 ? "smile" : "softSmile",
    sit: 1,
    seat: 330,
    packOff: true,
    lean: keys(tt, [[d01 - 4, 0], [d01 + 6, 6], [self, 6], [self + 10, 2], [to("d01") + 10, 0]]),
    armL: { target: { x: fold.x - 62, y: fold.y + 18 }, shape: "fist", elbow: "down", behind: false },
    armR: tt < buckle[1] + 4
      ? { target: keysV(tt, [[buckle[0], { x: 420, y: 860 }], [buckle[1], { x: lock.x - 4, y: lock.y - 10 }]], easeInOut), shape: "fist", elbow: "down", behind: false }
      : {
          target: keysV(tt, [[buckle[1] + 4, { x: fold.x + 62, y: fold.y + 18 }], [d01 + 2, { x: fold.x + 62, y: fold.y + 18 }], [d01 + 12, { x: 600, y: 880 }], [self - 4, { x: 606, y: 872 }], [self + 6, { x: 500, y: 930 }], [to("d01") + 2, { x: 500, y: 934 }], [to("d01") + 14, { x: fold.x + 62, y: fold.y + 18 }]], anticipate),
          shape: tt > d01 + 4 && tt < self ? "open" : tt >= self && tt < to("d01") + 6 ? "relax" : "fist",
          elbow: "down",
          behind: false,
        },
    lookY: keys(tt, [[buckle[0], 0.4], [buckle[1], 0.4], [buckle[1] + 8, 0]]),
    lookX: keys(tt, [[0, -0.5], [d01 - 10, -0.5], [d01 - 2, 0.1], [to("m02") + 20, 0.1], [to("m02") + 40, -0.4]]),
    nod: keys(tt, [[to("m02") + 2, 0], [to("m02") + 8, 4], [to("m02") + 16, 0]]),
  });
  const girlFace = (tt: number) => keys(tt, [[0, -0.4], [d01 - 10, -0.4], [d01, 0.15], [to("m02") + 20, 0.15], [to("m02") + 40, -0.3]]);
  // поездка: прогресс маршрута от начала движения до конца сцены
  const drive = buckle[1];
  const progress = clamp((f - drive) / (291 - drive));
  const pass = Math.max(0, f - drive) * 1.4;
  const driveX = B_CAR.x + Math.max(0, f - outCut) ** 1.35 * 6;
  // салон рисуется в верхней части карточки; полоса маршрута — отдельно снизу
  const CABIN_H = 900;
  return (
    <PanelArea>
      {f < cutB ? (
        <Stage cam={{ x: 1500, y: 1700, zoom: 0.42 }} bg="#CFE3F2">
          <SchoolBack minutes={14 * 60 + 32} doorOpen={0} />
          <SchoolFence />
          <SidewalkTrees />
          <div style={wbox({ left: -1400, top: 1990, width: 5200, height: 700, backgroundColor: "#8B929C" })} />
          <div style={wbox({ left: -1400, top: 2300, width: 5200, height: 12, backgroundImage: "repeating-linear-gradient(90deg, #F4F6F9 0 120px, transparent 120px 240px)" })} />
          <Actor uid="c4-kidA" look="girl" f={f} place={kidA} face={(tt) => (tt < 12 ? 0.1 : 0.6)} pose={kidAPose} seed={5} />
          <Sedan x={carX} y={ROAD} s={CAR_S} dir={-1} wheel={wheelA} driver />
        </Stage>
      ) : f < cutD ? (
        <Stage cam={{ x: 1080, y: 1600, zoom: 0.62 }} bg="#CFE3F2">
          {/* напротив — дорога и дома (вид с тротуара) */}
          <Sky w={4000} h={1500} />
          {[0, 1, 2].map((i) => (
            <PanelHouse key={i} x={-120 + i * 760} y={1640} w={640} floors={5} color={["#D9CBB9", "#CFC2B4", "#E2D5C3"][i]} seed={i + 4} />
          ))}
          <div style={wbox({ left: -800, top: 1640, width: 6000, height: 250, backgroundColor: "#8B929C" })} />
          <div style={wbox({ left: -800, top: 1890, width: 6000, height: 140, backgroundColor: "#D9D2C6" })} />
          <div style={wbox({ left: -800, top: 2030, width: 6000, height: 600, backgroundColor: "#CFC7BA" })} />
          <div style={wbox({ left: -800, top: 2108, width: 6000, height: 16, backgroundColor: "#B9B1A4" })} />
          {/* салон за стёклами и проёмом */}
          <Sedan x={B_CAR.x} y={B_CAR.y} s={CAR_S} dir={1} door={door} part="back" />
          {/* в салоне: девочка за порогом — кузов и дверь перед ней */}
          {inside ? <Actor uid="c4-kidB" look="girl" f={f} place={kidB} face={kidBFace} pose={kidBPose} role="daughter" seed={5} walkFrom={cutB} /> : null}
          <Sedan x={B_CAR.x} y={B_CAR.y} s={CAR_S} dir={1} door={door} driver hollow />
          {inside ? null : <Actor uid="c4-kidB" look="girl" f={f} place={kidB} face={kidBFace} pose={kidBPose} role="daughter" seed={5} walkFrom={cutB} />}
          <Sedan x={B_CAR.x} y={B_CAR.y} s={CAR_S} dir={1} door={door} part="front" />
        </Stage>
      ) : f < outCut ? (
        <>
          <Stage cam={{ x: 590, y: 1010 + (f > drive ? Math.sin(f * 0.3) * 1.5 : 0), zoom: 0.95 }} bg="#3B414D" inset={{ x: 0, y: 0, w: 940, h: CABIN_H }} radius={0}>
            <CabinBack />
            {/* в заднем окне проплывает улица — машина едет */}
            <div style={wbox({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
              {[0, 1, 2, 3, 4].map((i) => {
                const x = (((i * 260 - pass * 10) % 1300) + 1300) % 1300 - 200;
                return <div key={i} style={wbox({ left: x, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: ["#F1E3C8", "#7FAF63", "#DDE3E8", "#E8DCCB", "#86B06A"][i], borderRadius: i % 2 ? 80 : 6 })} />;
              })}
            </div>
            <Actor uid="c4-girl" look="girl" f={f} place={() => girl} face={girlFace} pose={girlPose} role="daughter" seed={5} layer="body" />
            {/* папка с листами для рисования (рисунок ещё не показан) */}
            <div style={wbox({ left: fold.x - 92, top: fold.y - 60, width: 184, height: 136, borderRadius: 12, backgroundColor: FOLDER_BLUE, boxShadow: "inset 0 -10px 0 rgba(0,0,0,0.1)" })}>
              <div style={wbox({ left: 14, top: -10, width: 150, height: 20, borderRadius: 4, backgroundColor: "#FFFDF5" })} />
            </div>
            {/* ремень: от крепления у плеча через грудь к замку (пристёгивается), поясная часть по бёдрам */}
            <Belt anchor={anchor} buckle={beltEnd} lap={{ x: 398, y: 1058 }} />
            <Actor uid="c4-girl-a" look="girl" f={f} place={() => girl} face={girlFace} pose={girlPose} role="daughter" seed={5} layer="arms" />
            <div style={wbox({ left: 360, top: 1066, width: 500, height: 300, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
            <FrontSeats />
            <Actor uid="c4-mom" look="aizhan" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={11} />
            <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              <path d="M 905 1000 L 745 1440" stroke="#1F2228" strokeWidth={22} strokeLinecap="round" />
              <path d="M 905 1000 L 745 1440" stroke="#3A3F4A" strokeWidth={9} strokeLinecap="round" />
            </svg>
            <CabinFront pass={pass} wheel={f > drive ? Math.sin(f * 0.05) * 3 : 0} />
          </Stage>
          {/* полоса маршрута — отдельно от салона */}
          <div style={box({ left: 0, top: CABIN_H, width: 940, bottom: 0, backgroundColor: "#1E2229" })} />
        </>
      ) : (
        <Stage cam={{ x: driveX - 200, y: 1640, zoom: 0.5 }} base={{ x: 1100, y: 1640, zoom: 0.5 }} bg="#CFE3F2">
          {/* с тротуара: напротив дома, машина уезжает вправо */}
          <Sky w={9000} h={1500} />
          <Depth depth={0.45}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <PanelHouse key={i} x={-600 + i * 760} y={1640} w={620} floors={5} color={["#D9CBB9", "#CFC2B4", "#E2D5C3", "#D3C6B6", "#DCCFBF"][i % 5]} seed={i + 2} />
            ))}
          </Depth>
          <div style={wbox({ left: -1600, top: 1640, width: 12000, height: 250, backgroundColor: "#8B929C" })} />
          <div style={wbox({ left: -1600, top: 1890, width: 12000, height: 140, backgroundColor: "#D9D2C6" })} />
          <div style={wbox({ left: -1600, top: 2030, width: 12000, height: 600, backgroundColor: "#CFC7BA" })} />
          <div style={wbox({ left: -1600, top: 2108, width: 12000, height: 16, backgroundColor: "#B9B1A4" })} />
          <Sedan x={driveX} y={B_CAR.y} s={CAR_S} dir={1} wheel={(driveX / (64 * CAR_S)) * 57.3} driver kid />
        </Stage>
      )}
      {f >= cutD ? <RouteChip progress={progress} a={easeOut((f - cutD - 6) / 10)} /> : null}
    </PanelArea>
  );
};

// Кадр реплики примерно на доле u её длительности (для смены жеста).
const cueWord = (from: number, to: number, u: number) => (to - from) * u;

// ---------- 5. День повторяется ----------
// Дом: дочка входит первой и идёт к бабушке, бабушка встречает её (рука на
// плече); мама остаётся у двери, машет и уходит из кадра через дверь —
// без наложения фигур и без «прозрачной» мамы. Офис: отложенные
// документы. Затем 2-й и 3-й день — тот же список крупными карточками с
// пометкой «2-жолу»/«3-жолу»: школа → отложенная работа → незаконченный
// ответ (на 3-й день незаконченный ответ выделен).
const DayRow: React.FC<{ icon: "school" | "folder" | "letter"; color: string; title: string; body?: React.ReactNode; a: number; y: number; hl?: number; badge: string }> = ({ icon, color, title, body, a, y, hl = 0, badge }) => (
  <div style={box({ left: 40, right: 40, top: y, height: 200, borderRadius: 32, backgroundColor: "#FFFFFF", border: `4px solid ${hl > 0.5 ? C.yellow : C.cardLine}`, boxShadow: hl > 0.05 ? `0 0 0 ${10 * hl}px rgba(255,211,61,0.3)` : "0 8px 24px rgba(23,36,51,0.08)", display: "flex", alignItems: "center", gap: 26, padding: "0 30px", fontFamily, opacity: a, translate: `0 ${(1 - a) * 50}px` })}>
    <div style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <Icon id={icon} size={60} color={C.ink} stroke={4} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: C.inkSoft, whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ fontSize: 50, fontWeight: 900, color: C.ink, whiteSpace: "nowrap" }}>{body}</div>
    </div>
    <div style={{ padding: "8px 18px", borderRadius: 999, backgroundColor: "#EEF2F7", fontSize: 30, fontWeight: 900, color: C.inkSoft, flex: "none", alignSelf: "flex-start", marginTop: 22 }}>{badge}</div>
  </div>
);

const DocsScreen: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, backgroundColor: "#FFFFFF", fontFamily, color: C.ink })}>
    <div style={box({ left: 0, top: 0, width: SCREEN.w, height: 110, backgroundColor: "#F1F5FA", display: "flex", alignItems: "center", gap: 20, padding: "0 36px" })}>
      <Icon id="folder" size={60} color="#C79A12" stroke={4} />
      <div style={{ fontSize: 50, fontWeight: 900 }}>{UL2_TEXT.docs}</div>
    </div>
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 40, right: 40, top: 150 + i * 140, height: 110, borderRadius: 20, backgroundColor: "#F4F6FA", display: "flex", alignItems: "center", gap: 24, padding: "0 28px" })}>
        <div style={{ width: 60, height: 76, borderRadius: 8, backgroundColor: ["#7FB8F0", "#8FD3A6", "#B79CF2"][i] }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: [460, 380, 520][i], height: 22, borderRadius: 11, backgroundColor: "#B9C4D2" }} />
          <div style={{ width: [300, 340, 240][i], height: 18, borderRadius: 9, backgroundColor: "#DCE3EC", marginTop: 14 }} />
        </div>
      </div>
    ))}
  </div>
);

const GRANDMA_X = 760;
const FLOOR = 1580;
export const DaysScene: React.FC = () => {
  const { f, at, word } = useScene("days");
  const officeCut = word("n02", 4) - 2; // «кеңсеге»
  const d2 = at(MOMENTS.day2);
  const d3 = at(MOMENTS.day3);
  // дом: дочка входит и идёт к бабушке
  const girlPlace = (tt: number): Place => placeAt(keys(tt, [[0, 390], [2, 390], [40, 570]], (x) => cruise(x, 0.3)), FLOOR, H.girl);
  const girlPose = (tt: number): PoseIn => ({ expr: "smile", strapTug: 0.4, lookY: keys(tt, [[38, 0], [46, -0.15]]) });
  const girlFace = (tt: number) => keys(tt, [[0, 0.6], [40, 0.6], [48, 0.5], [60, -0.3]]);
  // бабушка: делает шаг навстречу, наклоняется, кладёт руку дочке на плечо
  const gmPlace = (tt: number): Place => placeAt(keys(tt, [[18, GRANDMA_X + 20], [40, GRANDMA_X - 10]], (x) => cruise(x, 0.35)), FLOOR - 10, H.grandma);
  const grandmaPose = (tt: number): PoseIn => {
    const g = girlPlace(tt);
    const shoulder = { x: g.x + 0.12 * g.h, y: g.y - 0.72 * g.h };
    return {
      expr: "smile",
      lean: keys(tt, [[38, 0], [48, 8]]),
      armR: tt > 40 ? { target: keysV(tt, [[40, { x: GRANDMA_X - 60, y: FLOOR - 400 }], [52, shoulder]], anticipate), shape: "open", elbow: "down" } : { target: null, shape: "relax" },
      nod: keys(tt, [[44, 0], [52, 4], [62, 0]]),
    };
  };
  // мама: стоит в дверях (дочка уже впереди, фигуры не перекрываются),
  // машет и уходит через дверь из кадра
  const momPlace = (tt: number): Place => placeAt(keys(tt, [[52, 200], [76, -240]], (x) => cruise(x, 0.3)), 1540, H.mom);
  const momPose = (tt: number): PoseIn => ({
    expr: "softSmile",
    armR: tt > 22 && tt < 48 ? { target: { x: 200 + 160, y: 1540 - 700 + Math.sin((tt - 22) * 0.5) * 14 }, shape: "wave", elbow: "out" } : { target: null, shape: "relax" },
  });
  const momFace = (tt: number) => (tt < 50 ? 0.55 : -0.8);
  const draftLine = (
    <span>
      {UL2_LETTER.draft}
      <span style={{ display: "inline-block", width: 4, height: 46, marginLeft: 4, verticalAlign: "-6px", backgroundColor: caretOn(f) ? "#2F6FD6" : "transparent" }} />
    </span>
  );
  // 2-й и 3-й день: строки появляются одна за другой
  const rows = (start: number, end: number) => {
    const out = end < 9999 ? 1 - easeOut((f - end + 5) / 6) : 1;
    return [0, 1, 2].map((i) => easeOut((f - start - i * 6) / 8) * out);
  };
  const s2 = rows(d2, d3);
  const s3 = rows(d3, 9999);
  const dayNo = f < d3 ? UL2_TEXT.day2 : UL2_TEXT.day3;
  const badge = f < d3 ? UL2_TEXT.again2 : UL2_TEXT.again3;
  const age = Math.max(0, f - (f < d3 ? d2 : d3));
  return (
    <PanelArea>
      {f < officeCut ? (
        <Stage cam={{ x: 470, y: 1110, zoom: 0.95 }} bg="#EFE3D0">
          <HomeBack minutes={15 * 60} doorOpen={1} />
          <Actor uid="d5-mom" look="aizhan" f={f} place={momPlace} face={momFace} pose={momPose} seed={11} walkFrom={50} />
          <Actor uid="d5-gm" look="grandma" f={f} place={gmPlace} face={(tt) => (tt < 16 ? -0.2 : -0.6)} pose={grandmaPose} seed={7} walkFrom={18} />
          <Actor uid="d5-girl" look="girl" f={f} place={girlPlace} face={girlFace} pose={girlPose} seed={5} walkFrom={0} />
        </Stage>
      ) : f < d2 ? (
        <LaptopOver screen={<DocsScreen />} hands={{ mode: "type", tapL: typingAt(f, officeCut, -1).tap, tapR: typingAt(f, officeCut, 1).tap, shift: typingAt(f, officeCut, -1).shift }} />
      ) : (
        <div style={box({ inset: 0, backgroundColor: "#EEF2F7" })}>
          <div style={box({ left: 0, right: 0, top: 50, textAlign: "center", fontFamily, fontSize: 120, fontWeight: 900, color: C.ink, opacity: easeOut(age / 6), scale: `${0.9 + 0.1 * easeOut(age / 6)}` })}>{dayNo}</div>
          {[s2, s3].map((s, k) => (
            <div key={k}>
              <DayRow icon="school" color="#8FD3A6" title={UL2_TEXT.reminder} body={`${UL2_TEXT.school} → ${UL2_TEXT.home}`} a={s[0]} y={250} badge={badge} />
              <DayRow icon="folder" color="#E8C26A" title={UL2_TEXT.docs} body={UL2_TEXT.postponed} a={s[1]} y={490} badge={badge} />
              <DayRow icon="letter" color="#7FB8F0" title={UL2_LETTER.subject} body={draftLine} a={s[2]} y={730} hl={k === 1 ? easeOut((f - d3 - 26) / 10) : 0} badge={badge} />
            </div>
          ))}
        </div>
      )}
    </PanelArea>
  );
};
