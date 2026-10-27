// Режиссура урока 1: планы и камера, позы и взгляды персонажей, действия
// с предметами, появление карточек на доске. Всё рассчитывается от
// временной шкалы (timeline.ts) — по фактическим границам речи.
import React from "react";
import { blinkAt, exprTrack, type Expr, type Key, lookAt, numTrack, poseTrack, speakingMouth, track } from "./anim";
import { HERO_SEATS, SEATS, TABLE, TEACHER_SPOT, scaleAt } from "./layout";
import { type P, add, clamp, dir, easeInOut, hash01, lerp, lerpP, mul, strSeed } from "./rig/geom";
import { solveRig } from "./rig/Character";
import { AMIR, BILAL, EXTRA_KIDS, type Look, TEACHER, YUSUF } from "./rig/looks";
import { type ArmPose, type Face, type Pose } from "./rig/pose";
import { kneel, sitCross, stand, toLocal } from "./rig/presets";
import { CUBE, HOUSE_PARTS, HousePiece, type PartState, ToyTree } from "./sets/Props";
import type { CardId } from "./sets/Board";
import type { Timeline } from "./timeline";
import { type CharState, HOUSE_X, houseBaseY, TOYBOX_X, TOYBOX_Y, type WorldState } from "./World";

export type Cam = { cx: number; cy: number; w: number };
export type SetKind = "world" | "exterior" | "home" | "plate";
export type PlateKind = "tree" | "treeStone" | "sky" | "earth" | "sun" | "night" | "finalTree";
export type Shot = { from: number; to: number; set: SetKind; cam?: Key<Cam>[]; plate?: PlateKind; memory?: boolean; fade?: number };

const mixCam = (a: Cam, b: Cam, u: number): Cam => ({ cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), w: lerp(a.w, b.w, u) });
export const camAt = (s: Shot, t: number): Cam => (s.cam ? track(s.cam, t, mixCam) : { cx: 960, cy: 540, w: 1920 });

// ---------- Опорные точки комнаты ----------
const TS = scaleAt(TABLE.floorY);
const HB = { x: HOUSE_X, y: houseBaseY() }; // основание домика (мир)
const housePt = (p: P): P => ({ x: HB.x + p.x * TS, y: HB.y + p.y * TS });
export const PTS = {
  house: { x: HB.x + 10, y: HB.y - 50 },
  board: { x: 900, y: 560 },
  boardPeople: { x: 1330, y: 520 },
  window: { x: 2740, y: 560 },
  camera: { x: 1920, y: 1400 },
};

// ---------- Действующие лица ----------
const seatOf = (i: number) => SEATS[i];
const kidsOrder: { look: Look; seat: number; hero?: "yusuf" | "amir" | "bilal" }[] = (() => {
  const heroAt: Record<number, { look: Look; hero: "yusuf" | "amir" | "bilal" }> = {
    [HERO_SEATS.yusuf]: { look: YUSUF, hero: "yusuf" },
    [HERO_SEATS.amir]: { look: AMIR, hero: "amir" },
    [HERO_SEATS.bilal]: { look: BILAL, hero: "bilal" },
  };
  let k = 0;
  return SEATS.map((_, i) => (heroAt[i] ? { ...heroAt[i], seat: i } : { look: EXTRA_KIDS[k++].look, seat: i }));
})();

const headWorld = (look: Look, pose: Pose, root: P) => {
  const r = solveRig(look, pose);
  const s = scaleAt(root.y);
  return { x: root.x + r.headC.x * s, y: root.y + r.headC.y * s };
};

// Позы-заготовки героев
const Y_ROOT = { x: seatOf(HERO_SEATS.yusuf).x, y: seatOf(HERO_SEATS.yusuf).y };
const A_ROOT = { x: seatOf(HERO_SEATS.amir).x, y: seatOf(HERO_SEATS.amir).y };
const B_ROOT = { x: seatOf(HERO_SEATS.bilal).x, y: seatOf(HERO_SEATS.bilal).y };
const T_ROOT = TEACHER_SPOT;

const ySit = sitCross(YUSUF, -0.42);
const aSit = sitCross(AMIR, -0.4);
const bSit = sitCross(BILAL, -0.45);
const tStand = stand(TEACHER, 0.45);
const tKneel = kneel(TEACHER, 0.5);

const withArms = (p: Pose, armL?: Partial<ArmPose>, armR?: Partial<ArmPose>, extra: Partial<Pose> = {}): Pose => ({
  ...p,
  armL: armL ? { ...p.armL, ...armL } : p.armL,
  armR: armR ? { ...p.armR, ...armR } : p.armR,
  ...extra,
});

// плечо → локальная точка для жестов
const shoulderY = (look: Look, p: Pose) => solveRig(look, p).shoulderC.y;

// Учитель: жесты
const tGestureKids = (p: Pose) => withArms(p, { target: { x: 120, y: shoulderY(TEACHER, p) + 150 }, bend: 1, hand: "palmUp", handRot: 0, handAbs: 105, front: true });
const tGestureBoard = (p: Pose) =>
  withArms(p, { target: { x: -230, y: shoulderY(TEACHER, p) - 60 }, bend: -1, hand: "open", handRot: 0, handAbs: -115, front: true }, undefined, { headYaw: -0.45, bodyYaw: 0.25 });
const tGestureWindow = (p: Pose) => withArms(p, undefined, { target: { x: 250, y: shoulderY(TEACHER, p) - 90 }, bend: 1, hand: "open", handRot: 0, handAbs: 120 }, { headYaw: 0.6 });

