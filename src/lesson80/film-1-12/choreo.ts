// Хореография фильма 80-1-12: для каждого персонажа функции кадра → место
// (ходьба учителя к столу, сдвиг Амира к Юсуфу), направление взгляда и поза
// (руки, мимика, посадка на ковёр); состояние реквизита (шесть деталей
// картинки, пустая коробка, книга Билала, книга Амира) и тихие занятия 22
// учеников. Все моменты берутся из шкалы (реплики, паузы, отрезки
// действий), поэтому при перезаписи озвучки постановка пересчитывается сама.
//
// Руки детей, работающих с картинкой, задаются в плоскости стола (u, w, z) —
// той же, где лежат детали: вид из комнаты и вид сверху получают одну и ту же
// точку касания (кончики пальцев на детали), а не рисуют руки независимо.
// Деталь двигается только когда её держит рука (holder ≠ null); положенная
// деталь лежит неподвижно. Всё детерминированно по номеру кадра.
import { FPS } from "../core/video.ts";
import type { Place, PoseIn, WorldArm } from "../rig/Actor";
import { EXPR, type Expression, type HandShape } from "../rig/pose.ts";
import { clamp, cruise, easeInOut, glide, hash01, keys, lerp, smoothstep, type Vec } from "../rig/motion.ts";
import type { TopHandPose } from "./hands";
import { bgPlace, castById, placeAt, teacherPlaceAt, type CastPupil } from "./cast.ts";
import { AMIR_BOOK, BILAL_BOOK_DOWN, BILAL_BOOK_W, SEAT, TABLE, TEACHER_PATH, TEACHER_START } from "./layout.ts";
import { BOX, LEAF_ASIDE, LOOSE_START, PIECES, planeToRoom, slotOf, START_PLACED, TABLE_PLANE, pieceById, type PieceId, type PiecePose } from "./puzzle.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type Ctl = {
  readonly place: (t: number) => Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  // кисти поверх стола и предметов (касание картинки, коробки)
  readonly front: (t: number) => boolean;
};

export type P3 = { readonly u: number; readonly w: number; readonly z: number };

// Рука ребёнка, работающего у стола: точка кончиков пальцев в плоскости
// стола, поза кисти (для вида сверху), угол кисти, доля «в коленях».
export type HandState = {
  readonly at: P3; // кончики пальцев / точка захвата (плоскость стола)
  readonly lap: number; // 0 — у стола, 1 — в коленях (за краем стола)
  readonly pose: TopHandPose;
  readonly blend: { readonly to: TopHandPose; readonly t: number } | undefined;
  readonly twist: number; // доп. поворот кисти, градусы (вращение детали)
};

export type BoxInfo = { readonly u: number; readonly w: number; readonly z: number; readonly holder: "amir" | "both" | "yusuf" | null };
export type BookInfo = { readonly pos: Vec; readonly open: number; readonly where: "hands" | "floor" | "table"; readonly flip: number };
export type BgItem = { readonly kind: "book" | "notebook" | "cards" | "none"; readonly pos: Vec; readonly w: number; readonly color: string; readonly flip: number; readonly pencil: Vec | null; readonly card: number };

export type Events = {
  readonly pieceTaps: readonly number[]; // деталь коснулась стола
  readonly bumps: readonly number[]; // деталь упёрлась (не подошла)
  readonly fits: readonly { readonly id: PieceId; readonly at: number }[]; // деталь встала на место
  readonly slides: readonly number[];
  readonly fingerEdge: { readonly from: number; readonly to: number };
  readonly boxLift: number;
  readonly boxSet: number;
  readonly bilalPage: number;
  readonly bilalBookDown: number;
  readonly amirBookClose: number;
  readonly cloth: readonly number[]; // шорох одежды (посадка, сдвиг)
  readonly steps: readonly number[]; // шаги учителя
};

export type Choreo = {
  readonly teacher: Ctl;
  readonly yusuf: Ctl;
  readonly amir: Ctl;
  readonly bilal: Ctl;
  readonly bg: (p: CastPupil) => Ctl;
  readonly bgItem: (p: CastPupil, t: number) => BgItem;
  readonly piece: (id: PieceId, t: number) => PiecePose;
  readonly pieces: (t: number) => readonly PiecePose[];
  readonly yHand: (side: "R" | "L", t: number) => HandState; // R — правая рука Юсуфа (слева в кадре комнаты)
  readonly aHand: (side: "R" | "L", t: number) => HandState;
  readonly box: (t: number) => BoxInfo;
  readonly bilalBook: (t: number) => BookInfo;
  readonly amirBook: (t: number) => { readonly open: number };
  readonly placedAt: (t: number) => number;
  readonly events: Events;
};

const sec = (s: number) => Math.round(s * FPS);
const seg = (t: number, from: number, to: number) => (to <= from ? (t >= to ? 1 : 0) : clamp((t - from) / (to - from)));
const win = (t: number, from: number, to: number, edge = 8) => smoothstep((t - from) / edge) * (1 - smoothstep((t - to) / edge));
const mixV = (a: Vec, b: Vec, u: number): Vec => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
const mix3 = (a: P3, b: P3, u: number): P3 => ({ u: lerp(a.u, b.u, u), w: lerp(a.w, b.w, u), z: lerp(a.z, b.z, u) });
const arm = (target: Vec, shape: HandShape = "open", elbow: WorldArm["elbow"] = "out"): WorldArm => ({ target, shape, elbow });
const faceTo = (targetX: number, x: number, gain = 2.2) => clamp(((targetX - x) / 760) * gain, -0.82, 0.82);
const EX = (browIn: number, browOut: number, lid: number, smile: number): Expression => ({ browIn, browOut, lid, smile });
const ROOM_SHAPE: Record<TopHandPose, HandShape> = { rest: "relax", open: "open", grip: "pinch", pinch: "pinch", point: "point", trace: "point" };

// Колени и руки сидящего: кисти на коленях.
const lapOf = (p: Place) => ({ L: { x: p.x - 0.13 * p.h, y: p.y - 0.06 * p.h }, R: { x: p.x + 0.13 * p.h, y: p.y - 0.06 * p.h } });
const lapArms = (p: Place): { armL: WorldArm; armR: WorldArm } => {
  const l = lapOf(p);
  return { armL: { target: l.L, shape: "relax", elbow: "in" }, armR: { target: l.R, shape: "relax", elbow: "in" } };
};
// Руки при посадке: от боков к коленям.
const sideOf = (p: Place) => ({ L: { x: p.x - 0.13 * p.h, y: p.y - 0.42 * p.h }, R: { x: p.x + 0.13 * p.h, y: p.y - 0.42 * p.h } });
const restArms = (p: Place, sit: number): { armL: WorldArm; armR: WorldArm } => {
  // стоя и при ходьбе руки свободно висят вдоль тела (не дугой наружу)
  if (sit <= 0.001) return { armL: { target: null, shape: "relax", elbow: "hang" }, armR: { target: null, shape: "relax", elbow: "hang" } };
  const lap = lapOf(p);
  const side = sideOf(p);
  const k = smoothstep(sit / 0.9);
  return { armL: { target: mixV(side.L, lap.L, k), shape: "relax", elbow: "in" }, armR: { target: mixV(side.R, lap.R, k), shape: "relax", elbow: "in" } };
};

// Внимательный взгляд: верхнее веко опускается заметно только когда персонаж
// смотрит вниз (на картинку, книгу); при взгляде на собеседника глаза открыты
// (иначе спокойное лицо читается как прищур или сонливость).
const browsUnderFringe = (p: PoseIn, max: number): PoseIn => {
  const e: Expression = typeof p.expr === "string" ? EXPR[p.expr] : p.expr ?? EXPR.neutral;
  return { ...p, expr: { ...e, browIn: Math.min(e.browIn, max), browOut: Math.min(e.browOut, max) } };
};
const awake = (p: PoseIn): PoseIn => {
  const e: Expression = typeof p.expr === "string" ? EXPR[p.expr] : p.expr ?? EXPR.neutral;
  const down = clamp(((p.lookY ?? 0) - 0.3) / 0.3);
  // с улыбкой веки открыты сильнее: опущенное веко и улыбка вместе читаются как ухмылка
  // взгляд вниз показывает смещение радужки, веко опускается лишь слегка
  const cap = lerp(0.06, 0.09, down) * (1 - 0.4 * clamp(e.smile / 0.6));
  // внутренние края бровей не опускаются: сосредоточенность без хмурого
  // «прищура»; при взгляде вниз (веко следует за радужкой) — не ниже внешних
  const browIn = Math.max(e.browIn, 0.8, down > 0 ? e.browOut + 0.6 * down : -Infinity);
  return { ...p, expr: { ...e, lid: Math.min(e.lid, cap), browIn } };
};

// ---------- ключи движения детали ----------
type PK = { readonly u: number; readonly w: number; readonly z: number; readonly th: number };
type PKey = readonly [number, PK];
const track = (t: number, ks: readonly PKey[]): PK => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t1, b] = ks[i];
    const [t0, a] = ks[i - 1];
    if (t <= t1) {
      const u = t1 <= t0 ? 1 : easeInOut((t - t0) / (t1 - t0));
      return { u: lerp(a.u, b.u, u), w: lerp(a.w, b.w, u), z: lerp(a.z, b.z, u), th: lerp(a.th, b.th, u) };
    }
  }
  return ks[ks.length - 1][1];
};

