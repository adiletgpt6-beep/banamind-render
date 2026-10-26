// Сцена 2 «А лодочку сделал Амир!»: Юсуф улыбается лодочке, задумывается,
// поворачивается к учителю; вопрос из любопытства. Амир берёт сухой
// образец и показывает складки; плавающая лодочка остаётся в воде. Билал
// переводит взгляд на стопку бумаги. Учитель слушает и отвечает спокойно.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { TimelineContext } from "../context";
import type { PoseIn } from "../rig/Actor";
import { anticipate, keys, keysV, type Vec } from "../rig/motion";
import { ROOM } from "../set/Room";
import { camMove, Shot } from "../shots";
import { CAST, handAt, LAP, lookDownTo, restOnTable, sceneFrames, turnTo } from "./common";
import { floatingAt, World, type PropsState } from "./World";

const AM = "p02";
const YU = "p01";

export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useContext(TimelineContext);
  const F = sceneFrames(tl, "s2");
  const turn = F.action("s2-turn");
  const sample = F.action("s2-sample");
  const l07 = F.line("l07");
  const l08 = F.line("l08");
  const l09 = F.line("l09");
  const l10 = F.line("l10");
  const l11 = F.line("l11");
  const l12 = F.line("l12");
  const amir = CAST.amir;
  const yusuf = CAST.yusuf;
  const bilal = CAST.bilal;
  const teacher = CAST.teacher;
  const basin = ROOM.props.basin;
  const dry = ROOM.props.boatDry;
  const teacherHead = { x: teacher.x, y: teacher.y - teacher.h * 0.45 };

  // ---------- сухой образец: подъём, показ, возврат ----------
  const liftUp = sample.from + 14;
  const liftDone = sample.from + 40;
  const putA = l10.to + 12;
  const putB = l10.to + 44;
  const lift = keys(f, [[liftUp, 0], [liftDone, 30], [putA, 30], [putB, 0]], anticipate);
  const rot = keys(f, [[liftDone, 0], [liftDone + 30, -10], [liftDone + 70, 8], [putA, 0]]);
  const dryX = keys(f, [[liftUp, dry.x], [liftDone, dry.x + 24], [putA, dry.x + 24], [putB, dry.x]], anticipate);
  const inHands = f >= liftUp - 2 && f < putB + 2;
  const boatPos: Vec = { x: dryX, y: dry.y };
  const S = 0.78;

  const amirPose = (t: number): PoseIn => {
    const liftT = keys(t, [[liftUp, 0], [liftDone, 30], [putA, 30], [putB, 0]], anticipate);
    const bx = keys(t, [[liftUp, dry.x], [liftDone, dry.x + 24], [putA, dry.x + 24], [putB, dry.x]], anticipate);
    const holding = t >= sample.from + 2 && t < putB + 10;
    // правая кисть держит лодочку за правый борт
    const gripTip: Vec = { x: bx + 90 * S, y: dry.y - liftT + 8 };
    const reach = keysV(t, [[sample.from, restOnTable(amir, 1).target!], [sample.from + 12, gripTip]], anticipate);
    const armR = holding ? handAt(amir, AM, 1, t < sample.from + 12 ? reach : gripTip, { shape: t < sample.from + 10 ? "relax" : "grip" }) : t < putB + 36 ? handAt(amir, AM, 1, keysV(t, [[putB + 10, gripTip], [putB + 36, restOnTable(amir, 1).target!]], anticipate), { shape: "relax" }) : { ...restOnTable(amir, 1) };
    // левая: указывает на складки во второй половине реплики
    const pointA = l10.from + Math.round((l10.to - l10.from) * 0.45);
    const pointB = l10.to + 6;
    const creaseTip = (k: number): Vec => ({ x: bx - 30 * S + k * 70 * S, y: dry.y - liftT + 2 * S + k * 20 });
    const armL: PoseIn["armL"] = t >= pointA - 10 && t < pointB
      ? handAt(amir, AM, -1, creaseTip(anticipate((t - pointA) / (pointB - pointA))), { shape: "point" })
      : LAP;
    return {
      armL,
      armR,
      expr: t < l09.from ? "softSmile" : t < l10.to + 10 ? "smile" : "calm",
      lean: holding ? 10 : 4,
      lookY: holding ? lookDownTo(amir, gripTip, 0.42) * 0.8 : 0.1,
      nod: t >= l10.from && t < l10.from + 10 ? 3 : 0,
    };
  };
  const amirFace = (t: number) => (t < l09.from ? turnTo(amir, basin) * 0.6 : t < sample.from ? turnTo(amir, { x: yusuf.x, y: yusuf.y }) : t < putB ? turnTo(amir, boatPos) * 0.5 : t < l12.from ? turnTo(amir, { x: bilal.x, y: bilal.y }) : turnTo(amir, teacherHead));

  // ---------- Юсуф ----------
  const yusufPose = (t: number): PoseIn => {
    // жест к Амиру на реплике 09
    const g = keys(t, [[l09.from - 4, 0], [l09.from + 10, 1], [l09.to + 4, 1], [l09.to + 26, 0]], anticipate);
    const gestureTip: Vec = { x: 900, y: 706 };
    const restTip = restOnTable(yusuf, 1, -10).target!;
    const armR = g > 0.02 ? handAt(yusuf, YU, 1, { x: restTip.x + (gestureTip.x - restTip.x) * g, y: restTip.y + (gestureTip.y - restTip.y) * g }, { shape: "open", spread: 0.5 }) : restOnTable(yusuf, 1, -10);
    const thinking = t >= turn.from + 46 && t < l07.to;
    return {
      armL: LAP,
      armR,
      expr: t < turn.from + 40 ? "joy" : thinking ? "thinking" : t < l09.from ? "curious" : t < l10.to ? "smile" : "listening",
      lean: t < turn.from + 40 ? 12 : 6,
      lookY: t < turn.from + 40 ? lookDownTo(yusuf, basin, 0.4) : thinking ? -0.2 : 0,
      headTilt: thinking ? 6 : 0,
    };
  };
  const yusufFace = (t: number) => (t < turn.from + 44 ? turnTo(yusuf, basin) : t < turn.from + 70 ? 0.2 : t < l09.from - 4 ? turnTo(yusuf, teacherHead) : t < l10.to + 10 ? turnTo(yusuf, { x: amir.x, y: amir.y }) : t < l12.from ? turnTo(yusuf, { x: bilal.x, y: bilal.y }) : turnTo(yusuf, teacherHead));

  // ---------- Билал: следит, на реплике 11 смотрит на Амира, затем на стопку ----------
  const bilalPose = (t: number): PoseIn => ({
    armL: LAP,
    armR: LAP,
    expr: t < l11.from ? "listening" : t < l11.to ? "thinking" : "calm",
    lean: 4,
    lookY: t >= l11.mid && t < l11.to + 10 ? lookDownTo(bilal, ROOM.props.stack, 0.45) * 0.8 : 0,
  });
  const bilalFace = (t: number) => (t < l10.to ? turnTo(bilal, { x: amir.x, y: amir.y }) : t < l11.mid ? turnTo(bilal, { x: amir.x, y: amir.y }) : t < l11.to + 10 ? -1 : turnTo(bilal, teacherHead));

  // ---------- учитель: слушает Юсуфа, отвечает ----------
  const teacherPose = (t: number): PoseIn => {
    const g = keys(t, [[l08.from - 4, 0], [l08.from + 12, 1], [l08.to, 1], [l08.to + 24, 0]], anticipate);
    const g2 = keys(t, [[l12.from - 4, 0], [l12.from + 10, 1], [l12.to, 1], [l12.to + 20, 0]], anticipate);
    const k = Math.max(g, g2);
    const rest = { x: teacher.x + 0.17 * teacher.h, y: teacher.y - 0.02 * teacher.h };
    const gesture = { x: 690, y: 600 };
    return {
      armL: LAP,
      armR: k < 0.02 ? LAP : { target: { x: rest.x + (gesture.x - rest.x) * k, y: rest.y + (gesture.y - rest.y) * k }, shape: "open", elbow: "down", spread: 0.5, wrist: -70 * k },
      expr: t < l07.from ? "softSmile" : t < l08.from ? "listening" : "calm",
      nod: t >= l08.from && t < l08.from + 12 ? 3 : t >= l12.from && t < l12.from + 10 ? 3 : 0,
      lookY: 0.15,
    };
  };
  const teacherFace = (t: number) => (t < l10.from ? turnTo(teacher, { x: yusuf.x, y: yusuf.y - 100 }) * 0.9 : t < l11.from ? turnTo(teacher, { x: amir.x, y: amir.y - 100 }) * 0.9 : t < l12.from ? 0.85 : 0.6);

  const props: PropsState = {
    floating: floatingAt(f + F.start),
    boatDry: { x: boatPos.x, y: boatPos.y, lift, rot, inHands, creases: lift > 10 },
    sheetDemo: null,
  };
  const cast = { amir: { face: amirFace, pose: amirPose }, yusuf: { face: yusufFace, pose: yusufPose }, bilal: { face: bilalFace, pose: bilalPose }, teacher: { face: teacherFace, pose: teacherPose } };
  const focus = (t: number) => (t < turn.from + 44 ? basin : t < l09.from ? yusuf : t < putB ? boatPos : t < l12.from ? bilal : teacherHead);
  const world = <World f={f} cast={cast} props={props} focus={focus} />;
  const A = l07.from - 6;
  const B = l08.to + 6;
  const C = l09.to + 8;
  const D = putB + 4;
  const E = l12.from - 6;
  return (
    <>
      <Shot f={f} from={0} to={A} cam={camMove(f, 0, A, { x: 930, y: 660, zoom: 1.7 }, { x: 900, y: 650, zoom: 1.75 })}>
        {world}
      </Shot>
      <Shot f={f} from={A} to={B} cam={{ x: 690, y: 620, zoom: 1.42 }}>
        {world}
      </Shot>
      <Shot f={f} from={B} to={C} cam={{ x: 830, y: 640, zoom: 1.75 }}>
        {world}
      </Shot>
      <Shot f={f} from={C} to={D} cam={camMove(f, C, D, { x: 910, y: 680, zoom: 1.7 }, { x: 905, y: 684, zoom: 1.78 })}>
        {world}
      </Shot>
      <Shot f={f} from={D} to={E} cam={{ x: 1090, y: 640, zoom: 1.6 }}>
        {world}
      </Shot>
      <Shot f={f} from={E} to={F.len + 2} cam={{ x: 640, y: 620, zoom: 1.55 }}>
        {world}
      </Shot>
    </>
  );
};