// Юсуф: наклон к домику, ладони перед собой
const yLean = withArms(ySit, undefined, undefined, { lean: -9, headYaw: -0.55 });
const yPalms = (() => {
  const sy = shoulderY(YUSUF, ySit);
  return withArms(
    ySit,
    { target: { x: -34, y: sy + 66 }, bend: 1, hand: "open", handRot: 0, handAbs: 168, front: true, palm: true },
    { target: { x: 40, y: sy + 68 }, bend: -1, hand: "open", handRot: 0, handAbs: -168, front: true, palm: true },
    { headPitch: 0.55, headYaw: -0.15, lean: -3 },
  );
})();
// Билал поднимает руку: плечо → локоть → кисть над головой
const bRaise = (() => {
  const r = solveRig(BILAL, bSit);
  return withArms(bSit, undefined, { target: { x: r.shoulderR.x + 18, y: r.headC.y - 120 }, bend: 1, hand: "open", handRot: 180, palm: true, front: true });
})();
// Подготовка к подъёму (сцена 4): наклон вперёд, ладони на ковре
const riseLean = (look: Look, p: Pose): Pose => {
  const b = look.body;
  return withArms(
    p,
    { target: { x: -b.thigh * 0.7, y: -b.legW * 0.3 }, bend: 1, hand: "flat", handRot: 0 },
    { target: { x: b.thigh * 0.4, y: -b.legW * 0.3 }, bend: -1, hand: "flat", handRot: 0 },
    { lean: p.lean + 14, hip: { x: p.hip.x, y: p.hip.y - b.legW * 0.5 } },
  );
};

// ---------- Действия с предметами ----------
// Перенос: подход кисти сверху, захват, подъём, перенос, установка, отпускание.
type Carry = { t0: number; from: P; to: P; rest: P; lift: number };
const carryPhase = (c: Carry, t: number) => {
  const T = [0, 0.55, 0.8, 1.1, 1.85, 2.15, 2.45, 2.95];
  const u = t - c.t0;
  const above = (p: P) => ({ x: p.x, y: p.y - c.lift });
  let grip: P;
  let holding = false;
  let w = 1;
  if (u < T[0]) return { grip: c.rest, holding: false, w: 0, placed: false };
  if (u < T[1]) {
    const k = easeInOut(u / T[1]);
    grip = lerpP(c.rest, above(c.from), k);
    w = k;
  } else if (u < T[2]) grip = lerpP(above(c.from), c.from, easeInOut((u - T[1]) / (T[2] - T[1])));
  else if (u < T[3]) {
    holding = true;
    grip = lerpP(c.from, above(c.from), easeInOut((u - T[2]) / (T[3] - T[2])));
  } else if (u < T[4]) {
    holding = true;
    const k = easeInOut((u - T[3]) / (T[4] - T[3]));
    const a = above(c.from);
    const b = above(c.to);
    grip = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) - Math.sin(k * Math.PI) * c.lift * 0.35 };
  } else if (u < T[5]) {
    holding = true;
    grip = lerpP(above(c.to), c.to, easeInOut((u - T[4]) / (T[5] - T[4])));
  } else if (u < T[6]) grip = lerpP(c.to, above(c.to), easeInOut((u - T[5]) / (T[6] - T[5])));
  else if (u < T[7]) {
    const k = easeInOut((u - T[6]) / (T[7] - T[6]));
    grip = lerpP(above(c.to), c.rest, k);
    w = 1 - k;
  } else return { grip: c.rest, holding: false, w: 0, placed: true };
  return { grip, holding, w, placed: u >= T[5] };
};
export const CARRY_DUR = 2.95;

// Точка захвата на детали (в координатах домика): верх кубика / конёк крыши.
const gripOffset = (id: string): P => {
  if (id === "roof") return { x: 0, y: -CUBE * 1.15 };
  return { x: CUBE / 2 + CUBE * 0.17, y: -CUBE - CUBE * 0.15 };
};

