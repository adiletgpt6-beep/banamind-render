// Хореография фильма 80-1-10 в плане комнаты: для учителя, трёх главных
// мальчиков и 22 учеников — функции кадра → место, взгляд и поза (руки,
// мимика, посадка); предметы в руках. Все моменты — из плана реквизита
// (plan.ts) и плана лодочки (boatPlan.ts), а они — из шкалы озвучки.
// Всё детерминированно по номеру кадра (без накопителей и таймеров).
import type { Place, PoseIn, WorldArm } from "../rig/Actor";
import { heightForAge } from "../characters/characterConfig.ts";
import { clamp, easeInOut, glide, hash01, lerp, lerpV, smoothstep, type Vec } from "../rig/motion.ts";
import { depth } from "../sets/roomLayout.ts";
import type { BoatPlan } from "./boatPlan.ts";
import { BOAT_LENGTH_MM, boatLocalToWorld, type BoatPlace } from "./boatModel.ts";
import { boatTip, captionTip, drawingTip } from "./drawingPaths.ts";
import { AMIR_NEAR_YUSUF, AT_BOARD, AT_TABLE, CARD_MM, CARD_UNITS, cellCenter, DESK, deskToWorld, DESK_FS, MM, POSTER, POSTER_ON_BOARD, POSTER_ON_DESK, posterToDesk, TABLE } from "./layout.ts";
import { sec, seg, type Plan } from "./plan.ts";
import { textCardSlot, titleTip } from "./posterText.ts";
import { BIRD_OWNER, classRoster, rosterById, type RosterEntry } from "./roster.ts";

export type Ctl = {
  readonly place: (t: number) => Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  readonly armsFront: (t: number) => boolean;
};

type Shape = NonNullable<WorldArm["shape"]>;
type Key = readonly [number, Vec, Shape?];

// ---------- общие помощники ----------
const arm = (target: Vec, shape: Shape = "open", elbow: WorldArm["elbow"] = "out"): WorldArm => ({ target, shape, elbow });
const lapOf = (p: Place) => ({ L: { x: p.x - 0.13 * p.h, y: p.y - 0.06 * p.h }, R: { x: p.x + 0.13 * p.h, y: p.y - 0.06 * p.h } });
const lapArms = (p: Place): { armL: WorldArm; armR: WorldArm } => {
  const l = lapOf(p);
  return { armL: { target: l.L, shape: "relax", elbow: "in" }, armR: { target: l.R, shape: "relax", elbow: "in" } };
};
const faceTo = (targetX: number, x: number, k = 760) => clamp((targetX - x) / k, -0.85, 0.85);
const win = (t: number, from: number, to: number, edge = 8) => smoothstep((t - from) / edge) * (1 - smoothstep((t - to) / edge));
// Рука по ключам [кадр, точка, форма кисти]; вне ключей — null.
const follow = (t: number, ks: readonly Key[]): { target: Vec; shape: Shape } | null => {
  if (!ks.length || t < ks[0][0] || t > ks[ks.length - 1][0]) return null;
  for (let i = 1; i < ks.length; i++) {
    const [t1, p1] = ks[i];
    const [t0, p0, s0] = ks[i - 1];
    if (t <= t1) {
      const u = t1 <= t0 ? 1 : easeInOut((t - t0) / (t1 - t0));
      return { target: lerpV(p0, p1, u), shape: s0 ?? "open" };
    }
  }
  const last = ks[ks.length - 1];
  return { target: last[1], shape: last[2] ?? "relax" };
};
// Точка стола (мм) → мир; точка плаката (мм) → мир.
const deskW = (u: number, v: number) => deskToWorld(u, v);
const posterW = (p: Vec) => {
  const d = posterToDesk(p);
  return deskToWorld(d.x, d.y);
};
// Карточка (единицы рисунка) на столе → мир (карточка лежит, сжата по глубине).
const cardPointW = (center: Vec, u: number, v: number): Vec => ({ x: center.x + ((u - CARD_UNITS.w / 2) / CARD_UNITS.w) * CARD_MM.w * MM, y: center.y + ((v - CARD_UNITS.h / 2) / CARD_UNITS.h) * CARD_MM.h * MM * DESK_FS });
// Запястье — чуть ближе к телу, чем кончик пальцев/карандаша.
const wristFor = (tip: Vec, p: Place, k = 0.035) => ({ x: tip.x + (p.x - tip.x) * 0.06, y: tip.y + k * p.h });

const heightAt = (age: number, y: number) => heightForAge(age) * depth(y);
const teacherAt = (x: number, y: number): Place => ({ x, y, h: 760 * depth(y) });
const kidAt = (id: string, x: number, y: number): Place => ({ x, y, h: heightAt(rosterById(id).age, y) });

export type HeldItem =
  | { readonly type: "card"; readonly id: string; readonly pos: Vec; readonly squash: number; readonly rot: number }
  | { readonly type: "stack"; readonly pos: Vec; readonly count: number }
  | { readonly type: "textCard"; readonly which: "one" | "two"; readonly pos: Vec; readonly back: boolean; readonly squash: number }
  | { readonly type: "pencil"; readonly tip: Vec; readonly color: string; readonly angle: number }
  | { readonly type: "marker"; readonly tip: Vec; readonly capOff: boolean; readonly angle: number }
  | { readonly type: "poster"; readonly center: Vec; readonly lift: number };

export type Choreo = ReturnType<typeof buildChoreo>;

// Точки, где учитель держит поднятый лист: боковые края, на четверть выше центра.
export const posterGrips = (center: Vec, lift: number): [Vec, Vec] => {
  const W = POSTER.w * MM;
  const h = POSTER.h * MM * (DESK_FS + (1 - DESK_FS) * lift);
  return [
    { x: center.x - W / 2 + 3, y: center.y - h * 0.25 },
    { x: center.x + W / 2 - 3, y: center.y - h * 0.25 },
  ];
};

