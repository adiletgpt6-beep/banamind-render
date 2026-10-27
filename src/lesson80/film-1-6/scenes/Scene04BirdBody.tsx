// Сцена 4. «Клюв, лапки и крылья». Крупно за окном: птица поворачивает
// голову, опускает её, подхватывает травинку клювом — материал движется с
// клювом. Перелёт вверх к гнезду; на ветке чётко видны пальцы, охватившие
// ветку (Билал). Укладка, затем взлёт за новым материалом (Амир о крыльях).
// Учитель объясняет; Юсуф смотрит на свою поделку: «Ей не нужны ножницы?»
// Учитель отвечает; птица подхватывает следующую травинку.
import { ROOM_CAM, TREE_CAM } from "../cameraPresets";
import { camHold, camMove } from "../../core/shots";
import { MAIN } from "../../characters/characterConfig";
import { keys, keysV } from "../../rig/motion";
import { TREE } from "../../sets/treeLayout";
import { attentionByLines, faceTo, holdPaper, kneeHands, pupilPlace, Shots, smallGesture, teacherGesture, teacherPlace, teacherRest, useLines, WINDOW_X, type ShotSpec } from "../stage";

export const Scene04: React.FC = () => {
  const { L, len } = useLines();
  const l18 = L(18);
  const l19 = L(19);
  const l20 = L(20);
  const l21 = L(21);
  const l22 = L(22);
  const l23 = L(23);
  const yP = pupilPlace(MAIN.yusuf);
  const aP = pupilPlace(MAIN.amir);
  const bP = pupilPlace(MAIN.bilal);
  const tP = { ...teacherPlace, x: teacherPlace.x + 190 };
  const toT = (x: number) => faceTo(tP.x, x);
  const toW = (x: number) => faceTo(WINDOW_X, x);
  // птица: взлёт с земли через 0,3 с после реплики 18 (1,8 с), посадка 0,5 с
  const flyUp = l18.to + 9;
  const landed = flyUp + 54 + 15;
  const chars = {
    yusuf: {
      face: (t: number) => keys(t, [[0, toW(yP.x)], [l21.to, toW(yP.x)], [l22.from - 30, toW(yP.x)], [l22.from - 20, toW(yP.x) * 0.3], [l22.from + 20, toW(yP.x) * 0.3], [l22.from + 30, toT(yP.x)], [l23.to + 10, toT(yP.x)], [l23.to + 24, toW(yP.x)]]),
      pose: (t: number) => ({
        floorSit: 1,
        ...holdPaper(yP),
        expr: t > l22.from - 20 && t < l22.to + 10 ? ("curious" as const) : ("listening" as const),
        lookY: keys(t, [[l22.from - 30, -0.1], [l22.from - 20, 0.55], [l22.from + 20, 0.55], [l22.from + 30, -0.1]]),
        // трогает край поделки
        armR: t > l22.from - 26 && t < l22.from + 24 ? { target: keysV(t, [[l22.from - 26, { x: yP.x + 0.1 * yP.h, y: yP.y - 0.26 * yP.h }], [l22.from - 14, { x: yP.x + 0.02 * yP.h, y: yP.y - 0.3 * yP.h }], [l22.from + 4, { x: yP.x + 0.08 * yP.h, y: yP.y - 0.29 * yP.h }], [l22.from + 24, { x: yP.x + 0.1 * yP.h, y: yP.y - 0.26 * yP.h }]]), shape: "pinch" as const, elbow: "out" as const } : holdPaper(yP).armR,
      }),
    },
    amir: {
      face: (t: number) => keys(t, [[0, toW(aP.x)], [l21.from - 6, toW(aP.x)], [l21.from + 6, toT(aP.x)], [l23.to + 10, toT(aP.x)], [l23.to + 24, toW(aP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(aP), expr: t > l20.from - 10 && t < l20.to + 10 ? ("smile" as const) : ("listening" as const), armR: t > l20.from - 6 && t < l20.to + 6 ? smallGesture(aP, 1) : kneeHands(aP).armR }),
    },
    bilal: {
      face: (t: number) => keys(t, [[0, toW(bP.x)], [l21.from - 6, toW(bP.x)], [l21.from + 6, toT(bP.x)], [l23.to + 10, toT(bP.x)], [l23.to + 24, toW(bP.x)]]),
      pose: (t: number) => ({ floorSit: 1, ...kneeHands(bP), expr: "focused" as const, armR: t > l19.from - 6 && t < l19.to + 6 ? smallGesture(bP, 1) : kneeHands(bP).armR }),
    },
    teacher: {
      place: () => tP,
      face: (t: number) => keys(t, [[0, 0.85], [l20.to, 0.85], [l21.from - 8, faceTo(1240, tP.x)], [l22.from, faceTo(yP.x, tP.x)], [len, faceTo(yP.x, tP.x)]]),
      pose: (t: number) => ({
        expr: t > l23.from - 6 ? ("softSmile" as const) : ("calm" as const),
        crouch: 0.55,
        lean: 6,
        armR: t > l18.from - 8 && t < l18.to + 10 ? teacherGesture(tP, 0.32, -0.6) : t > l21.from - 6 && t < l21.to + 8 ? teacherGesture(tP, 0.22, -0.46) : teacherRest,
        armL: t > l21.from + 30 && t < l21.to + 8 ? teacherGesture(tP, -0.18, -0.42) : teacherRest,
        nod: keys(t, [[l21.from, 0], [l21.from + 6, 4], [l21.from + 16, 0]]),
      }),
    },
  };
  const attention = attentionByLines([{ ...l21, id: 21, role: "muhammad" }, { ...l22, id: 22, role: "yusuf" }, { ...l23, id: 23, role: "muhammad" }], [[0, l21.from - 6], [l23.to + 24, len]], WINDOW_X);
  const feetCam = { x: TREE.perchNest.x + 40, y: TREE.perchNest.y - 40, zoom: 2.6 };
  const shots: ShotSpec[] = [
    { kind: "tree", from: 0, to: l18.to + 9, cam: (f) => camMove(f, 0, l18.to + 9, TREE_CAM.ground, { ...TREE_CAM.ground, zoom: 2.2 }) },
    { kind: "tree", from: l18.to + 9, to: landed - 4, cam: (f) => camMove(f, flyUp, landed, TREE_CAM.flightUp, { x: 1300, y: 760, zoom: 1.1 }) },
    { kind: "tree", from: landed - 4, to: l19.to + 10, cam: (f) => camMove(f, landed - 4, l19.to + 10, feetCam, { ...feetCam, zoom: 2.8 }) },
    { kind: "tree", from: l19.to + 10, to: l20.from - 4, cam: (f) => camHold(f, TREE_CAM.nest, 0.002) },
    { kind: "tree", from: l20.from - 4, to: l20.to + 14, cam: (f) => camMove(f, l20.from - 4, l20.to + 14, TREE_CAM.nestWide, TREE_CAM.flight) },
    { kind: "room", from: l20.to + 14, to: l21.to + 8, cam: (f) => camHold(f, ROOM_CAM.teacherMed) },
    { kind: "room", from: l21.to + 8, to: l22.to + 8, cam: (f) => camHold(f, ROOM_CAM.yusuf) },
    { kind: "room", from: l22.to + 8, to: l23.from + 28, cam: (f) => camHold(f, ROOM_CAM.teacherMed) },
    { kind: "tree", from: l23.from + 28, to: len, cam: (f) => camMove(f, l23.from + 28, len, TREE_CAM.ground, { ...TREE_CAM.ground, zoom: 2.3, x: TREE.grassSpot.x + 90 }) },
  ];
  return <Shots shots={shots} room={{ chars, attention }} />;
};
