// Хореография фильма 80-1-13: для каждого персонажа функции кадра → место
// (ходьба по маршрутам без скольжения стоп — шаг считает риг), направление
// взгляда и поза (руки, мимика, присед, посадка на ковёр); состояние
// реквизита — шесть деталей картинки (стол → рука Амира → коробка), крышка и
// коробка (стол → руки Амира → верх полки), четыре ключевые книжки
// (ковёр/стол → руки → полка), карточки задания учителя — и тихие занятия
// 22 учеников. Все моменты берутся из шкалы (реплики, паузы, отрезки
// действий), поэтому при перезаписи озвучки постановка пересчитывается сама.
//
// Владелец предмета меняется ровно один раз на каждом переходе
// (поверхность → руки → поверхность): пока предмет в руках, его положение
// вычисляется из положения кистей, и наоборот — кисти стоят на краях
// предмета. Две копии одного предмета не рисуются никогда.
// Всё детерминированно по номеру кадра.
import { FPS } from "../core/video.ts";
import type { Place, PoseIn, WorldArm } from "../rig/Actor";
import { EXPR, type Expression, type HandShape } from "../rig/pose.ts";
import { clamp, cruise, easeInOut, glide, hash01, keys, lerp, smoothstep, type Vec } from "../rig/motion.ts";
import type { TopHandPose } from "../film-1-12/hands";
import { BOX, PIECES, planeToRoom, S, homeCenter, slotOf, type PieceId, type PiecePose } from "../film-1-12/puzzle.ts";
import { bgPlace, castById, placeAt, teacherPlaceAt, type CastPupil } from "./cast.ts";
import { BOOK, BOX_ON_SHELF, BOX_T, LID_T, GREEN_FLOOR, LEDGE, SHELF_SPOT, SHELF_SPOT_AMIR0, SPOT, TABLE, TABLE_STACK, type BookId } from "./layout.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type Ctl = {
  readonly place: (t: number) => Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  // кисти поверх стола и предметов (касание деталей, коробки)
  readonly front: (t: number) => boolean;
};

export type P3 = { readonly u: number; readonly w: number; readonly z: number };

// Рука Амира у стола (вид сверху и вид из комнаты одной точкой касания).
export type HandState = {
  readonly at: P3;
  readonly lap: number; // 0 — у стола, 1 — в коленях
  readonly pose: TopHandPose;
  readonly blend: { readonly to: TopHandPose; readonly t: number } | undefined;
  readonly twist: number;
};

// Книжка: где лежит/стоит и как повернута. x, y — середина нижнего края в
// мире комнаты; up — 0 лежит (видна сверху, сжата по глубине), 1 стоит лицом к
// комнате. layer — к какому слою рисунка относится (порядок по глубине).
export type BookWhere = "floor" | "table" | "hands" | "shelf";
export type BookState = { readonly id: BookId; readonly x: number; readonly y: number; readonly up: number; readonly where: BookWhere; readonly holder: "yusuf" | "amir" | null; readonly tilt: number };

// Коробка: на столе (плоскость стола), в руках Амира или на полке; крышка.
export type BoxState = {
  readonly where: "table" | "hands" | "shelf";
  readonly u: number; // на столе — плоскость стола
  readonly w: number;
  readonly z: number;
  readonly x: number; // в руках / на полке — мир комнаты (середина нижнего края)
  readonly y: number;
  readonly lid: { readonly u: number; readonly w: number; readonly z: number; readonly on: boolean; readonly held: boolean };
  readonly inside: number; // сколько деталей уже в коробке
};

export type BgItem = { readonly kind: "book" | "notebook" | "cards" | "none"; readonly pos: Vec; readonly w: number; readonly color: string; readonly flip: number; readonly pencil: Vec | null; readonly card: number };

export type CardState = { readonly x: number; readonly y: number; readonly placed: boolean };

export type Events = {
  readonly pieceIn: readonly number[]; // деталь легла в коробку
  readonly boxClose: number;
  readonly boxLift: number;
  readonly boxSet: number;
  readonly bookLift: readonly number[];
  readonly bookSet: readonly number[];
  readonly bookSlide: readonly number[];
  readonly cardSet: readonly number[];
  readonly cloth: readonly number[];
};

export type Choreo = {
  readonly teacher: Ctl;
  readonly yusuf: Ctl;
  readonly amir: Ctl;
  readonly bilal: Ctl;
  readonly bg: (p: CastPupil) => Ctl;
  readonly bgItem: (p: CastPupil, t: number) => BgItem;
  readonly piece: (id: PieceId, t: number) => PiecePose & { readonly inBox: boolean };
  readonly aHand: (side: "R" | "L", t: number) => HandState;
  readonly box: (t: number) => BoxState;
  readonly book: (id: BookId, t: number) => BookState;
  readonly cards: (t: number) => readonly CardState[];
  readonly teacherCard: (t: number) => Vec | null; // карточка в руке учителя
  readonly bilalBook: (t: number) => { readonly pos: Vec; readonly open: number; readonly floor: boolean };
  readonly events: Events;
};

const sec = (s: number) => Math.round(s * FPS);
const seg = (t: number, from: number, to: number) => (to <= from ? (t >= to ? 1 : 0) : clamp((t - from) / (to - from)));
const win = (t: number, from: number, to: number, edge = 8) => smoothstep((t - from) / edge) * (1 - smoothstep((t - to) / edge));
const mixV = (a: Vec, b: Vec, u: number): Vec => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
const mix3 = (a: P3, b: P3, u: number): P3 => ({ u: lerp(a.u, b.u, u), w: lerp(a.w, b.w, u), z: lerp(a.z, b.z, u) });
const arm = (target: Vec, shape: HandShape = "open", elbow: WorldArm["elbow"] = "auto"): WorldArm => ({ target, shape, elbow });
const faceTo = (targetX: number, x: number, gain = 2.2) => clamp(((targetX - x) / 760) * gain, -0.82, 0.82);
const EX = (browIn: number, browOut: number, lid: number, smile: number): Expression => ({ browIn, browOut, lid, smile });
const ROOM_SHAPE: Record<TopHandPose, HandShape> = { rest: "relax", open: "open", grip: "pinch", pinch: "pinch", point: "point", trace: "point" };

// Колени и руки сидящего: кисти на коленях.
const lapOf = (p: Place) => ({ L: { x: p.x - 0.13 * p.h, y: p.y - 0.06 * p.h }, R: { x: p.x + 0.13 * p.h, y: p.y - 0.06 * p.h } });
const sideOf = (p: Place) => ({ L: { x: p.x - 0.13 * p.h, y: p.y - 0.42 * p.h }, R: { x: p.x + 0.13 * p.h, y: p.y - 0.42 * p.h } });
// где свободно висят кисти стоящего (и присевшего — корпус ниже) ребёнка
const hangOf = (p: Place, crouch = 0) => {
  const y = p.y - (0.37 - 0.2 * crouch) * p.h;
  return { L: { x: p.x - 0.12 * p.h, y }, R: { x: p.x + 0.12 * p.h, y } };
};
// Руки при посадке: стоя — свободно вдоль тела, сидя — на коленях.
const restArms = (p: Place, sit: number): { armL: WorldArm; armR: WorldArm } => {
  if (sit <= 0.001) return { armL: { target: null, shape: "relax", elbow: "hang" }, armR: { target: null, shape: "relax", elbow: "hang" } };
  const lap = lapOf(p);
  const side = sideOf(p);
  const k = smoothstep(sit / 0.9);
  return { armL: { target: mixV(side.L, lap.L, k), shape: "relax", elbow: "in" }, armR: { target: mixV(side.R, lap.R, k), shape: "relax", elbow: "in" } };
};

const exprOf = (p: PoseIn): Expression => (typeof p.expr === "string" ? EXPR[p.expr] : p.expr ?? EXPR.neutral);
// у Юсуфа низкая чёлка: высоко поднятые брови уходили бы под неё
const browsUnderFringe = (p: PoseIn, max: number): PoseIn => {
  const e = exprOf(p);
  return { ...p, expr: { ...e, browIn: Math.min(e.browIn, max), browOut: Math.min(e.browOut, max) } };
};
// Внимательный взгляд: веко заметно опускается только при взгляде вниз.
const awake = (p: PoseIn): PoseIn => {
  const e = exprOf(p);
  const down = clamp(((p.lookY ?? 0) - 0.3) / 0.3);
  const cap = lerp(0.06, 0.09, down) * (1 - 0.4 * clamp(e.smile / 0.6));
  const browIn = Math.max(e.browIn, 0.8, down > 0 ? e.browOut + 0.6 * down : -Infinity);
  return { ...p, expr: { ...e, lid: Math.min(e.lid, cap), browIn } };
};

