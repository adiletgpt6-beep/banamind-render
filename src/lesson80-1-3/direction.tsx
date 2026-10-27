// Режиссура ролика 80-1-3 «А если я не вижу?»: планы и камера, позы и
// взгляды персонажей, вертушка (где стоит, кто держит, как вращается),
// перенос, выдох Юсуфа, воспоминания. Всё считается от временной шкалы
// (timeline.ts) — по фактическим границам речи; от времени кадра зависит
// только движение, без накопленного состояния и без Math.random. Угол
// ротора — интеграл заданной скорости по таблице (одинаков при любом
// порядке рендера кадров).
import React from "react";
import { blinkAt, exprTrack, type Expr, type Key, lookAt, poseTrack, speakingMouth, track } from "../lesson01/anim";
import { HERO_SEATS, SEATS, TABLE, scaleAt } from "../lesson01/layout";
import { type P, add, clamp, easeInOut, hash01, lerp, lerpP, mul, strSeed, sub } from "../lesson01/rig/geom";
import { solveRig } from "../lesson01/rig/Character";
import { AMIR, BILAL, EXTRA_KIDS, type Look, TEACHER, YUSUF } from "../lesson01/rig/looks";
import type { ArmPose, Face, Pose } from "../lesson01/rig/pose";
import { kneel, sitCross, stand, toLocal } from "../lesson01/rig/presets";
import { Table } from "../lesson01/sets/Props";
import type { CharState } from "../lesson01/World";
import { kneelBlend, planWalk, walkAt, type WalkSpec } from "./rig/gait";
import { PW, PW_GRIP, Pinwheel, PinwheelInStand, PinwheelStand, STAND_SOCKET, pinwheelHubAt, pinwheelPoint } from "./sets/pinwheel";
import { WT, WT_S, WT_STAND, WT_TEACHER, WindowTable } from "./sets/windowCorner";
import { A3_EDITIONS, type A3Anchors } from "./edition";
import type { Timeline } from "./timeline";
import type { DepthItem, RoomState } from "./world";

export type Cam = { cx: number; cy: number; w: number };
export type SetKind = "room" | "memory" | "orchard";
export type Shot = { from: number; to: number; set: SetKind; cam: Key<Cam>[]; fade?: number; tag?: string; mem?: { at: number } };

const mixCam = (a: Cam, b: Cam, u: number): Cam => ({ cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), w: lerp(a.w, b.w, u) });
export const camAt = (s: Shot, t: number): Cam => track(s.cam, t, mixCam);

// ---------- Постоянная расстановка: 25 учеников (3 героя + 22 фоновых) ----------
type Hero = "yusuf" | "amir" | "bilal";
const kidsOrder: { look: Look; seat: number; hero?: Hero }[] = (() => {
  const heroAt: Record<number, { look: Look; hero: Hero }> = {
    [HERO_SEATS.yusuf]: { look: YUSUF, hero: "yusuf" },
    [HERO_SEATS.amir]: { look: AMIR, hero: "amir" },
    [HERO_SEATS.bilal]: { look: BILAL, hero: "bilal" },
  };
  let k = 0;
  return SEATS.map((_, i) => (heroAt[i] ? { ...heroAt[i], seat: i } : { look: EXTRA_KIDS[k++].look, seat: i }));
})();
export const ROSTER = kidsOrder.map((k) => k.look.key);

const headWorld = (look: Look, pose: Pose, root: P) => {
  const r = solveRig(look, pose);
  const s = scaleAt(root.y);
  return { x: root.x + r.headC.x * s, y: root.y + r.headC.y * s };
};

const Y_ROOT = { x: SEATS[HERO_SEATS.yusuf].x, y: SEATS[HERO_SEATS.yusuf].y };
const A_ROOT = { x: SEATS[HERO_SEATS.amir].x, y: SEATS[HERO_SEATS.amir].y };
const B_ROOT = { x: SEATS[HERO_SEATS.bilal].x, y: SEATS[HERO_SEATS.bilal].y };

const ySit = sitCross(YUSUF, -0.42);
const aSit = sitCross(AMIR, -0.4);
const bSit = sitCross(BILAL, -0.45);

// ---------- Места учителя и предметов (мир комнаты) ----------
// Учитель в этом фильме: у окна (стоит) → на коленях рядом с Юсуфом перед
// низким столиком (так кисть с вертушкой оказывается в 15–20 см от лица
// сидящего Юсуфа) → снова у окна.
export const K: P = { x: 1580, y: 2150 };
const SK = scaleAt(K.y);
const SW = scaleAt(WT_TEACHER.y);
const T_YAW_K = 0.55;
const T_YAW_W = 0.45;
const tKneel = kneel(TEACHER, T_YAW_K);
const tStandW = stand(TEACHER, T_YAW_W);
const HAND_T = TEACHER.body.hand;

// Подставка на низком столике: правая часть столешницы у дальнего края —
// справа от учителя (правая кисть достаёт, не пересекая корпус и лицо) и
// выше лица Юсуфа в кадре.
export const LS = scaleAt(TABLE.floorY);
const TABLE_TOP = TABLE.floorY - TABLE.legH * LS;
export const LOW: P = { x: 1765, y: TABLE_TOP - TABLE.topD * LS * 0.85 };

// Вертушка в подставке: нижний конец палочки (начало координат Pinwheel)
const seatedOrigin = (stand0: P, s: number): P => ({ x: stand0.x + STAND_SOCKET.x * s, y: stand0.y + (STAND_SOCKET.y + PW.insert) * s });
const standFromOrigin = (o: P, s: number): P => ({ x: o.x - STAND_SOCKET.x * s, y: o.y - (STAND_SOCKET.y + PW.insert) * s });
// Кисть учителя держит палочку выше середины (между подставкой и ротором):
// кулак не закрывает подставку и не касается лепестков.
const GRIP_P: P = { x: PW_GRIP.x, y: PW_GRIP.y - 22 };
const gripOf = (o: P, s: number, rot = 0) => pinwheelPoint(GRIP_P, { x: o.x, y: o.y, s, rot });
const hubOf = (o: P, s: number, rot = 0, yaw = 0) => pinwheelPoint(pinwheelHubAt(yaw), { x: o.x, y: o.y, s, rot });
export const WIN_HUB = hubOf(seatedOrigin(WT_STAND, WT_S), WT_S);
export const LOW_HUB = hubOf(seatedOrigin(LOW, LS), LS);

// Положения вертушки в руке учителя (на коленях у K): кисть держит палочку.
// REST — спокойно у правого колена; PRESENT — ротор на высоте рта Юсуфа,
// повернут к нему (Юсуф наклоняется; от рта до лепестков ≈ 15–20 см).
const REST_GRIP: P = { x: K.x + 115 * SK, y: K.y - 100 * SK }; // рука почти опущена, вертушка у правого колена
const PRESENT_GRIP: P = { x: 1698, y: 1952 };
const originFromGrip = (g: P, s: number, rot = 0) => sub(g, pinwheelPoint(GRIP_P, { s, rot }));

// ---------- Скорость ротора ----------
// Знак: + по часовой стрелке, если смотреть на лицевую сторону. У окна поток
// идёт из окна и попадает на тыльную сторону — ротор вращается против часовой;
// выдох Юсуфа попадает на лицевую сторону (завитки) — по часовой.
const omegaWindow = (t: number) => -(290 + 24 * Math.sin(t * 0.83) + 14 * Math.sin(t * 2.17 + 1.1));

