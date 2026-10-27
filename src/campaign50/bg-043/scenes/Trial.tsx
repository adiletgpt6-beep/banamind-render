// Сцена 5 (≈00:47–01:00): «Шарттуу мисал» — условная мини-сцена ПОСЛЕ
// формирования группы. Светлая диорама Бишкека в коробке-макете: слева
// ҮЙ, справа МЕКТЕП, между ними тополя, сзади заснеженный Ала-Тоо.
// На «Топ уюшулганда» появляется шапка «Топ уюшулгандан кийин», а оба
// будильника на полке переднего плана наконец встают рядом (но время у
// них по-прежнему разное: 08:00 и 13:00).
// «Эртең менен»: белый седан с жёлтой полосой (водитель держит руль
// обеими руками, ребёнок в заднем окне пристёгнут — диагональная лямка)
// едет ҮЙ → МЕКТЕП; камера ведёт машину и отъезжает. У школы ремень
// отстёгивается, ребёнок выходит и идёт к дверям, учительница машет.
// На «толук» — плашка «Акысыз толук сыноо», на «сапары» — маршрут
// «Биринчи толук сапар: ҮЙ → МЕКТЕП → ҮЙ», на «акысыз» — блик и искры.
// «Сабактан кийин»: солнце поднимается по дуге, небо светлеет; машина
// возвращается к школе, ребёнок садится, ремень застёгивается (щелчок) —
// только потом машина трогается к дому. Мама выходит на крыльцо и ждёт;
// ребёнок машет ей из окна, выходит и бежит к ней — объятие: ребёнка
// встречает мама. Машина уезжает. На «чечимин» — карточка «Улантуу
// чечими — сизде» (две кнопки, ничего не нажимается) и примечание об
// оплате; мама задумчиво улыбается. Часы смотрят на карточку: «Мектеп
// сааты» тянется пальцем к «Улантуу», «Жумуш сааты» мягко останавливает
// его — решение за родителем. В конце шестерёнки часов замедляются и
// замирают (переход: жёлтый круг финала).
// Все биты — от фактических слов реплики n03 (wordFrame).
import { useCurrentFrame } from "remotion";
import { appear, clamp, easeIn, easeInOut, easeOut, hopArc, keys, lerp, shake, squashPulse } from "../anim";
import { timeToDeg, type ClockArm } from "../chars/Clock";
import { ClockActor, exprKeys } from "../chars/ClockActor";
import { useScene, useTimeline } from "../context";
import { Chip } from "../parts";
import { C } from "../palette";
import { Actor, type PoseIn } from "../rig/Actor";
import { cruise, type Vec } from "../rig/motion";
import { BG43_TEXT } from "../script";
import type { SceneSfx } from "../sfxCues";
import { camKeys, Shot, type Cam } from "../shots";
import { cueFrames, wordFrame, type Bg43Timeline } from "../timing";
import { Car, DIO, DioramaBack, DioramaClip, DioramaFront, DioramaStreet, DioramaTrees, HomeHouse, SchoolHouse } from "./trial-set";
import { ChoiceCard, Shelf, SHELF_Y, TimePill, TrialCard } from "./trial-ui";

const T = BG43_TEXT.trial;

// ---------- Персонажи и места (мир) ----------
const MOM = { x: DIO.home.door + 16, y: DIO.walk, h: 224 } as const;
const KID_H = 160;
const TEACHER = { x: 900, y: DIO.walk, h: 218 } as const;
// где стоит машина: у дома утром, у школы (утром — левее дверей, чтобы
// ребёнок у входа был виден), у дома после уроков — за дверью, слева:
// уезжая, машина не проезжает перед мамой и ребёнком
const CAR = { home: 330, schoolAm: 610, schoolPm: 760, homePm: 108, off: 1330, offL: -320 } as const;
// задняя дверь: ребёнок «выныривает» из-за кузова
const REAR = 52;
// ребёнок рядом с мамой при встрече (подбегает слева)
const KID_MEET: Vec = { x: MOM.x - 30, y: DIO.walk };

// ---------- Будильники на полке (кадр) ----------
const GY = SHELF_Y + 46;
const SIZE = 62;
const K = SIZE / 100;
// «Мектеп сааты» слева (ближе к карточке выбора), «Жумуш сааты» справа:
// их боковые шестерёнки сходятся между ними и в финале сцепляются
const S_START = 604;
const W_START = 936;
const S_SIDE = 690;
const W_SIDE = 876;
// выдвижение шестерёнок, при котором зубцы входят в зацепление
const GEAR_MESH = Math.min(1, ((W_SIDE - S_SIDE - 47) / 2 / (SIZE / 100) - 60) / 62);
const W8 = timeToDeg(8, 0);
const S13 = timeToDeg(13, 0);
type P = { readonly x: number; readonly y: number };
const REST_L: P = { x: -128, y: -72 };
const REST_R: P = { x: 128, y: -72 };
const blend = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

