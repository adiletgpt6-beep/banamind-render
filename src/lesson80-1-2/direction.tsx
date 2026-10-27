// Режиссура ролика 80-1-2: планы и камера, позы и взгляды персонажей,
// действия с предметами (яблоко, нож, половинки, семечко, блюдце),
// состояние доски и природных вставок. Всё считается от временной шкалы
// (timeline.ts) — по фактическим границам речи; от времени кадра зависит
// только движение, без накопленного состояния и без Math.random.
import React from "react";
import { blinkAt, exprTrack, type Expr, type Key, lookAt, numTrack, poseTrack, speakingMouth, track } from "../lesson01/anim";
import { HERO_SEATS, SEATS, TEACHER_SPOT, scaleAt } from "../lesson01/layout";
import { type P, add, clamp, easeInOut, hash01, lerp, lerpP, mul, strSeed } from "../lesson01/rig/geom";
import { solveRig } from "../lesson01/rig/Character";
import { AMIR, BILAL, EXTRA_KIDS, type Look, TEACHER, YUSUF } from "../lesson01/rig/looks";
import type { ArmPose, Face, Pose } from "../lesson01/rig/pose";
import { kneel, sitCross, toLocal } from "../lesson01/rig/presets";
import type { CharState } from "../lesson01/World";
import { BOARD0, BOARD_PTS, type BoardState } from "./sets/board";
import { APPLE, Apple, appleOutline, halfSeedPos, KNIFE, Knife, SAUCER_SEED, Seed } from "./sets/props";
import type { Timeline } from "./timeline";
import { APPLE_REST, HALF_L, HALF_R, KNIFE_REST, PLATE_W, type RoomState, SAUCER0, SAUCER1, type TableProps, TS } from "./world";

export type Cam = { cx: number; cy: number; w: number };
export type SetKind = "room" | "garden" | "leaf" | "bloom" | "cut";
export type Shot = { from: number; to: number; set: SetKind; cam: Key<Cam>[]; fade?: number; tag?: string };

const mixCam = (a: Cam, b: Cam, u: number): Cam => ({ cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), w: lerp(a.w, b.w, u) });
export const camAt = (s: Shot, t: number): Cam => track(s.cam, t, mixCam);

// ---------- Действующие лица ----------
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

const Y_ROOT = { x: SEATS[HERO_SEATS.yusuf].x, y: SEATS[HERO_SEATS.yusuf].y };
const A_ROOT = { x: SEATS[HERO_SEATS.amir].x, y: SEATS[HERO_SEATS.amir].y };
const B_ROOT = { x: SEATS[HERO_SEATS.bilal].x, y: SEATS[HERO_SEATS.bilal].y };
const T_ROOT = TEACHER_SPOT;
const ST = scaleAt(T_ROOT.y); // масштаб учителя
const SY = scaleAt(Y_ROOT.y);
const HAND_T = TEACHER.body.hand; // длина кисти учителя (ед. персонажа)
const HAND_Y = YUSUF.body.hand;

const ySit = sitCross(YUSUF, -0.42);
const aSit = sitCross(AMIR, -0.4);
const bSit = sitCross(BILAL, -0.45);
const tKneel = kneel(TEACHER, 0.5);

const withArms = (p: Pose, armL?: Partial<ArmPose>, armR?: Partial<ArmPose>, extra: Partial<Pose> = {}): Pose => ({
  ...p,
  armL: armL ? { ...p.armL, ...armL } : p.armL,
  armR: armR ? { ...p.armR, ...armR } : p.armR,
  ...extra,
});
const shoulderY = (look: Look, p: Pose) => solveRig(look, p).shoulderC.y;

// Учитель: жесты (как в первом фильме) и рабочая поза у стола
const tGestureKids = (p: Pose) => withArms(p, undefined, { target: { x: 150, y: shoulderY(TEACHER, p) + 170 }, bend: 1, hand: "palmUp", handRot: 0, handAbs: 100 });
const tGestureApple = (p: Pose) => withArms(p, undefined, { target: toLocal({ x: PLATE_W.x - 50, y: PLATE_W.y - 70 }, T_ROOT, ST), bend: 1, hand: "palmUp", handRot: 0, handAbs: 75 });
// жест к доске: открытая ладонь в сторону доски на уровне груди (не взмах)
const tGestureBoard = (p: Pose) =>
  withArms(p, { target: { x: -215, y: shoulderY(TEACHER, p) + 70 }, bend: -1, hand: "palmUp", handRot: 0, handAbs: -100, front: true }, undefined, { headYaw: -0.4, bodyYaw: 0.3, headPitch: -0.12 });
const tWork = withArms(tKneel, undefined, undefined, { lean: -8, headYaw: 0.4, headPitch: 0.4 });

// Опорные точки
const PTS = {
  plate: { x: PLATE_W.x, y: PLATE_W.y - 30 },
  saucer: { x: SAUCER0.x, y: SAUCER0.y - 12 },
  board: { x: 900, y: 520 },
  camera: { x: 1950, y: 2600 },
};

// ---------- Перенос мелкого предмета ----------
// Подход кисти, захват, подъём, перенос, опускание, отпускание, возврат.
type Carry = { t0: number; from: P; to: P; rest: P; lift: number; dur: number[] };
const carryAt = (c: Carry, t: number) => {
  const T = c.dur; // границы фаз (с от t0)
  const u = t - c.t0;
  const above = (p: P) => ({ x: p.x, y: p.y - c.lift });
  if (u < 0) return { grip: c.rest, holding: false, w: 0, placed: false, contact: false };
  if (u < T[0]) {
    const k = easeInOut(u / T[0]);
    return { grip: lerpP(c.rest, above(c.from), k), holding: false, w: k, placed: false, contact: false };
  }
  if (u < T[1]) return { grip: lerpP(above(c.from), c.from, easeInOut((u - T[0]) / (T[1] - T[0]))), holding: false, w: 1, placed: false, contact: false };
  if (u < T[2]) return { grip: lerpP(c.from, above(c.from), easeInOut((u - T[1]) / (T[2] - T[1]))), holding: true, w: 1, placed: false, contact: true };
  if (u < T[3]) {
    const k = easeInOut((u - T[2]) / (T[3] - T[2]));
    const a = above(c.from);
    const b = above(c.to);
    return { grip: { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) - Math.sin(k * Math.PI) * c.lift * 0.4 }, holding: true, w: 1, placed: false, contact: true };
  }
  if (u < T[4]) return { grip: lerpP(above(c.to), c.to, easeInOut((u - T[3]) / (T[4] - T[3]))), holding: true, w: 1, placed: false, contact: true };
  if (u < T[5]) return { grip: lerpP(c.to, above(c.to), easeInOut((u - T[4]) / (T[5] - T[4]))), holding: false, w: 1, placed: true, contact: false };
  if (u < T[6]) {
    const k = easeInOut((u - T[5]) / (T[6] - T[5]));
    return { grip: lerpP(above(c.to), c.rest, k), holding: false, w: 1 - k, placed: true, contact: false };
  }
  return { grip: c.rest, holding: false, w: 0, placed: true, contact: false };
};

const restWristR = (() => {
  const r = solveRig(TEACHER, tKneel);
  return add(T_ROOT, mul(r.arms.R.W, ST));
})();
const restWristL = (() => {
  const r = solveRig(TEACHER, tKneel);
  return add(T_ROOT, mul(r.arms.L.W, ST));
})();

// Наклон корпуса к цели: рука остаётся удобно полусогнутой (≈ 72 % длины),
// не складывается у самого плеча и не тянется дальше досягаемости.
const ARM_T = (TEACHER.body.upperArm + TEACHER.body.foreArm) * ST;
const ARM_Y = (YUSUF.body.upperArm + YUSUF.body.foreArm) * SY;
const leanToward = (look: Look, base: Pose, root: P, sc: number, armLen: number, w: P, side: "L" | "R", lo: number, hi: number, k = 0.72) => {
  let best = 0;
  let bestErr = Infinity;
  for (let l = hi; l >= lo; l -= 1) {
    const r = solveRig(look, { ...base, lean: l });
    const sh = add(root, mul(side === "L" ? r.shoulderL : r.shoulderR, sc));
    const err = Math.abs(Math.hypot(sh.x - w.x, sh.y - w.y) - k * armLen);
    if (err < bestErr - 1e-6) {
      bestErr = err;
      best = l;
    }
  }
  return best;
};
const tLean = (w: P, side: "L" | "R") => leanToward(TEACHER, tKneel, T_ROOT, ST, ARM_T, w, side, -30, 8);

