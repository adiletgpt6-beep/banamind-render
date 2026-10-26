// Сцена 8 «Давай вместе»: Юсуф берёт новый лист из стопки. Амир показывает
// первый сгиб (совмещает края, не прижимая), затем Юсуф повторяет и
// прижимает линию; Амир помогает мягким жестом. Плавающая лодочка остаётся в
// ёмкости. Новая лодочка не готова: лист остаётся на стадии первого сгиба.
// Итоговая фраза появляется в последние секунды (Overlays).
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
const DEST: Vec = { x: 968, y: 760 }; // лист Юсуфа — рабочее место Амира (свободно после сцены 1)
const W = 150;
const D = 96;

export const Scene8: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useContext(TimelineContext);
  const F = sceneFrames(tl, "s8");
  const take = F.action("s8-take");
  const show = F.action("s8-show");
  const fold = F.action("s8-fold");
  const l44 = F.line("l44");
  const l45 = F.line("l45");
  const l46 = F.line("l46");
  const l47 = F.line("l47");
  const l48 = F.line("l48");
  const amir = CAST.amir;
  const yusuf = CAST.yusuf;
  const bilal = CAST.bilal;
  const teacher = CAST.teacher;
  const stack = ROOM.props.stack;
  const teacherHead = { x: teacher.x, y: teacher.y - teacher.h * 0.45 };

  // ---------- лист: из стопки к месту ----------
  const tReach = take.from + 6;
  const tTake = take.from + 30;
  const tMoveEnd = take.from + 66;
  const tRel = take.from + 74;
  const sheetPos = (t: number): Vec => keysV(t, [[tTake, { x: stack.x, y: stack.y - 14 }], [tMoveEnd, DEST]], anticipate);
  const sheetLift = (t: number) => keys(t, [[tTake, 0], [tTake + 10, 14], [tMoveEnd - 8, 14], [tMoveEnd, 0]], anticipate);
  // ---------- показ Амира: приподнять ближний край к дальнему и отпустить ----------
  const sA = show.from + 12;
  const sB = show.from + 72;
  const sC = show.from + 88;
  const sD = show.from + 126;
  const showFold = (t: number) => keys(t, [[sA, 0], [sB, 0.92], [sC, 0.92], [sD, 0]], anticipate);
  // ---------- первый сгиб Юсуфа: совместить края, прижать линию ----------
  const fA = fold.from + 8;
  const fB = fold.from + 78;
  const pA = fold.from + 96;
  const pB = fold.from + 150;
  const yFold = (t: number) => keys(t, [[fA, 0], [fB, 1]], anticipate);
  const foldK = (t: number) => Math.max(showFold(t), yFold(t));
  const pressed = f >= pB - 10;
  const near = (side: -1 | 1): Vec => ({ x: DEST.x + side * (W / 2 + 6), y: DEST.y + D / 2 });
  const far = (side: -1 | 1): Vec => ({ x: DEST.x + side * (W / 2), y: DEST.y - D / 2 });
  // точка ближнего угла во время сгиба (поворот по средней линии)
  const cornerAt = (side: -1 | 1, k: number): Vec => {
    const a = near(side);
    const dy = D / 2;
    const c = Math.cos(Math.PI * k);
    const lift = Math.sin(Math.PI * k) * dy * 0.55;
    return { x: a.x, y: DEST.y + dy * c - lift };
  };

  const yusufPose = (t: number): PoseIn => {
    const restR = restOnTable(yusuf, 1, -10).target!;
    let armR: PoseIn["armR"];
    let armL: PoseIn["armL"] = LAP;
    const sp = sheetPos(t);
    const sl = sheetLift(t);
    if (t < tReach) armR = restOnTable(yusuf, 1, -10);
    else if (t < tTake) armR = handAt(yusuf, YU, 1, keysV(t, [[tReach, restR], [tTake, { x: stack.x + 10, y: stack.y - 16 }]], anticipate), { shape: "relax" });
    else if (t < tRel) armR = handAt(yusuf, YU, 1, { x: sp.x + 20, y: sp.y - sl - 8 }, { shape: "pinch" });
    else if (t < fA - 14) {
      // руки спокойно у листа, смотрит на показ Амира
      armR = handAt(yusuf, YU, 1, keysV(t, [[tRel, { x: DEST.x + 20, y: DEST.y - 8 }], [tRel + 24, { x: DEST.x - 40, y: DEST.y - 54 }]], anticipate), { shape: "relax" });
      armL = LAP;
    } else if (t < fB + 6) {
      // левая держит дальний левый угол, правая поднимает ближний левый угол
      const k = yFold(t);
      armL = handAt(yusuf, YU, -1, far(-1), { shape: "pinch" });
      armR = handAt(yusuf, YU, 1, cornerAt(-1, k), { shape: "pinch" });
    } else if (t < pB + 10) {
      // прижать линию сгиба слева направо двумя пальцами
      const k = anticipate((t - pA) / (pB - pA));
      armL = handAt(yusuf, YU, -1, { x: far(-1).x + 10, y: far(-1).y + 6 }, { shape: "open", spread: 0.2 });
      armR = handAt(yusuf, YU, 1, { x: DEST.x - 64 + 120 * k, y: DEST.y - 2 }, { shape: "press" });
    } else {
      armL = handAt(yusuf, YU, -1, { x: far(-1).x + 10, y: far(-1).y + 6 }, { shape: "open", spread: 0.2 });
      armR = handAt(yusuf, YU, 1, { x: DEST.x + 50, y: DEST.y - 4 }, { shape: "open", spread: 0.2 });
    }
    const working = t >= tReach && t < tRel + 10 || t >= fA - 14;
    return {
      armL,
      armR,
      expr: t < l44.from ? "curious" : t < l45.to + 10 ? "smile" : t < fA ? "focused" : t < pB ? "focused" : "joy",
      lean: working ? 18 : 10,
      sway: t >= fA - 14 ? 24 : 0,
      lookY: working ? lookDownTo(yusuf, DEST, 0.4) * 0.9 : t >= sA - 10 && t < sD ? lookDownTo(yusuf, DEST, 0.4) * 0.8 : 0,
      nod: t >= l47.from && t < l47.to ? 2 : 0,
    };
  };
  const yusufFace = (t: number) => (t < tRel ? turnTo(yusuf, sheetPos(t)) * 0.6 : t < l44.to + 6 ? turnTo(yusuf, { x: amir.x, y: amir.y }) : t < sD ? turnTo(yusuf, DEST) * 0.4 : t < l46.to ? turnTo(yusuf, teacherHead) * 0.7 : t < l47.to + 6 ? turnTo(yusuf, { x: amir.x, y: amir.y }) : turnTo(yusuf, DEST) * 0.4);

  const amirPose = (t: number): PoseIn => {
    const restR = restOnTable(amir, 1).target!;
    const restL = restOnTable(amir, -1).target!;
    let armR: PoseIn["armR"] = restOnTable(amir, 1);
    let armL: PoseIn["armL"] = restOnTable(amir, -1);
    if (t >= l45.from - 6 && t < sA - 12) {
      // «Держи лист» — левая придерживает дальний правый угол
      const k = anticipate((t - (l45.from - 6)) / 18);
      armL = handAt(amir, AM, -1, { x: restL.x + (far(1).x - restL.x) * k, y: restL.y + (far(1).y - restL.y) * k }, { shape: k > 0.8 ? "pinch" : "relax" });
    } else if (t >= sA - 12 && t < sD + 10) {
      // показ: правая ведёт ближний правый угол к дальнему и обратно
      const k = showFold(t);
      armL = handAt(amir, AM, -1, far(1), { shape: "pinch" });
      armR = handAt(amir, AM, 1, t < sA ? keysV(t, [[sA - 12, restR], [sA, near(1)]], anticipate) : cornerAt(1, k), { shape: "pinch" });
    } else if (t >= sD + 10 && t < fA - 14) {
      armL = handAt(amir, AM, -1, far(1), { shape: "pinch" });
      armR = handAt(amir, AM, 1, keysV(t, [[sD + 10, near(1)], [sD + 30, { x: far(1).x + 36, y: far(1).y + 10 }]], anticipate), { shape: "relax" });
    } else if (t >= fA - 14) {
      // вместе: правая поднимает ближний правый угол синхронно с Юсуфом, затем мягко придерживает
      const k = yFold(t);
      armL = handAt(amir, AM, -1, far(1), { shape: "pinch" });
      armR = t < fB + 6 ? handAt(amir, AM, 1, cornerAt(1, k), { shape: "pinch" }) : handAt(amir, AM, 1, { x: far(1).x + 8, y: far(1).y + 8 }, { shape: "open", spread: 0.2 });
    }
    const working = t >= l45.from - 6;
    return {
      armL,
      armR,
      expr: t < l44.to + 6 ? "softSmile" : t < l45.to + 10 ? "smile" : t < pB ? "focused" : "joy",
      lean: working ? 14 : 4,
      lookY: working ? lookDownTo(amir, DEST, 0.42) * 0.9 : 0,
      nod: t >= l48.from && t < l48.to ? 3 : 0,
    };
  };
  const amirFace = (t: number) => (t < l44.from ? turnTo(amir, sheetPos(t)) * 0.5 : t < l45.to + 6 ? turnTo(amir, { x: yusuf.x, y: yusuf.y }) : t < sD + 10 ? turnTo(amir, DEST) * 0.5 : t < l46.to ? turnTo(amir, teacherHead) * 0.7 : t < l48.from ? turnTo(amir, { x: yusuf.x, y: yusuf.y }) : turnTo(amir, DEST) * 0.5);

  const teacherPose = (t: number): PoseIn => {
    const g = keys(t, [[l46.from - 4, 0], [l46.from + 16, 1], [l46.to, 1], [l46.to + 24, 0]], anticipate);
    const knee = { x: teacher.x + 0.17 * teacher.h, y: teacher.y - 0.02 * teacher.h };
    const openHand = { x: teacher.x + 150, y: teacher.y - 230 };
    return {
      armL: LAP,
      armR: g < 0.02 ? LAP : { target: { x: knee.x + (openHand.x - knee.x) * g, y: knee.y + (openHand.y - knee.y) * g }, shape: "open", elbow: "down", spread: 0.5, wrist: -75 * g },
      expr: "softSmile",
      nod: t >= l46.from && t < l46.from + 12 ? 3 : 0,
      lookY: t < l46.from ? 0.35 : 0.1,
    };
  };
  const teacherFace = (t: number) => (t < l46.from ? turnTo(teacher, DEST) * 0.8 : t < l46.to ? 0.6 : turnTo(teacher, DEST) * 0.8);
  const bilalPose = (): PoseIn => ({ armL: LAP, armR: LAP, expr: "softSmile", lean: 6, lookY: 0.3 });
  const bilalFace = (t: number) => (t < l46.from ? turnTo(bilal, DEST) : t < l46.to ? turnTo(bilal, teacherHead) : turnTo(bilal, DEST));

  const sp = sheetPos(f);
  const sheetFinal = f < tTake ? null : f < tRel ? { x: sp.x, y: sp.y, lift: sheetLift(f), inHands: true, rot: -2 } : { x: DEST.x, y: DEST.y, fold: foldK(f), pressed };
  const props: PropsState = {
    floating: floatingAt(f + F.start),
    boatDry: { x: ROOM.props.boatDry.x, y: ROOM.props.boatDry.y },
    sheetDemo: { x: ROOM.props.sheetDemo.x, y: ROOM.props.sheetDemo.y },
    sheetFinal,
    stackCount: f < tTake ? 6 : 5,
  };
  const cast = { amir: { face: amirFace, pose: amirPose }, yusuf: { face: yusufFace, pose: yusufPose }, bilal: { face: bilalFace, pose: bilalPose }, teacher: { face: teacherFace, pose: teacherPose } };
  const focus = (t: number) => (t < l46.from ? DEST : t < l46.to ? teacherHead : DEST);
  const world = <World f={f} cast={cast} props={props} focus={focus} groupMood={(t, seed) => (t >= pB ? (["smile", "softSmile", "joy"] as const)[seed % 3] : (["calm", "listening", "softSmile"] as const)[seed % 3])} />;
  const A = l44.from - 4;
  const B = show.from - 2;
  const C = l46.from - 4;
  const Cm = l46.mid;
  const E = l47.from - 4;
  const G = l48.to + 4;
  return (
    <>
      <Shot f={f} from={0} to={A} cam={camMove(f, 0, A, { x: 790, y: 720, zoom: 1.9 }, { x: 800, y: 722, zoom: 1.95 })}>
        {world}
      </Shot>
      <Shot f={f} from={A} to={B} cam={{ x: 880, y: 650, zoom: 1.65 }}>
        {world}
      </Shot>
      <Shot f={f} from={B} to={C} cam={camMove(f, B, C, { x: 860, y: 730, zoom: 2.2 }, { x: 862, y: 732, zoom: 2.3 })}>
        {world}
      </Shot>
      <Shot f={f} from={C} to={Cm} cam={{ x: 640, y: 620, zoom: 1.55 }}>
        {world}
      </Shot>
      <Shot f={f} from={Cm} to={E} cam={{ x: 880, y: 650, zoom: 1.6 }}>
        {world}
      </Shot>
      <Shot f={f} from={E} to={G} cam={{ x: 880, y: 650, zoom: 1.7 }}>
        {world}
      </Shot>
      <Shot f={f} from={G} to={F.len + 2} cam={camMove(f, G, F.len, { x: 870, y: 730, zoom: 1.9 }, { x: 868, y: 734, zoom: 2.0 })}>
        {world}
      </Shot>
    </>
  );
};
