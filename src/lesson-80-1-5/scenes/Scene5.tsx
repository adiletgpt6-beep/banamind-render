// Сцена 5 «А природа?»: окно с обычным деревом и росток из фильма 4 на
// подоконнике. Учитель: садовник сажает и поливает — как мы ухаживаем за
// ростком; Билал: но садовник не сделал солнце и воду; учитель пересказывает
// смысл обычным голосом — без изображений, вспышек и хора.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { TimelineContext } from "../context";
import type { PoseIn } from "../rig/Actor";
import { anticipate, keys } from "../rig/motion";
import { ROOM } from "../set/Room";
import { CAM_WIDE, camMove, Shot } from "../shots";
import { CAST, LAP, restOnTable, sceneFrames, turnTo } from "./common";
import { floatingAt, World, type PropsState } from "./World";

export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useContext(TimelineContext);
  const F = sceneFrames(tl, "s5");
  const win = F.action("s5-window");
  const l25 = F.line("l25");
  const l26 = F.line("l26");
  const l27 = F.line("l27");
  const l28 = F.line("l28");
  const l29 = F.line("l29");
  const l30 = F.line("l30");
  const l31 = F.line("l31");
  const amir = CAST.amir;
  const yusuf = CAST.yusuf;
  const bilal = CAST.bilal;
  const teacher = CAST.teacher;
  const teacherHead = { x: teacher.x, y: teacher.y - teacher.h * 0.45 };
  const windowPt = { x: ROOM.window.x + ROOM.window.w / 2, y: 200 };
  const sproutPt = { x: ROOM.sprout.x, y: ROOM.sprout.y - 60 };

  const teacherPose = (t: number): PoseIn => {
    // жест к окну и ростку на реплике 27, открытые ладони на 29
    const g = keys(t, [[l27.from - 4, 0], [l27.from + 14, 1], [l27.to, 1], [l27.to + 24, 0]], anticipate);
    const g2 = keys(t, [[l29.from - 4, 0], [l29.from + 14, 1], [l29.to, 1], [l29.to + 24, 0]], anticipate);
    const knee = { x: teacher.x + 0.17 * teacher.h, y: teacher.y - 0.02 * teacher.h };
    const toWindow = { x: teacher.x + 230, y: teacher.y - 330 };
    const openHand = { x: teacher.x + 150, y: teacher.y - 220 };
    const k = Math.max(g, g2);
    const target = g >= g2 ? toWindow : openHand;
    return {
      armL: LAP,
      armR: k < 0.02 ? LAP : { target: { x: knee.x + (target.x - knee.x) * k, y: knee.y + (target.y - knee.y) * k }, shape: "open", elbow: "down", spread: 0.5, wrist: -75 * k },
      expr: t < l29.from ? "calm" : "softSmile",
      nod: (t >= l29.from && t < l29.from + 10) || (t >= l31.from && t < l31.to) ? 3 : 0,
      lookY: 0.1,
    };
  };
  const teacherFace = (t: number) => (t < l26.from ? 0.7 : t < l27.from ? turnTo(teacher, { x: yusuf.x, y: yusuf.y - 100 }) : t < l27.mid ? turnTo(teacher, windowPt) * 0.9 : t < l28.from ? turnTo(teacher, sproutPt) * 0.9 : t < l29.from ? turnTo(teacher, { x: bilal.x, y: bilal.y - 100 }) * 0.9 : t < l30.from ? 0.7 : t < l31.from ? turnTo(teacher, { x: yusuf.x, y: yusuf.y - 100 }) : turnTo(teacher, { x: yusuf.x, y: yusuf.y - 100 }));

  const yusufPose = (t: number): PoseIn => ({
    armL: LAP,
    armR: restOnTable(yusuf, 1, -10),
    expr: t >= l26.from - 6 && t < l26.to + 10 ? "joy" : t >= l30.from - 6 && t < l30.to + 6 ? "curious" : "listening",
    lean: t >= l26.from - 6 && t < l26.to + 10 ? 14 : 6,
    nod: t >= l26.from && t < l26.to ? 2 : 0,
  });
  const yusufFace = (t: number) => (t < l25.from ? turnTo(yusuf, windowPt) : t < l27.mid ? turnTo(yusuf, teacherHead) : t < l28.from ? turnTo(yusuf, sproutPt) : t < l28.to + 6 ? turnTo(yusuf, { x: bilal.x, y: bilal.y }) : turnTo(yusuf, teacherHead));
  const amirPose = (): PoseIn => ({ armL: restOnTable(amir, -1), armR: restOnTable(amir, 1), expr: "listening", lean: 4 });
  const amirFace = (t: number) => (t < l25.from ? turnTo(amir, windowPt) : t < l27.mid ? turnTo(amir, teacherHead) * 0.9 : t < l28.from ? turnTo(amir, sproutPt) : t < l28.to + 6 ? turnTo(amir, { x: bilal.x, y: bilal.y }) : t < l30.from ? turnTo(amir, teacherHead) * 0.9 : t < l30.to + 6 ? turnTo(amir, { x: yusuf.x, y: yusuf.y }) : turnTo(amir, teacherHead) * 0.9);
  const bilalPose = (t: number): PoseIn => ({ armL: LAP, armR: LAP, expr: t >= l28.from - 6 && t < l28.to + 6 ? "thinking" : "listening", lean: 4, nod: t >= l28.from && t < l28.from + 8 ? 3 : 0 });
  const bilalFace = (t: number) => (t < l25.from ? turnTo(bilal, windowPt) : t < l27.mid ? turnTo(bilal, teacherHead) : t < l28.from ? turnTo(bilal, sproutPt) : t < l28.to ? turnTo(bilal, teacherHead) : turnTo(bilal, teacherHead));

  const props: PropsState = { floating: floatingAt(f + F.start), boatDry: { x: ROOM.props.boatDry.x, y: ROOM.props.boatDry.y }, sheetDemo: { x: ROOM.props.sheetDemo.x, y: ROOM.props.sheetDemo.y } };
  const cast = { amir: { face: amirFace, pose: amirPose }, yusuf: { face: yusufFace, pose: yusufPose }, bilal: { face: bilalFace, pose: bilalPose }, teacher: { face: teacherFace, pose: teacherPose } };
  const focus = (t: number) => (t < l25.from ? windowPt : t < l26.from ? teacherHead : t < l27.from ? yusuf : t < l27.mid ? teacherHead : t < l28.from ? sproutPt : t < l29.from ? bilal : t < l30.from ? teacherHead : t < l31.from ? yusuf : teacherHead);
  const world = <World f={f} cast={cast} props={props} focus={focus} />;
  const A = win.to;
  const B = l26.from - 4;
  const C = l27.from - 4;
  const D = l27.mid;
  const E = l28.from - 4;
  const G = l29.from - 4;
  const H = l29.mid;
  const I = l30.from - 4;
  const J = l31.from - 4;
  return (
    <>
      <Shot f={f} from={0} to={A} cam={camMove(f, 0, A, { x: 1560, y: 210, zoom: 2.0 }, { x: 1580, y: 216, zoom: 2.08 })}>
        {world}
      </Shot>
      <Shot f={f} from={A} to={B} cam={{ x: 640, y: 620, zoom: 1.55 }}>
        {world}
      </Shot>
      <Shot f={f} from={B} to={C} cam={{ x: 830, y: 640, zoom: 1.75 }}>
        {world}
      </Shot>
      <Shot f={f} from={C} to={D} cam={{ x: 700, y: 600, zoom: 1.35 }}>
        {world}
      </Shot>
      <Shot f={f} from={D} to={E} cam={camMove(f, D, E, { x: 1660, y: 300, zoom: 2.6 }, { x: 1670, y: 296, zoom: 2.8 })}>
        {world}
      </Shot>
      <Shot f={f} from={E} to={G} cam={{ x: 1090, y: 640, zoom: 1.6 }}>
        {world}
      </Shot>
      <Shot f={f} from={G} to={H} cam={{ x: 640, y: 620, zoom: 1.55 }}>
        {world}
      </Shot>
      <Shot f={f} from={H} to={I} cam={CAM_WIDE}>
        {world}
      </Shot>
      <Shot f={f} from={I} to={J} cam={{ x: 830, y: 640, zoom: 1.75 }}>
        {world}
      </Shot>
      <Shot f={f} from={J} to={F.len + 2} cam={{ x: 640, y: 620, zoom: 1.55 }}>
        {world}
      </Shot>
    </>
  );
};