// ---------- Построение режиссуры ----------
export const buildDirection = (T: Timeline) => {
  const S = T.seg;
  const H = T.hold;
  const sc = T.scenes;

  // Слова внутри реплики (по таймингам; без озвучки — пропорционально).
  const wordAt = (seg: string, word: string, fallback: number) => {
    const s = S[seg];
    const w = s.m.words.find((x) => x.text.replace(/[^\p{L}]/gu, "").toLowerCase() === word.toLowerCase());
    return w ? s.fileStart + w.start : s.start + (s.end - s.start) * fallback;
  };

  // ---- Планы ----
  const shots: Shot[] = [];
  const shot = (from: number, to: number, set: SetKind, cams: (Cam & { at?: number; dur?: number })[], extra: Partial<Shot> = {}) => {
    const cam: Key<Cam>[] = cams.map((c, i) => ({ at: c.at ?? (i === 0 ? from : from), v: { cx: c.cx, cy: c.cy, w: c.w }, dur: c.dur }));
    shots.push({ from, to, set, cam, ...extra });
  };
  const fixed = (from: number, to: number, c: Cam, extra: Partial<Shot> = {}) => shot(from, to, "world", [{ ...c }], extra);
  const drift = (from: number, to: number, a: Cam, b: Cam, extra: Partial<Shot> = {}) =>
    shot(from, to, "world", [{ ...a, at: from }, { ...b, at: from, dur: to - from }], { ...extra });

  // Кадры по измеренным положениям голов (сидя/на коленях): голова — в
  // верхней трети, свободное место — в сторону взгляда.
  const CU = {
    house: { cx: 1585, cy: 1768, w: 430 },
    roof: { cx: 1574, cy: 1742, w: 250 },
    yusufAmir: { cx: 2060, cy: 1835, w: 1000 },
    yusuf: { cx: 1805, cy: 1868, w: 620 },
    amir: { cx: 2195, cy: 1805, w: 640 },
    bilal: { cx: 2030, cy: 1625, w: 640 },
    teacherK: { cx: 1380, cy: 1650, w: 820 },
    teacherS: { cx: 1380, cy: 1360, w: 1050 },
    teacherTable: { cx: 1560, cy: 1720, w: 1250 },
    two: { cx: 1690, cy: 1690, w: 1300 },
    wide: { cx: 2350, cy: 1385, w: 2750 },
    board1: { cx: 560, cy: 520, w: 760 },
    board2: { cx: 640, cy: 520, w: 940 },
    board: { cx: 900, cy: 540, w: 1380 },
    boardWide: { cx: 1450, cy: 1060, w: 2900 },
    kids: { cx: 2080, cy: 1760, w: 1050 },
    treePlace: { cx: 1760, cy: 1900, w: 760 },
    window: { cx: 2740, cy: 560, w: 950 },
    tableKids: { cx: 1720, cy: 1740, w: 1450 },
  };


  // Сцена 1
  drift(0, H.houseDetail.end, CU.house, { cx: 1585, cy: 1762, w: 520 });
  drift(H.reveal.start, S.L01.start - 0.05, { cx: 1585, cy: 1762, w: 520 }, CU.yusufAmir);
  fixed(S.L01.start - 0.05, H.teacherKneel.start - 0.2, CU.yusufAmir);
  shot(H.teacherKneel.start - 0.2, S.L04.start - 0.2, "world", [
    { cx: 1560, cy: 1560, w: 1500, at: 0 },
    { ...CU.teacherTable, at: H.teacherKneel.start + 0.2, dur: 1.2 },
  ]);
  fixed(S.L04.start - 0.2, S.L05.start - 0.25, CU.wide);
  fixed(S.L05.start - 0.25, H.title.start - 0.3, CU.teacherTable);
  drift(H.title.start - 0.3, sc.self.start + 0.25, { cx: 1585, cy: 1740, w: 1100 }, { cx: 1585, cy: 1745, w: 1000 });

  // Сцена 2
  fixed(sc.self.start + 0.25, S.L06.end + 0.2, CU.yusuf);
  fixed(S.L06.end + 0.2, wordAt("L07", "Вот", 0.38) - 0.35, CU.teacherK);
  shot(wordAt("L07", "Вот", 0.38) - 0.35, H.cardAfter.end, "world", [
    { ...CU.board1, at: 0 },
    { ...CU.board2, at: H.cardAfter.start - 0.2, dur: 0.9 },
  ], { fade: 0.35 });
  fixed(S.L08.start - 0.25, S.L08.end + 0.3, CU.bilal);
  fixed(S.L08.end + 0.3, H.keyThought.end, CU.boardWide);
  fixed(H.keyThought.end, S.L10.end + 0.3, CU.amir);
  fixed(S.L10.end + 0.3, sc.builder.start + 0.2, CU.tableKids);

  // Сцена 3: воспоминание через ту же красную крышу
  fixed(sc.builder.start + 0.2, H.toMemory.start, CU.teacherK);
  drift(H.toMemory.start, H.memory.start + 0.3, { cx: 1560, cy: 1745, w: 700 }, CU.roof);
  const m0 = H.memory.start;
  drift(m0, m0 + 2.4, CU.roof, { cx: 1450, cy: 1640, w: 1400 }, { memory: true, fade: 0.6 });
  fixed(m0 + 2.4, m0 + 9.2, { cx: 1450, cy: 1690, w: 1050 }, { memory: true });
  drift(m0 + 9.2, H.memory.end, { cx: 1545, cy: 1745, w: 640 }, { cx: 1560, cy: 1748, w: 560 }, { memory: true });
  drift(H.fromMemory.start, H.fromMemory.end, { cx: 1570, cy: 1745, w: 280 }, { cx: 1600, cy: 1760, w: 520 }, { fade: 0.5 });
  fixed(H.recognize.start, S.L13.end + 0.25, CU.yusuf);
  fixed(S.L13.end + 0.25, S.L14.end + 0.3, CU.teacherK);
  fixed(S.L14.end + 0.3, S.L15.end + 0.3, CU.bilal);
  fixed(S.L15.end + 0.3, sc.world.start, CU.two);

  // Сцена 4: окно и природа
  fixed(sc.world.start, H.toWindow.start, { cx: 1560, cy: 1560, w: 1500 });
  drift(H.toWindow.start, H.toWindow.end, { cx: 2150, cy: 1150, w: 3500 }, { cx: 2250, cy: 1100, w: 3300 });
  shots.push({ from: H.toWindow.end, to: S.L18.start, set: "exterior" });
  shots.push({ from: S.L18.start, to: S.L19.start - 0.1, set: "plate", plate: "tree", fade: 0.3 });
  shots.push({ from: S.L19.start - 0.1, to: S.L20.start, set: "plate", plate: "sky", fade: 0.3 });
  const wNo = wordAt("L20", "Но", 0.32);
  const wEarth = wordAt("L20", "Земля", 0.72);
  const wSun = wordAt("L20", "солнце", 0.84);
  const wStars = wordAt("L20", "звёзды", 0.92);
  shots.push({ from: S.L20.start, to: wNo - 0.1, set: "exterior", fade: 0.3 });
  shots.push({ from: wNo - 0.1, to: wEarth - 0.15, set: "plate", plate: "treeStone", fade: 0.3 });
  // Земля, солнце, звёзды: картинки идут за голосом и держатся по ≈2 с
  void wSun;
  void wStars;
  const tour = wEarth - 0.15;
  shots.push({ from: tour, to: tour + 2.1, set: "plate", plate: "earth", fade: 0.3 });
  shots.push({ from: tour + 2.1, to: tour + 4.3, set: "plate", plate: "sun", fade: 0.4 });
  shots.push({ from: tour + 4.3, to: H.nightLook.end, set: "plate", plate: "night", fade: 0.5 });
  shots.push({ from: H.nightLook.end, to: H.toBoard.start, set: "exterior", fade: 0.4 });

  // Сцена 5: главный вопрос
  const wWorld = wordAt("L24", "Мир", 0.5);
  shot(H.toBoard.start, S.L25.start - 0.1, "world", [
    { ...CU.board2, at: 0 },
    { ...CU.board, at: wWorld - 0.3, dur: 1.0 },
  ], { fade: 0.4 });
  fixed(S.L25.start - 0.1, H.pause1.start + 0.6, CU.boardWide);
  fixed(H.pause1.start + 0.6, H.pause1.end - 0.9, CU.kids);
  fixed(H.pause1.end - 0.9, S.L26.end + 0.35, CU.yusuf);
  const wCreator = wordAt("L27", "Наш", 0.6);
  fixed(S.L26.end + 0.35, wCreator - 0.3, CU.teacherS);
  drift(wCreator - 0.3, sc.parents.start, { cx: 2050, cy: 1280, w: 2900 }, { cx: 2050, cy: 1270, w: 2850 });

  // Сцена 6: мама и папа
  fixed(sc.parents.start, S.L28.end + 0.2, CU.amir);
  const wFirst = wordAt("L29", "А", 0.45);
  const wWorld2 = wordAt("L29", "И", 0.78);
  shots.push({ from: S.L28.end + 0.2, to: wFirst - 0.1, set: "home", fade: 0.35 });
  drift(wFirst - 0.1, wWorld2 - 0.1, { cx: 1220, cy: 520, w: 720 }, { cx: 1220, cy: 520, w: 660 }, { fade: 0.35 });
  fixed(wWorld2 - 0.1, S.L30.start - 0.15, { cx: 2300, cy: 1250, w: 3000 });
  fixed(S.L30.start - 0.15, S.L30.end + 0.3, CU.bilal);
  fixed(S.L30.end + 0.3, sc.whoAllah.start, { cx: 1560, cy: 1560, w: 1500 });

  // Сцена 7: Кто создал Аллаха?
  fixed(sc.whoAllah.start, S.L32.end + 0.25, { cx: 1700, cy: 1640, w: 1350 });
  fixed(S.L32.end + 0.25, H.beforeYusuf.start + 0.2, CU.two);
  fixed(H.beforeYusuf.start + 0.2, S.L34.end + 0.3, CU.yusuf);
  fixed(S.L34.end + 0.3, sc.answer.start, { cx: 1380, cy: 1660, w: 980 });

  // Сцена 8: ответ
  fixed(sc.answer.start, S.L36.end + 0.3, CU.teacherK);
  fixed(S.L36.end + 0.3, S.L37.start - 0.1, { cx: 1720, cy: 1690, w: 1450 });
  fixed(S.L37.start - 0.1, S.L38.start - 0.3, CU.wide);
  fixed(S.L38.start - 0.3, S.L38.end + 0.3, CU.teacherK);
  fixed(S.L38.end + 0.3, H.pause3.end, { cx: 1720, cy: 1690, w: 1450 });
  fixed(S.L39.start, S.L39.end + 0.25, CU.amir);
  fixed(H.placeTree.start, S.L40.start + 0.3, CU.treePlace);
  const wWorld3 = wordAt("L40", "Мир", 0.7);
  const wCreator2 = wordAt("L40", "Его", 0.85);
  fixed(S.L40.start + 0.3, wWorld3 - 0.4, CU.teacherK);
  shot(wWorld3 - 0.4, wCreator2 + 0.3, "world", [
    { cx: 1650, cy: 1770, w: 560, at: wWorld3 - 0.4 },
    { ...CU.window, at: wWorld3 + 0.5, dur: wCreator2 - wWorld3 - 0.4 },
  ]);
  shots.push({ from: wCreator2 + 0.3, to: T.total + 1, set: "plate", plate: "finalTree", fade: 0.7 });
  shots.sort((a, b) => a.from - b.from);

  // ---- Карточки на доске ----
  const wVot = wordAt("L07", "Вот", 0.38);
  const cardKeys: Record<CardId, number> = {
    before: wVot,
    after: H.cardAfter.start,
    earth: wWorld,
    people: S.L25.start + 0.3,
  };
  const cards = (t: number) => {
    const o: Partial<Record<CardId, number>> = {};
    (Object.keys(cardKeys) as CardId[]).forEach((k) => {
      o[k] = clamp((t - cardKeys[k]) / 0.6);
    });
    return o;
  };

  // ---- Внимание класса ----
  const tHeadKneel = headWorld(TEACHER, tKneel, T_ROOT);
  const tHeadStand = headWorld(TEACHER, tStand, T_ROOT);
  const heads = {
    yusuf: headWorld(YUSUF, ySit, Y_ROOT),
    amir: headWorld(AMIR, aSit, A_ROOT),
    bilal: headWorld(BILAL, bSit, B_ROOT),
  };

  // Поза учителя по времени
  const kneelAt = H.teacherKneel.start;
  const standW = sc.world.start + 0.1; // встаёт на «Теперь посмотрите в окно»
  const tKeys: Key<Pose>[] = [
    { at: 0, v: tStand },
    { at: kneelAt, v: tKneel, dur: 1.0 },
    { at: S.L03.start + 0.2, v: tGestureKids(tKneel), dur: 0.6 },
    { at: S.L03.end - 0.2, v: tKneel, dur: 0.7 },
    { at: S.L05.start + 0.4, v: tGestureKids(tKneel), dur: 0.7 },
    { at: S.L05.end - 0.3, v: tKneel, dur: 0.8 },
    { at: S.L07.start + 0.3, v: tGestureBoard(tKneel), dur: 0.8 },
    { at: H.cardAfter.end - 0.4, v: tKneel, dur: 0.8 },
    { at: S.L09.start, v: tGestureKids(tKneel), dur: 0.6 },
    { at: S.L09.end, v: tKneel, dur: 0.8 },
    { at: S.L11.start, v: tGestureKids(tKneel), dur: 0.6 },
    { at: S.L11.end, v: tKneel, dur: 0.8 },
    { at: S.L12.start + 0.2, v: tGestureKids(tKneel), dur: 0.6 },
    { at: S.L12.end, v: tKneel, dur: 0.8 },
    { at: S.L14.start + 0.3, v: tGestureKids(tKneel), dur: 0.6 },
    { at: S.L14.end, v: tKneel, dur: 0.8 },
    { at: standW, v: tStand, dur: 1.1 },
    { at: S.L17.start + 0.9, v: tGestureWindow(tStand), dur: 0.7 },
    { at: H.toWindow.end - 0.2, v: tStand, dur: 0.5 },
    // сцена 5 — у доски стоя
    { at: S.L24.start, v: tGestureBoard(tStand), dur: 0.7 },
    { at: S.L25.start + 1.2, v: tStand, dur: 0.8 },
    { at: S.L27.start + 0.2, v: tGestureKids(tStand), dur: 0.6 },
    { at: S.L27.end - 0.2, v: tStand, dur: 0.8 },
    { at: S.L29.start, v: tGestureKids(tStand), dur: 0.6 },
    { at: S.L29.end, v: tStand, dur: 0.8 },
    // присаживается к детям перед вопросом Билала
    { at: S.L31.end + 0.1, v: tKneel, dur: 1.0 },
    { at: S.L33a.start + 0.3, v: tGestureKids(tKneel), dur: 0.6 },
    { at: S.L33a.end, v: tKneel, dur: 0.8 },
    { at: S.L35.start + 0.4, v: tGestureKids(tKneel), dur: 0.6 },
    { at: S.L35.end, v: tKneel, dur: 0.8 },
    // финал — к классу и к зрителю
    { at: sc.answer.start, v: { ...kneel(TEACHER, 0.18) }, dur: 0.9 },
    { at: S.L36.start + 0.2, v: tGestureKids(kneel(TEACHER, 0.18)), dur: 0.6 },
    { at: S.L36.end + 0.5, v: kneel(TEACHER, 0.18), dur: 0.8 },
    { at: S.L38.start + 0.2, v: tGestureKids(kneel(TEACHER, 0.18)), dur: 0.6 },
    { at: S.L38.end + 0.5, v: kneel(TEACHER, 0.18), dur: 0.8 },
    { at: S.L40.start + 0.4, v: tGestureKids(kneel(TEACHER, 0.18)), dur: 0.7 },
    { at: S.L40.end - 1.5, v: kneel(TEACHER, 0.18), dur: 1 },
  ];
  const tHeadAt = (t: number) => {
    const k = numTrack(
      [
        { at: 0, v: 1 },
        { at: kneelAt, v: 0, dur: 1 },
        { at: standW, v: 1, dur: 1.1 },
        { at: S.L31.end + 0.1, v: 0, dur: 1 },
      ],
      t,
    );
    return lerpP(tHeadKneel, tHeadStand, k);
  };

  // Кто говорит
  const speakerHead = (role: string, t: number): P => {
    if (role === "teacher") return tHeadAt(t);
    if (role === "yusuf") return heads.yusuf;
    if (role === "amir") return heads.amir;
    if (role === "bilal") return heads.bilal;
    return tHeadAt(t);
  };
  // Цель внимания класса (без индивидуальной задержки)
  const attnKeys: Key<P>[] = [{ at: 0, v: PTS.house }];
  const segList = Object.entries(S).sort((a, b) => a[1].start - b[1].start);
  for (const [, s] of segList) {
    if (s.role === "kids") continue;
    attnKeys.push({ at: s.start - 0.2, v: speakerHead(s.role, s.start), dur: 0.5 });
  }
  const special: Key<P>[] = [
    { at: wVot - 0.2, v: PTS.board, dur: 0.6 },
    { at: S.L08.start - 0.2, v: heads.bilal, dur: 0.5 },
    { at: S.L09.start, v: PTS.board, dur: 0.6 },
    { at: S.L09.end + 0.2, v: tHeadKneel, dur: 0.5 },
    { at: S.L17.start + 1.0, v: PTS.window, dur: 0.7 },
    { at: S.L24.start, v: PTS.board, dur: 0.6 },
    { at: S.L25.start + 1.4, v: tHeadStand, dur: 0.6 },
    { at: H.pause1.start + 0.3, v: PTS.board, dur: 1.0 },
    { at: H.pause1.end - 1.4, v: tHeadStand, dur: 0.8 },
    { at: S.L29.start + 0.8, v: PTS.boardPeople, dur: 0.6 },
    { at: H.raiseHand.start + 0.3, v: heads.bilal, dur: 0.6 },
    { at: H.placeTree.start, v: PTS.house, dur: 0.6 },
    { at: S.L40.start + 0.2, v: tHeadKneel, dur: 0.6 },
  ];
  const attn = [...attnKeys, ...special].sort((a, b) => a.at - b.at);
  const attention = (t: number) => track(attn, t, lerpP);

  const memJobs = [
    { id: "c4", t0: m0 + 2.6 },
    { id: "c5", t0: m0 + 5.9 },
    { id: "roof", t0: m0 + 9.6 },
  ];
  return { shots, cards, attention, tKeys, tHeadAt, heads, wordAt, cardKeys, memJobs };
};
export type Direction = ReturnType<typeof buildDirection>;

