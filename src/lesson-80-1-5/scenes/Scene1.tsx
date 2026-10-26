// Сцена 1 «Что получится?»: руки Амира и заготовка крупно — последний сгиб,
// раскрытие корпуса, борт; установочный план с группой и названием;
// «Вот! Лодочка!» — подъём и осторожное опускание на воду; рябь затухает,
// лодочка держится на поверхности.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { TimelineContext } from "../context";
import type { PoseIn } from "../rig/Actor";
import type { HandShape } from "../rig/pose";
import { anticipate, clamp, keys, keysV, lerp, type Vec } from "../rig/motion";
import { foldPoint, FORM } from "../set/Paper";
import { ROOM } from "../set/Room";
import { CAM_WIDE, camMove, Shot } from "../shots";
import { CAST, handAt, LAP, lookDownTo, restOnTable, sceneFrames, turnTo } from "./common";
import { World, type PropsState } from "./World";

const S = 0.78; // масштаб заготовки на столе
const AM = "p02";

export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useContext(TimelineContext);
  const F = sceneFrames(tl, "s1");
  const hands = F.action("s1-hands");
  const open = F.action("s1-open");
  const lift = F.action("s1-lift");
  const water = F.action("s1-water");
  const float = F.action("s1-float");
  const l01 = F.line("l01");
  const l03 = F.line("l03");
  const l04 = F.line("l04");
  const l05 = F.line("l05");
  const l06 = F.line("l06");
  const work = ROOM.props.work;
  const basin = ROOM.props.basin;
  const amir = CAST.amir;
  const yusuf = CAST.yusuf;
  const bilal = CAST.bilal;
  const teacher = CAST.teacher;

  // ---------- состояние заготовки ----------
  const fold = keys(f, [[hands.from + 8, 0], [hands.from + 50, 1]], anticipate);
  const openK = keys(f, [[open.from + 26, 0], [open.from + 98, 1]], anticipate);
  const hull = keys(f, [[open.from + 112, 0], [open.from + 176, 1]]);
  const touch = water.from + Math.round(water.len * 0.55);
  const liftV = keys(f, [[lift.from - 4, 0], [lift.from + 16, 72], [water.from + 10, 72], [touch - 16, 16], [touch, 0]], anticipate);
  const waterTop: Vec = { x: basin.x + 8, y: basin.y - 6 };
  const formPos = keysV(f, [[water.from + 10, work], [touch - 12, waterTop], [touch, waterTop]], anticipate);
  const inHands = f >= lift.from - 4 && f < touch + 6;
  // локальная точка заготовки → мир
  const L = (p: Vec): Vec => ({ x: formPos.x + p.x * S, y: formPos.y + p.y * S - liftV });
  const la = { x: -FORM.W * (1 - FORM.band / FORM.H), y: FORM.band };
  const lb = { x: -la.x, y: FORM.band };
  const bottom = { x: 0, y: FORM.H };
  const leftC = { x: -FORM.W, y: 0 };
  const rightC = { x: FORM.W, y: 0 };
  const hullTopL = { x: -FORM.hullTopX, y: FORM.hullTopY };
  const hullTopR = { x: FORM.hullTopX, y: FORM.hullTopY };
  const hullBotL = { x: -FORM.hullBotX, y: FORM.hullBotY };
  const hullBotR = { x: FORM.hullBotX, y: FORM.hullBotY };
  const mix = (a: Vec, b: Vec, t: number): Vec => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

  // ---------- руки Амира ----------
  const amirPose = (t: number): PoseIn => {
    const foldT = keys(t, [[hands.from + 8, 0], [hands.from + 50, 1]], anticipate);
    const openT = keys(t, [[open.from + 26, 0], [open.from + 98, 1]], anticipate);
    const hullT = keys(t, [[open.from + 112, 0], [open.from + 176, 1]]);
    const pressA = hands.from + 56;
    const pressB = hands.from + 92;
    const rimA = open.from + 184;
    const rimB = open.from + 230;
    let tipL: Vec;
    let tipR: Vec;
    let shapeL: HandShape = "pinch";
    let shapeR: HandShape = "pinch";
    if (t < pressA) {
      // последний сгиб: левая держит левый угол, правая ведёт нижний угол по дуге
      tipL = L(leftC);
      tipR = L(foldPoint(bottom, la, lb, foldT));
    } else if (t < pressB) {
      // прижать линию сгиба: два пальца слева направо
      tipL = L(leftC);
      tipR = L(mix({ x: la.x + 6, y: la.y - 2 }, { x: lb.x - 6, y: lb.y - 2 }, anticipate((t - pressA) / (pressB - pressA))));
      shapeR = "press";
    } else if (t < open.from + 26) {
      // перехват: кисти к боковым углам
      const k = anticipate((t - pressB) / 22);
      tipL = L(leftC);
      tipR = L(mix({ x: lb.x - 6, y: lb.y - 2 }, rightC, k));
    } else if (t < open.from + 112) {
      // раскрытие: углы разводятся в стороны
      tipL = L(mix(leftC, hullTopL, openT));
      tipR = L(mix(rightC, hullTopR, openT));
    } else if (t < rimA) {
      // формируем корпус: ладони сходят по бортам вниз
      tipL = L(mix(hullTopL, hullBotL, hullT));
      tipR = L(mix(hullTopR, hullBotR, hullT));
      shapeL = "open";
      shapeR = "open";
    } else if (t < lift.from - 4) {
      // расправить борт: палец вдоль ближней кромки
      tipL = L({ x: -98, y: 8 });
      tipR = L(mix({ x: -58, y: 34 }, { x: 60, y: 34 }, anticipate((t - rimA) / (rimB - rimA))));
      shapeL = "relax";
      shapeR = t < rimB + 6 ? "press" : "relax";
    } else if (t < touch + 6) {
      // держит лодочку за борта, поднимает и опускает на воду
      tipL = L({ x: -98, y: 12 });
      tipR = L({ x: 98, y: 12 });
      shapeL = "grip";
      shapeR = "grip";
    } else {
      // руки отпускают и возвращаются на стол
      const k = anticipate((t - touch - 6) / 34);
      const rl = restOnTable(amir, -1).target!;
      const rr = restOnTable(amir, 1).target!;
      tipL = mix(L({ x: -98, y: 12 }), { x: rl.x, y: rl.y + 20 }, k);
      tipR = mix(L({ x: 98, y: 12 }), { x: rr.x, y: rr.y + 20 }, k);
      shapeL = k > 0.9 ? "rest" : "relax";
      shapeR = shapeL;
    }
    const working = t < touch + 6;
    return {
      armL: handAt(amir, AM, -1, tipL, { shape: shapeL }),
      armR: handAt(amir, AM, 1, tipR, { shape: shapeR }),
      expr: t < l04.from - 6 ? "focused" : t < l04.to + 20 ? "joy" : t < l06.to ? "smile" : "softSmile",
      lean: working ? 12 : keys(t, [[touch + 6, 12], [touch + 40, 4]]),
      lookY: working ? lookDownTo(amir, tipR, 0.42) : keys(t, [[touch + 6, 0.5], [touch + 40, 0.3]]),
      nod: t >= l04.from && t < l04.to ? 3 : 0,
    };
  };
  // куда смотрит Амир: на руки, при «Вот!» — на Юсуфа, затем на лодочку в воде
  const amirFace = (t: number) => (t < l04.from ? turnTo(amir, work) * 0.3 : t < l04.to + 10 ? turnTo(amir, { x: yusuf.x, y: yusuf.y }) : turnTo(amir, basin) * 0.8);

  // ---------- Юсуф: наклоняется, смотрит на руки, потом на воду ----------
  const yusufPose = (t: number): PoseIn => {
    const lean = keys(t, [[0, 10], [40, 16], [l04.from, 16], [l04.from + 20, 8], [touch, 10], [touch + 30, 14]]);
    return {
      armL: LAP,
      armR: t < 30 ? LAP : restOnTable(yusuf, 1, -8),
      expr: t < l01.from ? "curious" : t < l04.from ? "curious" : t < l05.to + 10 ? "surprised" : "joy",
      lean,
      lookY: t < l04.from ? lookDownTo(yusuf, work, 0.4) : t < l04.to + 10 ? -0.1 : lookDownTo(yusuf, basin, 0.4),
      headTilt: t < l04.from ? -5 : 0,
    };
  };
  const yusufFace = (t: number) => (t < l04.from - 6 ? turnTo(yusuf, work) : t < l04.to + 10 ? turnTo(yusuf, { x: amir.x, y: amir.y - 200 }) : turnTo(yusuf, basin));

  // ---------- Билал: наблюдает ----------
  const bilalPose = (t: number): PoseIn => ({
    armL: LAP,
    armR: LAP,
    expr: t < l04.from ? "listening" : t < l06.to ? "softSmile" : "smile",
    lean: 4,
    lookY: lookDownTo(bilal, t < touch ? work : basin, 0.45) * 0.7,
  });
  const bilalFace = (t: number) => (t < touch ? turnTo(bilal, work) : turnTo(bilal, basin)) * 0.9;

  // ---------- учитель: «Давайте посмотрим на Амира» — открытая ладонь к Амиру ----------
  const teacherPose = (t: number): PoseIn => {
    const g = keys(t, [[l03.from - 6, 0], [l03.from + 10, 1], [l03.to + 12, 1], [l03.to + 36, 0]], anticipate);
    const rest = { x: teacher.x + 0.17 * teacher.h, y: teacher.y - 0.02 * teacher.h };
    const gesture = { x: 700, y: 640 };
    return {
      armL: LAP,
      armR: g < 0.02 ? LAP : { target: mix(rest, gesture, g), shape: g > 0.5 ? "open" : "rest", elbow: "down", spread: 0.6, wrist: -60 * g },
      expr: t < l04.from ? "softSmile" : "smile",
      lookY: 0.2,
      nod: t >= l03.from && t < l03.to ? 2 : 0,
    };
  };
  const teacherFace = () => 0.62;

  // ---------- предметы ----------
  const drift = f >= touch ? { dx: 8 + Math.sin((f - touch) / 38) * 6 + clamp((f - touch) / 240) * 10, dy: Math.sin((f - touch) / 27) * 1.5, rot: Math.sin((f - touch) / 33) * 2.2, visible: true } : { dx: 0, dy: 0, rot: 0, visible: false };
  const props: PropsState = {
    form: f < touch ? { x: formPos.x, y: formPos.y, fold, open: openK, hull, lift: liftV, inHands } : null,
    floating: drift,
    ripple: f >= touch ? clamp((f - touch) / 54) : 0,
    rippleAt: { x: 8, y: -4 },
    boatDry: { x: ROOM.props.boatDry.x, y: ROOM.props.boatDry.y },
    sheetDemo: null,
  };
  const cast = {
    amir: { face: amirFace, pose: amirPose },
    yusuf: { face: yusufFace, pose: yusufPose },
    bilal: { face: bilalFace, pose: bilalPose },
    teacher: { face: teacherFace, pose: teacherPose },
  };
  const focus = (t: number) => (t < touch ? work : basin);
  const world = <World f={f} cast={cast} props={props} focus={focus} groupMood={(t, seed) => (t < touch + 20 ? (["calm", "listening", "curious"] as const)[seed % 3] : (["softSmile", "smile", "calm"] as const)[seed % 3])} />;

  const A = l03.from - 8;
  const B = open.from + 20;
  const C = l04.from - 6;
  const D = touch + 16;
  const E = l06.to + 8;
  return (
    <>
      <Shot f={f} from={0} to={A} cam={camMove(f, 0, A, { x: 960, y: 690, zoom: 2.25 }, { x: 962, y: 692, zoom: 2.35 })}>
        {world}
      </Shot>
      <Shot f={f} from={A} to={B} cam={CAM_WIDE}>
        {world}
      </Shot>
      <Shot f={f} from={B} to={C} cam={camMove(f, B, C, { x: 966, y: 694, zoom: 2.3 }, { x: 966, y: 696, zoom: 2.42 })}>
        {world}
      </Shot>
      <Shot f={f} from={C} to={D} cam={camMove(f, C, D, { x: 1010, y: 650, zoom: 1.5 }, { x: 1030, y: 660, zoom: 1.56 })}>
        {world}
      </Shot>
      <Shot f={f} from={D} to={E} cam={{ x: 960, y: 650, zoom: 1.45 }}>
        {world}
      </Shot>
      <Shot f={f} from={E} to={float.to + 2} cam={camMove(f, E, float.to, { x: 1020, y: 700, zoom: 1.8 }, { x: 1040, y: 704, zoom: 1.9 })}>
        {world}
      </Shot>
    </>
  );
};
