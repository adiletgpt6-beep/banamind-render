// Сцена 7 «Три коротких вопроса»: учитель обращается к группе и зрителям.
// После каждого вопроса — обязательная пауза (4, 5, 5 с): герои спокойно
// ждут, никто не кивает и не подсказывает; ответ начинается после паузы.
// Во время первого вопроса видны лист и лодочка, второго — Амир, третьего —
// группа. «Аллах!» — короткий спокойный ответ детей.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { TimelineContext } from "../context";
import type { PoseIn } from "../rig/Actor";
import { anticipate, keys } from "../rig/motion";
import { ROOM } from "../set/Room";
import { CAM_WIDE, camMove, Shot } from "../shots";
import { CAST, LAP, restOnTable, sceneFrames, turnTo } from "./common";
import { floatingAt, World, type PropsState } from "./World";

export const Scene7: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useContext(TimelineContext);
  const F = sceneFrames(tl, "s7");
  const l38 = F.line("l38");
  const l39 = F.line("l39");
  const l40 = F.line("l40");
  const l41 = F.line("l41");
  const l42 = F.line("l42");
  const l43 = F.line("l43");
  const p1 = F.pause("l38");
  const p2 = F.pause("l40");
  const p3 = F.pause("l42");
  const amir = CAST.amir;
  const yusuf = CAST.yusuf;
  const bilal = CAST.bilal;
  const teacher = CAST.teacher;
  const teacherHead = { x: teacher.x, y: teacher.y - teacher.h * 0.45 };
  const waiting = (t: number) => (t >= l38.from && t < p1.to) || (t >= l40.from && t < p2.to) || (t >= l42.from && t < p3.to);

  const teacherPose = (t: number): PoseIn => {
    const g = Math.max(
      keys(t, [[l38.from - 4, 0], [l38.from + 12, 1], [l38.to, 1], [l38.to + 20, 0]], anticipate),
      keys(t, [[l40.from - 4, 0], [l40.from + 12, 1], [l40.to, 1], [l40.to + 20, 0]], anticipate),
      keys(t, [[l42.from - 4, 0], [l42.from + 12, 1], [l42.to, 1], [l42.to + 20, 0]], anticipate),
    );
    const knee = { x: teacher.x + 0.17 * teacher.h, y: teacher.y - 0.02 * teacher.h };
    const openHand = { x: teacher.x + 150, y: teacher.y - 230 };
    return {
      armL: LAP,
      armR: g < 0.02 ? LAP : { target: { x: knee.x + (openHand.x - knee.x) * g, y: knee.y + (openHand.y - knee.y) * g }, shape: "open", elbow: "down", spread: 0.5, wrist: -75 * g },
      expr: t >= l43.from ? "smile" : "calm",
      nod: 0,
      lookY: 0.1,
    };
  };
  // смотрит на группу (и в сторону зрителя) — без подсказок конкретному ребёнку
  const teacherFace = (t: number) => (t < l39.from ? 0.55 : t < l39.to + 8 ? turnTo(teacher, { x: yusuf.x, y: yusuf.y - 100 }) : t < l41.from ? 0.6 : t < l41.to + 8 ? turnTo(teacher, { x: bilal.x, y: bilal.y - 100 }) * 0.9 : 0.6);

  const yusufPose = (t: number): PoseIn => ({
    armL: LAP,
    armR: restOnTable(yusuf, 1, -10),
    expr: t >= l39.from - 4 && t < l39.to + 10 ? "softSmile" : t >= l43.from ? "joy" : waiting(t) ? "listening" : "calm",
    lean: t >= l39.from - 4 && t < l39.to + 10 ? 12 : 6,
    nod: t >= l39.from && t < l39.to ? 2 : 0,
  });
  const yusufFace = (t: number) => (t < l41.to ? turnTo(yusuf, teacherHead) : t < l41.to + 8 ? turnTo(yusuf, { x: bilal.x, y: bilal.y }) : turnTo(yusuf, teacherHead));
  const amirPose = (t: number): PoseIn => ({ armL: restOnTable(amir, -1), armR: restOnTable(amir, 1), expr: t >= l43.from ? "joy" : t >= l41.from && t < l41.to + 10 ? "softSmile" : "calm", lean: 4, nod: 0 });
  const amirFace = (t: number) => (t < l39.from ? turnTo(amir, teacherHead) * 0.9 : t < l39.to + 6 ? turnTo(amir, { x: yusuf.x, y: yusuf.y }) : t < l41.from ? turnTo(amir, teacherHead) * 0.9 : t < l41.to + 6 ? turnTo(amir, { x: bilal.x, y: bilal.y }) : turnTo(amir, teacherHead) * 0.9);
  const bilalPose = (t: number): PoseIn => ({ armL: LAP, armR: LAP, expr: t >= l41.from - 4 && t < l41.to + 10 ? "softSmile" : t >= l43.from ? "smile" : "calm", lean: 4, nod: t >= l41.from && t < l41.to ? 2 : 0 });
  const bilalFace = (t: number) => (t < l39.from ? turnTo(bilal, teacherHead) : t < l39.to + 6 ? turnTo(bilal, { x: yusuf.x, y: yusuf.y }) : turnTo(bilal, teacherHead));

  const props: PropsState = { floating: floatingAt(f + F.start), boatDry: { x: ROOM.props.boatDry.x, y: ROOM.props.boatDry.y }, sheetDemo: { x: ROOM.props.sheetDemo.x, y: ROOM.props.sheetDemo.y } };
  const cast = { amir: { face: amirFace, pose: amirPose }, yusuf: { face: yusufFace, pose: yusufPose }, bilal: { face: bilalFace, pose: bilalPose }, teacher: { face: teacherFace, pose: teacherPose } };
  const focus = (t: number) => (t >= l39.from - 4 && t < l39.to + 6 ? yusuf : t >= l41.from - 4 && t < l41.to + 6 ? bilal : teacherHead);
  const world = (
    <World
      f={f}
      cast={cast}
      props={props}
      focus={focus}
      groupMood={(t, seed) => (t >= l43.from ? (["smile", "joy", "softSmile"] as const)[seed % 3] : waiting(t) ? (["calm", "listening", "neutral"] as const)[seed % 3] : (["calm", "listening", "softSmile"] as const)[seed % 3])}
    />
  );
  const A = l38.from - 6;
  const B = l39.from - 4;
  const C = l40.from - 6;
  const D = l41.from - 4;
  const E = l42.from - 6;
  return (
    <>
      <Shot f={f} from={0} to={A} cam={{ x: 700, y: 600, zoom: 1.35 }}>
        {world}
      </Shot>
      {/* вопрос 1 и пауза: лист и лодочка в кадре */}
      <Shot f={f} from={A} to={B} cam={camMove(f, A, B, { x: 790, y: 720, zoom: 1.75 }, { x: 792, y: 722, zoom: 1.8 })}>
        {world}
      </Shot>
      <Shot f={f} from={B} to={C} cam={{ x: 830, y: 640, zoom: 1.75 }}>
        {world}
      </Shot>
      {/* вопрос 2 и пауза: Амир */}
      <Shot f={f} from={C} to={D} cam={camMove(f, C, D, { x: 960, y: 650, zoom: 1.55 }, { x: 962, y: 652, zoom: 1.6 })}>
        {world}
      </Shot>
      <Shot f={f} from={D} to={E} cam={{ x: 1090, y: 640, zoom: 1.6 }}>
        {world}
      </Shot>
      {/* вопрос 3, пауза и ответ: группа */}
      <Shot f={f} from={E} to={F.len + 2} cam={camMove(f, E, F.len, CAM_WIDE, { x: 960, y: 536, zoom: 1.03 })}>
        {world}
      </Shot>
    </>
  );
};