// Сердечки над мамой и ребёнком при встрече: всплывают и тают.
const Hearts: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly at: number }> = ({ x, y, f, at }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    {[
      [-22, 0, 1, 0],
      [16, -10, 0.8, 6],
      [-2, -30, 0.65, 12],
    ].map(([dx, dy, s, d], i) => {
      const t = (f - at - d) / 34;
      if (t < 0 || t > 1) return null;
      const k = s * (0.4 + 0.6 * easeOut(t * 3)) * 9;
      const o = Math.min(1, t * 6) * (1 - easeIn(t));
      return (
        <path
          key={i}
          transform={`translate(${x + dx + Math.sin(t * 6 + i) * 4} ${y + dy - t * 40}) scale(${k / 10})`}
          d="M 0 4 C -14 -6 -8 -16 0 -9 C 8 -16 14 -6 0 4 Z"
          fill="#F27C8A"
          stroke={C.navy}
          strokeWidth={1.6}
          opacity={o}
        />
      );
    })}
  </svg>
);

export const trialBeats = (tl: Bg43Timeline, sceneFrom: number, frames: number) => {
  const n = cueFrames(tl, "n03");
  const w = (i: number) => wordFrame(tl, "n03", i) - sceneFrom;
  const n0 = n.from - sceneFrom;
  const n1 = n.to - sceneFrom;
  // «Топ уюшулганда» — шапка; часы встают рядом
  const grp = Math.max(16, w(0) - 2);
  // утро: ҮЙ → МЕКТЕП
  const amGo = 12;
  const amStop = amGo + 40;
  const outS = amStop + 6; // ремень отстёгнут — ребёнок выходит
  const atDoor = outS + 32; // у дверей школы, машет водителю
  const inDoor = atDoor + 12; // входит в школу (8 кадров)
  const amAway = atDoor + 2; // водитель дождался, пока ребёнок дошёл до дверей
  // «толук» — плашка, «сапары» — маршрут, «акысыз» — блик
  const badge = Math.max(w(3), amStop + 6);
  const route = Math.max(w(5), badge + 12);
  const free = Math.max(w(6), route + 10);
  // после уроков: солнце, ярлык, машина возвращается к школе
  const pm = Math.max(inDoor + 8, route - 2, amAway + 26);
  // пауза-«перемотка»: сначала солнце и ярлык, потом машина возвращается
  const pmIn = pm + 12;
  const pmStop = pmIn + 22;
  const outDoor = pmIn + 2; // ребёнок выходит из школы
  const inCar = pmStop + 6; // сел в машину
  const buckle = inCar + 11; // ремень застёгнут (щелчок) — только потом едем
  const pmGo = buckle + 2;
  const homeStop = pmGo + 50;
  const momOut = pmGo + 4;
  const outH = homeStop + 5;
  const meet = outH + 20;
  const away = meet + 22; // машина уезжает, когда ребёнок уже у мамы
  // «чечимин» — карточка выбора (машина уже в пути)
  const choice = Math.max(w(10), pmGo + 12);
  // гэг часов — после объятия
  const eager = Math.max(choice + 26, meet + 44);
  const calm = eager + 16;
  const settle = calm + 26;
  const gOut = Math.min(frames - 70, settle + 8);
  const gStop = frames - 17;
  return {
    n0,
    n1,
    grp,
    amGo,
    amStop,
    outS,
    atDoor,
    inDoor,
    amAway,
    badge,
    route,
    free,
    pm,
    pmIn,
    pmStop,
    outDoor,
    inCar,
    buckle,
    pmGo,
    homeStop,
    momOut,
    outH,
    meet,
    away,
    choice,
    eager,
    calm,
    settle,
    gOut,
    gStop,
    frames,
  };
};
type Beats = ReturnType<typeof trialBeats>;

// ---------- Машина: положение, направление, колёса, клевок ----------
const carX = (t: number, b: Beats) => {
  if (t <= b.amGo) return CAR.home;
  if (t <= b.amStop) return lerp(CAR.home, CAR.schoolAm, cruise((t - b.amGo) / (b.amStop - b.amGo), 0.3));
  if (t <= b.amAway) return CAR.schoolAm;
  if (t < b.pmIn) return lerp(CAR.schoolAm, CAR.off, Math.pow(clamp((t - b.amAway) / 26), 2));
  if (t <= b.pmStop) return lerp(CAR.off, CAR.schoolPm, easeOut((t - b.pmIn) / (b.pmStop - b.pmIn)));
  if (t <= b.pmGo) return CAR.schoolPm;
  if (t <= b.homeStop) return lerp(CAR.schoolPm, CAR.homePm, cruise((t - b.pmGo) / (b.homeStop - b.pmGo), 0.32));
  if (t <= b.away) return CAR.homePm;
  return lerp(CAR.homePm, CAR.offL, Math.pow(clamp((t - b.away) / 30), 2));
};
const carDir = (t: number, b: Beats): 1 | -1 => (t < b.pmIn ? 1 : -1);