// ---------- Построение режиссуры ----------
export const buildDirection = (T: Timeline) => {
  const S = T.seg;
  const H = T.hold;
  const PZ = T.pause;
  const sc = T.scenes;
  const n = (k: number) => `80-1-2-${String(k).padStart(3, "0")}`;
  const seg = (k: number) => S[n(k)];

  // Слово внутри реплики (по таймингам; без озвучки — пропорционально).
  const wordAt = (k: number, word: string, fallback: number) => {
    const s = seg(k);
    const w = s.m.words.find((x) => x.text.replace(/[^\p{L}]/gu, "").toLowerCase() === word.toLowerCase());
    return w ? s.fileStart + w.start : s.start + (s.end - s.start) * fallback;
  };

  // ---- Действия (моменты) ----
  const A = {
    place0: H.placeApple.start + 0.2, // рука с яблоком начинает движение
    placeContact: H.placeApple.start + 1.85, // касание тарелки
    placeRelease: H.placeApple.start + 2.15,
    cut0: H.cut.start,
    knifeGrab: H.cut.start + 1.0,
    cutDown0: H.cut.start + 1.75,
    cutDown1: H.cut.start + 3.35,
    knifeBack: H.cut.start + 4.35,
    open0: H.cut.start + 4.6, // кисти накрывают яблоко
    split: H.cut.start + 5.15, // под кистями — две половинки
    open1: H.cut.start + 5.95, // половинки легли срезом вверх
    seed0: H.takeSeed.start + 0.1,
    slide0: H.slide.start + 0.4,
  };
  const seedCarry: Carry = {
    t0: A.seed0,
    from: (() => {
      const sp = halfSeedPos(-1, 0);
      return { x: HALF_L.x + sp.x * TS, y: HALF_L.y + sp.y * TS };
    })(),
    to: { x: SAUCER0.x + SAUCER_SEED.x * TS, y: SAUCER0.y + SAUCER_SEED.y * TS },
    rest: add(restWristR, { x: 20, y: HAND_T * ST * 0.9 }),
    lift: 34,
    dur: [0.75, 1.05, 1.35, 2.15, 2.45, 2.75, 3.45],
  };

  // ---- Планы ----
  const shots: Shot[] = [];
  const add2 = (from: number, to: number, set: SetKind, cams: (Cam & { at?: number; dur?: number })[], extra: Partial<Shot> = {}) => {
    const cam: Key<Cam>[] = cams.map((c, i) => ({ at: c.at ?? from, v: { cx: c.cx, cy: c.cy, w: c.w }, dur: c.dur ?? (i === 0 ? undefined : to - from) }));
    shots.push({ from, to, set, cam, ...extra });
  };
  const fixed = (from: number, to: number, c: Cam, extra: Partial<Shot> = {}) => add2(from, to, "room", [c], extra);
  const drift = (from: number, to: number, a: Cam, b: Cam, extra: Partial<Shot> = {}, set: SetKind = "room") => add2(from, to, set, [{ ...a, at: from }, { ...b, at: from, dur: to - from }], extra);

  const CU = {
    plate: { cx: 1505, cy: 1784, w: 440 },
    plateWide: { cx: 1540, cy: 1770, w: 640 },
    seeds: { cx: 1500, cy: 1806, w: 230 },
    tableSaucer: { cx: 1585, cy: 1795, w: 460 },
    yusufApple: { cx: 1720, cy: 1820, w: 760 },
    yusuf: { cx: 1835, cy: 1850, w: 600 },
    amir: { cx: 2205, cy: 1790, w: 620 },
    bilal: { cx: 2045, cy: 1610, w: 620 },
    teacherK: { cx: 1395, cy: 1650, w: 760 },
    teacherTable: { cx: 1520, cy: 1715, w: 1150 },
    tableKids: { cx: 1760, cy: 1730, w: 1380 },
    wide: { cx: 2350, cy: 1385, w: 2750 },
    kids: { cx: 2150, cy: 1620, w: 1500 },
    boardLeft: { cx: 700, cy: 410, w: 920 },
    boardSeed: { cx: 420, cy: 400, w: 520 },
    boardTree: { cx: 960, cy: 395, w: 360 },
    boardTreeIn: { cx: 951, cy: 330, w: 70 },
    diagram: { cx: 1285, cy: 560, w: 1100 },
    diagramApple: { cx: BOARD_PTS.diagramApple.x, cy: BOARD_PTS.diagramApple.y, w: 120 },
    teacherBoard: { cx: 1310, cy: 1610, w: 1050 },
    boardClass: { cx: 1450, cy: 1010, w: 2700 },
  };

  // Сцена 1 — яблоко с вопросом
  drift(0, H.notice.start, CU.plate, { cx: 1530, cy: 1780, w: 470 });
  drift(H.notice.start, seg(1).end + 0.35, CU.yusufApple, { cx: 1740, cy: 1825, w: 700 });
  fixed(seg(1).end + 0.35, seg(2).end + 0.5, CU.wide); // установочный общий план класса
  fixed(seg(2).end + 0.5, seg(3).end + 0.4, CU.amir);
  drift(seg(3).end + 0.4, A.cutDown0 - 0.35, CU.teacherTable, { cx: 1500, cy: 1740, w: 980 });
  // крупная вставка разреза: нож проходит через яблоко
  const cutSpan = (A.cutDown1 - A.cutDown0) / 0.67;
  shots.push({ from: A.cutDown0 - 0.15 * cutSpan, to: A.cutDown1 + 0.18 * cutSpan, set: "cut", tag: "cut", fade: 0.25, cam: [{ at: 0, v: { cx: 960, cy: 540, w: 1920 } }] });
  drift(A.cutDown1 + 0.18 * cutSpan, H.reveal.start, CU.plateWide, { cx: 1522, cy: 1780, w: 520 }, { fade: 0.25 });
  drift(H.reveal.start, seg(5).start - 0.15, { cx: 1512, cy: 1800, w: 420 }, { cx: 1508, cy: 1806, w: 360 });
  fixed(seg(5).start - 0.15, seg(5).end + 0.3, CU.yusuf);
  drift(seg(5).end + 0.3, seg(6).start - 0.1, CU.seeds, { cx: 1500, cy: 1806, w: 210 });
  fixed(seg(6).start - 0.1, sc.seed.start, CU.teacherTable);

  // Сцена 2 — семечко и дерево
  drift(sc.seed.start, A.seed0 + 3.6, { cx: 1585, cy: 1785, w: 520 }, CU.tableSaucer);
  drift(A.seed0 + 3.6, H.seedLook.end, { cx: 1662, cy: 1818, w: 300 }, { cx: 1664, cy: 1820, w: 260 }); // семечко на блюдце
  fixed(H.seedLook.end, seg(7).start - 0.1, CU.tableKids);
  fixed(seg(7).start - 0.1, wordAt(7, "может", 0.3) + 0.05, CU.bilal);
  drift(wordAt(7, "может", 0.3) + 0.05, H.boardTree.end, CU.boardLeft, { cx: 690, cy: 405, w: 880 }, { fade: 0.3 });
  fixed(H.boardTree.end, seg(8).end + 0.4, CU.yusufApple);
  const gIns = wordAt(9, "Для", 0.25) - 0.4; // вставка роста начинается с рисунка семечка
  fixed(seg(8).end + 0.4, wordAt(9, "Но", 0.12) - 0.1, CU.teacherK);
  drift(wordAt(9, "Но", 0.12) - 0.1, gIns, CU.boardLeft, CU.boardSeed, { fade: 0.3 });
  shots.push({ from: gIns, to: H.growth.end, set: "garden", cam: [{ at: gIns, v: { cx: 1600, cy: 1400, w: 520 } }], fade: 0.5, tag: "growth" });
  drift(H.growth.end, seg(10).start - 0.1, CU.boardLeft, { cx: 700, cy: 410, w: 900 }, { fade: 0.5 });
  fixed(seg(10).start - 0.1, seg(10).end + 0.35, CU.amir);
  drift(seg(10).end + 0.35, H.toGarden.start + 0.6, CU.teacherBoard, { cx: 1300, cy: 1600, w: 1000 });
  drift(H.toGarden.start + 0.6, sc.roots.start, CU.boardTree, CU.boardTreeIn, { fade: 0.25 });

  // Сцена 3 — корни, дождь, полив (сад)
  const g3 = sc.roots.start;
  shots.push({
    from: g3,
    to: seg(15).start - 0.1,
    set: "garden",
    tag: "roots",
    fade: 0.45,
    cam: [
      { at: g3, v: { cx: 1700, cy: 880, w: 2700 } },
      { at: g3 + 0.3, v: { cx: 1600, cy: 1250, w: 2150 }, dur: H.gardenLook.end - g3 + 0.8 },
      { at: seg(12).end + 0.1, v: { cx: 1600, cy: 1480, w: 1750 }, dur: 1.6 },
      { at: wordAt(14, "впитывают", 0.4), v: { cx: 1600, cy: 1330, w: 2050 }, dur: 1.6 },
    ],
  });
  fixed(seg(15).start - 0.1, seg(15).end + 0.35, CU.yusuf);
  shots.push({
    from: seg(15).end + 0.35,
    to: H.watering.end,
    set: "garden",
    tag: "roots",
    cam: [
      { at: seg(15).end + 0.35, v: { cx: 1600, cy: 1180, w: 2100 } },
      { at: wordAt(16, "люди", 0.3), v: { cx: 1470, cy: 1150, w: 1500 }, dur: 1.4 },
    ],
  });
  drift(H.rootsBack.start, sc.leaves.start, CU.boardClass, { cx: 1430, cy: 1000, w: 2600 }, { fade: 0.4 });

  // Сцена 4 — листья, цветы и пчела
  const g4 = sc.leaves.start;
  shots.push({ from: g4, to: seg(17).start - 0.1, set: "garden", tag: "leaves", fade: 0.45, cam: [{ at: g4, v: { cx: 1600, cy: 1150, w: 1700 } }, { at: g4, v: { cx: 1600, cy: 640, w: 1300 }, dur: H.toLeaves.end - g4 }] });
  const wSun = wordAt(17, "солнечный", 0.55);
  fixed(seg(17).start - 0.1, wSun - 0.25, CU.bilal);
  shots.push({ from: wSun - 0.25, to: H.leafDone.end, set: "leaf", tag: "leaf", fade: 0.35, cam: [{ at: wSun, v: { cx: 960, cy: 540, w: 1920 } }] });
  shots.push({ from: H.spring.start, to: H.spring.start + 1.3, set: "garden", tag: "spring", fade: 0.6, cam: [{ at: H.spring.start, v: { cx: 2300, cy: 860, w: 2900 } }, { at: H.spring.start, v: { cx: 2250, cy: 820, w: 2700 }, dur: 1.3 }] });
  const bee0 = H.spring.start + 1.3; // время u = 0 у пчелы
  shots.push({ from: bee0, to: seg(19).start - 0.1, set: "bloom", tag: "bee", fade: 0.4, cam: [{ at: bee0, v: { cx: 960, cy: 520, w: 1920 } }] });
  fixed(seg(19).start - 0.1, seg(19).end + 0.3, CU.yusuf);
  shots.push({
    from: seg(19).end + 0.3,
    to: H.pollinate.end,
    set: "bloom",
    tag: "bee",
    cam: [
      { at: seg(19).end + 0.3, v: { cx: 600, cy: 410, w: 600 } },
      { at: seg(19).end + 0.3, v: { cx: 590, cy: 395, w: 520 }, dur: bee0 + 4.2 - seg(19).end - 0.3 },
      { at: bee0 + 4.3, v: { cx: 960, cy: 470, w: 1700 }, dur: 1.4 },
      { at: bee0 + 6.4, v: { cx: 1395, cy: 490, w: 600 }, dur: 1.0 },
      { at: bee0 + 9.0, v: { cx: 960, cy: 520, w: 1920 }, dur: 1.4 }, // отъезд: обе ветки
    ],
  });
  const f0 = H.fruitTime.start;
  // то же место без склейки: камера с общего плана двух веток подъезжает к ветке
  // яблони A, и на ней идёт время (лепестки → завязи → спелые яблоки)
  shots.push({ from: f0, to: seg(21).start - 0.1, set: "bloom", tag: "fruit", cam: [{ at: f0, v: { cx: 960, cy: 520, w: 1920 } }, { at: f0 + 0.2, v: { cx: 640, cy: 540, w: 1250 }, dur: 2.2 }, { at: f0 + 2.6, v: { cx: 640, cy: 600, w: 1150 }, dur: 5 }] });
  fixed(seg(21).start - 0.1, seg(21).end + 0.35, CU.amir);
  const wApple = wordAt(22, "яблоко", 0.3);
  shots.push({ from: seg(21).end + 0.35, to: wApple + 0.1, set: "bloom", tag: "ripe", cam: [{ at: seg(21).end + 0.35, v: { cx: 600, cy: 640, w: 700 } }, { at: seg(21).end + 0.35, v: { cx: 560, cy: 610, w: 520 }, dur: 2 }] });
  drift(wApple + 0.1, wApple + 1.6, { cx: 1500, cy: 1800, w: 300 }, CU.plateWide, { fade: 0.5 });
  drift(wApple + 1.6, sc.gather.start, CU.teacherTable, { cx: 1560, cy: 1700, w: 1300 });

  // Сцена 5 — соберём то, что заметили
  drift(sc.gather.start, seg(23).start - 0.1, CU.boardClass, { cx: 1420, cy: 1000, w: 2550 });
  fixed(seg(23).start - 0.1, seg(23).end + 0.5, CU.teacherBoard);
  fixed(seg(23).end + 0.5, seg(24).start - 0.1, CU.kids); // пауза: класс думает
  fixed(seg(24).start - 0.1, seg(24).end + 0.3, CU.yusuf);
  fixed(seg(24).end + 0.3, seg(25).end + 0.3, CU.amir);
  fixed(seg(25).end + 0.3, seg(26).end + 0.3, CU.bilal);
  fixed(seg(26).end + 0.3, wordAt(27, "Мы", 0.3) - 0.1, CU.teacherK);
  drift(wordAt(27, "Мы", 0.3) - 0.1, sc.creator.start, CU.diagram, { cx: 1285, cy: 560, w: 1040 }, { fade: 0.3 });

  // Сцена 6 — как растёт и кто создал
  fixed(sc.creator.start, seg(28).end + 0.4, CU.amir);
  const wWho = wordAt(29, "кто", 0.5);
  fixed(seg(28).end + 0.4, wWho - 0.2, CU.teacherK);
  drift(wWho - 0.2, seg(29).end + 0.4, CU.diagram, { cx: 1285, cy: 560, w: 1040 }, { fade: 0.3 });
  fixed(seg(29).end + 0.4, seg(30).end + 0.4, CU.bilal);
  drift(seg(30).end + 0.4, seg(31).end + 0.6, CU.teacherBoard, { cx: 1320, cy: 1620, w: 980 });
  fixed(seg(31).end + 0.6, seg(32).end + 0.4, CU.yusufApple);
  fixed(seg(32).end + 0.4, sc.viewer.start, CU.teacherTable);

  // Сцена 7 — ответ для зрителя
  drift(sc.viewer.start, PZ[n(34)].start + 2.0, CU.teacherK, { cx: 1385, cy: 1640, w: 700 });
  fixed(PZ[n(34)].start + 2.0, seg(35).start - 0.1, CU.tableKids); // дети думают
  fixed(seg(35).start - 0.1, seg(35).end + 0.4, { cx: 2080, cy: 1640, w: 1600 }); // видно, как отвечают дети
  fixed(seg(35).end + 0.4, H.yusufLook.end, CU.yusufApple);
  fixed(H.yusufLook.end, seg(36).end + 0.3, CU.teacherK);
  fixed(seg(36).end + 0.3, seg(37).end + 0.35, CU.bilal);
  drift(seg(37).end + 0.35, sc.notice.start, CU.teacherTable, { cx: 1540, cy: 1710, w: 1250 });

  // Сцена 8 — теперь я замечаю
  fixed(sc.notice.start, A.slide0 + 2.6, CU.yusufApple);
  fixed(A.slide0 + 2.6, seg(39).end + 0.4, CU.yusuf);
  fixed(seg(39).end + 0.4, seg(40).end + 0.4, CU.amir);
  const o0 = H.toOrchard.start;
  drift(seg(40).end + 0.4, o0 + 1.4, CU.boardTree, { ...CU.boardTreeIn, w: 110 }, { fade: 0.4 });
  shots.push({ from: o0 + 1.4, to: H.toOrchard.end - 0.2, set: "bloom", tag: "orchard", fade: 0.6, cam: [{ at: o0 + 1.4, v: { cx: 560, cy: 610, w: 420 } }, { at: o0 + 1.4, v: { cx: 600, cy: 590, w: 900 }, dur: H.toOrchard.end - o0 - 1.6 }] });
  fixed(H.toOrchard.end - 0.2, seg(41).end + 0.3, CU.tableKids, { fade: 0.6 });
  fixed(seg(41).end + 0.3, seg(42).end + 0.35, CU.yusufApple);
  drift(seg(42).end + 0.35, T.total + 1, CU.teacherTable, { cx: 1650, cy: 1650, w: 1650 });

  shots.sort((a, b) => a.from - b.from);

  // ---- Доска ----
  const boardAt = (t: number): BoardState => {
    const k = (at: number, d = 0.6) => clamp((t - at) / d);
    const pulse = (a: number, b: number) => clamp((t - a) / 0.35) * (1 - clamp((t - b) / 0.5));
    const wPlants = wordAt(29, "растения", 0.62);
    const wWater = wordAt(29, "воду", 0.72);
    const wSunW = wordAt(29, "солнце", 0.8);
    const wAir = wordAt(29, "воздух", 0.9);
    return {
      ...BOARD0,
      t,
      seed: k(seg(7).start + 0.2),
      sprout: k(wordAt(7, "вырасти", 0.6) - 0.2),
      tree: k(wordAt(7, "яблоня", 0.85) - 0.1),
      years: k(H.growth.end - 0.6),
      diagram: k(H.rootsBack.start + 0.4, 0.8),
      arrowWater: k(wordAt(27, "замечаем", 0.7), 0.7),
      arrowLight: k(wordAt(27, "устроено", 0.9), 0.7),
      hi: {
        tree: pulse(wPlants - 0.1, wWater - 0.05),
        water: pulse(wWater - 0.1, wSunW - 0.05),
        sun: pulse(wSunW - 0.1, wAir - 0.05),
        air: pulse(wAir - 0.1, seg(29).end + 0.4),
      },
    };
  };

  // ---- Внимание класса ----
  const heads = { yusuf: headWorld(YUSUF, ySit, Y_ROOT), amir: headWorld(AMIR, aSit, A_ROOT), bilal: headWorld(BILAL, bSit, B_ROOT) };
  const tHead = headWorld(TEACHER, tKneel, T_ROOT);
  const speakerHead = (role: string): P => (role === "yusuf" ? heads.yusuf : role === "amir" ? heads.amir : role === "bilal" ? heads.bilal : tHead);
  const attnKeys: Key<P>[] = [{ at: 0, v: PTS.plate }];
  for (const s of Object.values(S).sort((a, b) => a.start - b.start)) {
    if (s.role === "kids") continue;
    attnKeys.push({ at: s.start - 0.2, v: speakerHead(s.role), dur: 0.5 });
  }
  const special: Key<P>[] = [
    { at: H.placeApple.start, v: PTS.plate, dur: 0.6 },
    { at: H.cut.start + 0.3, v: PTS.plate, dur: 0.6 },
    { at: H.takeSeed.start, v: PTS.plate, dur: 0.5 },
    { at: A.seed0 + 2.0, v: PTS.saucer, dur: 0.6 },
    { at: wordAt(7, "яблоня", 0.8), v: BOARD_PTS.tree, dur: 0.6 },
    { at: seg(9).start + 0.6, v: BOARD_PTS.sprout, dur: 0.7 },
    { at: seg(11).end, v: BOARD_PTS.tree, dur: 0.6 },
    { at: H.rootsBack.start, v: BOARD_PTS.diagram, dur: 0.6 },
    { at: sc.gather.start + 0.3, v: BOARD_PTS.diagram, dur: 0.6 },
    { at: PZ[n(23)].start + 0.4, v: BOARD_PTS.diagram, dur: 0.9 },
    { at: wordAt(27, "замечаем", 0.7), v: BOARD_PTS.diagram, dur: 0.6 },
    { at: wWho - 0.2, v: BOARD_PTS.diagram, dur: 0.6 },
    { at: PZ[n(34)].start + 0.3, v: tHead, dur: 0.6 },
    { at: H.slide.start, v: PTS.saucer, dur: 0.5 },
    { at: H.toOrchard.start, v: BOARD_PTS.tree, dur: 0.6 },
  ];
  const attn = [...attnKeys, ...special].sort((a, b) => a.at - b.at);
  const attention = (t: number) => track(attn, t, lerpP);

  // ---- Поза учителя ----
  const tKeys: Key<Pose>[] = [
    { at: 0, v: tWork },
    { at: A.placeRelease + 0.7, v: tKneel, dur: 0.9 },
    { at: seg(2).start + 0.1, v: tGestureApple(tKneel), dur: 0.6 },
    { at: seg(2).end + 0.2, v: tKneel, dur: 0.7 },
    { at: seg(4).start, v: tWork, dur: 0.9 },
    { at: H.reveal.start + 0.4, v: tKneel, dur: 0.9 },
    { at: seg(6).start + 0.3, v: tGestureKids(tKneel), dur: 0.7 },
    { at: seg(6).end - 0.1, v: tKneel, dur: 0.8 },
    { at: sc.seed.start, v: tWork, dur: 0.6 },
    { at: A.seed0 + 3.5, v: tKneel, dur: 0.8 },
    { at: seg(9).start + 0.3, v: tGestureKids(tKneel), dur: 0.6 },
    { at: wordAt(9, "Для", 0.3), v: tGestureBoard(tKneel), dur: 0.8 },
    { at: H.growth.end, v: tKneel, dur: 0.8 },
    { at: seg(11).start, v: tGestureBoard(tKneel), dur: 0.7 },
    { at: H.toGarden.end + 0.5, v: tKneel, dur: 0.6 },
    { at: H.rootsBack.start, v: tGestureBoard(tKneel), dur: 0.8 },
    { at: sc.leaves.start + 0.3, v: tKneel, dur: 0.6 },
    { at: wApple + 0.4, v: tGestureApple(tKneel), dur: 0.7 },
    { at: seg(22).end - 0.2, v: tKneel, dur: 0.7 },
    { at: sc.gather.start + 0.2, v: tGestureBoard(tKneel), dur: 0.8 },
    { at: seg(23).start + 0.6, v: tGestureKids(tKneel), dur: 0.7 },
    { at: seg(23).end + 0.2, v: tKneel, dur: 0.8 },
    { at: wordAt(27, "Мы", 0.3), v: tGestureBoard(tKneel), dur: 0.7 },
    { at: seg(27).end + 0.5, v: tKneel, dur: 0.8 },
    { at: seg(29).start + 0.2, v: tGestureKids(tKneel), dur: 0.6 },
    { at: wWho - 0.3, v: tGestureBoard(tKneel), dur: 0.7 },
    { at: seg(29).end + 0.3, v: tKneel, dur: 0.8 },
    { at: seg(31).start + 0.4, v: tGestureKids(tKneel), dur: 0.8 },
    { at: seg(31).end - 0.3, v: tKneel, dur: 0.9 },
    { at: seg(33).start + 0.3, v: tGestureApple(tKneel), dur: 0.7 },
    { at: seg(33).end, v: tKneel, dur: 0.8 },
    { at: seg(34).start + 0.1, v: tGestureKids(kneel(TEACHER, 0.25)), dur: 0.7 },
    { at: seg(34).end + 0.2, v: kneel(TEACHER, 0.25), dur: 0.9 },
    { at: seg(36).start + 0.1, v: tGestureKids(tKneel), dur: 0.7 },
    { at: seg(36).end + 0.1, v: tKneel, dur: 0.8 },
    { at: seg(38).start + 0.3, v: tGestureKids(tKneel), dur: 0.7 },
    { at: seg(38).end, v: tKneel, dur: 0.8 },
    { at: seg(41).start + 0.4, v: tGestureKids(kneel(TEACHER, 0.3)), dur: 0.8 },
    { at: seg(41).end - 0.2, v: kneel(TEACHER, 0.3), dur: 0.9 },
    { at: seg(43).start + 0.3, v: tGestureKids(kneel(TEACHER, 0.3)), dur: 0.8 },
    { at: seg(43).end + 0.4, v: kneel(TEACHER, 0.3), dur: 1.2 },
  ];

  const sfx = {
    applePlace: A.placeContact,
    knifeUp: A.knifeGrab - 0.05,
    cut: [A.cutDown0 + 0.15, A.cutDown0 + 0.85],
    knifeDown: A.knifeBack - 0.1,
    halves: A.open1 - 0.15,
    seedPick: seedCarry.t0 + seedCarry.dur[1],
    seedDrop: seedCarry.t0 + seedCarry.dur[4],
    saucerSlide: A.slide0 + 0.85,
  };

  return { shots, boardAt, attention, tKeys, heads, tHead, wordAt, A, seedCarry, sfx, bee0, gIns, f0, n, seg };
};
export type Direction = ReturnType<typeof buildDirection>;

