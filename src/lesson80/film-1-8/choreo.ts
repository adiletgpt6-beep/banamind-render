// Хореография фильма 80-1-8: для каждого персонажа функции кадра → место,
// направление взгляда и поза (руки, мимика, посадка); состояние реквизита
// (лодочка, рисунок, отдельный лист, Коран на подставке, карточка, карандаш).
// Все моменты берутся из шкалы (реплики, зрительские паузы, отрезки
// действий), поэтому при перезаписи озвучки постановка пересчитывается сама.
// Всё детерминированно по номеру кадра; состояние с произвольного кадра —
// правильное (никаких накопителей и таймеров).
import { FPS } from "../core/video.ts";
import type { Place, PoseIn, WorldArm } from "../rig/Actor";
import { clamp, easeInOut, easeOut, lerp, smoothstep, hash01, type Vec } from "../rig/motion.ts";
import { castById, seatPlace, teacherPlaceAt, type CastPupil } from "./cast.ts";
import { cardTip } from "./card.ts";
import { AT_TABLE, BOAT, BOAT_FROM, CARD, EARTH_SHEET, FOLDER, HANDOFF, PENCIL, QURAN_FLAT, QURAN_ON_STAND, SHEET_SLOT, STACK, TABLE } from "./layout.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type Ctl = {
  readonly place: (t: number) => Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  // кисти поверх столешницы (касание предметов на столе)
  readonly armsFront: (t: number) => boolean;
};

export type CardState = "blank" | "beingWritten" | "complete" | "inFolder";
export type Carrier = "yusuf" | "amir" | null;

export type SheetState = { readonly pos: Vec; readonly flat: number; readonly rot: number; readonly carried: boolean };
export type CardInfo = { readonly pos: Vec; readonly rot: number; readonly flat: number; readonly state: CardState; readonly progress: number; readonly carrier: Carrier; readonly onStack: boolean };
export type PencilInfo = { readonly tip: Vec; readonly angle: number; readonly inHand: boolean; readonly lift: number };
export type QuranInfo = { readonly pos: Vec; readonly onStand: number; readonly carried: boolean; readonly tilt: number };

export type Events = {
  readonly boatMove: { from: number; to: number };
  readonly sheetLaid: number; // кадр: рисунок Земли лёг на папку
  readonly looseTaken: number; // кадр: лист взят со стопки
  readonly loosePlaced: number; // кадр: лист лёг рядом с лодочкой
  readonly bookLifted: number;
  readonly bookSet: number; // кадр касания подставки
  readonly cardTaken: number; // карточка снята со стопки
  readonly cardPlaced: number; // карточка легла перед Амиром
  readonly pencilUp: number;
  readonly writeStart: number;
  readonly writeEnd: number;
  readonly pencilDown: number;
  readonly cardInFolder: number;
  readonly writeSpans: readonly { from: number; to: number }[]; // карандаш касается бумаги
};

export type Choreo = {
  readonly teacher: Ctl;
  readonly yusuf: Ctl;
  readonly amir: Ctl;
  readonly bilal: Ctl;
  readonly bg: (p: CastPupil) => Ctl;
  readonly boat: (t: number) => Vec;
  readonly earth: (t: number) => SheetState; // рисунок Земли: в руках Юсуфа → на папке
  readonly loose: (t: number) => SheetState | null; // отдельный лист: null — ещё в стопке
  readonly stackCount: (t: number) => number; // листов в стопке на ковре
  readonly quran: (t: number) => QuranInfo;
  readonly card: (t: number) => CardInfo;
  readonly pencil: (t: number) => PencilInfo;
  readonly progress: (t: number) => number; // доля написанного 0…1
  readonly writing: (t: number) => boolean; // карандаш сейчас касается бумаги
  readonly events: Events;
};

const sec = (s: number) => Math.round(s * FPS);

// Путь по точкам с остановками: [[кадр, точка], …]; между ключами — плавно.
const path = (t: number, pts: readonly (readonly [number, Vec])[], ease: (x: number) => number = easeInOut): Vec => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, p1] = pts[i];
    const [t0, p0] = pts[i - 1];
    if (t <= t1) {
      const u = t1 <= t0 ? 1 : ease((t - t0) / (t1 - t0));
      return { x: lerp(p0.x, p1.x, u), y: lerp(p0.y, p1.y, u) };
    }
  }
  return pts[pts.length - 1][1];
};
// Дуга между двумя точками (предмет переносят, слегка приподняв).
const arc = (a: Vec, b: Vec, u: number, lift: number): Vec => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) - lift * Math.sin(Math.PI * clamp(u)) });
const seg = (t: number, from: number, to: number) => (to <= from ? (t >= to ? 1 : 0) : clamp((t - from) / (to - from)));