// ---------- ключи ----------
type K3 = readonly [number, P3];
const track3 = (t: number, ks: readonly K3[]): P3 => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t1, b] = ks[i];
    const [t0, a] = ks[i - 1];
    if (t <= t1) return mix3(a, b, t1 <= t0 ? 1 : easeInOut((t - t0) / (t1 - t0)));
  }
  return ks[ks.length - 1][1];
};
// маршрут ходьбы: стоит → идёт по точкам (разгон и торможение) → стоит
type Walk = { readonly from: number; readonly to: number; readonly pts: readonly Vec[] };
const walkAt = (t: number, start: Vec, walks: readonly Walk[]): Vec => {
  let p = start;
  for (const w of walks) {
    if (t < w.from) return p;
    if (t <= w.to) return glide(t, w.from, w.to, [p, ...w.pts], (x) => cruise(x, 0.28));
    p = w.pts[w.pts.length - 1];
  }
  return p;
};

type HAt = P3 | ((t: number) => P3) | "lap";
type HKey = { readonly t: number; readonly at: HAt; readonly pose: TopHandPose; readonly twist?: number };
const resolveAt = (at: HAt, t: number, lapPt: P3): P3 => (at === "lap" ? lapPt : typeof at === "function" ? at(t) : at);

const BOOK_IDS: readonly BookId[] = ["green", "blue", "orange", "red"];