// ---------- Состояние комнаты в момент t ----------
const groupMouth = (T: Timeline, t: number, delay: number, amp: number) => {
  for (const s of Object.values(T.seg)) {
    if (s.role !== "kids") continue;
    const tl = t - s.fileStart - delay;
    if (tl < s.m.speechStart - 0.05 || tl > s.m.speechEnd + 0.05) continue;
    const fr = Math.round(tl * 30);
    const e = s.m.env.length ? (s.m.env[Math.max(0, Math.min(s.m.env.length - 1, fr))] ?? 0) : 0.6;
    return { open: clamp(e * 0.85 * amp), wide: 0.45, round: 0.05 };
  }
  return { open: 0, wide: 0, round: 0 };
};
const faceWith = (base: Face, gaze: P, blink: number, m: { open: number; wide: number; round: number }): Face => ({ ...base, gaze, blink, mouthOpen: m.open, mouthWide: m.wide, mouthRound: m.round });
const breathe = (id: string, t: number) => {
  const sd = strSeed(id);
  const per = 3.4 + hash01(sd + 3) * 1.4;
  return Math.sin((t / per) * Math.PI * 2 + hash01(sd) * 6.28) * 1.6;
};
const mouthFor = (T: Timeline, role: string) => Object.values(T.seg).filter((s) => s.role === role);