// ---------- Построение режиссуры ----------
// anchors — слова реплик языковой версии, к которым привязаны моменты картинки.
export const buildDirection = (T: Timeline, anchors: A3Anchors = A3_EDITIONS.ru.anchors) => {
  const S = T.seg;
  const H = T.hold;
  const PZ = T.pause;
  const sc = T.scenes;
  const n = (k: number) => `80-1-3-${String(k).padStart(3, "0")}`;
  const seg = (k: number) => S[n(k)];
  // Слово внутри реплики (по таймингам; без озвучки — пропорционально).
  const wordAt = (k: number, word: string, fallback: number) => {
    const s = seg(k);
    const w = s.m.words.find((x) => x.text.replace(/[^\p{L}]/gu, "").toLowerCase() === word.toLowerCase());
    return w ? s.fileStart + w.start : s.start + (s.end - s.start) * fallback;
  };

  // ---- Моменты действий ----
  const ts = H.take.start;
  const tp = H.place.start;
  const ins0 = H.insert.start;
  const pk0 = H.pickUp.start;
  const sd0 = H.setDown.start;
  const A = {
    // сцена 2: у окна
    reach0: ts,
    grip: ts + 0.75,
    lift0: ts + 0.9,
    lift1: ts + 1.4,
    bring1: ts + 2.1,
    // на коленях у K: ставит подставку и вынимает вертушку
    letL: tp,
    move0: tp + 0.15,
    move1: tp + 1.2,
    contact: tp + 1.55,
    pull0: tp + 1.75,
    pull1: tp + 2.2,
    rest1: H.place.end + 0.5,
    // выдох
    present0: H.present.start - 0.5,
    present1: H.present.start + 0.9,
    inhale: H.blow.start + 0.15,
    exhale: H.blow.start + 0.8, // начало выдоха
    exhaleEnd: H.blow.start + 2.2,
    back0: seg(10).start + 1.6, // вертушка уходит к колену, ротор почти остановился
    back1: seg(10).start + 2.8,
    // Амир: ладонь у щеки
    cheek0: H.cheek.start,
    // сцена 5: в подставку
    ins0,
    insAbove: ins0 + 1.25,
    insDown: ins0 + 1.95,
    insOpen: ins0 + 2.25,
    insBack: ins0 + 3.4,
    // сцена 8: берёт с подставкой, поднимается, уносит к окну
    pk0,
    pkGrip: pk0 + 0.7,
    pkLift0: pk0 + 0.85,
    pkLift1: pk0 + 1.25,
    pkBring1: pk0 + 1.8,
    rise0: pk0 + 1.55,
    rise1: pk0 + 2.95,
    sd0,
    sdAbove: sd0 + 1.05,
    sdContact: sd0 + 1.45,
    sdOpen: sd0 + 1.7,
    sdBack: sd0 + 2.6,
  };

  // ---- Проходки учителя (две склейки: у окна → у столика детей → у окна) ----
  const fit = (spec: Omit<WalkSpec, "speed">, dur: number) => {
    // скорость подбирается так, чтобы проходка заняла dur секунд
    let speed = 420;
    let plan = planWalk({ ...spec, speed });
    for (let i = 0; i < 6; i++) {
      const got = plan.t1 - spec.t0;
      speed *= got / dur;
      plan = planWalk({ ...spec, speed });
    }
    return plan;
  };
  const walkA = fit({ look: TEACHER, t0: H.walkA.start - 0.1, path: [WT_TEACHER, { x: 2150, y: 1282 }, { x: 1960, y: 1306 }, { x: 1780, y: 1336 }], yawStart: T_YAW_W, yawEnd: -0.55, firstFoot: "L" }, 4.4);
  const walkB = fit({ look: TEACHER, t0: H.walkB.start - 0.7, path: [{ x: 1150, y: 2150 }, { x: 1360, y: 2150 }, K], yawStart: 0.55, yawEnd: T_YAW_K, firstFoot: "R" }, H.walkB.end - H.walkB.start + 0.7);
  const walkC = fit({ look: TEACHER, t0: H.walkC.start, path: [K, { x: 1360, y: 2150 }, { x: 1100, y: 2150 }], yawStart: T_YAW_K, yawEnd: -0.55, firstFoot: "L" }, 3.8);
  const walkD = fit({ look: TEACHER, t0: H.walkD.start - 0.7, path: [{ x: 1840, y: 1326 }, { x: 2080, y: 1290 }, WT_TEACHER], yawStart: 0.55, yawEnd: T_YAW_W, firstFoot: "R" }, H.walkD.end - H.walkD.start + 0.7);
  const walks = [
    { plan: walkA, from: H.walkA.start, to: H.walkB.start },
    { plan: walkB, from: H.walkB.start, to: H.kneel.start },
    { plan: walkC, from: H.walkC.start, to: H.walkD.start },
    { plan: walkD, from: H.walkD.start, to: Infinity },
  ];

  // ---- Скорость и накопленный угол ротора (таблица 240 Гц) ----
  const leave = H.walkA.start + 0.9; // вертушка вышла из потока у окна
  const W_STOP = 3.4; // за столько секунд ротор останавливается после выхода из потока
  const enterFlow = A.sdContact - 0.25; // снова в потоке у окна
  const ex0 = A.exhale + 0.12; // ротор откликается после начала выдоха
  const W_BLOW = 520;
  const omegaAt = (t: number): number => {
    if (t < leave) return omegaWindow(t);
    if (t < ex0) {
      const u = (t - leave) / W_STOP;
      return u >= 1 ? 0 : omegaWindow(leave) * (1 - u) * (1 - u);
    }
    const peak = (tt: number) => W_BLOW * (1 - Math.exp(-(tt - ex0) / 0.38));
    if (t < A.exhaleEnd) return peak(t);
    const Td = 4.4;
    const u = (t - A.exhaleEnd) / Td;
    const wBlow = u >= 1 ? 0 : peak(A.exhaleEnd) * (1 - u) * (1 - u);
    if (t < enterFlow) return wBlow;
    // у окна: медленный разгон в прежнем потоке
    return omegaWindow(t) * (1 - Math.exp(-(t - enterFlow) / 1.1));
  };
  const DT = 1 / 240;
  const NT = Math.ceil((T.total + 2) / DT) + 2;
  const angTab = new Float64Array(NT);
  for (let i = 1; i < NT; i++) angTab[i] = angTab[i - 1] + 0.5 * (omegaAt((i - 1) * DT) + omegaAt(i * DT)) * DT;
  const spinAt = (t: number) => {
    const x = Math.max(0, t) / DT;
    const i = Math.min(NT - 2, Math.floor(x));
    const angle = lerp(angTab[i], angTab[i + 1], x - i);
    return { angle, omega: omegaAt(t), blur: omegaAt(t) / T.fps };
  };

  // ---- Планы ----
  const shots: Shot[] = [];
  const add2 = (from: number, to: number, set: SetKind, cams: (Cam & { at?: number; dur?: number })[], extra: Partial<Shot> = {}) => {
    const cam: Key<Cam>[] = cams.map((c, i) => ({ at: c.at ?? from, v: { cx: c.cx, cy: c.cy, w: c.w }, dur: c.dur ?? (i === 0 ? undefined : to - from) }));
    shots.push({ from, to, set, cam, ...extra });
  };
  const fixed = (from: number, to: number, c: Cam, extra: Partial<Shot> = {}) => add2(from, to, "room", [c], extra);
  const drift = (from: number, to: number, a: Cam, b: Cam, extra: Partial<Shot> = {}) => add2(from, to, "room", [{ ...a, at: from }, { ...b, at: from, dur: to - from }], extra);

  const CU = {
    wide: { cx: 1920, cy: 1080, w: 3840 },
    room: { cx: 2010, cy: 1125, w: 3600 },
    winMed: { cx: 2440, cy: 845, w: 1150 }, // головы детей внизу не срезаны по лицу
    teacherWin: { cx: 2400, cy: 900, w: 820 },
    pwDetail: { cx: 2535, cy: 880, w: 380 }, // учитель у окна не попадает в кадр полоской лица
    kidsWin: { cx: 2150, cy: 1300, w: 2300 },
    // крупный план Юсуфа сдвинут вправо: сидящий прямо учитель не попадает в
    // кадр срезанным лицом (только край плеча). Пока учитель держит вертушку и
    // наклонён к Юсуфу (сцены 3–5), реплики Юсуфа — на двойном плане two.
    yusuf: { cx: 1910, cy: 1840, w: 540 },
    amir: { cx: 2245, cy: 1790, w: 620 }, // Юсуф не попадает в кадр срезанным лицом
    // Билал сидит за Юсуфом и Амиром: их лица в кадре целиком (не торчат снизу)
    bilal: { cx: 2120, cy: 1660, w: 760 },
    teacherK: { cx: 1620, cy: 1790, w: 820 },
    teacherKClose: { cx: 1625, cy: 1740, w: 700 }, // Юсуф справа целиком, не срезан краем
    // двойной план: Билал на заднем плане целиком, а не срезан верхним краем
    two: { cx: 1735, cy: 1720, w: 900 },
    // двойной план пониже: вертушка у колена учителя видна целиком (реплики о ней)
    twoLow: { cx: 1690, cy: 1756, w: 1000 },
    blow: { cx: 1900, cy: 1845, w: 560 }, // рука с вертушкой слева, Юсуф в центре
    low: { cx: 1580, cy: 1775, w: 760 }, // Юсуф справа целиком
    // общие планы класса: головы заднего ряда целиком в кадре
    group: { cx: 1985, cy: 1645, w: 1840 },
    kids: { cx: 2330, cy: 1620, w: 1780 },
    windowView: { cx: 2740, cy: 560, w: 950 },
  };

  // Сцена 1 — «Крутится сама?»
  drift(0, H.notice.start, CU.wide, CU.room);
  // Юсуф замечает вертушку: оборачивается к окну и тянется посмотреть
  drift(H.notice.start, seg(1).end + 0.35, { cx: 1870, cy: 1815, w: 640 }, { cx: 1868, cy: 1818, w: 590 });
  fixed(seg(1).end + 0.35, seg(2).end + 0.35, CU.amir);
  fixed(seg(2).end + 0.35, seg(3).end + 0.35, CU.bilal);
  fixed(seg(3).end + 0.35, seg(4).end + 0.15, CU.winMed);
  drift(seg(4).end + 0.15, H.detail.end, CU.pwDetail, { cx: 2533, cy: 874, w: 340 });
  fixed(H.detail.end, sc.blow.start, CU.kidsWin); // без короткого плана у окна перед сценой 2

  // Сцена 2 — «Подуть — и проверить»
  drift(sc.blow.start, H.walkA.start + 0.6, CU.teacherWin, { cx: 2360, cy: 920, w: 900 });
  drift(H.walkA.start + 0.6, H.walkB.start, { cx: 2250, cy: 1010, w: 1500 }, { cx: 2060, cy: 1060, w: 1650 });
  drift(H.walkB.start, H.kneel.end, { cx: 1480, cy: 1660, w: 1760 }, { cx: 1630, cy: 1680, w: 1700 }); // учитель целиком до колен
  fixed(H.kneel.end, H.place.end, CU.teacherK);
  fixed(H.place.end, seg(7).end + 0.35, CU.twoLow);
  // склейка на крупный план — когда учитель уже выпрямился, протянув вертушку
  fixed(seg(7).end + 0.35, seg(8).end + 0.6, CU.teacherK);
  drift(seg(8).end + 0.6, seg(9).end + 0.45, CU.blow, { cx: 1895, cy: 1843, w: 530 });
  fixed(seg(9).end + 0.45, seg(10).end + 0.2, CU.twoLow);
  fixed(seg(10).end + 0.2, seg(11).end + 0.35, CU.amir);
  fixed(seg(11).end + 0.35, sc.senses.start, CU.teacherK);

  // Сцена 3 — «Не только глазами»: два коротких воспоминания на реплике 13
  const m1 = wordAt(13, anchors.a13pinwheel, 0.55) - 0.3;
  const m2 = wordAt(13, anchors.a13skin, 0.75) - 0.25;
  const m3 = seg(13).end + 0.35;
  drift(sc.senses.start, m1, CU.teacherK, { cx: 1630, cy: 1780, w: 760 });
  shots.push({ from: m1, to: m2, set: "memory", mem: { at: A.exhale - 0.25 }, fade: 0.5, cam: [{ at: m1, v: CU.blow }] });
  shots.push({ from: m2, to: m3, set: "memory", mem: { at: A.cheek0 + 0.2 }, fade: 0.5, cam: [{ at: m2, v: CU.amir }] });
  fixed(m3, seg(14).end + 0.35, CU.bilal, { fade: 0.5, tag: "dip" }); // выход из воспоминания
  fixed(seg(14).end + 0.35, seg(15).end + 0.35, CU.teacherK);
  fixed(seg(15).end + 0.35, seg(16).start - 0.1, CU.group);
  drift(seg(16).start - 0.1, PZ[n(16)].start + 0.9, CU.teacherK, CU.teacherKClose);
  fixed(PZ[n(16)].start + 0.9, seg(17).start - 0.1, CU.group); // пауза: класс думает
  fixed(seg(17).start - 0.1, seg(17).end + 0.35, CU.two);
  fixed(seg(17).end + 0.35, seg(18).end + 0.4, CU.amir);
  fixed(seg(18).end + 0.4, sc.question.start, CU.group);

  // Сцена 4 — «Вопрос Юсуфа»
  drift(sc.question.start, seg(19).end + 0.45, CU.two, { cx: 1770, cy: 1700, w: 820 });
  fixed(seg(19).end + 0.45, seg(20).end + 0.5, CU.teacherKClose);
  fixed(seg(20).end + 0.5, seg(21).end + 0.35, CU.amir);
  drift(seg(21).end + 0.35, seg(22).end + 0.4, CU.teacherK, CU.two);
  const wApple = wordAt(23, anchors.a23apple, 0.4) - 0.15;
  fixed(seg(22).end + 0.4, wApple, CU.bilal);
  // яблоня держится до «растениях» и через светлый тон сразу переходит в вид
  // за окном (без короткого промежуточного плана учителя)
  const wPlants = wordAt(24, anchors.a24plants, 0.2) - 0.1;
  shots.push({ from: wApple, to: wPlants, set: "orchard", fade: 0.4, cam: [{ at: wApple, v: { cx: 600, cy: 600, w: 820 } }, { at: wApple, v: { cx: 585, cy: 600, w: 700 }, dur: wPlants - wApple }] });
  drift(wPlants, seg(24).end + 0.6, CU.windowView, { cx: 2735, cy: 545, w: 880 }, { fade: 0.4, tag: "dip" }); // выход из вставки
  fixed(seg(24).end + 0.6, sc.creation.start, CU.group);

  // Сцена 5 — «Воздух — творение»
  fixed(sc.creation.start, seg(25).end + 0.4, CU.two);
  fixed(seg(25).end + 0.4, seg(26).end + 0.5, CU.teacherKClose);
  fixed(seg(26).end + 0.5, H.insert.end, CU.low);
  fixed(H.insert.end, seg(27).end + 0.35, CU.bilal);
  const w28b = wordAt(28, anchors.a28second, 0.55) - 0.1;
  fixed(seg(27).end + 0.35, w28b, CU.teacherK);
  fixed(w28b, seg(28).end + 0.5, CU.group);

  // Сцена 6 — «Любая невидимая вещь?»
  fixed(sc.invisible.start, seg(29).end + 0.35, CU.amir);
  fixed(seg(29).end + 0.35, seg(30).end + 0.45, CU.teacherKClose);
  fixed(seg(30).end + 0.45, seg(31).end + 0.35, CU.bilal);
  fixed(seg(31).end + 0.35, seg(32).end + 0.45, CU.teacherK);
  fixed(seg(32).end + 0.45, seg(33).end + 0.35, CU.yusuf);
  drift(seg(33).end + 0.35, seg(34).end + 0.6, CU.two, { cx: 1745, cy: 1700, w: 820 });
  fixed(seg(34).end + 0.6, sc.two.start, CU.group);

  // Сцена 7 — «Два вопроса»
  drift(sc.two.start, PZ[n(35)].start + 0.9, CU.teacherK, CU.teacherKClose);
  fixed(PZ[n(35)].start + 0.9, seg(36).start - 0.1, CU.group);
  fixed(seg(36).start - 0.1, seg(36).end + 0.35, CU.yusuf);
  drift(seg(36).end + 0.35, PZ[n(37)].start + 0.9, CU.teacherK, CU.teacherKClose);
  fixed(PZ[n(37)].start + 0.9, seg(38).start - 0.1, CU.kids);
  fixed(seg(38).start - 0.1, seg(38).end + 0.35, CU.amir);
  fixed(seg(38).end + 0.35, sc.ask.start, CU.teacherK);

  // Сцена 8 — «Можно спрашивать»
  fixed(sc.ask.start, seg(40).end + 0.35, CU.yusuf);
  fixed(seg(40).end + 0.35, A.pk0 + 0.5, CU.two);
  // учитель встаёт и идёт к окну: кадр выше и шире, чтобы голова не выходила за край
  drift(A.pk0 + 0.5, H.walkD.start, { cx: 1560, cy: 1630, w: 1450 }, { cx: 1420, cy: 1655, w: 1800 });
  drift(H.walkD.start, A.sdBack + 0.4, { cx: 2240, cy: 1000, w: 1500 }, { cx: 2420, cy: 925, w: 1200 });
  fixed(A.sdBack + 0.4, seg(42).end + 0.45, CU.bilal);
  drift(seg(42).end + 0.45, T.total + 1, CU.room, { cx: 1960, cy: 1100, w: 3720 });

  shots.sort((a, b) => a.from - b.from);

  // ---- Внимание класса ----
  const heads = { yusuf: headWorld(YUSUF, ySit, Y_ROOT), amir: headWorld(AMIR, aSit, A_ROOT), bilal: headWorld(BILAL, bSit, B_ROOT) };
  const tHeadK = headWorld(TEACHER, tKneel, K);
  const tHeadW = headWorld(TEACHER, tStandW, WT_TEACHER);
  const kneelingAt = (t: number) => t >= H.kneel.start && t < A.rise1;
  const teacherHead = (t: number) => (kneelingAt(t) ? tHeadK : tHeadW);
  const speakerHead = (role: string, t: number): P => (role === "yusuf" ? heads.yusuf : role === "amir" ? heads.amir : role === "bilal" ? heads.bilal : teacherHead(t));
  const attnKeys: Key<P>[] = [{ at: 0, v: WIN_HUB }];
  for (const s of Object.values(S).sort((a, b) => a.start - b.start)) attnKeys.push({ at: s.start - 0.2, v: speakerHead(s.role, s.start), dur: 0.5 });
  const special: Key<P>[] = [
    { at: H.notice.start - 0.4, v: WIN_HUB, dur: 0.7 },
    { at: seg(4).end - 0.3, v: WIN_HUB, dur: 0.6 },
    { at: H.take.start, v: WIN_HUB, dur: 0.5 },
    { at: H.stopLook.start, v: { x: REST_GRIP.x, y: REST_GRIP.y - 110 }, dur: 0.6 },
    { at: H.present.start - 0.3, v: { x: PRESENT_GRIP.x, y: PRESENT_GRIP.y - 100 }, dur: 0.6 },
    { at: H.blow.start, v: { x: PRESENT_GRIP.x, y: PRESENT_GRIP.y - 100 }, dur: 0.4 },
    { at: H.insert.start, v: LOW_HUB, dur: 0.7 },
    { at: H.pickUp.start + 0.4, v: LOW_HUB, dur: 0.6 },
    { at: A.sdContact - 0.6, v: WIN_HUB, dur: 0.8 },
  ];
  const attn = [...attnKeys, ...special].sort((a, b) => a.at - b.at);
  const walkWindows = [
    [H.take.start + 1.0, H.kneel.end],
    [A.pkLift1, A.sdContact - 0.6],
  ];
  const sfx = {
    grip: A.grip,
    standLift: A.lift0,
    standPlace: A.contact,
    stickOut: A.pull0 + 0.1,
    stickIn: A.insDown - 0.05,
    standLiftLow: A.pkLift0,
    standPlaceWin: A.sdContact,
    clothDown: H.kneel.start + 0.2,
    clothUp: A.rise0 + 0.1,
    inhale: A.inhale,
    exhale: A.exhale,
  };

  return { shots, A, walks, spinAt, omegaAt, attn, walkWindows, heads, teacherHead, wordAt, anchors, n, seg, sfx, m1, m2, m3, leave, enterFlow };
};
export type Direction = ReturnType<typeof buildDirection>;