// ---------- Ребёнок: три появления (у школы утром, у школы днём, дома) ----------
// Утро: выныривает из-за кузова у задней двери и идёт к дверям школы.
const kidAm = (b: Beats) => (t: number) => {
  const from = { x: CAR.schoolAm - REAR, y: DIO.curb + 4 };
  const door = { x: DIO.school.door - 8, y: DIO.walk };
  const u = cruise((t - b.outS - 4) / (b.atDoor - b.outS - 4), 0.3);
  const go = clamp((t - b.inDoor) / 8);
  return { x: lerp(from.x, door.x, u), y: lerp(from.y, door.y, u) - 10 * go, h: KID_H * (1 - 0.06 * go) };
};
// Днём: выходит из дверей школы к машине и садится.
const kidPm = (b: Beats) => (t: number) => {
  const door = { x: DIO.school.door, y: DIO.walk - 10 };
  const curb = { x: CAR.schoolPm + REAR - 4, y: DIO.curb + 4 };
  const come = clamp((t - b.outDoor) / 8);
  const u = cruise((t - b.outDoor - 6) / (b.pmStop - b.outDoor - 2), 0.3);
  return { x: lerp(door.x, curb.x, u), y: lerp(door.y, curb.y, u), h: KID_H * (0.94 + 0.06 * come) };
};
// Дома: из-за машины (она стоит левее двери) — к маме.
const kidHome = (b: Beats) => (t: number) => {
  const from = { x: CAR.homePm + REAR, y: DIO.curb + 4 };
  const u = cruise((t - b.outH - 4) / (b.meet - b.outH - 4), 0.25);
  return { x: lerp(from.x, KID_MEET.x, u), y: lerp(from.y, KID_MEET.y, u), h: KID_H };
};

