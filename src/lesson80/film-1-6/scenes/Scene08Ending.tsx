// Сцена 8. «Заметить удивительное». Амир смотрит на поделку, потом на
// дерево и улыбается: «Я сегодня только одну лодочку сложил…» Юсуф с
// бумагой в руках: «Завтра посмотрим, что у неё получилось?» Учитель рядом с
// детьми, остальные спокойно слушают. Финальная параллель: пальцы Юсуфа
// выполняют следующий сгиб; птица за окном возвращается с очередной
// травинкой и укладывает её в ещё не завершённое гнездо; спокойный дневной
// свет; финальная надпись (Caption.tsx) — в последние секунды.
import { ROOM_CAM, TREE_CAM } from "../cameraPresets";
import { camHold, camMove } from "../../core/shots";
import { MAIN } from "../../characters/characterConfig";
import { keys, keysV, smoothstep } from "../../rig/motion";
import { attentionByLines, faceTo, holdPaper, kneeHands, paperL, paperR, pupilPlace, Shots, smallGesture, teacherGesture, teacherPlace, teacherRest, TEACHER_X, useLines, WINDOW_X, type ShotSpec } from "../stage";

export const Scene08: React.FC = () => {
  const { L, len } = useLines();
  const l43 = L(43);
  const l44 = L(44);
  const l45 = L(45);
  const yP = pupilPlace(MAIN.yusuf);
  const aP = pupilPlace(MAIN.amir);
  const bP = pupilPlace(MAIN.bilal);
  const tP = { ...teacherPlace, x: teacherPlace.x + 190 };
  const toT = (x: number) => faceTo(tP.x, x);
  const toW = (x: number) => faceTo(WINDOW_X, x);
  const wordA = l43.words[7]?.f ?? l43.from + 70; // «А она сколько…» — взгляд на дерево
  const foldAt = l45.to + 14; // следующий сгиб
  const chars = {
    yusuf: {
      face: (t: number) => keys(t, [[0, toT(yP.x) * 0.5], [l44.from - 10, toT(yP.x) * 0.5], [l44.from, toT(yP.x)], [l45.to + 6, toT(yP.x)], [foldAt, -0.1], [len, -0.1]]),
      pose: (t: number) => {
        const fold = 0.35 + 0.65 * smoothstep((t - foldAt) / 50);
        return {
          floorSit: 1,
          ...holdPaper(yP, fold),
          expr: t > l44.from - 10 && t < l44.to + 10 ? ("smile" as const) : t > foldAt ? ("focused" as const) : ("softSmile" as const),
          lookY: keys(t, [[0, 0.3], [l44.from - 10, 0.3], [l44.from, 0], [l45.to + 6, 0], [foldAt, 0.55]]),
          // правая кисть ведёт сгиб: от края к центру листа
          armR: t > foldAt - 6 ? { target: keysV(t, [[foldAt - 6, paperR(yP)], [foldAt + 14, { x: yP.x + 0.12 * yP.h, y: yP.y - 0.31 * yP.h }], [foldAt + 44, { x: yP.x + 0.0 * yP.h, y: yP.y - 0.27 * yP.h }], [foldAt + 70, paperR(yP)]]), shape: "pinch" as const, elbow: "out" as const } : holdPaper(yP).armR,
          armL: { ...holdPaper(yP, fold).armL, target: paperL(yP) },
        };
      },
    },
    amir: {
      face: (t: number) => keys(t, [[0, faceTo(yP.x, aP.x)], [l43.from - 6, faceTo(yP.x, aP.x)], [wordA - 6, faceTo(yP.x, aP.x)], [wordA + 8, toW(aP.x)], [l44.from, toW(aP.x)], [l44.from + 10, faceTo(yP.x, aP.x)], [l45.from, toT(aP.x)], [len, toT(aP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(aP), expr: t > l43.from - 10 ? ("smile" as const) : ("softSmile" as const), lookY: keys(t, [[0, 0.4], [wordA - 6, 0.4], [wordA + 8, -0.2], [l44.from + 10, 0.1]]), armR: t > wordA - 4 && t < l43.to + 6 ? smallGesture(aP, 1) : kneeHands(aP).armR }),
    },
    bilal: {
      face: (t: number) => keys(t, [[0, faceTo(aP.x, bP.x)], [l44.from, faceTo(yP.x, bP.x)], [l45.from - 6, toT(bP.x)], [len, toT(bP.x)]]),
      pose: () => ({ floorSit: 1, ...kneeHands(bP), expr: "softSmile" as const }),
    },
    teacher: {
      place: () => tP,
      face: (t: number) => keys(t, [[0, faceTo(aP.x, tP.x)], [l44.from - 6, faceTo(yP.x, tP.x)], [l45.from + 20, faceTo(yP.x, tP.x)], [l45.from + 34, faceTo(1250, tP.x)], [l45.to, faceTo(1250, tP.x)], [l45.to + 20, 0.85]]),
      pose: (t: number) => ({
        expr: "smile" as const,
        crouch: 0.4,
        lean: 5,
        armR: t > l45.from + 24 && t < l45.to + 6 ? teacherGesture(tP, 0.26, -0.52) : teacherRest,
        armL: teacherRest,
        nod: keys(t, [[l45.from - 2, 0], [l45.from + 5, 4], [l45.from + 14, 0]]),
      }),
    },
  };
  const attention = attentionByLines([{ ...l43, id: 43, role: "amir" }, { ...l44, id: 44, role: "yusuf" }, { ...l45, id: 45, role: "muhammad" }], [[l45.to + 20, len]], TEACHER_X);
  const paperEnd = foldAt + 76;
  const treeEnd = paperEnd + 140;
  const shots: ShotSpec[] = [
    { kind: "room", from: 0, to: l43.to + 8, cam: (f) => camHold(f, ROOM_CAM.amir) },
    { kind: "room", from: l43.to + 8, to: l44.to + 8, cam: (f) => camHold(f, ROOM_CAM.yusuf) },
    { kind: "room", from: l44.to + 8, to: foldAt - 2, cam: (f) => camMove(f, l44.to + 8, foldAt - 2, ROOM_CAM.teacherKids, { ...ROOM_CAM.teacherKids, zoom: 1.03 }) },
    // пальцы аккуратно выполняют следующий сгиб
    { kind: "room", from: foldAt - 2, to: paperEnd, cam: (f) => camHold(f, ROOM_CAM.paper, 0.002) },
    // птица возвращается с травинкой и укладывает её; гнездо не завершено
    { kind: "tree", from: paperEnd, to: treeEnd, cam: (f) => camMove(f, paperEnd, treeEnd, TREE_CAM.nestWide, TREE_CAM.nest) },
    // спокойный дневной свет: общий план комнаты с окном
    { kind: "room", from: treeEnd, to: len, cam: (f) => camMove(f, treeEnd, len, ROOM_CAM.wideRight, { ...ROOM_CAM.wideRight, zoom: 0.77 }) },
  ];
  return <Shots shots={shots} room={{ chars, attention }} />;
};