// ---------- Вертушка и подставка в момент t ----------
// pw — вертушка: начало координат (нижний конец палочки) в мире, масштаб,
// наклон палочки, поворот плоскости ротора; stand — подставка; inStand —
// вертушка стоит в подставке; held — в руке учителя (рисуется внутри его
// кисти, под пальцами); unit — подставка переносится вместе с вертушкой.
export type PropState = {
  pw: { o: P; s: number; rot: number; yaw: number };
  stand: { x: number; y: number; s: number; depth: number };
  inStand: boolean;
  held: boolean;
  unit: boolean;
  leftUnder: number; // 0…1 левая кисть под подставкой
};

// Где вертушка в руках идущего или поднимающегося учителя (перед корпусом,
// подставка на уровне пояса): от его позы, корня и масштаба.
const carryOrigin = (pose: Pose, root: P, st: number): P => {
  const r = solveRig(TEACHER, pose);
  // в правой руке сбоку, подставка на уровне бедра: рука не перекрывает корпус и лицо
  const local = { x: r.shoulderR.x + 22, y: r.shoulderC.y + 300 };
  const standW = add(root, mul(local, st));
  return seatedOrigin(standW, st);
};

type TeacherBody = { root: P; st: number; pose: Pose; mode: "window" | "walk" | "kneel" };