export const TrialScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { from, frames } = useScene();
  const b = trialBeats(tl, from, frames);

  // ---------- Камера ----------
  // начало: крупно машина у дома — видно ремень ребёнка и руки водителя
  const A: Cam = { x: 336, y: 915, zoom: 1.58 };
  const B: Cam = { x: 600, y: 905, zoom: 1.12 };
  const B2: Cam = { x: 612, y: 900, zoom: 1.1 };
  const WIDE: Cam = { x: 552, y: 872, zoom: 1.02 };
  const PICK: Cam = { x: 600, y: 890, zoom: 1.08 };
  // дом крупно: табличка ҮЙ — ниже верхней карточки, табличка школы — за
  // краем кадра, мама с ребёнком — в центре над карточкой выбора
  const HOME: Cam = { x: 336, y: 918, zoom: 1.42 };
  const HOME2: Cam = { x: 330, y: 908, zoom: 1.5 };
  const cam = camKeys(f, [
    [0, A],
    [b.amGo, A],
    [b.amStop + 8, B],
    [b.pm - 6, B2],
    [b.pm + 22, WIDE],
    [b.pmStop + 4, PICK],
    [b.pmGo + 2, PICK],
    [b.homeStop + 8, HOME],
    [frames, HOME2],
  ]);
  const toScreen = (wx: number, wy: number) => ({ x: 540 + (wx - cam.x) * cam.zoom, y: 960 + (wy - cam.y) * cam.zoom });

  // ---------- Время суток ----------
  // солнце: утром встаёт из-за хребта между домами → после уроков высоко над школой
  const day = easeInOut((f - b.pm) / 30);
  const sun = {
    x: (1 - day) * (1 - day) * 480 + 2 * day * (1 - day) * 720 + day * day * 930,
    y: (1 - day) * (1 - day) * 548 + 2 * day * (1 - day) * 360 + day * day * 520,
  };

  // ---------- Машина ----------
  const cx = carX(f, b);
  const dir = carDir(f, b);
  const wheel = (dir === 1 ? cx - CAR.home : CAR.off - cx) * 2.05;
  // клевок по ускорению (сглажено): разгон — нос вверх, торможение — вниз
  let acc = 0;
  for (let k = -3; k <= 3; k++) {
    const t = f + k;
    acc += (carX(t + 1, b) - 2 * carX(t, b) + carX(t - 1, b)) * (4 - Math.abs(k));
  }
  acc /= 16;
  const vel = Math.abs(carX(f + 1, b) - carX(f - 1, b)) / 2;
  const pitch = clamp(-acc * dir * 1.6, -2.6, 2.6);
  const bob = Math.abs(Math.sin(f * 1.15)) * 1.2 * clamp(vel / 6);
  // ребёнок в окне и ремень
  const kidIn =
    f < b.outS ? 1 - clamp((f - b.outS + 4) / 4) : f < b.outH ? clamp((f - b.inCar + 1) / 4) * (1 - clamp((f - b.outH + 4) / 4)) : 0;
  const belt =
    f < b.outS
      ? 1 - clamp((f - b.amStop - 1) / 4)
      : f < b.outH
        ? easeInOut((f - b.inCar - 3) / 8) * (1 - clamp((f - b.homeStop - 1) / 4))
        : 0;
  const wave = keys(f, [
    [b.homeStop - 22, 0],
    [b.homeStop - 16, 1],
    [b.homeStop - 2, 1],
    [b.homeStop + 2, 0],
  ]);

  // ---------- Двери ----------
  const schoolDoors = Math.max(
    keys(f, [
      [b.atDoor - 8, 0],
      [b.atDoor + 2, 1],
      [b.inDoor + 10, 1],
      [b.inDoor + 22, 0],
    ]),
    keys(f, [
      [b.outDoor - 12, 0],
      [b.outDoor - 2, 1],
      [b.outDoor + 14, 1],
      [b.outDoor + 26, 0],
    ]),
  );
  const homeDoor = keys(f, [
    [b.momOut - 8, 0],
    [b.momOut + 2, 1],
  ]);

  // ---------- Учительница у дверей школы ----------
  const teacherPlace = () => ({ x: TEACHER.x, y: TEACHER.y, h: TEACHER.h });
  const teacherFace = (t: number) =>
    keys(t, [
      [0, -0.2],
      [b.outS, -0.2],
      [b.outS + 8, -0.55],
      [b.inDoor + 8, -0.55],
      [b.inDoor + 16, -0.15],
      [b.outDoor - 4, -0.15],
      [b.outDoor + 4, -0.6],
    ]);
  const teacherPose = (t: number): PoseIn => {
    const p = { x: TEACHER.x, y: TEACHER.y, h: TEACHER.h };
    const w1 = keys(t, [
      [b.atDoor - 16, 0],
      [b.atDoor - 8, 1],
      [b.inDoor + 2, 1],
      [b.inDoor + 10, 0],
    ]);
    const w2 = keys(t, [
      [b.pmStop - 2, 0],
      [b.pmStop + 6, 1],
      [b.pmGo + 18, 1],
      [b.pmGo + 26, 0],
    ]);
    const wv = Math.max(w1, w2);
    const low = { x: p.x - 0.14 * p.h, y: p.y - 0.44 * p.h };
    const up = { x: p.x - 0.24 * p.h, y: p.y - 0.86 * p.h + Math.sin(t / 3.2) * 6 };
    return {
      expr: "smile",
      armL: { target: { x: low.x + (up.x - low.x) * wv, y: low.y + (up.y - low.y) * wv }, shape: wv > 0.5 ? "wave" : "relax", elbow: "out", wrist: Math.sin(t / 3.2) * 14 * wv },
      armR: { target: { x: p.x + 0.04 * p.h, y: p.y - 0.5 * p.h }, shape: "fist", item: "notebook", elbow: "down", behind: false },
      headTilt: 4 * wv,
    };
  };

  // ---------- Ребёнок ----------
  const kAm = kidAm(b);
  const kPm = kidPm(b);
  const kHome = kidHome(b);
  const kidAmOn = f >= b.outS - 1 && f < b.inDoor + 9;
  const kidPmOn = f >= b.outDoor && f < b.inCar;
  const kidHomeOn = f >= b.outH - 1;
  // выныривание из-за кузова: присед → встал; посадка: присел и скрылся
  const popUp = (t: number, at: number) => 0.62 * (1 - easeOut((t - at) / 9));
  const kidAmPose = (t: number): PoseIn => {
    const wv = keys(t, [
      [b.atDoor - 4, 0],
      [b.atDoor + 2, 1],
      [b.inDoor - 2, 1],
      [b.inDoor + 2, 0],
    ]);
    const p = kAm(t);
    return {
      expr: "smile",
      crouch: popUp(t, b.outS),
      armR: wv > 0.01 ? { target: { x: p.x + 0.26 * p.h, y: p.y - (0.6 + 0.3 * wv) * p.h + Math.sin(t / 2.6) * 4 }, shape: "wave", elbow: "out", wrist: Math.sin(t / 2.6) * 16 } : undefined,
      lookY: -0.2,
      strapTug: 1 - wv,
    };
  };
  const kidAmFace = (t: number) =>
    keys(t, [
      [b.atDoor - 4, 0.6],
      [b.atDoor + 2, -0.3],
      [b.inDoor - 2, -0.3],
      [b.inDoor + 2, 0],
    ]);
  const kidPmPose = (t: number): PoseIn => ({
    expr: "smile",
    crouch: 0.66 * easeIn((t - b.pmStop) / 8),
    strapTug: 1,
    lookY: 0.1,
  });
  const kidPmFace = (t: number) =>
    keys(t, [
      [b.outDoor, 0.4],
      [b.outDoor + 10, 0.1],
      [b.pmStop - 4, 0.1],
      [b.pmStop + 2, -0.3],
    ]);
  // встреча: руки — к маме, объятие, потом стоит рядом и смотрит на маму
  const hugK = (t: number) =>
    keys(t, [
      [b.meet - 6, 0],
      [b.meet + 2, 1],
      [b.meet + 40, 1],
      [b.meet + 52, 0],
    ]);
  const kidHomePose = (t: number): PoseIn => {
    const p = kHome(t);
    const hk = hugK(t);
    const reach = keys(t, [
      [b.meet - 12, 0],
      [b.meet - 3, 1],
    ]);
    // руки — вперёд к маме, при объятии — вокруг её талии
    const fwd = { x: p.x + 0.24 * p.h, y: p.y - 0.6 * p.h };
    const low = { x: p.x + 0.12 * p.h, y: p.y - 0.42 * p.h };
    const before = blend(low, fwd, reach);
    const w1 = { x: MOM.x - 0.05 * MOM.h, y: MOM.y - 0.5 * MOM.h };
    const w2 = { x: MOM.x + 0.05 * MOM.h, y: MOM.y - 0.47 * MOM.h };
    let armL: PoseIn["armL"];
    let armR: PoseIn["armR"];
    if (hk > 0.01) {
      armL = { target: blend(before, w1, hk), shape: "relax", elbow: "down", behind: false };
      armR = { target: blend(before, w2, hk), shape: "relax", elbow: "down", behind: false };
    } else if (reach > 0.01 && t < b.meet + 10) {
      armR = { target: before, shape: "open", elbow: "down", behind: false };
    }
    return {
      expr: "smile",
      crouch: popUp(t, b.outH),
      armL,
      armR,
      lookY: keys(t, [
        [b.meet + 40, -0.2],
        [b.meet + 52, -0.65],
      ]),
      headTilt: keys(t, [
        [b.meet - 2, 0],
        [b.meet + 6, 9],
        [b.meet + 40, 9],
        [b.meet + 52, -3],
      ]),
      strapTug: hk > 0.01 ? 0 : 1 - reach,
    };
  };
  const kidHomeFace = (t: number) =>
    keys(t, [
      [b.meet - 4, 0.85],
      [b.meet + 44, 0.85],
      [b.meet + 56, 0.4],
    ]);

  // ---------- Мама ----------
  const momPlace = () => ({ x: MOM.x, y: MOM.y, h: MOM.h });
  const momFace = (t: number) =>
    keys(t, [
      [b.momOut, 0.1],
      [b.momOut + 10, 0.45],
      [b.homeStop - 22, 0.45],
      [b.homeStop - 8, -0.5],
      [b.meet + 44, -0.55],
      [b.meet + 56, -0.3],
      [b.choice + 6, -0.3],
      [b.choice + 16, -0.15],
      // в конце — к зрителю: решение за родителем, мягкая улыбка
      [frames - 52, -0.15],
      [frames - 38, 0.05],
    ]);
  const momPose = (t: number): PoseIn => {
    const p = momPlace();
    const kid = kHome(t);
    const hk = hugK(t);
    const open = keys(t, [
      [b.meet - 16, 0],
      [b.meet - 5, 1],
    ]);
    const after = keys(t, [
      [b.meet + 40, 0],
      [b.meet + 54, 1],
    ]);
    const think = keys(t, [
      [Math.max(b.choice + 4, b.meet + 50), 0],
      [Math.max(b.choice + 18, b.meet + 64), 1],
      [frames - 40, 1],
      [frames - 24, 0.4],
    ]);
    // ожидание: ладони сложены; навстречу ребёнку — руки раскрыты (влево)
    const clasp = { x: p.x - 0.02 * p.h, y: p.y - 0.47 * p.h };
    const openL = { x: p.x - 0.3 * p.h, y: p.y - 0.62 * p.h };
    const openR = { x: p.x - 0.16 * p.h, y: p.y - 0.7 * p.h };
    // объятие: рука обнимает ребёнка за плечи, другая ладонь — к сердцу
    const back1 = { x: kid.x - 0.08 * KID_H, y: kid.y - 0.7 * KID_H };
    const back2 = { x: p.x + 0.01 * p.h, y: p.y - 0.66 * p.h };
    // потом: рука на плече ребёнка, другая — у подбородка (задумалась)
    const shoulder = { x: kid.x - 0.04 * KID_H, y: kid.y - 0.7 * KID_H };
    const chin = { x: p.x - 0.03 * p.h, y: p.y - 0.8 * p.h };
    const side = { x: p.x + 0.12 * p.h, y: p.y - 0.44 * p.h };
    let armL: PoseIn["armL"] = { target: blend({ x: clasp.x - 4, y: clasp.y + 3 }, openL, open), shape: open > 0.5 ? "open" : "relax", elbow: "down", behind: false };
    let armR: PoseIn["armR"] = { target: blend({ x: clasp.x + 6, y: clasp.y }, openR, open), shape: open > 0.5 ? "open" : "relax", elbow: "down", behind: false };
    if (hk > 0.01) {
      armL = { target: blend(blend(openL, back1, hk), shoulder, after), shape: after > 0.5 ? "relax" : "open", elbow: "down", behind: false };
      armR = { target: blend(blend(openR, back2, hk), side, after), shape: "open", elbow: "down", behind: false };
    }
    if (after >= 0.99) {
      armL = { target: shoulder, shape: "relax", elbow: "down", behind: false };
      armR = { target: blend(side, chin, think), shape: think > 0.5 ? "fist" : "relax", elbow: "down", behind: false };
    }
    return {
      armL,
      armR,
      expr: t < b.meet + 46 ? "smile" : think > 0.5 && t < frames - 30 ? "thinking" : "softSmile",
      headTilt: -9 * hk * (1 - after) - 6 * think,
      lookY: 0.55 * hk * (1 - after) + 0.45 * think + 0.35 * after * (1 - think) * (t < frames - 52 ? 1 : 0),
      lookX: -0.2 * think,
      nod:
        keys(t, [
          [b.homeStop + 4, 0],
          [b.homeStop + 10, 5],
          [b.homeStop + 18, 0],
        ]) +
        7 * hk * (1 - after) +
        keys(t, [
          [frames - 36, 0],
          [frames - 28, 5],
          [frames - 18, 0],
        ]),
      exhale: keys(t, [
        [b.meet + 2, 0],
        [b.meet + 14, 1],
        [b.meet + 30, 0],
      ]),
    };
  };
  const momO = appear(f, b.momOut, 9);

  // ================= Будильники =================
  // встают рядом на «Топ уюшулганда»
  const walkT = clamp((f - b.grp - 2) / 18);
  const wx = lerp(W_START, W_SIDE, easeInOut(walkT));
  const sx = lerp(S_START, S_SIDE, easeInOut(walkT));
  const walking = f > b.grp + 2 && f < b.grp + 20 ? 1 : 0;
  // куда смотреть: на машину, потом на маму с ребёнком, на карточку
  const carS = toScreen(cx, DIO.wheel - 110);
  const momS = toScreen(MOM.x - 20, MOM.y - 150);
  const cardS = { x: 330, y: 1100 };
  const target = (t: number) => {
    if (t < b.homeStop + 6) return carS;
    if (t < b.choice) return momS;
    if (t < b.settle) return cardS;
    return momS;
  };
  const tgt = target(f);
  const look = (x0: number) => {
    const eyeY = GY - 172 * K;
    return { x: clamp((tgt.x - x0) / 260, -1, 1), y: clamp((tgt.y - eyeY) / 300, -1, 1) };
  };
  const lw = look(wx);
  const ls = look(sx);
  const together = keys(f, [
    [b.grp + 18, 0],
    [b.grp + 24, 1],
    [b.grp + 40, 1],
    [b.grp + 46, 0],
  ]);
  const together2 = keys(f, [
    [b.settle - 4, 0],
    [b.settle + 4, 1],
    [b.gOut + 6, 1],
    [b.gOut + 16, 0.35],
  ]);
  const meetK = keys(f, [
    [b.meet - 2, 0],
    [b.meet + 6, 1],
    [b.meet + 46, 1],
    [b.meet + 54, 0],
  ]);
  const eagerK = keys(f, [
    [b.eager - 6, 0],
    [b.eager + 2, 1],
    [b.calm + 4, 1],
    [b.calm + 14, 0],
  ]);
  const shoulderK = keys(f, [
    [b.calm - 4, 0],
    [b.calm + 4, 1],
    [b.settle - 2, 1],
    [b.settle + 8, 0],
  ]);
  // переглядываются: «Мектеп сааты» (слева) — вправо, «Жумуш сааты» — влево
  const tg = Math.max(together, together2);
  const wFace = clamp(lw.x * 0.55 * (1 - tg) - 0.6 * tg - 0.45 * shoulderK, -1, 1);
  const sFace = clamp(ls.x * 0.55 * (1 - tg) + 0.6 * tg + 0.3 * shoulderK * (1 - tg), -1, 1);
  const wLook = { x: lerp(lw.x, -0.9, tg), y: lerp(lw.y * 0.8, 0, tg) };
  const sLook = { x: lerp(ls.x, 0.9, Math.max(tg, shoulderK * 0.8)), y: lerp(ls.y * 0.8, 0, tg) };

  const wExpr = exprKeys(f, [
    [0, "curious"],
    [b.grp + 18, "happy"],
    [b.grp + 46, "curious"],
    [b.badge, "proud"],
    [b.free, "happy"],
    [b.pm, "curious"],
    [b.homeStop, "soft"],
    [b.meet, "happy"],
    [b.choice, "curious"],
    [b.eager + 2, "worried"],
    [b.calm, "soft"],
    [b.settle, "happy"],
  ]);
  const sExpr = exprKeys(f, [
    [0, "excited"],
    [b.grp + 18, "happy"],
    [b.grp + 46, "curious"],
    [b.badge, "excited"],
    [b.free, "happy"],
    [b.pm, "curious"],
    [b.homeStop, "soft"],
    [b.meet, "happy"],
    [b.choice, "curious"],
    [b.eager - 4, "excited"],
    [b.calm + 4, "sheepish"],
    [b.settle, "happy"],
  ]);
  // руки «Мектеп сааты»
  let sArmL: ClockArm = null;
  let sArmR: ClockArm = null;
  const thumb = keys(f, [
    [b.badge, 0],
    [b.badge + 6, 1],
    [b.badge + 30, 1],
    [b.badge + 38, 0],
  ]);
  if (thumb > 0.01) sArmR = { ...blend(REST_R, { x: 156, y: -206 }, thumb), shape: "thumb" };
  const cheer = keys(f, [
    [b.free - 2, 0],
    [b.free + 4, 1],
    [b.free + 18, 1],
    [b.free + 26, 0],
  ]);
  if (cheer > 0.01) {
    sArmL = { ...blend(REST_L, { x: -150, y: -250 }, cheer), shape: "wave" };
    sArmR = { ...blend(REST_R, { x: 150, y: -250 }, cheer), shape: "wave" };
  }
  if (meetK > 0.01) {
    sArmL = { ...blend(REST_L, { x: -20, y: -66 }, meetK), shape: "relax" };
    sArmR = { ...blend(REST_R, { x: 22, y: -64 }, meetK), shape: "relax" };
  }
  if (eagerK > 0.01) {
    // азартно тянется пальцем к кнопке «Улантуу» (слева, на карточке)
    sArmL = { ...blend(REST_L, { x: -170, y: -186 + Math.sin(f / 2.4) * 5 * (1 - shoulderK) }, eagerK * (1 - 0.6 * shoulderK)), shape: "point" };
  }
  // руки «Жумуш сааты»
  let wArmL: ClockArm = null;
  let wArmR: ClockArm = null;
  const proud = keys(f, [
    [b.badge + 2, 0],
    [b.badge + 8, 1],
    [b.badge + 30, 1],
    [b.badge + 38, 0],
  ]);
  if (proud > 0.01) {
    wArmL = { ...blend(REST_L, { x: -112, y: -118 }, proud), shape: "fist" };
    wArmR = { ...blend(REST_R, { x: 112, y: -118 }, proud), shape: "fist" };
  }
  if (cheer > 0.01) wArmR = { ...blend(REST_R, { x: 150, y: -236 }, cheer), shape: "thumb" };
  if (meetK > 0.01) {
    wArmL = { ...blend(REST_L, { x: -22, y: -64 }, meetK), shape: "relax" };
    wArmR = { ...blend(REST_R, { x: 20, y: -66 }, meetK), shape: "relax" };
  }
  const sLift = hopArc(f, b.badge - 2, 10, 22) + hopArc(f, b.free, 10, 18) + hopArc(f, b.eager - 6, 9, 12);
  if (shoulderK > 0.01) {
    // ладонь на плечо соседа: «не спеши — решает родитель»
    const t = { x: (sx + 64 * K - wx) / K, y: -(208 + sLift) };
    wArmL = { ...blend(REST_L, t, shoulderK), shape: "open" };
  }
  // шестерёнки: выдвигаются навстречу, сцепляются и постепенно замирают
  const gearOut = keys(f, [
    [b.gOut, 0],
    [b.gOut + 12, GEAR_MESH],
  ]);
  const spinAt = (t: number) => {
    const v0 = 5;
    const s0 = b.gOut + 18;
    if (t <= s0) return v0 * t;
    const d = Math.max(1, b.gStop - s0);
    const u = Math.min(t, b.gStop) - s0;
    return v0 * s0 + v0 * u - (v0 * u * u) / (2 * d);
  };
  // после остановки — лёгкая «отдача» назад
  const settleKick = shake(f, b.gStop, 14, 4);
  // зацепление: вращаются навстречу, зубец одной — во впадине другой
  const wGear = -spinAt(f) + 18 + settleKick;
  const sGear = spinAt(f) - settleKick;

  // наклоны; когда шестерёнки сцеплены — почти без покачивания
  const still = 1 - 0.8 * clamp((f - b.gOut) / 10);
  const wTilt =
    Math.sin(f / 31) * 1.2 * still +
    walking * Math.sin((f - b.grp) / 2.5) * 3 -
    6 * meetK -
    keys(f, [
      [b.calm - 4, 0],
      [b.calm + 4, 6],
      [b.settle - 2, 6],
      [b.settle + 8, 0],
    ]) -
    3 * together2 * still;
  const sTilt =
    Math.sin(f / 29 + 1) * 1.3 * still +
    walking * Math.sin((f - b.grp) / 2.5 + 1) * 3 +
    6 * meetK -
    8 * eagerK * (1 - shoulderK) +
    3 * together2 * still +
    shake(f, b.calm + 6, 20, 4);
  const wSq =
    squashPulse(f, b.grp + 20, 10, 0.6) +
    squashPulse(f, b.badge + 4, 10, 0.5) +
    squashPulse(f, b.free + 2, 10, 0.45) +
    squashPulse(f, b.meet + 2, 12, -0.35) +
    squashPulse(f, b.settle + 2, 10, 0.4);
  const sSq =
    squashPulse(f, b.grp + 21, 10, 0.6) +
    squashPulse(f, b.badge + 8, 9, 0.6) +
    squashPulse(f, b.free + 10, 9, 0.5) +
    squashPulse(f, b.meet + 2, 12, -0.35) +
    squashPulse(f, b.eager + 3, 9, 0.5) +
    squashPulse(f, b.calm + 6, 12, -0.45) +
    squashPulse(f, b.settle + 2, 10, 0.4);

  return (
    <>
      <Shot cam={cam} bg={C.paper}>
        <DioramaClip>
          <DioramaBack f={f} day={day} sun={sun} />
          <DioramaStreet />
          <DioramaTrees f={f} day={day} />
          <HomeHouse door={homeDoor} pulse={squashPulse(f, b.homeStop + 2, 14, 1)} />
          <SchoolHouse doors={schoolDoors} pulse={squashPulse(f, b.amStop + 2, 14, 1)} />
          <Actor uid="t5-teacher" look="teacher" f={f} place={teacherPlace} face={teacherFace} pose={teacherPose} seed={5} />
          {kidAmOn ? <Actor uid="t5-kid-am" look="son" f={f} place={kAm} face={kidAmFace} pose={kidAmPose} seed={4} walkFrom={b.outS} opacity={clamp((f - b.outS + 1) / 4) * (1 - clamp((f - b.inDoor) / 8))} /> : null}
          {kidPmOn ? <Actor uid="t5-kid-pm" look="son" f={f} place={kPm} face={kidPmFace} pose={kidPmPose} seed={4} walkFrom={b.outDoor} opacity={clamp((f - b.outDoor) / 6) * (1 - clamp((f - b.pmStop - 1) / 5))} /> : null}
          {momO > 0 ? <Actor uid="t5-mom" look="mom" f={f} place={momPlace} face={momFace} pose={momPose} seed={11} layer="body" opacity={momO} walkFrom={b.momOut} /> : null}
          {kidHomeOn ? <Actor uid="t5-kid-home" look="son" f={f} place={kHome} face={kidHomeFace} pose={kidHomePose} seed={4} walkFrom={b.outH} opacity={clamp((f - b.outH + 1) / 4)} /> : null}
          {momO > 0 ? <Actor uid="t5-mom" look="mom" f={f} place={momPlace} face={momFace} pose={momPose} seed={11} layer="arms" opacity={momO} walkFrom={b.momOut} /> : null}
          <Car uid="t5" x={cx} y={DIO.wheel} dir={dir} wheel={wheel} pitch={pitch} bob={bob} kid={kidIn} belt={belt} wave={wave} f={f} />
          <DioramaFront f={f} />
        </DioramaClip>
        <Hearts x={MOM.x - 50} y={MOM.y - 0.84 * MOM.h} f={f} at={b.meet + 4} />
      </Shot>
      {/* полка переднего плана и будильники — рядом, но всё ещё на разном времени */}
      <Shelf />
      <ClockActor
        kind="work"
        seed={3}
        x={wx}
        y={GY}
        size={SIZE}
        hourDeg={W8.hourDeg}
        minDeg={W8.minDeg}
        expr={wExpr}
        face={wFace}
        lookX={wLook.x}
        lookY={wLook.y}
        tilt={wTilt}
        squash={wSq}
        step={(f - b.grp) / 5}
        stepAmt={walking}
        armL={wArmL}
        armR={wArmR}
        gear={gearOut}
        gearSpin={wGear}
      />
      <ClockActor
        kind="school"
        seed={7}
        x={sx}
        y={GY}
        size={SIZE}
        hourDeg={S13.hourDeg}
        minDeg={S13.minDeg}
        expr={sExpr}
        face={sFace}
        lookX={sLook.x}
        lookY={sLook.y}
        tilt={sTilt}
        squash={sSq}
        lift={sLift}
        step={(f - b.grp) / 5 + 0.5}
        stepAmt={walking}
        armL={sArmL}
        armR={sArmR}
        gear={gearOut}
        gearSpin={sGear}
      />
      {/* надписи: «Шарттуу мисал» — всё время сцены */}
      <Chip text={T.example} left={60} top={262} />
      <TimePill f={f} at={8} day={day} flip={b.pm + 4} />
      <TrialCard f={f} head={b.grp - 2} badge={b.badge} route={b.route} free={b.free} />
      <ChoiceCard f={f} at={b.choice} />
    </>
  );
};

