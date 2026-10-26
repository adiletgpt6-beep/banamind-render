// Сцена 4 «Откуда взялась бумага?»: Юсуф приподнимает край чистого листа
// и рассматривает его. Учитель объясняет; на доске по порядку появляются
// рисунки: дерево → древесина → масса из волокон → лист. Амир удивляется
// («Из дерева?»), Билал подводит итог.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { TimelineContext } from "../context";
import type { PoseIn } from "../rig/Actor";
import { anticipate, clamp, keys, type Vec } from "../rig/motion";
import { PaperOriginBoard } from "../set/Board";
import { ROOM } from "../set/Room";
import { Shot } from "../shots";
import { BoardInsert } from "./BoardInsert";
import { CAST, handAt, LAP, lookDownTo, restOnTable, sceneFrames, turnTo } from "./common";
import { floatingAt, World, type PropsState } from "./World";

const YU = "p01";

export const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useContext(TimelineContext);
  const F = sceneFrames(tl, "s4");
  const edge = F.action("s4-edge");
  const board = F.action("s4-board");
  const l19 = F.line("l19");
  const l20 = F.line("l20");
  const l21 = F.line("l21");
  const l22 = F.line("l22");
  const l23 = F.line("l23");
  const l24 = F.line("l24");
  const amir = CAST.amir;
  const yusuf = CAST.yusuf;
  const bilal = CAST.bilal;
  const teacher = CAST.teacher;
  const dry = ROOM.props.boatDry;
  const sheet = ROOM.props.sheetDemo;
  const teacherHead = { x: teacher.x, y: teacher.y - teacher.h * 0.45 };
  const boardPt = { x: ROOM.board.x + ROOM.board.w / 2, y: ROOM.board.y + ROOM.board.h / 2 };

  // ---------- лист: Юсуф приподнимает дальний край ----------
  const tReach = edge.from + 8;
  const tHold = edge.from + 40;
  const tLift = edge.from + 62;
  const tDown = l19.to + 16;
  const tRel = l19.to + 40;
  const lift = keys(f, [[tHold, 0], [tLift, 14], [tDown, 14], [tRel, 0]], anticipate);
  const rot = keys(f, [[tHold, 0], [tLift, -5], [tDown, -5], [tRel, 0]], anticipate);
  const farL: Vec = { x: sheet.x - 72, y: sheet.y - 46 };
  const farR: Vec = { x: sheet.x + 72, y: sheet.y - 46 };

  const yusufPose = (t: number): PoseIn => {
    const lf = keys(t, [[tHold, 0], [tLift, 14], [tDown, 14], [tRel, 0]], anticipate);
    const holding = t >= tReach && t < tRel + 10;
    const restR = restOnTable(yusuf, 1, -10).target!;
    const armR = holding
      ? handAt(yusuf, YU, 1, t < tHold ? { x: restR.x + (farR.x - restR.x) * anticipate((t - tReach) / (tHold - tReach)), y: restR.y + (farR.y - restR.y) * anticipate((t - tReach) / (tHold - tReach)) } : { x: farR.x, y: farR.y - lf }, { shape: t < tHold - 6 ? "relax" : "pinch" })
      : t < tRel + 36
        ? handAt(yusuf, YU, 1, { x: farR.x + (restR.x - farR.x) * anticipate((t - tRel - 10) / 26), y: farR.y + (restR.y - farR.y) * anticipate((t - tRel - 10) / 26) }, { shape: "relax" })
        : restOnTable(yusuf, 1, -10);
    const armL = holding && t >= tReach + 8 ? handAt(yusuf, YU, -1, { x: farL.x, y: farL.y - lf }, { shape: "pinch" }) : LAP;
    return {
      armL,
      armR,
      expr: t < l19.from ? "curious" : t < l19.to + 10 ? "curious" : t < l21.from ? "listening" : "listening",
      lean: holding ? 16 : 6,
      lookY: holding ? lookDownTo(yusuf, { x: sheet.x, y: sheet.y - lf }, 0.4) : 0,
      headTilt: holding ? -6 : 0,
    };
  };
  const yusufFace = (t: number) => (t < tRel ? turnTo(yusuf, sheet) * 0.5 : t < l21.from ? turnTo(yusuf, teacherHead) : t < l21.to + 6 ? turnTo(yusuf, { x: amir.x, y: amir.y }) : t < l23.from ? turnTo(yusuf, teacherHead) : t < l23.to + 6 ? turnTo(yusuf, { x: bilal.x, y: bilal.y }) : turnTo(yusuf, teacherHead));

  // ---------- учитель: объясняет, рукой показывает к доске ----------
  const teacherPose = (t: number): PoseIn => {
    const g = Math.max(
      keys(t, [[l20.from - 4, 0], [l20.from + 14, 1], [l20.to, 1], [l20.to + 24, 0]], anticipate),
      keys(t, [[l22.from - 4, 0], [l22.from + 14, 1], [l22.to, 1], [l22.to + 24, 0]], anticipate),
    );
    const knee = { x: teacher.x - 0.17 * teacher.h, y: teacher.y - 0.02 * teacher.h };
    const toBoard = { x: teacher.x - 150, y: teacher.y - 300 };
    return {
      armL: g < 0.02 ? LAP : { target: { x: knee.x + (toBoard.x - knee.x) * g, y: knee.y + (toBoard.y - knee.y) * g }, shape: "open", elbow: "out", spread: 0.4, wrist: 80 * g },
      armR: LAP,
      expr: t < l20.from ? "listening" : "calm",
      nod: (t >= l20.from && t < l20.from + 10) || (t >= l24.from && t < l24.to) ? 3 : 0,
      lookY: 0.1,
    };
  };
  const teacherFace = (t: number) => (t < l20.from ? turnTo(teacher, { x: yusuf.x, y: yusuf.y - 100 }) : t < l20.mid ? 0.7 : t < l21.from ? turnTo(teacher, boardPt) * 0.6 : t < l22.from ? turnTo(teacher, { x: amir.x, y: amir.y - 100 }) * 0.9 : t < l22.to ? turnTo(teacher, boardPt) * 0.5 : t < l24.from ? turnTo(teacher, { x: bilal.x, y: bilal.y - 100 }) * 0.9 : turnTo(teacher, { x: bilal.x, y: bilal.y - 100 }) * 0.9);

  const amirPose = (t: number): PoseIn => ({
    armL: restOnTable(amir, -1),
    armR: restOnTable(amir, 1),
    expr: t >= l21.from - 8 && t < l21.to + 10 ? "surprised" : t < l24.to ? "listening" : "softSmile",
    lean: t >= l21.from - 8 && t < l21.to + 10 ? 10 : 4,
    nod: 0,
  });
  const amirFace = (t: number) => (t < l19.to ? turnTo(amir, sheet) * 0.6 : t < l21.to + 6 ? turnTo(amir, teacherHead) * 0.9 : t < l23.from ? turnTo(amir, teacherHead) * 0.9 : t < l23.to + 6 ? turnTo(amir, { x: bilal.x, y: bilal.y }) : turnTo(amir, teacherHead) * 0.9);
  const bilalPose = (t: number): PoseIn => ({ armL: LAP, armR: LAP, expr: t < l23.from ? "listening" : t < l23.to ? "thinking" : "softSmile", lean: 4, nod: t >= l23.from && t < l23.from + 8 ? 3 : 0 });
  const bilalFace = (t: number) => (t < l19.to ? turnTo(bilal, sheet) * 0.8 : t < l23.from ? turnTo(bilal, teacherHead) : t < l23.mid ? turnTo(bilal, teacherHead) : t < l23.to ? turnTo(bilal, { x: ROOM.window.x + 100, y: 200 }) * 0.5 : turnTo(bilal, teacherHead));

  // ---------- доска: стадии по порядку объяснения ----------
  const stageAt = (from: number, len: number) => clamp((f - from) / len);
  const stages: [number, number, number, number] = [
    stageAt(l20.from + Math.round((l20.to - l20.from) * 0.5), 40),
    stageAt(l20.to - 4, 44),
    stageAt(l22.from + 12, 46),
    stageAt(l22.from + Math.round((l22.to - l22.from) * 0.62), 50),
  ];
  const boardEl = <PaperOriginBoard stages={stages} />;
  const insertA = l20.from + Math.round((l20.to - l20.from) * 0.38);
  const insertB = l21.from - 6;
  const insertC = l22.from - 2;
  const insertD = board.to - 4;
  const props: PropsState = {
    floating: floatingAt(f + F.start),
    boatDry: { x: dry.x, y: dry.y },
    sheetDemo: { x: sheet.x, y: sheet.y, lift, rot, inHands: lift > 0.5 },
  };
  const cast = { amir: { face: amirFace, pose: amirPose }, yusuf: { face: yusufFace, pose: yusufPose }, bilal: { face: bilalFace, pose: bilalPose }, teacher: { face: teacherFace, pose: teacherPose } };
  const focus = (t: number) => (t < tRel ? sheet : t < l21.from ? teacherHead : t < l21.to + 6 ? amir : t < l23.from ? teacherHead : t < l23.to + 6 ? bilal : teacherHead);
  const world = <World f={f} cast={cast} props={props} focus={focus} board={boardEl} />;
  const insert = (from: number, to: number) => (
    <Shot f={f} from={from} to={to} cam={{ x: 960, y: 540, zoom: 1 }} overlay={<BoardInsert a={Math.min(1, (f - from) / 8, (to - f) / 8)}>{boardEl}</BoardInsert>}>
      {null}
    </Shot>
  );
  return (
    <>
      <Shot f={f} from={0} to={l19.to + 10} cam={{ x: 800, y: 700, zoom: 2.0 }}>
        {world}
      </Shot>
      <Shot f={f} from={l19.to + 10} to={insertA} cam={{ x: 640, y: 620, zoom: 1.5 }}>
        {world}
      </Shot>
      {insert(insertA, insertB)}
      <Shot f={f} from={insertB} to={insertC} cam={{ x: 960, y: 650, zoom: 1.65 }}>
        {world}
      </Shot>
      {insert(insertC, insertD)}
      <Shot f={f} from={insertD} to={l24.from - 4} cam={{ x: 1090, y: 640, zoom: 1.6 }}>
        {world}
      </Shot>
      <Shot f={f} from={l24.from - 4} to={F.len + 2} cam={{ x: 700, y: 620, zoom: 1.4 }}>
        {world}
      </Shot>
    </>
  );
};