const blendP = (a: P, b: P, u: number) => lerpP(a, b, easeInOut(clamp(u)));
const arc = (a: P, b: P, u: number, lift: number) => {
  const k = easeInOut(clamp(u));
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) - Math.sin(k * Math.PI) * lift };
};

export const teacherBodyAt = (T: Timeline, D: Direction, t: number): TeacherBody => {
  const H = T.hold;
  const A = D.A;
  for (const w of D.walks) {
    if (t >= w.from && t < w.to) {
      const r = walkAt(w.plan, t);
      // проходка закончилась — стоит (у окна — в своём режиме)
      return { root: r.root, st: r.scale, pose: r.pose, mode: r.done && r.root.y < 1600 ? "window" : "walk" };
    }
  }
  if (t >= H.kneel.start && t < A.rise1) {
    const u = t < H.kneel.end ? easeInOut((t - H.kneel.start) / (H.kneel.end - H.kneel.start)) : t >= A.rise0 ? 1 - easeInOut((t - A.rise0) / (A.rise1 - A.rise0)) : 1;
    return { root: K, st: SK, pose: u >= 1 ? tKneel : kneelBlend(TEACHER, T_YAW_K, u), mode: "kneel" };
  }
  if (t >= A.rise1 && t < D.walks[2].from) return { root: K, st: SK, pose: stand(TEACHER, T_YAW_K), mode: "kneel" };
  return { root: WT_TEACHER, st: SW, pose: tStandW, mode: "window" };
};

export const propAt = (T: Timeline, D: Direction, t: number, body: TeacherBody): PropState => {
  const A = D.A;
  const H = T.hold;
  const winSeat = seatedOrigin(WT_STAND, WT_S);
  const lowSeat = seatedOrigin(LOW, LS);
  const yawFor = (tt: number) => {
    // ротор поворачивается к Юсуфу только пока учитель подносит вертушку
    const inK = easeInOut(clamp((tt - A.present0) / (A.present1 - A.present0)));
    const outK = easeInOut(clamp((tt - A.back0) / (A.back1 - A.back0)));
    return 55 * inK * (1 - outK);
  };
  const atWindow = (): PropState => ({ pw: { o: winSeat, s: WT_S, rot: 0, yaw: 0 }, stand: { ...WT_STAND, s: WT_S, depth: WT.floorY + 0.5 }, inStand: true, held: false, unit: false, leftUnder: 0 });
  const carried = (leftUnder: number): PropState => {
    const o = carryOrigin(body.pose, body.root, body.st);
    const st = standFromOrigin(o, body.st);
    return { pw: { o, s: body.st, rot: 0, yaw: 0 }, stand: { ...st, s: body.st, depth: body.root.y + 1 }, inStand: true, held: true, unit: true, leftUnder };
  };
  // сцена 1 и начало 2: на столике у окна
  if (t < A.lift0) return atWindow();
  // подъём вместе с подставкой и перенос к корпусу
  if (t < A.bring1 && t < H.walkA.start) {
    const lifted = { x: winSeat.x, y: winSeat.y - 18 * WT_S };
    if (t < A.lift1) {
      const o = blendP(winSeat, lifted, (t - A.lift0) / (A.lift1 - A.lift0));
      return { pw: { o, s: WT_S, rot: 0, yaw: 0 }, stand: { ...standFromOrigin(o, WT_S), s: WT_S, depth: body.root.y + 1 }, inStand: true, held: true, unit: true, leftUnder: 0 };
    }
    const u = (t - A.lift1) / (A.bring1 - A.lift1);
    const target = carryOrigin(body.pose, body.root, body.st);
    const s = lerp(WT_S, body.st, easeInOut(clamp(u)));
    const o = arc(lifted, target, u, 6);
    return { pw: { o, s, rot: 0, yaw: 0 }, stand: { ...standFromOrigin(o, s), s, depth: body.root.y + 1 }, inStand: true, held: true, unit: true, leftUnder: 0 };
  }
  // проходки и посадка — перед корпусом
  if (t < A.move0) return carried(0);
  // на коленях: ставит подставку на левую часть низкого столика
  if (t < A.contact) {
    const start = carryOrigin(body.pose, body.root, body.st);
    const above = { x: lowSeat.x, y: lowSeat.y - 16 * LS };
    let o: P;
    let s: number;
    if (t < A.move1) {
      const u = (t - A.move0) / (A.move1 - A.move0);
      o = arc(start, above, u, 24);
      s = lerp(body.st, LS, easeInOut(clamp(u)));
    } else {
      o = blendP(above, lowSeat, (t - A.move1) / (A.contact - A.move1));
      s = LS;
    }
    return { pw: { o, s, rot: 0, yaw: 0 }, stand: { ...standFromOrigin(o, s), s, depth: TABLE.floorY + 0.5 }, inStand: true, held: true, unit: true, leftUnder: 0 };
  }
  const lowStand = { ...LOW, s: LS, depth: TABLE.floorY + 0.5 };
  // вертушка вынута из подставки и в руке учителя
  if (t < A.insDown) {
    const rest = originFromGrip(REST_GRIP, SK);
    const present = originFromGrip(PRESENT_GRIP, SK, 4);
    const pulled = { x: lowSeat.x, y: lowSeat.y - 34 * LS };
    if (t < A.pull0) return { pw: { o: lowSeat, s: LS, rot: 0, yaw: 0 }, stand: lowStand, inStand: true, held: true, unit: false, leftUnder: 0 };
    if (t < A.pull1) {
      const o = blendP(lowSeat, pulled, (t - A.pull0) / (A.pull1 - A.pull0));
      return { pw: { o, s: LS, rot: 0, yaw: 0 }, stand: lowStand, inStand: false, held: true, unit: false, leftUnder: 0 };
    }
    if (t < A.rest1) {
      const u = (t - A.pull1) / (A.rest1 - A.pull1);
      return { pw: { o: arc(pulled, rest, u, 10), s: lerp(LS, SK, easeInOut(clamp(u))), rot: 0, yaw: 0 }, stand: lowStand, inStand: false, held: true, unit: false, leftUnder: 0 };
    }
    // подносит к Юсуфу и возвращает к колену
    const toP = easeInOut(clamp((t - A.present0) / (A.present1 - A.present0)));
    const backP = easeInOut(clamp((t - A.back0) / (A.back1 - A.back0)));
    const k = toP * (1 - backP);
    let o = lerpP(rest, present, k);
    let rot = 4 * k;
    let s = SK;
    // сцена 5: в подставку
    if (t >= A.ins0) {
      const above = { x: lowSeat.x, y: lowSeat.y - 30 * LS };
      if (t < A.insAbove) {
        const u = (t - A.ins0) / (A.insAbove - A.ins0);
        o = arc(rest, above, u, 20);
        s = lerp(SK, LS, easeInOut(clamp(u)));
      } else {
        o = blendP(above, lowSeat, (t - A.insAbove) / (A.insDown - A.insAbove));
        s = LS;
      }
      rot = 0;
    }
    return { pw: { o, s, rot, yaw: yawFor(t) }, stand: lowStand, inStand: false, held: true, unit: false, leftUnder: 0 };
  }
  // в подставке на низком столике
  if (t < A.pkLift0) return { pw: { o: lowSeat, s: LS, rot: 0, yaw: 0 }, stand: lowStand, inStand: true, held: t >= A.pkGrip - 0.05 || t < A.insOpen, unit: false, leftUnder: 0 };
  // сцена 8: поднимает вместе с подставкой
  if (t < A.pkBring1) {
    const lifted = { x: lowSeat.x, y: lowSeat.y - 16 * LS };
    if (t < A.pkLift1) {
      const o = blendP(lowSeat, lifted, (t - A.pkLift0) / (A.pkLift1 - A.pkLift0));
      return { pw: { o, s: LS, rot: 0, yaw: 0 }, stand: { ...standFromOrigin(o, LS), s: LS, depth: TABLE.floorY + 0.5 }, inStand: true, held: true, unit: true, leftUnder: 0 };
    }
    const u = (t - A.pkLift1) / (A.pkBring1 - A.pkLift1);
    const target = carryOrigin(body.pose, body.root, body.st);
    const s = lerp(LS, body.st, easeInOut(clamp(u)));
    const o = arc(lifted, target, u, 10);
    return { pw: { o, s, rot: 0, yaw: 0 }, stand: { ...standFromOrigin(o, s), s, depth: body.root.y + 1 }, inStand: true, held: true, unit: true, leftUnder: 0 };
  }
  // подъём, проходки — перед корпусом; у окна — ставит на столик
  if (t < A.sd0) return carried(0);
  if (t < A.sdContact) {
    const start = carryOrigin(body.pose, body.root, body.st);
    // сначала поднимает над столешницей, затем переносит и опускает (подставка
    // не проходит сквозь угол столика)
    const above = { x: winSeat.x, y: winSeat.y - 36 * WT_S };
    let o: P;
    let s: number;
    if (t < A.sdAbove) {
      const u = (t - A.sd0) / (A.sdAbove - A.sd0);
      const ctrl = { x: lerp(start.x, above.x, 0.15), y: Math.min(start.y, above.y) - 40 * WT_S };
      o = bezier(start, ctrl, above, easeInOut(clamp(u)));
      s = lerp(body.st, WT_S, easeInOut(clamp(u)));
    } else {
      o = blendP(above, winSeat, (t - A.sdAbove) / (A.sdContact - A.sdAbove));
      s = WT_S;
    }
    return { pw: { o, s, rot: 0, yaw: 0 }, stand: { ...standFromOrigin(o, s), s, depth: WT.floorY + 0.5 }, inStand: true, held: true, unit: true, leftUnder: 0 };
  }
  const st = atWindow();
  return { ...st, held: t < A.sdOpen };
};