export const buildChoreo = (tl: L80Timeline): Choreo => {
  const L = (id: number) => {
    const c = cueById(tl, id);
    return { from: sec(c.from), to: sec(c.to) };
  };
  const M = (label: string) => {
    const m = markOf(tl, label);
    return { from: sec(m.from), to: sec(m.to) };
  };
  const P = (i: number) => ({ from: sec(tl.pauses[i].from), to: sec(tl.pauses[i].to) });
  const speaking = (id: number, t: number, pad = 4) => t >= L(id).from - pad && t <= L(id).to + pad;
  const speakerOf = (t: number) => {
    const s = t / FPS;
    for (const c of tl.cues) if (s >= c.from - 0.15 && s <= c.to + 0.2) return c.role;
    return null;
  };
  const inPause = (t: number) => tl.pauses.some((ps) => t / FPS >= ps.from - 0.05 && t / FPS <= ps.to);
  const scene = (t: number) => tl.sceneOf(t / FPS);

  // ---------- отрезки ----------
  const mRoom = M("комната");
  const mPack = M("Амир кладёт детали");
  const mClose = M("Амир закрывает коробку");
  const mStand = M("Амир встаёт");
  const mCarryBox = M("Амир несёт коробку");
  const mSetBox = M("Амир ставит коробку");
  const mNotice = M("Юсуф замечает книжку");
  const mApproach = M("Юсуф подходит к книжке");
  const mPick = M("Юсуф поднимает книжку");
  const mCarryG = M("Юсуф несёт книжку");
  const mPlaceG = M("Юсуф ставит книжку");
  const mToT = M("Юсуф идёт к учителю");
  const mTurnT = M("учитель поворачивается");
  const mSitT = M("учитель садится");
  const mLookShelf = M("Юсуф смотрит на полку");
  const mAmirLook = M("Амир смотрит на полку");
  const mInsert = M("книжка на полке");
  const mSmile = M("Юсуф улыбается");
  const mCompare = M("Юсуф смотрит на книжку и коробку");
  const mThink = M("дети думают");
  const mShow = M("учитель показывает комнату");
  const mPencils = M("карандаши");
  const mAmirSmile = M("Амир улыбается");
  const mSmiles = M("улыбки");
  const mAmirGo = M("Амир идёт к столику");
  const mAmirTake = M("Амир берёт две книжки");
  const mAmirCarry = M("Амир несёт книжки");
  const mAmirPlace = M("Амир ставит книжки");
  const mAllLook = M("все смотрят на столик");
  const mYWalk = M("Юсуф идёт к столику");
  const mYTake = M("Юсуф берёт красную книжку");
  const mYCarry = M("Юсуф несёт красную книжку");
  const mYPlace = M("Юсуф ставит красную книжку");
  const mEach = M("мальчики смотрят друг на друга");
  const mReturn = M("дети возвращаются");
  const mPull = M("камера отходит");
  const p1 = P(0);
  const p2 = P(1);
  const p3 = P(2);
  void mRoom;
  void mSmiles;
  void mThink;
  void mInsert;
  void mPencils;
  void mAllLook;

  const YUSUF = castById("yusuf");
  const AMIR = castById("amir");
  const BILAL = castById("bilal");
  const bilalP = placeAt(BILAL.age, SPOT.bilal.x, SPOT.bilal.y);

  // =====================================================================
  // Амир: сидит за столом → встаёт с коробкой → полка → к разговору →
  // столик → полка → в сторону → на своё место
  // =====================================================================
  const A_R = { x: 1742, y: 1262 }; // справа от полки (ставит коробку и книжки)
  const A_C = { x: 1770, y: 1310 }; // у левого угла стола, за ним (берёт книжки)
  const A_ASIDE = { x: 1866, y: 1250 }; // отходит за угол стола, освобождая место
  const aWalks: Walk[] = [
    { from: mCarryBox.from + sec(0.2), to: mCarryBox.to - sec(0.1), pts: [{ x: 1880, y: 1342 }, { x: 1750, y: 1330 }, A_R] },
    { from: mToT.from + sec(0.5), to: mToT.to + sec(0.4), pts: [{ x: 1640, y: 1300 }, { x: 1500, y: 1268 }, SPOT.amirTalk] },
    { from: mAmirGo.from + sec(0.1), to: mAmirGo.to - sec(0.1), pts: [{ x: 1480, y: 1250 }, { x: 1620, y: 1318 }, A_C] },
    { from: mAmirCarry.from, to: mAmirCarry.to - sec(0.1), pts: [A_R] },
    // после того как сдвинул свои книжки — шаг за угол стола
    { from: L(30).to - sec(0.1), to: L(30).to + sec(1.2), pts: [A_ASIDE] },
    { from: mReturn.from + sec(0.2), to: mReturn.from + sec(4.0), pts: [{ x: 1700, y: 1300 }, { x: 1540, y: 1302 }, SPOT.amirHome] },
  ];
  const amirPos = (t: number) => walkAt(t, SPOT.amirSit, aWalks);
  const amirPlace = (t: number): Place => {
    const p = amirPos(t);
    return placeAt(AMIR.age, p.x, p.y);
  };
  const amirStand = (t: number) => 1 - keys(t, [[mStand.from + sec(0.25), 0], [mStand.to, 1]], easeInOut);
  const amirSitEnd = (t: number) => keys(t, [[mReturn.from + sec(4.0), 0], [mReturn.from + sec(5.5), 1]], easeInOut);
  const amirSit = (t: number) => (t < mReturn.from ? amirStand(t) : amirSitEnd(t));

  // =====================================================================
  // Юсуф: стоит у полки → два шага к книжке → присел, поднял → поставил в
  // левое отделение → идёт к учителю → (разговор) → столик → полка → место
  // =====================================================================
  const Y0 = { x: 1508, y: 1312 }; // в начале стоит у полки, смотрит, как Амир убирает
  const Y_BOOK = { x: 1426, y: 1296 }; // присел у книжки (книжка прямо перед ним, чуть левее)
  const Y_L = { x: 1410, y: 1282 }; // слева от полки — ставит в левое отделение
  const Y_C = { x: 1772, y: 1312 }; // у левого угла стола — берёт красную
  const Y_R = { x: 1738, y: 1268 }; // справа от полки — ставит красную
  const yWalks: Walk[] = [
    { from: mApproach.from + sec(0.1), to: mApproach.to - sec(0.1), pts: [Y_BOOK] },
    { from: mCarryG.from, to: mCarryG.to - sec(0.1), pts: [Y_L] },
    { from: mToT.from + sec(0.3), to: mToT.from + sec(3.9), pts: [{ x: 1352, y: 1214 }, SPOT.yusufTalk] },
    { from: L(29).to + sec(0.4), to: mYWalk.to - sec(0.1), pts: [{ x: 1330, y: 1200 }, { x: 1480, y: 1312 }, { x: 1640, y: 1330 }, Y_C] },
    { from: mYCarry.from, to: mYCarry.to - sec(0.1), pts: [Y_R] },
    { from: mReturn.from + sec(0.5), to: mReturn.from + sec(4.2), pts: [{ x: 1600, y: 1310 }, { x: 1420, y: 1290 }, SPOT.yusufHome] },
  ];
  const yusufPos = (t: number) => walkAt(t, Y0, yWalks);
  const yusufPlace = (t: number): Place => {
    const p = yusufPos(t);
    return placeAt(YUSUF.age, p.x, p.y);
  };
  const yusufSit = (t: number) => keys(t, [[mReturn.from + sec(4.2), 0], [mReturn.from + sec(5.6), 1]], easeInOut);
  // присед: у книжки на ковре и у красной книжки на столике
  const gGrip = mPick.from + sec(1.0);
  const gUp = mPick.from + sec(2.1);
  const rGrip = mYTake.from + sec(0.85);
  const rUp = mYTake.to;
  const yCrouch = (t: number) => Math.max(
    keys(t, [[mPick.from, 0], [mPick.from + sec(0.75), 1], [gGrip + sec(0.1), 1], [gUp, 0]], easeInOut),
    keys(t, [[mYTake.from, 0], [mYTake.from + sec(0.6), 1], [rGrip + sec(0.1), 1], [rUp, 0]], easeInOut),
  );

  // =====================================================================
  // Учитель: у доски раскладывает карточки → поворачивается к Юсуфу →
  // два шага и садится на ковёр
  // =====================================================================
  const tWalk = { from: mSitT.from, to: mSitT.from + sec(0.9) };
  const teacherPos = (t: number): Vec => (t <= tWalk.from ? SPOT.teacherBoard : t >= tWalk.to ? SPOT.teacherSit : glide(t, tWalk.from, tWalk.to, [SPOT.teacherBoard, SPOT.teacherSit], (x) => cruise(x, 0.35)));
  const teacherPlace = (t: number): Place => {
    const p = teacherPos(t);
    return teacherPlaceAt(p.x, p.y);
  };
  const teacherSit = (t: number) => keys(t, [[mSitT.from + sec(0.75), 0], [mSitT.to, 1]], easeInOut);
  // карточки задания: две уже стоят, третью ставит в начале, четвёртую —
  // после слов «Спасибо, Амир…»; рисунки — солнце, яблоко, дерево, облако
  const CARD_X = [LEDGE.x0, LEDGE.x0 + LEDGE.dx, LEDGE.x0 + 2 * LEDGE.dx, LEDGE.x0 + 3 * LEDGE.dx];
  // (обе — в планах, где учитель виден: вводный общий план и план у доски)
  const cardPut = [-1, -1, mRoom.from + sec(2.0), L(1).to + sec(0.15)];
  const cardTake = [-1, -1, mRoom.from + sec(0.9), L(1).from + sec(0.7)];
  const teacherAt = (t: number) => teacherPlace(t);
  // точка кисти у полочки доски
  const ledgeHand = (i: number): Vec => ({ x: CARD_X[i] + 4, y: LEDGE.y - 22 });
  const stackHand = (t: number): Vec => {
    const p = teacherAt(t);
    return { x: p.x - 0.07 * p.h, y: p.y - 0.47 * p.h };
  };
  // кисть, ставящая карточку: стопка → полочка → обратно
  const cardHand = (t: number): { at: Vec; card: Vec | null } | null => {
    for (const i of [2, 3]) {
      const a = cardTake[i];
      const b = cardPut[i];
      if (t >= a - sec(0.4) && t <= b + sec(0.7)) {
        const s = stackHand(t);
        const l = ledgeHand(i);
        const up = smoothstep(seg(t, a - sec(0.4), a)); // к стопке
        if (t < a) return { at: mixV({ x: s.x + 30, y: s.y + 40 }, s, up), card: null };
        if (t < b) return { at: mixV(s, l, easeInOut(seg(t, a + sec(0.1), b))), card: mixV(s, l, easeInOut(seg(t, a + sec(0.1), b))) };
        return { at: mixV(l, { x: s.x + 30, y: s.y + 40 }, easeInOut(seg(t, b + sec(0.1), b + sec(0.7)))), card: null };
      }
    }
    return null;
  };
  const cards = (t: number): CardState[] =>
    CARD_X.map((x, i) => {
      const placed = cardPut[i] < 0 || t >= cardPut[i];
      return { x, y: LEDGE.y, placed };
    }).filter((c, i) => c.placed || (cardTake[i] >= 0 && t < cardTake[i]) || false);
  const teacherCard = (t: number): Vec | null => cardHand(t)?.card ?? null;
  const holdsStack = (t: number) => t < mTurnT.from + sec(0.2);

  // =====================================================================
  // Детали: картинка на столе → правая рука Амира → коробка (по одной)
  // =====================================================================
  // порядок: от ближнего к коробке столбца, в каждом — сначала ближняя к Амиру
  const ORDER: readonly PieceId[] = ["r1c2", "r0c2", "r1c1", "r0c1", "r1c0", "r0c0"];
  const TRIP = sec(1.3);
  const trip0 = mPack.from + sec(0.3);
  const tripOf = (i: number) => {
    const s = trip0 + i * TRIP;
    return { reach: s, grip: s + sec(0.42), lift: s + sec(0.55), over: s + sec(0.98), down: s + sec(1.12), free: s + sec(1.18) };
  };
  const boxSlot = (id: PieceId, bu: number, bw: number): P3 => {
    const c = homeCenter(PIECES.find((p) => p.id === id)!);
    return { u: bu - S * (c.x - 150), w: bw + S * (c.y - 100), z: 1.5 };
  };
  const tableSlot = (id: PieceId): P3 => {
    const s = slotOf(PIECES.find((p) => p.id === id)!);
    return { u: s.u, w: s.w, z: 0 };
  };
  const piece = (id: PieceId, t: number): PiecePose & { inBox: boolean } => {
    const i = ORDER.indexOf(id);
    const tr = tripOf(i);
    const from = tableSlot(id);
    const to = boxSlot(id, BOX_T.u, BOX_T.w);
    if (t < tr.grip) return { ...from, theta: 0, placed: true, held: null, inBox: false };
    if (t < tr.free) {
      const k = track3(t, [
        [tr.grip, from],
        [tr.lift, { ...from, z: 8 }],
        [tr.over, { u: to.u, w: to.w, z: 24 }],
        [tr.down, to],
      ]);
      return { ...k, theta: 0, placed: false, held: "right", inBox: false };
    }
    // в коробке: ни на столе, ни отдельно не рисуется после закрытия крышки
    return { ...to, theta: 0, placed: false, held: null, inBox: true };
  };
  const insideAt = (t: number) => ORDER.filter((id, i) => t >= tripOf(i).free).length;

  // ---------- крышка и коробка ----------
  const lid0 = mClose.from + sec(0.35);
  const lidUp = mClose.from + sec(0.7);
  const lidOver = mClose.from + sec(1.1);
  const lidOn = mClose.from + sec(1.4);
  const lidFree = mClose.from + sec(1.55);
  const boxGripT = mStand.from + sec(0.35);
  const boxLiftT = mStand.from + sec(0.6);
  const boxSetT = mSetBox.from + sec(0.9);
  const boxFreeT = mSetBox.from + sec(1.05);
  // коробка в руках Амира — перед ним, на уровне пояса
  const boxHeld = (t: number): Vec => {
    const p = amirPlace(t);
    const sit = amirSit(t);
    const standY = p.y - 0.4 * p.h;
    const sitY = TABLE.top - 0.22 * BOX_T.w - 12;
    const dx = t < mCarryBox.from + sec(0.4) ? -0.12 * p.h : -0.07 * p.h;
    return { x: p.x + dx, y: lerp(standY, sitY, sit) };
  };
  const box = (t: number): BoxState => {
    const inside = insideAt(t);
    const lidLying: P3 = { u: LID_T.u, w: LID_T.w, z: 0 };
    const lidAtBox: P3 = { u: BOX_T.u, w: BOX_T.w, z: BOX.h };
    let lid: BoxState["lid"] = { ...lidLying, on: false, held: false };
    if (t >= lid0 && t < lidOn) {
      const k = track3(t, [
        [lid0, lidLying],
        [lidUp, { ...lidLying, z: 22 }],
        [lidOver, { u: BOX_T.u, w: BOX_T.w, z: BOX.h + 14 }],
        [lidOn, lidAtBox],
      ]);
      lid = { ...k, on: false, held: true };
    } else if (t >= lidOn) lid = { ...lidAtBox, on: true, held: false };
    if (t < boxLiftT) {
      const room = planeToRoom(TABLE.top, BOX_T.u, BOX_T.w);
      return { where: "table", u: BOX_T.u, w: BOX_T.w, z: 0, x: room.x, y: room.y, lid, inside };
    }
    if (t < boxSetT) {
      // от стола к рукам (плавно), затем — в руках; в конце — на верх полки
      const table = planeToRoom(TABLE.top, BOX_T.u, BOX_T.w);
      const held = boxHeld(t);
      const k = smoothstep(seg(t, boxLiftT, boxLiftT + sec(0.9)));
      let pos = mixV(table, held, k);
      if (t >= mSetBox.from) pos = mixV(held, BOX_ON_SHELF, easeInOut(seg(t, mSetBox.from + sec(0.05), boxSetT)));
      return { where: "hands", u: BOX_T.u, w: BOX_T.w, z: 0, x: pos.x, y: pos.y, lid, inside };
    }
    return { where: "shelf", u: BOX_T.u, w: BOX_T.w, z: 0, x: BOX_ON_SHELF.x, y: BOX_ON_SHELF.y, lid, inside };
  };

  // ---------- руки Амира у стола (вид сверху и вид из комнаты) ----------
  const amirX0 = SPOT.amirSit.x;
  const aLapPt = (side: "R" | "L"): P3 => ({ u: amirX0 + (side === "R" ? -40 : 40), w: 300, z: 0 });
  const aRestOnTable = (side: "R" | "L"): P3 => ({ u: amirX0 + (side === "R" ? -54 : 58), w: 168, z: 0 });
  const pieceGrip = (id: PieceId, dw = 9) => (t: number): P3 => {
    const p = piece(id, t);
    return { u: p.u, w: p.w + dw, z: p.z + 2 };
  };
  const lidGrip = (side: 1 | -1) => (t: number): P3 => {
    const l = box(t).lid;
    return { u: l.u + side * (BOX.w / 2 - 6), w: l.w + 10, z: l.z + 3 };
  };
  const boxWall = (side: 1 | -1) => (t: number): P3 => {
    const b = box(t);
    return { u: b.u + side * (BOX.w / 2 + 6), w: b.w + 4, z: BOX.h * 0.55 };
  };
  const A_R_KEYS: HKey[] = [{ t: 0, at: aRestOnTable("R"), pose: "rest" }];
  ORDER.forEach((id, i) => {
    const tr = tripOf(i);
    A_R_KEYS.push(
      { t: tr.reach, at: i === 0 ? aRestOnTable("R") : (tt) => ({ ...boxSlot(ORDER[i - 1], BOX_T.u, BOX_T.w), w: boxSlot(ORDER[i - 1], BOX_T.u, BOX_T.w).w + 14, z: 14 + 0 * tt }), pose: "rest" },
      { t: tr.grip - sec(0.12), at: (tt) => ({ ...pieceGrip(id)(tt), z: 7 }), pose: "open" },
      { t: tr.grip, at: pieceGrip(id), pose: "grip" },
      { t: tr.down, at: pieceGrip(id), pose: "grip" },
      { t: tr.free, at: (tt) => ({ ...pieceGrip(id, 14)(tt), z: 12 }), pose: "rest" },
    );
  });
  A_R_KEYS.push(
    { t: tripOf(5).free + sec(0.3), at: aRestOnTable("R"), pose: "rest" },
    { t: lid0 - sec(0.3), at: (tt) => ({ ...lidGrip(-1)(tt), z: 8 }), pose: "open" },
    { t: lid0, at: lidGrip(-1), pose: "grip" },
    { t: lidOn, at: lidGrip(-1), pose: "grip" },
    { t: lidFree, at: (tt) => ({ ...lidGrip(-1)(tt), w: lidGrip(-1)(tt).w + 16, z: BOX.h + 10 }), pose: "rest" },
    { t: lidFree + sec(0.4), at: aRestOnTable("R"), pose: "rest" },
    { t: boxGripT - sec(0.3), at: (tt) => ({ ...boxWall(-1)(tt), z: BOX.h }), pose: "open" },
    { t: boxGripT, at: boxWall(-1), pose: "open" },
    { t: boxLiftT + sec(0.4), at: boxWall(-1), pose: "open" },
  );
  const A_L_KEYS: HKey[] = [
    { t: 0, at: aRestOnTable("L"), pose: "rest" },
    // левая рука придерживает коробку за дальний от Амира край? — нет:
    // лежит на столе рядом с картинкой, пока правая работает
    { t: lid0 - sec(0.3), at: aRestOnTable("L"), pose: "rest" },
    { t: lid0, at: lidGrip(1), pose: "grip" },
    { t: lidOn, at: lidGrip(1), pose: "grip" },
    { t: lidFree, at: (tt) => ({ ...lidGrip(1)(tt), w: lidGrip(1)(tt).w + 16, z: BOX.h + 10 }), pose: "rest" },
    { t: lidFree + sec(0.4), at: aRestOnTable("L"), pose: "rest" },
    { t: boxGripT - sec(0.3), at: (tt) => ({ ...boxWall(1)(tt), z: BOX.h }), pose: "open" },
    { t: boxGripT, at: boxWall(1), pose: "open" },
    { t: boxLiftT + sec(0.4), at: boxWall(1), pose: "open" },
  ];
  const handAt = (ks: readonly HKey[], t: number, lp: P3): HandState => {
    let i = ks.length - 1;
    for (let k = 0; k < ks.length - 1; k++) {
      if (t < ks[k + 1].t) {
        i = k;
        break;
      }
    }
    const a = ks[i];
    const b = ks[Math.min(ks.length - 1, i + 1)];
    if (a === b || t <= a.t) return { at: resolveAt(a.at, t, lp), lap: a.at === "lap" ? 1 : 0, pose: a.pose, blend: undefined, twist: a.twist ?? 0 };
    const u = easeInOut(seg(t, a.t, b.t));
    const pa = resolveAt(a.at, t, lp);
    const pb = resolveAt(b.at, t, lp);
    const pt = mix3(pa, pb, u);
    const lapK = lerp(a.at === "lap" ? 1 : 0, b.at === "lap" ? 1 : 0, u);
    return { at: pt, lap: lapK, pose: a.pose, blend: a.pose !== b.pose ? { to: b.pose, t: u } : undefined, twist: lerp(a.twist ?? 0, b.twist ?? 0, u) };
  };
  const aHand = (side: "R" | "L", t: number) => handAt(side === "R" ? A_R_KEYS : A_L_KEYS, t, aLapPt(side));
  const roomHand = (h: HandState, lift = 11): Vec => {
    const p = planeToRoom(TABLE.top, h.at.u, Math.min(h.at.w, h.pose === "rest" ? 170 : 210), h.at.z);
    return { x: p.x, y: p.y - lift };
  };
  const roomShape = (h: HandState): HandShape => ROOM_SHAPE[h.blend && h.blend.t > 0.5 ? h.blend.to : h.pose];

  // =====================================================================
  // Книжки
  // =====================================================================
  const STACK_T: Readonly<Record<"blue" | "orange" | "red", number>> = { red: 0, orange: 1, blue: 2 };
  const onTable = (id: "blue" | "orange" | "red", off = 0): Vec => planeToRoom(TABLE.top, TABLE_STACK.u + off, TABLE_STACK.w, STACK_T[id] * BOOK.t);
  // книжка в двух руках перед грудью (обложкой к ребёнку); dir — куда повернут
  const chest = (p: Place, dir: number, k = 0.4): Vec => ({ x: p.x + dir * 0.05 * p.h, y: p.y - k * p.h + BOOK.h / 2 });
  // зелёная
  const gPlace0 = mPlaceG.from + sec(0.1);
  const gSet = mPlaceG.from + sec(0.95);
  const gFree = mPlaceG.from + sec(1.15);
  // синяя и оранжевая (вместе), красная
  const aGrip = mAmirTake.from + sec(0.9);
  const aUp = mAmirTake.to - sec(0.1);
  const aSet = mAmirPlace.from + sec(0.85);
  const aFree = mAmirPlace.from + sec(1.05);
  // Амир сдвигает свои книжки влево (во время реплики 30)
  const slide0 = L(30).from - sec(0.6);
  const slide1 = L(30).from + sec(0.3);
  const rSet = mYPlace.from + sec(0.95);
  const rFree = mYPlace.from + sec(1.15);
  const yChest = (t: number) => chest(yusufPlace(t), yFaceRaw(t) >= 0 ? 1 : -1, 0.5);
  const aChest = (t: number) => chest(amirPlace(t), -1, 0.44);
  const book = (id: BookId, t: number): BookState => {
    if (id === "green") {
      if (t < gGrip) return { id, x: GREEN_FLOOR.x, y: GREEN_FLOOR.y, up: 0, where: "floor", holder: null, tilt: -8 };
      if (t < gSet) {
        const lift = easeInOut(seg(t, gGrip, gUp));
        const ch = yChest(t);
        let pos = mixV(GREEN_FLOOR, ch, lift);
        let up = lift;
        if (t >= gPlace0) {
          const k = easeInOut(seg(t, gPlace0, gSet));
          pos = mixV(ch, SHELF_SPOT.green, k);
          up = 1;
        }
        return { id, x: pos.x, y: pos.y, up, where: "hands", holder: "yusuf", tilt: lerp(-8, 0, lift) };
      }
      return { id, ...SHELF_SPOT.green, up: 1, where: "shelf", holder: null, tilt: 0 };
    }
    if (id === "blue" || id === "orange") {
      const off = id === "blue" ? -15 : 15; // в руках — рядом, чуть внахлёст (видны обе)
      if (t < aGrip) {
        const p = onTable(id);
        return { id, x: p.x, y: p.y, up: 0, where: "table", holder: null, tilt: id === "blue" ? 3 : -2 };
      }
      if (t < aSet) {
        const lift = easeInOut(seg(t, aGrip, aUp));
        const ch = aChest(t);
        let pos = mixV(onTable(id), { x: ch.x + off, y: ch.y }, lift);
        if (t >= mAmirPlace.from) pos = mixV({ x: ch.x + off, y: ch.y }, SHELF_SPOT_AMIR0[id], easeInOut(seg(t, mAmirPlace.from + sec(0.1), aSet)));
        return { id, x: pos.x, y: pos.y, up: lift, where: "hands", holder: "amir", tilt: 0 };
      }
      const pos = mixV(SHELF_SPOT_AMIR0[id], SHELF_SPOT[id], easeInOut(seg(t, slide0, slide1)));
      return { id, x: pos.x, y: pos.y, up: 1, where: "shelf", holder: null, tilt: 0 };
    }
    // красная: столик → после паузы руки Юсуфа → полка
    if (t < rGrip) {
      const p = onTable("red");
      return { id, x: p.x, y: p.y, up: 0, where: "table", holder: null, tilt: 0 };
    }
    if (t < rSet) {
      const lift = easeInOut(seg(t, rGrip, rUp));
      const ch = yChest(t);
      let pos = mixV(onTable("red"), ch, lift);
      if (t >= mYPlace.from + sec(0.1)) pos = mixV(ch, SHELF_SPOT.red, easeInOut(seg(t, mYPlace.from + sec(0.1), rSet)));
      return { id, x: pos.x, y: pos.y, up: t >= mYPlace.from ? 1 : lift, where: "hands", holder: "yusuf", tilt: 0 };
    }
    return { id, ...SHELF_SPOT.red, up: 1, where: "shelf", holder: null, tilt: 0 };
  };
  // кисти на боковых краях книжки (на середине высоты стоящей книжки)
  const bookEdges = (b: BookState, spread = 0): { l: Vec; r: Vec } => {
    const hh = lerp(BOOK.h * 0.22, BOOK.h, b.up);
    const y = b.y - hh * 0.5;
    return { l: { x: b.x - BOOK.w / 2 - 3 - spread, y }, r: { x: b.x + BOOK.w / 2 + 3 + spread, y } };
  };

  // ---------- события звука ----------
  const events: Events = {
    pieceIn: ORDER.map((_, i) => tripOf(i).down - 1),
    boxClose: lidOn - 2,
    boxLift: boxLiftT,
    boxSet: boxSetT - 1,
    bookLift: [gGrip + 2, aGrip + 2, rGrip + 2],
    bookSet: [gSet - 1, aSet - 1, rSet - 1],
    bookSlide: [slide0 + 4],
    cardSet: [cardPut[2] - 1, cardPut[3] - 1],
    cloth: [mStand.from + sec(0.4), mPick.from + sec(0.3), mSitT.from + sec(0.9), mAmirTake.from + sec(0.3), mYTake.from + sec(0.2), mReturn.from + sec(4.1), mReturn.from + sec(4.4)],
  };

  // =====================================================================
  // Учитель: взгляд и поза
  // =====================================================================
  const glance = { from: mClose.from - sec(0.2), to: L(1).from + sec(0.5) };
  const tFace = (t: number) => {
    const p = teacherPos(t);
    const toY = faceTo(yusufPos(t).x, p.x, 3);
    const toB = faceTo(SPOT.bilal.x, p.x, 3);
    const toA = faceTo(amirPos(t).x, p.x, 2.6);
    // у доски: повернут к ней (влево); полка и Юсуф у него за спиной
    if (t < mTurnT.from) {
      // короткий взгляд через плечо на Амира, закрывающего коробку (сбоку)
      const g = win(t, glance.from, glance.to, 12);
      return lerp(-0.8, 0.28, g);
    }
    if (t < mTurnT.to) return lerp(-0.8, toY, easeInOut(seg(t, mTurnT.from + sec(0.1), mTurnT.to)));
    if (inPause(t)) return t >= p3.from ? 0.55 : 0.25; // ждёт ответа: на детей
    if (speaking(6, t) || speaking(18, t) || speaking(28, t)) return speaking(28, t) ? 0.5 : 0.25; // вопрос всему классу
    const sp = speakerOf(t);
    if (sp === "yusuf") return toY;
    if (sp === "amir") return toA;
    if (sp === "bilal") return toB;
    if (sp === "muhammad") return speaking(17, t) ? toB : toY;
    if (t >= mAmirGo.from && t < mEach.to) return 0.6; // смотрит, как мальчики переносят книжки
    if (scene(t) === "s8") return t >= mReturn.from ? 0.35 : 0.55;
    return toY * 0.85;
  };
  const tPoseEx = (t: number): PoseIn => {
    const p = teacherPlace(t);
    const sit = teacherSit(t);
    const rest0 = restArms(p, sit);
    const base: PoseIn = { floorSit: sit, sitMorph: true, expr: "calm", ...rest0, lookY: 0.12, lean: 8 * Math.sin(Math.PI * clamp(sit)) * (sit > 0.02 && sit < 0.98 ? 1 : 0), turnBody: t < mTurnT.from ? 0.85 : lerp(0.8, 0.5, sit) };
    if (t < mTurnT.from + sec(0.3)) {
      // у доски: стопка карточек в одной руке, другая ставит карточку
      const stack = holdsStack(t) ? arm(stackHand(t), "pinch", "in") : rest0.armR;
      const ch = cardHand(t);
      const g = win(t, glance.from, glance.to, 12);
      const working = ch ? arm(ch.at, ch.card ? "pinch" : "open", "out") : arm({ x: stackHand(t).x + 18, y: stackHand(t).y + 34 }, "relax", "in");
      return { ...base, armL: working, armR: stack, expr: g > 0.5 ? "softSmile" : "focused", lookY: g > 0.5 ? 0.15 : 0.32, nod: 3 * (1 - g) };
    }
    if (sit < 0.02) {
      // повернулся к подошедшему Юсуфу: слегка опускает голову к нему
      return { ...base, expr: "softSmile", lookY: 0.42, nod: 6, headTilt: 2 };
    }
    if (sit < 0.98) return base;
    const lap0 = lapOf(p);
    const lapR = { x: lap0.R.x, y: lap0.R.y + 16 };
    const lean = speakerOf(t) === "yusuf" || [8, 10, 12, 14, 16, 24].some((id) => speaking(id, t, 10)) ? 8 : 3;
    if (inPause(t)) return { ...base, expr: "listening", lean: 0, lookY: 0.05, headTilt: 2 };
    // объясняющий жест — открытая ладонь (одна на смысловую фразу)
    for (const id of [8, 10, 14, 24] as const) {
      const l = L(id);
      if (t >= l.from - 4 && t <= l.to + 10) {
        const k = win(t, l.from + sec(0.3), l.to - sec(0.2), 16) * 0.85;
        const open: Vec = { x: p.x + 0.14 * p.h, y: p.y - 0.31 * p.h };
        return { ...base, expr: id === 24 ? "softSmile" : "calm", lean, lookY: 0.18, armR: arm(mixV(lapR, open, k), k > 0.25 ? "open" : "relax", k > 0.05 ? "hang" : "in") };
      }
    }
    // широкий спокойный жест: «в нашей комнате» — ладонь в сторону комнаты
    if (t >= mShow.from - 4 && t <= L(18).to + 10) {
      const k = win(t, mShow.from + sec(0.2), L(18).to - sec(0.1), 16);
      // ладонь — в сторону комнаты и класса (влево), не к мальчикам рядом
      const lapL = { x: lap0.L.x, y: lap0.L.y + 16 };
      const open: Vec = { x: p.x - 0.28 * p.h, y: p.y - 0.4 * p.h };
      return { ...base, expr: "curious", lookY: 0.05, armL: arm(mixV(lapL, open, k), k > 0.25 ? "open" : "relax", k > 0.05 ? "hang" : "in") };
    }
    if (speaking(6, t) || speaking(28, t)) return { ...base, expr: "curious", lookY: 0.05, lean: 0 };
    if (speaking(12, t, 8) || speaking(22, t, 8) || speaking(26, t, 6)) return { ...base, expr: "smile", lean, lookY: 0.18, nod: speaking(26, t) ? 4 * Math.sin(Math.PI * seg(t, L(26).from, L(26).from + sec(0.6))) : 0 };
    if (speaking(33, t, 8)) return { ...base, expr: "softSmile", lookY: 0.12, armR: arm(mixV(lapR, { x: p.x + 0.18 * p.h, y: p.y - 0.32 * p.h }, win(t, L(33).from, L(33).to, 10) * 0.6), "open", "hang") };
    const sp = speakerOf(t);
    if (sp && sp !== "muhammad") return { ...base, expr: "listening", lean: sp === "yusuf" ? 6 : 2, lookY: 0.15 };
    if (t >= mAmirGo.from && t < mEach.to) return { ...base, expr: "softSmile", lookY: 0.2 };
    return { ...base, lean, lookY: 0.16, expr: scene(t) === "s8" ? "softSmile" : "calm" };
  };

  // =====================================================================
  // Юсуф
  // =====================================================================
  const toTeacher = (t: number, x: number, gain = 2.6) => faceTo(teacherPos(t).x, x, gain);
  function yFaceRaw(t: number): number {
    const x = yusufPos(t).x;
    const toT = toTeacher(t, x);
    const toA = faceTo(amirPos(t).x, x, 3.6);
    const toB = faceTo(SPOT.bilal.x, x, 2.4);
    const toShelf = faceTo(1520, x, 3);
    const sp = speakerOf(t);
    if (t < mNotice.from) return lerp(0.55, toA, 0.6); // смотрит, как Амир убирает детали
    if (t < mApproach.from) return lerp(0.5, -0.45, smoothstep(seg(t, mNotice.from + sec(0.3), mNotice.from + sec(0.9))));
    if (t < mPick.to) return -0.25; // к книжке (впереди, чуть левее)
    if (t < mPlaceG.to) return 0.6; // к левому отделению полки (справа)
    if (t < mToT.to) return toT;
    if (t >= mLookShelf.from && t < L(9).from) return toShelf; // смотрит на свою книжку
    if (t >= mCompare.from && t < L(13).from) return toShelf;
    if (speaking(21, t)) return toA; // «Улыбнуться другу!» — к Амиру
    if (speaking(27, t)) return t < L(27).from + (L(27).to - L(27).from) * 0.5 ? toT : toA;
    if (inPause(t) && t >= p3.from) {
      // смотрит на друга, затем на столик (не наклоняется к книжке)
      return t < p3.from + sec(2.2) ? toA : faceTo(1800, x, 3);
    }
    if (inPause(t)) return toT * 0.8;
    if (t >= mAmirGo.from && t < L(28).from) return toA;
    if (t >= L(29).to && t < mYPlace.to) return t < mYTake.from ? 0.6 : t < mYCarry.from ? 0.5 : -0.6;
    if (t >= mEach.from && t < mEach.to) return toA;
    if (speaking(31, t) || speaking(32, t)) return toA;
    if (speaking(35, t, 10)) return t < L(35).to ? -0.5 : toA;
    if (t >= mReturn.from) return t < mReturn.from + sec(4.4) ? -0.2 : 0.25;
    if (sp === "muhammad") return toT;
    if (sp === "amir") return toA;
    if (sp === "bilal") return toB;
    return toT * 0.9;
  }
  const yPoseEx = (t: number): PoseIn => {
    const p = yusufPlace(t);
    const sit = yusufSit(t);
    const crouch = yCrouch(t);
    const rest = restArms(p, sit);
    const base: PoseIn = { floorSit: sit, sitMorph: true, crouch, expr: "listening", ...rest, lookY: -0.18, turnBody: 0.6 };
    // руки на книжке (зелёная или красная, пока в руках или касание у опоры)
    const holding = (id: BookId, reachFrom: number, grip: number, set: number, free: number): PoseIn | null => {
      if (t < reachFrom || t > free + sec(0.55)) return null;
      const b = book(id, Math.min(Math.max(t, grip), set));
      const e = bookEdges(b);
      if (t < grip) {
        // руки опускаются к краям книжки
        const k = easeInOut(seg(t, reachFrom, grip));
        const s = hangOf(p, crouch);
        return { armL: arm(mixV(s.L, e.l, k), k > 0.3 ? "open" : "relax", "hang"), armR: arm(mixV(s.R, e.r, k), k > 0.3 ? "open" : "relax", "hang") };
      }
      if (t <= free) return { armL: arm(e.l, "pinch"), armR: arm(e.r, "pinch") };
      // отпустил: кисти отходят от книжки и опускаются
      const k = easeInOut(seg(t, free, free + sec(0.55)));
      const s = hangOf(p, crouch);
      return { armL: arm(mixV({ x: e.l.x - 6, y: e.l.y }, s.L, k), k < 0.7 ? "open" : "relax", "hang"), armR: arm(mixV({ x: e.r.x + 6, y: e.r.y }, s.R, k), k < 0.7 ? "open" : "relax", "hang") };
    };
    const hold = holding("green", mPick.from + sec(0.55), gGrip, gSet, gFree) ?? holding("red", mYTake.from + sec(0.35), rGrip, rSet, rFree);
    const withHands = (x: PoseIn): PoseIn => (hold ? { ...x, ...hold } : x);
    // сцена 1
    if (t < mNotice.from) return withHands({ ...base, expr: "curious", lookY: 0.32 });
    if (t < mApproach.from) return withHands({ ...base, expr: EX(3, 3, 0.08, 0.15), lookY: lerp(0.3, 0.6, seg(t, mNotice.from + sec(0.3), mNotice.from + sec(0.9))) });
    if (t < mPick.to) return withHands({ ...base, expr: "focused", lookY: 0.62, lean: 26 * crouch + 3, nod: 10 + 8 * crouch });
    if (t < mPlaceG.from + sec(1.6)) return withHands({ ...base, expr: "focused", lookY: 0.35, lean: 4 });
    if (t < mPlaceG.to) return withHands({ ...base, expr: EX(2, 2, 0.1, 0.35), lookY: 0.3 }); // проверяет, что книжка стоит
    // сцена 2
    if (t < mTurnT.to) return { ...base, expr: "curious", lookY: -0.25 };
    if (speaking(3, t)) return { ...base, expr: EX(4, 3, 0.04, 0.35), lookY: -0.35, headTilt: -2 };
    if (speaking(5, t)) return { ...base, expr: "curious", lookY: -0.28, headTilt: -4 };
    if (inPause(t) && t < p1.to) return { ...base, expr: EX(3, 3, 0.08, 0.15), lookY: -0.2 };
    if (speaking(7, t) || speaking(8, t)) return { ...base, expr: EX(3, 2.5, 0.06, 0.2), lookY: -0.18, headTilt: 2 };
    // сцена 3
    if (t >= mLookShelf.from && t < L(9).from) return { ...base, expr: "thinking", lookY: 0.1 };
    if (speaking(9, t)) return { ...base, expr: "curious", lookY: -0.25 };
    if (speaking(12, t, 6) || (t >= mSmile.from && t < mSmile.to)) return { ...base, expr: "softSmile", lookY: -0.2 }; // спокойная небольшая улыбка
    // сцена 4
    if (t >= mCompare.from && t < L(13).from) return { ...base, expr: "thinking", lookY: t < mCompare.from + sec(1.2) ? 0.15 : -0.1 };
    if (speaking(13, t)) return { ...base, expr: EX(2.2, 2.4, 0.1, 0.16), lookY: -0.2 }; // задумчиво, без хмурых бровей
    if (speaking(14, t)) return { ...base, expr: "listening", lookY: -0.22 };
    if (speaking(15, t)) return { ...base, expr: EX(5, 4.5, 0.04, 0.2), lookY: -0.24 };
    if (speaking(16, t, 8)) return { ...base, expr: "softSmile", lookY: -0.2 };
    // сцена 5
    if (inPause(t) && t >= p2.from && t < p2.to) {
      const u = (t - p2.from) / (p2.to - p2.from);
      return { ...base, expr: "thinking", lookY: u < 0.5 ? 0.1 : -0.15, lookX: u < 0.5 ? -0.25 : 0.1 };
    }
    if (speaking(21, t)) return { ...base, expr: EX(4, 4, 0.04, 0.85), lookY: -0.05 }; // естественная улыбка другу
    if (speaking(22, t, 10) || (t >= mAmirSmile.from && t < mAmirSmile.to)) return { ...base, expr: "smile", lookY: -0.1 };
    // сцена 6
    if (speaking(23, t)) return { ...base, expr: EX(4, 3.5, 0.05, 0.18), lookY: -0.28, headTilt: -3 };
    if (speaking(24, t)) return { ...base, expr: t > L(24).from + (L(24).to - L(24).from) * 0.3 ? "softSmile" : "listening", lookY: -0.24 };
    if (speaking(27, t)) return { ...base, expr: EX(3, 2.5, 0.1, 0.35), lookY: -0.12 };
    // сцена 7
    if (inPause(t) && t >= p3.from) return { ...base, expr: "thinking", lookY: t < p3.from + sec(2.2) ? -0.05 : 0.2 };
    if (speaking(29, t)) return { ...base, expr: EX(3, 3, 0.06, 0.4), lookY: 0.05 };
    if (t >= mYTake.from && t < mYPlace.to) return withHands({ ...base, expr: "focused", lookY: t < mYCarry.from ? 0.6 : 0.32, lean: 26 * crouch + 3, nod: 10 + 8 * crouch });
    if (t >= mYPlace.to && t < mEach.to) return withHands({ ...base, expr: "smile", lookY: -0.05 });
    // сцена 8
    if (speaking(32, t)) return { ...base, expr: EX(2.5, 2.5, 0.08, 0.5), lookY: -0.05 };
    if (speaking(35, t, 10)) return { ...base, expr: EX(4, 4, 0.04, 0.8), lookY: 0.05 };
    if (t >= mReturn.from) return { ...base, expr: "smile", lookY: 0.05 };
    if (scene(t) === "s8") return { ...base, expr: "softSmile", lookY: -0.05 };
    if (speakerOf(t) === "muhammad") return { ...base, expr: "listening", lookY: -0.25 };
    return withHands({ ...base, lookY: -0.18 });
  };

  // =====================================================================
  // Амир
  // =====================================================================
  const aFace = (t: number) => {
    const x = amirPos(t).x;
    const toY = faceTo(yusufPos(t).x, x, 2.8);
    const toT = faceTo(teacherPos(t).x, x, 2.4);
    const toB = faceTo(SPOT.bilal.x, x, 2.2);
    const sp = speakerOf(t);
    if (t < mStand.to) return speaking(1, t, 8) ? -0.35 : 0.02; // за работой; на «спасибо» — к доске
    if (t < mSetBox.to) return -0.5; // к полке
    if (speaking(2, t)) return toT;
    if (t >= mAmirLook.from && t < L(11).to) return faceTo(1520, x, 3); // смотрит на полку
    if (speaking(19, t)) return toT;
    if (t >= mAmirSmile.from && t < mAmirSmile.to) return toY;
    if (speaking(21, t, 8)) return toY;
    if (t >= mAmirGo.from && t < mAmirPlace.to) return t < mAmirTake.to ? 0.4 : -0.5;
    if (inPause(t) && t >= p3.from) return toY;
    if (speaking(30, t)) return toY;
    if (t >= L(30).to && t < mEach.to) return toY;
    if (speaking(31, t) || speaking(32, t)) return toY;
    if (t >= mReturn.from) return t < mReturn.from + sec(4.0) ? -0.2 : 0.2;
    if (sp === "muhammad") return toT;
    if (sp === "yusuf") return toY;
    if (sp === "bilal") return toB;
    if (inPause(t)) return toT;
    return toT * 0.8;
  };
  const aPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const p = amirPlace(t);
    const sit = amirSit(t);
    const lap = lapOf(p);
    const rest = restArms(p, sit);
    const crouch = keys(t, [[mAmirTake.from, 0], [mAmirTake.from + sec(0.65), 1], [aGrip + sec(0.1), 1], [aUp, 0]], easeInOut);
    // доброжелательно слушает: внутренние края бровей чуть приподняты (не «скептический» изгиб)
    const base: PoseIn = { floorSit: sit, sitMorph: true, crouch, expr: EX(2.2, 1.6, 0.06, 0.28), ...rest, lookY: -0.06, turnBody: 0.55 };
    // ---------- у стола (сидя): руки по точкам касания ----------
    if (t < boxLiftT + sec(0.4)) {
      const hR = aHand("R", t); // правая рука — слева в кадре (armL)
      const hL = aHand("L", t);
      const armOf = (h: HandState, lapW: Vec): WorldArm => (h.lap > 0.98 ? { target: lapW, shape: "relax", elbow: "in", behind: true } : arm(roomHand(h, h.pose === "open" && t >= boxGripT - sec(0.3) ? 0 : 11), roomShape(h), "auto"));
      const look = t < mClose.to ? 0.7 : speaking(1, t, 8) ? 0.1 : 0.55;
      return { pose: { ...base, floorSit: sit, armL: armOf(hR, lap.L), armR: armOf(hL, lap.R), expr: speaking(1, t, 8) ? "softSmile" : "focused", lookY: look, lean: sit > 0.5 ? 7 : 3, nod: t < mClose.to ? 10 : 0 }, front: true };
    }
    // ---------- коробка в руках ----------
    if (t < boxFreeT + sec(0.5)) {
      const b = box(Math.min(t, boxSetT));
      const hw = BOX.w / 2 + 5;
      const y = b.y - BOX.h * 0.6;
      if (t <= boxFreeT) return { pose: { ...base, armL: arm({ x: b.x - hw, y }, "open", "out"), armR: arm({ x: b.x + hw, y }, "open", "out"), expr: "calm", lookY: 0.22 }, front: true };
      const k = easeInOut(seg(t, boxFreeT, boxFreeT + sec(0.5)));
      const s = hangOf(p);
      return { pose: { ...base, armL: arm(mixV({ x: b.x - hw - 6, y }, s.L, k), "open"), armR: arm(mixV({ x: b.x + hw + 6, y }, s.R, k), "open"), expr: "softSmile", lookY: 0.2 }, front: true };
    }
    // ---------- синяя и оранжевая в руках ----------
    if (t >= mAmirTake.from + sec(0.35) && t <= aFree + sec(0.55)) {
      const bb = book("blue", Math.min(Math.max(t, aGrip), aSet));
      const bo = book("orange", Math.min(Math.max(t, aGrip), aSet));
      const el = bookEdges(bb).l;
      const er = bookEdges(bo).r;
      const s = hangOf(p, crouch);
      let armL: WorldArm;
      let armR: WorldArm;
      if (t < aGrip) {
        const k = easeInOut(seg(t, mAmirTake.from + sec(0.35), aGrip));
        armL = arm(mixV(s.L, el, k), k > 0.3 ? "open" : "relax", "hang");
        armR = arm(mixV(s.R, er, k), k > 0.3 ? "open" : "relax", "hang");
      } else if (t <= aFree) {
        armL = arm(el, "pinch");
        armR = arm(er, "pinch");
      } else {
        const k = easeInOut(seg(t, aFree, aFree + sec(0.55)));
        armL = arm(mixV(el, s.L, k), k < 0.7 ? "open" : "relax", "hang");
        armR = arm(mixV(er, s.R, k), k < 0.7 ? "open" : "relax", "hang");
      }
      return { pose: { ...base, armL, armR, expr: "focused", lookY: t < mAmirCarry.from ? 0.6 : 0.3, lean: 18 * crouch + 2, nod: 6 + 8 * crouch }, front: true };
    }
    // ---------- сдвигает свои книжки, освобождая место ----------
    if (t >= slide0 - sec(0.5) && t <= slide1 + sec(0.5)) {
      const b = book("orange", Math.min(Math.max(t, slide0), slide1));
      const e = bookEdges(b);
      const s = hangOf(p);
      const k = t < slide0 ? easeInOut(seg(t, slide0 - sec(0.5), slide0)) : t > slide1 ? 1 - easeInOut(seg(t, slide1, slide1 + sec(0.5))) : 1;
      return { pose: { ...base, armR: arm(mixV(s.R, e.r, k), "open"), expr: "softSmile", lookY: 0.25 }, front: true };
    }
    const pose = ((): PoseIn => {
      if (speaking(2, t)) return { ...base, expr: EX(2, 2, 0.1, 0.35), lookY: -0.05 };
      if (t >= mAmirLook.from && t < L(11).to) return { ...base, expr: "softSmile", lookY: 0.1 };
      if (speaking(19, t)) return { ...base, expr: EX(2, 2, 0.1, 0.3), lookY: -0.05 };
      if ((t >= L(21).to && t < mAmirSmile.to + sec(0.4)) || speaking(22, t, 6)) return { ...base, expr: "smile", lookY: -0.05 }; // ответная улыбка
      if (speaking(30, t)) return { ...base, expr: "smile", lookY: 0 };
      if (t > L(30).to && t < mEach.from) return { ...base, expr: "softSmile", lookY: 0.15 }; // смотрит, как Юсуф несёт книжку
      if (speaking(31, t)) return { ...base, expr: EX(2, 2.5, 0.08, 0.6), lookY: 0 };
      if (t >= mEach.from && t < mEach.to) return { ...base, expr: "smile", lookY: 0 };
      if (t >= mReturn.from) return { ...base, expr: "smile", lookY: 0.05 };
      if (inPause(t) && t >= p3.from) return { ...base, expr: "listening", lookY: -0.02 };
      if (speakerOf(t)) return base;
      return base;
    })();
    return { pose, front: true };
  };

  // =====================================================================
  // Билал
  // =====================================================================
  const bFace = (t: number) => {
    const x = SPOT.bilal.x;
    const toT = faceTo(teacherPos(t).x, x, 2.4);
    const toY = faceTo(yusufPos(t).x, x, 2.2);
    const toA = faceTo(amirPos(t).x, x, 2.0);
    const sp = speakerOf(t);
    if (t < mToT.from) return lerp(0.05, 0.4, win(t, mPick.from, mPlaceG.to, 20)); // читает; иногда поднимает голову
    if (t < bkDown + sec(0.6)) return 0.3; // кладёт книгу справа от себя
    if (speaking(17, t)) return t < L(17).from + (L(17).to - L(17).from) * 0.5 ? toT : -0.45; // вывод — слегка к группе
    if (speaking(20, t)) return -0.4; // спокойно смотрит на товарища рядом
    if (speaking(25, t)) return toT;
    if (speaking(34, t)) return toA * 0.7;
    if (sp === "muhammad") return toT;
    if (sp === "yusuf") return toY;
    if (sp === "amir") return toA;
    if (inPause(t)) return toT;
    if (t >= mAmirGo.from && t < mEach.to) return toA;
    return toT * 0.9;
  };
  // Билал в начале читает книгу (держит на коленях); на подходе Юсуфа
  // закрывает её и кладёт на ковёр слева.
  const bkClose = mToT.from + sec(1.4);
  const bkDown = mToT.from + sec(2.2);
  const bilalBookPos = (t: number): { pos: Vec; open: number; floor: boolean } => {
    const held = { x: bilalP.x + 0.01 * bilalP.h, y: bilalP.y - 0.13 * bilalP.h };
    const down = { x: bilalP.x + 0.24 * bilalP.h, y: bilalP.y + 8 };
    if (t < bkClose) return { pos: held, open: 1, floor: false };
    if (t < bkDown) {
      const u = easeInOut(seg(t, bkClose + sec(0.3), bkDown));
      return { pos: { x: lerp(held.x, down.x, u), y: lerp(held.y, down.y, u) - 18 * Math.sin(Math.PI * u) }, open: 1 - easeInOut(seg(t, bkClose, bkClose + sec(0.3))), floor: false };
    }
    return { pos: down, open: 0, floor: true };
  };
  const bPoseEx = (t: number): PoseIn => {
    const p = bilalP;
    const lap = lapOf(p);
    const base: PoseIn = { floorSit: 1, expr: "listening", armL: { target: lap.L, shape: "relax", elbow: "in" }, armR: { target: lap.R, shape: "relax", elbow: "in" }, lookY: -0.08, turnBody: 0.45 };
    const b = bilalBookPos(t);
    if (!b.floor) {
      const w = 29 * (0.5 + 0.5 * b.open) + 3;
      const reading = t < bkClose;
      return { ...base, expr: reading ? "focused" : "calm", armL: arm({ x: b.pos.x - w, y: b.pos.y + 6 }, "pinch"), armR: arm({ x: b.pos.x + w, y: b.pos.y + 6 }, "pinch"), lookY: reading ? (win(t, mPick.from, mPlaceG.to, 20) > 0.5 ? 0.0 : 0.5) : 0.3 };
    }
    if (t < bkDown + sec(0.5)) {
      const u = easeInOut(seg(t, bkDown - sec(0.1), bkDown + sec(0.5)));
      return { ...base, armR: arm(mixV({ x: b.pos.x - 8, y: b.pos.y - 4 }, lap.R, u), "open", "out"), lookY: 0.1 };
    }
    if (speaking(7, t)) return { ...base, expr: EX(1, 2, 0.12, 0.25), lookY: -0.05 };
    if (speaking(17, t)) return { ...base, expr: "thinking", lookY: -0.05, lean: 3 };
    if (speaking(20, t)) return { ...base, expr: "softSmile", lookY: 0.0 };
    if (speaking(25, t)) return { ...base, expr: "curious", lookY: -0.08, lean: 3 };
    if (speaking(34, t)) return { ...base, expr: "softSmile", lookY: -0.02 };
    if (inPause(t)) return { ...base, expr: "thinking", lookY: -0.04 };
    if (t >= mReturn.from) return { ...base, expr: "softSmile", lookY: 0.05 };
    return base;
  };

  // =====================================================================
  // фон класса
  // =====================================================================
  const bgItem = (p: CastPupil, t: number): BgItem => {
    const plan = p.plan!;
    const pl = bgPlace(p);
    const seed = p.seed;
    if (plan.activity === "read") {
      const period = 300 + Math.floor(hash01(seed) * 240);
      const off = Math.floor(hash01(seed + 1) * period);
      const local = (t + off) % period;
      const flip = local < 18 ? Math.sin((local / 18) * Math.PI) : 0;
      return { kind: "book", pos: { x: pl.x + 0.01 * pl.h, y: pl.y - 0.13 * pl.h }, w: 0.18 * pl.h, color: plan.item, flip, pencil: null, card: 0 };
    }
    if (plan.activity === "draw" || plan.activity === "write") {
      const pos = { x: pl.x + 0.02 * pl.h, y: pl.y + 0.035 * pl.h };
      const period = 150 + Math.floor(hash01(seed + 2) * 90);
      const local = (t + Math.floor(hash01(seed + 3) * period)) % period;
      const drawing = local < period * 0.7;
      const amp = plan.activity === "write" ? 0.05 : 0.035;
      const px = pos.x - 0.06 * pl.h + (drawing ? (local / (period * 0.7)) * 0.12 * pl.h : 0.06 * pl.h);
      const py = pos.y - 0.008 * pl.h + (drawing ? Math.sin(local * (plan.activity === "write" ? 0.9 : 0.35)) * amp * pl.h * 0.25 : 0);
      return { kind: "notebook", pos, w: 0.2 * pl.h, color: plan.item, flip: 0, pencil: { x: px, y: py }, card: 0 };
    }
    if (plan.activity === "cards") {
      const period = 240 + Math.floor(hash01(seed + 4) * 120);
      const card = Math.floor((t + Math.floor(hash01(seed + 5) * period)) / period) % 3;
      return { kind: "cards", pos: { x: pl.x - 0.03 * pl.h, y: pl.y - 0.2 * pl.h }, w: 0.09 * pl.h, color: plan.item, flip: 0, pencil: null, card };
    }
    return { kind: "none", pos: { x: pl.x, y: pl.y }, w: 0, color: plan.item, flip: 0, pencil: null, card: 0 };
  };
  // куда смотрит класс, когда поднимает голову: на говорящего / на разговор
  const talkX = (t: number) => {
    const sp = speakerOf(t);
    if (sp === "muhammad") return teacherPos(t).x;
    if (sp === "yusuf") return yusufPos(t).x;
    if (sp === "amir") return amirPos(t).x;
    if (sp === "bilal") return SPOT.bilal.x;
    return t < mToT.from ? 1500 : 1200;
  };
  const bg = (p: CastPupil): Ctl => {
    const base = bgPlace(p);
    const plan = p.plan!;
    const seed = p.seed;
    const period = 260 + Math.floor(hash01(seed + 6) * 260);
    const off = Math.floor(hash01(seed + 7) * period);
    const glanceLen = 50 + Math.floor(hash01(seed + 8) * 50);
    // в разговоре (сцены 2–8) часть класса слушает внимательнее — каждый со своей задержкой
    const curious = hash01(seed + 9) > 0.4;
    const lag = Math.floor(hash01(seed + 10) * 24);
    const listenWin = (t: number) => (curious ? win(t, L(3).from + lag, L(8).to + lag, 14) + win(t, L(18).from + lag, L(22).to + lag, 14) * 0.9 + win(t, L(31).from + lag, mPull.to, 14) : 0);
    // в паузах никто не кивает и не «отвечает» заранее: только спокойный взгляд
    const glance = (t: number) => {
      const local = (t + off) % period;
      const g = plan.activity === "listen" ? 1 : local < glanceLen ? smoothstep(local / 10) * smoothstep((glanceLen - local) / 10) : 0;
      return clamp(Math.max(g, listenWin(t)));
    };
    return {
      place: () => base,
      face: (t) => lerp(Math.sin((t + seed * 13) / 170) * 0.08, faceTo(talkX(t), base.x, 1.3), glance(t)),
      pose: (t) => {
        const it = bgItem(p, t);
        const g = glance(t);
        const lap = lapOf(base);
        let armL: WorldArm = { target: lap.L, shape: "relax", elbow: "in" };
        let armR: WorldArm = { target: lap.R, shape: "relax", elbow: "in" };
        let lookY = lerp(0.55, -0.05, g);
        let lean = 0;
        if (it.kind === "book") {
          armL = arm({ x: it.pos.x - it.w * 0.5, y: it.pos.y + 6 }, "pinch");
          armR = arm({ x: it.pos.x + it.w * 0.5 - it.flip * it.w * 0.6, y: it.pos.y + 6 - it.flip * 8 }, it.flip > 0.2 ? "open" : "pinch");
        } else if (it.kind === "notebook" && it.pencil) {
          armL = arm({ x: it.pos.x - it.w * 0.32, y: it.pos.y - 4 }, "open");
          armR = arm({ x: it.pencil.x + 6, y: it.pencil.y - 2 }, "pinch");
          lookY = lerp(0.75, 0.0, g);
          lean = 9 * (1 - g);
        } else if (it.kind === "cards") {
          armL = arm({ x: it.pos.x, y: it.pos.y + 10 }, "pinch");
        } else {
          lookY = -0.05;
        }
        const nod = it.kind === "none" ? 0 : lerp(it.kind === "notebook" ? 18 : 14, 0, g);
        lookY = lerp(0.95, lookY, g);
        return { floorSit: 1, expr: g > 0.5 ? "listening" : "focused", armL, armR, lookY, lean, nod, turnBody: 0.45 };
      },
      front: () => true,
    };
  };

  return {
    teacher: { place: teacherPlace, face: (t) => tFace(t) * 0.85, pose: (t) => awake({ ...tPoseEx(t), lookX: (tPoseEx(t).lookX ?? 0) + clamp(tFace(t) * 0.3, -0.25, 0.25) }), front: () => false },
    yusuf: { place: yusufPlace, face: yFaceRaw, pose: (t) => browsUnderFringe(awake(yPoseEx(t)), 3), front: () => true },
    amir: { place: amirPlace, face: aFace, pose: (t) => awake(aPoseEx(t).pose), front: (t) => aPoseEx(t).front },
    bilal: { place: () => bilalP, face: bFace, pose: (t) => awake(bPoseEx(t)), front: () => true },
    bg,
    bgItem,
    piece,
    aHand,
    box,
    book,
    cards,
    teacherCard,
    bilalBook: bilalBookPos,
    events,
  };
};

export const BOOKS_ALL = BOOK_IDS;
