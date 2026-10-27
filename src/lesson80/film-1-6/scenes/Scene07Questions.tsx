// Сцена 7. «Что мы заметили?» Три учебных вопроса с паузами ровно 4 / 5 / 4 с
// (без ответов на экране, таймеров и подсказок): во время пауз — спокойная
// птица с травинкой, общий план детей, вид дерева. Ответы: Юсуф «Клювом!»,
// дети хором «Аллах!» (несколько голосов, не синхронно), Билал.
import { ROOM_CAM, TREE_CAM } from "../cameraPresets";
import { camHold, camMove } from "../../core/shots";
import { MAIN } from "../../characters/characterConfig";
import { keys } from "../../rig/motion";
import { attentionByLines, faceTo, holdPaper, kneeHands, pupilPlace, Shots, smallGesture, teacherGesture, teacherPlace, teacherRest, TEACHER_X, useLines, WINDOW_X, type ShotSpec } from "../stage";

export const Scene07: React.FC = () => {
  const { L, len } = useLines();
  const l37 = L(37);
  const l38 = L(38);
  const l39 = L(39);
  const l40 = L(40);
  const l41 = L(41);
  const l42 = L(42);
  const yP = pupilPlace(MAIN.yusuf);
  const aP = pupilPlace(MAIN.amir);
  const bP = pupilPlace(MAIN.bilal);
  const tP = { ...teacherPlace, x: teacherPlace.x + 190 };
  const toT = (x: number) => faceTo(tP.x, x);
  const toW = (x: number) => faceTo(WINDOW_X, x);
  const chars = {
    yusuf: {
      face: (t: number) => keys(t, [[0, toT(yP.x)], [l41.to + 10, toT(yP.x)], [l41.to + 24, toW(yP.x)], [l42.from - 4, toW(yP.x)], [l42.from + 8, toT(yP.x)]]),
      pose: (t: number) => ({
        floorSit: 1,
        ...holdPaper(yP),
        expr: t > l38.from - 6 && t < l38.to + 20 ? ("smile" as const) : t > l40.from - 4 && t < l40.to + 16 ? ("smile" as const) : ("listening" as const),
        lean: keys(t, [[l38.from - 8, 0], [l38.from, 5], [l38.to + 10, 5], [l38.to + 24, 0]]),
        nod: keys(t, [[l38.from - 2, 0], [l38.from + 4, 4], [l38.from + 12, 0]]),
      }),
    },
    amir: {
      face: (t: number) => keys(t, [[0, toT(aP.x)], [l41.to + 12, toT(aP.x)], [l41.to + 26, toW(aP.x)], [l42.from, toW(aP.x)], [l42.from + 12, toT(aP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(aP), expr: t > l40.from - 4 && t < l40.to + 16 ? ("smile" as const) : ("listening" as const), nod: keys(t, [[l40.from, 0], [l40.from + 5, 4], [l40.from + 14, 0]]) }),
    },
    bilal: {
      face: (t: number) => keys(t, [[0, toT(bP.x)], [l41.to + 14, toT(bP.x)], [l41.to + 28, toW(bP.x)], [l42.from - 6, toW(bP.x)], [l42.from + 6, toT(bP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(bP), expr: t > l42.from - 8 ? ("softSmile" as const) : ("focused" as const), armR: t > l42.from - 6 && t < l42.to + 6 ? smallGesture(bP, 1) : kneeHands(bP).armR }),
    },
    teacher: {
      place: () => tP,
      // учитель обращается к группе и к зрителю: чуть ближе к камере
      face: (t: number) => keys(t, [[0, 0.3], [l37.to + 10, 0.3], [l38.from - 4, faceTo(yP.x, tP.x)], [l38.to + 10, faceTo(yP.x, tP.x)], [l39.from - 6, 0.3], [l40.to + 10, 0.3], [l41.from - 6, 0.3], [l41.to + 10, 0.3], [l42.from - 6, faceTo(bP.x, tP.x)], [len, faceTo(bP.x, tP.x)]]),
      pose: (t: number) => ({
        expr: (t > l37.to && t < l38.from) || (t > l39.to && t < l40.from) || (t > l41.to && t < l42.from) ? ("listening" as const) : t > l38.from && t < l38.to + 24 ? ("smile" as const) : t > l40.from && t < l40.to + 24 ? ("smile" as const) : ("calm" as const),
        crouch: 0.3,
        lean: 4,
        armR: t > l37.from - 6 && t < l37.to + 8 ? teacherGesture(tP, 0.24, -0.5) : t > l39.from - 6 && t < l39.to + 8 ? teacherGesture(tP, 0.26, -0.56) : t > l41.from - 6 && t < l41.to + 8 ? teacherGesture(tP, 0.3, -0.58) : teacherRest,
        armL: teacherRest,
        nod: keys(t, [[l38.to, 0], [l38.to + 6, 5], [l38.to + 16, 0], [l40.to, 0], [l40.to + 6, 5], [l40.to + 16, 0], [l42.to, 0], [l42.to + 6, 5], [l42.to + 16, 0]]),
        headTilt: keys(t, [[l37.to, 0], [l37.to + 14, 3], [l38.from, 3], [l38.from + 6, 0]]),
      }),
    },
  };
  const attention = attentionByLines(
    [{ ...l37, id: 37, role: "muhammad" }, { ...l38, id: 38, role: "yusuf" }, { ...l39, id: 39, role: "muhammad" }, { ...l40, id: 40, role: "muhammad" }, { ...l41, id: 41, role: "muhammad" }, { ...l42, id: 42, role: "bilal" }],
    [[l41.to + 20, l42.from - 2]],
    TEACHER_X,
  );
  const shots: ShotSpec[] = [
    { kind: "room", from: 0, to: l37.to + 6, cam: (f) => camMove(f, 0, l37.to + 6, { x: 900, y: 900, zoom: 1.1 }, { x: 880, y: 890, zoom: 1.16 }) },
    // пауза 4 с: спокойная птица с травинкой на нижней ветке
    { kind: "tree", from: l37.to + 6, to: l38.from - 4, cam: (f) => camHold(f, TREE_CAM.lowPerch, 0.002) },
    { kind: "room", from: l38.from - 4, to: l38.to + 14, cam: (f) => camHold(f, ROOM_CAM.yusuf) },
    { kind: "room", from: l38.to + 14, to: l39.to + 6, cam: (f) => camHold(f, ROOM_CAM.teacherMed) },
    // пауза 5 с: спокойный общий план детей, никто не отвечает раньше
    { kind: "room", from: l39.to + 6, to: l40.from - 6, cam: (f) => camMove(f, l39.to + 6, l40.from - 6, ROOM_CAM.crowd, { ...ROOM_CAM.crowd, zoom: 0.98 }) },
    { kind: "room", from: l40.from - 6, to: l40.to + 18, cam: (f) => camHold(f, ROOM_CAM.kids) },
    { kind: "room", from: l40.to + 18, to: l41.to + 6, cam: (f) => camHold(f, ROOM_CAM.teacherMed) },
    // пауза 4 с: красивый спокойный вид дерева
    { kind: "tree", from: l41.to + 6, to: l42.from - 4, cam: (f) => camMove(f, l41.to + 6, l42.from - 4, TREE_CAM.wide, { ...TREE_CAM.wide, zoom: 0.82 }) },
    { kind: "room", from: l42.from - 4, to: l42.to + 10, cam: (f) => camHold(f, ROOM_CAM.bilal) },
    { kind: "room", from: l42.to + 10, to: len, cam: (f) => camHold(f, ROOM_CAM.teacherKids) },
  ];
  return <Shots shots={shots} room={{ chars, attention }} />;
};