// ---------- ключи руки ----------
type HAt = P3 | ((t: number) => P3) | "lap";
type HKey = { readonly t: number; readonly at: HAt; readonly pose: TopHandPose; readonly twist?: number };
const resolveAt = (at: HAt, t: number, lapPt: P3): P3 => (at === "lap" ? lapPt : typeof at === "function" ? at(t) : at);

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
  const mStudy = M("Юсуф рассматривает картинку");
  const mTake = M("Юсуф берёт деталь");
  const mTry = M("попытка: не подходит");
  const mAside = M("Юсуф откладывает деталь");
  const mLook = M("Юсуф смотрит на картинку");
  const mAmirUp = M("Амир поднимает голову");
  const mTurnT = M("Юсуф поворачивается к учителю");
  const mWalk = M("учитель подходит");
  const mSit = M("учитель садится");
  const mBook = M("Билал откладывает книгу");
  const mCalm = M("Юсуф успокаивается");
  const mScoot = M("Амир придвигается");
  const mListen = M("дети слушают");
  const mAgree = M("согласие");
  const mNotDone = M("картинка не собрана");
  const mHeadUp = M("Юсуф поднимает голову");
  const mBack = M("Юсуф поворачивается к картинке");
  const mTakeLeaf = M("Юсуф берёт деталь с листиком");
  const mExam = M("Юсуф рассматривает листик");
  const mLean = M("Амир наклоняется к Юсуфу");
  const mAmirLook = M("Амир смотрит на ветку");
  const mTurn = M("поворот и соединение");
  const mWatch = M("учитель наблюдает");
  const mTwo = M("две детали");
  const m5 = M("пятая деталь");
  const m6 = M("шестая деталь");
  const mDone = M("картинка собрана");
  const mEdge = M("палец вдоль края");
  const mBox = M("коробка");
  const mPull = M("камера отходит");
  const p1 = P(0);
  const p2 = P(1);
  const p3 = P(2);
  void mRoom;
  void mLook;
  void mAgree;
  void mWatch;
  void mPull;
  void p1;
  void p2;

  // ---------- места ----------
  const YUSUF = castById("yusuf");
  const AMIR = castById("amir");
  const BILAL = castById("bilal");
  const yusufP = placeAt(YUSUF.age, SEAT.yusuf.x, SEAT.yusuf.y);
  const bilalP = placeAt(BILAL.age, SEAT.bilal.x, SEAT.bilal.y);
  // Амир придвигается двумя короткими движениями (опора на руки)
  const scootA = { from: mScoot.from + sec(0.8), to: mScoot.from + sec(1.6) };
  const scootB = { from: mScoot.from + sec(1.85), to: mScoot.from + sec(2.6) };
  const amirX = (t: number) => {
    const mid = lerp(SEAT.amirStart.x, SEAT.amirNear.x, 0.55);
    if (t < scootA.from) return SEAT.amirStart.x;
    if (t < scootA.to) return lerp(SEAT.amirStart.x, mid, easeInOut(seg(t, scootA.from, scootA.to)));
    if (t < scootB.from) return mid;
    return lerp(mid, SEAT.amirNear.x, easeInOut(seg(t, scootB.from, scootB.to)));
  };
  const amirPlace = (t: number): Place => placeAt(AMIR.age, amirX(t), SEAT.amirStart.y);
  // учитель: стоит в проходе → идёт → садится у левого конца стола
  const walk = { from: mWalk.from + sec(0.35), to: mWalk.to + sec(0.1) };
  const teacherPos = (t: number): Vec => (t <= walk.from ? TEACHER_START : t >= walk.to ? SEAT.teacher : glide(t, walk.from, walk.to, [TEACHER_START, ...TEACHER_PATH], (x) => cruise(x, 0.26)));
  const teacherPlace = (t: number): Place => {
    const p = teacherPos(t);
    return teacherPlaceAt(p.x, p.y);
  };
  const teacherSit = (t: number) => keys(t, [[mSit.from - sec(0.15), 0], [mSit.from + sec(1.75), 1]], easeInOut);

  // ---------- детали картинки ----------
  const startPose = (id: PieceId): PK => {
    if ((START_PLACED as readonly string[]).includes(id)) {
      const s = slotOf(pieceById(id));
      return { u: s.u, w: s.w, z: 0, th: 0 };
    }
    const l = LOOSE_START[id as keyof typeof LOOSE_START];
    return { u: l.u, w: l.w, z: 0, th: l.theta };
  };
  const slot = (id: PieceId, z = 0, th = 0, du = 0, dw = 0): PK => {
    const s = slotOf(pieceById(id));
    return { u: s.u + du, w: s.w + dw, z, th };
  };
  // деталь с листиком
  const tB = mTake.from;
  const leafGrip1 = tB + sec(0.8);
  const c0 = mTry.from;
  const bump1 = c0 + sec(1.35);
  const bump2 = c0 + sec(2.6);
  const d0 = mAside.from;
  const leafDown1 = d0 + sec(1.0);
  const leafFree1 = d0 + sec(1.45);
  const g0 = mTakeLeaf.from;
  const leafGrip2 = g0 + sec(0.8);
  const e0 = mExam.from;
  const l23 = L(23);
  const leafDown2 = l23.from + sec(0.6);
  const l25 = L(25);
  // девять шагов: взгляд на веточку → на край → вторая рука → поворот на
  // четверть оборота → к свободному месту (сверху, не над собранной частью)
  // → совмещение краёв → соединение → руки отпускают → взгляд проверяет
  const r0 = mTurn.from;
  const RT = { look2: sec(0.8), hand2: sec(1.35), both: sec(1.95), rot0: sec(2.0), rot1: sec(3.4), over: sec(4.0), above: sec(4.6), align: sec(5.2), fit: sec(5.6), free: sec(6.05), rest: sec(6.6) } as const;
  const rotFrom = r0 + RT.rot0;
  const rotTo = r0 + RT.rot1;
  const leafFit = r0 + RT.fit;
  const leafFree2 = r0 + RT.free;
  const LEAF_KEYS: PKey[] = [
    [tB, startPose("r0c1")],
    [leafGrip1, startPose("r0c1")],
    [mTake.to, { u: 2103, w: 70, z: 10, th: 90 }],
    [c0 + sec(1.0), { u: 1991, w: 90, z: 8, th: 90 }],
    [bump1, { u: 2001, w: 92, z: 1.5, th: 90 }],
    [c0 + sec(1.6), { u: 1997, w: 92, z: 2, th: 90 }],
    [c0 + sec(1.9), { u: 1998, w: 91, z: 3, th: 84 }],
    [c0 + sec(2.2), { u: 1998, w: 92, z: 3, th: 95 }],
    [bump2, { u: 2002, w: 92, z: 2.5, th: 91 }],
    [mTry.to, { u: 2000, w: 91, z: 2, th: 91 }],
    [d0 + sec(0.3), { u: 2030, w: 80, z: 9, th: 93 }],
    [leafDown1, { u: LEAF_ASIDE.u, w: LEAF_ASIDE.w, z: 0, th: LEAF_ASIDE.theta }],
    [leafGrip2, { u: LEAF_ASIDE.u, w: LEAF_ASIDE.w, z: 0, th: LEAF_ASIDE.theta }],
    [g0 + sec(1.3), { u: 2117, w: 98, z: 18, th: 96 }],
    [mTakeLeaf.to, { u: 2119, w: 122, z: 24, th: 96 }],
    [e0 + sec(0.9), { u: 2118, w: 124, z: 26, th: 90 }],
    [e0 + sec(1.9), { u: 2120, w: 122, z: 25, th: 100 }],
    [mExam.to, { u: 2119, w: 122, z: 24, th: 96 }],
    [l23.from, { u: 2119, w: 122, z: 22, th: 96 }],
    [leafDown2, { u: 2121, w: 122, z: 0, th: 96 }],
    [l25.from, { u: 2121, w: 122, z: 0, th: 96 }],
    [l25.from + sec(0.6), { u: 2119, w: 118, z: 14, th: 96 }],
    // держит перед собой, чуть правее середины, и там же поворачивает: рука
    // Амира, показывающая ветку, проходит левее и не пересекает руки Юсуфа
    [l25.from + sec(1.6), { u: 2010, w: 182, z: 14, th: 96 }],
    [rotFrom, { u: 2010, w: 182, z: 14, th: 96 }],
    [rotTo, { u: 2012, w: 178, z: 14, th: 0 }],
    [r0 + RT.over, { u: 2060, w: 70, z: 13, th: 0 }],
    [r0 + RT.above, { u: 2024, w: 64, z: 10, th: 1 }],
    [r0 + sec(4.95), slot("r0c1", 6, 2, 2, -4)],
    [r0 + RT.align, slot("r0c1", 3, -1, 0.5, -1)],
    [leafFit, slot("r0c1")],
  ];
  // пятая деталь (r1c2) — правой рукой
  const q0 = m5.from;
  const g5 = q0 + sec(0.8);
  const fit5 = q0 + sec(3.8);
  const free5 = q0 + sec(4.35);
  const P5_KEYS: PKey[] = [
    [g5, startPose("r1c2")],
    [q0 + sec(1.2), { u: 1925, w: 66, z: 10, th: -32 }],
    [q0 + sec(2.8), slot("r1c2", 8, -4, -3, -4)],
    [q0 + sec(3.4), slot("r1c2", 4, 0)],
    [fit5, slot("r1c2")],
  ];
  // шестая деталь (r0c2) — правой рукой, в конце чуть доворачивает
  const x0 = m6.from;
  const g6 = x0 + sec(0.8);
  const fit6 = x0 + sec(4.3);
  const free6 = x0 + sec(4.9);
  const P6_KEYS: PKey[] = [
    [g6, startPose("r0c2")],
    [x0 + sec(1.2), { u: 1919, w: 146, z: 10, th: 24 }],
    [x0 + sec(2.6), slot("r0c2", 9, 14, -7, 4)],
    [x0 + sec(3.4), slot("r0c2", 7, 0, -3, 2)],
    [x0 + sec(3.9), slot("r0c2", 3, 0)],
    [fit6, slot("r0c2")],
  ];
  const fitAt: Record<PieceId, number> = { r0c0: -1, r1c0: -1, r1c1: -1, r0c1: leafFit, r1c2: fit5, r0c2: fit6 };
  const heldBy = (id: PieceId, t: number): PiecePose["held"] => {
    if (id === "r0c1") {
      if (t >= leafGrip1 && t < leafDown1) return "left";
      if (t >= leafGrip2 && t < r0 + RT.both) return "left";
      if (t >= r0 + RT.both && t < leafFit) return "both";
    }
    if (id === "r1c2" && t >= g5 && t < fit5) return "right";
    if (id === "r0c2" && t >= g6 && t < fit6) return "right";
    return null;
  };
  const piece = (id: PieceId, t: number): PiecePose => {
    const ks = id === "r0c1" ? LEAF_KEYS : id === "r1c2" ? P5_KEYS : id === "r0c2" ? P6_KEYS : null;
    const k = ks ? track(t, ks) : startPose(id);
    const placed = fitAt[id] < 0 || t >= fitAt[id];
    return { u: k.u, w: k.w, z: k.z, theta: k.th, placed, held: heldBy(id, t) };
  };
  const pieces = (t: number) => PIECES.map((p) => piece(p.id, t));
  const placedAt = (t: number) => pieces(t).filter((p) => p.placed).length;

  // точка захвата детали одной рукой: ближний к ребёнку край, кончики пальцев на дереве
  const gripOf = (id: PieceId, dw = 9) => (t: number): P3 => {
    const p = piece(id, t);
    return { u: p.u, w: p.w + dw, z: p.z + 2 };
  };
  // две руки при повороте: края детали слева и справа (поворачиваются вместе с ней)
  const sideGrip = (id: PieceId, side: 1 | -1) => (t: number): P3 => {
    const p = piece(id, t);
    const r = (p.theta * Math.PI) / 180;
    const lx = side * 60;
    const ly = 20;
    const rx = lx * Math.cos(r) - ly * Math.sin(r);
    const ry = lx * Math.sin(r) + ly * Math.cos(r);
    return { u: p.u - 0.36 * rx, w: p.w + 0.36 * ry, z: p.z + 2 };
  };

  // ---------- руки Юсуфа ----------
  // R — правая рука Юсуфа (в кадре комнаты слева, armL), L — левая (armR).
  const yLapPt = (side: "R" | "L"): P3 => ({ u: yusufP.x + (side === "R" ? -36 : 36), w: 300, z: 0 });
  // кисти в покое лежат на столе по бокам от картинки: на виде сверху видны
  // целиком с предплечьями, в виде из комнаты — на столешнице, не у груди
  const yRestOnTable = (side: "R" | "L"): P3 => ({ u: yusufP.x + (side === "R" ? -58 : 58), w: 160, z: 0 });
  const leafPick1 = { t: leafGrip1, at: gripOf("r0c1"), pose: "grip" as const };
  const Y_L_KEYS: HKey[] = [
    { t: 0, at: yRestOnTable("L"), pose: "rest" },
    { t: tB, at: yRestOnTable("L"), pose: "rest" },
    { t: tB + sec(0.55), at: (t) => ({ ...gripOf("r0c1")(t), z: 8 }), pose: "open" },
    leafPick1,
    { t: leafDown1, at: gripOf("r0c1"), pose: "grip" },
    { t: leafFree1, at: (t) => ({ ...gripOf("r0c1", 16)(t), z: 6 }), pose: "rest" },
    { t: d0 + sec(1.5) + sec(0.6), at: yRestOnTable("L"), pose: "rest" },
    { t: L(2).from - sec(0.2), at: yRestOnTable("L"), pose: "rest" },
    { t: L(2).from + sec(0.5), at: "lap", pose: "rest" },
    { t: g0, at: "lap", pose: "rest" },
    { t: g0 + sec(0.55), at: (t) => ({ ...gripOf("r0c1")(t), z: 8 }), pose: "open" },
    { t: leafGrip2, at: gripOf("r0c1"), pose: "grip" },
    { t: r0 + RT.hand2, at: gripOf("r0c1"), pose: "grip" },
    { t: r0 + RT.both, at: sideGrip("r0c1", -1), pose: "grip", twist: 28 },
    { t: leafFit, at: sideGrip("r0c1", -1), pose: "grip", twist: 24 },
    { t: leafFree2, at: (t) => ({ ...sideGrip("r0c1", -1)(t), w: sideGrip("r0c1", -1)(t).w + 10, z: 6 }), pose: "rest" },
    { t: r0 + RT.rest, at: yRestOnTable("L"), pose: "rest" },
    { t: L(27).to + sec(0.4), at: yRestOnTable("L"), pose: "rest" },
    { t: L(27).to + sec(1.2), at: "lap", pose: "rest" },
    // коробка: принимает двумя руками и ставит рядом с картинкой
    { t: mBox.from + sec(1.5), at: "lap", pose: "rest" },
    { t: mBox.from + sec(2.1), at: (t) => boxGrip("yL", t), pose: "open" },
    { t: mBox.from + sec(3.4), at: (t) => boxGrip("yL", t), pose: "open" },
    { t: mBox.from + sec(4.0), at: (t) => ({ ...boxGrip("yL", t), w: boxGrip("yL", t).w + 22, z: 4 }), pose: "rest" },
    { t: mBox.to + sec(0.9), at: "lap", pose: "rest" },
  ];
  const Y_R_KEYS: HKey[] = [
    { t: 0, at: yRestOnTable("R"), pose: "rest" },
    { t: L(2).from - sec(0.2), at: yRestOnTable("R"), pose: "rest" },
    { t: L(2).from + sec(0.5), at: "lap", pose: "rest" },
    // сцена 6: вторая рука для поворота
    { t: r0 + RT.hand2, at: "lap", pose: "rest" },
    { t: r0 + RT.both, at: sideGrip("r0c1", 1), pose: "grip", twist: -28 },
    { t: leafFit, at: sideGrip("r0c1", 1), pose: "grip", twist: -24 },
    { t: leafFree2, at: (t) => ({ ...sideGrip("r0c1", 1)(t), w: sideGrip("r0c1", 1)(t).w + 10, z: 6 }), pose: "rest" },
    { t: r0 + RT.rest, at: yRestOnTable("R"), pose: "rest" },
    // сцена 7: пятая деталь
    { t: q0, at: yRestOnTable("R"), pose: "rest" },
    { t: q0 + sec(0.55), at: (t) => ({ ...gripOf("r1c2")(t), z: 8 }), pose: "open" },
    { t: g5, at: gripOf("r1c2"), pose: "grip" },
    { t: fit5, at: gripOf("r1c2"), pose: "grip" },
    { t: free5, at: (t) => ({ ...gripOf("r1c2", 18)(t), z: 6 }), pose: "rest" },
    // шестая деталь
    { t: x0 + sec(0.1), at: (t) => ({ ...gripOf("r1c2", 26)(t), z: 4 }), pose: "rest" },
    { t: x0 + sec(0.55), at: (t) => ({ ...gripOf("r0c2")(t), z: 8 }), pose: "open" },
    { t: g6, at: gripOf("r0c2"), pose: "grip" },
    { t: x0 + sec(2.6), at: gripOf("r0c2"), pose: "grip" },
    { t: x0 + sec(3.4), at: gripOf("r0c2", 7), pose: "pinch", twist: -10 },
    { t: fit6, at: gripOf("r0c2"), pose: "grip" },
    { t: free6, at: (t) => ({ ...gripOf("r0c2", 20)(t), z: 6 }), pose: "rest" },
    { t: mDone.from + sec(0.8), at: yRestOnTable("R"), pose: "rest" },
    { t: L(29).from, at: "lap", pose: "rest" },
    // палец вдоль ближнего края готовой картинки (от птицы к дереву)
    { t: mEdge.from + sec(0.1), at: "lap", pose: "rest" },
    { t: mEdge.from + sec(0.7), at: (t) => edgeFinger(t), pose: "trace" },
    { t: mEdge.from + sec(3.0), at: (t) => edgeFinger(t), pose: "trace" },
    { t: mEdge.from + sec(3.5), at: (t) => ({ ...edgeFinger(t), z: 10, w: edgeFinger(t).w + 14 }), pose: "rest" },
    { t: L(33).from + sec(0.3), at: "lap", pose: "rest" },
    // коробка
    { t: mBox.from + sec(1.5), at: "lap", pose: "rest" },
    { t: mBox.from + sec(2.1), at: (t) => boxGrip("yR", t), pose: "open" },
    { t: mBox.from + sec(3.4), at: (t) => boxGrip("yR", t), pose: "open" },
    { t: mBox.from + sec(4.0), at: (t) => ({ ...boxGrip("yR", t), w: boxGrip("yR", t).w + 22, z: 4 }), pose: "rest" },
    { t: mBox.to + sec(0.9), at: "lap", pose: "rest" },
  ];
  // кончик указательного пальца на дереве у ближнего края картинки
  const EDGE_W = slotOf(pieceById("r1c0")).w + 11; // нарисованный кончик пальца ложится на край
  const edgeU0 = slotOf(pieceById("r1c2")).u - 15;
  const edgeU1 = slotOf(pieceById("r1c0")).u + 13;
  const edgeTrace = { from: mEdge.from + sec(0.75), to: mEdge.from + sec(3.0) };
  const edgeFinger = (t: number): P3 => ({ u: lerp(edgeU0, edgeU1, easeInOut(seg(t, edgeTrace.from, edgeTrace.to))), w: EDGE_W, z: 0 });

  // ---------- коробка ----------
  const bx0 = mBox.from;
  const boxGripA = bx0 + sec(0.7);
  const boxLift = bx0 + sec(0.8);
  const boxShared = bx0 + sec(2.1);
  const boxAmirFree = bx0 + sec(2.5);
  const boxSet = bx0 + sec(3.35);
  const BOX_KEYS: PKey[] = [
    [boxGripA, { u: BOX.start.u, w: BOX.start.w, z: 0, th: 0 }],
    // невысоко над столом: руки тянутся вперёд-вниз, локти не разведены «крыльями»
    [bx0 + sec(1.1), { u: BOX.start.u - 6, w: BOX.start.w - 4, z: 16, th: 0 }],
    [bx0 + sec(1.9), { u: 2180, w: 104, z: 24, th: -3 }],
    [boxShared, { u: 2177, w: 105, z: 24, th: -3 }],
    [boxAmirFree, { u: 2173, w: 106, z: 22, th: -2 }],
    [bx0 + sec(3.0), { u: BOX.end.u + 2, w: BOX.end.w, z: 8, th: 0 }],
    [boxSet, { u: BOX.end.u, w: BOX.end.w, z: 0, th: 0 }],
  ];
  const box = (t: number): BoxInfo => {
    const k = track(t, BOX_KEYS);
    const holder: BoxInfo["holder"] = t < boxGripA || t >= boxSet ? null : t < boxShared ? "amir" : t < boxAmirFree ? "both" : "yusuf";
    return { u: k.u, w: k.w, z: k.z, holder };
  };
  // захваты коробки: Амир — за правый и левый торцы, Юсуф — за ближние к нему углы
  const boxGrip = (who: "aR" | "aL" | "yR" | "yL", t: number): P3 => {
    const b = box(t);
    const hw = BOX.w / 2;
    const hd = BOX.d / 2;
    // ладони на боковых стенках (запястье чуть снаружи стенки)
    switch (who) {
      case "aL": // левая рука Амира — справа в кадре, торец +u
        return { u: b.u + hw + 6, w: b.w + 4, z: b.z + BOX.h * 0.55 };
      case "aR": {
        // правая рука Амира: торец −u, а когда коробку берёт Юсуф — соскальзывает на заднюю стенку
        const k = smoothstep(seg(t, boxShared - sec(0.35), boxShared));
        return { u: lerp(b.u - hw - 6, b.u - hw * 0.15, k), w: lerp(b.w + 4, b.w + hd - 4, k), z: b.z + BOX.h * 0.55 };
      }
      // Юсуф слева от коробки: обе ладони на торце −u — правая (слева в кадре)
      // ближе к камере, левая ближе к Юсуфу; руки не перекрещиваются
      case "yR":
        return { u: b.u - hw - 6, w: b.w - hd * 0.45, z: b.z + BOX.h * 0.5 };
      default:
        return { u: b.u - hw - 4, w: b.w + hd * 0.45, z: b.z + BOX.h * 0.6 };
    }
  };

  // кисть держит коробку за боковую стенку: локоть чуть в сторону, ладонь к стенке
  const onBoxWall = (t: number, h: HandState) => t >= boxGripA - sec(0.5) && t <= boxSet + sec(0.5) && h.pose === "open" && h.lap < 0.5;

  // ---------- руки Амира ----------
  const aLapPt = (side: "R" | "L") => (t: number): P3 => ({ u: amirX(t) + (side === "R" ? -40 : 40), w: 300, z: 0 });
  // указывает на место, где продолжается ветка (край детали r0c0)
  // палец над пустым местом у края кроны, где выходит ветка (продолжение — на детали с листиком)
  const branchEnd: P3 = (() => {
    const s = slotOf(pieceById("r0c0"));
    return { u: s.u - 0.36 * 50 - 9, w: s.w + 0.36 * (82 - 50), z: 9 };
  })();
  const point0 = mAmirLook.from - sec(0.1);
  const pointHold = L(26).from + Math.round((L(26).to - L(26).from) * 0.75);
  const A_R_KEYS: HKey[] = [
    { t: 0, at: "lap", pose: "rest" },
    { t: point0 - sec(0.6), at: "lap", pose: "rest" },
    { t: point0, at: { ...branchEnd, z: 16, u: branchEnd.u + 8 }, pose: "point" },
    { t: point0 + sec(0.3), at: branchEnd, pose: "point" },
    { t: pointHold, at: branchEnd, pose: "point" },
    { t: pointHold + sec(0.5), at: { u: SEAT.amirNear.x - 60, w: 190, z: 4 }, pose: "rest" },
    { t: r0 + RT.both, at: "lap", pose: "rest" },
    // коробка
    { t: bx0, at: "lap", pose: "rest" },
    { t: boxGripA, at: (t) => boxGrip("aR", t), pose: "open" },
    { t: boxAmirFree - 2, at: (t) => boxGrip("aR", t), pose: "open" },
    { t: boxAmirFree + sec(0.3), at: (t) => ({ ...boxGrip("aR", t), u: boxGrip("aR", t).u + 16, w: boxGrip("aR", t).w + 18, z: 30 }), pose: "rest" },
    { t: boxAmirFree + sec(0.9), at: "lap", pose: "rest" },
  ];
  const A_L_KEYS: HKey[] = [
    { t: 0, at: "lap", pose: "rest" },
    { t: bx0, at: "lap", pose: "rest" },
    { t: boxGripA, at: (t) => boxGrip("aL", t), pose: "open" },
    { t: boxAmirFree - 2, at: (t) => boxGrip("aL", t), pose: "open" },
    { t: boxAmirFree + sec(0.3), at: (t) => ({ ...boxGrip("aL", t), u: boxGrip("aL", t).u + 12, w: boxGrip("aL", t).w + 18, z: 30 }), pose: "rest" },
    { t: boxAmirFree + sec(0.9), at: "lap", pose: "rest" },
  ];

  const handAt = (ks: readonly HKey[], t: number, lapPt: (t: number) => P3): HandState => {
    const lp = lapPt(t);
    let i = ks.length - 1;
    for (let k = 0; k < ks.length - 1; k++) {
      if (t < ks[k + 1].t) {
        i = k;
        break;
      }
    }
    const a = ks[i];
    const b = ks[Math.min(ks.length - 1, i + 1)];
    if (a === b || t <= a.t) {
      return { at: resolveAt(a.at, t, lp), lap: a.at === "lap" ? 1 : 0, pose: a.pose, blend: undefined, twist: a.twist ?? 0 };
    }
    const u = easeInOut(seg(t, a.t, b.t));
    // из колен рука поднимается над краем стола (дуга), а не проходит сквозь него
    const pa = resolveAt(a.at, t, lp);
    const pb = resolveAt(b.at, t, lp);
    const pt = mix3(pa, pb, u);
    const lapK = lerp(a.at === "lap" ? 1 : 0, b.at === "lap" ? 1 : 0, u);
    const arcZ = (a.at === "lap") !== (b.at === "lap") ? 10 * Math.sin(Math.PI * u) : 0;
    return { at: { ...pt, z: pt.z + arcZ }, lap: lapK, pose: a.pose, blend: a.pose !== b.pose ? { to: b.pose, t: u } : undefined, twist: lerp(a.twist ?? 0, b.twist ?? 0, u) };
  };
  const yHand = (side: "R" | "L", t: number) => handAt(side === "R" ? Y_R_KEYS : Y_L_KEYS, t, () => yLapPt(side));
  const aHand = (side: "R" | "L", t: number) => handAt(side === "R" ? A_R_KEYS : A_L_KEYS, t, aLapPt(side));

  // рука у стола → цель запястья в мире комнаты (кончики пальцев на точке касания)
  const roomHand = (h: HandState, lapW: Vec, lift = 11): Vec => {
    // кисть в покое — на столешнице, а не на дальнем ребре стола
    const p = planeToRoom(TABLE.top, h.at.u, Math.min(h.at.w, h.pose === "rest" ? 166 : 205), h.at.z);
    // кисть идёт от ребёнка к камере: запястье чуть дальше (выше в кадре), кончики пальцев — на точке касания
    const wrist = { x: p.x, y: p.y - lift };
    return mixV(wrist, lapW, smoothstep(h.lap));
  };
  const roomShape = (h: HandState): HandShape => ROOM_SHAPE[h.blend && h.blend.t > 0.5 ? h.blend.to : h.pose];

  // ---------- книги ----------
  const bilalPage = mRoom.from + sec(1.6);
  const bk0 = mBook.from;
  const bookClose = { from: bk0, to: bk0 + sec(0.35) };
  const bookPut = { from: bk0 + sec(0.35), to: bk0 + sec(0.95) };
  const bilalBookDown = bookPut.to;
  const bilalBook = (t: number): BookInfo => {
    const held: Vec = { x: bilalP.x + 0.01 * bilalP.h, y: bilalP.y - 0.13 * bilalP.h };
    const flip = win(t, bilalPage - sec(0.3), bilalPage + sec(0.35), 6);
    if (t < bookClose.from) return { pos: held, open: 1, where: "hands", flip };
    if (t < bookPut.from) return { pos: held, open: 1 - easeInOut(seg(t, bookClose.from, bookClose.to)), where: "hands", flip: 0 };
    if (t < bilalBookDown) {
      const u = easeInOut(seg(t, bookPut.from, bookPut.to));
      return { pos: { x: lerp(held.x, BILAL_BOOK_DOWN.x, u), y: lerp(held.y, BILAL_BOOK_DOWN.y, u) - 22 * Math.sin(Math.PI * u) }, open: 0, where: "hands", flip: 0 };
    }
    return { pos: BILAL_BOOK_DOWN, open: 0, where: "floor", flip: 0 };
  };
  const amirBookClose = mScoot.from + sec(0.5);
  const amirBook = (t: number) => ({ open: 1 - easeInOut(seg(t, mScoot.from + sec(0.1), amirBookClose)) });

  // ---------- события звука ----------
  const events: Events = {
    pieceTaps: [leafGrip1 - 2, leafDown1, leafDown2, g5 - 2, g6 - 2],
    bumps: [bump1, bump2],
    fits: [
      { id: "r0c1", at: leafFit - 3 },
      { id: "r1c2", at: fit5 - 3 },
      { id: "r0c2", at: fit6 - 3 },
    ],
    slides: [r0 + sec(5.05), q0 + sec(3.0), x0 + sec(3.5)],
    fingerEdge: edgeTrace,
    boxLift,
    boxSet,
    bilalPage,
    bilalBookDown,
    amirBookClose,
    cloth: [mSit.from + sec(0.1), scootA.from, scootB.from, mBook.from + sec(0.2)],
    steps: (() => {
      const out: number[] = [];
      for (let f = walk.from + sec(0.25); f < walk.to - sec(0.15); f += sec(0.52)) out.push(f);
      return out;
    })(),
  };

  // ---------- учитель ----------
  const tFace = (t: number) => {
    const p = teacherPlace(t);
    const toY = faceTo(SEAT.yusuf.x, p.x, 3);
    const toB = faceTo(SEAT.bilal.x, p.x, 3);
    const toA = faceTo(amirX(t), p.x, 2.4);
    const sp = speakerOf(t);
    if (t < L(4).from - 6) return -0.55; // смотрит работу ученика слева
    if (t < walk.from) return clamp(toY, -0.8, 0.8);
    if (t < mSit.to) return clamp(toY * 0.8, -0.8, 0.8);
    if (inPause(t)) return t >= p3.from ? 0.25 : -0.22; // ждёт ответа: на детей
    if (speaking(5, t) || speaking(15, t)) return -0.2; // вопрос всему классу
    if (speaking(23, t)) return 0.1;
    if (sp === "yusuf") return toY;
    if (sp === "amir") return toA;
    if (sp === "bilal") return toB;
    if (sp === "muhammad") {
      if (speaking(14, t)) return -0.1;
      return toY;
    }
    if (t >= mTurn.from && t < mWatch.to) return 0.5; // смотрит, как мальчики собирают
    if (scene(t) === "s7" || scene(t) === "s8") return t >= mPull.from ? -0.25 : 0.45;
    return toY * 0.8;
  };
  const tPoseEx = (t: number): PoseIn => {
    const p = teacherPlace(t);
    const sit = t < mSit.from - sec(0.2) ? 0 : teacherSit(t);
    const lean0 = 9 * Math.sin(Math.PI * clamp(sit)) * (sit > 0.02 && sit < 0.98 ? 1 : 0);
    // кисти на коленях чуть ниже: правая (за столом) целиком закрыта столешницей
    const rest0 = restArms(p, sit);
    const lower = (a: WorldArm): WorldArm => (a.target ? { ...a, target: { x: a.target.x, y: a.target.y + 20 * sit } } : a);
    const rest = { armL: lower(rest0.armL), armR: lower(rest0.armR) };
    // стоя на месте корпус повёрнут меньше (при сильном повороте риг сгибает
    // колени вбок); при ходьбе и посадке — как раньше
    const standing = t < walk.from - sec(0.3);
    const base: PoseIn = { floorSit: sit, sitMorph: true, expr: "calm", ...rest, lookY: 0.12, lean: lean0, turnBody: standing ? lerp(0.3, 0.8, smoothstep(seg(t, walk.from - sec(0.9), walk.from - sec(0.3)))) : lerp(0.8, 0.45, sit) };
    if (sit < 0.02) {
      // стоит: смотрит в тетрадь ученика, затем слышит вопрос Юсуфа
      const heard = smoothstep(seg(t, L(4).from + sec(0.4), L(4).to));
      return { ...base, expr: heard > 0.5 ? "softSmile" : "focused", lookY: lerp(0.55, 0.25, heard), nod: 4 * (1 - heard), headTilt: 2 * heard };
    }
    if (sit < 0.98) return base;
    const lap0 = lapOf(p);
    const lap = { L: { x: lap0.L.x, y: lap0.L.y + 20 }, R: { x: lap0.R.x, y: lap0.R.y + 20 } };
    // наклон к Юсуфу — разговор на уровне его глаз
    const toYusuf = [7, 9, 10, 12, 20, 22, 32, 33].some((id) => speaking(id, t, 10)) || (speakerOf(t) === "yusuf" && scene(t) !== "s1");
    const leanK = toYusuf ? 1 : 0;
    const leanS = soft01(t, (x) => ([7, 9, 10, 12, 20, 22, 32, 33].some((id) => speaking(id, x, 10)) || speakerOf(x) === "yusuf" ? 1 : 0), 10);
    void leanK;
    const lean = 11 * leanS;
    const lookY = 0.1 + 0.16 * leanS;
    if (inPause(t)) return { ...base, expr: "listening", lean: 0, lookY: 0.05, headTilt: 3 * Math.sin(((t - (tl.pauses.find((x) => t / FPS >= x.from - 0.05)?.from ?? 0) * FPS) / FPS) * 0.5) };
    // объясняющий жест — спокойная открытая ладонь правой руки поднимается
    // над столешницей, в сторону картинки (не перекрывает ни Билала, ни
    // Юсуфа); колено и кисть в покое закрыты столом — учитель сидит за его
    // левым краем
    const gestureIds: readonly number[] = [7, 12, 14, 20, 22];
    for (const id of gestureIds) {
      const l = L(id);
      if (t >= l.from - 4 && t <= l.to + 10) {
        const k = win(t, l.from + sec(0.3), l.to - sec(0.2), 16) * (id === 14 ? 0.95 : 0.85);
        const lift = 10 * Math.sin(Math.PI * clamp((t - l.from) / Math.max(1, l.to - l.from)));
        // локоть опущен под плечо, предплечье вынесено вперёд-вбок, ладонь
        // открыта на уровне пояса — над столешницей
        const open: Vec = { x: p.x + 0.19 * p.h, y: TABLE.top - TABLE_PLANE.fs * TABLE_PLANE.depth - 76 - lift };
        return { ...base, expr: id === 20 ? "calm" : "softSmile", lean, lookY, armR: arm(mixV(lap.R, open, k), k > 0.25 ? "open" : "relax", k > 0.05 ? "hang" : "in") };
      }
    }
    // «Да.» — короткий кивок с улыбкой
    if (speaking(9, t, 6)) {
      const u = clamp((t - L(9).from + 4) / 16);
      return { ...base, expr: "smile", lean, lookY, nod: 6 * Math.sin(Math.PI * u) };
    }
    if (speaking(5, t) || speaking(15, t) || speaking(23, t)) return { ...base, expr: "curious", lookY: 0.04, lean: 0 };
    if (speaking(18, t, 8) || speaking(32, t, 8)) return { ...base, expr: "smile", lean, lookY };
    const sp = speakerOf(t);
    if (sp && sp !== "muhammad") return { ...base, expr: "listening", lean, lookY };
    if (t >= mTurn.from && t < mWatch.to) return { ...base, expr: "softSmile", lookY: 0.5, lean: 6 };
    if (t >= mPull.from) return { ...base, expr: "softSmile", lookY: 0.1 };
    return { ...base, lean, lookY };
  };
  // плавная доля 0…1 по окну ±w кадров (вход и выход наклона без рывков)
  function soft01(t: number, fn: (x: number) => number, w: number) {
    let acc = 0;
    let n = 0;
    for (let k = -w; k <= w; k += 2) {
      acc += fn(t + k);
      n++;
    }
    return smoothstep(acc / n);
  }

  // ---------- Юсуф ----------
  const yFace = (t: number) => {
    const x = SEAT.yusuf.x;
    const toT = t < mSit.to ? faceTo(teacherPos(t).x, x, 1.6) : faceTo(SEAT.teacher.x, x, 3.2);
    const toA = faceTo(amirX(t), x, 2.6);
    const toB = faceTo(SEAT.bilal.x, x, 1.5);
    const sp = speakerOf(t);
    // работа с картинкой: взгляд на детали (немного в сторону детали в руке)
    if (t < mStudy.from) return 0.02;
    if (t < mStudy.to) return lerp(0.02, 0.18, smoothstep(seg(t, mStudy.from + sec(1.0), mStudy.from + sec(1.8))));
    if (t < mLook.to) return t < mTake.to ? 0.16 : 0.0;
    if (speaking(1, t)) return 0.0;
    if (t < L(2).from - 2) return lerp(0, toA * 0.8, smoothstep(seg(t, L(1).to + sec(0.6), L(2).from)));
    if (speaking(2, t) || speaking(3, t)) return toA;
    if (t < L(4).from) return lerp(toA, toT, smoothstep(seg(t, mTurnT.from, mTurnT.from + sec(0.7))));
    if (speaking(4, t)) return toT;
    if (t < mSit.to) return toT;
    if (t >= mCalm.from && t < mCalm.to) return lerp(toT, 0.02, smoothstep(seg(t, mCalm.from + sec(0.5), mCalm.from + sec(1.4))));
    if (t >= mNotDone.from && t < mHeadUp.to) return t < mHeadUp.from + sec(0.4) ? 0.0 : toT;
    // на «Я покажу» Амира поворачивается к нему, затем снова к детали
    if (speaking(24, t)) return t < L(24).from + (L(24).to - L(24).from) * 0.7 ? toA : 0.12;
    if (t >= mBack.from && t < l25.from) return t < mBack.from + sec(0.3) ? toT : t < mTakeLeaf.from + sec(0.6) ? 0.24 : 0.12;
    if (speaking(25, t)) return toA;
    if (t >= mAmirLook.from && t < r0 + RT.free) return t < mAmirLook.from + sec(0.4) ? toA * 0.5 : 0.06;
    if (t >= r0 + RT.free && t < mTurn.to) return 0.02;
    if (speaking(27, t)) return toA * 0.4;
    if (speaking(28, t)) return toB;
    if (t >= mTwo.from && t < mDone.to) return t < mTwo.from + sec(0.9) ? -0.14 : t < mTwo.to ? -0.1 : -0.08;
    if (speaking(29, t)) return 0.0;
    // после «Я собрал!» — один поворот к Амиру, который сейчас его похвалит
    if (t > L(29).to && t < L(30).from) return lerp(0.0, toA, smoothstep(seg(t, L(29).to + sec(0.25), L(29).to + sec(0.75))));
    if (speaking(30, t)) return toA;
    if (speaking(31, t)) {
      const l = L(31);
      return t < l.from + (l.to - l.from) * 0.5 ? toA : toB;
    }
    if (t >= mEdge.from && t < mEdge.to) return -0.02;
    // смотрит на Амира, затем на коробку (она между ним и Амиром), потом ставит её у картинки
    if (t >= mBox.from && t < mBox.to) return t < mBox.from + sec(1.5) ? toA : t < boxSet ? toA * 0.45 : 0.12;
    if (sp === "muhammad") return toT;
    if (sp === "amir") return toA;
    if (sp === "bilal") return toB;
    if (inPause(t)) return t >= p3.from ? 0.04 : toT * 0.7;
    if (t >= mPull.from) return 0.02;
    return toT * 0.8;
  };
  // мимика: заинтересованность → затруднение → тихая просьба → любопытство →
  // понимание → усердие → радость
  const yPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const p = yusufP;
    const hL = yHand("R", t); // правая рука Юсуфа — слева в кадре (armL)
    const hR = yHand("L", t);
    const lap = lapOf(p);
    const armOf = (h: HandState, lapW: Vec): WorldArm => (h.lap > 0.98 ? { target: lapW, shape: "relax", elbow: "in", behind: true } : onBoxWall(t, h) ? arm(roomHand(h, lapW, 0), "open", "out") : h.lap > 0.5 ? { ...arm(roomHand(h, lapW), roomShape(h), "auto"), behind: true } : arm(roomHand(h, lapW), roomShape(h), "auto"));
    const arms = { armL: armOf(hL, lap.L), armR: armOf(hR, lap.R) };
    const front = hL.lap < 0.6 || hR.lap < 0.6;
    const base: PoseIn = { floorSit: 1, expr: "listening", ...arms, lookY: -0.12, turnBody: 0.45 };
    const onPuzzle = (look: number, e: ExprId | Expression = "focused", extra: PoseIn = {}): { pose: PoseIn; front: boolean } => ({ pose: { ...base, expr: e, lookY: Math.min(1, look * 1.4), lean: 6, nod: 14 * clamp((look - 0.2) / 0.4), ...extra }, front });
    // сцена 1
    if (t < mStudy.from) return onPuzzle(0.62, EX(1, 2.5, 0.16, 0.12));
    if (t < mTake.from) return onPuzzle(0.6, "curious", { lookX: t < mStudy.from + sec(1.2) ? -0.1 : 0.2 });
    if (t < mTry.from + sec(1.2)) return onPuzzle(0.62, "focused");
    if (t < mTry.to) {
      // не подходит: небольшое затруднение, брови чуть сведены
      const k = smoothstep(seg(t, bump1, bump1 + sec(0.5)));
      return onPuzzle(0.62, EX(lerp(-0.5, 5, k), lerp(1.5, -1, k), 0.14, lerp(0.08, -0.12, k)), { headTilt: -3 * k });
    }
    if (t < mAside.to) return onPuzzle(0.6, EX(4, 0.5, 0.12, -0.06), { headTilt: -2 });
    if (t < L(1).from - 4) return onPuzzle(0.5, EX(4, 1, 0.12, -0.04), { lean: 3, headTilt: -2 });
    if (speaking(1, t, 6)) return onPuzzle(0.42, EX(4, 2.5, 0.1, 0.06), { lean: 2, headTilt: -3 }); // тихо, почти про себя, искренне
    if (t < L(2).from) return onPuzzle(0.3, EX(3, 1, 0.16, 0.0), { lean: 1 });
    if (speaking(2, t)) return { pose: { ...base, expr: EX(3, 2, 0.1, 0.05), lookY: -0.05 }, front };
    if (speaking(3, t)) return { pose: { ...base, expr: EX(4, 1.5, 0.16, 0.18), lookY: 0.05, headTilt: -2 }, front };
    if (t < L(4).to + 6) return { pose: { ...base, expr: "curious", lookY: -0.3, headTilt: speaking(4, t) ? -4 : -2 }, front };
    // сцена 2
    if (t < p1.from) return { pose: { ...base, expr: "curious", lookY: t < mWalk.to ? -0.32 : -0.22 }, front };
    if (inPause(t) && t < p1.to) return { pose: { ...base, expr: EX(2, 3, 0.1, 0.1), lookY: -0.18, lookX: Math.sin((t - p1.from) / 40) * 0.25 }, front };
    // после паузы слушает ответ Билала и учителя — смотрит на говорящего
    if (t >= p1.to && t < L(8).from - 4) return { pose: { ...base, expr: EX(3, 2.5, 0.06, 0.15), lookY: speaking(7, t, 0) ? -0.22 : -0.12, headTilt: 2 }, front };
    if (speaking(8, t)) return { pose: { ...base, expr: EX(7, 6, 0, 0.12), lookY: -0.2, headTilt: -3 }, front }; // «Даже тихо-тихо?» — брови вверх
    if (t >= L(9).from - 4 && t < mCalm.to) {
      const k = smoothstep(seg(t, L(9).to, L(9).to + sec(0.8)));
      return { pose: { ...base, expr: EX(lerp(6, 2, k), lerp(5, 3, k), 0.1, lerp(0.2, 0.7, k)), lookY: lerp(-0.2, 0.5, smoothstep(seg(t, mCalm.from + sec(0.6), mCalm.from + sec(1.4)))) }, front };
    }
    // сцена 3
    if (speaking(11, t)) return { pose: { ...base, expr: EX(5, 5, 0.04, 0.55), lookY: -0.24, lean: 5 }, front }; // оживился
    if (scene(t) === "s3") return { pose: { ...base, expr: t > L(11).to && t < L(12).to + 20 ? EX(2, 3, 0.1, 0.5) : "listening", lookY: -0.2 }, front };
    // сцена 4
    if (inPause(t) && t < p2.to) {
      const u = (t - p2.from) / (p2.to - p2.from);
      // думает: смотрит на детали, потом поднимает взгляд
      return { pose: { ...base, expr: "thinking", lookY: u < 0.5 ? 0.5 : -0.25, lookX: u < 0.5 ? 0.2 : 0 }, front };
    }
    if (speaking(16, t)) return { pose: { ...base, expr: EX(3, 1.5, 0.2, 0.22), lookY: 0.05 }, front };
    if (speaking(17, t) || speaking(18, t, 10)) return { pose: { ...base, expr: "softSmile", lookY: -0.1 }, front };
    if (scene(t) === "s4") return { pose: { ...base, expr: "softSmile", lookY: 0.2 }, front };
    // сцена 5
    if (t < mHeadUp.from) return onPuzzle(0.6, EX(2, 1, 0.15, 0.02));
    if (t < L(19).to + 6) return { pose: { ...base, expr: speaking(19, t) ? EX(5, 4, 0.06, -0.02) : "curious", lookY: -0.22, headTilt: -2 }, front };
    if (t < L(22).to + 6) return { pose: { ...base, expr: speaking(20, t) || speaking(22, t) ? EX(3, 1, 0.16, 0.05) : "listening", lookY: -0.22 }, front }; // задумчиво → понимает
    if (t < mExam.to) {
      const k = smoothstep(seg(t, mBack.from, mBack.to));
      return onPuzzle(lerp(-0.1, 0.62, k), k > 0.5 ? "focused" : EX(2, 1, 0.14, 0.1), { lookX: t >= mExam.from ? 0.15 : 0 });
    }
    // сцена 6
    if (inPause(t) && t >= p3.from) return onPuzzle(0.58, "focused", { lean: 5, lookX: Math.sin((t - p3.from) / 45) * 0.2 });
    if (speaking(23, t)) return onPuzzle(0.5, "listening");
    if (speaking(24, t)) return { pose: { ...base, expr: "listening", lookY: t < L(24).from + (L(24).to - L(24).from) * 0.7 ? -0.05 : 0.45 }, front };
    if (speaking(25, t)) return { pose: { ...base, expr: "curious", lookY: 0.2, headTilt: -3 }, front };
    if (t < mTurn.from) return onPuzzle(0.5, "focused");
    if (t < r0 + RT.free) {
      // смотрит на веточку детали → на край картинки → поворачивает и соединяет
      const lx = t < r0 + RT.look2 ? 0.25 : t < r0 + RT.hand2 ? -0.25 : 0;
      return onPuzzle(0.66, "focused", { lookX: lx, lean: 7 });
    }
    if (t < L(27).from) return onPuzzle(0.62, EX(2, 2.5, 0.1, lerp(0.1, 0.5, seg(t, r0 + RT.free + sec(0.2), r0 + RT.free + sec(1.1)))));
    if (speaking(27, t, 8)) return { pose: { ...base, expr: EX(4, 5, 0.04, 0.85), lookY: 0.3 }, front };
    if (speaking(28, t)) return { pose: { ...base, expr: "smile", lookY: -0.05 }, front };
    // сцена 7
    if (t < mDone.from) return onPuzzle(0.62, "focused", { lookX: t < m5.from ? (t < mTwo.from + sec(0.9) ? 0.2 : -0.2) : 0 });
    if (t < L(29).from) return onPuzzle(0.6, EX(3, 3, 0.08, lerp(0.2, 0.8, seg(t, mDone.from + sec(0.4), mDone.to))));
    if (speaking(29, t, 10) || (t > L(29).to && t < L(30).from)) return { pose: { ...base, expr: EX(5, 6, 0.02, 1), lookY: -0.05 }, front }; // «Я собрал!» — сияет
    if (scene(t) === "s7" && t < mEdge.from) return { pose: { ...base, expr: "smile", lookY: -0.05 }, front };
    if (t < mEdge.to) return onPuzzle(0.62, EX(2, 2, 0.12, 0.75), { lean: 5 });
    // сцена 8
    if (speaking(34, t)) return { pose: { ...base, expr: EX(2, 2, 0.1, 0.45), lookY: -0.2 }, front };
    if (speaking(37, t, 8)) return { pose: { ...base, expr: "smile", lookY: -0.05 }, front };
    if (t >= mBox.from + sec(1.4) && t < mBox.to) return onPuzzle(0.45, "softSmile");
    if (t >= mPull.from) return { pose: { ...base, expr: "smile", lookY: 0.4 }, front };
    return { pose: { ...base, expr: "listening" }, front };
  };
  type ExprId = "neutral" | "smile" | "softSmile" | "worried" | "thinking" | "curious" | "listening" | "focused" | "calm" | "surprised";

  // ---------- Амир ----------
  const aFace = (t: number) => {
    const x = amirX(t);
    const toY = faceTo(SEAT.yusuf.x, x, 2.6);
    const toT = faceTo(SEAT.teacher.x, x, 2.2);
    const toB = faceTo(SEAT.bilal.x, x, 1.6);
    const sp = speakerOf(t);
    if (t < mAmirUp.from) return 0.05; // читает книгу перед собой
    if (t < L(3).to + 6) return toY;
    if (t >= mScoot.from && t < mScoot.to) return t < mScoot.from + sec(0.6) ? 0.05 : toY * 0.9;
    if (speaking(17, t)) {
      const l = L(17);
      return t > l.from + (l.to - l.from) * 0.55 ? toY : toT;
    }
    if (t >= mLean.from && t < r0 + RT.free) return t < mAmirLook.from ? toY : toY * 0.55; // смотрит на картинку
    if (speaking(24, t)) return toY;
    if (speaking(30, t) || speaking(36, t)) return toY;
    if (t >= mTwo.from && t < mDone.to) return toY * 0.6;
    if (t >= mBox.from && t < mBox.to) return t < boxAmirFree ? toY * 0.5 : toY;
    if (sp === "muhammad") return toT;
    if (sp === "yusuf") return toY;
    if (sp === "bilal") return toB;
    if (inPause(t)) return t >= p3.from ? toY * 0.55 : toT;
    return toT * 0.8;
  };
  const aPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const p = amirPlace(t);
    const lap = lapOf(p);
    const hR = aHand("R", t); // правая рука Амира — слева в кадре (armL)
    const hL = aHand("L", t);
    const armOf = (h: HandState, lapW: Vec): WorldArm => (h.lap > 0.98 ? { target: lapW, shape: "relax", elbow: "in", behind: true } : onBoxWall(t, h) ? arm(roomHand(h, lapW, 0), "open", "out") : h.lap > 0.5 ? { ...arm(roomHand(h, lapW), roomShape(h), "auto"), behind: true } : arm(roomHand(h, lapW), roomShape(h), "auto"));
    let armL = armOf(hR, lap.L);
    let armR = armOf(hL, lap.R);
    let front = hR.lap < 0.6 || hL.lap < 0.6;
    // читает книгу на столе: руки по краям раскрытой книги
    if (t < mScoot.from + sec(0.6)) {
      const b = planeToRoom(TABLE.top, AMIR_BOOK.u, AMIR_BOOK.w, 0);
      const close = seg(t, mScoot.from + sec(0.1), amirBookClose);
      const away = easeInOut(seg(t, amirBookClose, mScoot.from + sec(0.6)));
      const raise = t >= mAmirUp.from ? 0.25 : 0;
      armL = arm(mixV({ x: b.x - 24 + 12 * close, y: b.y - 12 - raise * 4 }, lap.L, away), "open", "auto");
      armR = arm(mixV({ x: b.x + 24, y: b.y - 12 - raise * 4 }, lap.R, away), "open", "auto");
      front = away < 0.6;
    }
    // сдвиг к Юсуфу: опора на руки по бокам, корпус вперёд
    const scoot = win(t, scootA.from - 4, scootB.to + 2, 6);
    if (scoot > 0.01) {
      const sL = { x: p.x - 0.2 * p.h, y: p.y - 0.02 * p.h };
      const sR = { x: p.x + 0.2 * p.h, y: p.y - 0.02 * p.h };
      armL = arm(mixV(lap.L, sL, scoot), "open", "out");
      armR = arm(mixV(lap.R, sR, scoot), "open", "out");
    }
    const base: PoseIn = { floorSit: 1, expr: "listening", armL, armR, lookY: -0.1, lean: 8 * scoot, turnBody: 0.45 };
    if (t < mAmirUp.from) return { pose: { ...base, expr: "focused", lookY: 0.75, lean: 7, nod: 12 }, front }; // читает: голова наклонена к книге
    if (t < L(2).from) return { pose: { ...base, expr: EX(3, 3, 0.08, 0.15), lookY: lerp(0.5, -0.05, smoothstep(seg(t, mAmirUp.from, mAmirUp.from + sec(0.5)))), lean: 3 }, front };
    if (speaking(2, t)) return { pose: { ...base, expr: EX(4, 4, 0.06, 0.25), lookY: -0.05, headTilt: 3 }, front };
    if (speaking(3, t)) return { pose: { ...base, expr: "softSmile", lookY: 0 }, front };
    if (t >= mScoot.from && t < mScoot.to) return { pose: { ...base, expr: "softSmile", lookY: 0.1 }, front };
    if (speaking(17, t)) return { pose: { ...base, expr: EX(2, 2, 0.12, 0.4), lookY: -0.05 }, front };
    if (t >= mLean.from && t < r0 + RT.rot0) return { pose: { ...base, expr: speaking(24, t) || speaking(26, t) ? "softSmile" : "focused", lookY: 0.55, lean: 9 }, front };
    if (speaking(24, t)) return { pose: { ...base, expr: "softSmile", lookY: 0.1, lean: 4 }, front };
    if (t >= r0 + RT.rot0 && t < mTurn.to) return { pose: { ...base, expr: "listening", lookY: 0.55, lean: 6 }, front };
    if (speaking(27, t, 10)) return { pose: { ...base, expr: "smile", lookY: 0.2 }, front };
    if (inPause(t)) return { pose: { ...base, expr: t >= p3.from ? "focused" : "neutral", lookY: t >= p3.from ? 0.5 : -0.05 }, front };
    if (t >= mTwo.from && t < mDone.to) return { pose: { ...base, expr: "softSmile", lookY: 0.5 }, front };
    if (speaking(30, t)) return { pose: { ...base, expr: "smile", lookY: -0.02 }, front };
    if (speaking(31, t, 10)) return { pose: { ...base, expr: "smile", lookY: -0.02 }, front };
    if (speaking(36, t)) return { pose: { ...base, expr: "softSmile", lookY: -0.05 }, front };
    if (t >= mBox.from && t < mBox.to) return { pose: { ...base, expr: "softSmile", lookY: 0.4, lean: 5 }, front };
    if (t >= mPull.from) return { pose: { ...base, expr: "smile", lookY: 0.3 }, front };
    return { pose: base, front };
  };

  // ---------- Билал ----------
  const bFace = (t: number) => {
    const x = SEAT.bilal.x;
    const toT = t < mSit.to ? faceTo(teacherPos(t).x, x, 2) : faceTo(SEAT.teacher.x, x, 2.2);
    const toY = faceTo(SEAT.yusuf.x, x, 1.5);
    const toA = faceTo(amirX(t), x, 1.3);
    const sp = speakerOf(t);
    if (t < mBook.from) return t >= L(4).from ? toY * 0.7 : 0.08; // читает
    if (t < mBook.to) return -0.3; // кладёт книгу слева
    if (speaking(28, t)) return toY;
    if (speaking(35, t)) return toY * 0.8;
    if (sp === "muhammad") return toT;
    if (sp === "yusuf") return toY;
    if (sp === "amir") return toA;
    if (inPause(t)) return toT;
    if (t >= mTurn.from && t < mDone.to) return toY;
    return toT * 0.9;
  };
  const bPoseEx = (t: number): PoseIn => {
    const p = bilalP;
    const lap = lapOf(p);
    const b = bilalBook(t);
    const base: PoseIn = { floorSit: 1, expr: "listening", ...lapArms(p), lookY: -0.08, turnBody: 0.45 };
    if (b.where === "hands") {
      // книга в руках: кисти по бокам книги; страница — правая рука
      const w = (BILAL_BOOK_W / 2) * (0.5 + 0.5 * b.open) + 3;
      const flipK = b.flip;
      const hl: Vec = { x: b.pos.x - w, y: b.pos.y + 6 };
      const hr: Vec = { x: b.pos.x + w - flipK * w * 1.2, y: b.pos.y + 6 - flipK * 10 };
      const reading = t < mBook.from;
      const look = reading ? (t >= L(4).from ? 0.0 : 0.5) : 0.3;
      // локти опущены вдоль корпуса (не разведены в стороны)
      return { ...base, expr: reading ? "focused" : "calm", armL: arm(hl, "pinch", "auto"), armR: arm(hr, flipK > 0.2 ? "open" : "pinch", "auto"), lookY: look };
    }
    if (t < mBook.to + sec(0.5)) {
      const u = easeInOut(seg(t, mBook.to - sec(0.1), mBook.to + sec(0.5)));
      return { ...base, armL: arm(mixV({ x: BILAL_BOOK_DOWN.x + 8, y: BILAL_BOOK_DOWN.y - 4 }, lap.L, u), "open", "out"), lookY: 0.1 };
    }
    if (speaking(6, t)) return { ...base, expr: EX(1, 2, 0.12, 0.25), lookY: -0.05 };
    if (speaking(13, t) || speaking(21, t)) return { ...base, expr: speaking(21, t) ? "thinking" : "curious", lookY: -0.05, lean: 3 };
    if (speaking(28, t)) return { ...base, expr: "smile", lookY: 0.05, lean: 4 };
    if (speaking(35, t)) return { ...base, expr: "softSmile", lookY: 0 };
    if (speaking(31, t, 10)) return { ...base, expr: "smile", lookY: 0 };
    if (inPause(t)) return { ...base, expr: t < p1.to ? "thinking" : "neutral", lookY: -0.02 };
    if (t >= mTurn.from && t < mDone.to) return { ...base, expr: "softSmile", lookY: 0.3 };
    if (t >= mPull.from) return { ...base, expr: "softSmile", lookY: 0.1 };
    return base;
  };

  // ---------- фон класса ----------
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
      const px = pos.x - 0.06 * pl.h + (drawing ? ((local / (period * 0.7)) * 0.12 * pl.h) : 0.06 * pl.h);
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
  const tableX = SEAT.yusuf.x;
  const bg = (p: CastPupil): Ctl => {
    const base = bgPlace(p);
    const plan = p.plan!;
    const seed = p.seed;
    // время от времени поднимает голову и смотрит на стол у окна (по своему расписанию)
    const period = 260 + Math.floor(hash01(seed + 6) * 260);
    const off = Math.floor(hash01(seed + 7) * period);
    const glanceLen = 40 + Math.floor(hash01(seed + 8) * 40);
    // после слов «о хорошем: об учении, здоровье…» часть класса с интересом
    // поднимает головы (каждый со своей задержкой)
    const curious = hash01(seed + 9) > 0.35;
    const lag = Math.floor(hash01(seed + 10) * 20);
    const listenWin = (t: number) => (curious ? win(t, L(14).from + sec(1.0) + lag, mListen.to + sec(0.6) + lag, 12) : 0);
    const glance = (t: number) => {
      const local = (t + off) % period;
      const g = plan.activity === "listen" ? 1 : local < glanceLen ? smoothstep(local / 10) * smoothstep((glanceLen - local) / 10) : 0;
      return Math.max(g, listenWin(t));
    };
    return {
      place: () => base,
      face: (t) => lerp(Math.sin((t + seed * 13) / 170) * 0.08, faceTo(tableX, base.x, 1.2), glance(t)),
      pose: (t) => {
        const it = bgItem(p, t);
        const g = glance(t);
        const lap = lapOf(base);
        let armL: WorldArm = { target: lap.L, shape: "relax", elbow: "in" };
        let armR: WorldArm = { target: lap.R, shape: "relax", elbow: "in" };
        let lookY = lerp(0.55, -0.05, g);
        let lean = 0;
        if (it.kind === "book") {
          // книга на коленях, локти опущены вдоль корпуса
          armL = arm({ x: it.pos.x - it.w * 0.5, y: it.pos.y + 6 }, "pinch", "auto");
          armR = arm({ x: it.pos.x + it.w * 0.5 - it.flip * it.w * 0.6, y: it.pos.y + 6 - it.flip * 8 }, it.flip > 0.2 ? "open" : "pinch", "auto");
        } else if (it.kind === "notebook" && it.pencil) {
          armL = arm({ x: it.pos.x - it.w * 0.32, y: it.pos.y - 4 }, "open", "auto");
          armR = arm({ x: it.pencil.x + 6, y: it.pencil.y - 2 }, "pinch", "auto");
          lookY = lerp(0.75, 0.0, g);
          lean = 9 * (1 - g);
        } else if (it.kind === "cards") {
          armL = arm({ x: it.pos.x, y: it.pos.y + 10 }, "pinch", "auto");
        } else {
          lookY = -0.05;
        }
        // занят своим делом — голова наклонена к книге/тетради; поднимает голову, когда смотрит на стол у окна
        const nod = it.kind === "none" ? 0 : lerp(it.kind === "notebook" ? 18 : 14, 0, g);
        lookY = lerp(0.95, lookY, g);
        return { floorSit: 1, expr: g > 0.5 ? "listening" : "focused", armL, armR, lookY, lean, nod, turnBody: 0.45 };
      },
      front: () => true,
    };
  };

  return {
    teacher: { place: teacherPlace, face: (t) => tFace(t) * 0.7, pose: (t) => awake({ ...tPoseEx(t), lookX: (tPoseEx(t).lookX ?? 0) + clamp(tFace(t) * 0.45, -0.32, 0.32) }), front: () => false },
    // у Юсуфа низкая чёлка: высоко поднятые брови уходили бы под неё
    yusuf: { place: () => yusufP, face: yFace, pose: (t) => browsUnderFringe(awake(yPoseEx(t).pose), 3), front: (t) => yPoseEx(t).front },
    amir: { place: amirPlace, face: aFace, pose: (t) => awake(aPoseEx(t).pose), front: (t) => aPoseEx(t).front },
    bilal: { place: () => bilalP, face: bFace, pose: (t) => awake(bPoseEx(t)), front: () => true },
    bg,
    bgItem,
    piece,
    pieces,
    yHand,
    aHand,
    box,
    bilalBook,
    amirBook,
    placedAt,
    events,
  };
};

// Для тестов: собранные к кадру детали (ID).
export const placedIds = (ch: Choreo, t: number): PieceId[] => PIECES.filter((p) => ch.piece(p.id, t).placed).map((p) => p.id);