export const trialSfx: SceneSfx = (tl, from, frames) => {
  const b = trialBeats(tl, from, frames);
  const out: ReturnType<SceneSfx> = [];
  const add = (at: number, src: ReturnType<SceneSfx>[number]["src"], volume: number) => {
    if (at >= 0 && at < frames) out.push({ at: from + at, src, volume });
  };
  // шапка и часы встают рядом
  add(b.grp - 2, "pop", 0.14);
  for (let k = b.grp + 5; k < b.grp + 20; k += 5) add(k, "step", 0.12);
  // утро: машина ҮЙ → МЕКТЕП, ремень отстёгнут, машина уезжает
  add(b.amGo - 2, "car", 0.16);
  add(b.amAway, "car", 0.1);
  // плашка, маршрут, «акысыз»
  add(b.badge, "pop", 0.22);
  add(b.route, "pop", 0.12);
  add(b.free, "chime", 0.2);
  // после уроков: солнце по дуге, машина возвращается
  add(b.pm, "whoosh", 0.1);
  add(b.pm + 6, "ding", 0.1);
  add(b.pmIn, "car", 0.14);
  add(b.buckle, "click", 0.12); // щелчок замка ремня (не кнопка выбора)
  add(b.pmGo, "car", 0.16);
  add(b.momOut - 2, "slide", 0.08); // дверь дома открывается
  // встреча и отъезд машины
  add(b.meet + 2, "chime", 0.12);
  add(b.away + 4, "car", 0.08);
  // карточка выбора (без щелчков — ничего не нажимается)
  add(b.choice, "pop", 0.18);
  add(b.eager - 6, "boing", 0.08);
  // шестерёнки выдвигаются и замирают
  add(b.gOut, "gear", 0.12);
  add(b.gStop, "tick", 0.14);
  return out;
};
