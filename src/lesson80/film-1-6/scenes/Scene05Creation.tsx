// Сцена 5. «Кто создал её такой?» Птица возвращается к дереву — совершенно
// обычная, без эффектов. Юсуф чуть склоняет голову: «А кто создал её такой?»
// Учитель отвечает спокойно, с небольшим жестом; показывается птица, дерево
// и природа (никаких изображений Аллаха или сотворения). Билал спрашивает о
// Коране, учитель пересказывает смысл аята, Амир связывает с птицей.
import { ROOM_CAM, TREE_CAM } from "../cameraPresets";
import { camHold, camMove } from "../../core/shots";
import { MAIN } from "../../characters/characterConfig";
import { keys } from "../../rig/motion";
import { attentionByLines, faceTo, holdPaper, kneeHands, pupilPlace, Shots, smallGesture, teacherGesture, teacherPlace, teacherRest, TEACHER_X, useLines, WINDOW_X, type ShotSpec } from "../stage";

export const Scene05: React.FC = () => {
  const { L, len } = useLines();
  const l24 = L(24);
  const l25 = L(25);
  const l26 = L(26);
  const l27 = L(27);
  const l28 = L(28);
  const l29 = L(29);
  const yP = pupilPlace(MAIN.yusuf);
  const aP = pupilPlace(MAIN.amir);
  const bP = pupilPlace(MAIN.bilal);
  const tP = { ...teacherPlace, x: teacherPlace.x + 190 };
  const toT = (x: number) => faceTo(tP.x, x);
  const toW = (x: number) => faceTo(WINDOW_X, x);
  const chars = {
    yusuf: {
      face: (t: number) => keys(t, [[0, toW(yP.x)], [l24.from - 8, toW(yP.x)], [l24.from + 10, toT(yP.x)], [l29.to + 10, toT(yP.x)], [l29.to + 24, toW(yP.x)]]),
      pose: (t: number) => ({
        floorSit: 1,
        ...holdPaper(yP),
        expr: t > l24.from - 20 && t < l24.to + 10 ? ("curious" as const) : ("listening" as const),
        headTilt: keys(t, [[l24.from - 20, 0], [l24.from - 8, 8], [l24.to + 6, 8], [l24.to + 18, 0]]),
      }),
    },
    amir: {
      face: (t: number) => keys(t, [[0, toW(aP.x)], [l24.from + 4, toW(aP.x)], [l24.from + 16, toT(aP.x)], [l29.to + 12, toT(aP.x)], [l29.to + 26, toW(aP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(aP), expr: t > l28.from - 10 && t < l28.to + 10 ? ("curious" as const) : ("listening" as const), armR: t > l28.from - 6 && t < l28.to + 6 ? smallGesture(aP, 1) : kneeHands(aP).armR }),
    },
    bilal: {
      face: (t: number) => keys(t, [[0, toW(bP.x)], [l24.from + 8, toW(bP.x)], [l24.from + 22, toT(bP.x)], [len, toT(bP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(bP), expr: t > l26.from - 10 && t < l26.to + 10 ? ("curious" as const) : ("focused" as const), armR: t > l26.from - 6 && t < l26.to + 6 ? smallGesture(bP, 1) : kneeHands(bP).armR }),
    },
    teacher: {
      place: () => tP,
      face: (t: number) => keys(t, [[0, 0.85], [l24.from - 10, 0.85], [l24.from, faceTo(yP.x, tP.x)], [l25.from + 40, faceTo(yP.x, tP.x)], [l25.from + 54, 0.85], [l25.to, 0.85], [l26.from - 6, faceTo(bP.x, tP.x)], [l27.to, faceTo(bP.x, tP.x)], [l28.from - 6, faceTo(aP.x, tP.x)], [len, faceTo(aP.x, tP.x)]]),
      pose: (t: number) => ({
        expr: t > l25.from - 6 && t < l25.to ? ("calm" as const) : t > l29.from - 6 ? ("softSmile" as const) : ("listening" as const),
        crouch: 0.55,
        lean: 6,
        armR: t > l25.from - 6 && t < l25.to + 10 ? teacherGesture(tP, 0.26, -0.52) : t > l27.from - 6 && t < l27.to + 8 ? teacherGesture(tP, 0.2, -0.44) : t > l29.from - 6 && t < l29.to + 8 ? teacherGesture(tP, 0.28, -0.56) : teacherRest,
        armL: t > l27.from + 30 && t < l27.to + 8 ? teacherGesture(tP, -0.18, -0.4) : teacherRest,
        nod: keys(t, [[l25.from, 0], [l25.from + 6, 3], [l25.from + 16, 0], [l29.from, 0], [l29.from + 6, 4], [l29.from + 16, 0]]),
      }),
    },
  };
  const attention = attentionByLines(
    [{ ...l24, id: 24, role: "yusuf" }, { ...l25, id: 25, role: "muhammad" }, { ...l26, id: 26, role: "bilal" }, { ...l27, id: 27, role: "muhammad" }, { ...l28, id: 28, role: "amir" }, { ...l29, id: 29, role: "muhammad" }],
    [[0, l24.from - 6], [l29.to + 26, len]],
    TEACHER_X,
  );
  const shots: ShotSpec[] = [
    { kind: "tree", from: 0, to: l24.from - 6, cam: (f) => camMove(f, 0, l24.from - 6, TREE_CAM.flightUp, { x: 1280, y: 760, zoom: 1.15 }) },
    { kind: "room", from: l24.from - 6, to: l24.to + 10, cam: (f) => camHold(f, ROOM_CAM.yusuf) },
    { kind: "room", from: l24.to + 10, to: l25.from + 48, cam: (f) => camHold(f, ROOM_CAM.teacherCU) },
    { kind: "tree", from: l25.from + 48, to: l25.to + 14, cam: (f) => camMove(f, l25.from + 48, l25.to + 14, TREE_CAM.wide, { ...TREE_CAM.wide, zoom: 0.84, x: 1300 }) },
    { kind: "room", from: l25.to + 14, to: l26.to + 8, cam: (f) => camHold(f, ROOM_CAM.bilal) },
    { kind: "room", from: l26.to + 8, to: l27.to + 10, cam: (f) => camMove(f, l26.to + 8, l27.to + 10, ROOM_CAM.teacherMed, { x: 820, y: 865, zoom: 1.5 }) },
    { kind: "room", from: l27.to + 10, to: l28.to + 8, cam: (f) => camHold(f, ROOM_CAM.amir) },
    { kind: "room", from: l28.to + 8, to: len, cam: (f) => camMove(f, l28.to + 8, len, ROOM_CAM.teacherKids, { ...ROOM_CAM.teacherKids, zoom: 1.04 }) },
  ];
  return <Shots shots={shots} room={{ chars, attention }} />;
};