// Предметы на столе по времени (одни и те же фазы действий, что у рук).
export const tablePropsAt = (D: Direction, t: number): TableProps => {
  const A = D.A;
  const sc = D.seedCarry;
  const seedU = t - sc.t0;
  const seedTaken = seedU >= sc.dur[1];
  const seedPlaced = seedU >= sc.dur[4];
  const opened = t >= A.split;
  const openK = clamp((t - A.split) / (A.open1 - A.split));
  const e = easeInOut(openK);
  const slideK = easeInOut(clamp((t - (A.slide0 + 0.85)) / 1.0));
  return {
    apple: t < A.placeContact ? "hand" : opened ? "none" : "plate",
    appleCut: clamp((t - A.cutDown0) / (A.cutDown1 - A.cutDown0)),
    halves: opened
      ? { open: openK, lx: lerp(APPLE_REST.x, HALF_L.x, e), ly: lerp(APPLE_REST.y, HALF_L.y, e), rx: lerp(APPLE_REST.x, HALF_R.x, e), ry: lerp(APPLE_REST.y, HALF_R.y, e) }
      : null,
    halfSeedsL: [!seedTaken, true],
    knifeOnNapkin: t < A.knifeGrab || t >= A.knifeBack,
    saucerX: lerp(SAUCER0.x, SAUCER1.x, slideK),
    seedOnSaucer: seedPlaced,
  };
};

