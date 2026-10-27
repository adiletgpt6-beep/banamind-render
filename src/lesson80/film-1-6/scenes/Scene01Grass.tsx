// Сцена 1. «Травинка в клюве». Занятие продолжается: Юсуф с незавершённой
// бумажной поделкой замечает движение за окном; Амир и Билал смотрят
// (не синхронно); учитель подходит ближе: «Посмотрим тихо». Крупно за
// окном: птица с травинкой подлетает к развилке, садится, укладывает
// травинку. Юсуф подаётся вперёд: «Вон, она кладёт её в гнездо!»
import { ROOM_CAM, TREE_CAM } from "../cameraPresets";
import { camHold, camMove } from "../../core/shots";
import { MAIN } from "../../characters/characterConfig";
import { anticipate, cruise, keys, keysV } from "../../rig/motion";
import { attentionByLines, faceTo, kneeHands, paperL, paperR, pupilPlace, Shots, teacherPlace, TEACHER_X, useLines, WINDOW_X, type ShotSpec } from "../stage";
import type { Place } from "../../rig/Actor";

export const Scene01: React.FC = () => {
  const { L, len } = useLines();
  const l1 = L(1);
  const l2 = L(2);
  const l3 = L(3);
  const l4 = L(4);
  const l5 = L(5);
  const notice = l1.from - 16; // Юсуф поднимает взгляд
  const yP = pupilPlace(MAIN.yusuf);
  const aP = pupilPlace(MAIN.amir);
  const bP = pupilPlace(MAIN.bilal);
  const wy = faceTo(WINDOW_X, yP.x);
  const wa = faceTo(WINDOW_X, aP.x);
  const wb = faceTo(WINDOW_X, bP.x);

  // учитель: стоит у доски, затем делает два шага к группе перед репликой 4
  const tStart = l4.from - 50;
  const teacherPlaceFn = (t: number): Place => {
    const u = cruise((t - tStart) / 40);
    return { ...teacherPlace, x: teacherPlace.x + 190 * u };
  };
  const chars = {
    yusuf: {
      face: (t: number) => keys(t, [[0, -0.2], [notice - 30, -0.2], [notice, -0.15], [notice + 10, wy], [l5.to + 40, wy]]),
      pose: (t: number) => ({
        floorSit: 1,
        lookY: keys(t, [[0, 0.55], [notice, 0.55], [notice + 8, -0.15], [l5.from, -0.15]]),
        expr: t < notice ? ("calm" as const) : t < l1.to + 10 ? ("surprised" as const) : ("curious" as const),
        lean: keys(t, [[l5.from - 12, 0], [l5.from, 7], [l5.to + 20, 7], [l5.to + 40, 2]]),
        armL: { target: paperL(yP), shape: "fist" as const, item: "paper" as const, flat: 0.35, itemTilt: 10, elbow: "down" as const },
        armR: {
          target: keysV(t, [[0, paperR(yP)], [l5.from - 14, paperR(yP)], [l5.from - 2, { x: yP.x + 0.3 * yP.h, y: yP.y - 0.5 * yP.h }], [l5.to + 14, { x: yP.x + 0.3 * yP.h, y: yP.y - 0.5 * yP.h }], [l5.to + 34, paperR(yP)]], anticipate),
          shape: t > l5.from - 8 && t < l5.to + 24 ? ("point" as const) : ("pinch" as const),
          elbow: "out" as const,
        },
      }),
    },
    amir: {
      face: (t: number) => keys(t, [[0, faceTo(TEACHER_X, aP.x) * 0.6], [l1.from - 4, faceTo(TEACHER_X, aP.x) * 0.6], [l1.from + 8, wa], [len, wa]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(aP), expr: t < l1.from ? ("listening" as const) : ("curious" as const), lookY: keys(t, [[0, 0.1], [l1.from + 8, -0.1]]) }),
    },
    bilal: {
      face: (t: number) => keys(t, [[0, faceTo(TEACHER_X, bP.x) * 0.5], [l1.from + 10, faceTo(TEACHER_X, bP.x) * 0.5], [l1.from + 24, wb], [len, wb]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(bP), expr: "focused" as const, lookY: keys(t, [[0, 0.1], [l1.from + 24, -0.1]]) }),
    },
    teacher: {
      place: teacherPlaceFn,
      face: (t: number) => keys(t, [[0, 0.55], [l1.from, 0.55], [l1.from + 14, faceTo(yP.x, teacherPlace.x)], [l3.to, faceTo(yP.x, teacherPlace.x)], [l3.to + 14, 0.85], [l4.to + 20, 0.85], [l4.to + 36, 0.8]]),
      pose: (t: number) => ({
        expr: t < l4.from ? ("calm" as const) : ("softSmile" as const),
        armR: {
          target: keysV(t, [[l4.from - 10, { x: teacherPlaceFn(t).x + 0.12 * teacherPlace.h, y: teacherPlace.y - 0.45 * teacherPlace.h }], [l4.from + 4, { x: teacherPlaceFn(t).x + 0.3 * teacherPlace.h, y: teacherPlace.y - 0.58 * teacherPlace.h }], [l4.to + 20, { x: teacherPlaceFn(t).x + 0.3 * teacherPlace.h, y: teacherPlace.y - 0.58 * teacherPlace.h }], [l4.to + 44, { x: teacherPlaceFn(t).x + 0.12 * teacherPlace.h, y: teacherPlace.y - 0.45 * teacherPlace.h }]]),
          shape: t > l4.from - 6 && t < l4.to + 30 ? ("open" as const) : ("relax" as const),
          elbow: "out" as const,
        },
        armL: { target: null, shape: "relax" as const },
        nod: keys(t, [[l4.from, 0], [l4.from + 8, 3], [l4.to, 0]]),
      }),
    },
  };
  const attention = attentionByLines([{ ...l1, id: 1, role: "yusuf" }, { ...l2, id: 2, role: "amir" }, { ...l3, id: 3, role: "bilal" }, { ...l4, id: 4, role: "muhammad" }], [[l1.from + 20, l4.from - 10], [l4.to + 10, len]]);
  // птица: взлёт через 0,5 с после реплики 4, полёт 2,1 с, посадка 0,5 с
  const takeoff = l4.to + 15;
  const landing = takeoff + 14 + 63;
  const shots: ShotSpec[] = [
    { kind: "room", from: 0, to: notice - 2, cam: (f) => camMove(f, 0, notice, ROOM_CAM.wide, { ...ROOM_CAM.wide, zoom: 0.79, x: 1330 }) },
    { kind: "room", from: notice - 2, to: l1.to + 10, cam: (f) => camHold(f, ROOM_CAM.yusuf) },
    { kind: "room", from: l1.to + 10, to: l3.to + 8, cam: (f) => camHold(f, ROOM_CAM.amirBilal) },
    { kind: "room", from: l3.to + 8, to: l4.to + 10, cam: (f) => camMove(f, l3.to + 8, l4.to + 10, ROOM_CAM.teacherKids, { ...ROOM_CAM.teacherKids, x: 940 }) },
    { kind: "tree", from: l4.to + 10, to: landing - 6, cam: (f) => camMove(f, l4.to + 10, landing, TREE_CAM.flight, { ...TREE_CAM.flight, x: 1250, y: 780, zoom: 1.05 }) },
    { kind: "tree", from: landing - 6, to: l5.from - 6, cam: (f) => camHold(f, TREE_CAM.nest, 0.002) },
    { kind: "room", from: l5.from - 6, to: l5.to + 12, cam: (f) => camHold(f, ROOM_CAM.yusuf) },
    { kind: "room", from: l5.to + 12, to: len, cam: (f) => camMove(f, l5.to + 12, len, ROOM_CAM.kidsWindow, { ...ROOM_CAM.kidsWindow, zoom: 1.2, x: 1560 }) },
  ];
  return <Shots shots={shots} room={{ chars, attention }} />;
};