// ---------- Состояние комнаты в момент t ----------
const faceWith = (base: Face, gaze: P, blink: number, m: { open: number; wide: number; round: number }): Face => ({ ...base, gaze, blink, mouthOpen: m.open, mouthWide: m.wide, mouthRound: m.round });
const breathe = (id: string, t: number) => {
  const sd = strSeed(id);
  const per = 3.4 + hash01(sd + 3) * 1.4;
  return Math.sin((t / per) * Math.PI * 2 + hash01(sd) * 6.28) * 1.6;
};
const withArms = (p: Pose, armL?: Partial<ArmPose>, armR?: Partial<ArmPose>, extra: Partial<Pose> = {}): Pose => ({
  ...p,
  armL: armL ? { ...p.armL, ...armL } : p.armL,
  armR: armR ? { ...p.armR, ...armR } : p.armR,
  ...extra,
});

// Кисть, сжимающая вертикальную палочку: кулак продолжает предплечье, его
// середина — в точке захвата (два прохода IK: направление предплечья → запястье).
const fistOn = (look: Look, pose: Pose, root: P, sc: number, grip: P, side: "L" | "R", force?: number): { pose: Pose; wrist: P } => {
  const L = look.body.hand;
  const arm = side === "R" ? "armR" : "armL";
  let wrist = grip;
  let p = pose;
  const out = side === "R" ? 1 : -1;
  for (let i = 0; i < 3; i++) {
    const base = side === "R" ? pose.armR : pose.armL;
    // локоть — прежде всего вниз, при равенстве — наружу (из двух решений ИК):
    // рука не поднимается над соседом и не выворачивается к корпусу;
    // force — заданное решение на весь непрерывный план (без перескока локтя
    // между решениями посреди движения)
    let best: { p: Pose; score: number } | null = null;
    for (const bend of force ? [force] : [1, -1]) {
      const q: Pose = { ...pose, [arm]: { ...base, a1: 0, a2: 0, target: toLocal(wrist, root, sc), bend, hand: "fist", handRot: 0, handAbs: undefined, front: true } };
      const E = solveRig(look, q).arms[side].E;
      const score = E.y + 0.35 * E.x * out;
      if (!best || score > best.score) best = { p: q, score };
    }
    p = best!.p;
    const r = solveRig(look, p);
    const g = r.arms[side];
    const d = { x: g.W.x - g.E.x, y: g.W.y - g.E.y };
    const len = Math.hypot(d.x, d.y) || 1;
    wrist = sub(grip, mul({ x: d.x / len, y: d.y / len }, L * 0.42 * sc));
  }
  return { pose: p, wrist };
};

// Из двух решений ИК — то, где локоть ниже (при равенстве — наружу).
const elbowDownBend = (look: Look, pose: Pose, side: "L" | "R", target: P) => {
  const out = side === "R" ? 1 : -1;
  let best = { bend: 1, score: -Infinity };
  for (const bend of [1, -1]) {
    const base = side === "R" ? pose.armR : pose.armL;
    const q: Pose = { ...pose, [side === "R" ? "armR" : "armL"]: { ...base, a1: 0, a2: 0, target, bend } };
    const E = solveRig(look, q).arms[side].E;
    const score = E.y + 0.35 * E.x * out;
    if (score > best.score) best = { bend, score };
  }
  return best.bend;
};

// Квадратичная кривая Безье a → (c) → b.
const bezier = (a: P, c: P, b: P, u: number): P => ({ x: (1 - u) * (1 - u) * a.x + 2 * u * (1 - u) * c.x + u * u * b.x, y: (1 - u) * (1 - u) * a.y + 2 * u * (1 - u) * c.y + u * u * b.y });

// Из двух решений ИК — то, что продолжает локоть исходной позы (при той же
// кисти одно из решений совпадает с ним): жест начинается без перескока.
const nearestBend = (look: Look, pose: Pose, side: "L" | "R", target: P, E0: P) => {
  let best = { bend: 1, d: Infinity };
  for (const bend of [1, -1]) {
    const base = side === "R" ? pose.armR : pose.armL;
    const q: Pose = { ...pose, [side === "R" ? "armR" : "armL"]: { ...base, a1: 0, a2: 0, target, bend } };
    const E = solveRig(look, q).arms[side].E;
    const d = Math.hypot(E.x - E0.x, E.y - E0.y);
    if (d < best.d) best = { bend, d };
  }
  return best.bend;
};

