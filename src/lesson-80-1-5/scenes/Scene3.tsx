// Сцена 3 «Что изменил Амир?»: учитель кладёт обычный лист рядом с сухой
// лодочкой (берёт из стопки, несёт, опускает). Вопрос «Ребята, из чего
// Амир сделал лодочку?» — обязательная пауза 4 с: группа спокойно ждёт,
// предметы в кадре. Ответ Юсуфа, объяснение Амира; Амир показывает две
// линии сгиба на сухом образце; учитель и Билал завершают мысль.
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
const TE = "teacher";

export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useContext(TimelineContext);
  const F = sceneFrames(tl, "s3");
  const sheet = F.action("s3-sheet");
  const creases = F.action("s3-creases");
  const pause = F.pause("l13");
  const l13 = F.line("l13");
  const l14 = F.line("l14");
  const l15 = F.line("l15");
  const l16 = F.line("l16");
  const l17 = F.line("l17");
  const l18 = F.line("l18");
  const amir = CAST.amir;
  const yusuf = CAST.yusuf;
  const bilal = CAST.bilal;
  const teacher = CAST.teacher;
  const dry = ROOM.props.boatDry;
  const stack = ROOM.props.stack;
  const dest = ROOM.props.sheetDemo;
  const teacherHead = { x: teacher.x, y: teacher.y - teacher.h * 0.45 };

  // ---------- лист: из стопки на стол ----------
  const tReach = sheet.from + 6;
  const tTake = sheet.from + 36;
  const tLift = sheet.from + 46;
  const tPlace = sheet.from + 88;
  const tRelease = sheet.from + 96;
  const tBack = sheet.to;
  const sheetPos = keysV(f, [[tLift, { x: stack.x, y: stack.y - 12 }], [tPlace, dest]], anticipate);
  const sheetLift = keys(f, [[tTake, 0], [tLift, 18], [tPlace - 8, 18], [tPlace, 0]], anticipate);
  const sheetInHands = f >= tTake && f < tRelease;
  const sheetOnTable = f >= tRelease;

  const teacherPose = (t: number): PoseIn => {
    const pos = keysV(t, [[tLift, { x: stack.x, y: stack.y - 12 }], [tPlace, dest]], anticipate);
    const lf = keys(t, [[tTake, 0], [tLift, 18], [tPlace - 8, 18], [tPlace, 0]], anticipate);
    const lean = keys(t, [[tReach, 0], [tTake, 10], [tLift, 12], [tPlace, 16], [tRelease, 16], [tBack, 0]]);
    const sway = keys(t, [[tReach, 0], [tTake, 16], [tPlace, 34], [tRelease, 34], [tBack, 0]]);
    const knee = { x: teacher.x + 0.17 * teacher.h, y: teacher.y - 0.02 * teacher.h };
    let armR: PoseIn["armR"];
    if (t < tReach) armR = LAP;
    else if (t < tTake) armR = handAt(teacher, TE, 1, keysV(t, [[tReach, knee], [tTake, { x: stack.x + 30, y: stack.y - 14 }]], anticipate), { shape: "relax" });
    else if (t < tRelease) armR = handAt(teacher, TE, 1, { x: pos.x + 40, y: pos.y - lf - 10 }, { shape: "pinch" });
    else if (t < tBack) armR = handAt(teacher, TE, 1, keysV(t, [[tRelease, { x: dest.x + 40, y: dest.y - 10 }], [tBack, knee]], anticipate), { shape: "relax" });
    else armR = LAP;
    // жест на вопросе и на реплике 16, 18: открытая ладонь к группе
    const g = Math.max(
      keys(t, [[l13.from - 4, 0], [l13.from + 12, 1], [l13.to, 1], [l13.to + 20, 0]], anticipate),
      keys(t, [[l16.from - 4, 0], [l16.from + 12, 1], [l16.to, 1], [l16.to + 24, 0]], anticipate),
      keys(t, [[l18.from - 4, 0], [l18.from + 10, 1], [l18.to, 1], [l18.to + 20, 0]], anticipate),
    );
    const gesture = { x: 690, y: 600 };
    if (t >= tBack && g > 0.02) armR = { target: { x: knee.x + (gesture.x - knee.x) * g, y: knee.y + (gesture.y - knee.y) * g }, shape: "open", elbow: "down", spread: 0.5, wrist: -70 * g };
    return {
      armL: LAP,
      armR,
      expr: t < l13.from ? "calm" : t < pause.to ? "softSmile" : t < l16.from ? "smile" : "calm",
      lean: t < tBack ? lean : 2,
      sway: t < tBack ? sway : 0,
      lookY: t < tBack ? lookDownTo(teacher, pos, 0.45) * 0.8 : 0.15,
      nod: (t >= l16.from && t < l16.from + 10) || (t >= l18.from && t < l18.from + 10) ? 3 : 0,
    };
  };
  const teacherFace = (t: number) => (t < tBack ? turnTo(teacher, sheetPos) * 0.7 + 0.3 : t < pause.to ? 0.7 : t < l15.from ? turnTo(teacher, { x: yusuf.x, y: yusuf.y - 100 }) : t < l16.from ? turnTo(teacher, { x: amir.x, y: amir.y - 100 }) : t < l17.to + 6 ? turnTo(teacher, { x: bilal.x, y: bilal.y - 100 }) * 0.9 : turnTo(teacher, { x: amir.x, y: amir.y - 100 }));

  // ---------- Амир: объясняет, показывает две линии сгиба ----------
  const S = 0.78;
  const amirPose = (t: number): PoseIn => {
    const cA = creases.from + 10;
    const cM = creases.from + Math.round(creases.len * 0.5);
    const cB = creases.to - 6;
    let armR: PoseIn["armR"];
    if (t >= cA - 12 && t < cB + 12) {
      // линия 1 (борт), затем линия 2 (ближняя складка)
      const line1 = (k: number): Vec => ({ x: dry.x - 30 * S + k * 110 * S, y: dry.y + 2 * S });
      const line2 = (k: number): Vec => ({ x: dry.x - 40 * S + k * 90 * S, y: dry.y + 34 * S });
      const tip = t < cM ? line1(anticipate((t - cA) / (cM - cA - 6))) : line2(anticipate((t - cM - 6) / (cB - cM - 6)));
      armR = handAt(amir, AM, 1, tip, { shape: "point" });
    } else if (t >= l15.from - 6 && t < l15.to + 6) {
      // «Был лист. Я согнул его» — ладонь поворачивается над столом
      const k = keys(t, [[l15.from - 6, 0], [l15.from + 10, 1], [l15.to, 1], [l15.to + 6, 0]], anticipate);
      const r = restOnTable(amir, 1).target!;
      armR = handAt(amir, AM, 1, { x: r.x + 10 * k, y: r.y - 26 * k }, { shape: "open", spread: 0.3, wrist: 40 * k });
    } else armR = restOnTable(amir, 1);
    return {
      armL: t >= cA - 12 && t < cB + 12 ? LAP : restOnTable(amir, -1),
      armR,
      expr: t < l13.from ? "calm" : t < pause.to ? "listening" : t < l15.to + 10 ? "softSmile" : t < creases.to ? "focused" : "smile",
      lean: t >= cA - 12 && t < cB + 12 ? 12 : 4,
      lookY: t >= cA - 12 && t < cB + 12 ? lookDownTo(amir, dry, 0.42) : 0.1,
      nod: t >= l15.from && t < l15.from + 8 ? 3 : 0,
    };
  };
  const amirFace = (t: number) => (t < pause.to ? turnTo(amir, teacherHead) * 0.9 : t < l15.from ? turnTo(amir, { x: yusuf.x, y: yusuf.y }) : t < l15.to + 6 ? turnTo(amir, teacherHead) * 0.6 : t < creases.to + 10 ? turnTo(amir, dry) * 0.5 : turnTo(amir, teacherHead) * 0.9);

  // ---------- Юсуф и Билал ----------
  const yusufPose = (t: number): PoseIn => ({
    armL: LAP,
    armR: t < tRelease ? LAP : restOnTable(yusuf, 1, -10),
    expr: t < l13.to ? "listening" : t < pause.to ? "curious" : t < l14.to + 12 ? "joy" : "listening",
    lean: t >= l14.from - 6 && t < l14.to + 10 ? 14 : 6,
    lookY: t < tRelease ? lookDownTo(yusuf, sheetPos, 0.4) * 0.6 : 0,
    nod: t >= l14.from && t < l14.to ? 2 : 0,
  });
  const yusufFace = (t: number) => (t < tRelease ? turnTo(yusuf, sheetPos) * 0.6 : t < l15.from ? turnTo(yusuf, teacherHead) : t < creases.to + 10 ? turnTo(yusuf, { x: amir.x, y: amir.y }) : turnTo(yusuf, teacherHead));
  const bilalPose = (t: number): PoseIn => ({
    armL: LAP,
    armR: LAP,
    expr: t < pause.to ? "listening" : t < l17.to + 10 ? "calm" : "softSmile",
    lean: 4,
    nod: t >= l17.from && t < l17.from + 8 ? 3 : 0,
  });
  const bilalFace = (t: number) => (t < pause.to ? turnTo(bilal, teacherHead) : t < creases.to + 10 ? turnTo(bilal, { x: amir.x, y: amir.y }) : t < l17.from ? turnTo(bilal, teacherHead) : t < l17.to ? turnTo(bilal, teacherHead) : turnTo(bilal, teacherHead));

  const props: PropsState = {
    floating: floatingAt(f + F.start),
    boatDry: { x: dry.x, y: dry.y, creases: f >= creases.from && f < creases.to + 20 },
    sheetDemo: sheetInHands ? { x: sheetPos.x, y: sheetPos.y, lift: sheetLift, inHands: true, rot: -3 } : sheetOnTable ? { x: dest.x, y: dest.y } : null,
  };
  const cast = { amir: { face: amirFace, pose: amirPose }, yusuf: { face: yusufFace, pose: yusufPose }, bilal: { face: bilalFace, pose: bilalPose }, teacher: { face: teacherFace, pose: teacherPose } };
  const focus = (t: number) => (t < tBack ? sheetPos : t < pause.to ? teacherHead : t < l15.from ? yusuf : t < l16.from ? amir : t < l17.from ? teacherHead : t < l18.from ? bilal : teacherHead);
  // во время ожидания — спокойные лица, без подсказок
  const world = <World f={f} cast={cast} props={props} focus={focus} groupMood={(t, seed) => (t >= l13.from && t < pause.to ? (["calm", "listening", "neutral"] as const)[seed % 3] : (["calm", "listening", "softSmile"] as const)[seed % 3])} />;

  const A = l13.from - 6; // конец установки листа
  const B = l13.to + 8; // пауза: общий план группы
  const C = l14.from - 4;
  const D = l15.from - 4;
  const E = creases.from - 4;
  const G = l16.from - 4;
  const H = l17.from - 4;
  const I = l18.from - 4;
  return (
    <>
      <Shot f={f} from={0} to={A} cam={camMove(f, 0, A, { x: 760, y: 720, zoom: 1.9 }, { x: 780, y: 724, zoom: 1.95 })}>
        {world}
      </Shot>
      <Shot f={f} from={A} to={B} cam={{ x: 640, y: 620, zoom: 1.55 }}>
        {world}
      </Shot>
      <Shot f={f} from={B} to={C} cam={{ x: 940, y: 600, zoom: 1.18 }}>
        {world}
      </Shot>
      <Shot f={f} from={C} to={D} cam={{ x: 830, y: 640, zoom: 1.75 }}>
        {world}
      </Shot>
      <Shot f={f} from={D} to={E} cam={{ x: 960, y: 660, zoom: 1.6 }}>
        {world}
      </Shot>
      <Shot f={f} from={E} to={G} cam={camMove(f, E, G, { x: 870, y: 720, zoom: 2.3 }, { x: 866, y: 722, zoom: 2.4 })}>
        {world}
      </Shot>
      <Shot f={f} from={G} to={H} cam={{ x: 640, y: 620, zoom: 1.55 }}>
        {world}
      </Shot>
      <Shot f={f} from={H} to={I} cam={{ x: 1090, y: 640, zoom: 1.6 }}>
        {world}
      </Shot>
      <Shot f={f} from={I} to={F.len + 2} cam={{ x: 700, y: 620, zoom: 1.4 }}>
        {world}
      </Shot>
    </>
  );
};
