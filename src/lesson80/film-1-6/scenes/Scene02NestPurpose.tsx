// Сцена 2. «Для чего гнездо?» Деталь чаши гнезда (веточки, стебли, земля,
// только что уложенная травинка — без яиц и птенцов). Учитель: «Ребята,
// зачем птице гнездо?» — учебная пауза ровно 4 с: ждущий учитель и
// спокойные дети. Юсуф: «Чтобы там спать?» Учитель объясняет; на доске —
// маленькие учебные рисунки яйца и птенца (очевидно рисунки). Амир
// уточняет, учитель подтверждает; птица в окне поправляет материал.
import { ROOM_CAM, TREE_CAM } from "../cameraPresets";
import { camHold, camMove } from "../../core/shots";
import { MAIN } from "../../characters/characterConfig";
import { keys, smoothstep } from "../../rig/motion";
import { attentionByLines, faceTo, holdPaper, kneeHands, pupilPlace, Shots, smallGesture, teacherGesture, teacherPlace, teacherRest, TEACHER_X, useLines, WINDOW_X, type ShotSpec } from "../stage";

export const Scene02: React.FC = () => {
  const { L, len } = useLines();
  const l6 = L(6);
  const l7 = L(7);
  const l8 = L(8);
  const l9 = L(9);
  const l10 = L(10);
  const yP = pupilPlace(MAIN.yusuf);
  const aP = pupilPlace(MAIN.amir);
  const bP = pupilPlace(MAIN.bilal);
  const tP = { ...teacherPlace, x: teacherPlace.x + 190 }; // остался ближе к группе
  const toT = (x: number) => faceTo(tP.x, x);
  // момент слова «Позже» (7-е слово реплики 8) — появление рисунка на доске
  const boardAt = l8.words[6]?.f ?? l8.from + 60;
  const chars = {
    yusuf: {
      face: (t: number) => keys(t, [[0, toT(yP.x)], [l7.from - 20, toT(yP.x)], [l7.from - 8, toT(yP.x) - 0.25], [l7.to + 6, toT(yP.x) - 0.25], [l7.to + 18, toT(yP.x)], [boardAt, toT(yP.x)], [boardAt + 12, faceTo(700, yP.x)], [l8.to + 20, faceTo(700, yP.x)], [l8.to + 34, toT(yP.x)]]),
      pose: (t: number) => ({
        floorSit: 1,
        ...holdPaper(yP),
        expr: t > l7.from - 20 && t < l7.to + 10 ? ("thinking" as const) : ("listening" as const),
        headTilt: keys(t, [[l7.from - 20, 0], [l7.from - 8, 6], [l7.to + 8, 6], [l7.to + 20, 0]]),
        lookY: keys(t, [[l7.from - 20, 0], [l7.from - 8, -0.35], [l7.to + 8, -0.35], [l7.to + 20, 0]]),
        armR: t > l7.from - 16 && t < l7.to + 12 ? { target: { x: yP.x + 0.07 * yP.h, y: yP.y - 0.36 * yP.h }, shape: "pinch" as const, elbow: "out" as const } : holdPaper(yP).armR,
      }),
    },
    amir: {
      face: (t: number) => keys(t, [[0, toT(aP.x)], [l9.from - 10, toT(aP.x)], [l10.from + 20, toT(aP.x)], [l10.from + 34, faceTo(WINDOW_X, aP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(aP), expr: t > l9.from - 10 && t < l9.to + 10 ? ("curious" as const) : ("listening" as const), armR: t > l9.from - 6 && t < l9.to + 6 ? smallGesture(aP, 1) : kneeHands(aP).armR }),
    },
    bilal: {
      face: (t: number) => keys(t, [[0, toT(bP.x)], [l10.from + 24, toT(bP.x)], [l10.from + 40, faceTo(WINDOW_X, bP.x)]]),
      pose: () => ({ floorSit: 1, ...kneeHands(bP), expr: "focused" as const }),
    },
    teacher: {
      place: () => tP,
      face: (t: number) => keys(t, [[0, 0.75], [l6.from, 0.75], [l6.to + 10, 0.75], [l7.from - 6, faceTo(yP.x, tP.x)], [l8.from, faceTo(yP.x, tP.x)], [boardAt - 10, faceTo(yP.x, tP.x)], [boardAt + 6, -0.75], [l8.to + 10, -0.75], [l9.from, faceTo(aP.x, tP.x)], [l10.to + 10, faceTo(aP.x, tP.x)], [l10.to + 26, 0.85]]),
      pose: (t: number) => ({
        expr: t > l6.to && t < l7.from ? ("listening" as const) : t > l10.from ? ("softSmile" as const) : ("calm" as const),
        armR: t > l6.from - 8 && t < l6.to + 30 ? teacherGesture(tP, 0.26, -0.5) : t > boardAt - 8 && t < l8.to + 8 ? { target: { x: tP.x - 0.34 * tP.h, y: tP.y - 0.72 * tP.h }, shape: "point" as const, elbow: "out" as const } : t > l10.from - 6 && t < l10.to + 10 ? teacherGesture(tP, 0.3, -0.56) : teacherRest,
        armL: teacherRest,
        nod: keys(t, [[l10.from, 0], [l10.from + 6, 4], [l10.from + 16, 0]]),
        headTilt: keys(t, [[l6.to, 0], [l6.to + 14, 4], [l7.from - 6, 4], [l7.from + 6, 0]]),
      }),
    },
  };
  const attention = attentionByLines([{ ...l6, id: 6, role: "muhammad" }, { ...l7, id: 7, role: "yusuf" }, { ...l8, id: 8, role: "muhammad" }, { ...l9, id: 9, role: "amir" }, { ...l10, id: 10, role: "muhammad" }], [[l10.from + 30, len]], TEACHER_X);
  const shots: ShotSpec[] = [
    { kind: "tree", from: 0, to: l6.from - 10, cam: (f) => camMove(f, 0, l6.from - 10, TREE_CAM.nestDetail, { ...TREE_CAM.nestDetail, zoom: 3.0 }) },
    { kind: "room", from: l6.from - 10, to: l7.from - 10, cam: (f) => camMove(f, l6.from - 10, l7.from - 10, ROOM_CAM.teacherKids, { ...ROOM_CAM.teacherKids, zoom: 1.06, x: 930 }) },
    { kind: "room", from: l7.from - 10, to: l7.to + 12, cam: (f) => camHold(f, ROOM_CAM.yusuf) },
    { kind: "room", from: l7.to + 12, to: boardAt - 4, cam: (f) => camHold(f, ROOM_CAM.teacherMed) },
    { kind: "room", from: boardAt - 4, to: l8.to + 12, cam: (f) => camMove(f, boardAt - 4, l8.to + 12, ROOM_CAM.board, { ...ROOM_CAM.board, zoom: 1.7 }), board: (f) => smoothstep((f - boardAt) / 22) },
    { kind: "room", from: l8.to + 12, to: l9.to + 8, cam: (f) => camHold(f, ROOM_CAM.amir) },
    { kind: "room", from: l9.to + 8, to: len, cam: (f) => camMove(f, l9.to + 8, len, ROOM_CAM.teacherWindow, { ...ROOM_CAM.teacherWindow, x: 1400, zoom: 0.95 }) },
  ];
  return <Shots shots={shots} room={{ chars, attention }} />;
};
