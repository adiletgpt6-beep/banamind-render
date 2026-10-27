// Сцена 6. «Посмотрим, не мешая». Юсуф встаёт и делает один небольшой шаг
// к выходу: «Можно я выйду посмотреть поближе?» Учитель не хватает за руку,
// спокойно предлагает остаться. Юсуф объясняет, учитель и окно в одном
// кадре: «Тогда будем смотреть из окна…» — Юсуф возвращается на место без
// дополнительной реплики. Птица улетает за новым материалом; Амир, учитель,
// Билал. Гнездо за сцену не достраивается.
import { ROOM_CAM, TREE_CAM } from "../cameraPresets";
import { camHold, camMove } from "../../core/shots";
import { MAIN } from "../../characters/characterConfig";
import { cruise, keys, lerp } from "../../rig/motion";
import type { Place } from "../../rig/Actor";
import { attentionByLines, faceTo, holdPaper, kneeHands, pupilPlace, Shots, smallGesture, teacherGesture, teacherPlace, teacherRest, TEACHER_X, useLines, WINDOW_X, type ShotSpec } from "../stage";

export const Scene06: React.FC = () => {
  const { L, len } = useLines();
  const l30 = L(30);
  const l31 = L(31);
  const l32 = L(32);
  const l33 = L(33);
  const l34 = L(34);
  const l35 = L(35);
  const l36 = L(36);
  const yBase = pupilPlace(MAIN.yusuf);
  const aP = pupilPlace(MAIN.amir);
  const bP = pupilPlace(MAIN.bilal);
  const tP = { ...teacherPlace, x: teacherPlace.x + 190 };
  const toT = (x: number) => faceTo(tP.x, x);
  const toW = (x: number) => faceTo(WINDOW_X, x);
  // Юсуф: встаёт (floorSit 1→0) за 26 кадров до реплики 30, шаг к выходу
  // (влево-вперёд) — один шаг; после реплики 33 возвращается и садится.
  const standAt = l30.from - 44;
  const stepAt = l30.from - 14;
  const backAt = l33.to + 12;
  const sitAt = backAt + 34;
  const dx = -120;
  const dy = 36;
  const yPlace = (t: number): Place => {
    const out = cruise((t - stepAt) / 26);
    const back = cruise((t - backAt) / 30);
    const k = out - back;
    return { x: yBase.x + dx * k, y: yBase.y + dy * k, h: yBase.h };
  };
  const chars = {
    yusuf: {
      place: yPlace,
      face: (t: number) => keys(t, [[0, toW(yBase.x)], [standAt - 10, toW(yBase.x)], [standAt + 10, toT(yBase.x)], [l31.to + 6, toT(yBase.x)], [l32.from - 8, toW(yBase.x)], [l32.to + 4, toW(yBase.x)], [l32.to + 16, toT(yBase.x)], [backAt, toT(yBase.x)], [backAt + 20, toW(yBase.x)], [len, toW(yBase.x)]]),
      pose: (t: number) => {
        const p = yPlace(t);
        const sit = keys(t, [[standAt, 1], [standAt + 26, 0], [sitAt, 0], [sitAt + 28, 1]]);
        return {
          floorSit: sit,
          crouch: keys(t, [[standAt, 0], [standAt + 8, 0.5], [standAt + 26, 0], [sitAt, 0], [sitAt + 10, 0.5], [sitAt + 28, 0]]) * (1 - sit),
          lean: keys(t, [[standAt, 0], [standAt + 10, 10], [standAt + 26, 2], [sitAt, 2], [sitAt + 12, 10], [sitAt + 28, 0]]),
          ...holdPaper(p),
          expr: t > l30.from - 10 && t < l30.to + 8 ? ("curious" as const) : t > l32.from - 10 && t < l32.to + 8 ? ("apologetic" as const) : t > backAt ? ("softSmile" as const) : ("listening" as const),
          armR: t > l32.from - 6 && t < l32.to + 6 ? { target: { x: p.x + 0.28 * p.h, y: p.y - 0.55 * p.h }, shape: "point" as const, elbow: "out" as const } : holdPaper(p).armR,
        };
      },
    },
    amir: {
      face: (t: number) => keys(t, [[0, toW(aP.x)], [standAt, toW(aP.x)], [standAt + 12, faceTo(yBase.x - 60, aP.x)], [l33.to, faceTo(yBase.x - 60, aP.x)], [l33.to + 12, toW(aP.x)], [l35.from - 6, toW(aP.x)], [l35.from + 6, toT(aP.x)], [l36.to + 10, toT(aP.x)], [l36.to + 24, toW(aP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(aP), expr: t > l34.from - 10 && t < l34.to + 10 ? ("curious" as const) : ("listening" as const), armR: t > l34.from - 6 && t < l34.to + 6 ? smallGesture(aP, 1) : kneeHands(aP).armR }),
    },
    bilal: {
      face: (t: number) => keys(t, [[0, toW(bP.x)], [standAt, toW(bP.x)], [standAt + 16, faceTo(yBase.x - 100, bP.x)], [l33.to, faceTo(yBase.x - 100, bP.x)], [l33.to + 16, toW(bP.x)], [l35.from - 6, toW(bP.x)], [l35.from + 8, toT(bP.x)], [l36.to + 12, toT(bP.x)], [l36.to + 26, toW(bP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(bP), expr: t > l36.from - 10 ? ("smile" as const) : ("focused" as const), armR: t > l36.from - 6 && t < l36.to + 6 ? smallGesture(bP, 1) : kneeHands(bP).armR }),
    },
    teacher: {
      place: () => tP,
      face: (t: number) => keys(t, [[0, faceTo(aP.x, tP.x)], [standAt, faceTo(aP.x, tP.x)], [standAt + 12, faceTo(yBase.x - 80, tP.x)], [l33.from + 10, faceTo(yBase.x - 80, tP.x)], [l33.from + 24, 0.85], [l34.to, 0.85], [l35.from - 6, faceTo(aP.x, tP.x)], [l36.from, faceTo(bP.x, tP.x)], [len, faceTo(bP.x, tP.x)]]),
      pose: (t: number) => ({
        expr: t > l31.from - 6 && t < l31.to + 10 ? ("softSmile" as const) : t > l33.from - 6 ? ("smile" as const) : ("calm" as const),
        crouch: keys(t, [[0, 0.55], [standAt, 0.55], [standAt + 30, 0.2], [sitAt, 0.2], [sitAt + 30, 0.55]]),
        lean: 5,
        // мягкий приглашающий жест низкой открытой ладонью — без хватания
        armR: t > l31.from - 6 && t < l31.to + 10 ? teacherGesture(tP, 0.3, -0.42) : t > l33.from - 4 && t < l33.to + 8 ? teacherGesture(tP, 0.34, -0.6) : t > l35.from - 6 && t < l35.to + 8 ? teacherGesture(tP, 0.22, -0.46) : teacherRest,
        armL: teacherRest,
        nod: keys(t, [[l33.from, 0], [l33.from + 6, 4], [l33.from + 16, 0]]),
      }),
    },
  };
  const attention = attentionByLines(
    [{ ...l30, id: 30, role: "yusuf" }, { ...l31, id: 31, role: "muhammad" }, { ...l32, id: 32, role: "yusuf" }, { ...l33, id: 33, role: "muhammad" }, { ...l34, id: 34, role: "amir" }, { ...l35, id: 35, role: "muhammad" }, { ...l36, id: 36, role: "bilal" }],
    [[0, standAt], [l33.to + 14, l34.from - 4], [l36.to + 24, len]],
    TEACHER_X,
  );
  // птица: взлёт через 0,7 с после реплики 33, полёт 1,9 с
  const takeoff = l33.to + 21;
  const shots: ShotSpec[] = [
    { kind: "room", from: 0, to: l30.to + 8, cam: (f) => camMove(f, 0, l30.to + 8, ROOM_CAM.group, { ...ROOM_CAM.group, x: 1150, zoom: 1.1 }) },
    { kind: "room", from: l30.to + 8, to: l31.to + 8, cam: (f) => camHold(f, ROOM_CAM.teacherMed) },
    { kind: "room", from: l31.to + 8, to: l32.to + 8, cam: (f) => camHold(f, { x: 1120, y: 900, zoom: 1.9 }) },
    { kind: "room", from: l32.to + 8, to: l33.to + 12, cam: (f) => camMove(f, l32.to + 8, l33.to + 12, ROOM_CAM.teacherWindow, { ...ROOM_CAM.teacherWindow, x: 1300, zoom: 0.92 }) },
    { kind: "tree", from: l33.to + 12, to: l34.from - 4, cam: (f) => camMove(f, takeoff, takeoff + 60, TREE_CAM.nestWide, { x: 900, y: 600, zoom: 0.9 }) },
    { kind: "room", from: l34.from - 4, to: l34.to + 8, cam: (f) => camHold(f, ROOM_CAM.amir) },
    { kind: "room", from: l34.to + 8, to: l35.to + 10, cam: (f) => camHold(f, ROOM_CAM.teacherCU) },
    { kind: "room", from: l35.to + 10, to: l36.to + 10, cam: (f) => camHold(f, ROOM_CAM.bilal) },
    { kind: "room", from: l36.to + 10, to: len, cam: (f) => camMove(f, l36.to + 10, len, ROOM_CAM.kidsWindow, { ...ROOM_CAM.kidsWindow, x: 1580, zoom: 1.1 }) },
  ];
  void lerp;
  return <Shots shots={shots} room={{ chars, attention }} />;
};
