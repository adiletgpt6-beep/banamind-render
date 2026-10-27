// Хореография фильма 80-1-11: для каждого персонажа функции кадра → место
// (ходьба по маршрутам комнаты), направление взгляда и поза (руки, мимика,
// посадка на ковёр и подъём); состояние реквизита (дверь, сумка Амира, книга
// учителя, кувшин, чашка и уровень воды в ней, струя, карточка-напоминание,
// карандаш) и тихие занятия 22 фоновых учеников. Все моменты берутся из шкалы
// (реплики, паузы, отрезки действий), поэтому при перезаписи озвучки
// постановка пересчитывается сама. Всё детерминированно по номеру кадра.
import { FPS } from "../core/video.ts";
import type { Place, PoseIn, WorldArm } from "../rig/Actor";
import type { Expression } from "../rig/pose.ts";
import { clamp, cruise, easeInOut, easeOut, glide, hash01, keys, lerp, smoothstep, type Vec } from "../rig/motion.ts";
import { bgPlace, CAST, castById, placeAt, teacherPlaceAt, type CastPupil } from "./cast.ts";
import { cardTip, CARD_UNITS } from "./card.ts";
import {
  AT_SPROUT,
  AT_SPROUT2,
  AT_TABLE,
  BAG_SPOT,
  CARD_SPOT,
  CARD_WORK,
  CARDS,
  CUP_DOWN,
  CUP_HOME,
  DOOR_CX,
  ENTRY_PATH,
  JUG,
  PENCIL,
  POT,
  SEATS_MAIN,
  TEACHER_BOOK,
  TEACHER_START,
} from "./layout.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type Ctl = {
  readonly place: (t: number) => Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  // держит предмет: кисти рисуются поверх предмета
  readonly holding: (t: number) => boolean;
};

// ---------- реквизит ----------
export type BagInfo = { readonly state: "carried" | "down"; readonly pos: Vec };
export type BookInfo = { readonly where: "hands" | "table"; readonly pos: Vec; readonly open: number; readonly angle: number };
export type JugInfo = { readonly pos: Vec; readonly tilt: number; readonly held: boolean };
export type CupHolder = "tray" | "teacher" | "both" | "amir" | "table";
export type CupInfo = { readonly pos: Vec; readonly tilt: number; readonly fill: number; readonly holder: CupHolder };
export type StreamInfo = { readonly kind: "jug" | "cup"; readonly amount: number; readonly to: Vec } | null;
export type CardState = "stack" | "work" | "held" | "atPot";
export type CardInfo = { readonly state: CardState; readonly pos: Vec; readonly rot: number; readonly flat: number; readonly progress: number };
export type PencilInfo = { readonly tip: Vec; readonly angle: number; readonly inHand: boolean; readonly lift: number };
export type BgItem = { readonly kind: "book" | "notebook" | "closed"; readonly pos: Vec; readonly w: number; readonly flip: number; readonly progress: number; readonly color: string; readonly pencil: Vec | null };

export type Events = {
  readonly doorOpen: number;
  readonly doorClosed: number;
  readonly bagDown: number;
  readonly soilTouch: readonly number[]; // кадры касания земли
  readonly checkEnd: number;
  readonly jugLift: number;
  readonly pourCup: { from: number; to: number }; // струя из кувшина в чашку
  readonly cupTaken: number; // учитель взял чашку с подноса
  readonly handoff: { from: number; to: number }; // общий захват
  readonly waterOn: { from: number; to: number }; // струя на землю
  readonly cupUpright: number;
  readonly cupDown: number; // чашка на столике
  readonly bookDown: number; // учитель положил книгу
  readonly cardTaken: number;
  readonly writeStart: number;
  readonly writeEnd: number;
  readonly cardPlaced: number; // карточка у горшка
  readonly touch: { from: number; to: number }; // Юсуф касается плеча Амира
  readonly writeSpans: readonly { from: number; to: number }[];
  readonly sits: readonly { who: string; at: number; up: boolean }[]; // начало посадки/подъёма (шорох одежды)
  readonly pageFlips: readonly { id: string; at: number }[];
  readonly allSeated: number; // все вернулись на места
};

export type Choreo = {
  readonly teacher: Ctl;
  readonly yusuf: Ctl;
  readonly amir: Ctl;
  readonly bilal: Ctl;
  readonly bg: (p: CastPupil) => Ctl;
  readonly bgItem: (p: CastPupil, t: number) => BgItem;
  readonly door: (t: number) => number;
  readonly bag: (t: number) => BagInfo;
  readonly book: (t: number) => BookInfo;
  readonly jug: (t: number) => JugInfo;
  readonly cup: (t: number) => CupInfo;
  readonly stream: (t: number) => StreamInfo;
  readonly card: (t: number) => CardInfo;
  readonly cardsCount: (t: number) => number;
  readonly pencil: (t: number) => PencilInfo;
  readonly progress: (t: number) => number;
  readonly inDoorway: (t: number) => boolean; // Амир ещё в дверном проёме
  readonly events: Events;
};

const sec = (s: number) => Math.round(s * FPS);
const seg = (t: number, from: number, to: number) => (to <= from ? (t >= to ? 1 : 0) : clamp((t - from) / (to - from)));
const win = (t: number, from: number, to: number, edge = 8) => smoothstep((t - from) / edge) * (1 - smoothstep((t - to) / edge));
const mixV = (a: Vec, b: Vec, u: number): Vec => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
const arc = (a: Vec, b: Vec, u: number, lift: number): Vec => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) - lift * Math.sin(Math.PI * clamp(u)) });
const arm = (target: Vec, shape: WorldArm["shape"] = "open", elbow: WorldArm["elbow"] = "out"): WorldArm => ({ target, shape, elbow });
const faceTo = (targetX: number, x: number, k = 760) => clamp((targetX - x) / k, -0.85, 0.85);
const rot = (v: Vec, deg: number): Vec => {
  const r = (deg * Math.PI) / 180;
  return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) };
};

// Маршрут: стоит в start, затем идёт по отрезкам (плавный разгон и
// торможение, ровный шаг посередине); между отрезками стоит на месте.
type Leg = { readonly from: number; readonly to: number; readonly pts: readonly Vec[] };
const routeAt = (t: number, start: Vec, legs: readonly Leg[]): Vec => {
  let cur = start;
  for (const l of legs) {
    if (t < l.from) return cur;
    if (t <= l.to) return glide(t, l.from, l.to, [cur, ...l.pts], (x) => cruise(x, 0.24));
    cur = l.pts[l.pts.length - 1];
  }
  return cur;
};

// Колени и руки сидящего: кисти на коленях.
const lapOf = (p: Place) => ({ L: { x: p.x - 0.13 * p.h, y: p.y - 0.06 * p.h }, R: { x: p.x + 0.13 * p.h, y: p.y - 0.06 * p.h } });
// Кисти стоящего: свободно вдоль тела.
const sideOf = (p: Place) => ({ L: { x: p.x - 0.13 * p.h, y: p.y - 0.42 * p.h }, R: { x: p.x + 0.13 * p.h, y: p.y - 0.42 * p.h } });
// Руки при посадке / подъёме: от боков к коленям, в середине — опора о колени.
const restArms = (p: Place, sit: number): { armL: WorldArm; armR: WorldArm } => {
  if (sit <= 0.001) return { armL: { target: null, shape: "relax" }, armR: { target: null, shape: "relax" } };
  const lap = lapOf(p);
  const side = sideOf(p);
  const k = smoothstep(sit / 0.9);
  const mid = (a: Vec, b: Vec): Vec => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
  return { armL: { target: mid(side.L, lap.L), shape: "relax", elbow: "in" }, armR: { target: mid(side.R, lap.R), shape: "relax", elbow: "in" } };
};

const EX = (browIn: number, browOut: number, lid: number, smile: number): Expression => ({ browIn, browOut, lid, smile });
// мягкая неловкость (без «маски»): брови чуть внутрь-вверх, взгляд вниз
const SHY = EX(4.5, 0, 0.2, -0.04);
const SINCERE = EX(3, 0.5, 0.12, 0.08);
const BRAVE = EX(1.5, 1.5, 0.08, 0.22);

// Геометрия предметов (единицы рисунка props.tsx при scale 1): ручка чашки
// слева, носик кувшина слева, ручка кувшина справа.
const CUP_HANDLE: Vec = { x: -27, y: -25 };
const CUP_RIGHT: Vec = { x: 21, y: -23 };
const JUG_HANDLE: Vec = { x: 30, y: -44 };
const BAG_HANG = 64; // от кисти до дна висящей сумки