// Наклон корпуса к цели (плечо на удобном расстоянии ≈ 70 % длины руки).
const leanToward = (look: Look, base: Pose, root: P, sc: number, w: P, side: "L" | "R", lo: number, hi: number, k = 0.7) => {
  const armLen = (look.body.upperArm + look.body.foreArm) * sc;
  // цель и так близко — корпус не отклоняется от неё (только тянется к далёкой)
  const r0 = solveRig(look, base);
  const sh0 = add(root, mul(side === "L" ? r0.shoulderL : r0.shoulderR, sc));
  if (Math.hypot(sh0.x - w.x, sh0.y - w.y) <= k * armLen) return base.lean;
  let best = base.lean;
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

const nodAt = (starts: number[], t: number, amp = 0.12) => {
  let nod = 0;
  for (const a of starts) {
    const d = t - a;
    if (d > -0.1 && d < 0.6) nod = Math.max(nod, Math.sin(((d + 0.1) / 0.7) * Math.PI) * amp);
  }
  return nod;
};

export const roomStateAt = (T: Timeline, D: Direction, t: number): RoomState => {
  const S = T.seg;
  const H = T.hold;
  const PZ = T.pause;
  const A = D.A;
  const seg = D.seg;
  const n = D.n;
  const chars: CharState[] = [];
  const items: DepthItem[] = [];
  const inPause = Object.values(PZ).some((p) => t >= p.start && t < p.end);
  const body = teacherBodyAt(T, D, t);
  const prop = propAt(T, D, t, body);
  const spin = D.spinAt(t);
  const hub = hubOf(prop.pw.o, prop.pw.s, prop.pw.rot, prop.pw.yaw);
  const walking = D.walkWindows.some(([a, b]) => t >= a && t < b);
  // во время переноса дети провожают взглядом вертушку в руках учителя
  const attention = (tt: number): P => (walking ? hub : track(D.attn, tt, lerpP));

  // ---- столики, подставка, вертушка ----
  items.push({ y: WT.floorY, key: "wtable", el: <WindowTable /> });
  items.push({ y: TABLE.floorY, key: "ltable", el: <Table x={TABLE.x} floorY={TABLE.floorY} s={LS} w={TABLE.w} legH={TABLE.legH} topD={TABLE.topD} /> });
  if (!prop.held) {
    if (prop.inStand) items.push({ y: prop.stand.depth, key: "pw", el: <PinwheelInStand x={prop.stand.x} y={prop.stand.y} s={prop.stand.s} angle={spin.angle} yaw={prop.pw.yaw} blur={spin.blur} /> });
  } else if (!prop.unit) {
    items.push({ y: prop.stand.depth, key: "stand", el: <PinwheelStand x={prop.stand.x} y={prop.stand.y} s={prop.stand.s} /> });
  }

  // ---- ученики ----
  kidsOrder.forEach((k) => {
    const seat = SEATS[k.seat];
    const root = { x: seat.x, y: seat.y };
    const id = k.look.key;
    const sd = strSeed(id);
    let pose: Pose = k.hero === "yusuf" ? ySit : k.hero === "amir" ? aSit : k.hero === "bilal" ? bSit : sitCross(k.look, -0.32 - hash01(sd + 5) * 0.25);
    const delay = 0.1 + hash01(sd + 11) * 0.6;
    let target = attention(t - delay);
    // редкие взгляды в сторону у фоновых детей
    const glancePeriod = 9 + hash01(sd + 21) * 9;
    const gPhase = (t + hash01(sd + 22) * glancePeriod) % glancePeriod;
    if (!k.hero && gPhase < 1.2 && !inPause) target = add(target, { x: (hash01(sd + Math.floor(t / glancePeriod)) - 0.5) * 900, y: 250 });
    // пауза для ответа: часть детей думает — взгляд чуть вверх или в сторону
    if (inPause && !k.hero && hash01(sd + 61) < 0.45) target = add(target, { x: (hash01(sd + 62) - 0.5) * 600, y: -260 });
    // говорящий герой обращается к учителю
    if (k.hero && Object.values(S).some((x) => x.role === k.hero && t >= x.start - 0.3 && t <= x.end + 0.3)) target = D.teacherHead(t);
    // ненадолго меняет посадку (у части фоновых детей, в разное время)
    if (!k.hero && hash01(sd + 71) < 0.3) {
      const per = 26 + hash01(sd + 72) * 20;
      const ph = (t + hash01(sd + 73) * per) % per;
      const k2 = ph < 3 ? Math.sin((ph / 3) * Math.PI) : 0;
      pose = { ...pose, lean: pose.lean + k2 * (hash01(sd + 74) - 0.5) * 9 };
    }
    const hw = headWorld(k.look, pose, root);
    let la = lookAt(target.x - hw.x, target.y - hw.y);
    let expr: Expr = { smile: 0.2 + hash01(sd + 31) * 0.25, browIn: 0.1 };
    if (inPause) expr = { smile: 0.12 + hash01(sd + 31) * 0.15, browIn: 0.35 + hash01(sd + 33) * 0.3 };
    let mouth = { open: 0, wide: 0, round: 0 };
    if (k.hero) mouth = speakingMouth(Object.values(S).filter((s) => s.role === k.hero), t);
    let nod = 0;
    // индивидуальные кивки на ключевых уточнениях (не хором)
    if (!k.hero && hash01(sd + 81) < 0.35) nod = nodAt([26, 30, 39].map((x) => seg(x).end + 0.3 + hash01(sd + 82 + x) * 0.9), t, 0.08);
    const look = (p: P) => lookAt(p.x - hw.x, p.y - hw.y);

    if (k.hero === "yusuf") {
      const keys: Key<Pose>[] = [
        { at: 0, v: ySit },
        // замечает вертушку у окна: поворачивается и тянется посмотреть
        { at: H.notice.start, v: withArms(ySit, undefined, undefined, { lean: -6, bodyYaw: -0.1 }), dur: 0.9 },
        { at: seg(5).end + 0.6, v: ySit, dur: 0.9 },
        // вертушка в руке учителя: смотрит, затем наклоняется к ней
        { at: H.stopLook.start, v: withArms(ySit, undefined, undefined, { lean: 4 }), dur: 0.6 },
        { at: H.present.start - 0.2, v: withArms(ySit, undefined, undefined, { lean: 15 }), dur: 0.8 },
        { at: seg(9).end + 0.3, v: withArms(ySit, undefined, undefined, { lean: 4 }), dur: 0.8 },
        { at: seg(10).start + 1.2, v: ySit, dur: 0.9 },
        // перед вопросом об Аллахе — чуть наклоняет голову
        { at: H.yThink.start + 0.2, v: withArms(ySit, undefined, undefined, { headTilt: 7 }), dur: 0.7 },
        { at: seg(19).end + 0.8, v: ySit, dur: 0.8 },
        { at: H.ySmile.start, v: withArms(ySit, undefined, undefined, { headTilt: -4 }), dur: 0.6 },
        { at: seg(40).end + 0.6, v: ySit, dur: 0.8 },
      ];
      pose = poseTrack(keys, t);
      // выдох: вдох (плечи вверх, рот приоткрыт) → округлённые губы, выдох
      const bl = t - A.inhale;
      if (bl > -0.05 && t < A.exhaleEnd + 0.35) {
        const inh = clamp(bl / 0.5) * (1 - clamp((t - A.exhale) / 0.3));
        const exh = clamp((t - A.exhale + 0.12) / 0.15) * (1 - clamp((t - A.exhaleEnd) / 0.3));
        // читаемый выдох: на вдохе чуть откидывается и поднимает плечи, на
        // выдохе подаётся к лепесткам с округлёнными губами (воздух не рисуется)
        pose = { ...pose, lean: pose.lean - inh * 4 + exh * 6, headPitch: -0.06 * inh + 0.04 * exh };
        mouth = exh > 0 ? { open: 0.3 * exh, wide: 0, round: exh } : { open: 0.3 * inh, wide: 0.2 * inh, round: 0.2 * inh };
        expr = { smile: 0.05, browIn: 0.3, eyeOpen: 1.05 };
        // близкая цель: голова заметно повернута к лепесткам, глаза на роторе
        la = { yaw: -0.5, pitch: 0.06, gaze: { x: -0.65, y: 0.12 } };
        const p2: Pose = { ...pose, headYaw: la.yaw, headPitch: la.pitch + pose.headPitch, shoulderUp: breathe(id, t) + inh * 5 };
        const face = faceWith(exprTrack([{ at: 0, v: expr }], t), la.gaze, 0, mouth);
        chars.push({ id, look: k.look, x: root.x, y: root.y, pose: p2, face });
        return;
      }
      if (t > H.notice.start - 0.1 && t < seg(1).end + 0.4) la = look(WIN_HUB);
      if (t > H.detail.end - 0.3 && t < seg(5).end + 0.3) la = look(WIN_HUB);
      if (t > H.stopLook.start && t < seg(7).end + 0.3) la = look(hub);
      if (t > H.present.start - 0.3 && t < seg(9).end + 0.2) la = look(hub);
      if (t > sc0(T, "creation") && t < seg(25).start + 0.3) la = look(D.A.ins0 > t ? hub : LOW_HUB);
      if (t > H.yThink.start && t < seg(19).start - 0.2) la = lookAt(-260, -180);
      if (t > seg(1).start - 0.3 && t < seg(1).end + 0.4) expr = { smile: 0.55, browL: 0.55, browR: 0.55, eyeOpen: 1.15, browIn: 0.35 };
      if (t > seg(5).start - 0.3 && t < seg(5).end + 0.3) expr = { smile: 0.45, browL: 0.35, browR: 0.35, eyeOpen: 1.1, browIn: 0.3 };
      if (t > H.stopLook.start && t < seg(7).end + 0.3) expr = { smile: 0.15, browL: 0.4, browR: 0.4, eyeOpen: 1.12, browIn: 0.4 };
      if (t > seg(9).start - 0.3 && t < seg(9).end + 0.9) expr = { smile: 0.85, browL: 0.4, browR: 0.4, eyeOpen: 1.08, browIn: 0.2 };
      if (t > seg(17).start - 0.3 && t < seg(17).end + 0.4) expr = { smile: 0.6, browIn: 0.2, eyeOpen: 1.05 };
      if (t > H.yThink.start && t < seg(19).end + 0.4) expr = { smile: 0.25, browIn: 0.5, browL: 0.25, browR: 0.25, eyeOpen: 1.05 };
      if (t > seg(25).start - 0.3 && t < seg(25).end + 0.4) expr = { smile: 0.2, browIn: 0.5, browL: 0.3, browR: 0.3 };
      if (t > seg(26).start && t < seg(26).end + 0.6) expr = { smile: 0.35, browIn: 0.3 };
      if (t > seg(33).start - 0.3 && t < seg(33).end + 0.4) expr = { smile: 0.25, browIn: 0.5, eyeOpen: 1.05 };
      if (t > seg(34).start && t < seg(34).end + 0.8) expr = { smile: 0.6, browIn: 0.2 };
      if (t > seg(36).start - 0.3 && t < seg(36).end + 0.4) expr = { smile: 0.6, browL: 0.3, browR: 0.3, eyeOpen: 1.05 };
      if (t > H.ySmile.start && t < seg(40).end + 0.5) expr = { smile: 0.7, browIn: 0.25, browL: 0.2, browR: 0.2 };
      if (t > seg(41).start && t < seg(41).end + 1.2) expr = { smile: 0.8, browIn: 0.15 };
    }
    if (k.hero === "amir") {
      pose = aSit;
      // ладонь к своей щеке, один-два мягких взмаха (не к соседу и не к вертушке)
      const c0 = A.cheek0;
      // ладонь у щеки уже к склейке на крупный план Амира (движение — за кадром)
      const cheekK = easeInOut(clamp((t - (c0 - 0.32)) / 0.45)) * (1 - easeInOut(clamp((t - (seg(11).end + 0.5)) / 0.6)));
      if (cheekK > 0.001) {
        const r = solveRig(AMIR, aSit);
        const wave = Math.sin(clamp((t - c0 - 0.5) / 1.1) * Math.PI * 2) * 0.5 + 0.5;
        const wv = t > c0 + 0.5 && t < c0 + 1.6 ? wave : 0;
        // запястье у края челюсти, ладонь пальцами вверх у щеки (сбоку лица,
        // не закрывая глаза и рот)
        const tgt = { x: r.headC.x + 46 + 6 * wv, y: r.headC.y + 66 };
        const rest = r.arms.R.W;
        // кисть идёт по дуге в обход плечевого сустава (иначе направление
        // плечо→кисть разворачивается мгновенно и локоть перескакивает)
        const via = { x: r.shoulderR.x - 70, y: r.shoulderR.y + 25 };
        pose = withArms(aSit, undefined, { a1: 0, a2: 0, target: bezier(rest, via, tgt, cheekK), bend: 1, hand: cheekK > 0.5 ? "open" : "relaxed", handRot: 0, handAbs: cheekK > 0.5 ? 166 - 16 * wv : undefined, front: true, palm: true });
        expr = { smile: 0.6, browL: 0.25, browR: 0.25, eyeOpen: 0.98, browIn: 0.15 };
      }
      // перед вопросом 29 — поднимает руку
      const raise = easeInOut(clamp((t - (H.aThink.start + 0.4)) / 0.6)) * (1 - easeInOut(clamp((t - (seg(29).start + 0.5)) / 0.7)));
      if (raise > 0.001) {
        const r = solveRig(AMIR, aSit);
        // дальняя рука в повороте три четверти — рисуется за головой (не через лицо)
        const via = { x: r.shoulderR.x + 110, y: r.shoulderR.y };
        pose = withArms(aSit, undefined, { a1: 0, a2: 0, target: bezier(r.arms.R.W, via, { x: r.shoulderR.x + 60, y: r.headC.y - 90 }, raise), bend: nearestBend(AMIR, aSit, "R", r.arms.R.W, r.arms.R.E), hand: raise > 0.5 ? "open" : "relaxed", handRot: 180, palm: true, front: false });
      }
      // строка 2: ротор → подставка и палочка
      if (t > seg(2).start - 0.6 && t < seg(2).start + 0.2) la = look(WIN_HUB);
      if (t > seg(2).start + 0.2 && t < seg(2).end + 0.3) la = look({ x: WT_STAND.x + 4, y: WT_STAND.y - 40 });
      if (t > seg(2).start - 0.3 && t < seg(2).end + 0.3) expr = { smile: 0.3, browL: 0.35, browR: 0.35, eyeOpen: 1.1, browIn: 0.3 };
      if (t > seg(18).start - 0.2 && t < seg(18).end + 0.4) expr = { smile: 0.5, browIn: 0.2 };
      if (t > seg(21).start - 0.3 && t < seg(21).end + 0.3) expr = { smile: 0.2, browIn: 0.55, browL: 0.25, browR: 0.25 };
      if (t > H.aThink.start && t < seg(29).end + 0.3) expr = { smile: 0.2, browIn: 0.55, browL: 0.2 };
      if (t > seg(30).start + 0.5 && t < seg(30).end + 0.8) expr = { smile: 0.3, browIn: 0.35 };
      if (t > seg(38).start - 0.2 && t < seg(38).end + 0.4) expr = { smile: 0.45, browIn: 0.2 };
    }
    if (k.hero === "bilal") {
      const tilt = (at: number): Key<Pose>[] => [
        { at: at - 0.7, v: withArms(bSit, undefined, undefined, { headTilt: 5 }), dur: 0.5 },
        { at: at + 1.2, v: bSit, dur: 0.7 },
      ];
      pose = poseTrack([{ at: 0, v: bSit }, ...tilt(seg(14).start), ...tilt(seg(23).start), ...tilt(seg(27).start)], t);
      // Билал переводит взгляд: окно → вертушка → учитель
      if (t > seg(3).start - 0.6 && t < seg(3).end + 0.3) la = look({ x: 2520, y: 640 });
      if (t > seg(31).start - 0.7 && t < seg(31).end + 0.2) la = look(LOW_HUB);
      if (t > seg(3).start - 0.2 && t < seg(3).end + 0.3) expr = { smile: 0.3, browIn: 0.3 };
      if (t > seg(14).start - 0.2 && t < seg(14).end + 0.3) expr = { smile: 0.3, browIn: 0.45, browL: 0.2, browR: 0.2 };
      if (t > seg(42).start - 0.3 && t < seg(42).end + 1.5) expr = { smile: 0.45, browIn: 0.15 };
    }
    const p2: Pose = { ...pose, headYaw: la.yaw * 0.85, headPitch: la.pitch * 0.85 + nod, shoulderUp: breathe(id, t) };
    const face = faceWith(exprTrack([{ at: 0, v: expr }], t), la.gaze, blinkAt(id, t), mouth);
    chars.push({ id, look: k.look, x: root.x, y: root.y, pose: p2, face });
  });

  // ---- учитель ----
  {
    let pose = body.pose;
    const root = body.root;
    const st = body.st;
    const handL = HAND_T * st;
    let holdR: React.ReactNode | undefined;
    let lookTarget: P | null = null;
    const toL = (w: P) => toLocal(w, root, st);
    const isK = body.mode === "kneel";
    const isW = body.mode === "window";

    // жесты: открытая ладонь к детям / к вертушке
    const gesture = (k: number, to: P, side: "L" | "R" = "R") => {
      if (k <= 0.001) return;
      const r = solveRig(TEACHER, pose);
      const rest = side === "R" ? r.arms.R.W : r.arms.L.W;
      const tgt = toL(to);
      const bend = elbowDownBend(TEACHER, pose, side, tgt);
      // раскрытая ладонь, пальцы вперёд-вверх (приглашающий жест; не кулак)
      const arm: ArmPose = { a1: 0, a2: 0, target: lerpP(rest, tgt, easeInOut(k)), bend, hand: k > 0.5 ? "open" : "relaxed", handRot: 0, handAbs: k > 0.5 ? (side === "R" ? 60 : -60) : undefined, front: true, palm: true };
      pose = side === "R" ? { ...pose, armR: arm } : { ...pose, armL: arm };
    };
    const span = (a: number, b: number, fi = 0.5, fo = 0.6) => clamp((t - a) / fi) * (1 - clamp((t - b) / fo));
    // решение ИК правой руки, пока учитель держит вертушку: одно на весь план,
    // смена — только на склейках (у окна — до общего плана проходки; на коленях
    // — с плана у столика до вставки в подставку; в сцене 8 — с плана подъёма)
    const holdBendR = (tt: number): number | undefined => ((tt >= A.lift1 && tt < H.walkA.start + 0.6) || (tt >= H.kneel.end && tt < A.ins0 + 0.65) || tt >= A.pk0 + 0.5 ? 1 : undefined);
    if (isW && !prop.held) {
      // у окна: на реплике 4 ладонь к вертушке
      gesture(span(seg(4).start + 0.3, seg(4).end - 0.2), { x: WIN_HUB.x - 95, y: WIN_HUB.y + 55 }); // ладонь к вертушке, не касаясь
    }
    // правая кисть на палочке (или подносит/убирает) — кулак в точке захвата
    const reachSpan = (from: number, grip: number, rel: number, back: number) => {
      // 0→1 кисть идёт к палочке, 1 держит, 1→0 возвращается
      if (t < from || t > back) return 0;
      if (t < grip) return easeInOut((t - from) / (grip - from));
      if (t < rel) return 1;
      return 1 - easeInOut((t - rel) / (back - rel));
    };
    const gripW = gripOf(prop.pw.o, prop.pw.s, prop.pw.rot);
    let holdK = 0;
    if (t < A.lift0) holdK = reachSpan(A.reach0, A.grip, Infinity, Infinity);
    else if (prop.held) holdK = 1;
    if (t >= A.insDown && t < A.pkGrip) holdK = reachSpan(-1, -1, A.insOpen, A.insBack) || reachSpan(A.pk0, A.pkGrip, Infinity, Infinity);
    if (t >= A.sdContact) holdK = reachSpan(-1, -1, A.sdOpen, A.sdBack);
    if (holdK > 0.001) {
      // корпус наклоняется к палочке, если она далеко
      // наклон сглажен по времени (хват в окне ±0,45 с): корпус не дёргается,
      // когда вертушка быстро меняет положение
      const leanAt = (dt: number) => {
        if (dt === 0) return leanToward(TEACHER, pose, root, st, gripW, "R", -14, 16);
        const tt = t + dt;
        const p2 = propAt(T, D, tt, teacherBodyAt(T, D, tt));
        return leanToward(TEACHER, pose, root, st, gripOf(p2.pw.o, p2.pw.s, p2.pw.rot), "R", -14, 16);
      };
      const lean = isK ? [-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45].reduce((acc, dt, i) => acc + leanAt(dt) * [1, 2, 3, 4, 3, 2, 1][i], 0) / 16 : pose.lean;
      pose = { ...pose, lean: lerp(pose.lean, lean, holdK) };
      // одно решение ИК (локоть вниз, к корпусу) на весь план, где учитель
      // держит вертушку; смена решения — только на склейке
      const f = fistOn(TEACHER, pose, root, st, gripW, "R", holdBendR(t));
      if (holdK >= 0.999 && prop.held) {
        pose = f.pose;
        const W = solveRig(TEACHER, pose).arms.R.W;
        const loc = (p: P) => ({ x: (p.x - root.x) / st - W.x, y: (p.y - root.y) / st - W.y });
        const o = loc(prop.pw.o);
        const k = prop.pw.s / st;
        const spinNow = D.spinAt(t);
        holdR = prop.unit ? (
          <g>
            <PinwheelInStand x={loc({ x: prop.stand.x, y: prop.stand.y }).x} y={loc({ x: prop.stand.x, y: prop.stand.y }).y} s={k} angle={spinNow.angle} yaw={prop.pw.yaw} blur={spinNow.blur} />
          </g>
        ) : prop.inStand ? null : (
          <Pinwheel x={o.x} y={o.y} s={k} rot={prop.pw.rot} angle={spinNow.angle} yaw={prop.pw.yaw} blur={spinNow.blur} />
        );
      } else {
        const r0a = solveRig(TEACHER, pose).arms.R;
        const r0 = r0a.W;
        const target = lerpP(r0, toL(f.wrist), holdK);
        const open = holdK < 0.85;
        // в сцене 8 рука тянется к вертушке из позы покоя — решение, продолжающее её локоть
        const bend = t >= A.pk0 && t < A.pk0 + 0.5 ? nearestBend(TEACHER, pose, "R", r0, r0a.E) : f.pose.armR.bend;
        pose = { ...pose, armR: { a1: 0, a2: 0, target, bend, hand: open ? "open" : "fist", handRot: 0, handAbs: open ? 60 : undefined, front: true } };
      }
      lookTarget = t < A.bring1 || (t > A.contact - 1.2 && t < A.pull1 + 0.2) || (t > A.ins0 && t < A.insBack) || (t > A.pk0 && t < A.pkLift1) || (t > A.sd0 && t < A.sdBack) ? hubOf(prop.pw.o, prop.pw.s) : null;
    }
    // пока вертушка в подставке у учителя в руках не рисуется — но подставка
    // в руке при переносе нарисована внутри holdR вместе с вертушкой
    if (prop.inStand && prop.held && !prop.unit && holdK > 0.999) {
      // захват палочки в подставке (перед подъёмом / сразу после постановки)
      items.push({ y: prop.stand.depth, key: "pw", el: <PinwheelInStand x={prop.stand.x} y={prop.stand.y} s={prop.stand.s} angle={spin.angle} yaw={0} blur={spin.blur} /> });
    }
    // левая кисть под подставкой при переносе
    if (prop.unit && prop.leftUnder > 0.001) {
      const r = solveRig(TEACHER, pose);
      const under = { x: prop.stand.x + (PW.standD * 0.55 * 0.3) * prop.stand.s, y: prop.stand.y + 3 * prop.stand.s };
      const wrist = { x: under.x - handL * 0.62, y: under.y + handL * 0.3 };
      const k = easeInOut(prop.leftUnder);
      pose = { ...pose, armL: { a1: 0, a2: 0, target: lerpP(r.arms.L.W, toL(wrist), k), bend: -1, hand: k > 0.5 ? "flat" : "relaxed", handRot: 0, handAbs: k > 0.5 ? 75 : undefined, front: true } };
    }
    // жесты на коленях (когда правая кисть свободна или держит вертушку у колена)
    if (isK && holdK < 0.001) {
      // небольшой спокойный жест: ладонь раскрыта к детям перед грудью
      // учителя (Юсуф сидит рядом — рука не тянется к его лицу)
      const kids = { x: root.x + 132 * st, y: root.y - 268 * st };
      gesture(span(seg(20).start + 0.4, seg(20).end - 0.1) * 0.7, kids);
      gesture(span(wordAt3(D, 30, D.anchors.a30need) - 0.1, seg(30).end - 0.2) * 0.85, { x: root.x + 120 * st, y: root.y - 300 * st });
      gesture(span(seg(34).start + 0.2, seg(34).end) * 0.8, kids);
      gesture(span(seg(39).start + 0.3, seg(39).end) * 0.7, kids);
      gesture(span(seg(41).start + 0.2, Math.min(seg(41).end - 0.2, A.pk0 - 0.65)) * 0.8, kids); // гаснет до того, как рука потянется к вертушке
      gesture(span(seg(35).start + 0.2, seg(35).end + 0.2) * 0.75, kids);
    }
    if (isK && holdK > 0.999 && !prop.unit && t > A.rest1 && t < A.ins0) {
      // вертушка в правой руке — свободная левая чуть приподнимается к детям на ключевых словах
      gesture(span(seg(12).start + 0.3, seg(12).end) * 0.6, { x: root.x + 120 * st, y: root.y - 300 * st }, "L");
      gesture(span(seg(22).start + 0.6, seg(22).end - 0.2) * 0.6, { x: root.x + 120 * st, y: root.y - 300 * st }, "L");
      gesture(span(seg(26).start + 1.2, Math.min(seg(26).end - 0.1, A.ins0 - 0.65)) * 0.55, { x: root.x + 110 * st, y: root.y - 300 * st }, "L");
    }

    // взгляд учителя
    const hw = add(root, mul(solveRig(TEACHER, pose).headC, st));
    let target: P = track(D.attn, t - 0.05, lerpP);
    const spk = Object.values(S).find((s) => t >= s.start - 0.3 && t <= s.end + 0.4);
    if (spk && spk.role !== "teacher") target = D.heads[spk.role as Hero];
    if (spk && spk.role === "teacher") target = { x: 2250, y: 1700 };
    if (spk && [8, 26, 34, 41, 10, 20].some((x) => spk.line === n(x))) target = D.heads.yusuf;
    if (spk && spk.line === n(12)) target = D.heads.amir;
    if (inPause) target = { x: 2250, y: 1680 };
    if (body.mode === "walk") target = add(root, { x: (body.pose.bodyYaw > 0 ? 500 : -500) * st, y: -380 * st });
    if (lookTarget) target = lookTarget;
    if (t > H.present.start - 0.4 && t < seg(9).end + 0.3) target = lerpP(hub, D.heads.yusuf, 0.5);
    let la = lookAt(target.x - hw.x, target.y - hw.y);
    // вопросы детям и зрителям: взгляд к зрителю до конца вопроса и в паузе
    for (const q of [16, 35, 37]) {
      const s = seg(q);
      const toCam = clamp((t - (s.start + 0.5)) / 0.8) * (1 - clamp((t - (PZ[n(q)].end + 0.1)) / 0.6));
      if (toCam > 0) {
        const camLa = { yaw: 0.04, pitch: 0.05, gaze: { x: -0.05, y: 0.06 } };
        la = { yaw: lerp(la.yaw, camLa.yaw, toCam), pitch: lerp(la.pitch, camLa.pitch, toCam), gaze: lerpP(la.gaze, camLa.gaze, toCam) };
      }
    }
    // доброжелательное лицо: усы рисунка серии визуально опускают уголки рта,
    // поэтому улыбка чуть сильнее; в паузах — приглашающая улыбка зрителю
    let expr: Expr = { smile: 0.55, browIn: 0.12 };
    if (inPause) expr = { smile: 0.72, browIn: 0.05, browL: 0.15, browR: 0.15 };
    if (spk && spk.role !== "teacher") expr = { smile: 0.52, browIn: 0.25, browL: 0.1, browR: 0.1 }; // внимательно слушает
    if (t > seg(26).start - 0.1 && t < seg(26).end + 0.3) expr = { smile: 0.35, browIn: 0.2 };
    if (t > seg(34).start - 0.1 && t < seg(34).end + 0.6) expr = { smile: 0.62, browIn: 0.15 };
    if (t > seg(41).start - 0.1 && t < seg(41).end + 0.6) expr = { smile: 0.65, browIn: 0.15 };
    if (t > seg(9).start && t < seg(9).end + 0.8) expr = { smile: 0.62, browIn: 0.15 };
    const nod = nodAt([12, 15, 24, 32, 39].map((x) => seg(x).start), t);
    const mouth = speakingMouth(Object.values(S).filter((s) => s.role === "teacher"), t);
    const yawBlend = body.mode === "walk" ? 0.7 : 0.35;
    const p2: Pose = { ...pose, headYaw: pose.headYaw * yawBlend + la.yaw * (1 - yawBlend), headPitch: pose.headPitch * 0.5 + la.pitch * 0.6 + nod, shoulderUp: breathe("teacher", t) };
    const face = faceWith(exprTrack([{ at: 0, v: expr }], t), la.gaze, blinkAt("teacher", t), mouth);
    chars.push({ id: "teacher", look: TEACHER, x: root.x, y: root.y, pose: p2, face, holdR });
  }

  return { t, chars, items, wind: 1 };
};

const sc0 = (T: Timeline, id: keyof Timeline["scenes"]) => T.scenes[id].start;
const wordAt3 = (D: Direction, k: number, w: string) => D.wordAt(k, w, 0.6);

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
      pose: { ...c.pose, headYaw: pick((x) => x.pose.headYaw), headPitch: pick((x) => x.pose.headPitch), headTilt: pick((x) => x.pose.headTilt) },
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
