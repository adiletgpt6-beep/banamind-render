// Сцена 3. «Кто показал птице?» Амир смотрит на поделку Юсуфа и вспоминает
// лодочку (пальцы будто сгибают бумагу). Юсуф смотрит в окно (птица
// поправляет материал), затем на учителя: «А её кто научил?» Учитель
// опускается к уровню глаз Юсуфа и объясняет. Билал уточняет; учитель чуть
// качает головой: «Нет. Птицы тоже могут учиться…» Юсуф проверяет, учитель
// тепло улыбается: «Да.» В конце сцены птица улетает за материалом.
import { ROOM_CAM } from "../cameraPresets";
import { camHold, camMove } from "../../core/shots";
import { MAIN } from "../../characters/characterConfig";
import { keys, keysV } from "../../rig/motion";
import { attentionByLines, faceTo, holdPaper, kneeHands, pupilPlace, Shots, smallGesture, teacherGesture, teacherPlace, teacherRest, TEACHER_X, useLines, WINDOW_X, type ShotSpec } from "../stage";

export const Scene03: React.FC = () => {
  const { L, len } = useLines();
  const l11 = L(11);
  const l12 = L(12);
  const l13 = L(13);
  const l14 = L(14);
  const l15 = L(15);
  const l16 = L(16);
  const l17 = L(17);
  const yP = pupilPlace(MAIN.yusuf);
  const aP = pupilPlace(MAIN.amir);
  const bP = pupilPlace(MAIN.bilal);
  const tP = { ...teacherPlace, x: teacherPlace.x + 190 };
  const toT = (x: number) => faceTo(tP.x, x);
  const crouchAt = l13.from - 34;
  const wordKto = l12.words[2]?.f ?? l12.from + 20; // «кто» — взгляд на учителя
  const chars = {
    yusuf: {
      face: (t: number) => keys(t, [[0, faceTo(aP.x, yP.x)], [l11.to + 4, faceTo(aP.x, yP.x)], [l11.to + 16, faceTo(WINDOW_X, yP.x)], [wordKto - 6, faceTo(WINDOW_X, yP.x)], [wordKto + 6, toT(yP.x)], [l17.to + 20, toT(yP.x)], [l17.to + 36, faceTo(WINDOW_X, yP.x)]]),
      pose: (t: number) => ({
        floorSit: 1,
        ...holdPaper(yP),
        expr: t > l12.from - 10 && t < l12.to + 10 ? ("curious" as const) : t > l16.from - 10 && t < l16.to + 10 ? ("curious" as const) : t > l17.from ? ("smile" as const) : ("listening" as const),
        headTilt: keys(t, [[l16.from - 10, 0], [l16.from, 7], [l16.to + 6, 7], [l16.to + 16, 0]]),
        lookY: keys(t, [[0, 0.2], [l11.to + 16, -0.2], [wordKto, -0.1]]),
      }),
    },
    amir: {
      face: (t: number) => keys(t, [[0, faceTo(yP.x, aP.x)], [l11.to + 10, faceTo(yP.x, aP.x)], [l11.to + 24, toT(aP.x)], [len, toT(aP.x)]]),
      pose: (t: number) => ({
        floorSit: 1,
        ...kneeHands(aP),
        expr: t < l11.to + 10 ? ("softSmile" as const) : ("listening" as const),
        lookY: keys(t, [[0, 0.45], [l11.from, 0.45], [l11.from + 10, 0.2], [l11.to + 10, 0.2], [l11.to + 24, 0]]),
        // вспоминает сгибание: пальцы правой руки у левой кисти, лёгкое движение
        armR: t > l11.from - 24 && t < l11.to + 8 ? { target: keysV(t, [[l11.from - 24, { x: aP.x + 0.12 * aP.h, y: aP.y - 0.1 * aP.h }], [l11.from - 10, { x: aP.x - 0.02 * aP.h, y: aP.y - 0.3 * aP.h }], [l11.from + 14, { x: aP.x + 0.05 * aP.h, y: aP.y - 0.33 * aP.h }], [l11.from + 34, { x: aP.x - 0.03 * aP.h, y: aP.y - 0.29 * aP.h }], [l11.to + 8, { x: aP.x + 0.12 * aP.h, y: aP.y - 0.1 * aP.h }]]), shape: "pinch" as const, elbow: "out" as const } : kneeHands(aP).armR,
        armL: t > l11.from - 24 && t < l11.to + 8 ? { target: { x: aP.x - 0.09 * aP.h, y: aP.y - 0.28 * aP.h }, shape: "open" as const, elbow: "out" as const } : kneeHands(aP).armL,
      }),
    },
    bilal: {
      face: (t: number) => keys(t, [[0, toT(bP.x)], [len, toT(bP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(bP), expr: t > l14.from - 20 && t < l14.to + 10 ? ("thinking" as const) : ("focused" as const), armR: t > l14.from - 6 && t < l14.to + 6 ? smallGesture(bP, 1) : kneeHands(bP).armR, headTilt: keys(t, [[l14.from - 16, 0], [l14.from - 4, -5], [l14.to + 6, -5], [l14.to + 16, 0]]) }),
    },
    teacher: {
      place: () => tP,
      face: (t: number) => keys(t, [[0, faceTo(aP.x, tP.x)], [l11.to + 10, faceTo(aP.x, tP.x)], [l12.from, faceTo(yP.x, tP.x)], [l13.to, faceTo(yP.x, tP.x)], [l14.from - 6, faceTo(bP.x, tP.x)], [l15.to, faceTo(bP.x, tP.x)], [l16.from - 6, faceTo(yP.x, tP.x)], [len, faceTo(yP.x, tP.x)]]),
      pose: (t: number) => ({
        expr: t > l17.from - 8 ? ("smile" as const) : t > l15.from - 6 && t < l15.to ? ("calm" as const) : t > l12.from ? ("listening" as const) : ("calm" as const),
        crouch: keys(t, [[crouchAt, 0], [crouchAt + 28, 0.55]]),
        lean: keys(t, [[crouchAt, 0], [crouchAt + 28, 6]]),
        // «Нет» — лёгкое покачивание головой
        headTilt: keys(t, [[l15.from - 2, 0], [l15.from + 4, -4], [l15.from + 10, 4], [l15.from + 16, -2], [l15.from + 22, 0]]),
        armR: t > l13.from - 6 && t < l13.to + 10 ? teacherGesture(tP, 0.22, -0.46) : t > l15.from + 20 && t < l15.to + 8 ? teacherGesture(tP, 0.24, -0.5) : teacherRest,
        armL: t > l13.from + 40 && t < l13.to + 10 ? teacherGesture(tP, -0.2, -0.42) : teacherRest,
        nod: keys(t, [[l17.from - 4, 0], [l17.from + 4, 5], [l17.from + 14, 0]]),
      }),
    },
  };
  const attention = attentionByLines(
    [{ ...l11, id: 11, role: "amir" }, { ...l12, id: 12, role: "yusuf" }, { ...l13, id: 13, role: "muhammad" }, { ...l14, id: 14, role: "bilal" }, { ...l15, id: 15, role: "muhammad" }, { ...l16, id: 16, role: "yusuf" }, { ...l17, id: 17, role: "muhammad" }],
    [[l11.to + 12, l12.from - 2], [l17.to + 40, len]],
    TEACHER_X,
  );
  const shots: ShotSpec[] = [
    { kind: "room", from: 0, to: l11.from - 8, cam: (f) => camHold(f, ROOM_CAM.kids) },
    { kind: "room", from: l11.from - 8, to: l11.to + 10, cam: (f) => camHold(f, ROOM_CAM.amir) },
    { kind: "room", from: l11.to + 10, to: wordKto - 10, cam: (f) => camMove(f, l11.to + 10, wordKto - 10, ROOM_CAM.kidsWindow, { ...ROOM_CAM.kidsWindow, x: 1560, zoom: 1.18 }) },
    { kind: "room", from: wordKto - 10, to: l12.to + 10, cam: (f) => camHold(f, ROOM_CAM.yusuf) },
    { kind: "room", from: l12.to + 10, to: l13.to + 10, cam: (f) => camMove(f, l12.to + 10, l13.to + 10, { x: 980, y: 980, zoom: 1.15 }, { x: 1000, y: 985, zoom: 1.2 }) },
    { kind: "room", from: l13.to + 10, to: l14.to + 8, cam: (f) => camHold(f, ROOM_CAM.bilal) },
    { kind: "room", from: l14.to + 8, to: l15.to + 10, cam: (f) => camHold(f, ROOM_CAM.teacherCU) },
    { kind: "room", from: l15.to + 10, to: l16.to + 8, cam: (f) => camHold(f, ROOM_CAM.yusuf) },
    { kind: "room", from: l16.to + 8, to: l17.to + 30, cam: (f) => camHold(f, ROOM_CAM.teacherCU) },
    { kind: "room", from: l17.to + 30, to: len, cam: (f) => camMove(f, l17.to + 30, len, ROOM_CAM.kidsWindow, { ...ROOM_CAM.kidsWindow, x: 1600, zoom: 1.1 }) },
  ];
  return <Shots shots={shots} room={{ chars, attention }} />;
};