export const buildChoreo = (tl: L80Timeline): Choreo => {
  const L = (id: number) => {
    const c = cueById(tl, id);
    return { from: sec(c.from), to: sec(c.to) };
  };
  const M = (label: string) => {
    const m = markOf(tl, label);
    return { from: sec(m.from), to: sec(m.to) };
  };
  const speaking = (id: number, t: number, pad = 4) => t >= L(id).from - pad && t <= L(id).to + pad;
  const speakerOf = (t: number) => {
    const s = t / FPS;
    for (const c of tl.cues) if (s >= c.from - 0.15 && s <= c.to + 0.2) return c.role;
    return null;
  };
  const pauses = tl.pauses.map((p) => ({ from: sec(p.from), to: sec(p.to) }));
  const inPause = (t: number, pad = 2) => pauses.some((p) => t >= p.from - pad && t <= p.to + pad);
  const end = tl.durationInFrames;

  // ---------- отрезки ----------
  const room = M("комната");
  const door = M("дверь открывается");
  const walkIn = M("Амир идёт на место");
  const bagM = M("Амир кладёт вещи");
  const sitA = M("Амир садится");
  const leaves = M("Юсуф смотрит на листья");
  const awkward = M("неловкость");
  const sitB = M("Билал садится рядом");
  const stand = M("мальчики встают");
  const go = M("идут к учителю");
  const tSit = M("учитель садится");
  const sitT = M("мальчики садятся у столика");
  const think = M("дети думают");
  const turnB = M("Амир поворачивается к Билалу");
  const toSprout = M("к ростку");
  const check = M("проверка земли");
  const water = M("вода в чашку");
  const hand = M("передача чашки");
  const pour = M("полив");
  const upright = M("чашка выпрямлена");
  const cupDownM = M("чашка на столе");
  const lowT = M("к низкому столику");
  const takeCard = M("карточка и карандаш");
  const leaf = M("листик");
  const watchY = M("Юсуф смотрит");
  const text = M("надпись");
  const show = M("Билал показывает карточку");
  const toPot = M("карточку к ростку");
  const atPot = M("карточка у горшка");
  const touchM = M("Юсуф касается плеча");
  const ret = M("возвращение на места");
  const fin = M("финал: класс");
  void room;
  void think;
  void fin;

  // ---------- дверь ----------
  const doorOpenAt = door.from + sec(0.1);
  const doorOpenEnd = door.from + sec(0.75);
  const doorCloseFrom = walkIn.from + sec(0.2);
  const doorClosed = walkIn.from + sec(1.1);
  const doorAt = (t: number) => easeInOut(seg(t, doorOpenAt, doorOpenEnd)) * (1 - easeInOut(seg(t, doorCloseFrom, doorClosed)));

  // ---------- маршруты ----------
  const A0: Vec = { x: 196, y: 976 };
  const amirLegs: Leg[] = [
    { from: door.from + sec(0.45), to: walkIn.to - sec(0.05), pts: ENTRY_PATH.slice(1) },
    { from: sitA.from, to: sitA.from + sec(0.55), pts: [SEATS_MAIN.amir] },
    { from: go.from + sec(0.25), to: go.to - sec(0.35), pts: [{ x: 690, y: 1394 }, { x: 1560, y: 1398 }, { x: 1706, y: 1358 }, AT_TABLE.amir] },
    { from: toSprout.from + sec(1.0), to: toSprout.from + sec(3.5), pts: [{ x: 2084, y: 1236 }, AT_SPROUT.amir] },
    { from: lowT.from + sec(0.3), to: lowT.from + sec(2.7), pts: [{ x: 1900, y: 1220 }, { x: 1716, y: 1354 }] },
    { from: toPot.from + sec(0.8), to: toPot.to - sec(0.1), pts: [{ x: 1800, y: 1230 }, AT_SPROUT2.amir] },
    { from: ret.from + sec(0.35), to: ret.from + sec(5.7), pts: [{ x: 1714, y: 1238 }, { x: 1652, y: 1402 }, { x: 700, y: 1404 }, SEATS_MAIN.amir] },
  ];
  const yusufLegs: Leg[] = [
    { from: go.from + sec(0.6), to: go.to - sec(0.15), pts: [{ x: 520, y: 1414 }, { x: 1520, y: 1416 }, { x: 1690, y: 1374 }, AT_TABLE.yusuf] },
    { from: toSprout.from + sec(1.15), to: toSprout.from + sec(3.4), pts: [AT_SPROUT.yusuf] },
    { from: lowT.from + sec(0.5), to: lowT.from + sec(2.8), pts: [{ x: 1960, y: 1248 }, { x: 1936, y: 1338 }] },
    { from: toPot.from + sec(1.0), to: toPot.to, pts: [{ x: 1990, y: 1240 }, AT_SPROUT2.yusuf] },
    { from: ret.from + sec(0.05), to: ret.from + sec(5.2), pts: [{ x: 1704, y: 1250 }, { x: 1640, y: 1420 }, { x: 500, y: 1420 }, SEATS_MAIN.yusuf] },
  ];
  const bilalLegs: Leg[] = [
    { from: sitB.from + sec(0.85), to: sitB.from + sec(1.75), pts: [SEATS_MAIN.bilal] },
    { from: go.from + sec(1.0), to: go.to - sec(0.25), pts: [{ x: 900, y: 1374 }, { x: 1500, y: 1378 }, { x: 1652, y: 1352 }, AT_TABLE.bilal] },
    { from: toSprout.from + sec(1.0), to: toSprout.from + sec(3.3), pts: [AT_SPROUT.bilal] },
    { from: lowT.from + sec(0.0), to: lowT.from + sec(2.0), pts: [{ x: 1840, y: 1240 }, AT_TABLE.bilal] },
    { from: toPot.from + sec(0.9), to: toPot.to - sec(0.1), pts: [{ x: 1960, y: 1248 }, { x: 2226, y: 1114 }] },
    { from: atPot.from + sec(1.05), to: atPot.to - sec(0.05), pts: [AT_SPROUT2.bilal] },
    { from: ret.from + sec(0.7), to: ret.from + sec(6.0), pts: [{ x: 1712, y: 1236 }, { x: 1646, y: 1396 }, { x: 860, y: 1398 }, SEATS_MAIN.bilal] },
  ];
  const teacherLegs: Leg[] = [
    { from: toSprout.from + sec(1.0), to: toSprout.from + sec(3.6), pts: [{ x: 2418, y: 1246 }, AT_SPROUT.teacher] },
    { from: check.from, to: check.from + sec(0.8), pts: [AT_SPROUT.teacherCheck] },
    { from: water.from, to: water.from + sec(0.6), pts: [AT_SPROUT.teacher] },
    { from: ret.from + sec(1.0), to: ret.from + sec(3.6), pts: [{ x: 2404, y: 1250 }, AT_TABLE.teacher] },
  ];

  // посадка на ковёр (0 — стоит, 1 — сидит): [кадр, значение]
  const amirSit: (readonly [number, number])[] = [
    [0, 0], [sitA.from + sec(0.45), 0], [sitA.to, 1],
    [stand.from + sec(0.1), 1], [stand.from + sec(1.05), 0],
    [sitT.from + sec(0.45), 0], [sitT.from + sec(1.6), 1],
    [toSprout.from + sec(0.05), 1], [toSprout.from + sec(0.95), 0],
    [ret.from + sec(5.75), 0], [ret.from + sec(6.85), 1],
  ];
  const yusufSit: (readonly [number, number])[] = [
    [0, 1], [stand.from + sec(0.35), 1], [stand.from + sec(1.3), 0],
    [sitT.from + sec(0.7), 0], [sitT.from + sec(1.8), 1],
    [toSprout.from + sec(0.2), 1], [toSprout.from + sec(1.1), 0],
    [ret.from + sec(5.25), 0], [ret.from + sec(6.3), 1],
  ];
  const bilalSit: (readonly [number, number])[] = [
    [0, 1], [sitB.from + sec(0.0), 1], [sitB.from + sec(0.85), 0], [sitB.from + sec(1.75), 0], [sitB.from + sec(2.75), 1],
    [stand.from + sec(0.2), 1], [stand.from + sec(1.15), 0],
    [sitT.from + sec(0.3), 0], [sitT.from + sec(1.4), 1],
    [toSprout.from + sec(0.1), 1], [toSprout.from + sec(1.0), 0],
    [lowT.from + sec(2.05), 0], [lowT.from + sec(3.25), 1],
    [toPot.from + sec(0.0), 1], [toPot.from + sec(0.9), 0],
    [ret.from + sec(6.0), 0], [ret.to - sec(0.1), 1],
  ];
  const teacherSit: (readonly [number, number])[] = [
    [0, 0], [tSit.from - sec(0.1), 0], [tSit.from + sec(1.0), 1],
    [toSprout.from + sec(0.1), 1], [toSprout.from + sec(1.0), 0],
    [ret.from + sec(3.7), 0], [ret.from + sec(4.8), 1],
  ];
  const sitAt = (k: readonly (readonly [number, number])[], t: number) => keys(t, k, easeInOut);

  const amirPos = (t: number) => routeAt(t, A0, amirLegs);
  const yusufPos = (t: number) => routeAt(t, SEATS_MAIN.yusuf, yusufLegs);
  const bilalPos = (t: number) => routeAt(t, SEATS_MAIN.bilalStart, bilalLegs);
  const teacherPos = (t: number) => routeAt(t, TEACHER_START, teacherLegs);
  const AMIR = castById("amir");
  const YUSUF = castById("yusuf");
  const BILAL = castById("bilal");
  const amirPlace = (t: number): Place => {
    const p = amirPos(t);
    return placeAt(AMIR.age, p.x, p.y);
  };
  const yusufPlace = (t: number): Place => {
    const p = yusufPos(t);
    return placeAt(YUSUF.age, p.x, p.y);
  };
  const bilalPlace = (t: number): Place => {
    const p = bilalPos(t);
    return placeAt(BILAL.age, p.x, p.y);
  };
  const teacherPlace = (t: number): Place => {
    const p = teacherPos(t);
    return teacherPlaceAt(p.x, p.y);
  };

  // ---------- сумка ----------
  const bagTouch = bagM.from + sec(0.85);
  const bagRelease = bagM.from + sec(1.05);
  const bagCarryHand = (t: number): Vec => {
    const p = amirPlace(t);
    const sway = Math.sin(t / 4.2) * 2.5 * smoothstep(seg(t, door.from + sec(0.45), door.from + sec(0.9)));
    return { x: p.x - 0.16 * p.h, y: p.y - 0.41 * p.h + sway };
  };
  const bagDownHand: Vec = { x: BAG_SPOT.x, y: BAG_SPOT.y - BAG_HANG };
  const bagHand = (t: number): Vec => {
    if (t < bagM.from + sec(0.15)) return bagCarryHand(t);
    const u = easeInOut(seg(t, bagM.from + sec(0.15), bagTouch));
    return mixV(bagCarryHand(t), bagDownHand, u);
  };
  const bag = (t: number): BagInfo => {
    if (t >= bagTouch) return { state: "down", pos: { x: BAG_SPOT.x, y: BAG_SPOT.y } };
    const h = bagHand(t);
    return { state: "carried", pos: h };
  };

  // ---------- книга учителя ----------
  const notice = go.from + sec(2.4);
  const bookClose = { from: go.from + sec(3.1), to: go.from + sec(3.7) };
  const bookPut = { from: tSit.from + sec(0.75), to: tSit.from + sec(1.25) };
  const bookDown = bookPut.to;
  const readHold = (p: Place): Vec => ({ x: p.x - 0.02 * p.h, y: p.y - 0.6 * p.h });
  const book = (t: number): BookInfo => {
    const p = teacherPlace(t);
    const open = 1 - easeInOut(seg(t, bookClose.from, bookClose.to));
    if (t >= bookDown) return { where: "table", pos: { x: TEACHER_BOOK.x, y: TEACHER_BOOK.y }, open: 0, angle: 0 };
    const held = readHold(p);
    const sitK = sitAt(teacherSit, t);
    // сидя: книга у груди, затем ложится на стол справа
    const seated: Vec = { x: p.x + 0.04 * p.h, y: p.y - 0.36 * p.h };
    const hold = mixV(held, seated, smoothstep(sitK));
    if (t < bookPut.from) return { where: "hands", pos: hold, open, angle: -6 * (1 - open) };
    const u = easeInOut(seg(t, bookPut.from, bookPut.to));
    return { where: "hands", pos: arc(hold, { x: TEACHER_BOOK.x, y: TEACHER_BOOK.y - 6 }, u, 18), open: 0, angle: lerp(-6, 0, u) };
  };

  // ---------- кувшин, чашка, вода ----------
  const touchSoil = check.from + sec(1.45);
  const soilTouch = [touchSoil, touchSoil + sec(0.45)];
  const checkEnd = check.from + sec(3.0);
  const jugReach = water.from + sec(0.65);
  const jugLift = water.from + sec(1.0);
  const jugTiltFrom = water.from + sec(1.35);
  const jugBack = water.from + sec(3.05);
  const jugSet = water.from + sec(3.25);
  const jugFree = water.from + sec(3.5);
  const pourCupSpan = { from: water.from + sec(1.65), to: water.from + sec(2.5) };
  const cupReach = hand.from + sec(0.05);
  const cupTaken = hand.from + sec(0.45);
  const cupToMeet = { from: hand.from + sec(0.5), to: hand.from + sec(1.15) };
  const shared = { from: hand.from + sec(1.15), to: hand.from + sec(1.6) };
  const teacherFree = hand.from + sec(2.0);
  const toSoil = { from: pour.from + sec(0.05), to: pour.from + sec(0.85) };
  const tiltIn = { from: pour.from + sec(0.85), to: pour.from + sec(1.9) };
  const waterOn = { from: pour.from + sec(1.45), to: pour.from + sec(4.2) };
  const tiltOut = { from: pour.from + sec(4.2), to: pour.from + sec(5.05) };
  const cupUpright = tiltOut.to;
  const toTable = { from: upright.from + sec(0.1), to: cupDownM.from + sec(0.9) };
  const cupDown = cupDownM.from + sec(0.9);
  const amirFreeCup = cupDownM.from + sec(1.3);

  const jugRest: Vec = { x: JUG.x, y: JUG.y };
  const jugOverCup: Vec = { x: CUP_HOME.x + 46, y: JUG.y - 46 };
  const jug = (t: number): JugInfo => {
    if (t < jugLift || t >= jugSet) return { pos: jugRest, tilt: 0, held: t >= jugReach && t < jugFree };
    if (t < jugTiltFrom) return { pos: arc(jugRest, jugOverCup, easeInOut(seg(t, jugLift, jugTiltFrom)), 10), tilt: 0, held: true };
    if (t < jugBack) {
      const k = Math.sin(Math.PI * seg(t, jugTiltFrom, jugBack));
      return { pos: jugOverCup, tilt: -58 * smoothstep(k * 1.4), held: true };
    }
    return { pos: arc(jugOverCup, jugRest, easeInOut(seg(t, jugBack, jugSet)), 8), tilt: 0, held: true };
  };
  const meet: Vec = { x: 2214, y: 774 };
  const amirCupHold = (t: number): Vec => {
    const p = amirPlace(t);
    return { x: p.x + 0.17 * p.h, y: p.y - 0.5 * p.h };
  };
  const soilPoint: Vec = { x: POT.x + 8, y: POT.soilY + 3 };
  // чашка над землёй: опора — ручка у кисти Амира
  const pourBottom: Vec = { x: POT.x - 26, y: POT.rimY - 24 };
  const cupFillAt = (t: number) => {
    if (t < pourCupSpan.from) return 0;
    if (t < waterOn.from) return 0.5 * easeInOut(seg(t, pourCupSpan.from, pourCupSpan.to));
    return 0.5 * (1 - seg(t, waterOn.from, waterOn.to));
  };
  const cup = (t: number): CupInfo => {
    const fill = cupFillAt(t);
    const home: Vec = { x: CUP_HOME.x, y: CUP_HOME.y };
    if (t < cupTaken) return { pos: home, tilt: 0, fill, holder: "tray" };
    if (t < shared.from) {
      const u = easeInOut(seg(t, cupToMeet.from, cupToMeet.to));
      const lift = easeOut(seg(t, cupTaken, cupToMeet.from));
      const from: Vec = { x: home.x, y: home.y - 12 * lift };
      return { pos: arc(from, meet, u, 16), tilt: 0, fill, holder: "teacher" };
    }
    if (t < shared.to) return { pos: meet, tilt: 0, fill, holder: "both" };
    if (t < toSoil.from) {
      const u = easeInOut(seg(t, shared.to, toSoil.from));
      return { pos: mixV(meet, amirCupHold(t), u), tilt: 0, fill, holder: "amir" };
    }
    if (t < tiltIn.from) {
      const u = easeInOut(seg(t, toSoil.from, toSoil.to));
      return { pos: arc(amirCupHold(t), pourBottom, u, 10), tilt: 0, fill, holder: "amir" };
    }
    if (t < cupUpright) {
      const tin = easeInOut(seg(t, tiltIn.from, tiltIn.to));
      const deep = seg(t, waterOn.from + sec(0.8), waterOn.to);
      const out = easeInOut(seg(t, tiltOut.from, tiltOut.to));
      const tilt = (62 * tin + 22 * smoothstep(deep)) * (1 - out);
      return { pos: pourBottom, tilt, fill, holder: "amir" };
    }
    if (t < cupDown) {
      const u = easeInOut(seg(t, toTable.from, toTable.to));
      return { pos: arc(pourBottom, { x: CUP_DOWN.x, y: CUP_DOWN.y }, u, 14), tilt: 0, fill: 0, holder: "amir" };
    }
    return { pos: { x: CUP_DOWN.x, y: CUP_DOWN.y }, tilt: 0, fill: 0, holder: t < amirFreeCup ? "amir" : "table" };
  };
  const stream = (t: number): StreamInfo => {
    if (t >= pourCupSpan.from && t < pourCupSpan.to + sec(0.1)) {
      const a = win(t, pourCupSpan.from, pourCupSpan.to, 4);
      return a > 0.02 ? { kind: "jug", amount: a, to: { x: CUP_HOME.x + 2, y: CUP_HOME.y - 30 } } : null;
    }
    if (t >= waterOn.from && t < waterOn.to + sec(0.1)) {
      const a = win(t, waterOn.from, waterOn.to, 5) * (0.45 + 0.55 * (1 - seg(t, waterOn.from + sec(1.6), waterOn.to)));
      return a > 0.02 ? { kind: "cup", amount: a, to: soilPoint } : null;
    }
    return null;
  };

  // ---------- карточка и карандаш ----------
  const cardReach = takeCard.from + sec(0.1);
  const cardTaken = takeCard.from + sec(0.55);
  const cardLaid = takeCard.from + sec(1.05);
  const pencilTaken = takeCard.from + sec(1.35);
  const writeStart = leaf.from + sec(0.25);
  const writeEnd = text.to - sec(0.2);
  const pencilDown = L(39).from + sec(0.1);
  const pencilLaid = L(39).to + sec(0.5);
  const cardUp = show.from + sec(0.25);
  const cardShowTop = show.from + sec(0.9);
  const cardShowEnd = show.to - sec(0.2);
  const cardPlaced = atPot.from + sec(0.75);
  const progress = (t: number) => {
    if (t <= writeStart) return 0;
    if (t >= writeEnd) return 1;
    const A = leaf.to;
    const C = watchY.to;
    if (t < A) return 0.36 * easeOut(seg(t, writeStart, A));
    if (t < C) return lerp(0.36, 0.62, seg(t, A, C)); // монтажное сокращение: за время плана на Юсуфа нарисовано больше
    return lerp(0.62, 1, seg(t, C, writeEnd));
  };
  const writeSpans = (() => {
    const out: { from: number; to: number }[] = [];
    let open: number | null = null;
    for (let f = writeStart; f <= writeEnd + 1; f++) {
      const down = f <= writeEnd && cardTip(progress(f)).lift < 0.5;
      if (down && open === null) open = f;
      if (!down && open !== null) {
        out.push({ from: open, to: f });
        open = null;
      }
    }
    return out;
  })();
  const stackPos: Vec = { x: CARDS.x, y: CARDS.y };
  const work: Vec = { x: CARD_WORK.x, y: CARD_WORK.y };
  const showPos = (t: number): Vec => {
    const p = bilalPlace(t);
    return { x: p.x + 0.02 * p.h, y: p.y - 0.42 * p.h };
  };
  const carryPos = (t: number): Vec => {
    const p = bilalPlace(t);
    return { x: p.x + 0.12 * p.h, y: p.y - 0.47 * p.h };
  };
  const cardAt: Vec = { x: CARD_SPOT.x, y: CARD_SPOT.y };
  const card = (t: number): CardInfo => {
    const prog = progress(t);
    if (t < cardTaken) return { state: "stack", pos: stackPos, rot: 0, flat: 1, progress: 0 };
    if (t < cardLaid) return { state: "held", pos: arc(stackPos, work, easeInOut(seg(t, cardTaken, cardLaid)), 12), rot: lerp(0, -3, seg(t, cardTaken, cardLaid)), flat: 1, progress: 0 };
    if (t < cardUp) return { state: "work", pos: work, rot: -3, flat: 1, progress: prog };
    if (t < toPot.from + sec(0.9)) {
      // показывает друзьям: поднимает карточку лицом к ним, держит
      const u = easeInOut(seg(t, cardUp, cardShowTop));
      const back = easeInOut(seg(t, cardShowEnd, toPot.from + sec(0.9)));
      const shown = showPos(t);
      const pos = mixV(mixV(work, shown, u), carryPos(t), back);
      return { state: "held", pos, rot: lerp(-3, 0, u), flat: lerp(1, 0, u) * (1 - back) + back * 0.15, progress: 1 };
    }
    if (t < atPot.from) return { state: "held", pos: carryPos(t), rot: 0, flat: 0.15, progress: 1 };
    if (t < cardPlaced) {
      const u = easeInOut(seg(t, atPot.from, cardPlaced));
      return { state: "held", pos: arc(carryPos(t), cardAt, u, 10), rot: 0, flat: lerp(0.15, 0, u), progress: 1 };
    }
    return { state: "atPot", pos: cardAt, rot: 0, flat: 0, progress: 1 };
  };
  const cardsCount = (t: number) => (t >= cardTaken ? 2 : 3);
  // единицы карточки → мир (карточка лежит на столе, сплющена перспективой)
  const cardToWorld = (center: Vec, rotDeg: number, u: number, v: number, w: number): Vec => {
    const kx = w / CARD_UNITS.w;
    const ky = kx * 0.26;
    const d = rot({ x: (u - CARD_UNITS.w / 2) * kx, y: (v - CARD_UNITS.h / 2) * ky }, rotDeg);
    return { x: center.x + d.x, y: center.y + d.y };
  };
  const tipWorld = (t: number) => {
    const c = card(t);
    const ct = cardTip(progress(t));
    return { tip: cardToWorld(c.pos, c.rot, ct.x, ct.y, CARD_WORK.w), lift: ct.lift };
  };
  const pencilRest: PencilInfo = { tip: { x: PENCIL.x, y: PENCIL.y }, angle: PENCIL.angle, inHand: false, lift: 0 };
  const pencil = (t: number): PencilInfo => {
    if (t < pencilTaken - sec(0.3) || t >= pencilLaid) return pencilRest;
    const start = tipWorld(writeStart).tip;
    if (t < writeStart) {
      const u = easeInOut(seg(t, pencilTaken - sec(0.3), writeStart));
      return { tip: arc({ x: PENCIL.x, y: PENCIL.y }, { x: start.x, y: start.y - 8 }, u, 12), angle: lerp(PENCIL.angle, 35, u), inHand: true, lift: 1 };
    }
    if (t <= writeEnd) {
      const { tip, lift } = tipWorld(t);
      return { tip: { x: tip.x, y: tip.y - 6 * lift }, angle: 35, inHand: true, lift };
    }
    if (t < pencilDown) {
      const { tip } = tipWorld(writeEnd);
      return { tip: { x: tip.x, y: tip.y - 8 }, angle: 35, inHand: true, lift: 1 };
    }
    const u = easeInOut(seg(t, pencilDown, pencilLaid));
    const e = tipWorld(writeEnd).tip;
    return { tip: arc({ x: e.x, y: e.y - 8 }, { x: PENCIL.x, y: PENCIL.y }, u, 10), angle: lerp(35, PENCIL.angle, u), inHand: true, lift: 1 };
  };

  const touch = { from: touchM.from + sec(0.2), to: touchM.from + sec(1.5) };

  // ---------- события для звука и проверок ----------
  const sits: { who: string; at: number; up: boolean }[] = [];
  const collect = (who: string, k: readonly (readonly [number, number])[]) => {
    for (let i = 1; i < k.length; i++) if (k[i][1] !== k[i - 1][1]) sits.push({ who, at: k[i - 1][0], up: k[i][1] < k[i - 1][1] });
  };
  collect("amir", amirSit);
  collect("yusuf", yusufSit);
  collect("bilal", bilalSit);
  collect("teacher", teacherSit);

  // ---------- взгляд и позы главных ----------
  const pT = (t: number) => teacherPos(t);
  const pA = (t: number) => amirPos(t);
  const pY = (t: number) => yusufPos(t);
  const pB = (t: number) => bilalPos(t);

  // ===== Амир =====
  const aFace = (t: number) => {
    const x = pA(t).x;
    const toT = faceTo(pT(t).x, x);
    const toY = faceTo(pY(t).x, x);
    const toB = faceTo(pB(t).x, x);
    if (t < bagM.from) return 0.1; // идёт (направление шага задаёт сам риг)
    if (t < bagRelease + sec(0.4)) return -0.55; // на сумку
    if (t < leaves.from) return toY * 0.6;
    if (speaking(3, t)) return seg(t, L(3).from, L(3).to) < 0.45 ? toB : -0.15; // коротко отводит глаза
    if (t >= awkward.from && t < sitB.from) return -0.12;
    if (speaking(5, t)) return seg(t, L(5).from, L(5).to) < 0.45 ? -0.05 : toB;
    if (speaking(7, t)) return toY * 0.8;
    if (inPause(t) && t < go.from) return 0.05;
    if (speaking(9, t) || speaking(10, t)) return speaking(9, t) ? toY : toB;
    if (t >= stand.from && t < sitT.from) return toT; // к учителю
    if (speaking(11, t) || speaking(13, t) || speaking(16, t)) {
      if (speaking(13, t) && seg(t, L(13).from, L(13).to) > 0.72) return toB;
      return toT;
    }
    if (speaking(25, t)) return toT * 0.4;
    if (t >= turnB.from && t < L(30).to + sec(0.6)) return toB;
    if (t >= toSprout.from && t < cupDown + sec(0.4)) {
      if (t >= check.from && t < checkEnd) return 0.42; // на руку учителя у земли
      if (t >= water.from && t < hand.from) return 0.75; // на кувшин и чашку
      if (t >= hand.from && t < upright.to) return 0.45;
      if (t >= upright.to) return -0.3; // ставит чашку слева
      if (speaking(32, t)) return toT * 0.8;
      return 0.35;
    }
    if (t >= lowT.from && t < toPot.from + sec(0.8)) return t < lowT.from + sec(2.7) ? toB : 0.35;
    if (t >= touchM.from && t < touchM.to) return toY;
    if (speaking(45, t)) return seg(t, L(45).from, L(45).to) < 0.5 ? toY : toB;
    const sp = speakerOf(t);
    if (sp === "muhammad") return toT;
    if (sp === "yusuf") return toY;
    if (sp === "bilal") return toB;
    return toT * 0.7;
  };
  const aPoseEx = (t: number): { pose: PoseIn; hold: boolean } => {
    const p = amirPlace(t);
    const sit = sitAt(amirSit, t);
    const rest = restArms(p, sit);
    const base: PoseIn = { floorSit: sit, sitMorph: true, expr: "listening", ...rest, lookY: 0.05, lean: 9 * Math.sin(Math.PI * clamp(sit)) * (sit > 0.02 && sit < 0.98 ? 1 : 0) };
    // сумка в левой руке до того, как ложится на ковёр
    if (t < bagRelease + sec(0.5)) {
      const bend = keys(t, [[bagM.from + sec(0.1), 0], [bagM.from + sec(0.7), 1], [bagRelease + sec(0.1), 1], [bagRelease + sec(0.5), 0]], easeInOut);
      const handL = t < bagRelease ? bagHand(t) : mixV(bagDownHand, sideOf(p).L, easeInOut(seg(t, bagRelease, bagRelease + sec(0.5))));
      const walking = t < bagM.from;
      return { pose: { ...base, expr: walking ? "calm" : "focused", armL: arm(handL, t < bagRelease ? "fist" : "open", "down"), armR: { target: null, shape: "relax" }, lean: 16 * bend, lookY: walking ? 0.05 : 0.55 * bend, nod: 4 * bend }, hold: t >= bagM.from };
    }
    // чашка: принимает у учителя, поливает, ставит на столик
    if (t >= shared.from - sec(0.45) && t < amirFreeCup + sec(0.35)) {
      const c = cup(t);
      const grip = { x: c.pos.x + rot(CUP_HANDLE, c.tilt).x, y: c.pos.y + rot(CUP_HANDLE, c.tilt).y };
      const side = sideOf(p).L;
      const reach = easeInOut(seg(t, shared.from - sec(0.45), shared.from));
      const release = easeInOut(seg(t, amirFreeCup, amirFreeCup + sec(0.35)));
      const h = mixV(mixV(side, grip, reach), side, release);
      const holding = reach > 0.9 && release < 0.1;
      const pouring = t >= tiltIn.from && t < cupUpright;
      return { pose: { ...base, expr: pouring ? "focused" : speaking(35, t) ? BRAVE : "focused", armL: arm(h, holding ? "fist" : "open", "down"), lookY: pouring ? 0.5 : 0.3, lean: pouring ? 5 : t >= toTable.from ? 6 * Math.sin(Math.PI * seg(t, toTable.from, amirFreeCup + sec(0.35))) : 0 }, hold: holding };
    }
    // реплики и реакции (сидя / стоя)
    if (speaking(3, t)) {
      const u = seg(t, L(3).from, L(3).to);
      return { pose: { ...base, expr: u < 0.4 ? "softSmile" : SHY, lookY: u < 0.4 ? -0.05 : 0.45, nod: u > 0.5 ? 3 : 0 }, hold: false };
    }
    if (t >= awkward.from && t < sitB.from) return { pose: { ...base, expr: SHY, lookY: 0.5, nod: 4, exhale: 0.4 }, hold: false };
    if (t >= sitB.from && t < L(5).from) return { pose: { ...base, expr: SHY, lookY: 0.35 }, hold: false };
    if (speaking(5, t)) {
      const u = seg(t, L(5).from, L(5).to);
      return { pose: { ...base, expr: SHY, lookY: u < 0.45 ? 0.5 : 0.05, nod: u < 0.45 ? 3 : 0 }, hold: false };
    }
    if (speaking(7, t)) return { pose: { ...base, expr: SHY, lookY: 0.3 }, hold: false };
    if (t >= L(7).to && t < L(9).from) return { pose: { ...base, expr: "thinking", lookY: 0.35 }, hold: false };
    if (t >= L(9).from && t < stand.from) {
      // принимает помощь: взгляд на Юсуфа и небольшой кивок после его слов
      const n = seg(t, L(9).to, L(9).to + sec(0.6));
      return { pose: { ...base, expr: "softSmile", lookY: 0, nod: 6 * Math.sin(Math.PI * n) }, hold: false };
    }
    if (t >= stand.from && t < sitT.from) {
      const u = speaking(13, t) ? seg(t, L(13).from, L(13).to) : 0;
      if (speaking(11, t)) return { pose: { ...base, expr: SINCERE, lookY: 0.1 }, hold: false };
      if (speaking(13, t)) return { pose: { ...base, expr: lerp(0, 1, u) > 0.5 ? BRAVE : SINCERE, lookY: -0.05, shoulders: 0.15 * u }, hold: false };
      if (t >= L(12).from - 4 && t < L(13).from) return { pose: { ...base, expr: "listening", lookY: 0.05 }, hold: false };
      return { pose: { ...base, expr: t >= go.from && t < tSit.to ? "calm" : "listening" }, hold: false };
    }
    if (speaking(16, t)) return { pose: { ...base, expr: "curious", lookY: -0.05 }, hold: false };
    if (inPause(t) && t > L(24).from && t < L(25).from) return { pose: { ...base, expr: "thinking", lookY: 0.4 }, hold: false };
    if (speaking(25, t)) return { pose: { ...base, expr: SINCERE, lookY: 0.4 }, hold: false };
    if (t >= turnB.from && t < L(29).to + 6) return { pose: { ...base, expr: SINCERE, lookY: 0, lean: 3 * easeInOut(seg(t, turnB.from, turnB.to)) }, hold: false };
    if (t >= L(30).from - 4 && t < L(30).to + sec(0.6)) return { pose: { ...base, expr: "softSmile", lookY: 0 }, hold: false };
    if (t >= check.from && t < checkEnd) return { pose: { ...base, expr: "focused", lookY: 0.45 }, hold: false };
    if (t >= water.from && t < hand.from) return { pose: { ...base, expr: "focused", lookY: 0.4 }, hold: false };
    if (speaking(38, t)) return { pose: { ...base, expr: BRAVE, lookY: 0.3 }, hold: false };
    if (t >= takeCard.from && t < show.to) return { pose: { ...base, expr: "listening", lookY: 0.55, lean: 6 }, hold: false };
    if (speaking(41, t)) return { pose: { ...base, expr: BRAVE, lookY: -0.05 }, hold: false };
    if (speaking(42, t)) return { pose: { ...base, expr: "softSmile", lookY: -0.05 }, hold: false };
    if (speaking(45, t)) return { pose: { ...base, expr: "smile", lookY: 0 }, hold: false };
    if (t >= touch.from && t < touch.to + sec(0.3)) return { pose: { ...base, expr: "smile", lookY: 0.15, headTilt: 3 }, hold: false };
    if (inPause(t)) return { pose: { ...base, expr: "thinking", lookY: 0.25 }, hold: false };
    const after = t > L(23).to && t < L(23).to + sec(1.0);
    return { pose: { ...base, expr: t > L(13).to ? (after ? "calm" : "listening") : "listening" }, hold: false };
  };

  // ===== Юсуф =====
  const yFace = (t: number) => {
    const x = pY(t).x;
    const toT = faceTo(pT(t).x, x);
    const toA = faceTo(pA(t).x, x);
    const toB = faceTo(pB(t).x, x);
    if (t < door.from) return 0.1;
    if (t < sitA.to) return toA; // смотрит, как входит Амир
    if (t >= leaves.from && t < L(1).to + sec(0.3)) return 0.85; // на листья у окна
    if (speaking(2, t)) return toB; // от листьев к Билалу
    if (speaking(6, t) || speaking(9, t)) return toA;
    if (t >= stand.from && t < sitT.from) return t < go.to ? toA * 0.6 : toT;
    if (speaking(14, t) || speaking(18, t) || speaking(43, t)) return toT;
    if (speaking(27, t)) return seg(t, L(27).from, L(27).to) < 0.55 ? toB : toT;
    if (t >= toSprout.from && t < cupDown) {
      if (t >= check.from && t < upright.to) return 0.5;
      return toA * 0.7;
    }
    if (t >= lowT.from && t < toPot.from + sec(1.0)) return toB;
    if (t >= touchM.from && t < touch.to + sec(0.4)) return -0.55;
    const sp = speakerOf(t);
    if (sp === "muhammad") return toT;
    if (sp === "amir") return toA;
    if (sp === "bilal") return toB;
    return toT * 0.6;
  };
  const yPoseEx = (t: number): { pose: PoseIn; hold: boolean } => {
    const p = yusufPlace(t);
    const sit = sitAt(yusufSit, t);
    const rest = restArms(p, sit);
    const base: PoseIn = { floorSit: sit, sitMorph: true, expr: "listening", ...rest, lookY: -0.12, lean: 8 * Math.sin(Math.PI * clamp(sit)) * (sit > 0.02 && sit < 0.98 ? 1 : 0) };
    // касание плеча Амира
    if (t >= touchM.from && t < touchM.to) {
      const a = amirPlace(t);
      const shoulder: Vec = { x: a.x + 0.075 * a.h, y: a.y - 0.69 * a.h };
      const k = easeInOut(seg(t, touch.from - sec(0.1), touch.from + sec(0.35))) * (1 - easeInOut(seg(t, touch.to - sec(0.3), touch.to + sec(0.15))));
      const side = sideOf(p).R;
      return { pose: { ...base, expr: "smile", armR: arm(mixV(side, shoulder, k), k > 0.6 ? "open" : "relax", "down"), lookY: -0.35, headTilt: -2 }, hold: false };
    }
    if (t >= leaves.from && t < L(1).to + sec(0.3)) return { pose: { ...base, expr: speaking(1, t) ? "smile" : "curious", lookY: -0.18 }, hold: false };
    if (speaking(6, t)) return { pose: { ...base, expr: "curious", headTilt: -5, lookY: -0.05 }, hold: false };
    if (speaking(9, t)) {
      // немного придвигается к Амиру (наклон), не тянет за руку
      const k = easeInOut(seg(t, L(9).from + sec(0.4), L(9).to));
      return { pose: { ...base, expr: "softSmile", lean: 6 * k, lookY: -0.05, headTilt: -3 * k }, hold: false };
    }
    if (speaking(14, t) || speaking(18, t)) return { pose: { ...base, expr: "curious", headTilt: -4, lookY: -0.18 }, hold: false };
    if (speaking(27, t)) return { pose: { ...base, expr: "curious", lookY: -0.1 }, hold: false };
    if (speaking(36, t)) return { pose: { ...base, expr: "curious", lookY: -0.05, headTilt: -3 }, hold: false };
    if (speaking(43, t)) return { pose: { ...base, expr: "smile", lookY: -0.2 }, hold: false };
    if (t >= check.from && t < upright.to) return { pose: { ...base, expr: "curious", lookY: -0.3 }, hold: false };
    if (t >= takeCard.from && t < show.to) return { pose: { ...base, expr: "curious", lookY: 0.5, lean: 5 }, hold: false };
    if (inPause(t)) return { pose: { ...base, expr: "neutral" }, hold: false };
    if (t >= turnB.from && t < L(30).to + sec(0.8)) return { pose: { ...base, expr: "softSmile", lean: -2 }, hold: false };
    return { pose: base, hold: false };
  };

  // ===== Билал =====
  const bFace = (t: number) => {
    const x = pB(t).x;
    const toT = faceTo(pT(t).x, x);
    const toA = faceTo(pA(t).x, x);
    const toY = faceTo(pY(t).x, x);
    if (t < door.from) return 0.3; // в книгу, к окну
    if (t < bagM.from) return faceTo(pA(t).x, x, 500); // видит, как Амир входит
    if (t < leaves.from) return toA * 0.8;
    if (t >= leaves.from && t < L(1).to) return 0.6; // тоже на росток
    if (speaking(2, t) || speaking(3, t) || speaking(4, t)) return toA;
    if (speaking(8, t)) return toY * 0.7;
    if (t >= sitB.from && t < L(4).from) return t < sitB.from + sec(0.9) ? 0.1 : toA;
    if (t >= stand.from && t < sitT.from) return t < go.to ? toA * 0.5 : toT;
    if (speaking(20, t) || speaking(22, t)) return toT;
    if (t >= turnB.from && t < L(30).to + sec(0.6)) return toA;
    if (t >= lowT.from && t < show.to) return t < lowT.from + sec(2.0) ? toA * 0.5 : t >= show.from ? toA : 0.05;
    if (t >= toPot.from && t < atPot.to) return t < atPot.from ? 0.3 : 0.4;
    if (t >= toSprout.from && t < cupDown) return t >= check.from ? 0.55 : toT * 0.8;
    const sp = speakerOf(t);
    if (sp === "muhammad") return toT;
    if (sp === "amir") return toA;
    if (sp === "yusuf") return toY;
    return toT * 0.7;
  };
  const bPoseEx = (t: number): { pose: PoseIn; hold: boolean } => {
    const p = bilalPlace(t);
    const sit = sitAt(bilalSit, t);
    const rest = restArms(p, sit);
    const base: PoseIn = { floorSit: sit, sitMorph: true, expr: "listening", ...rest, lookY: -0.08, lean: 9 * Math.sin(Math.PI * clamp(sit)) * (sit > 0.02 && sit < 0.98 ? 1 : 0) };
    // карточка: берёт со стопки, кладёт перед собой, берёт карандаш, рисует и пишет, показывает, несёт, ставит у горшка
    if (t >= cardReach && t < cardPlaced + sec(0.5)) {
      const c = card(t);
      const pc = pencil(t);
      const lap = lapOf(p);
      let hl: Vec = lap.L;
      let hr: Vec = lap.R;
      let sl: WorldArm["shape"] = "relax";
      let sr: WorldArm["shape"] = "relax";
      let hold = false;
      if (t < cardLaid) {
        const u = easeInOut(seg(t, cardReach, cardTaken));
        hr = mixV(lap.R, { x: c.pos.x + 12, y: c.pos.y + 3 }, u);
        sr = u > 0.85 ? "pinch" : "open";
        hold = true;
      } else if (t < pencilTaken + sec(0.1)) {
        const u = easeInOut(seg(t, cardLaid, pencilTaken));
        hr = mixV({ x: c.pos.x + 12, y: c.pos.y + 3 }, lap.R, easeInOut(seg(t, cardLaid, cardLaid + sec(0.25))));
        hl = mixV(lap.L, { x: PENCIL.x - 4, y: PENCIL.y + 2 }, u);
        sl = u > 0.85 ? "pinch" : "open";
      } else if (t < pencilLaid) {
        // правая рука Билала (слева в кадре) пишет, левая придерживает карточку
        hl = { x: pc.tip.x - 6, y: pc.tip.y + 12 };
        sl = "pinch";
        hr = { x: c.pos.x + CARD_WORK.w * 0.5 + 4, y: c.pos.y + 2 };
        sr = "open";
        hold = true;
      } else if (t < cardUp) {
        const u = easeInOut(seg(t, pencilLaid, pencilLaid + sec(0.4)));
        hl = mixV({ x: PENCIL.x - 4, y: PENCIL.y + 2 }, lap.L, u);
      } else {
        // обе руки держат карточку за края
        const w = CARD_WORK.w * 0.5;
        hl = { x: c.pos.x - w - 2, y: c.pos.y + 4 };
        hr = { x: c.pos.x + w + 2, y: c.pos.y + 4 };
        sl = "pinch";
        sr = "pinch";
        hold = true;
        if (t >= cardPlaced) {
          const u = easeInOut(seg(t, cardPlaced, cardPlaced + sec(0.5)));
          const side = sideOf(p);
          hl = mixV(hl, side.L, u);
          hr = mixV(hr, side.R, u);
          sl = "open";
          sr = "open";
          hold = u < 0.2;
        }
        if (t >= toPot.from + sec(0.9) && t < atPot.from) {
          // несёт одной рукой
          hl = sideOf(p).L;
          sl = "relax";
          hr = { x: c.pos.x + w * 0.6, y: c.pos.y + 6 };
        }
      }
      const writingNow = t >= writeStart && t <= writeEnd;
      return {
        pose: { ...base, expr: speaking(39, t) || t >= show.from ? "softSmile" : speaking(37, t) ? "calm" : "focused", armL: arm(hl, sl, "out"), armR: arm(hr, sr, "out"), lookY: t >= show.from && t < toPot.from ? 0.05 : 0.5, lean: writingNow ? 8 : 3 },
        hold,
      };
    }
    if (speaking(2, t)) return { pose: { ...base, expr: "softSmile", lookY: -0.05 }, hold: false };
    if (speaking(4, t)) return { pose: { ...base, expr: "calm", lookY: 0 }, hold: false };
    if (speaking(8, t)) return { pose: { ...base, expr: "thinking", lookY: 0.05 }, hold: false };
    if (speaking(10, t)) return { pose: { ...base, expr: "softSmile", lookY: 0 }, hold: false };
    if (speaking(20, t) || speaking(22, t)) return { pose: { ...base, expr: "curious", lookY: -0.05, lean: 3 }, hold: false };
    if (speaking(30, t)) return { pose: { ...base, expr: "smile", lookY: 0 }, hold: false };
    if (speaking(37, t)) return { pose: { ...base, expr: "calm" }, hold: false };
    if (inPause(t)) return { pose: { ...base, expr: "neutral" }, hold: false };
    if (t >= check.from && t < upright.to) return { pose: { ...base, expr: "focused", lookY: 0.3 }, hold: false };
    return { pose: base, hold: false };
  };

  // ===== Учитель =====
  const tFace = (t: number) => {
    const x = pT(t).x;
    const toA = faceTo(pA(t).x, x);
    const toY = faceTo(pY(t).x, x);
    const toB = faceTo(pB(t).x, x);
    if (t < notice) return -0.12; // читает
    if (t < sitT.from) return toA;
    if (speaking(17, t)) {
      const u = seg(t, L(17).from, L(17).to);
      return u > 0.12 && u < 0.38 ? -0.85 : toA; // короткий взгляд на полочку с Кораном
    }
    if (t >= toSprout.from && t < upright.to) {
      if (t >= check.from && t < checkEnd) return -0.45;
      if (t >= water.from && t < hand.from) return -0.6; // на поднос
      if (t >= hand.from && t < shared.to) return -0.7;
      return toA;
    }
    if (t >= lowT.from && t < toPot.to) return -0.85; // смотрит, как делают карточку
    const sp = speakerOf(t);
    if (sp === "yusuf") return toY;
    if (sp === "bilal") return toB;
    if (sp === "amir") return toA;
    if (sp === "muhammad") {
      if (speaking(14, t) || speaking(15, t) || speaking(18, t) || speaking(19, t) || speaking(43, t) || speaking(44, t)) return toY;
      if (speaking(20, t) || speaking(21, t) || speaking(22, t) || speaking(23, t)) return toB;
      if (speaking(24, t) || speaking(31, t)) return toY * 0.7;
      return toA;
    }
    if (inPause(t)) return toY * 0.6;
    return toA * 0.8;
  };
  const tPoseEx = (t: number): { pose: PoseIn; hold: boolean } => {
    const p = teacherPlace(t);
    const sit = sitAt(teacherSit, t);
    const rest = restArms(p, sit);
    const lap = lapOf(p);
    const base: PoseIn = { floorSit: sit, sitMorph: true, expr: "calm", ...rest, lookY: 0.12, lean: 8 * Math.sin(Math.PI * clamp(sit)) * (sit > 0.02 && sit < 0.98 ? 1 : 0) };
    // книга в руках: читает стоя, закрывает, садится, кладёт на стол справа
    if (t < bookDown + sec(0.45)) {
      const b = book(t);
      const w = 30;
      const reading = t < notice;
      const toLap = easeInOut(seg(t, bookDown, bookDown + sec(0.45)));
      const hl: Vec = b.where === "hands" ? { x: b.pos.x - w, y: b.pos.y + 10 } : mixV({ x: b.pos.x - w, y: b.pos.y + 4 }, lap.L, toLap);
      const hr: Vec = b.where === "hands" ? { x: b.pos.x + w, y: b.pos.y + 10 } : mixV({ x: b.pos.x + w, y: b.pos.y + 4 }, lap.R, toLap);
      const handsOnBook = t < bookPut.from;
      return {
        pose: { ...base, expr: reading ? "focused" : "listening", armL: arm(handsOnBook ? hl : mixV(hl, lap.L, easeInOut(seg(t, bookPut.from, bookPut.from + sec(0.3)))), handsOnBook ? "fist" : "relax", "down"), armR: arm(hr, t < bookDown ? "fist" : "open", "down"), lookY: reading ? 0.55 : 0.1 },
        hold: b.where === "hands",
      };
    }
    // приглашает мальчиков сесть: открытая ладонь к ковру
    if (t >= sitT.from && t < sitT.from + sec(1.4)) {
      const k = win(t, sitT.from, sitT.from + sec(1.2), 10);
      const target: Vec = { x: lap.L.x - 0.14 * p.h, y: lap.L.y - 0.02 * p.h };
      return { pose: { ...base, expr: "softSmile", armL: arm(mixV(lap.L, target, k), k > 0.3 ? "open" : "relax", "out"), lookY: 0.1 }, hold: false };
    }
    // проверка земли: наклон, кончики пальцев к земле, два лёгких касания, рука назад
    if (t >= check.from + sec(0.6) && t < checkEnd + sec(0.4)) {
      const reach = easeInOut(seg(t, check.from + sec(0.7), touchSoil));
      const back = easeInOut(seg(t, soilTouch[1] + sec(0.35), checkEnd));
      const press = (f0: number) => Math.sin(Math.PI * seg(t, f0 - 4, f0 + 6)) * 4;
      const soil: Vec = { x: POT.x + 14, y: POT.soilY + 2 + press(soilTouch[0]) + press(soilTouch[1]) };
      const side = sideOf(p).R;
      const h = mixV(mixV(side, soil, reach), side, back);
      const lean = 14 * reach * (1 - back) + 4 * (1 - back);
      return { pose: { ...base, expr: "focused", armR: arm(h, reach > 0.8 && back < 0.3 ? "point" : "relax", "down"), lookY: 0.65 * (1 - back) + 0.1, lean }, hold: false };
    }
    // кувшин: ручка → поднять → наклон над чашкой → вернуть
    if (t >= water.from + sec(0.4) && t < jugFree + sec(0.3)) {
      const j = jug(t);
      const grip = { x: j.pos.x + rot(JUG_HANDLE, j.tilt).x, y: j.pos.y + rot(JUG_HANDLE, j.tilt).y };
      const side = sideOf(p).R;
      const reach = easeInOut(seg(t, water.from + sec(0.4), jugReach));
      const back = easeInOut(seg(t, jugSet, jugFree + sec(0.3)));
      const h = mixV(mixV(side, grip, reach), side, back);
      const holding = reach > 0.9 && back < 0.1;
      return { pose: { ...base, expr: "focused", armR: arm(h, holding ? "fist" : "open", "down"), lookY: 0.55, lean: 7 }, hold: holding };
    }
    // чашка: взять с подноса, протянуть Амиру, отпустить после общего захвата
    if (t >= cupReach - sec(0.2) && t < teacherFree + sec(0.2)) {
      const c = cup(t);
      const grip = { x: c.pos.x + rot(CUP_RIGHT, c.tilt).x, y: c.pos.y + rot(CUP_RIGHT, c.tilt).y };
      const side = sideOf(p).R;
      const reach = easeInOut(seg(t, cupReach - sec(0.2), cupTaken));
      const back = easeInOut(seg(t, shared.to, teacherFree));
      const h = mixV(mixV(side, grip, reach), side, back);
      const holding = reach > 0.9 && back < 0.1;
      return { pose: { ...base, expr: t >= shared.from ? "softSmile" : "focused", armR: arm(h, holding ? "fist" : "open", "down"), lookY: 0.35, lean: 6 * (1 - back) }, hold: holding };
    }
    // объясняющий жест: открытая ладонь (правая рука — к детям слева)
    const gestures = [12, 15, 17, 19, 21, 23, 26, 28, 40, 42, 44];
    for (const id of gestures) {
      const l = L(id);
      if (t >= l.from - 4 && t <= l.to + 10) {
        const k = win(t, l.from - 4, l.to + 10, 12) * (id === 17 ? 0.5 : 0.75);
        const sitting = sit > 0.5;
        const open: Vec = sitting ? { x: lap.L.x - 0.1 * p.h, y: lap.L.y - 0.3 * p.h } : { x: p.x - 0.22 * p.h, y: p.y - 0.52 * p.h };
        const from = sitting ? lap.L : sideOf(p).L;
        const expr = id === 12 || id === 42 || id === 44 || id === 26 ? "softSmile" : "calm";
        // «Спасибо, что рассказал» — мягкий кивок
        const nod = id === 12 ? 5 * Math.sin(Math.PI * seg(t, l.from, l.from + sec(0.9))) : 0;
        return { pose: { ...base, expr, armL: arm(mixV(from, open, k), k > 0.3 ? "open" : "relax", "out"), lookY: sitting ? 0.12 : 0.3, nod }, hold: false };
      }
    }
    if (speaking(33, t)) {
      const u = seg(t, L(33).from - 2, L(33).to + 10);
      return { pose: { ...base, expr: "softSmile", nod: 5 * Math.sin(Math.PI * u), lookY: 0.3 }, hold: false };
    }
    if (inPause(t)) return { pose: { ...base, expr: "listening", lookY: sit > 0.5 ? 0.08 : 0.3 }, hold: false };
    const sp = speakerOf(t);
    if (sp && sp !== "muhammad") return { pose: { ...base, expr: "listening", lookY: sit > 0.5 ? 0.1 : 0.32 }, hold: false };
    if (t >= toSprout.from && sit < 0.5) return { pose: { ...base, expr: "calm", lookY: 0.3 }, hold: false };
    return { pose: base, hold: false };
  };

  // ---------- фон класса: свои дела ----------
  // Перевернуть страницу — раз в 7–14 с по своему расписанию; в зрительских
  // паузах и в первые секунды фильма страницы не листают.
  const flipLen = sec(0.8);
  const flipsOf = (p: CastPupil): number[] => {
    if (p.plan?.activity !== "read") return [];
    const period = sec(7 + hash01(p.seed) * 7);
    const offset = sec(1.5 + hash01(p.seed + 1) * 9);
    const out: number[] = [];
    for (let at = offset; at < end - sec(1); at += period) if (!inPause(at, sec(1)) && !inPause(at + flipLen, sec(1))) out.push(at);
    return out;
  };
  const flipTimes = new Map<string, number[]>();
  const bgItem = (p: CastPupil, t: number): BgItem => {
    const pl = bgPlace(p);
    const plan = p.plan!;
    const pos: Vec = { x: pl.x + 0.01 * pl.h, y: pl.y - 0.075 * pl.h };
    const w = 0.24 * pl.h;
    if (plan.activity === "rest") return { kind: "closed", pos, w: w * 0.7, flip: 0, progress: 0, color: plan.item, pencil: null };
    if (plan.activity === "read") {
      let times = flipTimes.get(p.id);
      if (!times) {
        times = flipsOf(p);
        flipTimes.set(p.id, times);
      }
      const at = times.find((x) => t >= x && t < x + flipLen);
      const flip = at !== undefined ? easeInOut((t - at) / flipLen) : 0;
      return { kind: "book", pos, w, flip, progress: 0, color: plan.item, pencil: null };
    }
    // рисует / пишет: штрихи появляются медленно, с паузами; в зрительских паузах карандаш не движется
    const cycle = sec(10 + hash01(p.seed + 3) * 6);
    const phase = (t + Math.floor(hash01(p.seed + 4) * cycle)) % cycle;
    const draws = phase < cycle * 0.55 && !inPause(t, sec(0.5));
    const prog = clamp(0.15 + 0.85 * (t / end) * 0.9);
    const loop = draws ? t / 9 + p.seed : p.seed;
    const tip: Vec = { x: pos.x + Math.cos(loop) * w * 0.12 + w * 0.08, y: pos.y + Math.sin(loop * 1.3) * w * 0.035 - 1 };
    return { kind: "notebook", pos, w, flip: 0, progress: prog, color: plan.item, pencil: tip };
  };
  const pageFlips: { id: string; at: number }[] = [];
  for (const p of CAST) for (const at of flipsOf(p)) pageFlips.push({ id: p.id, at });
  const bg = (p: CastPupil): Ctl => {
    const base = bgPlace(p);
    const plan = p.plan!;
    const glanceDoor = (p.seed % 5 === 1 || p.seed % 7 === 3) && plan.seat.x < 1300;
    return {
      place: () => base,
      face: (t) => {
        // двое-трое ненадолго поднимают глаза на открывшуюся дверь и возвращаются к делу
        if (glanceDoor && t >= doorOpenAt + sec(0.3) && t < doorClosed + sec(0.4)) return faceTo(DOOR_CX, base.x, 700);
        const drift = Math.sin(t / (90 + hash01(p.seed) * 60) + p.seed) * 0.06;
        return clamp(0.02 + drift + (plan.activity === "rest" ? Math.sin(t / 140 + p.seed) * 0.12 : 0), -0.3, 0.3);
      },
      pose: (t) => {
        const item = bgItem(p, t);
        const lap = lapOf(base);
        const w = item.w;
        const glance = glanceDoor && t >= doorOpenAt + sec(0.3) && t < doorClosed + sec(0.4);
        let armL: WorldArm = { target: { x: item.pos.x - w * 0.46, y: item.pos.y + 3 }, shape: "open", elbow: "in" };
        let armR: WorldArm = { target: { x: item.pos.x + w * 0.46, y: item.pos.y + 3 }, shape: "open", elbow: "in" };
        if (item.kind === "closed") {
          armL = { target: lap.L, shape: "relax", elbow: "in" };
          armR = { target: { x: item.pos.x + w * 0.3, y: item.pos.y + 2 }, shape: "relax", elbow: "in" };
        } else if (item.kind === "book" && item.flip > 0) {
          const x = lerp(item.pos.x + w * 0.46, item.pos.x - w * 0.2, Math.sin(Math.PI * 0.5 * item.flip));
          armR = { target: { x, y: item.pos.y - 4 - 6 * Math.sin(Math.PI * item.flip) }, shape: "pinch", elbow: "in" };
        } else if (item.kind === "notebook" && item.pencil) {
          armR = { target: { x: item.pencil.x + 5, y: item.pencil.y + 6 }, shape: "pinch", elbow: "in" };
        }
        const micro = Math.sin(t / (61 + hash01(p.seed) * 40) + p.seed * 2);
        return {
          floorSit: 1,
          expr: plan.activity === "rest" ? "calm" : "focused",
          armL,
          armR,
          lookY: glance ? 0 : plan.activity === "rest" ? 0.2 : 0.6,
          lean: plan.activity === "rest" ? 0 : 4 + micro,
          headTilt: micro * 1.5,
        };
      },
      holding: () => true,
    };
  };
  return {
    teacher: { place: teacherPlace, face: tFace, pose: (t) => tPoseEx(t).pose, holding: (t) => tPoseEx(t).hold },
    yusuf: { place: yusufPlace, face: yFace, pose: (t) => yPoseEx(t).pose, holding: (t) => yPoseEx(t).hold },
    amir: { place: amirPlace, face: aFace, pose: (t) => aPoseEx(t).pose, holding: (t) => aPoseEx(t).hold },
    bilal: { place: bilalPlace, face: bFace, pose: (t) => bPoseEx(t).pose, holding: (t) => bPoseEx(t).hold },
    bg,
    bgItem,
    door: doorAt,
    bag,
    book,
    jug,
    cup,
    stream,
    card,
    cardsCount,
    pencil,
    progress,
    inDoorway: (t) => amirPos(t).y < 1000,
    events: {
      doorOpen: doorOpenAt,
      doorClosed,
      bagDown: bagTouch,
      soilTouch,
      checkEnd,
      jugLift,
      pourCup: pourCupSpan,
      cupTaken,
      handoff: shared,
      waterOn,
      cupUpright,
      cupDown,
      bookDown,
      cardTaken,
      writeStart,
      writeEnd,
      cardPlaced,
      touch,
      writeSpans,
      sits,
      pageFlips,
      allSeated: ret.to,
    },
  };
};