// ---------- Состояние кадра ----------
const mouthFor = (T: Timeline, role: string) => Object.values(T.seg).filter((s) => s.role === role);

// Групповой ответ: рот по огибающей групповой записи с индивидуальным сдвигом.
const groupMouth = (T: Timeline, t: number, delay: number, amp: number) => {
  for (const s of Object.values(T.seg)) {
    if (s.role !== "kids") continue;
    const tl = t - s.fileStart - delay;
    if (tl < s.m.speechStart - 0.05 || tl > s.m.speechEnd + 0.05) continue;
    const fr = Math.round(tl * 30);
    const e = s.m.env.length ? (s.m.env[Math.max(0, Math.min(s.m.env.length - 1, fr))] ?? 0) : 0.6;
    return { open: clamp(e * 0.85 * amp), wide: 0.4, round: 0.1 };
  }
  return { open: 0, wide: 0, round: 0 };
};

const faceWith = (base: Face, gaze: P, blink: number, m: { open: number; wide: number; round: number }): Face => ({
  ...base,
  gaze,
  blink,
  mouthOpen: m.open,
  mouthWide: m.wide,
  mouthRound: m.round,
});

// Дыхание: лёгкий подъём плеч, у каждого свой период и фаза.
const breathe = (id: string, t: number) => {
  const sd = strSeed(id);
  const per = 3.4 + hash01(sd + 3) * 1.4;
  return Math.sin((t / per) * Math.PI * 2 + hash01(sd) * 6.28) * 1.6;
};