const arm = (target: Vec, shape: WorldArm["shape"] = "open", elbow: WorldArm["elbow"] = "out"): WorldArm => ({ target, shape, elbow });
const lapOf = (p: Place) => ({
  L: { x: p.x - 0.13 * p.h, y: p.y - 0.06 * p.h },
  R: { x: p.x + 0.13 * p.h, y: p.y - 0.06 * p.h },
});
const lapArms = (p: Place): { armL: WorldArm; armR: WorldArm } => {
  const l = lapOf(p);
  return { armL: { target: l.L, shape: "relax", elbow: "in" }, armR: { target: l.R, shape: "relax", elbow: "in" } };
};
// Куда смотрит персонаж: поворот головы к точке мира из точки x.
const faceTo = (targetX: number, x: number, k = 760) => clamp((targetX - x) / k, -0.85, 0.85);
// Плавное окно 0…1 с краями in/out (кадры).
const win = (t: number, from: number, to: number, edge = 8) => smoothstep((t - from) / edge) * (1 - smoothstep((t - to) / edge));
const onTable = (v: Vec) => v.y > TABLE.top - 70 && v.x > TABLE.x1 - 40 && v.x < TABLE.x2 + 40;

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
  const inPause = (t: number) => tl.pauses.some((ps) => t / FPS >= ps.from - 0.05 && t / FPS <= ps.to);
  const scene = (t: number) => tl.sceneOf(t / FPS);

  // ---------- места ----------
  const yusufP = seatPlace(castById("yusuf"));
  const amirP = seatPlace(castById("amir"));
  const bilalP = seatPlace(castById("bilal"));
  const teacherP = teacherPlaceAt(AT_TABLE.teacher.x, AT_TABLE.teacher.y);
  const yLap = lapOf(yusufP);
  const aLap = lapOf(amirP);
  const tLap = lapOf(teacherP);

  // ---------- ключевые моменты ----------
  const s1 = M("лодочка и рисунок");
  const boatMove = { from: s1.from + sec(1.5), to: s1.from + sec(2.3) };
  const boatReach = s1.from + sec(0.9);
  const boatBack = s1.from + sec(3.0);
  const sheetDown = { from: s1.from + sec(3.2), to: s1.from + sec(4.8) };
  const sheetLaid = sheetDown.to;
  const sheetFree = sheetLaid + sec(0.8);
  const leanHold = M("учитель наклоняется к Юсуфу");
  const nodHold = M("Юсуф кивает");
  const take = M("Амир берёт лист");
  const looseReach = take.from + sec(0.5);
  const looseTaken = take.from + sec(1.3);
  const looseCarry = { from: looseTaken + sec(0.2), to: take.from + sec(2.8) };
  const loosePlaced = looseCarry.to;
  const looseFree = loosePlaced + sec(0.3);
  const looseBack = loosePlaced + sec(1.0);
  const raise = M("Амир поднимает руку");
  const handUp = { from: raise.from + sec(0.3), to: raise.from + sec(1.0) };
  const handDown = { from: L(16).from - 2, to: L(16).from + sec(0.6) };
  const book = M("учитель берёт Коран");
  const bookReach = book.from + sec(0.5);
  const bookLifted = book.from + sec(1.6);
  const bookCarry = { from: bookLifted + sec(0.4), to: book.from + sec(3.9) };
  const bookSet = book.from + sec(4.4);
  const bookFree = bookSet + sec(0.3);
  const bookBack = bookSet + sec(1.2);
  const toClass = M("учитель к классу");
  const cm = M("Юсуф придвигает карточку");
  const cardReach = cm.from + sec(0.3);
  const cardTaken = cm.from + sec(1.0);
  const cardLift = { from: cardTaken, to: cm.from + sec(1.6) };
  const cardSwap = cm.from + sec(1.8);
  const cardCarry = { from: cardSwap, to: cm.from + sec(2.5) };
  const cardPlaced = cardCarry.to;
  const yusufBack = cm.from + sec(2.7);
  const l39 = L(39);
  const pencilReach = cm.from + sec(2.6);
  const pencilUp = l39.from + sec(0.25);
  const writeStart = l39.from + sec(0.8);
  const w1 = M("письмо: начало");
  const cut = M("Юсуф смотрит, как пишет Амир");
  const w2 = M("письмо: конец");
  const writeEnd = w2.to - sec(0.3);
  const l40 = L(40);
  const pencilDown = l40.from + sec(0.2);
  const pencilLaid = l40.from + sec(0.9);
  const amirLap = l40.from + sec(1.5);
  const fol = M("карточка в папку");
  const fReach = fol.from + sec(0.2);
  const fTaken = fol.from + sec(0.8);
  const fCarryA = { from: fTaken, to: fol.from + sec(1.6) };
  const fSwap = fol.from + sec(1.75);
  const fCarryY = { from: fSwap, to: fol.from + sec(2.9) };
  const cardInFolder = fol.from + sec(3.2);
  const fBackA = fSwap + sec(0.7);
  const fBackY = cardInFolder + sec(0.8);

  // ---------- письмо ----------
  const progress = (t: number) => {
    if (t <= writeStart) return 0;
    if (t >= writeEnd) return 1;
    const A = w1.to;
    const C = cut.to;
    if (t < A) return 0.34 * easeOut(seg(t, writeStart, A));
    if (t < C) return lerp(0.34, 0.78, seg(t, A, C)); // монтажное сокращение: за время плана на Юсуфа написано больше
    return lerp(0.78, 1, seg(t, C, writeEnd));
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
  const writing = (t: number) => t >= writeStart && t <= writeEnd && cardTip(progress(t)).lift < 0.5;

  // ---------- карточка в мире ----------
  const kx = CARD.w / 300;
  const ky = kx * 0.26;
  const cardToWorld = (center: Vec, rotDeg: number, u: number, v: number): Vec => {
    const dx = (u - 150) * kx;
    const dy = (v - 100) * ky;
    const r = (rotDeg * Math.PI) / 180;
    return { x: center.x + dx * Math.cos(r) - dy * Math.sin(r), y: center.y + dx * Math.sin(r) + dy * Math.cos(r) };
  };
  const CARD_ON_FOLDER: Vec = { x: FOLDER.x + 14, y: FOLDER.y - 6 };
  const card = (t: number): CardInfo => {
    const prog = progress(t);
    const state: CardState = t >= cardInFolder ? "inFolder" : prog >= 1 ? "complete" : t > writeStart ? "beingWritten" : "blank";
    if (t < cardTaken) return { pos: { x: STACK.x, y: STACK.y }, rot: 0, flat: 1, state, progress: 0, carrier: null, onStack: true };
    if (t < cardSwap) {
      const u = seg(t, cardLift.from, cardLift.to);
      return { pos: arc({ x: STACK.x, y: STACK.y }, HANDOFF, easeInOut(u), 14), rot: lerp(0, -8, u), flat: lerp(1, 0.55, u), state, progress: 0, carrier: "yusuf", onStack: false };
    }
    if (t < cardPlaced) {
      const u = easeInOut(seg(t, cardCarry.from, cardCarry.to));
      return { pos: arc(HANDOFF, { x: CARD.x, y: CARD.y }, u, 22), rot: lerp(-8, CARD.rot, u), flat: lerp(0.55, 1, u), state, progress: 0, carrier: "amir", onStack: false };
    }
    if (t < fTaken) return { pos: { x: CARD.x, y: CARD.y }, rot: CARD.rot, flat: 1, state, progress: prog, carrier: null, onStack: false };
    if (t < fSwap) {
      const u = easeInOut(seg(t, fCarryA.from, fCarryA.to));
      return { pos: arc({ x: CARD.x, y: CARD.y }, HANDOFF, u, 26), rot: lerp(CARD.rot, -6, u), flat: lerp(1, 0.55, u), state, progress: 1, carrier: "amir", onStack: false };
    }
    if (t < cardInFolder) {
      const u = easeInOut(seg(t, fCarryY.from, fCarryY.to));
      return { pos: arc(HANDOFF, CARD_ON_FOLDER, u, 20), rot: lerp(-6, 3, u), flat: lerp(0.55, 1, u), state, progress: 1, carrier: "yusuf", onStack: false };
    }
    return { pos: CARD_ON_FOLDER, rot: 3, flat: 1, state, progress: 1, carrier: null, onStack: false };
  };
  const tipWorld = (t: number): { tip: Vec; lift: number } => {
    const c = card(t);
    const ct = cardTip(progress(t));
    return { tip: cardToWorld(c.pos, c.rot, ct.x, ct.y), lift: ct.lift };
  };
  const pencilRest: PencilInfo = { tip: { x: PENCIL.x, y: PENCIL.y }, angle: PENCIL.angle, inHand: false, lift: 0 };
  const pencil = (t: number): PencilInfo => {
    if (t < pencilUp || t >= pencilLaid) return pencilRest;
    const start = tipWorld(writeStart);
    if (t < writeStart) {
      // карандаш поднят над началом строки, пока Юсуф начинает диктовать
      const u = easeInOut(seg(t, pencilUp, writeStart));
      const hover = { x: start.tip.x, y: start.tip.y - 10 };
      return { tip: arc({ x: PENCIL.x, y: PENCIL.y }, hover, u, 10), angle: lerp(PENCIL.angle, -55, u), inHand: true, lift: 1 };
    }
    if (t <= writeEnd) {
      const { tip, lift } = tipWorld(t);
      return { tip: { x: tip.x, y: tip.y - 6 * lift }, angle: -55, inHand: true, lift };
    }
    if (t < pencilDown) {
      const { tip } = tipWorld(writeEnd);
      return { tip: { x: tip.x, y: tip.y - 8 }, angle: -55, inHand: true, lift: 1 };
    }
    const u = easeInOut(seg(t, pencilDown, pencilLaid));
    const end = tipWorld(writeEnd).tip;
    return { tip: arc({ x: end.x, y: end.y - 8 }, { x: PENCIL.x, y: PENCIL.y }, u, 8), angle: lerp(-55, PENCIL.angle, u), inHand: true, lift: 1 };
  };

  // ---------- лодочка, рисунок, лист, книга ----------
  const boat = (t: number): Vec => path(t, [[boatMove.from, BOAT_FROM], [boatMove.to, BOAT]]);
  // рисунок в руках — у груди, ниже подбородка, над краем столика
  const heldSheet = (): Vec => ({ x: yusufP.x + 0.02 * yusufP.h, y: yusufP.y - 0.2 * yusufP.h });
  const earth = (t: number): SheetState => {
    if (t >= sheetLaid) return { pos: { x: EARTH_SHEET.x, y: EARTH_SHEET.y }, flat: 1, rot: EARTH_SHEET.rot, carried: false };
    const u = easeInOut(seg(t, sheetDown.from, sheetDown.to));
    const held = heldSheet();
    const sway = t < sheetDown.from ? Math.sin(t / 23) * 1.2 : 0;
    return { pos: { x: lerp(held.x, EARTH_SHEET.x, u), y: lerp(held.y, EARTH_SHEET.y, u) }, flat: u, rot: lerp(-6 + sway, EARTH_SHEET.rot, u), carried: true };
  };
  const stackPos: Vec = { x: STACK.x, y: STACK.y };
  const loose = (t: number): SheetState | null => {
    if (t < looseTaken) return null;
    if (t >= loosePlaced) return { pos: { x: SHEET_SLOT.x, y: SHEET_SLOT.y }, flat: 1, rot: SHEET_SLOT.rot, carried: false };
    const u = easeInOut(seg(t, looseCarry.from, looseCarry.to));
    return { pos: arc(stackPos, { x: SHEET_SLOT.x, y: SHEET_SLOT.y }, u, 18), flat: lerp(0.7, 1, u), rot: lerp(6, SHEET_SLOT.rot, u), carried: true };
  };
  const stackCount = (t: number) => 4 - (t >= looseTaken ? 1 : 0) - (t >= cardTaken ? 1 : 0);
  const quran = (t: number): QuranInfo => {
    const flat: Vec = { x: QURAN_FLAT.x, y: QURAN_FLAT.y };
    const stand: Vec = { x: QURAN_ON_STAND.x, y: QURAN_ON_STAND.y };
    if (t < bookLifted) return { pos: flat, onStand: 0, carried: false, tilt: 0 };
    if (t < bookCarry.from) {
      const u = easeOut(seg(t, bookLifted, bookCarry.from));
      return { pos: { x: flat.x, y: flat.y - 16 * u }, onStand: 0, carried: true, tilt: 0 };
    }
    if (t < bookSet) {
      const u = easeInOut(seg(t, bookCarry.from, bookCarry.to));
      const settle = seg(t, bookCarry.to, bookSet);
      const p = arc({ x: flat.x, y: flat.y - 16 }, { x: stand.x, y: stand.y - 10 }, u, 26);
      return { pos: { x: p.x, y: p.y + 10 * easeInOut(settle) }, onStand: easeInOut(settle), carried: true, tilt: lerp(0, 1, u) };
    }
    return { pos: stand, onStand: 1, carried: false, tilt: 1 };
  };

  const events: Events = {
    boatMove,
    sheetLaid,
    looseTaken,
    loosePlaced,
    bookLifted,
    bookSet,
    cardTaken,
    cardPlaced,
    pencilUp,
    writeStart,
    writeEnd,
    pencilDown,
    cardInFolder,
    writeSpans,
  };

  // ---------- учитель ----------
  const tFace = (t: number) => {
    const s = scene(t);
    const sp = speakerOf(t);
    if (t >= book.from && t < bookBack) return 0.1; // на книгу
    if (t >= toClass.from && t < L(32).to + 6) return lerp(-0.42, -0.14, easeInOut(seg(t, toClass.from, toClass.to)));
    if (inPause(t)) return -0.14;
    if (s === "s7" && sp === "muhammad") return speaking(36, t) ? -0.2 : -0.16;
    if (sp === "yusuf") return faceTo(yusufP.x, teacherP.x);
    if (sp === "amir") return faceTo(amirP.x, teacherP.x);
    if (sp === "bilal") return faceTo(bilalP.x, teacherP.x);
    if (sp === "muhammad") {
      if (speaking(4, t) || speaking(5, t) || speaking(7, t) || speaking(13, t) || speaking(42, t)) return -0.28;
      if (speaking(11, t)) return faceTo(amirP.x, teacherP.x);
      if (speaking(9, t) || speaking(15, t) || speaking(21, t)) return -0.5;
      return -0.4;
    }
    if (s === "s1") return -0.26; // смотрит, как Юсуф раскладывает лодочку и рисунок
    if (t >= take.from && t < take.to) return faceTo(amirP.x, teacherP.x);
    if (t >= raise.from + sec(0.9) && t < L(16).from) return faceTo(amirP.x, teacherP.x);
    if (s === "s8") return t >= fol.from ? -0.3 : -0.36;
    return -0.4;
  };
  const tPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const p = teacherP;
    const lap = lapArms(p);
    const base: PoseIn = { floorSit: 1, expr: "calm", ...lap, lookY: 0.12 };
    // наклон к Юсуфу на уровень глаз (с конца сцены 1 и всю сцену 2)
    const leanK = t < leanHold.from ? 0 : t < leanHold.to ? easeInOut(seg(t, leanHold.from, leanHold.to)) : t < nodHold.to ? 1 : 1 - easeInOut(seg(t, nodHold.to, nodHold.to + sec(1.2)));
    const lean = 9 * leanK;
    const lookY = 0.12 + 0.3 * leanK;
    // Коран: взгляд → обе руки → бережный захват → перенос → установка → руки свободны
    if (t >= bookReach && t < bookBack) {
      const q = quran(t);
      const reach = easeInOut(seg(t, bookReach, bookLifted));
      const release = easeInOut(seg(t, bookFree, bookBack));
      const gripL: Vec = { x: q.pos.x - 34, y: q.pos.y + 6 };
      const gripR: Vec = { x: q.pos.x + 34, y: q.pos.y + 6 };
      const hl = { x: lerp(lerp(tLap.L.x, gripL.x, reach), tLap.L.x, release), y: lerp(lerp(tLap.L.y, gripL.y, reach), tLap.L.y, release) };
      const hr = { x: lerp(lerp(tLap.R.x, gripR.x, reach), tLap.R.x, release), y: lerp(lerp(tLap.R.y, gripR.y, reach), tLap.R.y, release) };
      const hold = reach > 0.9 && release < 0.1;
      return {
        pose: { ...base, expr: "focused", lean: 5 * (1 - release), armL: arm(hl, hold ? "fist" : "open", "out"), armR: arm(hr, hold ? "fist" : "open", "out"), lookY: 0.4 * (1 - release) + 0.12 },
        front: reach > 0.25 && release < 0.8,
      };
    }
    // объясняющий жест: открытая ладонь (левая рука — к детям, они слева)
    const gestureIds = [4, 5, 7, 11, 13, 17, 23, 25, 27, 29, 31, 32, 34, 36, 38, 42];
    for (const id of gestureIds) {
      const l = L(id);
      // вопросы зрителю (32, 34, 36): ладонь возвращается в колени до конца
      // вопроса — в паузе руки неподвижны
      const endAt = id === 32 || id === 34 || id === 36 ? l.to - 16 : l.to + 10;
      if (t >= l.from - 4 && t <= endAt) {
        const strength = id === 4 || id === 17 || id === 42 ? 0.9 : 0.65;
        const k = win(t, l.from - 4, endAt, 12) * strength;
        // правая (свободная) рука: Юсуф сидит вплотную слева, жест влево накрыл бы его
        const open: Vec = { x: tLap.R.x + 0.16 * p.h, y: tLap.R.y - 0.36 * p.h };
        const expr = id === 38 || id === 42 || id === 4 ? "softSmile" : "calm";
        return { pose: { ...base, expr, lean, lookY, armR: arm({ x: lerp(tLap.R.x, open.x, k), y: lerp(tLap.R.y, open.y, k) }, k > 0.3 ? "open" : "relax", "out") }, front: false };
      }
    }
    // короткие подтверждения: кивок
    for (const id of [9, 15, 19, 21]) {
      const l = L(id);
      if (t >= l.from - 2 && t <= l.to + 8) {
        const u = clamp((t - l.from + 2) / 14);
        return { pose: { ...base, expr: "softSmile", lean, lookY, nod: 5 * Math.sin(Math.PI * u) }, front: false };
      }
    }
    if (inPause(t)) return { pose: { ...base, expr: "listening", lookY: 0.05 }, front: false };
    const sp = speakerOf(t);
    if (sp && sp !== "muhammad") return { pose: { ...base, expr: "listening", lean, lookY }, front: false };
    if (t >= raise.from && t < L(16).from) return { pose: { ...base, expr: "listening", lookY: 0.08 }, front: false };
    return { pose: { ...base, lean, lookY }, front: false };
  };

  // ---------- Юсуф ----------
  const yFace = (t: number) => {
    const toT = faceTo(teacherP.x, yusufP.x);
    const toA = faceTo(amirP.x, yusufP.x);
    const toB = faceTo(bilalP.x, yusufP.x);
    const sp = speakerOf(t);
    if (t < sheetFree) return t < boatReach ? -0.05 : t < boatBack ? -0.12 : 0.08; // на рисунок и лодочку
    if (speaking(1, t)) return t < L(1).from + (L(1).to - L(1).from) * 0.5 ? toA * 0.6 : toT;
    if (speaking(3, t) || speaking(6, t) || speaking(12, t) || speaking(18, t) || speaking(28, t) || speaking(37, t) || speaking(41, t)) return toT;
    if (speaking(24, t)) return (t - L(24).from) / Math.max(1, L(24).to - L(24).from) < 0.45 ? toT : -0.5;
    if (t >= take.from && t < take.to) return toA * 0.7;
    if (t >= cardReach && t < yusufBack) return toA * 0.6;
    if (t >= l39.from - 6 && t < writeEnd) return t < l39.from + sec(1.0) ? toA : toA * 0.8;
    if (t >= fReach && t < fBackY) return t < fSwap ? toA * 0.7 : 0.1;
    if (t >= book.from && t < bookBack) return 0.3;
    if (sp === "muhammad") return toT;
    if (sp === "amir") return toA;
    if (sp === "bilal") return toB;
    if (inPause(t)) return toT * 0.8;
    if (t >= raise.from && t < L(16).from) return toA;
    if (scene(t) === "s8") return toA * 0.8;
    return toT * 0.8;
  };
  const yPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const p = yusufP;
    const lap = lapArms(p);
    const base: PoseIn = { floorSit: 1, expr: "listening", ...lap, lookY: -0.15 };
    // сцена 1: рисунок в левой руке, правая придвигает лодочку, затем обе кладут рисунок
    if (t < sheetFree) {
      const sh = earth(t);
      const handL: Vec = { x: sh.pos.x - 0.1 * p.h * (1 - sh.flat) - 26 * sh.flat, y: sh.pos.y + 0.07 * p.h * (1 - sh.flat) + 6 * sh.flat };
      const reachB = easeInOut(seg(t, boatReach, boatMove.from));
      const backB = easeInOut(seg(t, boatMove.to, boatBack));
      const b = boat(t);
      const boatHand: Vec = { x: b.x - 6, y: b.y + 4 };
      const toSheet = easeInOut(seg(t, boatBack, sheetDown.from));
      const handR: Vec =
        t < boatBack
          ? { x: lerp(lerp(yLap.R.x, boatHand.x, reachB), yLap.R.x, backB), y: lerp(lerp(yLap.R.y, boatHand.y, reachB), yLap.R.y, backB) }
          : { x: lerp(yLap.R.x, sh.pos.x + 0.1 * p.h * (1 - sh.flat) + 26 * sh.flat, toSheet), y: lerp(yLap.R.y, sh.pos.y + 0.07 * p.h * (1 - sh.flat) + 6 * sh.flat, toSheet) };
      const rel = easeInOut(seg(t, sheetLaid, sheetFree));
      const l: Vec = { x: lerp(handL.x, yLap.L.x, rel), y: lerp(handL.y, yLap.L.y, rel) };
      const r: Vec = { x: lerp(handR.x, yLap.R.x, rel), y: lerp(handR.y, yLap.R.y, rel) };
      const touching = reachB > 0.9 && backB < 0.1;
      return {
        pose: { ...base, expr: "focused", armL: arm(l, rel > 0.5 ? "relax" : "fist", "down"), armR: arm(r, touching ? "open" : rel > 0.5 ? "relax" : toSheet > 0.5 ? "fist" : "relax", "down"), lookY: 0.45 * (1 - rel) - 0.15 * rel, lean: 4 * (1 - rel) },
        front: (reachB > 0.3 && backB < 0.7) || sh.flat > 0.4,
      };
    }
    // карточка: со стопки → передача Амиру
    if (t >= cardReach && t < yusufBack) {
      const c = card(t);
      const reach = easeInOut(seg(t, cardReach, cardTaken));
      const back = easeInOut(seg(t, cardSwap, yusufBack));
      const grip: Vec = { x: c.pos.x + 10, y: c.pos.y + 4 };
      const h = { x: lerp(lerp(yLap.R.x, grip.x, reach), yLap.R.x, back), y: lerp(lerp(yLap.R.y, grip.y, reach), yLap.R.y, back) };
      return { pose: { ...base, expr: "focused", armR: arm(h, reach > 0.85 && back < 0.15 ? "pinch" : "open", "out"), lookY: 0.35, lean: 3 }, front: false };
    }
    // карточка в папку: принимает от Амира и кладёт на папку
    if (t >= fSwap - sec(0.7) && t < fBackY) {
      const c = card(t);
      const reach = easeInOut(seg(t, fSwap - sec(0.7), fSwap));
      const back = easeInOut(seg(t, cardInFolder, fBackY));
      const grip: Vec = { x: c.pos.x + 8, y: c.pos.y + 4 };
      const h = { x: lerp(lerp(yLap.R.x, grip.x, reach), yLap.R.x, back), y: lerp(lerp(yLap.R.y, grip.y, reach), yLap.R.y, back) };
      const holding = reach > 0.85 && back < 0.15;
      return { pose: { ...base, expr: "softSmile", armR: arm(h, holding ? "pinch" : "open", "out"), lookY: 0.4, lean: 4 }, front: t >= fSwap && onTable(h) };
    }
    // реплика 24: показывает на своё обычное место на ковре (влево, к классу)
    if (t >= L(24).from && t <= L(24).to + 12) {
      const l = L(24);
      const u = (t - l.from) / Math.max(1, l.to - l.from);
      const k = win(t, l.from + (l.to - l.from) * 0.4, l.to + 12, 10);
      const pt: Vec = { x: p.x - 0.42 * p.h, y: p.y - 0.36 * p.h };
      void u;
      return { pose: { ...base, expr: "curious", armL: arm({ x: lerp(yLap.L.x, pt.x, k), y: lerp(yLap.L.y, pt.y, k) }, k > 0.4 ? "point" : "relax", "out"), lookY: -0.1, headTilt: -3 * k }, front: false };
    }
    // кивок после прямого ответа (сцена 2)
    if (t >= nodHold.from && t < nodHold.to) {
      const u = clamp((t - nodHold.from - 6) / 22);
      return { pose: { ...base, expr: "softSmile", nod: 6 * Math.sin(Math.PI * u), lookY: -0.1 }, front: false };
    }
    if (t >= take.from && t < take.to) return { pose: { ...base, expr: "curious", lookY: 0.35 }, front: false };
    if (t >= book.from && t < bookBack) return { pose: { ...base, expr: "listening", lookY: 0.3 }, front: false };
    if (t >= l39.from - 6 && t < pencilLaid) return { pose: { ...base, expr: speaking(39, t) ? "softSmile" : "focused", lookY: t < l39.from + sec(1.0) ? 0.05 : 0.42, lean: 3 }, front: false };
    if (t >= pencilLaid && t < L(41).from - 4) return { pose: { ...base, expr: "softSmile", lookY: 0.3 }, front: false };
    const curious = speaking(3, t) || speaking(6, t) || speaking(12, t) || speaking(18, t) || speaking(28, t);
    const tilt = speaking(18, t) || speaking(28, t) ? -5 : speaking(3, t) ? -3 : 0;
    if (curious) return { pose: { ...base, expr: "curious", headTilt: tilt, lookY: -0.2 }, front: false };
    if (speaking(37, t) || speaking(41, t)) return { pose: { ...base, expr: t > L(37).to - 2 && t < L(41).from ? "softSmile" : "focused", lookY: -0.15, lean: 2 }, front: false };
    if (speaking(1, t)) return { pose: { ...base, expr: "softSmile", lookY: 0.1 }, front: false };
    if (inPause(t)) return { pose: { ...base, expr: "neutral", lookY: -0.1 }, front: false };
    const after = [19, 38].some((id) => t > L(id).to && t < L(id).to + 30);
    return { pose: { ...base, expr: after ? "softSmile" : "listening" }, front: false };
  };

  // ---------- Амир ----------
  const aFace = (t: number) => {
    const toT = faceTo(teacherP.x, amirP.x);
    const toY = faceTo(yusufP.x, amirP.x);
    const toB = faceTo(bilalP.x, amirP.x);
    const sp = speakerOf(t);
    if (t < sheetFree) return toY * 0.8; // на лодочку и рисунок
    if (t >= looseReach && t < looseBack) return t < looseTaken ? 0.12 : t < loosePlaced ? 0.05 : 0.02;
    if (speaking(10, t)) return (t - L(10).from) / Math.max(1, L(10).to - L(10).from) < 0.5 ? 0.05 : 0.15;
    if (speaking(2, t) || speaking(16, t) || speaking(26, t) || speaking(30, t) || speaking(33, t)) return toT * 0.9;
    if (t >= cardReach && t < pencilLaid) return t < cardSwap ? toY * 0.8 : t < cardPlaced ? -0.05 : speaking(40, t) ? toY : -0.08;
    if (t >= fReach && t < fBackA) return t < fSwap ? 0.1 : toY * 0.7;
    if (t >= book.from && t < bookBack) return toT * 0.85;
    if (sp === "muhammad") return toT;
    if (sp === "yusuf") return toY;
    if (sp === "bilal") return toB;
    if (inPause(t)) return toT * 0.8;
    if (t >= raise.from && t < L(16).from) return toT;
    if (scene(t) === "s8") return -0.05;
    return toT * 0.85;
  };
  const aPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const p = amirP;
    const lap = lapArms(p);
    const base: PoseIn = { floorSit: 1, expr: "listening", ...lap, lookY: -0.1 };
    // отдельный лист: взгляд → рука к стопке → захват → перенос → лист рядом с лодочкой → рука в колени
    if (t >= looseReach && t < looseBack) {
      const ls = loose(t);
      const reach = easeInOut(seg(t, looseReach, looseTaken));
      const back = easeInOut(seg(t, looseFree, looseBack));
      const target: Vec = ls ? { x: ls.pos.x + 30, y: ls.pos.y + 2 } : { x: STACK.x + 30, y: STACK.y + 2 };
      const h = { x: lerp(lerp(aLap.R.x, target.x, reach), aLap.R.x, back), y: lerp(lerp(aLap.R.y, target.y, reach), aLap.R.y, back) };
      const holding = reach > 0.9 && back < 0.1;
      return { pose: { ...base, expr: "focused", armR: arm(h, holding ? "pinch" : "open", "out"), lookY: 0.4 * (1 - back) - 0.1 * back, lean: 4 * (1 - back) }, front: Boolean(ls) && onTable(h) };
    }
    // поднимает руку, ждёт внимания учителя
    if (t >= handUp.from && t < handDown.to) {
      const up = easeInOut(seg(t, handUp.from, handUp.to)) * (1 - easeInOut(seg(t, handDown.from, handDown.to)));
      const top: Vec = { x: p.x + 0.16 * p.h, y: p.y - 0.92 * p.h };
      return { pose: { ...base, expr: "thinking", armR: arm({ x: lerp(aLap.R.x, top.x, up), y: lerp(aLap.R.y, top.y, up) }, up > 0.4 ? "open" : "relax", "out"), lookY: -0.12, headTilt: -3 * up }, front: false };
    }
    // карточка: принимает от Юсуфа, кладёт перед собой, берёт карандаш, пишет, кладёт карандаш
    if (t >= cardSwap - sec(0.6) && t < amirLap) {
      const c = card(t);
      const pc = pencil(t);
      const reach = easeInOut(seg(t, cardSwap - sec(0.6), cardSwap));
      const toPencil = easeInOut(seg(t, pencilReach, pencilUp));
      const rest = easeInOut(seg(t, pencilLaid, amirLap));
      let h: Vec;
      let shape: WorldArm["shape"] = "open";
      if (t < cardPlaced) {
        const grip: Vec = { x: c.pos.x - 10, y: c.pos.y + 4 };
        h = { x: lerp(aLap.R.x, grip.x, reach), y: lerp(aLap.R.y, grip.y, reach) };
        shape = reach > 0.85 ? "pinch" : "open";
      } else if (t < pencilUp) {
        const from: Vec = { x: c.pos.x - 10, y: c.pos.y + 4 };
        h = { x: lerp(from.x, PENCIL.x + 6, toPencil), y: lerp(from.y, PENCIL.y + 2, toPencil) };
        shape = toPencil > 0.85 ? "pinch" : "open";
      } else if (t < pencilLaid) {
        h = { x: pc.tip.x + 8, y: pc.tip.y + 12 };
        shape = "pinch";
      } else {
        h = { x: lerp(PENCIL.x + 6, aLap.R.x, rest), y: lerp(PENCIL.y + 2, aLap.R.y, rest) };
        shape = rest > 0.5 ? "relax" : "open";
      }
      const writingNow = t >= writeStart && t <= writeEnd;
      // левая ладонь придерживает карточку, пока идёт письмо
      const holdL = writingNow || (t >= cardPlaced && t < pencilDown);
      const hl: Vec = holdL ? { x: c.pos.x - CARD.w * 0.5 - 4, y: c.pos.y + 2 } : aLap.L;
      return {
        pose: { ...base, expr: speaking(40, t) ? "softSmile" : "focused", armR: arm(h, shape, "out"), armL: holdL ? arm(hl, "open", "out") : lap.armL, lookY: speaking(40, t) ? 0.05 : 0.5, lean: speaking(40, t) ? 2 : 7 },
        front: t >= cardSwap && rest < 0.5,
      };
    }
    // отдаёт карточку Юсуфу
    if (t >= fReach && t < fBackA) {
      const c = card(t);
      const reach = easeInOut(seg(t, fReach, fTaken));
      const back = easeInOut(seg(t, fSwap, fBackA));
      const grip: Vec = { x: c.pos.x - 10, y: c.pos.y + 4 };
      const h = { x: lerp(lerp(aLap.R.x, grip.x, reach), aLap.R.x, back), y: lerp(lerp(aLap.R.y, grip.y, reach), aLap.R.y, back) };
      return { pose: { ...base, expr: "softSmile", armR: arm(h, reach > 0.85 && back < 0.15 ? "pinch" : "open", "out"), lookY: 0.35, lean: 3 }, front: back < 0.2 && onTable(h) };
    }
    if (speaking(2, t)) {
      const u = clamp((t - L(2).from) / 12);
      return { pose: { ...base, expr: "softSmile", nod: 4 * Math.sin(Math.PI * u) }, front: false };
    }
    if (speaking(10, t)) return { pose: { ...base, expr: "calm", lookY: 0.35, lean: 3 }, front: false };
    if (speaking(16, t)) return { pose: { ...base, expr: (t - L(16).from) / Math.max(1, L(16).to - L(16).from) < 0.5 ? "thinking" : "curious", lookY: -0.1 }, front: false };
    if (speaking(26, t) || speaking(30, t)) return { pose: { ...base, expr: "curious", lean: 4, lookY: -0.1 }, front: false };
    if (speaking(33, t)) return { pose: { ...base, expr: "focused", lookY: -0.1 }, front: false };
    if (inPause(t)) return { pose: { ...base, expr: "neutral" }, front: false };
    if (t < sheetFree) return { pose: { ...base, expr: "softSmile", lookY: 0.35 }, front: false };
    const after = [11, 38].some((id) => t > L(id).to && t < L(id).to + 30);
    return { pose: { ...base, expr: after ? "softSmile" : "listening" }, front: false };
  };

  // ---------- Билал ----------
  const bFace = (t: number) => {
    const toT = faceTo(teacherP.x, bilalP.x);
    const toY = faceTo(yusufP.x, bilalP.x);
    const toA = faceTo(amirP.x, bilalP.x);
    const sp = speakerOf(t);
    if (t < sheetFree) return 0.55; // на рисунок Земли
    if (t >= book.from && t < bookBack) return 0.78;
    const bookLook = M("Билал смотрит на книгу");
    if (t >= bookLook.from && t < bookLook.to) return 0.78;
    if (speaking(8, t) || speaking(14, t) || speaking(20, t) || speaking(22, t) || speaking(35, t)) return toT;
    if (t >= take.from && t < take.to) return toA * 0.5;
    if (t >= l39.from && t < fol.to) return 0.2;
    if (sp === "muhammad") return toT;
    if (sp === "yusuf") return toY;
    if (sp === "amir") return toA;
    if (inPause(t)) return toT * 0.85;
    return toT * 0.85;
  };
  const bPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const p = bilalP;
    const lap = lapArms(p);
    const base: PoseIn = { floorSit: 1, expr: "listening", ...lap, lookY: -0.1 };
    const bookLook = M("Билал смотрит на книгу");
    if ((t >= book.from && t < bookBack) || (t >= bookLook.from && t < bookLook.to)) return { pose: { ...base, expr: "listening", lookY: 0.25 }, front: false };
    if (speaking(8, t) || speaking(22, t)) return { pose: { ...base, expr: "curious", lean: 3 }, front: false };
    if (speaking(14, t) || speaking(20, t) || speaking(35, t)) return { pose: { ...base, expr: "focused", lean: 4 }, front: false };
    if (inPause(t)) return { pose: { ...base, expr: "neutral" }, front: false };
    if (t < sheetFree || (t >= take.from && t < take.to) || (t >= l39.from && t < fol.to)) return { pose: { ...base, expr: "listening", lookY: 0.3 }, front: false };
    return { pose: base, front: false };
  };

  // ---------- фон класса ----------
  const focusX = (t: number) => {
    const sp = speakerOf(t);
    if (t >= book.from && t < bookBack) return QURAN_ON_STAND.x;
    if (sp === "muhammad") return teacherP.x;
    if (sp === "yusuf") return yusufP.x;
    if (sp === "amir") return amirP.x;
    if (sp === "bilal") return bilalP.x;
    if (inPause(t)) return teacherP.x;
    if (t >= take.from && t < take.to) return SHEET_SLOT.x;
    if (scene(t) === "s8") return CARD.x;
    if (scene(t) === "s1") return yusufP.x;
    return teacherP.x;
  };
  const bgMicro = (t: number, seed: number) => {
    const period = 150 + Math.floor(hash01(seed) * 120);
    const k = Math.floor(t / period);
    const local = t - k * period;
    const r = hash01(seed * 7 + k * 3);
    const shift = r < 0.3 && local < 40 ? Math.sin((local / 40) * Math.PI) : 0;
    const tilt = r > 0.7 && local > 60 && local < 140 ? smoothstep((local - 60) / 20) * (1 - smoothstep((local - 120) / 20)) : 0;
    return { lean: shift * 3, headTilt: tilt * (hash01(seed + 2) > 0.5 ? 5 : -5), lookY: 0.05 };
  };
  const bg = (p: CastPupil): Ctl => {
    const base = seatPlace(p);
    const delay = 3 + Math.floor(hash01(p.seed + 5) * 14);
    const stubborn = hash01(p.seed + 9) > 0.82;
    // сдержанные кивки только после произнесённого ответа ребёнка (не в паузах)
    const nodAfter = [33, 35, 37].map((id) => L(id).to + 8 + Math.floor(hash01(p.seed + id) * 20));
    return {
      place: () => base,
      face: (t) => faceTo(stubborn ? teacherP.x : focusX(t - delay), p.seat.x, 1000),
      pose: (t) => {
        const micro = bgMicro(t, p.seed);
        const lap = lapArms(base);
        const n = nodAfter.find((x) => t >= x && t < x + 16);
        const nod = n !== undefined && hash01(p.seed + 3) > 0.6 && !inPause(t) ? Math.sin(((t - n) / 16) * Math.PI) * 5 : 0;
        return { floorSit: 1, expr: "listening", ...lap, ...micro, nod };
      },
      armsFront: () => false,
    };
  };

  return {
    teacher: { place: () => teacherP, face: tFace, pose: (t) => tPoseEx(t).pose, armsFront: (t) => tPoseEx(t).front },
    yusuf: { place: () => yusufP, face: yFace, pose: (t) => yPoseEx(t).pose, armsFront: (t) => yPoseEx(t).front },
    amir: { place: () => amirP, face: aFace, pose: (t) => aPoseEx(t).pose, armsFront: (t) => aPoseEx(t).front },
    bilal: { place: () => bilalP, face: bFace, pose: (t) => bPoseEx(t).pose, armsFront: (t) => bPoseEx(t).front },
    bg,
    boat,
    earth,
    loose,
    stackCount,
    quran,
    card,
    pencil,
    progress,
    writing,
    events,
  };
};