export const roomStateAt = (T: Timeline, D: Direction, t: number): RoomState => {
  const S = T.seg;
  const H = T.hold;
  const PZ = T.pause;
  const A = D.A;
  const seg = D.seg;
  const n = D.n;
  const chars: CharState[] = [];
  const attn = D.attention;
  const heads = D.heads;
  const props = tablePropsAt(D, t);
  const inPause = Object.values(PZ).some((p) => t >= p.start && t < p.end);

  // ---- ученики ----
  kidsOrder.forEach((k) => {
    const seat = SEATS[k.seat];
    const root = { x: seat.x, y: seat.y };
    const id = k.look.key;
    const sd = strSeed(id);
    let pose: Pose = k.hero === "yusuf" ? ySit : k.hero === "amir" ? aSit : k.hero === "bilal" ? bSit : sitCross(k.look, -0.32 - hash01(sd + 5) * 0.25);
    const delay = 0.08 + hash01(sd + 11) * 0.55;
    let target = attn(t - delay);
    const glancePeriod = 9 + hash01(sd + 21) * 9;
    const gPhase = (t + hash01(sd + 22) * glancePeriod) % glancePeriod;
    if (!k.hero && gPhase < 1.3) target = add(target, { x: (hash01(sd + Math.floor(t / glancePeriod)) - 0.5) * 900, y: 250 });
    // во время паузы для ответа — думают: взгляд чуть вверх/в сторону у части детей
    if (inPause && !k.hero && hash01(sd + 61) < 0.45) target = add(target, { x: (hash01(sd + 62) - 0.5) * 600, y: -260 });
    // говорящий герой обращается к учителю
    if (k.hero && Object.values(S).some((x) => x.role === k.hero && t >= x.start - 0.3 && t <= x.end + 0.3)) target = D.tHead;
    const hw = headWorld(k.look, pose, root);
    let la = lookAt(target.x - hw.x, target.y - hw.y);
    let expr: Expr = { smile: 0.2 + hash01(sd + 31) * 0.25, browIn: 0.1 };
    if (inPause) expr = { smile: 0.12 + hash01(sd + 31) * 0.15, browIn: 0.35 + hash01(sd + 33) * 0.3 };
    let mouth = { open: 0, wide: 0, round: 0 };
    let holdL: React.ReactNode | undefined;
    if (k.hero) mouth = speakingMouth(mouthFor(T, k.hero), t);
    // общий ответ: отвечает большинство, каждый со своей задержкой и силой
    if (hash01(sd + 47) > 0.18 || k.hero) {
      const gm = groupMouth(T, t, hash01(sd + 43) * 0.16, 0.55 + hash01(sd + 41) * 0.6);
      if (gm.open > 0) mouth = gm;
    }
    const s35 = S[n(35)];
    if (t > s35.start - 0.2 && t < s35.end + 1.4) expr = { smile: 0.5 + hash01(sd + 51) * 0.3, browIn: 0.15 };

    if (k.hero === "yusuf") {
      const yLean = withArms(ySit, undefined, undefined, { lean: 7, headYaw: -0.5, headPitch: 0.3 });
      const keys: Key<Pose>[] = [
        { at: 0, v: ySit },
        { at: H.notice.start, v: yLean, dur: 0.8 },
        { at: seg(1).end + 0.6, v: ySit, dur: 0.8 },
        { at: H.reveal.start, v: yLean, dur: 0.8 },
        { at: seg(5).end + 0.6, v: ySit, dur: 0.8 },
        { at: seg(8).start - 0.3, v: withArms(ySit, undefined, undefined, { headPitch: -0.15 }), dur: 0.5 },
        { at: seg(8).end + 0.5, v: ySit, dur: 0.6 },
      ];
      pose = poseTrack(keys, t);
      const look = (p: P) => lookAt(p.x - hw.x, p.y - hw.y);
      // замечает яблоко, разглядывает семечки
      if (t > H.notice.start - 0.1 && t < seg(1).end + 0.4) la = look(PTS.plate);
      if (t > H.reveal.start && t < seg(5).end + 0.3) la = look({ x: HALF_L.x, y: HALF_L.y - 12 });
      // «Такая большая?»: блюдце с семечком → дерево на доске
      if (t > seg(8).start - 0.9 && t < seg(8).start - 0.25) la = look(PTS.saucer);
      if (t > seg(8).start - 0.25 && t < seg(8).end + 0.4) la = look(BOARD_PTS.tree);
      // «Даже об яблоке?» — короткий взгляд на половинки
      if (t > seg(32).start - 0.4 && t < seg(32).start + 0.5) la = look({ x: HALF_L.x, y: HALF_L.y - 10 });
      // после общего ответа: половинка яблока → рисунок дерева
      if (t > H.yusufLook.start - 0.2 && t < H.yusufLook.start + 0.9) la = look({ x: HALF_R.x, y: HALF_R.y - 10 });
      if (t >= H.yusufLook.start + 0.9 && t < H.yusufLook.end + 0.2) la = look(BOARD_PTS.tree);
      // финал: придвигает блюдце к тарелке
      const s0 = A.slide0;
      if (t > s0 - 0.4 && t < s0 + 2.8) {
        const sw = props.saucerX;
        const rim = { x: sw + 30 * TS, y: SAUCER0.y - 5 * TS };
        const handL = HAND_Y * SY;
        const wristOn = { x: rim.x + handL * 0.92, y: rim.y - handL * 0.18 };
        const rest = add(Y_ROOT, mul(solveRig(YUSUF, ySit).arms.L.W, SY));
        const reachK = easeInOut(clamp((t - s0) / 0.75)) * (1 - easeInOut(clamp((t - (s0 + 2.0)) / 0.7)));
        const wrist = lerpP(rest, add(wristOn, { x: 0, y: -10 * (1 - clamp((t - s0 - 0.55) / 0.25)) }), reachK);
        const lean = leanToward(YUSUF, ySit, Y_ROOT, SY, ARM_Y, wrist, "L", -4, 18, 0.8) * clamp(reachK * 1.5);
        pose = {
          ...withArms(ySit, undefined, undefined, { lean, headYaw: -0.55, headPitch: 0.4 }),
          armL: { a1: 0, a2: 0, target: toLocal(wrist, root, SY), bend: -1, hand: reachK > 0.5 ? "flat" : "relaxed", handRot: 0, handAbs: reachK > 0.5 ? -100 : undefined, front: true },
        };
        la = look({ x: sw, y: SAUCER0.y - 10 });
        expr = { smile: 0.45, browIn: 0.25 };
      }
      if (t > seg(1).start - 0.3 && t < seg(1).end + 0.3) expr = { smile: 0.4, browL: 0.6, browR: 0.6, eyeOpen: 1.15, browIn: 0.4 };
      if (t > seg(5).start - 0.3 && t < seg(5).end + 0.3) expr = { smile: 0.3, browL: 0.35, browR: 0.35, eyeOpen: 1.1, browIn: 0.35 };
      if (t > seg(8).start - 0.3 && t < seg(8).end + 0.3) expr = { smile: 0.2, browL: 0.7, browR: 0.7, eyeOpen: 1.2, browIn: 0.45 };
      if (t > seg(15).start - 0.3 && t < seg(15).end + 0.4) expr = { smile: 0.8, browL: 0.4, browR: 0.4, eyeOpen: 1.05, browIn: 0.2 };
      if (t > seg(19).start - 0.3 && t < seg(19).end + 0.3) expr = { smile: 0.3, browIn: 0.5, browL: 0.3, browR: 0.3 };
      if (t > seg(32).start - 0.3 && t < seg(32).end + 0.3) expr = { smile: 0.3, browIn: 0.5, browL: 0.35, browR: 0.35, eyeOpen: 1.08 };
      if (t > seg(39).start - 0.3 && t < seg(39).end + 0.4) expr = { smile: 0.35, browIn: 0.35 };
      if (t > seg(42).start - 0.3 && t < seg(42).end + 0.8) expr = { smile: 0.85, browIn: 0.2, eyeOpen: 1.02 };
      if (t > seg(39).start - 0.6 && t < seg(39).end + 0.3) la = lookAt(PTS.plate.x - hw.x, PTS.plate.y - hw.y);
    }
    if (k.hero === "amir") {
      pose = aSit;
      const look = (p: P) => lookAt(p.x - hw.x, p.y - hw.y);
      // «А что помогает дереву расти?» — сначала на рисунок, потом на учителя
      if (t > seg(10).start - 0.8 && t < seg(10).start + 0.4) la = look(BOARD_PTS.tree);
      // «Но дерево ведь выросло из семечка» — смотрит на рисунок ростка
      if (t > H.amirLook.start && t < seg(28).start + 0.7) la = look(BOARD_PTS.sprout);
      if (t > seg(3).start - 0.3 && t < seg(3).end + 0.3) la = look(PTS.plate);
      if (t > seg(3).start - 0.2 && t < seg(3).end + 0.4) expr = { smile: 0.45, browL: 0.4, browR: 0.4, eyeOpen: 1.08 };
      if (t > seg(10).start - 0.2 && t < seg(10).end + 0.3) expr = { smile: 0.25, browIn: 0.55, browL: 0.2, browR: 0.2 };
      if (t > seg(21).start - 0.2 && t < seg(21).end + 0.4) expr = { smile: 0.7, browL: 0.45, browR: 0.45, eyeOpen: 1.1 };
      if (t > H.amirLook.start && t < seg(28).end + 0.4) expr = { smile: 0.15, browIn: 0.6, browL: 0.15 };
      if (t > seg(40).start - 0.2 && t < seg(40).end + 0.4) expr = { smile: 0.45, browIn: 0.3 };
    }
    if (k.hero === "bilal") {
      // перед репликой — лёгкий наклон головы или поднятая рука
      const tilt = (at: number): Key<Pose>[] => [
        { at: at - 0.7, v: withArms(bSit, undefined, undefined, { headTilt: 6 }), dur: 0.5 },
        { at: at + 1.2, v: bSit, dur: 0.7 },
      ];
      const r = solveRig(BILAL, bSit);
      const bHand = withArms(bSit, undefined, { target: { x: r.shoulderR.x + 22, y: r.headC.y - 105 }, bend: 1, hand: "open", handRot: 180, palm: true, front: true });
      const keys: Key<Pose>[] = [
        { at: 0, v: bSit },
        ...tilt(seg(7).start),
        { at: seg(17).start - 1.0, v: bHand, dur: 0.6 },
        { at: seg(17).start + 0.4, v: bSit, dur: 0.8 },
        ...tilt(seg(26).start),
        ...tilt(seg(37).start),
      ];
      pose = poseTrack(keys, t);
      if (t > seg(7).start - 0.2 && t < seg(7).end + 0.3) expr = { smile: 0.3, browIn: 0.45 };
      if (t > seg(30).start - 0.2 && t < seg(30).end + 0.5) expr = { smile: 0.35, browIn: 0.2 };
      if (t > seg(37).start - 0.2 && t < seg(37).end + 0.4) expr = { smile: 0.35, browIn: 0.4 };
    }
    const p2: Pose = { ...pose, headYaw: la.yaw * 0.85, headPitch: la.pitch * 0.85, shoulderUp: breathe(id, t) };
    const face = faceWith(exprTrack([{ at: 0, v: expr }], t), la.gaze, blinkAt(id, t), mouth);
    chars.push({ id, look: k.look, x: root.x, y: root.y, pose: p2, face, holdL });
  });

  // ---- учитель ----
  {
    let pose = poseTrack(D.tKeys, t);
    let holdL: React.ReactNode | undefined;
    let holdR: React.ReactNode | undefined;
    const handL = HAND_T * ST;
    const toL = (w: P) => toLocal(w, T_ROOT, ST);
    const k = TS / ST; // предметы стола в единицах персонажа
    let lookTarget: P | null = null;
    const baseLean = pose.lean;
    const acts: { w: P; side: "L" | "R"; k: number }[] = []; // активные кисти → наклон корпуса

    // 1) кладёт яблоко на тарелку: правая кисть держит его сбоку (пальцы
    //    обхватывают левый бок), опускает, касание, пальцы раскрываются
    if (t < A.placeRelease + 0.9) {
      const side = (c: P) => ({ x: c.x - 19 * TS, y: c.y - APPLE.h * TS * 0.5 }); // точка захвата по опоре яблока
      const restBottom = { x: APPLE_REST.x, y: APPLE_REST.y };
      const startBottom = { x: APPLE_REST.x - 40, y: APPLE_REST.y - 120 };
      const aboveBottom = { x: APPLE_REST.x - 2, y: APPLE_REST.y - 34 };
      let bottom: P;
      let holding = true;
      const u = t - A.place0;
      if (u < 0) bottom = startBottom;
      else if (u < 1.1) bottom = lerpP(startBottom, aboveBottom, easeInOut(u / 1.1));
      else if (t < A.placeContact) bottom = lerpP(aboveBottom, restBottom, easeInOut((t - (A.place0 + 1.1)) / (A.placeContact - A.place0 - 1.1)));
      else bottom = restBottom;
      let g = side(bottom);
      if (t >= A.placeRelease) {
        holding = false;
        const r = add(restWristR, { x: handL * 0.72, y: 0 });
        const q = clamp((t - A.placeRelease) / 0.9);
        const off = { x: g.x - 16, y: g.y - 10 };
        g = q < 0.3 ? lerpP(g, off, easeInOut(q / 0.3)) : lerpP(off, r, easeInOut((q - 0.3) / 0.7));
      }
      const wrist = { x: g.x - handL * 0.72, y: g.y };
      const turn = t >= A.placeRelease ? 1 - easeInOut(clamp((t - A.placeRelease - 0.25) / 0.6)) : 1;
      pose = { ...pose, armR: { a1: 0, a2: 0, target: toL(wrist), bend: 1, hand: holding ? "grip" : t < A.placeRelease + 0.35 ? "open" : "relaxed", handRot: 0, handAbs: turn > 0.5 ? 90 : undefined } };
      acts.push({ w: wrist, side: "R", k: 1 - easeInOut(clamp((t - A.placeRelease) / 0.9)) });
      if (holding)
        holdR = (
          <g transform={`translate(${(HAND_T * 0.72).toFixed(2)} 0) scale(${k.toFixed(4)})`}>
            <Apple x={19} y={APPLE.h * 0.5} />
          </g>
        );
      lookTarget = { x: bottom.x, y: bottom.y - 15 };
    }

    // 2) разрез: правая кисть берёт нож с салфетки (рукоять справа, лезвие
    //    влево), левая придерживает яблоко с левого бока; нож проходит сверху
    //    вниз, возвращается на салфетку; затем обе кисти раскрывают половинки
    const c0 = A.cut0;
    if (t >= c0 && t < A.open1 + 0.9) {
      const knifeRest = { x: KNIFE_REST.x, y: KNIFE_REST.y };
      const cutX = APPLE_REST.x + 38 * TS; // лезвие (44 ед.) — точно поперёк яблока
      const edge = (y: number) => y - 3.2 * TS; // центр рукояти, если кромка на высоте y
      const topY = edge(APPLE_REST.y - APPLE.h * TS - 2);
      const botY = edge(APPLE_REST.y - 1);
      const restK = add(restWristR, { x: 0, y: handL * 0.5 });
      let K: P = knifeRest; // где рукоять
      let inHand = false;
      let rot: number = KNIFE_REST.rot;
      let reach = 0;
      if (t < A.knifeGrab) {
        reach = easeInOut(clamp((t - c0 - 0.1) / 0.8));
        K = lerpP(restK, knifeRest, reach);
      } else if (t < A.cutDown0) {
        inHand = true;
        reach = 1;
        const q = easeInOut((t - A.knifeGrab) / (A.cutDown0 - A.knifeGrab));
        K = { x: lerp(knifeRest.x, cutX, q), y: lerp(knifeRest.y, topY, q) - Math.sin(q * Math.PI) * 40 };
        rot = lerp(KNIFE_REST.rot, 0, q);
      } else if (t < A.cutDown1) {
        inHand = true;
        reach = 1;
        const q = (t - A.cutDown0) / (A.cutDown1 - A.cutDown0);
        K = { x: cutX + Math.sin(q * Math.PI * 4) * 2.2, y: lerp(topY, botY, easeInOut(q)) };
        rot = 0;
      } else if (t < A.knifeBack) {
        inHand = true;
        reach = 1;
        const q = easeInOut((t - A.cutDown1) / (A.knifeBack - A.cutDown1));
        K = { x: lerp(cutX, knifeRest.x, q), y: lerp(botY, knifeRest.y, q) - Math.sin(q * Math.PI) * 50 };
        rot = lerp(0, KNIFE_REST.rot, q);
      } else {
        reach = 1 - easeInOut(clamp((t - A.knifeBack) / 0.4));
        K = lerpP(restK, knifeRest, reach);
      }
      if (t < A.open0 - 0.4) {
        // кулак наклонён (пальцы вниз-вправо): запястье не торчит над ножом
        const FA = 32;
        const fd = { x: Math.sin((FA * Math.PI) / 180), y: Math.cos((FA * Math.PI) / 180) };
        const wrist = { x: K.x - fd.x * handL * 0.5, y: K.y - fd.y * handL * 0.5 };
        pose = { ...tWork, armR: { a1: 0, a2: 0, target: toL(wrist), bend: 1, hand: inHand ? "fist" : reach > 0.6 ? "grip" : "relaxed", handRot: 0, handAbs: reach > 0.3 ? FA : undefined } };
        acts.push({ w: wrist, side: "R", k: reach });
        if (inHand) {
          // лезвие внутри яблока скрыто (нож проходит в плоскости разреза)
          const ax = (APPLE_REST.x - K.x) / TS;
          const ay = (APPLE_REST.y - K.y) / TS;
          const mid = `knm-${Math.round(t * 1000)}`;
          holdR = (
            <g transform={`translate(${(fd.x * HAND_T * 0.5).toFixed(2)} ${(fd.y * HAND_T * 0.5).toFixed(2)}) scale(${k.toFixed(4)})`}>
              <mask id={mid} maskUnits="userSpaceOnUse" x={-200} y={-200} width={400} height={400}>
                <rect x={-200} y={-200} width={400} height={400} fill="#fff" />
                {props.apple === "plate" && t > A.cutDown0 - 0.3 ? <path d={appleOutline()} transform={`translate(${ax.toFixed(2)} ${ay.toFixed(2)})`} fill="#000" /> : null}
              </mask>
              <g mask={`url(#${mid})`}>
                <Knife x={0} y={0} rot={rot} flip />
              </g>
            </g>
          );
        }
        lookTarget = t < A.knifeGrab + 0.3 ? K : { x: APPLE_REST.x, y: APPLE_REST.y - 20 };
        // левая кисть придерживает яблоко за левый бок
        const hold = easeInOut(clamp((t - (A.knifeGrab - 0.1)) / 0.6)) * (1 - easeInOut(clamp((t - A.cutDown1 - 0.2) / 0.6)));
        if (hold > 0) {
          const grip = { x: APPLE_REST.x - 19 * TS, y: APPLE_REST.y - APPLE.h * TS * 0.45 };
          const wristOn = { x: grip.x - handL * 0.72, y: grip.y };
          acts.push({ w: lerpP(restWristL, wristOn, hold), side: "L", k: hold });
          pose = { ...pose, armL: { a1: 0, a2: 0, target: toL(lerpP(restWristL, wristOn, hold)), bend: 1, hand: hold > 0.6 ? "grip" : "relaxed", handRot: 0, handAbs: hold > 0.4 ? 90 : undefined, front: true } };
        }
      }
      // раскрытие: обе кисти на яблоке, затем разводят половинки
      if (t >= A.open0 - 0.4 && t < A.open1 + 0.9) {
        const inK = easeInOut(clamp((t - (A.open0 - 0.4)) / 0.5));
        const outK = easeInOut(clamp((t - A.open1) / 0.8));
        const pr = props.halves;
        const lc = pr ? { x: pr.lx, y: pr.ly - 16 * TS } : { x: APPLE_REST.x - 8 * TS, y: APPLE_REST.y - APPLE.h * TS * 0.75 };
        const rc = pr ? { x: pr.rx, y: pr.ry - 16 * TS } : { x: APPLE_REST.x + 8 * TS, y: APPLE_REST.y - APPLE.h * TS * 0.75 };
        const wl = { x: lc.x - 6, y: lc.y - handL * 0.7 };
        const wr = { x: rc.x + 6, y: rc.y - handL * 0.7 };
        const k2 = inK * (1 - outK);
        acts.push({ w: lerpP(restWristL, wl, k2), side: "L", k: k2 }, { w: lerpP(restWristR, wr, k2), side: "R", k: k2 });
        pose = {
          ...tWork,
          armL: { a1: 0, a2: 0, target: toL(lerpP(restWristL, wl, k2)), bend: 1, hand: k2 > 0.6 ? "grip" : "relaxed", handRot: 0, handAbs: k2 > 0.3 ? 12 : undefined, front: true },
          armR: { a1: 0, a2: 0, target: toL(lerpP(restWristR, wr, k2)), bend: 1, hand: k2 > 0.6 ? "grip" : "relaxed", handRot: 0, handAbs: k2 > 0.3 ? -12 : undefined },
        };
        lookTarget = { x: APPLE_REST.x, y: APPLE_REST.y - 15 };
      }
    }

    // 3) семечко на блюдце (щепоть правой кисти)
    {
      const sc = D.seedCarry;
      const u = t - sc.t0;
      if (u >= 0 && u < sc.dur[6] + 0.1) {
        const cp = carryAt(sc, t);
        const PA = 36; // щепоть наклонена: пальцы вниз-вправо
        const pd = { x: Math.sin((PA * Math.PI) / 180), y: Math.cos((PA * Math.PI) / 180) };
        const wrist = { x: cp.grip.x - pd.x * handL * 1.12, y: cp.grip.y - pd.y * handL * 1.12 };
        pose = { ...tWork, armR: { a1: 0, a2: 0, target: toL(wrist), bend: 1, hand: cp.w > 0.5 ? "pinch" : "relaxed", handRot: 0, handAbs: cp.w > 0.3 ? PA : undefined } };
        acts.push({ w: wrist, side: "R", k: Math.max(cp.w, 0.001) });
        if (cp.holding)
          holdR = (
            <g transform={`translate(${(pd.x * HAND_T * 1.12).toFixed(2)} ${(pd.y * HAND_T * 1.12).toFixed(2)}) scale(${k.toFixed(4)})`}>
              <Seed x={0} y={0} ang={168} />
            </g>
          );
        lookTarget = cp.grip;
      }
    }

    if (acts.length) {
      const ks = acts.reduce((a, x) => a + x.k, 0);
      const kMax = Math.max(...acts.map((x) => x.k));
      const want = ks > 1e-4 ? acts.reduce((a, x) => a + tLean(x.w, x.side) * x.k, 0) / ks : baseLean;
      pose = { ...pose, lean: lerp(baseLean, want, clamp(kMax * 1.5)) };
    }
    const hw = add(T_ROOT, mul(solveRig(TEACHER, pose).headC, ST));
    let target = attn(t - 0.05);
    const spk = Object.values(S).find((s) => t >= s.start - 0.3 && t <= s.end + 0.4);
    if (spk && spk.role !== "teacher" && spk.role !== "kids") target = heads[spk.role as "yusuf" | "amir" | "bilal"];
    if (spk && spk.role === "teacher") target = { x: 2250, y: 1700 };
    if (spk?.role === "kids") target = { x: 2600, y: 1550 };
    if (inPause) target = { x: 2300, y: 1650 };
    if (lookTarget) target = lookTarget;
    let la = lookAt(target.x - hw.x, target.y - hw.y);
    // сцена 7: вопрос к детям, взгляд приходит к зрителю до конца вопроса
    const s34 = seg(34);
    const toCam = clamp((t - (s34.start + 0.6)) / 0.9) * (1 - clamp((t - (PZ[n(34)].end + 0.2)) / 0.6));
    if (toCam > 0) {
      const camLa = { yaw: 0.06, pitch: 0.04, gaze: { x: -0.05, y: 0.05 } };
      la = { yaw: lerp(la.yaw, camLa.yaw, toCam), pitch: lerp(la.pitch, camLa.pitch, toCam), gaze: lerpP(la.gaze, camLa.gaze, toCam) };
    }
    let expr: Expr = { smile: 0.45, browIn: 0.15 };
    if (inPause) expr = { smile: 0.4, browIn: 0.25 };
    if (t > S[n(28)].end - 0.1 && t < S[n(29)].start + 1.2) expr = { smile: 0.55, browIn: 0.35, browL: 0.25, browR: 0.25 }; // спокойно подтверждает
    if (lookTarget) expr = { smile: 0.4, browIn: 0.2 };
    // кивок на «Да.» / «Верно.»
    const nodAt = [n(9), n(16), n(18), n(27), n(29), n(33), n(38), n(43)].map((id) => S[id].start);
    let nod = 0;
    for (const a of nodAt) {
      const d = t - a;
      if (d > -0.1 && d < 0.6) nod = Math.max(nod, Math.sin(((d + 0.1) / 0.7) * Math.PI) * 0.12);
    }
    const mouth = speakingMouth(mouthFor(T, "teacher"), t);
    const p2: Pose = { ...pose, headYaw: pose.headYaw * 0.35 + la.yaw * 0.65, headPitch: pose.headPitch * 0.5 + la.pitch * 0.6 + nod, shoulderUp: breathe("teacher", t) };
    const face = faceWith(exprTrack([{ at: 0, v: expr }], t), la.gaze, blinkAt("teacher", t), mouth);
    chars.push({ id: "teacher", look: TEACHER, x: T_ROOT.x, y: T_ROOT.y, pose: p2, face, holdL, holdR });
  }

  return { t, chars, board: D.boardAt(t), props };
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

// Плавность взгляда и мимики: поворот головы и выражение — среднее по
// нескольким моментам последних ≈0,3 с (детерминированно, без состояния).
const HEAD_W = [0.3, 0.25, 0.2, 0.15, 0.1];
const HEAD_DT = [0, 0.08, 0.16, 0.24, 0.32];
export const smoothRoomState = (T: Timeline, D: Direction, t: number): RoomState => {
  const s0 = roomStateAt(T, D, t);
  const past = HEAD_DT.slice(1).map((dt) => roomStateAt(T, D, Math.max(0, t - dt)));
  const all = [s0, ...past];
  const chars = s0.chars.map((c, i) => {
    const pick = (f: (x: CharState) => number, w = HEAD_W) => all.reduce((acc, s, k) => acc + f(s.chars[i] ?? c) * w[k], 0);
    const gw = [0.5, 0.3, 0.2, 0, 0];
    return {
      ...c,
      pose: { ...c.pose, headYaw: pick((x) => x.pose.headYaw), headPitch: pick((x) => x.pose.headPitch), headTilt: pick((x) => x.pose.headTilt), lean: pick((x) => x.pose.lean, [0.4, 0.25, 0.17, 0.11, 0.07]) },
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

export { numTrack, KNIFE };