export type HeroFlags = { atWindow: boolean; memory: boolean };

export const worldStateAt = (T: Timeline, D: Direction, t: number, memory: boolean): WorldState => {
  const S = T.seg;
  const H = T.hold;
  const chars: CharState[] = [];
  const attn = D.attention;
  const heads = D.heads;

  // ---- ученики ----
  kidsOrder.forEach((k) => {
    const seat = SEATS[k.seat];
    const root = { x: seat.x, y: seat.y };
    const id = k.look.key;
    const sd = strSeed(id);
    let pose: Pose;
    if (k.hero === "yusuf") pose = ySit;
    else if (k.hero === "amir") pose = aSit;
    else if (k.hero === "bilal") pose = bSit;
    else pose = sitCross(k.look, -0.32 - hash01(sd + 5) * 0.25);
    // индивидуальная задержка внимания и редкие собственные взгляды
    const delay = 0.08 + hash01(sd + 11) * 0.55;
    let target = attn(t - delay);
    const glancePeriod = 9 + hash01(sd + 21) * 9;
    const gPhase = (t + hash01(sd + 22) * glancePeriod) % glancePeriod;
    if (!k.hero && gPhase < 1.3) target = add(target, { x: (hash01(sd + Math.floor(t / glancePeriod)) - 0.5) * 900, y: 250 });
    const hw = headWorld(k.look, pose, root);
    let la = lookAt(target.x - hw.x, target.y - hw.y);
    let expr: Expr = { smile: 0.2 + hash01(sd + 31) * 0.25, browIn: 0.1 };
    let mouth = { open: 0, wide: 0, round: 0 };
    let holdL: React.ReactNode | undefined;

    // артикуляция героев
    if (k.hero) mouth = speakingMouth(mouthFor(T, k.hero), t);
    // групповые ответы: отвечают все, но не одинаково
    const amp = 0.55 + hash01(sd + 41) * 0.6;
    const gm = groupMouth(T, t, hash01(sd + 43) * 0.18, amp);
    if (gm.open > 0) mouth = gm;
    // улыбка во время приветствия и ответа
    const inGroup = ["L04", "L37"].some((g) => t > S[g].start - 0.3 && t < S[g].end + 1.2);
    if (inGroup) expr = { ...expr, smile: 0.55 + hash01(sd + 51) * 0.3 };

    // ---- действия героев ----
    if (k.hero === "yusuf") {
      const keys: Key<Pose>[] = [
        { at: 0, v: ySit },
        { at: H.reveal.start + 0.6, v: yLean, dur: 0.9 },
        { at: S.L02.start + 0.3, v: withArms(ySit, undefined, undefined, { headYaw: 0.35 }), dur: 0.6 },
        { at: H.teacherKneel.start, v: ySit, dur: 0.6 },
        { at: S.L06.start - 0.5, v: yLean, dur: 0.7 },
        { at: S.L06.end + 0.4, v: ySit, dur: 0.8 },
        { at: H.toWindow.start + 0.3, v: riseLean(YUSUF, ySit), dur: 0.9 },
        { at: H.toWindow.end + 0.3, v: ySit, dur: 0.1 },
        { at: H.pause1.end - 0.7, v: yPalms, dur: 0.7 },
        { at: S.L26.end + 0.6, v: ySit, dur: 0.8 },
      ];
      pose = poseTrack(keys, t);
      // взгляд: на домик, на Амира, на учителя
      if (t < S.L01.end + 0.1 && t > H.reveal.start) {
        const tgt = t < S.L01.start + 0.9 ? PTS.house : heads.amir;
        la = lookAt(tgt.x - hw.x, tgt.y - hw.y);
      }
      if (t > H.pause1.end - 0.7 && t < S.L26.end + 0.5) la = { yaw: -0.1, pitch: 0.75, gaze: { x: 0.05, y: 1 } };
      // узнал крышу — улыбка
      if (t > H.recognize.start && t < S.L14.start) expr = { smile: 0.85, browIn: 0.3, eyeOpen: 1.05 };
      if (t > S.L01.start - 0.3 && t < S.L01.end + 0.3) expr = { smile: 0.35, browL: 0.6, browR: 0.6, eyeOpen: 1.15, browIn: 0.4 };
      if (t > S.L34.start - 0.3 && t < S.L34.end + 0.3) expr = { smile: 0.15, browIn: 0.6, browL: 0.3, browR: 0.3 };
      // финал: деревце из ящика — рядом с домиком
      const ct0 = H.placeTree.start + 0.15;
      const yScale = scaleAt(Y_ROOT.y);
      const restW = add(Y_ROOT, mul(solveRig(YUSUF, ySit).arms.L.W, yScale));
      const treeFrom = { x: TOYBOX_X - 21, y: TOYBOX_Y - 56 - 2.45 * CUBE * 0.93 };
      const treeSlot = { x: 140, y: 0 }; // в координатах домика
      const slotW = housePt({ x: treeSlot.x, y: treeSlot.y - 2.45 * CUBE });
      const cp = carryPhase({ t0: ct0, from: treeFrom, to: slotW, rest: restW, lift: 70 }, t);
      if (t >= ct0 && t < ct0 + CARRY_DUR) {
        const handL = YUSUF.body.hand * yScale;
        const wrist = { x: cp.grip.x, y: cp.grip.y - handL * 0.72 };
        const lean = clamp(cp.w * 1.4) * 22;
        const leanPose = withArms(ySit, undefined, undefined, { lean: -lean, headYaw: -0.6, headPitch: 0.35 });
        pose = {
          ...leanPose,
          armL: { a1: 0, a2: 0, target: toLocal(wrist, root, yScale), bend: -1, hand: cp.w > 0.6 ? "grip" : "relaxed", handRot: 0, handAbs: cp.w > 0.4 ? 0 : undefined, front: true },
        };
        la = lookAt(cp.grip.x - hw.x, cp.grip.y - hw.y);
        if (cp.holding) holdL = <ToyTree x={0} y={(handL * 0.72 + 2.45 * CUBE * 0.93) / yScale} s={0.93 / yScale} shadow={false} />;
        expr = { smile: 0.5, browIn: 0.2 };
      }
    }
    if (k.hero === "amir") {
      const keys: Key<Pose>[] = [
        { at: 0, v: aSit },
        { at: H.toWindow.start + 0.4, v: riseLean(AMIR, aSit), dur: 0.9 },
        { at: H.toWindow.end + 0.3, v: aSit, dur: 0.1 },
      ];
      pose = poseTrack(keys, t);
      if (t > S.L01.start + 0.8 && t < S.L02.start) la = lookAt(heads.yusuf.x - hw.x, heads.yusuf.y - hw.y);
      if (t > S.L02.start - 0.1 && t < S.L02.end) la = lookAt(heads.yusuf.x - hw.x, heads.yusuf.y - hw.y - 20);
      // «А мама и папа?» — взгляд на людей на доске, затем на учителя
      if (t > S.L28.start - 0.6 && t < S.L28.start + 0.5) la = lookAt(PTS.boardPeople.x - hw.x, PTS.boardPeople.y - hw.y);
      if (t > S.L10.start - 0.2 && t < S.L10.end + 0.3) expr = { smile: 0.6, browL: 0.5, browR: 0.5, eyeOpen: 1.1 };
      if (t > S.L23.start - 0.2 && t < S.L23.end + 0.3) expr = { smile: 0.2, browIn: 0.6 };
    }
    if (k.hero === "bilal") {
      const keys: Key<Pose>[] = [
        { at: 0, v: bSit },
        { at: H.toWindow.start + 0.5, v: riseLean(BILAL, bSit), dur: 0.9 },
        { at: H.toWindow.end + 0.3, v: bSit, dur: 0.1 },
        { at: H.raiseHand.start, v: bRaise, dur: 0.75 },
        { at: S.L32.start + 0.1, v: bSit, dur: 0.8 },
      ];
      pose = poseTrack(keys, t);
      if (t > S.L15.start - 0.2 && t < S.L15.end + 0.3) expr = { smile: 0.3, browIn: 0.5 };
      if (t > S.L32.start - 0.2 && t < S.L32.end + 0.3) expr = { smile: 0.15, browIn: 0.55, browL: 0.2 };
    }
    // взгляд на говорящего: голова плавно, глаза быстрее
    const p2: Pose = { ...pose, headYaw: la.yaw * 0.85, headPitch: la.pitch * 0.85, shoulderUp: breathe(id, t) };
    const base = exprTrack([{ at: 0, v: expr }], t);
    const face = faceWith(base, la.gaze, blinkAt(id, t), mouth);
    // в воспоминании (утром) детей ещё нет
    chars.push({ id, look: k.look, x: root.x, y: root.y, pose: p2, face, hidden: memory, holdL });
  });

  // ---- учитель ----
  {
    let pose = poseTrack(D.tKeys, t);
    const hw = add(T_ROOT, mul(solveRig(TEACHER, pose).headC, scaleAt(T_ROOT.y)));
    let target = attn(t - 0.05);
    // учитель смотрит на того, к кому обращается
    const spk = Object.values(S).find((s) => t >= s.start - 0.3 && t <= s.end + 0.4);
    if (spk && spk.role !== "teacher" && spk.role !== "kids") target = D.heads[spk.role as "yusuf" | "amir" | "bilal"];
    if (spk && spk.role === "teacher") target = { x: 2300, y: 1650 };
    if (spk?.role === "kids") target = { x: 2600, y: 1550 };
    if (t > T.scenes.answer.start && t < S.L40.end) target = (spk?.role === "teacher" || !spk) ? { x: 1500, y: 1900 } : target;
    if (t > H.raiseHand.start + 0.2 && t < S.L32.end) target = D.heads.bilal;
    let la = lookAt(target.x - hw.x, target.y - hw.y);
    let expr: Expr = { smile: 0.45, browIn: 0.15 };
    if (t > S.L06.end - 0.2 && t < S.L07.start + 0.5) expr = { smile: 0.4, browIn: 0.45, browL: 0.35, browR: 0.35 }; // внимательно слушает догадку
    if (t > S.L32.end - 0.2 && t < S.L33a.start + 1.2) expr = { smile: 0.55, browIn: 0.4, browL: 0.3, browR: 0.3 };
    if (t > H.pause1.start && t < H.pause1.end) expr = { smile: 0.35, browIn: 0.2 };
    let holdR: React.ReactNode | undefined;
    // воспоминание: строит домик
    let houseParts: Record<string, PartState | undefined> = {};
    if (memory) {
      const m0 = H.memory.start;
      const pile: Record<string, P> = { c4: { x: -212, y: -CUBE }, c5: { x: -212, y: 0 }, roof: { x: -118, y: 0 } };
      const sTeacher = scaleAt(T_ROOT.y);
      const leanPose = withArms(tKneel, undefined, undefined, { lean: 22, headYaw: 0.55, headPitch: 0.35 });
      // утром: стоит у столика, присаживается, наклоняется к домику
      pose = poseTrack(
        [
          { at: 0, v: tStand },
          { at: m0 + 0.6, v: tKneel, dur: 1.2 },
          { at: m0 + 1.9, v: leanPose, dur: 0.6 },
        ],
        t,
      );
      la = lookAt(PTS.house.x - hw.x, PTS.house.y - hw.y);
      expr = { smile: 0.5, browIn: 0.15 };
      const restW = add(T_ROOT, mul(solveRig(TEACHER, leanPose).arms.R.W, sTeacher));
      houseParts = {};
      let active: { id: string; t0: number } | null = null;
      for (const job of D.memJobs) {
        if (t - job.t0 < 0.8) houseParts[job.id] = { ...pile[job.id] };
        if (t - job.t0 >= 0 && t - job.t0 < CARRY_DUR) active = job;
      }
      if (active) {
        const slot = HOUSE_PARTS.find((p) => p.id === active!.id)!.at;
        const g = gripOffset(active.id);
        const from = pile[active.id];
        const cp = carryPhase({ t0: active.t0, from: housePt({ x: from.x + g.x, y: from.y + g.y }), to: housePt({ x: slot.x + g.x, y: slot.y + g.y }), rest: restW, lift: 60 }, t);
        const handL = TEACHER.body.hand * sTeacher;
        const wrist = { x: cp.grip.x, y: cp.grip.y - handL * 0.72 };
        pose = {
          ...leanPose,
          armR: { a1: 0, a2: 0, target: toLocal(wrist, T_ROOT, sTeacher), bend: 1, hand: cp.w > 0.6 ? "grip" : "relaxed", handRot: 0, handAbs: cp.w > 0.35 ? 0 : undefined },
        };
        la = lookAt(cp.grip.x - hw.x, cp.grip.y - hw.y);
        if (cp.holding) {
          houseParts[active.id] = { x: 0, y: 0, hidden: true };
          const part = HOUSE_PARTS.find((p) => p.id === active!.id)!;
          const k = TS / sTeacher;
          holdR = (
            <g transform={`translate(0 ${(handL * 0.72) / sTeacher}) scale(${k})`}>
              <HousePiece part={part} x={-g.x} y={-g.y} />
            </g>
          );
        }
      }
      if (t > D.memJobs[2].t0 + CARRY_DUR) expr = { smile: 0.75, browIn: 0.25 };
    }
    if (t > S.L36.start - 0.2 && t < S.L40.end && !memory) {
      // к классу и к зрителю: голова почти фронтально
      la = { yaw: 0.08, pitch: 0.05, gaze: { x: -0.05, y: 0.05 } };
    }
    const mouth = speakingMouth(mouthFor(T, "teacher"), t);
    const p2: Pose = { ...pose, headYaw: pose.headYaw * 0.35 + la.yaw * 0.65, headPitch: pose.headPitch * 0.5 + la.pitch * 0.6, shoulderUp: breathe("teacher", t) };
    const face = faceWith(exprTrack([{ at: 0, v: expr }], t), la.gaze, blinkAt("teacher", t), mouth);
    chars.push({ id: "teacher", look: TEACHER, x: T_ROOT.x, y: T_ROOT.y, pose: p2, face, holdR });
    // детали домика
    if (memory) {
      return {
        t,
        chars,
        cards: {},
        captions: {},
        houseParts,
        treeOnTable: null,
        treeInBox: true,
        boxCubes: 0,
      };
    }
  }

  // ---- предметы в настоящем ----
  // те же границы фаз, что в carryPhase (одно и то же u — без расхождений)
  const uTree = t - (H.placeTree.start + 0.15);
  const treePlaced = uTree >= 2.15;
  const treeHeld = uTree >= 0.8 && !treePlaced;
  return {
    t,
    chars,
    cards: D.cards(t),
    captions: { before: "Домика ещё нет", after: "Домик построен" },
    houseParts: {},
    treeOnTable: treePlaced ? { x: 140, y: 0 } : null,
    treeInBox: !treePlaced && !treeHeld,
    boxCubes: 0,
  };
};

