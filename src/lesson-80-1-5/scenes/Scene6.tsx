// Сцена 6 «Это твоя работа»: Амир приподнимает сухую лодочку и спрашивает;
// учитель признаёт труд прямо. Пекарь и плотник — короткие рисунки на
// доске. Юсуф хвалит лодочку; перед следующей сценой образец видимым
// движением возвращается на стол.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { TimelineContext } from "../context";
import type { PoseIn } from "../rig/Actor";
import { anticipate, clamp, keys, keysV, type Vec } from "../rig/motion";
import { ExamplesBoard } from "../set/Board";
import { ROOM } from "../set/Room";
import { camMove, Shot } from "../shots";
import { BoardInsert } from "./BoardInsert";
import { CAST, handAt, LAP, lookDownTo, restOnTable, sceneFrames, turnTo } from "./common";
import { floatingAt, World, type PropsState } from "./World";

const AM = "p02";
const S = 0.78;

export const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useContext(TimelineContext);
  const F = sceneFrames(tl, "s6");
  const lift = F.action("s6-lift");
  const ret = F.action("s6-return");
  const l32 = F.line("l32");
  const l33 = F.line("l33");
  const l34 = F.line("l34");
  const l35 = F.line("l35");
  const l36 = F.line("l36");
  const l37 = F.line("l37");
  const amir = CAST.amir;
  const yusuf = CAST.yusuf;
  const bilal = CAST.bilal;
  const teacher = CAST.teacher;
  const dry = ROOM.props.boatDry;
  const teacherHead = { x: teacher.x, y: teacher.y - teacher.h * 0.45 };

  // ---------- сухой образец в руках Амира ----------
  const tReach = lift.from + 6;
  const tGrip = lift.from + 30;
  const tUp = lift.from + 56;
  const tDownA = ret.from + 10;
  const tDownB = ret.from + 52;
  const tRest = ret.to;
  const liftK = (t: number) => keys(t, [[tGrip, 0], [tUp, 44], [tDownA, 44], [tDownB, 0]], anticipate);
  const posK = (t: number): Vec => keysV(t, [[tGrip, dry], [tUp, { x: dry.x + 30, y: dry.y - 6 }], [tDownA, { x: dry.x + 30, y: dry.y - 6 }], [tDownB, dry]], anticipate);
  const rotK = (t: number) => keys(t, [[tUp, 0], [tUp + 40, -8], [l32.to, -8], [l32.to + 30, 4], [tDownA, 0]]);
  const lf = liftK(f);
  const pos = posK(f);
  const inHands = f >= tGrip - 2 && f < tDownB + 2;

  const amirPose = (t: number): PoseIn => {
    const l = liftK(t);
    const p = posK(t);
    const holding = t >= tGrip - 2 && t < tDownB + 2;
    const tipR: Vec = { x: p.x + 90 * S, y: p.y - l + 8 };
    const tipL: Vec = { x: p.x - 90 * S, y: p.y - l + 8 };
    const restR = restOnTable(amir, 1).target!;
    const restL = restOnTable(amir, -1).target!;
    let armR: PoseIn["armR"];
    let armL: PoseIn["armL"];
    if (t < tReach) {
      armR = restOnTable(amir, 1);
      armL = restOnTable(amir, -1);
    } else if (t < tGrip) {
      const k = anticipate((t - tReach) / (tGrip - tReach));
      armR = handAt(amir, AM, 1, { x: restR.x + (tipR.x - restR.x) * k, y: restR.y + (tipR.y - restR.y) * k }, { shape: "relax" });
      armL = handAt(amir, AM, -1, { x: restL.x + (tipL.x - restL.x) * k, y: restL.y + (tipL.y - restL.y) * k }, { shape: "relax" });
    } else if (holding) {
      armR = handAt(amir, AM, 1, tipR, { shape: "grip" });
      armL = handAt(amir, AM, -1, tipL, { shape: "grip" });
    } else if (t < tRest) {
      const k = anticipate((t - tDownB) / Math.max(1, tRest - tDownB));
      armR = handAt(amir, AM, 1, { x: tipR.x + (restR.x - tipR.x) * k, y: tipR.y + (restR.y - tipR.y) * k }, { shape: "relax" });
      armL = handAt(amir, AM, -1, { x: tipL.x + (restL.x - tipL.x) * k, y: tipL.y + (restL.y - tipL.y) * k }, { shape: "relax" });
    } else {
      armR = restOnTable(amir, 1);
      armL = restOnTable(amir, -1);
    }
    return {
      armL,
      armR,
      expr: t < l32.from ? "calm" : t < l32.to ? "curious" : t < l33.to + 10 ? "softSmile" : t < l36.from ? "listening" : "joy",
      lean: holding ? 10 : 4,
      lookY: holding && t < l32.from ? lookDownTo(amir, { x: p.x, y: p.y - l }, 0.42) * 0.6 : 0.05,
      nod: t >= l37.from && t < l37.to ? 3 : 0,
    };
  };
  const amirFace = (t: number) => (t < tUp ? turnTo(amir, dry) * 0.4 : t < l33.to + 6 ? turnTo(amir, teacherHead) * 0.9 : t < l34.to + 6 ? turnTo(amir, { x: bilal.x, y: bilal.y }) : t < l36.from - 4 ? turnTo(amir, teacherHead) * 0.9 : turnTo(amir, { x: yusuf.x, y: yusuf.y }));

  const teacherPose = (t: number): PoseIn => {
    const g = Math.max(
      keys(t, [[l33.from - 4, 0], [l33.from + 14, 1], [l33.to, 1], [l33.to + 24, 0]], anticipate),
      keys(t, [[l35.from - 4, 0], [l35.from + 14, 1], [l35.to, 1], [l35.to + 24, 0]], anticipate),
    );
    const knee = { x: teacher.x + 0.17 * teacher.h, y: teacher.y - 0.02 * teacher.h };
    const openHand = { x: teacher.x + 150, y: teacher.y - 230 };
    return {
      armL: LAP,
      armR: g < 0.02 ? LAP : { target: { x: knee.x + (openHand.x - knee.x) * g, y: knee.y + (openHand.y - knee.y) * g }, shape: "open", elbow: "down", spread: 0.5, wrist: -75 * g },
      expr: t < l33.from ? "listening" : "softSmile",
      nod: t >= l33.from && t < l33.from + 12 ? 4 : t >= l35.from && t < l35.from + 10 ? 3 : 0,
      lookY: 0.1,
    };
  };
  const teacherFace = (t: number) => (t < l34.from ? turnTo(teacher, { x: amir.x, y: amir.y - 100 }) * 0.9 : t < l35.from ? turnTo(teacher, { x: bilal.x, y: bilal.y - 100 }) * 0.9 : t < l35.mid ? turnTo(teacher, { x: bilal.x, y: bilal.y - 100 }) * 0.9 : t < l36.from ? 0.7 : turnTo(teacher, { x: amir.x, y: amir.y - 100 }) * 0.9);

  const yusufPose = (t: number): PoseIn => ({
    armL: LAP,
    armR: restOnTable(yusuf, 1, -10),
    expr: t < l36.from - 6 ? "listening" : "joy",
    lean: t >= l36.from - 6 && t < l36.to + 10 ? 14 : 6,
    nod: t >= l36.from && t < l36.to ? 2 : 0,
  });
  const yusufFace = (t: number) => (t < l33.from ? turnTo(yusuf, { x: amir.x, y: amir.y }) : t < l34.from ? turnTo(yusuf, teacherHead) : t < l35.from ? turnTo(yusuf, { x: bilal.x, y: bilal.y }) : t < l36.from - 6 ? turnTo(yusuf, teacherHead) : turnTo(yusuf, { x: amir.x, y: amir.y }));
  const bilalPose = (t: number): PoseIn => ({ armL: LAP, armR: LAP, expr: t >= l34.from - 6 && t < l34.to + 6 ? "curious" : t < l37.to ? "listening" : "smile", lean: 4, nod: t >= l34.from && t < l34.from + 8 ? 2 : 0 });
  const bilalFace = (t: number) => (t < l33.from ? turnTo(bilal, { x: amir.x, y: amir.y }) : t < l36.from ? turnTo(bilal, teacherHead) : turnTo(bilal, { x: amir.x, y: amir.y }));

  // ---------- доска: пекарь и плотник ----------
  const baker = clamp((f - (l34.from + 6)) / 40);
  const carpenter = clamp((f - (l35.from + Math.round((l35.to - l35.from) * 0.12))) / 44);
  const boardEl = <ExamplesBoard baker={baker} carpenter={carpenter} />;
  const insertA = l34.from + 4;
  const insertB = l35.from + Math.round((l35.to - l35.from) * 0.5);

  const props: PropsState = {
    floating: floatingAt(f + F.start),
    boatDry: { x: pos.x, y: pos.y, lift: lf, rot: rotK(f), inHands, creases: false },
    sheetDemo: { x: ROOM.props.sheetDemo.x, y: ROOM.props.sheetDemo.y },
  };
  const cast = { amir: { face: amirFace, pose: amirPose }, yusuf: { face: yusufFace, pose: yusufPose }, bilal: { face: bilalFace, pose: bilalPose }, teacher: { face: teacherFace, pose: teacherPose } };
  const focus = (t: number) => (t < l33.from ? amir : t < l34.from ? teacherHead : t < l35.from ? bilal : t < l36.from ? teacherHead : t < l37.from ? yusuf : amir);
  const world = <World f={f} cast={cast} props={props} focus={focus} board={boardEl} />;
  const A = l33.from - 4;
  const B = insertA;
  const C = insertB;
  const D = l36.from - 4;
  const E = l37.from - 4;
  const G = ret.from + 4;
  return (
    <>
      <Shot f={f} from={0} to={A} cam={camMove(f, 0, A, { x: 930, y: 680, zoom: 1.7 }, { x: 930, y: 676, zoom: 1.76 })}>
        {world}
      </Shot>
      <Shot f={f} from={A} to={B} cam={{ x: 640, y: 620, zoom: 1.55 }}>
        {world}
      </Shot>
      <Shot f={f} from={B} to={C} cam={{ x: 960, y: 540, zoom: 1 }} overlay={<BoardInsert a={Math.min(1, (f - B) / 8, (C - f) / 8)}>{boardEl}</BoardInsert>}>
        {null}
      </Shot>
      <Shot f={f} from={C} to={D} cam={{ x: 700, y: 600, zoom: 1.35 }}>
        {world}
      </Shot>
      <Shot f={f} from={D} to={E} cam={{ x: 830, y: 640, zoom: 1.75 }}>
        {world}
      </Shot>
      <Shot f={f} from={E} to={G} cam={{ x: 930, y: 680, zoom: 1.7 }}>
        {world}
      </Shot>
      <Shot f={f} from={G} to={F.len + 2} cam={camMove(f, G, F.len, { x: 880, y: 720, zoom: 2.1 }, { x: 876, y: 722, zoom: 2.2 })}>
        {world}
      </Shot>
    </>
  );
};