export const buildChoreo = (pl: Plan, bp: BoatPlan) => {
  const { L, M } = pl;
  const speakingNow = (t: number) => {
    for (const id of Array.from({ length: 44 }, (_, i) => i + 1)) {
      const l = L(id);
      if (t >= l.from - 4 && t <= l.to + 6) return id;
    }
    return null;
  };
  const roleOf = (id: number) => (([1, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 26, 31, 38, 40] as const).includes(id as 1) ? "muhammad" : ([2, 7, 15, 17, 19, 23, 25, 29, 33, 35, 39, 41, 44] as const).includes(id as 2) ? "yusuf" : ([3, 9, 13, 24, 28, 30, 32, 34, 36, 42] as const).includes(id as 3) ? "amir" : "bilal");
  const speakerAt = (t: number) => {
    const id = speakingNow(t);
    return id ? roleOf(id) : null;
  };
  const speaking = (id: number, t: number, pad = 4) => t >= L(id).from - pad && t <= L(id).to + pad;
  const inPause = pl.inPause;

  // ---------- ключевые отрезки ----------
  const s1 = M("общий план: лист");
  const deal = pl.deal;
  const lay = pl.lay;
  const titleDone = M("заголовок готов");
  const bird = M("птица от ученика");
  const textOne = M("карточка «Аллах Един»");
  const folder = M("Юсуф и папка");
  const textTwo = M("карточка «У Аллаха нет начала»");
  const toTree = M("лодочка к карточке");
  const take6 = M("Юсуф берёт лодочку");
  const sitNear = M("Амир садится рядом");
  const boatDraw = M("рисуем лодочку");
  const amirCard = M("карточка Амира");
  const pass = M("сборка: карточки передают");
  const gridDone = M("сетка готова");
  const lift = M("учитель поднимает лист");
  const toBoard = M("к доске");
  const hang = M("крепит на доске");
  const final = M("финал: общий план");
  const p4 = pl.pauses.find((p) => p.id === "pause04")!;

  // ---------- точки на столе (мир) ----------
  const spotW = { yusuf: deskW(DESK.drawYusuf.x, DESK.drawYusuf.y), amir: deskW(DESK.drawAmir.x, DESK.drawAmir.y), bilal: deskW(DESK.drawBilal.x, DESK.drawBilal.y) };
  const trayW = (id: "yusuf" | "amir" | "bilal" | "boat") => deskW(DESK.pencilTray.x + (id === "yusuf" ? 38 : id === "amir" ? -8 : id === "bilal" ? -50 : 14), DESK.pencilTray.y);
  const cellW = (r: RosterEntry) => posterW(cellCenter(r.cell.row, r.cell.col));
  const folderW = deskW(DESK.folder.x, DESK.folder.y);
  const stackW = deskW(DESK.textStack.x, DESK.textStack.y);
  const markerW = deskW(DESK.marker.x, DESK.marker.y);
  const tapeW = deskW(DESK.tapeHolder.x, DESK.tapeHolder.y);
  const slotW = (w: "one" | "two") => posterW(textCardSlot(w));
  const posterCenterW = deskW(POSTER_ON_DESK.u0 + POSTER.w / 2, POSTER_ON_DESK.v0 + POSTER.h / 2);
  const cornerBL = deskW(POSTER_ON_DESK.u0 + 30, POSTER_ON_DESK.v0 + 40);
  const cornerBR = deskW(POSTER_ON_DESK.u0 + POSTER.w - 30, POSTER_ON_DESK.v0 + 40);
  const BOAT_W = BOAT_LENGTH_MM * MM; // ширина лодочки в комнате, px (≈ 72)
  // место лодочки в комнате: точка контакта на столе + подъём, наклон и ось
  // наклона из плана лодочки (те же, что в крупном плане)
  const boatPlace = (t: number): BoatPlace => {
    const d = bp.desk(t);
    const w = deskW(d.x, d.y);
    return { x: w.x, y: w.y, w: BOAT_W, lift: bp.lift(t), tilt: bp.tilt(t), pivot: bp.pivot(t) };
  };
  // центр лодочки над столом (для взглядов и жестов)
  const boatW = (t: number) => {
    const b = boatPlace(t);
    return { x: b.x, y: b.y - (b.lift ?? 0) * MM };
  };
  // точка лодочки в её локальных единицах → мир (касание пальцев)
  const boatLocalW = (t: number, lx: number, ly: number) => boatLocalToWorld({ x: lx, y: ly }, boatPlace(t));

  // ---------- места ----------
  const T0 = AT_TABLE.teacher;
  const T1 = { x: 2256, y: AT_TABLE.teacher.y };
  const closeK = (t: number) => {
    const iv: [number, number][] = [
      [lay.from - sec(0.5), pl.markerDown + sec(0.4)],
      [pl.textOneEv.take - sec(0.6), pl.textOneEv.tape2 + sec(0.5)],
      [pl.earthHand.take - sec(0.6), lift.to + sec(5)],
    ];
    let k = 0;
    for (const [a, b] of iv) k = Math.max(k, smoothstep((t - a) / sec(0.6)) * (1 - smoothstep((t - b) / sec(0.6))));
    return k;
  };
  const walkPath: readonly Vec[] = [T1, { x: 2010, y: 1060 }, { x: 1880, y: 1016 }, { x: AT_BOARD.teacherHang.x, y: AT_BOARD.teacherHang.y }];
  const walkFrom = lift.to - sec(0.2);
  const walkTo = toBoard.to - sec(0.15);
  const stepAside = { from: pl.hangEv.step, to: pl.hangEv.step + sec(0.9) };
  const teacherPlace = (t: number): Place => {
    if (t < walkFrom) {
      const k = closeK(t);
      return teacherAt(lerp(T0.x, T1.x, k), T0.y);
    }
    if (t < walkTo) {
      const p = glide(t, walkFrom, walkTo, walkPath, (x) => cruiseE(x));
      return teacherAt(p.x, p.y);
    }
    const u = easeInOut(seg(t, stepAside.from, stepAside.to));
    return teacherAt(lerp(AT_BOARD.teacherHang.x, AT_BOARD.teacher.x, u), AT_BOARD.teacher.y);
  };
  const cruiseE = (x: number) => {
    const t = clamp(x);
    const acc = 0.2;
    const v = 1 / (1 - acc);
    if (t < acc) return (v * t * t) / (2 * acc);
    if (t > 1 - acc) return 1 - (v * (1 - t) * (1 - t)) / (2 * acc);
    return v * (t - acc / 2);
  };
  const teacherStand = (t: number) => {
    // встаёт: перенос веса вперёд, затем выпрямляется
    const up = smoothstep(seg(t, pl.posterLift.up - sec(0.2), lift.to - sec(0.1)));
    return up;
  };

  // Главные мальчики: место за столиком; Амир пересаживается к Юсуфу (сцена 6) и
  // остаётся рядом до сборки; в сцене 8 все трое встают и идут к доске.
  const kidsWalk = {
    bilal: { from: toBoard.from + sec(0.5), to: toBoard.to + sec(1.2) },
    amir: { from: toBoard.from + sec(0.9), to: toBoard.to + sec(1.6) },
    yusuf: { from: toBoard.from + sec(1.3), to: toBoard.to + sec(2.1) },
  } as const;
  const kidStandUp = (id: "yusuf" | "amir" | "bilal", t: number) => smoothstep(seg(t, kidsWalk[id].from - sec(0.7), kidsWalk[id].from));
  const amirX = (t: number) => {
    const near = smoothstep(seg(t, sitNear.from + sec(0.1), sitNear.to - sec(0.1)));
    return lerp(AT_TABLE.amir.x, AMIR_NEAR_YUSUF.x, near);
  };
  const kidPath = (id: "yusuf" | "amir" | "bilal", start: Vec): readonly Vec[] => {
    const end = AT_BOARD[id];
    return [start, { x: start.x - 40, y: 1120 }, { x: 1900 - (id === "bilal" ? 0 : id === "amir" ? 30 : 60), y: 1030 }, { x: end.x, y: end.y }];
  };
  // Билал в сцене 7 встаёт, обходит концы рядов и относит стопку учителю:
  // проходит за спинами сидящих за столиком и встаёт справа от учителя,
  // чтобы ни одна голова не закрывала его в кадре.
  const bw = pl.bilalWalk;
  const BW = {
    seat: AT_TABLE.bilal,
    w0: { x: 1702, y: 1322 },
    w1: { x: 1726, y: 1238 },
    w2: { x: 1806, y: 1160 },
    w3: { x: 1850, y: 1282 },
    w4: { x: 2398, y: 1282 },
  } as const;
  const bilalWalkPos = (t: number): Vec | null => {
    if (t < bw.go || t >= bw.atSeat) return null;
    const legs: [number, number, Vec, Vec][] = [
      [bw.go, bw.at0, BW.seat, BW.w0],
      [bw.collect[0] + sec(0.1), bw.at1, BW.w0, BW.w1],
      [bw.collect[1] + sec(0.05), bw.at2, BW.w1, BW.w2],
      [bw.leave2, bw.atTable, BW.w2, BW.w3],
      [bw.atTable, bw.atTeacher, BW.w3, BW.w4],
      [bw.leaveTeacher, bw.backTable, BW.w4, BW.w3],
      [bw.backTable, bw.atSeat, BW.w3, BW.seat],
    ];
    let last: Vec = BW.seat;
    for (const [a, b, p0, p1] of legs) {
      if (t < a) return last;
      if (t < b) return lerpV(p0, p1, cruiseE((t - a) / Math.max(1, b - a)));
      last = p1;
    }
    return last;
  };
  // стоит ли Билал (0 — сидит на ковре, 1 — стоит)
  const bilalUp = (t: number) => smoothstep(seg(t, bw.stand, bw.go)) * (1 - smoothstep(seg(t, bw.atSeat, bw.seated)));
  const mainPlace = (id: "yusuf" | "amir" | "bilal", t: number): Place => {
    const seat = id === "amir" ? { x: amirX(t), y: AT_TABLE.amir.y } : AT_TABLE[id];
    if (id === "bilal") {
      const wp = bilalWalkPos(t);
      if (wp) return kidAt(id, wp.x, wp.y);
    }
    const w = kidsWalk[id];
    if (t < w.from) return kidAt(id, seat.x, seat.y);
    const startSeat = id === "amir" ? AMIR_NEAR_YUSUF : AT_TABLE[id];
    if (t < w.to) {
      const p = glide(t, w.from, w.to, kidPath(id, startSeat), cruiseE);
      return kidAt(id, p.x, p.y);
    }
    return kidAt(id, AT_BOARD[id].x, AT_BOARD[id].y);
  };

  // ---------- предметы в руках ----------
  // Плакат: лежит → поднят учителем (вертикально перед ним) → у доски.
  const posterHeld = (t: number): { center: Vec; lift: number } | null => {
    if (t < pl.posterLift.grip) return null;
    const P = teacherPlace(t);
    const chest = { x: P.x - 0.02 * P.h, y: P.y - 0.5 * P.h };
    if (t < walkFrom) {
      const u = easeInOut(seg(t, pl.posterLift.grip, lift.to - sec(0.1)));
      return { center: lerpV(posterCenterW, chest, u), lift: u };
    }
    if (t < hang.from) return { center: chest, lift: 1 };
    const board = { x: POSTER_ON_BOARD.x + POSTER_ON_BOARD.w / 2, y: POSTER_ON_BOARD.y + POSTER_ON_BOARD.h / 2 };
    if (t < pl.hangEv.press) {
      const u = easeInOut(seg(t, hang.from, pl.hangEv.press));
      return { center: lerpV(chest, board, u), lift: 1 };
    }
    return null; // висит на доске
  };

  // ---------- учитель ----------
  const tPlace = teacherPlace;
  const tPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const p = tPlace(t);
    // учитель сидит вплотную справа от Юсуфа: левая рука в покое лежит ближе к
    // телу, чтобы рукав не ложился на лицо Юсуфа при смене слоёв рук
    const tl = { L: { x: p.x - 0.05 * p.h, y: p.y - 0.06 * p.h }, R: lapOf(p).R };
    const lap = { armL: { target: tl.L, shape: "relax" as Shape, elbow: "in" as const }, armR: lapArms(p).armR };
    const stand = teacherStand(t);
    const floorSit = t < pl.posterLift.up - sec(0.2) ? 1 : 1 - stand;
    const crouchK = t < walkFrom ? Math.sin(Math.PI * clamp(stand)) * 0.5 : 0;
    const base: PoseIn = { floorSit, crouch: crouchK, expr: "calm", ...lap, lookY: 0.12, lean: 3 * closeK(t) };
    const sp = speakerAt(t);

    // сцена 1: раскатывает лист от себя и расправляет ладонями
    if (t >= s1.from && t < pl.smooth.to + sec(0.3)) {
      const roll = (u: number) => ({ x: lerp(posterCenterW.x + 170, posterCenterW.x - 120, u), y: posterCenterW.y + 2 });
      const k = pl.posterSpread(t);
      const sw = seg(t, pl.smooth.from, pl.smooth.to);
      const back = smoothstep(seg(t, pl.smooth.to - sec(0.1), pl.smooth.to + sec(0.3)));
      const reachIn = smoothstep(seg(t, s1.from, pl.spread.from));
      const r = roll(k);
      const sweepL = { x: posterCenterW.x - 40 - 70 * Math.sin(Math.PI * sw), y: posterCenterW.y };
      const sweepR = { x: posterCenterW.x + 60 + 60 * Math.sin(Math.PI * sw), y: posterCenterW.y + 1 };
      const hl = t < pl.smooth.from ? { x: r.x - 14, y: r.y } : sweepL;
      const hr = t < pl.smooth.from ? { x: r.x + 22, y: r.y + 1 } : sweepR;
      const L1 = lerpV(lerpV(tl.L, hl, reachIn), tl.L, back);
      const R1 = lerpV(lerpV(tl.R, hr, reachIn), tl.R, back);
      return { pose: { ...base, expr: "softSmile", lean: 7 * (1 - back), lookY: 0.45 * (1 - back), armL: arm(wristFor(L1, p), "open", "out"), armR: arm(wristFor(R1, p), "open", "out") }, front: reachIn > 0.3 && back < 0.7 };
    }
    // сцена 1: раздаёт три чистые карточки (из рук в руки)
    {
      const d = pl.dealTo;
      const stackPt = { x: p.x - 0.1 * p.h, y: p.y - 0.12 * p.h };
      const meet = { yusuf: spotW.yusuf, amir: { x: 2068, y: 1252 }, bilal: { x: 2032, y: 1250 } } as const;
      const ks: Key[] = [
        [deal.from - sec(0.1), tl.L, "relax"],
        [d.yusuf.give - sec(0.15), stackPt, "pinch"],
        [d.yusuf.land, { x: meet.yusuf.x, y: meet.yusuf.y - 2 }, "open"],
        [d.amir.give - sec(0.1), stackPt, "pinch"],
        [(d.amir.give + d.amir.land) / 2, meet.amir, "open"],
        [d.bilal.give - sec(0.1), stackPt, "pinch"],
        [(d.bilal.give + d.bilal.land) / 2, meet.bilal, "open"],
        [d.bilal.land + sec(0.3), tl.L, "relax"],
      ];
      const f = follow(t, ks);
      if (f) return { pose: { ...base, expr: "softSmile", lean: 6, lookY: 0.3, armL: arm(wristFor(f.target, p), f.shape, "out"), armR: arm({ x: stackPt.x + 30, y: stackPt.y + 6 }, "pinch", "in") }, front: true };
    }
    // сцена 2: берёт яблоко со стола, дерево и Землю — из протянутых рук; кладёт в средний ряд
    {
      const lo = pl.layOf;
      const meetA = { x: 2072, y: 1252 };
      const meetB = { x: 2030, y: 1250 };
      const ks: Key[] = [
        [lay.from, tl.L, "relax"],
        [lo.yusuf.take, spotW.yusuf, "pinch"],
        [lo.yusuf.put, cellW(rosterById("yusuf")), "open"],
        [lo.amir.take, meetA, "pinch"],
        [lo.amir.put, cellW(rosterById("amir")), "open"],
        [lo.bilal.take, meetB, "pinch"],
        [lo.bilal.put, cellW(rosterById("bilal")), "open"],
        [lo.bilal.put + sec(0.45), tl.L, "relax"],
      ];
      const f = follow(t, ks);
      if (f) return { pose: { ...base, expr: "focused", lean: 7, lookY: 0.45, armL: arm(wristFor(f.target, p), f.shape, "out") }, front: true };
    }
    // реплика 10 и «заголовок пишется»: маркер, колпачок, заголовок
    if (t >= pl.write.cap - sec(0.5) && t < pl.markerDown + sec(0.5)) {
      const tipW = posterW(titleTip(pl.titleProgress(t)));
      const tip = { x: tipW.x, y: tipW.y - (titleTip(pl.titleProgress(t)).down ? 0 : 3) };
      const pick = smoothstep(seg(t, pl.write.cap - sec(0.5), pl.write.cap));
      const toStart = smoothstep(seg(t, pl.write.cap, pl.write.start));
      const back = smoothstep(seg(t, pl.markerDown - sec(0.3), pl.markerDown + sec(0.4)));
      const hr = t < pl.write.cap ? lerpV(tl.R, markerW, pick) : t < pl.write.start ? lerpV(markerW, tip, toStart) : t < pl.markerDown - sec(0.3) ? tip : lerpV(tip, markerW, smoothstep(seg(t, pl.markerDown - sec(0.3), pl.markerDown)));
      const hand = t >= pl.markerDown ? lerpV(markerW, tl.R, back) : hr;
      return { pose: { ...base, expr: speaking(10, t) ? "calm" : "focused", lean: 8, lookY: 0.5, armR: arm(wristFor(hand, p, 0.03), "pinch", "out") }, front: true };
    }
    // сцена 3: «Аллах Един» — карточку со стопки, переворачивает, кладёт, крепит
    for (const [which, ev, holdM] of [["one", pl.textOneEv, textOne], ["two", pl.textTwoEv, textTwo]] as const) {
      if (t >= ev.take - sec(0.6) && t < holdM.to) {
        const slot = slotW(which);
        const held = { x: p.x - 0.12 * p.h, y: p.y - 0.33 * p.h };
        const s2 = (which === "one" ? 118 : 160) * MM;
        const ks: Key[] = [
          [ev.take - sec(0.6), tl.R, "relax"],
          [ev.take, stackW, "pinch"],
          [ev.flip, held, "pinch"],
          [ev.flipped, held, "pinch"],
          [ev.put, slot, "open"],
          [ev.tape1 - sec(0.35), tapeW, "pinch"],
          [ev.tape1, { x: slot.x - s2, y: slot.y }, "point"],
          [ev.tape2 - sec(0.3), tapeW, "pinch"],
          [ev.tape2, { x: slot.x + s2, y: slot.y }, "point"],
          [Math.min(ev.tape2 + sec(0.45), holdM.to - 1), tl.R, "relax"],
        ];
        const f = follow(t, ks);
        if (f) return { pose: { ...base, expr: "calm", lean: 6, lookY: t < ev.flipped ? 0.1 : 0.45, armR: arm(wristFor(f.target, p), f.shape, "out") }, front: t < ev.flip || t > ev.flipped };
      }
    }
    // сцена 7: сборка. Левая рука берёт Землю у Билала и прижимает полоски
    // на уже лежащих рисунках. Стопку учитель принимает правой рукой у Билала
    // (он стоит справа), перекладывает в левую и держит над нижним полем
    // листа рядом с очередной ячейкой — как в виде сверху (deskHands.ts);
    // правая рука берёт верхнюю карточку, кладёт в ячейку и прижимает полоску.
    if (t >= pl.earthHand.take - sec(0.3) && t < gridDone.to + sec(0.4)) {
      const take = pl.stackToTeacher.take;
      const swap = take + sec(0.45);
      const sorted = [...pl.fixTimes.entries()].sort((a, b) => a[1] - b[1]);
      const fromStack = (id: string) => !["amir", "yusuf", "pupil05", "bilal"].includes(id);
      const inLapse = (at: number) => at >= pl.lapse.from && at <= pl.lapse.at;
      const work = sorted.filter(([id, at]) => fromStack(id) && !inLapse(at));
      const lastPick = work.length ? work[work.length - 1][1] - pl.PICK_LEAD : swap;
      // где держат стопку для карточки id (тот же расчёт, что stagingFor в виде сверху)
      const stageW = (id: string) => {
        const r = rosterById(id);
        const d = posterToDesk(cellCenter(r.cell.row, r.cell.col));
        const v = Math.max(26, d.y - 165);
        const u = d.y - 165 < 26 ? d.x - 150 : d.x - 40;
        const w = deskW(clamp(u, 460, 1100), v);
        return { x: w.x, y: w.y - 5 };
      };
      const offerW = { x: deskW(800, 120).x, y: deskW(800, 120).y - 5 };
      // левая рука
      const ks: Key[] = [[pl.earthHand.take - sec(0.3), tl.L, "relax"], [pl.earthHand.give, { x: 2060, y: 1250 }, "pinch"]];
      ks.push([pl.earthHand.put, cellW(rosterById("bilal")), "open"]);
      let prev = pl.earthHand.put;
      for (const [id, at] of sorted) {
        if (fromStack(id) || at <= prev + 2 || at >= take) continue;
        const c = cellW(rosterById(id));
        ks.push([at, c, "open"]);
        ks.push([at + Math.round(pl.FIX_LEN * 0.5), { x: c.x + 14, y: c.y - 1 }, "point"]);
        prev = at + Math.round(pl.FIX_LEN * 0.5);
      }
      ks.push([take - sec(0.1), tl.L, "relax"]);
      ks.push([swap, offerW, "pinch"]);
      let prevAt = swap;
      for (const [id, at] of work) {
        const pick = at - pl.PICK_LEAD;
        if (pick - 1 > prevAt) ks.push([pick - 1, stageW(id), "pinch"]);
        prevAt = Math.max(prevAt, at);
      }
      if (lastPick + sec(0.3) < gridDone.to + sec(0.4)) ks.push([lastPick + sec(0.3), tl.L, "relax"]);
      ks.push([gridDone.to + sec(0.4), tl.L, "relax"]);
      const f = follow(t, ks);
      // правая рука: стопку у Билала → в левую руку; карточки по ячейкам
      const stackKs: Key[] = [
        [pl.stackToTeacher.offer - sec(0.2), tl.R, "relax"],
        [take, { x: 2334, y: 1096 }, "pinch"],
        [swap, { x: offerW.x + 8, y: offerW.y - 2 }, "pinch"],
      ];
      let prevR = swap;
      for (const [id, at] of work) {
        const pick = at - pl.PICK_LEAD;
        if (pick <= prevR + 2) continue;
        const c = cellW(rosterById(id));
        const st = stageW(id);
        stackKs.push([pick, { x: st.x + 8, y: st.y - 2 }, "pinch"]);
        stackKs.push([at, c, "open"]);
        stackKs.push([at + Math.round(pl.FIX_LEN * 0.3), { x: c.x + 14, y: c.y - 1 }, "point"]);
        prevR = at + Math.round(pl.FIX_LEN * 0.3);
      }
      stackKs.push([Math.max(prevR + sec(0.4), lastPick + sec(0.6)), tl.R, "relax"]);
      const fr = follow(t, stackKs);
      const talking = speaking(38, t);
      return {
        pose: { ...base, expr: talking ? "softSmile" : "focused", lean: 7, lookY: talking ? 0.25 : 0.45, armL: f ? arm(wristFor(f.target, p), f.shape, "out") : lap.armL, armR: fr ? arm(wristFor(fr.target, p), fr.shape, "out") : lap.armR },
        front: true,
      };
    }
    // сцена 8: поднимает лист, встаёт, несёт к доске, вешает, отходит
    if (t >= pl.posterLift.grip - sec(0.4)) {
      // до захвата (0,4 с) руки тянутся к краям ещё лежащего листа — сидя
      const ph = posterHeld(t) ?? (t < pl.posterLift.grip ? posterHeld(pl.posterLift.grip) : null);
      if (ph) {
        // держит лист за боковые края (пальцы спереди — stage.tsx, posterGrips)
        const [gl, gr] = posterGrips(ph.center, ph.lift);
        const reach = smoothstep(seg(t, pl.posterLift.grip - sec(0.4), pl.posterLift.grip));
        const L1 = lerpV(tl.L, gl, reach);
        const R1 = lerpV(tl.R, gr, reach);
        const walking = t >= walkFrom && t < walkTo;
        return { pose: { ...base, floorSit, crouch: crouchK, expr: walking ? "softSmile" : "focused", lean: walking ? 2 : 6 * (1 - stand), lookY: walking ? 0.05 : 0.3, armL: arm(L1, "fist", "down"), armR: arm(R1, "fist", "down") }, front: true };
      }
      // на доске: прижимает и крепит углы, затем отходит в сторону
      const b = POSTER_ON_BOARD;
      const tlC = { x: b.x + 10, y: b.y + 10 };
      const trC = { x: b.x + b.w - 10, y: b.y + 10 };
      const blC = { x: b.x + 10, y: b.y + b.h - 10 };
      const brC = { x: b.x + b.w - 10, y: b.y + b.h - 10 };
      const ev = pl.hangEv;
      const ksL: Key[] = [
        [ev.press, { x: b.x + 30, y: b.y + 60 }, "open"],
        [ev.top1, tlC, "point"],
        [ev.top1 + sec(0.3), { x: b.x + 30, y: b.y + 60 }, "open"],
        [ev.bottom1, blC, "point"],
        [ev.bottom1 + sec(0.3), { x: blC.x + 10, y: blC.y + 30 }, "relax"],
        [ev.step, { x: blC.x + 10, y: blC.y + 60 }, "relax"],
      ];
      const ksR: Key[] = [
        [ev.press, { x: b.x + b.w - 30, y: b.y + 60 }, "open"],
        [ev.top1 + sec(0.2), { x: b.x + b.w - 30, y: b.y + 60 }, "open"],
        [ev.top2, trC, "point"],
        [ev.top2 + sec(0.3), { x: b.x + b.w - 40, y: b.y + 100 }, "open"],
        [ev.bottom2, brC, "point"],
        [ev.bottom2 + sec(0.3), { x: brC.x - 20, y: brC.y + 40 }, "relax"],
        [ev.step, { x: brC.x - 40, y: brC.y + 80 }, "relax"],
      ];
      const fl = follow(t, ksL);
      const fr = follow(t, ksR);
      if (fl || fr) return { pose: { floorSit: 0, expr: "focused", lookY: -0.3, armL: fl ? arm(fl.target, fl.shape, "out") : lap.armL, armR: fr ? arm(fr.target, fr.shape, "out") : lap.armR }, front: true };
      // стоит у доски: жест к плакату на реплике 40, затем слушает детей
      const standLap = { armL: { target: { x: p.x - 0.12 * p.h, y: p.y - 0.42 * p.h }, shape: "relax" as Shape, elbow: "in" as const }, armR: { target: { x: p.x + 0.12 * p.h, y: p.y - 0.42 * p.h }, shape: "relax" as Shape, elbow: "in" as const } };
      if (speaking(40, t, 6)) {
        const k = win(t, L(40).from - 6, L(40).to - 6, 12);
        const open = { x: p.x + 0.34 * p.h, y: p.y - 0.62 * p.h };
        return { pose: { floorSit: 0, expr: "softSmile", lookY: -0.05, ...standLap, armR: arm(lerpV(standLap.armR.target, open, k), k > 0.3 ? "open" : "relax", "out") }, front: false };
      }
      return { pose: { floorSit: 0, expr: t > L(44).to ? "softSmile" : "listening", lookY: -0.05, ...standLap }, front: false };
    }

    // жесты на собственных репликах (открытая ладонь правой руки), кивки на коротких ответах
    const gestureIds = [1, 5, 6, 12, 14, 18, 20, 26, 31, 38];
    for (const id of gestureIds) {
      const l = L(id);
      // вопросы зрителю (6, 12, 18, 31): ладонь возвращается до конца вопроса — в паузе руки неподвижны
      // после реплики 14 учитель сразу берёт карточку «Аллах Един»: ладонь опускается заранее
      const endAt = [6, 12, 18, 31].includes(id) ? l.to - 16 : id === 14 ? Math.min(l.to + 10, pl.textOneEv.take - sec(0.6)) : l.to + 10;
      if (t >= l.from - 4 && t <= endAt) {
        // ладонь поднимается за 12 кадров и к endAt полностью возвращается (без рывка)
        const k = win(t, l.from - 4, endAt - 12, 12) * (id === 26 ? 0.9 : 0.7);
        const open = id === 26 ? { x: boatW(t).x + 30, y: boatW(t).y - 46 } : id === 6 ? { x: cellW(rosterById("amir")).x + 40, y: 1222 } : { x: tl.R.x + 0.15 * p.h, y: tl.R.y - 0.36 * p.h };
        const armSide = id === 26 || id === 6 ? "armL" : "armR";
        const from = armSide === "armL" ? tl.L : tl.R;
        const expr = id === 1 || id === 5 || id === 38 ? "softSmile" : "calm";
        return { pose: { ...base, expr, lookY: 0.15, [armSide]: arm({ x: lerp(from.x, open.x, k), y: lerp(from.y, open.y, k) }, k > 0.3 ? "open" : "relax", "out") }, front: false };
      }
    }
    for (const id of [8, 22]) {
      const l = L(id);
      if (t >= l.from - 2 && t <= l.from + 16) {
        const u = clamp((t - l.from + 2) / 16);
        return { pose: { ...base, expr: "softSmile", nod: 5 * Math.sin(Math.PI * u) }, front: false };
      }
    }
    if (speaking(16, t)) return { pose: { ...base, expr: "softSmile", lean: 9, lookY: 0.35, headTilt: 3 }, front: false };
    if (inPause(t)) return { pose: { ...base, expr: "listening", lookY: 0.05 }, front: false };
    if (sp && sp !== "muhammad") return { pose: { ...base, expr: "listening", lookY: 0.2 }, front: false };
    if (t >= p4.to && t < M("спокойные лица").to) return { pose: { ...base, expr: "softSmile", lookY: 0.4, lean: 4 }, front: false };
    return { pose: base, front: false };
  };
  const tFace = (t: number) => {
    const P = tPlace(t);
    const sp = speakerAt(t);
    const y = mainPlace("yusuf", t);
    const a = mainPlace("amir", t);
    const b = mainPlace("bilal", t);
    if (t >= walkFrom && t < walkTo) return -0.7; // идёт к доске
    if (t >= hang.from && t < pl.hangEv.step) return -0.25;
    if (t >= pl.hangEv.step) {
      if (sp === "yusuf") return faceTo(y.x, P.x, 1200);
      if (sp === "amir") return faceTo(a.x, P.x, 1200);
      if (sp === "bilal") return faceTo(b.x, P.x, 1200);
      if (t >= final.from) return 0.2;
      return 0.15;
    }
    if (t >= s1.from && t < pl.smooth.to) return -0.15;
    if (t >= deal.from && t < deal.to) return t < pl.dealTo.amir.give ? faceTo(y.x, P.x) : t < pl.dealTo.bilal.give ? faceTo(a.x, P.x) : faceTo(b.x, P.x);
    if (t >= lay.from && t < lay.to) return faceTo(lerp(y.x, b.x, seg(t, lay.from, lay.to)), P.x);
    if (t >= pl.write.cap && t < titleDone.from) return faceTo(posterW(titleTip(pl.titleProgress(t))).x, P.x, 900);
    for (const id of [6, 12, 18, 31]) if (speaking(id, t)) return -0.32; // к классу и зрителям
    if (inPause(t)) return -0.28;
    if (sp === "yusuf") return faceTo(y.x, P.x);
    if (sp === "amir") return faceTo(a.x, P.x);
    if (sp === "bilal") return faceTo(b.x, P.x);
    if (t >= bird.from && t < bird.to) return faceTo(b.x - 120, P.x);
    if (t >= toTree.from && t < toTree.to) return faceTo(a.x, P.x);
    if (t >= take6.from && t < M("спокойные лица").to) return faceTo(boatW(t).x, P.x);
    if (t >= boatDraw.from && t < amirCard.to) return faceTo(2076, P.x);
    if (sp === "muhammad") return faceTo(lerp(y.x, a.x, 0.4), P.x);
    return faceTo(y.x - 40, P.x);
  };

  // ---------- главные мальчики ----------
  type MainId = "yusuf" | "amir" | "bilal";
  const PENCIL_COLOR: Record<MainId, string> = { yusuf: pl.pencilTake.yusuf.color, amir: pl.pencilTake.amir.color, bilal: pl.pencilTake.bilal.color };
  const BOAT_PENCIL = "#3E6DB5"; // как BOAT_PENCIL в deskHands.ts
  const kindOf: Record<MainId, "apple" | "tree" | "earth"> = { yusuf: "apple", amir: "tree", bilal: "earth" };

  // кончик карандаша при рисовании своей карточки (мир)
  const drawTipW = (id: MainId, t: number) => {
    const prog = pl.mainProgress[id](t);
    const tip = drawingTip(kindOf[id], prog);
    const w = cardPointW(spotW[id], tip.x, tip.y);
    return { pos: { x: w.x, y: w.y - (tip.down ? 0 : 3) }, down: tip.down };
  };
  const treeCardW = () => cellW(rosterById("amir"));
  const boatDrawTipW = (t: number) => {
    const tip = boatTip(pl.boatProgress(t));
    const w = cardPointW(treeCardW(), tip.x, tip.y);
    return { x: w.x, y: w.y - (tip.down ? 0 : 3) };
  };
  const captionTipW = (t: number) => {
    const tip = captionTip(pl.captionProgress(t));
    const w = cardPointW(treeCardW(), tip.x, tip.y);
    return { x: w.x, y: w.y - (tip.down ? 0 : 3) };
  };

  const mainPoseEx = (id: MainId, t: number): { pose: PoseIn; front: boolean } => {
    const p = mainPlace(id, t);
    const lap = lapArms(p);
    const ll = lapOf(p);
    const standK = kidStandUp(id, t);
    const base: PoseIn = { floorSit: 1 - standK, crouch: Math.sin(Math.PI * standK) * 0.4, expr: "listening", ...lap, lookY: -0.1 };
    const sp = speakerAt(t);
    const takeP = pl.pencilTake[id];

    // сцена 8: встаёт, идёт к доске, стоит рядом с плакатом
    if (t >= kidsWalk[id].from - sec(0.7)) {
      const standLap = { armL: { target: { x: p.x - 0.11 * p.h, y: p.y - 0.4 * p.h }, shape: "relax" as Shape, elbow: "in" as const }, armR: { target: { x: p.x + 0.11 * p.h, y: p.y - 0.4 * p.h }, shape: "relax" as Shape, elbow: "in" as const } };
      const walking = t >= kidsWalk[id].from && t < kidsWalk[id].to;
      if (walking || t < kidsWalk[id].from) return { pose: { ...base, armL: { target: null, shape: "relax" }, armR: { target: null, shape: "relax" }, expr: "softSmile", lookY: -0.05 }, front: false };
      const myLine = id === "yusuf" ? [41, 44] : id === "amir" ? [42] : [43];
      const talking = myLine.some((x) => speaking(x, t));
      const happy = id === "yusuf" && speaking(44, t, 10);
      return { pose: { floorSit: 0, expr: happy ? "smile" : talking ? "softSmile" : t > L(44).to ? "softSmile" : "listening", lookY: talking ? -0.1 : -0.25, ...standLap }, front: false };
    }

    // учитель раздаёт карточки: протягивают руку и кладут перед собой
    if (id !== "yusuf") {
      const d = pl.dealTo[id];
      const meet = id === "amir" ? { x: 2068, y: 1252 } : { x: 2032, y: 1250 };
      const ks: Key[] = [
        [d.give - sec(0.25), ll.R, "relax"],
        [(d.give + d.land) / 2, meet, "pinch"],
        [d.land, spotW[id], "open"],
        [d.land + sec(0.4), ll.R, "relax"],
      ];
      const f = follow(t, ks);
      if (f) return { pose: { ...base, expr: "softSmile", lean: 4, lookY: 0.2, armR: arm(wristFor(f.target, p), f.shape, "out") }, front: true };
    }
    // карандаш из пенала
    {
      const ks: Key[] = [
        [takeP.reach, ll.R, "open"],
        [takeP.grab, trayW(id), "pinch"],
        [takeP.back, drawTipW(id, takeP.back).pos, "pinch"],
      ];
      const f = follow(t, ks);
      if (f) {
        const myLine = id === "yusuf" ? 2 : id === "amir" ? 3 : 4;
        return { pose: { ...base, expr: speaking(myLine, t) ? (id === "yusuf" ? "smile" : "softSmile") : "focused", lean: 4, lookY: speaking(myLine, t) ? -0.05 : 0.35, armR: arm(wristFor(f.target, p), f.shape, "out") }, front: true };
      }
    }
    // рисует свою карточку (карандаш в руке, кончик — на рисунке; левая ладонь придерживает)
    if (t >= takeP.back && t < pl.pencilDown[id] + sec(0.6)) {
      const tip = drawTipW(id, Math.min(t, pl.pencilDown[id]));
      const back = smoothstep(seg(t, pl.pencilDown[id], pl.pencilDown[id] + sec(0.6)));
      const hand = lerpV(tip.pos, { x: spotW[id].x + 40, y: spotW[id].y + 2 }, back);
      const hold = { x: spotW[id].x - CARD_MM.w * MM * 0.42, y: spotW[id].y + 1 };
      const myLine = id === "yusuf" ? 2 : id === "amir" ? 3 : 4;
      const lookUp = speaking(myLine, t) || (sp && sp !== id && t < L(5).to + 6 && hash01(t >> 4) > 0.65);
      return {
        pose: { ...base, expr: speaking(myLine, t) ? (id === "yusuf" ? "smile" : "softSmile") : "focused", lean: lookUp ? 3 : 7, lookY: lookUp ? 0 : 0.55, armR: arm(wristFor(hand, p, 0.03), back > 0.5 ? "relax" : "pinch", "out"), armL: arm(wristFor(hold, p), "open", "down") },
        front: true,
      };
    }
    // сцена 2: Амир и Билал протягивают свои рисунки учителю
    if (id !== "yusuf") {
      const lo = pl.layOf[id];
      const meet = id === "amir" ? { x: 2072, y: 1252 } : { x: 2030, y: 1250 };
      const ks: Key[] = [
        [lo.offer - sec(0.35), spotW[id], "pinch"],
        [lo.take, meet, "pinch"],
        [lo.take + sec(0.4), ll.R, "relax"],
      ];
      if (t >= lo.offer - sec(0.75) && t < lo.offer - sec(0.35)) {
        const u = smoothstep(seg(t, lo.offer - sec(0.75), lo.offer - sec(0.35)));
        return { pose: { ...base, expr: "softSmile", lean: 3, lookY: 0.3, armR: arm(wristFor(lerpV(ll.R, spotW[id], u), p), "open", "out") }, front: true };
      }
      const f = follow(t, ks);
      if (f) return { pose: { ...base, expr: "softSmile", lean: 4, lookY: 0.1, armR: arm(wristFor(f.target, p), f.shape, "out") }, front: true };
    }
    // Билал: принимает птицу от ученика и кладёт её рядом с Землёй
    if (id === "bilal") {
      const ev = pl.birdPass;
      const meet = { x: 1700, y: 1232 };
      const ks: Key[] = [
        [ev.offer, ll.L, "relax"],
        [ev.take, meet, "pinch"],
        [ev.put, cellW(rosterById(BIRD_OWNER)), "open"],
        [ev.back, ll.L, "relax"],
      ];
      const f = follow(t, ks);
      if (f) return { pose: { ...base, expr: "softSmile", lean: 3, lookY: t < ev.take ? 0.1 : 0.4, armL: arm(wristFor(f.target, p), f.shape, "out") }, front: t > ev.take };
    }
    // Юсуф: ладонь на закрытой папке
    if (id === "yusuf") {
      const ev = pl.folderTouch;
      const ks: Key[] = [
        [ev.reach, ll.R, "relax"],
        [ev.touch, folderW, "open"],
        [ev.off, folderW, "open"],
        [ev.back, ll.R, "relax"],
      ];
      const f = follow(t, ks);
      if (f) return { pose: { ...base, expr: "curious", lean: 5, lookY: t < ev.touch + sec(0.6) ? 0.45 : 0, armR: arm(wristFor(f.target, p), f.shape, "out") }, front: t > ev.reach + 6 && t < ev.back - 4 };
    }
    // Амир: переносит лодочку к карточке; в сцене 7 — в сторону
    if (id === "amir") {
      for (const mv of [bp.events.moveToTree, bp.events.moveAside]) {
        if (t >= mv.from - sec(0.6) && t < mv.to + sec(0.6)) {
          const b = boatW(t);
          const grip = { x: b.x + 6, y: b.y - 14 };
          const reach = smoothstep(seg(t, mv.from - sec(0.6), mv.from));
          const back = smoothstep(seg(t, mv.to, mv.to + sec(0.6)));
          const hand = lerpV(lerpV(ll.R, grip, reach), ll.R, back);
          return { pose: { ...base, expr: speaking(24, t) ? "smile" : "focused", lean: 4, lookY: 0.4, armR: arm(wristFor(hand, p), reach > 0.85 && back < 0.15 ? "pinch" : "open", "out") }, front: true };
        }
      }
      // реплика 28: показывает свободное место внизу своей карточки
      if (speaking(28, t, 8)) {
        const k = win(t, L(28).from + sec(0.6), L(28).to + 8, 10);
        const pt = cardPointW(treeCardW(), 150, 178);
        return { pose: { ...base, expr: "softSmile", lean: 4, lookY: 0.25, armR: arm(lerpV(ll.R, wristFor(pt, p), k), k > 0.4 ? "point" : "relax", "out") }, front: k > 0.4 };
      }
    }
    // сцена 6: лодочка — Юсуф берёт и ставит; Амир показывает край, Юсуф держит, Амир возвращает уголок
    if (t >= take6.from && t < M("спокойные лица").from) {
      const hands = bp.hands(t);
      const me = id === "yusuf" ? hands.yusuf : id === "amir" ? hands.amir : null;
      const worried = id === "yusuf" && t >= bp.events.openStart && t < p4.to;
      const expr = id === "yusuf" ? (worried ? (t < bp.events.setDown ? "surprised" : "worried") : speaking(33, t) ? "curious" : "focused") : id === "amir" ? (speaking(32, t) || speaking(34, t) ? "softSmile" : "focused") : "listening";
      const look = id === "bilal" ? 0.3 : 0.5;
      if (me && me.visible > 0.02) {
        const tipW = boatLocalW(t, me.tip.x, me.tip.y);
        const side = id === "yusuf" ? ll.L : ll.R;
        const hand = lerpV(side, tipW, clamp(me.visible));
        const shape: Shape = me.shape === "hold" ? "open" : me.shape === "press" ? "point" : me.shape;
        const key = id === "yusuf" ? "armL" : "armR";
        return { pose: { ...base, expr, lean: 6, lookY: look, [key]: arm(wristFor(hand, p, 0.03), shape, "out") }, front: me.visible > 0.3 };
      }
      if (id !== "bilal") return { pose: { ...base, expr, lean: 5, lookY: inPause(t) ? 0.45 : speaking(29, t) && id === "yusuf" ? 0.1 : 0.4 }, front: false };
    }
    // сцена 7: лодочка на карточке — Юсуф рисует нижнюю линию синим карандашом, передаёт его Амиру
    if (t >= pl.boatPencil.yReach && t < pl.boatPencil.down + sec(0.6) && id !== "bilal") {
      const bpn = pl.boatPencil;
      if (id === "yusuf") {
        const ks: Key[] = [
          [bpn.yReach, ll.L, "open"],
          [bpn.yGrab, trayW("boat"), "pinch"],
          [bpn.yStart, boatDrawTipW(bpn.yStart), "pinch"],
        ];
        const f = follow(t, ks);
        let hand: Vec | null = f ? f.target : null;
        let shape: Shape = f ? f.shape : "pinch";
        if (!f && t >= bpn.yStart && t < bpn.handoff) hand = t < bpn.yEnd ? boatDrawTipW(t) : lerpV(boatDrawTipW(bpn.yEnd), { x: 2052, y: 1246 }, smoothstep(seg(t, bpn.yEnd, bpn.handoff)));
        if (!f && t >= bpn.handoff) {
          hand = lerpV({ x: 2052, y: 1246 }, ll.L, smoothstep(seg(t, bpn.handoff, bpn.handoff + sec(0.5))));
          shape = "relax";
        }
        if (hand) return { pose: { ...base, expr: t < bpn.handoff ? "focused" : "softSmile", lean: 6, lookY: 0.5, armL: arm(wristFor(hand, p, 0.03), shape, "out") }, front: t < bpn.handoff + sec(0.3) };
        return { pose: { ...base, expr: "softSmile", lean: 3, lookY: 0.45 }, front: false };
      }
      // Амир: принимает карандаш, дорисовывает контур, пишет подпись, кладёт карандаш
      const meet = { x: 2052, y: 1246 };
      let hand: Vec = ll.R;
      let shape: Shape = "relax";
      if (t >= bpn.handoff - sec(0.4) && t < bpn.aStart) {
        hand = t < bpn.handoff ? lerpV(ll.R, meet, smoothstep(seg(t, bpn.handoff - sec(0.4), bpn.handoff))) : lerpV(meet, boatDrawTipW(bpn.aStart), smoothstep(seg(t, bpn.handoff, bpn.aStart)));
        shape = "pinch";
      } else if (t >= bpn.aStart && t < bpn.capStart) {
        hand = t <= bpn.aEnd ? boatDrawTipW(t) : lerpV(boatDrawTipW(bpn.aEnd), captionTipW(bpn.capStart), smoothstep(seg(t, bpn.aEnd, bpn.capStart)));
        shape = "pinch";
      } else if (t >= bpn.capStart && t < bpn.down) {
        hand = t <= bpn.capEnd ? captionTipW(t) : captionTipW(bpn.capEnd);
        shape = "pinch";
      } else if (t >= bpn.down) {
        hand = lerpV(captionTipW(bpn.capEnd), ll.R, smoothstep(seg(t, bpn.down, bpn.down + sec(0.6))));
      }
      if (shape === "pinch" || t < bpn.down + sec(0.6)) return { pose: { ...base, expr: "focused", lean: 7, lookY: 0.55, armR: arm(wristFor(hand, p, 0.03), shape, "out"), armL: arm({ x: treeCardW().x - 26, y: treeCardW().y + 1 }, "open", "down") }, front: t >= bpn.handoff - sec(0.4) };
    }
    // сцена 7: Билал берёт свою Землю и передаёт учителю; встаёт, собирает
    // стопки у концов рядов, относит их учителю и садится на место
    if (id === "bilal" && t >= L(37).to - sec(0.2) && t < bw.seated + sec(0.3)) {
      const eh = pl.earthHand;
      const earthCell = cellW(rosterById("bilal"));
      const ksR: Key[] = [
        [eh.take - sec(0.3), ll.R, "open"],
        [eh.take, earthCell, "pinch"],
        [eh.give, { x: 2060, y: 1250 }, "pinch"],
        [eh.give + sec(0.4), ll.R, "relax"],
      ];
      const fr = follow(t, ksR);
      const up = bilalUp(t);
      const floorSit = 1 - up;
      const crouch = Math.sin(Math.PI * up) * 0.35;
      const talking = speaking(37, t);
      if (fr || t < bw.stand) return { pose: { ...base, floorSit, crouch, expr: talking ? "softSmile" : "calm", lean: 3, lookY: 0.15, armR: fr ? arm(wristFor(fr.target, p), fr.shape, "out") : lap.armR }, front: Boolean(fr) };
      // стоя: левая рука держит стопку у груди, правая принимает стопки у концов рядов
      const hold = { x: p.x - 0.07 * p.h, y: p.y - 0.5 * p.h };
      const has = t >= bw.collect[0];
      let R1: Vec = { x: p.x + 0.1 * p.h, y: p.y - 0.42 * p.h };
      let shapeR: Shape = "relax";
      for (const [k, at] of bw.collect.entries()) {
        const kw = win(t, at - sec(0.35), at + sec(0.15), 6);
        if (kw > 0.01) {
          const end = mainOrKid(pl.rowEndId(k), t);
          const meet = { x: (p.x + end.x) / 2, y: Math.min(p.y - 0.42 * p.h, end.y - 0.25 * end.h) };
          R1 = lerpV(R1, meet, kw);
          shapeR = kw > 0.6 ? "pinch" : "open";
        }
      }
      // учителю: обеими руками отдаёт стопку
      const give = win(t, pl.stackToTeacher.offer, pl.stackToTeacher.take + sec(0.1), 6);
      const giveAt = { x: 2340, y: 1090 };
      const L1 = lerpV(has ? hold : { x: p.x - 0.1 * p.h, y: p.y - 0.42 * p.h }, giveAt, give);
      const look = t < bw.collect[2] + sec(0.2) ? 0 : 0.2;
      // встаёт и садится — руки плавно переходят из положения «на коленях»
      const lapL = lap.armL.target ?? L1;
      const lapR = lap.armR.target ?? R1;
      return {
        pose: { ...base, floorSit, crouch, expr: "softSmile", lean: 2, lookY: look, armL: arm(lerpV(lapL, L1, up), has && up > 0.5 ? "pinch" : "relax", "down"), armR: arm(lerpV(lapR, R1, up), shapeR, "out") },
        front: false,
      };
    }
    // сцена 7: Юсуф и Амир придерживают нижние углы листа
    if ((id === "amir" || id === "yusuf") && t >= pass.from - sec(0.3) && t < gridDone.to + sec(0.5)) {
      const corner = id === "amir" ? cornerBL : cornerBR;
      const k = win(t, pass.from - sec(0.3), gridDone.to + sec(0.3), 10);
      const holdArm = id === "amir" ? "armL" : "armR";
      const holdFrom = id === "amir" ? ll.L : ll.R;
      const pose: PoseIn = { ...base, expr: "softSmile", lean: 4, lookY: 0.4, [holdArm]: arm(wristFor(lerpV(holdFrom, corner, k), p), k > 0.6 ? "open" : "relax", "down") };
      return { pose, front: k > 0.3 };
    }

    // ---------- реплики, паузы, слушание ----------
    const curiousLines = id === "yusuf" ? [17, 23, 25] : [];
    if (curiousLines.some((x) => speaking(x, t))) return { pose: { ...base, expr: "curious", headTilt: -4, lookY: -0.1 }, front: false };
    if (id === "yusuf" && speaking(7, t)) return { pose: { ...base, expr: "smile", lookY: -0.15 }, front: false };
    if (id === "yusuf" && speaking(15, t)) return { pose: { ...base, expr: "smile", lookY: -0.1 }, front: false };
    if (id === "yusuf" && speaking(19, t)) return { pose: { ...base, expr: "calm", lookY: -0.1 }, front: false };
    if (id === "yusuf" && (speaking(35, t) || speaking(39, t))) return { pose: { ...base, expr: "smile", lookY: -0.05 }, front: false };
    if (id === "amir" && (speaking(9, t) || speaking(13, t) || speaking(36, t))) return { pose: { ...base, expr: "softSmile", lookY: -0.05 }, front: false };
    if (id === "amir" && t >= L(35).to && t < M("Амир улыбается").to + 6) return { pose: { ...base, expr: "smile", lookY: -0.05, nod: 3 * Math.sin(Math.PI * seg(t, L(35).to, L(35).to + 18)) }, front: false };
    if (id === "bilal" && (speaking(11, t) || speaking(21, t) || speaking(27, t))) return { pose: { ...base, expr: speaking(21, t) ? "thinking" : "calm", lookY: speaking(11, t) ? 0.35 : -0.05, lean: 3 }, front: false };
    if (inPause(t)) return { pose: { ...base, expr: id === "yusuf" ? "thinking" : "neutral", lookY: id === "yusuf" ? -0.25 : -0.05 }, front: false };
    if (t >= p4.to && t < M("спокойные лица").to && id === "yusuf") return { pose: { ...base, expr: "smile", lookY: 0.3 }, front: false };
    if (t >= bird.from && t < bird.to) return { pose: { ...base, expr: "listening", lookY: 0.3 }, front: false };
    if (t >= pl.write.start && t < titleDone.to) return { pose: { ...base, expr: "softSmile", lookY: 0.45 }, front: false };
    if (sp && sp !== id) return { pose: base, front: false };
    return { pose: base, front: false };
  };
  const mainFace = (id: MainId, t: number) => {
    const P = mainPlace(id, t);
    const T = tPlace(t);
    const sp = speakerAt(t);
    const others = { yusuf: mainPlace("yusuf", t), amir: mainPlace("amir", t), bilal: mainPlace("bilal", t) };
    if (t >= kidsWalk[id].from && t < kidsWalk[id].to) return -0.8;
    if (t >= kidsWalk[id].to) {
      if (sp === "muhammad") return faceTo(T.x, P.x, 1200);
      if (sp && sp !== id) return faceTo(others[sp as MainId].x, P.x, 900);
      return id === "yusuf" ? -0.25 : -0.3; // на плакат
    }
    if (t >= kidsWalk[id].from - sec(0.7)) return -0.4;
    // на свою карточку, пока рисует; на говорящего
    if (t >= pl.pencilTake[id].reach && t < pl.pencilDown[id]) {
      if (sp && sp !== id && sp !== "muhammad" && t < L(5).to) return faceTo(others[sp as MainId].x, P.x) * 0.6;
      return faceTo(spotW[id].x, P.x, 1200);
    }
    if (t >= s1.from && t < pl.smooth.to) return faceTo(posterCenterW.x, P.x);
    if (t >= deal.from && t < deal.to) return faceTo(T.x, P.x) * 0.7;
    if (t >= lay.from && t < lay.to) return faceTo(T.x - 60, P.x);
    if (id === "bilal" && t >= bird.from && t < pl.birdPass.put) return t < pl.birdPass.take ? -0.6 : faceTo(cellW(rosterById(BIRD_OWNER)).x, P.x);
    if (id === "bilal" && speaking(11, t)) {
      // переводит взгляд между карточками: Земля → птица → на класс
      const u = seg(t, L(11).from, L(11).to);
      return u < 0.33 ? faceTo(cellW(rosterById("bilal")).x, P.x) : u < 0.66 ? faceTo(cellW(rosterById(BIRD_OWNER)).x, P.x) : -0.45;
    }
    if (id === "yusuf" && t >= folder.from && t < folder.to) return t < pl.folderTouch.off ? faceTo(folderW.x, P.x) : faceTo(T.x, P.x);
    if (t >= take6.from && t < M("спокойные лица").to && id !== "bilal") {
      if (id === "yusuf" && (speaking(29, t) || speaking(33, t) || speaking(35, t))) return faceTo(others.amir.x, P.x);
      if (id === "amir" && (speaking(30, t) || speaking(32, t) || speaking(34, t))) return speaking(32, t) && t < pl.word(32, "Держи", 0.55) ? faceTo(boatW(t).x, P.x) : faceTo(others.yusuf.x, P.x) * 0.7;
      if (speaking(31, t)) return faceTo(T.x, P.x);
      return faceTo(boatW(t).x, P.x);
    }
    if (id === "yusuf" && speaking(35, t)) return faceTo(others.amir.x, P.x);
    if (t >= boatDraw.from && t < amirCard.to && id !== "bilal") return faceTo(treeCardW().x, P.x);
    if (sp === "muhammad") return faceTo(T.x, P.x);
    if (sp && sp !== id) return faceTo(others[sp as MainId].x, P.x);
    if (sp === id) {
      if (id === "yusuf" && (speaking(23, t) || speaking(25, t))) return faceTo(others.amir.x, P.x);
      if (id === "amir" && speaking(24, t)) return faceTo(others.yusuf.x, P.x);
      return faceTo(T.x, P.x);
    }
    if (inPause(t)) return faceTo(T.x, P.x) * 0.8;
    return faceTo(T.x, P.x) * 0.85;
  };

  // ---------- 22 ученика на ковре ----------
  const focusX = (t: number) => {
    const sp = speakerAt(t);
    const P = tPlace(t);
    if (t >= toBoard.from) return t > hang.from ? 680 : P.x;
    if (sp === "muhammad") return P.x;
    if (sp === "yusuf") return AT_TABLE.yusuf.x;
    if (sp === "amir") return amirX(t);
    if (sp === "bilal") return AT_TABLE.bilal.x;
    return 2080; // на столик с листом
  };
  const bgCtl = new Map<string, Ctl>();
  const bgOf = (r: RosterEntry): Ctl => {
    const hit = bgCtl.get(r.id);
    if (hit) return hit;
    const base = kidAt(r.id, r.seat.x, r.seat.y);
    const delay = 3 + Math.floor(hash01(r.pupil.seed + 5) * 14);
    const place = () => base;
    const board = boardOf(r);
    const ctl: Ctl = {
      place,
      face: (t) => {
        const drawingNow = pl.bgDrawingNow(r.id, t);
        const passing = passingArm(r, t);
        if (passing) return passing.face;
        if (drawingNow && !speakerAt(t)) return clamp(0.08 + (hash01(r.pupil.seed) - 0.5) * 0.1, -1, 1);
        if (t >= toBoard.from + sec(1)) return faceTo(680, r.seat.x, 900);
        return faceTo(focusX(t - delay), r.seat.x, 1000);
      },
      pose: (t) => {
        const lap = lapArms(base);
        const micro = bgMicro(t, r.pupil.seed);
        const drawingNow = pl.bgDrawingNow(r.id, t);
        const cs = pl.cardState(r.id, t);
        const hasCard = cs.where === "owner";
        const holdL = { x: board.center.x - board.w * 0.42, y: board.center.y + 1 };
        const passing = passingArm(r, t);
        const looksAtBoard = t >= toBoard.from + sec(1);
        const expr = looksAtBoard && t >= L(40).from ? "softSmile" : drawingNow ? "focused" : "listening";
        let armR: WorldArm = { target: { x: board.center.x + board.w * 0.3, y: board.center.y + 2 }, shape: "relax", elbow: "in" };
        let armL: WorldArm = { target: holdL, shape: "relax", elbow: "in" };
        const drawW = hasCard ? pl.bgDrawWeight(r.id, t) : 0;
        if (drawW > 0) {
          const k = cs.progress;
          const wob = Math.sin(t / 3.1 + r.pupil.seed) * 0.5 + Math.sin(t / 1.7 + r.pupil.seed * 3) * 0.5;
          const tip = { x: board.center.x + board.w * (0.02 + 0.18 * Math.sin(k * 40 + r.pupil.seed)) + wob * 3, y: board.center.y - 2 + wob * 1.5 };
          armR = { target: lerpV(armR.target ?? tip, tip, drawW), shape: drawW > 0.5 ? "pinch" : "relax", elbow: "out" };
        }
        if (passing) {
          if (passing.arms) {
            const a = passing.arms;
            if (a.R) armR = { target: lerpV(armR.target ?? a.R.pt, a.R.pt, a.R.k), shape: a.R.shape, elbow: "out" };
            if (a.L) armL = { target: lerpV(armL.target ?? a.L.pt, a.L.pt, a.L.k), shape: a.L.shape, elbow: "out" };
          } else if (passing.side === "R") armR = { target: passing.target, shape: passing.shape, elbow: "out" };
          else armL = { target: passing.target, shape: passing.shape, elbow: "out" };
        }
        const holdingStack = t > pl.passStart - 30 && t < pl.bilalWalk.collect[2] + 10 && pl.cards(t).some((c) => c.where === "stack" && c.holder === r.id);
        if (holdingStack && !passing) {
          const sp = stackInHand(r.id, t);
          armR = { target: { x: sp.x + 8, y: sp.y + 4 }, shape: "pinch", elbow: "in" };
        } else if (!hasCard && !passing && t > pl.passStart) armR = lap.armR;
        return { floorSit: 1, expr, ...micro, armL, armR, lookY: looksAtBoard ? -0.35 : drawingNow ? 0.5 : micro.lookY };
      },
      armsFront: () => true,
    };
    bgCtl.set(r.id, ctl);
    return ctl;
  };
  const bgMicro = (t: number, seed: number) => {
    const period = 150 + Math.floor(hash01(seed) * 120);
    const k = Math.floor(t / period);
    const local = t - k * period;
    const r = hash01(seed * 7 + k * 3);
    const quiet = inPause(t) ? 0 : 1;
    const shift = r < 0.3 && local < 40 ? Math.sin((local / 40) * Math.PI) * quiet : 0;
    const tilt = r > 0.7 && local > 60 && local < 140 ? smoothstep((local - 60) / 20) * (1 - smoothstep((local - 120) / 20)) * quiet : 0;
    return { lean: shift * 3, headTilt: tilt * (hash01(seed + 2) > 0.5 ? 5 : -5), lookY: 0.05 };
  };
  // Планшет для рисования на скрещённых ногах ученика (мир).
  const boardOf = (r: RosterEntry) => {
    const p = kidAt(r.id, r.seat.x, r.seat.y);
    return { center: { x: p.x + 0.015 * p.h, y: p.y - 0.07 * p.h }, w: 0.27 * p.h };
  };
  // Передача карточки соседу (ручеёк): рука отдающего тянется к точке
  // передачи, рука принимающего — навстречу.
  const holderPlace = (id: string, t = 0): Place => (id === "bilal" ? mainPlace("bilal", t) : kidAt(id, rosterById(id).seat.x, rosterById(id).seat.y));
  const mainOrKid = (id: string, t: number) => holderPlace(id, t);
  // Точка передачи между двумя учениками (на уровне планшетов, посередине).
  const handoffPoint = (from: string, to: string, t: number): Vec => {
    const a = holderPlace(from, t);
    const b = holderPlace(to, t);
    return { x: (a.x + b.x) / 2, y: (a.y - 0.13 * a.h + (b.y - 0.13 * b.h)) / 2 };
  };
  // pt — точка передачи, k — насколько рука уже там (0…1): от своего положения
  // руки к точке передачи тянутся плавно (без скачка в начале и в конце);
  // arms — отдельно для левой и правой руки (принимает одной, отдаёт другой).
  type PassArm = { readonly pt: Vec; readonly k: number; readonly shape: Shape };
  type Passing = { side: "L" | "R"; target: Vec; shape: Shape; face: number; pt?: Vec; k?: number; arms?: { L?: PassArm; R?: PassArm } };
  // Передача стопки ряда (или карточки заднего ряда вперёд): рука отдающего
  // тянется к точке передачи, рука принимающего — навстречу; Билал забирает
  // стопку у конца ряда.
  const passingArm = (r: RosterEntry, t: number): Passing | null => {
    const H = sec(0.32);
    const OUT = sec(0.14); // рука у точки передачи после момента передачи
    const EDGE = 6; // кадров на возврат руки
    const me = holderPlace(r.id, t);
    let best: Passing | null = null;
    let bestK = 0;
    const arms: { L?: PassArm; R?: PassArm } = {};
    const consider = (giver: string, taker: string, at: number) => {
      if (t < at - H || t > at + OUT + EDGE) return;
      if (giver !== r.id && taker !== r.id) return;
      const pt = taker === "bilal" ? { x: (me.x + mainPlace("bilal", t).x) / 2, y: me.y - 0.24 * me.h } : handoffPoint(giver, taker, t);
      const k = win(t, at - H, at + OUT, EDGE);
      if (k <= 0.001) return;
      const side = pt.x >= me.x ? "R" : "L";
      const shape: Shape = k > 0.6 ? "pinch" : "open";
      if (!arms[side] || arms[side]!.k < k) arms[side] = { pt, k, shape };
      if (k <= bestK) return;
      bestK = k;
      const rest = { x: me.x + (pt.x >= me.x ? 1 : -1) * 0.12 * me.h, y: me.y - 0.1 * me.h };
      best = { side, target: lerpV(rest, pt, k), shape, face: faceTo(pt.x, me.x, 500), pt, k, arms };
    };
    for (const row of [0, 1, 2]) {
      const kids = pl.rows[row];
      for (let i = 1; i < kids.length; i++) consider(kids[i - 1].id, kids[i].id, pl.stackArrive(row, i));
      consider(kids[kids.length - 1].id, "bilal", pl.bilalWalk.collect[row]);
    }
    for (const r3 of pl.rows[3]) {
      const seq = pl.hops.get(r3.id);
      if (seq && seq[1]) consider(r3.id, seq[1].holder, seq[1].at);
    }
    return best;
  };
  // Где стопка в руках ученика: у точки передачи (если передаёт) или над планшетом.
  const stackInHand = (id: string, t: number): Vec => {
    const r = rosterById(id);
    const pass = passingArm(r, t);
    const b = boardOf(r);
    const onBoard = { x: b.center.x, y: b.center.y - 6 };
    if (pass) return pass.pt && pass.k !== undefined ? lerpV(onBoard, pass.pt, pass.k) : pass.target;
    return onBoard;
  };

  // Ученик pupil05 протягивает свою птицу Билалу (сцена 3).
  const birdKid = (t: number): Passing | null => {
    const ev = pl.birdPass;
    if (t < ev.offer - sec(0.4) || t > ev.take + sec(0.5)) return null;
    const me = holderPlace(BIRD_OWNER);
    const pt = { x: 1700, y: 1232 };
    const k = win(t, ev.offer - sec(0.4), ev.take + sec(0.2), 10);
    return { side: "R", target: lerpV({ x: me.x + 0.12 * me.h, y: me.y - 0.12 * me.h }, pt, k), shape: k > 0.6 ? "pinch" : "open", face: faceTo(AT_TABLE.bilal.x, me.x, 500) };
  };
  const bg = (r: RosterEntry): Ctl => {
    const c = bgOf(r);
    if (r.id !== BIRD_OWNER) return c;
    return {
      ...c,
      face: (t) => birdKid(t)?.face ?? c.face(t),
      pose: (t) => {
        const b = birdKid(t);
        const pz = c.pose(t);
        return b ? { ...pz, expr: "softSmile", armR: { target: b.target, shape: b.shape, elbow: "out" } } : pz;
      },
    };
  };
  const bgFinal = new Map<string, Ctl>(classRoster.filter((r) => !r.main).map((r) => [r.id, bg(r)]));

  // ---------- предметы в руках (мир) ----------
  // Плавность поз. Поза — функция кадра из нескольких ветвей (действие,
  // реплика, жест, слушание); на стыке ветвей рука или наклон могли бы
  // перескочить за один кадр. Числовые параметры и цели рук усредняются по
  // окну ±SM кадров (треугольные веса, без запаздывания при равномерном
  // движении); форма кисти, локоть и мимика — из текущего кадра. Предметы в
  // руках берут ту же сглаженную позу, поэтому остаются в пальцах.
  const SM = 6;
  const NUM = ["lean", "floorSit", "crouch", "lookX", "lookY", "headTilt", "nod", "sit", "shoulders", "turnBody"] as const;
  // значения по умолчанию рига (если ветвь параметр не задаёт)
  const DEF: Record<(typeof NUM)[number], number> = { lean: 0, floorSit: 0, crouch: 0, lookX: 0, lookY: 0, headTilt: 0, nod: 0, sit: 0, shoulders: 0, turnBody: 0.8 };
  const smoothPose = (raw: (t: number) => PoseIn) => {
    const cache = new Map<number, PoseIn>();
    return (t: number): PoseIn => {
      const hit = cache.get(t);
      if (hit) return hit;
      const cur = raw(t);
      const acc: Record<string, { v: number; w: number }> = {};
      const arms: Record<"armL" | "armR", { x: number; y: number; w: number }> = { armL: { x: 0, y: 0, w: 0 }, armR: { x: 0, y: 0, w: 0 } };
      for (let k = -SM; k <= SM; k++) {
        const w = SM + 1 - Math.abs(k);
        const p = k === 0 ? cur : raw(t + k);
        for (const key of NUM) {
          const v = p[key] ?? DEF[key];
          const a = (acc[key] ??= { v: 0, w: 0, set: false } as { v: number; w: number; set?: boolean });
          a.v += v * w;
          a.w += w;
          if (p[key] !== undefined) (a as { set?: boolean }).set = true;
        }
        for (const side of ["armL", "armR"] as const) {
          const tg = p[side]?.target;
          if (!tg || !cur[side]?.target) continue;
          arms[side].x += tg.x * w;
          arms[side].y += tg.y * w;
          arms[side].w += w;
        }
      }
      const out: Record<string, unknown> = { ...cur };
      for (const key of NUM) if (acc[key]?.w && (acc[key] as { set?: boolean }).set) out[key] = acc[key].v / acc[key].w;
      for (const side of ["armL", "armR"] as const) {
        const a = arms[side];
        const arm = cur[side];
        if (arm && arm.target && a.w) out[side] = { ...arm, target: { x: a.x / a.w, y: a.y / a.w } };
      }
      const res = out as PoseIn;
      if (cache.size > 64) cache.clear();
      cache.set(t, res);
      return res;
    };
  };
  // Слой рук (поверх стола и соседей или за ними) — по тому, где кисти
  // сейчас (в сглаженной позе): кисть на столешнице — поверх; ниже края стола
  // (на коленях) или выше столешницы (жест) — с телом. Так руки не исчезают
  // за столом и не появляются поверх соседа за один кадр.
  // кисти на коленях — y ≈ TABLE.top + 4…14, поэтому граница — чуть выше края
  const onTableTop = (v?: Vec | null) => !!v && v.x > TABLE.x1 - 30 && v.x < TABLE.x2 + 30 && v.y >= TABLE.top - 48 && v.y <= TABLE.top + 1;
  const aboveEdge = (v?: Vec | null) => !!v && v.y < TABLE.top + 3;
  const frontOf = (raw: boolean, p: PoseIn) => {
    const L = p.armL?.target;
    const R = p.armR?.target;
    return onTableTop(L) || onTableTop(R) || (raw && (aboveEdge(L) || aboveEdge(R)));
  };
  const smTeacher = smoothPose((t) => tPoseEx(t).pose);
  const smMain = {
    yusuf: smoothPose((t) => mainPoseEx("yusuf", t).pose),
    amir: smoothPose((t) => mainPoseEx("amir", t).pose),
    bilal: smoothPose((t) => mainPoseEx("bilal", t).pose),
  } as const;

  const held = (t: number): HeldItem[] => {
    const out: HeldItem[] = [];
    const tp = smTeacher(t);
    const handPt = (a: WorldArm | undefined) => (a?.target ? a.target : null);
    // карточки
    for (const cs of pl.cards(t)) {
      if (cs.where !== "hand" || !cs.holder) continue;
      let pos: Vec | null = null;
      if (cs.holder === "muhammad") pos = t >= pl.stackToTeacher.take ? (handPt(tp.armR) ?? handPt(tp.armL)) : (handPt(tp.armL) ?? handPt(tp.armR));
      else if (cs.holder === "yusuf" || cs.holder === "amir" || cs.holder === "bilal") {
        const pz = smMain[cs.holder](t);
        pos = handPt(pz.armR) ?? handPt(pz.armL);
        if (cs.holder === "bilal" && cs.owner === BIRD_OWNER) pos = handPt(pz.armL);
      } else {
        // карточка в руке ученика (птица) — рисуется на его глубине (heldBg)
        continue;
      }
      if (pos) out.push({ type: "card", id: cs.owner, pos: { x: pos.x, y: pos.y - 6 }, squash: 0.35, rot: 0 });
    }
    // стопка у учителя (в руке)
    const stack = pl.cards(t).filter((c) => c.where === "stack");
    const inHand = (who: string) => stack.filter((c) => c.holder === who && !(who === "muhammad" && c.desk)).length;
    const nT = inHand("muhammad");
    if (nT) {
      const pt = t >= pl.stackToTeacher.take + sec(0.45) ? handPt(tp.armL) : handPt(tp.armR);
      if (pt) out.push({ type: "stack", pos: { x: pt.x, y: pt.y - 6 }, count: nT });
    }
    // текстовые карточки в руке учителя
    for (const which of ["one", "two"] as const) {
      const ts = pl.textState(which, t);
      if (ts.where !== "hand") continue;
      const pt = handPt(tp.armR);
      if (pt) out.push({ type: "textCard", which, pos: { x: pt.x - 10, y: pt.y - 12 }, back: ts.flip < 0.5, squash: 0.15 });
    }
    // карандаши главных героев
    for (const id of ["yusuf", "amir", "bilal"] as const) {
      const ps = pl.pencil(id, t);
      if (!ps.inHand) continue;
      const pt = handPt(smMain[id](t).armR);
      if (pt) out.push({ type: "pencil", tip: { x: pt.x - 2, y: pt.y - 0.035 * mainPlace(id, t).h + 1 }, color: PENCIL_COLOR[id], angle: id === "yusuf" ? 28 : 22 });
    }
    // синий карандаш для лодочки (сцена 7)
    const bpn = pl.boatPencil;
    if (t >= bpn.yGrab && t < bpn.down) {
      const who = t < bpn.handoff ? "yusuf" : "amir";
      const pz = smMain[who](t);
      const pt = who === "yusuf" ? handPt(pz.armL) : handPt(pz.armR);
      if (pt) out.push({ type: "pencil", tip: { x: pt.x, y: pt.y - 0.035 * mainPlace(who, t).h + 1 }, color: BOAT_PENCIL, angle: who === "yusuf" ? -24 : 24 });
    }
    // маркер учителя
    if (t >= pl.write.cap - sec(0.1) && t < pl.markerDown) {
      const pt = handPt(tp.armR);
      if (pt) out.push({ type: "marker", tip: { x: pt.x - 2, y: pt.y - 0.03 * tPlace(t).h }, capOff: t >= pl.write.cap + sec(0.3) && t < pl.markerDown - sec(0.3), angle: 20 });
    }
    // плакат
    const ph = posterHeld(t);
    if (ph) out.push({ type: "poster", center: ph.center, lift: ph.lift });
    return out;
  };

  // Предметы в руках учеников и Билала (сцена 3 — птица, сцена 7 — стопки):
  // рисуются на глубине того, кто держит (y), чтобы не ложиться на лица впереди.
  const heldBg = (t: number): { y: number; item: HeldItem }[] => {
    const out: { y: number; item: HeldItem }[] = [];
    const cs = pl.cards(t);
    const bird = cs.find((c) => c.owner === BIRD_OWNER);
    if (bird && bird.where === "hand" && bird.holder === BIRD_OWNER) {
      const b = birdKid(t);
      const me = holderPlace(BIRD_OWNER);
      if (b) out.push({ y: me.y + 0.5, item: { type: "card", id: BIRD_OWNER, pos: { x: b.target.x, y: b.target.y - 6 }, squash: 0.35, rot: 0 } });
    }
    if (bird && bird.where === "hand" && bird.holder === "bilal") {
      const pt = smMain.bilal(t).armL?.target;
      if (pt) out.push({ y: TABLE.top + 2, item: { type: "card", id: BIRD_OWNER, pos: { x: pt.x, y: pt.y - 6 }, squash: 0.35, rot: 0 } });
    }
    const counts = new Map<string, number>();
    for (const c of cs) if (c.where === "stack" && c.holder && c.holder !== "muhammad") counts.set(c.holder, (counts.get(c.holder) ?? 0) + 1);
    for (const [who, n] of counts) {
      if (who === "bilal") {
        const P = mainPlace("bilal", t);
        const pt = smMain.bilal(t).armL?.target;
        if (pt) out.push({ y: P.y + 0.5, item: { type: "stack", pos: { x: pt.x, y: pt.y - 6 }, count: n } });
        continue;
      }
      const me = holderPlace(who);
      const pt = stackInHand(who, t);
      out.push({ y: me.y + 0.5, item: { type: "stack", pos: { x: pt.x, y: pt.y - 4 }, count: n } });
    }
    return out;
  };

  return {
    heldBg,
    // учитель за столиком: руки всегда поверх стола (в покое левая кисть у
    // тела и не заходит на Юсуфа) — без смены слоя при каждом действии
    teacher: { place: tPlace, face: tFace, pose: smTeacher, armsFront: (t: number) => (tPlace(t).y > TABLE.top + 20 ? true : frontOf(tPoseEx(t).front, smTeacher(t))) } as Ctl,
    yusuf: { place: (t: number) => mainPlace("yusuf", t), face: (t: number) => mainFace("yusuf", t), pose: smMain.yusuf, armsFront: (t: number) => frontOf(mainPoseEx("yusuf", t).front, smMain.yusuf(t)) } as Ctl,
    amir: { place: (t: number) => mainPlace("amir", t), face: (t: number) => mainFace("amir", t), pose: smMain.amir, armsFront: (t: number) => frontOf(mainPoseEx("amir", t).front, smMain.amir(t)) } as Ctl,
    bilal: { place: (t: number) => mainPlace("bilal", t), face: (t: number) => mainFace("bilal", t), pose: smMain.bilal, armsFront: (t: number) => frontOf(mainPoseEx("bilal", t).front, smMain.bilal(t)) } as Ctl,
    bg: (r: RosterEntry) => bgFinal.get(r.id)!,
    boardOf,
    held,
    posterHeld,
    boatW,
    boatPlace,
    BOAT_W,
    walk: { teacher: { from: walkFrom, to: walkTo }, kids: kidsWalk },
    posterOnBoard: (t: number) => t >= pl.hangEv.press,
  };
};