export const shotAt = (D: Direction, t: number) => {
  let cur = D.shots[0];
  for (const s of D.shots) if (s.from <= t) cur = s;
  return cur;
};
export const prevShot = (D: Direction, s: Shot) => {
  const i = D.shots.indexOf(s);
  return i > 0 ? D.shots[i - 1] : null;
};

export { dir };

// Плавность взгляда и мимики: поворот головы и выражение — среднее по
// нескольким моментам последних ≈0,3 с (детерминированно, без состояния).
// Глаза двигаются быстрее головы, рот и моргание — без сглаживания.
const HEAD_W = [0.3, 0.25, 0.2, 0.15, 0.1];
const HEAD_DT = [0, 0.08, 0.16, 0.24, 0.32];
export const smoothWorldState = (T: Timeline, D: Direction, t: number, memory: boolean): WorldState => {
  const s0 = worldStateAt(T, D, t, memory);
  const past = HEAD_DT.slice(1).map((dt) => worldStateAt(T, D, Math.max(0, t - dt), memory));
  const all = [s0, ...past];
  const chars = s0.chars.map((c, i) => {
    const pick = (f: (x: CharState) => number, w = HEAD_W) => all.reduce((acc, s, k) => acc + f(s.chars[i] ?? c) * w[k], 0);
    const gw = [0.5, 0.3, 0.2, 0, 0];
    return {
      ...c,
      pose: { ...c.pose, headYaw: pick((x) => x.pose.headYaw), headPitch: pick((x) => x.pose.headPitch), lean: pick((x) => x.pose.lean) },
      face: {
        ...c.face,
        gaze: { x: pick((x) => x.face.gaze.x, gw), y: pick((x) => x.face.gaze.y, gw) },
        smile: pick((x) => x.face.smile),
        browL: pick((x) => x.face.browL),
        browR: pick((x) => x.face.browR),
        browIn: pick((x) => x.face.browIn),
        eyeOpen: pick((x) => x.face.eyeOpen),
      },
    };
  });
  return { ...s0, chars };
};
