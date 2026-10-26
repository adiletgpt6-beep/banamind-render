// Хореография фильма 80-1-9: для каждого персонажа функции кадра → место,
// направление взгляда и поза (руки, мимика, посадка, жевание); состояние
// реквизита (тарелка Юсуфа и кусочки яблока, поднос и 25 салфеток, тарелки
// учеников). Все моменты берутся из шкалы (реплики, паузы, отрезки
// действий) и журнала салфеток (route.ts, napkins.ts), поэтому при
// перезаписи озвучки постановка пересчитывается сама. Всё детерминированно
// по номеру кадра; состояние с произвольного кадра — правильное.
import { FPS } from "../core/video.ts";
import type { Place, PoseIn, WorldArm } from "../rig/Actor";
import type { Look } from "../rig/looks";
import { clamp, easeInOut, easeOut, glide, hash01, lerp, smoothstep, type Vec } from "../rig/motion.ts";
import { BG_IDS, castById, heightAt, seatPlace, teacherPlaceAt, type CastPupil } from "./cast.ts";
import { AT_TABLE, BG_NAPKIN_W, BG_PLATE_DY, BG_PLATE_W, NAPKIN_AT, NAPKIN_W, PLATE_W, PLATES, TABLE, TABLE_SURFACE_Y, TEACHER_ENTER, TRAY_ON_TABLE, TRAY_W } from "./layout.ts";
import { napkinGrip, napkinOtherGrip, plateSlot, sliceW, trayTop } from "./propsGeom.ts";
import { napkinId, napkinStateAt, trayCountAt, type NapkinEvent, type NapkinLog, type NapkinState } from "./napkins.ts";
import { buildRoute, GIVE, type BilalRoute, type GiveStop } from "./route.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

export type Ctl = {
  readonly place: (t: number) => Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  // кисти поверх столешницы (касание предметов на столе)
  readonly armsFront: (t: number) => boolean;
};

export type ItemPose = { readonly pos: Vec; readonly rot: number; readonly flat: number };
export type NapkinPose = ItemPose & { readonly w: number; readonly id: string; readonly state: NapkinState; readonly holder: string | null; readonly ev: NapkinEvent };
export type TrayPose = { readonly pos: Vec; readonly count: number; readonly carried: boolean };
export type PlatePose = { readonly pos: Vec; readonly slices: readonly boolean[]; readonly carried: boolean };
export type SlicePose = { readonly pos: Vec; readonly rot: number; readonly bite: number; readonly owner: string; readonly w: number };

// Опорные точки нарисованного персонажа (rig/Actor: actorAnchors) — сцена
// передаёт их при сборке, чтобы кусочек яблока приходил ровно ко рту. Без
// них (проверки в Node) рот оценивается по построению фигуры.
export type AnchorFn = (a: { readonly look: Look; readonly place: Place; readonly pose: PoseIn; readonly bodyTurn: number; readonly headTurn: number }) => { readonly mouth: Vec };

export type Events = {
  readonly plateContact: number; // дно тарелки Юсуфа коснулось столика
  readonly plateRelease: number; // рука учителя отпустила тарелку
  readonly teacherKneel: { from: number; to: number };
  readonly teacherSit: { from: number; to: number };
  readonly yusufNapkinPlaced: number; // салфетка №24 легла перед Юсуфом
  readonly lastTake: number; // Юсуф снял последнюю салфетку с подноса
  readonly lastTouch: number; // пальцы Юсуфа коснулись края последней салфетки
  readonly lastContact: number; // руки Юсуфа и Билала встретились на салфетке
  readonly lastRelease: number; // Юсуф отпустил: салфетка у Билала
  readonly sliceTake: number; // Юсуф взял кусочек яблока правой рукой
  readonly bite1: number;
  readonly bite2: number;
  readonly chewEnd: number; // последнее жевательное движение
  readonly trayOnTable: number;
};

export type Choreo = {
  readonly teacher: Ctl;
  readonly yusuf: Ctl;
  readonly amir: Ctl;
  readonly bilal: Ctl;
  readonly bg: (p: CastPupil) => Ctl;
  readonly route: BilalRoute;
  readonly log: NapkinLog;
  readonly napkins: (t: number) => readonly NapkinPose[]; // салфетки не на подносе
  readonly tray: (t: number) => TrayPose;
  readonly yusufPlate: (t: number) => PlatePose;
  readonly yusufSlice: (t: number) => SlicePose | null;
  readonly bgPlate: (id: string, t: number) => readonly boolean[];
  readonly bgSlice: (id: string, t: number) => SlicePose | null;
  readonly chewing: (id: string, t: number) => number; // 0…1 — жуёт (рот закрыт)
  readonly events: Events;
};

const sec = (s: number) => Math.round(s * FPS);
const seg = (t: number, from: number, to: number) => (to <= from ? (t >= to ? 1 : 0) : clamp((t - from) / (to - from)));
const mix = (a: Vec, b: Vec, u: number): Vec => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
const arc = (a: Vec, b: Vec, u: number, lift: number): Vec => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) - lift * Math.sin(Math.PI * clamp(u)) });
// Плавное окно 0…1 с краями (кадры).
const win = (t: number, from: number, to: number, edge = 8) => smoothstep((t - from) / edge) * (1 - smoothstep((t - to) / edge));
// Поворот головы к точке мира из точки x.
const faceTo = (targetX: number, x: number, k = 760) => clamp((targetX - x) / k, -0.85, 0.85);
// Цель руки — точка захвата в кисти (aim "grip", rigStyle 2): щепоть, обхват
// или середина ладони приходятся ровно на target — там, где нарисован предмет.
const arm = (target: Vec, shape: WorldArm["shape"] = "open", elbow: WorldArm["elbow"] = "out"): WorldArm => ({ target, shape, elbow, aim: "grip" });

// Кисти в коленях сидящего на ковре (как в 80-1-8); плечо висит вдоль
// корпуса, предплечье — к колену.
// Сидящие поворачивают корпус меньше головы: |поворот корпуса| ≤ 0,36, так
// что дальняя рука не начинает «уходить за спину» (полупрозрачной).
const SEATED_TURN = 0.42;
const seated = (p: PoseIn): PoseIn => ({ turnBody: SEATED_TURN, ...p });
const lapOf = (p: Place) => ({
  L: { x: p.x - 0.13 * p.h, y: p.y - 0.04 * p.h },
  R: { x: p.x + 0.13 * p.h, y: p.y - 0.04 * p.h },
});
const lapArms = (p: Place): { armL: WorldArm; armR: WorldArm } => {
  const l = lapOf(p);
  return { armL: arm(l.L, "relax", "hang"), armR: arm(l.R, "relax", "hang") };
};

// Рот сидящего на ковре (мировые px) — по построению фигуры (looks.ts,
// Figure.tsx): таз опущен на ковёр, центр головы и рот выше.
const mouthSeated = (p: Place, build: { headY: number; headRy: number; leg: number; hipJointY: number; child: boolean }, lean = 0): Vec => {
  const dy = -build.leg * 1.3 - 6 - build.hipJointY;
  const k = p.h / 1000;
  const headCy = build.headY + dy + lean * 1.6 * 1.15;
  return { x: p.x, y: p.y + (headCy + build.headRy * (build.child ? 0.62 : 0.6)) * k };
};

export const buildChoreo = (tl: L80Timeline, anchors?: AnchorFn): Choreo => {
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
  const inPause = (t: number) => tl.pauses.some((ps) => t / FPS >= ps.from - 0.05 && t / FPS <= ps.to + 0.02);
  const scene = (t: number) => tl.sceneOf(t / FPS);
  const end = tl.durationInFrames;

  // ---------- места ----------
  const yusufC = castById("yusuf");
  const amirC = castById("amir");
  const bilalC = castById("bilal");
  const yusufP = seatPlace(yusufC);
  const amirP = seatPlace(amirC);
  const yLap = lapOf(yusufP);
  const aLap = lapOf(amirP);
  const teacherSeat = teacherPlaceAt(AT_TABLE.teacher.x, AT_TABLE.teacher.y);

  // ---------- маршрут Билала и журнал салфеток ----------
  const route = buildRoute(tl);
  const s5 = M("салфетка Юсуфу");
  const notice = M("Юсуф замечает");
  const takeHold = M("Юсуф берёт салфетку");
  const accept = M("Билал принимает");
  const l29 = L(29);
  const l30 = L(30);
  const l31 = L(31);
  // №24: Билал (сидя) кладёт салфетку перед Юсуфом
  const y24 = { reach: s5.from + sec(0.5), take: s5.from + sec(1.0), lift: s5.from + sec(1.4), place: s5.from + sec(2.4), back: s5.from + sec(3.1) };
  // №25: Юсуф берёт последнюю чистую салфетку и отдаёт Билалу
  const y25 = {
    prep: takeHold.from,
    reach: takeHold.from + sec(0.25),
    touch: takeHold.from + sec(0.8),
    take: takeHold.from + sec(1.05),
    lift: takeHold.from + sec(1.55),
    extend: l29.from + sec(0.15),
    meet: accept.from + 2,
    release: accept.from + sec(0.5),
    yBack: accept.from + sec(1.25),
    bilalChest: accept.from + sec(0.9),
    settle: l31.from + sec(1.4),
    bilalBack: l31.from + sec(2.1),
  };
  const events25: NapkinEvent = { napkin: napkinId(24), giver: "yusuf", recipient: "bilal", take: y25.take, contact: y25.meet, release: y25.release, settle: y25.settle };
  const events24: NapkinEvent = { napkin: napkinId(23), giver: "bilal", recipient: "yusuf", take: y24.take, contact: y24.place, release: y24.place, settle: y24.place };
  const log: NapkinLog = { total: 25, events: [...route.stops.map((s) => s.ev), events24, events25] };

  // ---------- Билал: место, поднос ----------
  const bilalStanding = (t: number) => t < route.sitDown.from;
  const bilalPos = (t: number): Vec => {
    if (t >= route.sitDown.from) {
      const u = easeInOut(seg(t, route.sitDown.from, route.sitDown.to));
      return mix(route.seatBehind, route.seat, u);
    }
    for (const sg of route.segs) if (t >= sg.from && t <= sg.to) return glide(t, sg.from, sg.to, sg.pts);
    // между отрезками — стоит на последней точке
    let p = route.start;
    for (const sg of route.segs) if (t > sg.to) p = sg.pts[sg.pts.length - 1];
    return p;
  };
  const bilalPlace = (t: number): Place => {
    const p = bilalPos(t);
    return { x: p.x, y: p.y, h: heightAt(bilalC.age, p.y) };
  };
  const stopAt = (t: number): GiveStop | null => route.stops.find((s) => t >= s.arrive - 2 && t < s.depart + 2) ?? null;
  // поднос в руках: перед животом, у пояса (стоя); сидя — на коленях, затем на столике
  const trayCarried = (t: number): Vec => {
    const P = bilalPlace(t);
    if (t >= route.sitDown.from) {
      const u = easeInOut(seg(t, route.sitDown.from, route.sitDown.to));
      const standing = { x: P.x + 0.02 * P.h, y: P.y - 0.56 * P.h };
      const lap = { x: P.x + 0.05 * P.h, y: P.y - 0.2 * P.h };
      return mix(standing, lap, u);
    }
    const st = stopAt(t);
    // у ученика поднос чуть отходит к опорной руке (дальней от ученика)
    const k = st ? win(t, st.arrive + GIVE.turn, st.arrive + GIVE.back, 6) : 0;
    const side = st?.side ?? 1;
    return { x: P.x + 0.02 * P.h - side * 0.035 * P.h * k, y: P.y - 0.56 * P.h - 0.01 * P.h * k };
  };
  const tray = (t: number): TrayPose => {
    const count = trayCountAt(log, t);
    if (t < route.trayDown.reach) return { pos: trayCarried(t), count, carried: true };
    const on: Vec = { x: TRAY_ON_TABLE.x, y: TRAY_ON_TABLE.y };
    if (t < route.trayDown.contact) {
      const u = easeInOut(seg(t, route.trayDown.reach, route.trayDown.contact));
      return { pos: arc(trayCarried(route.trayDown.reach), on, u, 18), count, carried: true };
    }
    return { pos: on, count, carried: false };
  };
  // верх стопки (откуда снимают салфетку) — та же геометрия, что в рисунке
  // подноса; считается и салфетка, которую берут именно в этот момент
  const trayTopAt = (t: number): Vec & { readonly rot: number } => {
    const tr = tray(t);
    return trayTop(tr.pos.x, tr.pos.y, TRAY_W, trayCountAt(log, t - 1));
  };

  // ---------- салфетки ----------
  // В пальцах салфетка висит за угол 0 (props: napkinGrip): у того, кто
  // держит её слева, — поворот ≈ 0°, справа — ≈ 90° (угол 0 сверху справа).
  // Получатель берётся за второй верхний угол (napkinOtherGrip).
  const heldRot = (giverOnRight: boolean) => (giverOnRight ? 90 : 0);
  const napkinW = (e: NapkinEvent) => (BG_IDS.includes(e.recipient) ? BG_NAPKIN_W : NAPKIN_W);
  const napkinFor = (e: NapkinEvent, t: number): NapkinPose | null => {
    const state = napkinStateAt(e, t);
    if (state === "tray") return null;
    const base = { id: e.napkin, state, ev: e, w: napkinW(e) };
    const stop = route.stops.find((s) => s.ev === e);
    if (stop) {
      const top = trayTopAt(e.take);
      // Билал держит салфетку со своей стороны: ученик слева (side −1) → Билал справа
      const r0 = heldRot(stop.side < 0) - stop.side * 6;
      const rest = r0 + stop.side * 12;
      if (state === "placed") return { ...base, holder: null, pos: stop.rest, rot: rest, flat: 1 };
      if (state === "giverHand") {
        const u = easeInOut(seg(t, e.take, e.contact));
        return { ...base, holder: "bilal", pos: arc(top, stop.meet, u, 10), rot: lerp(top.rot, r0, Math.min(1, u * 1.6)), flat: lerp(1, 0, Math.min(1, u * 2)) };
      }
      if (state === "sharedContact") return { ...base, holder: "both", pos: stop.meet, rot: r0, flat: 0 };
      // в руке получателя: опускает к своей тарелке и кладёт
      const u = easeInOut(seg(t, e.release, e.settle));
      return { ...base, holder: e.recipient, pos: arc(stop.meet, stop.rest, u, -6), rot: lerp(r0, rest, u), flat: smoothstep((u - 0.55) / 0.45) };
    }
    if (e === events24) {
      // Билал снимает со стопки и кладёт перед Юсуфом (держит слева)
      const top = trayTopAt(e.take);
      const dest: Vec = { x: NAPKIN_AT.yusuf.x, y: NAPKIN_AT.yusuf.y };
      if (state === "placed") return { ...base, holder: null, pos: dest, rot: -3, flat: 1 };
      const u = easeInOut(seg(t, y24.take, y24.place));
      return { ...base, holder: "bilal", pos: arc(top, dest, u, 26), rot: lerp(top.rot, -3, u), flat: lerp(1, 0.4, Math.sin(Math.PI * u)) };
    }
    // №25: Юсуф → Билал (Юсуф справа — держит за правый верхний угол)
    const top = trayTopAt(y25.take);
    const meetPt = meet25;
    const dest: Vec = { x: NAPKIN_AT.bilal.x, y: NAPKIN_AT.bilal.y };
    const r0 = heldRot(true);
    if (state === "placed") return { ...base, holder: null, pos: dest, rot: r0 + 4, flat: 1 };
    if (state === "giverHand") {
      const lifted: Vec = { x: top.x + 4, y: top.y - 26 };
      if (t < y25.lift) {
        const u = easeOut(seg(t, y25.take, y25.lift));
        return { ...base, holder: "yusuf", pos: mix(top, lifted, u), rot: lerp(top.rot, r0 + 6, u), flat: lerp(1, 0, u) };
      }
      const u = easeInOut(seg(t, y25.extend, y25.meet));
      return { ...base, holder: "yusuf", pos: arc(lifted, meetPt, u, 8), rot: lerp(r0 + 6, r0 + 10, u), flat: 0 };
    }
    if (state === "sharedContact") return { ...base, holder: "both", pos: meetPt, rot: r0 + 10, flat: 0 };
    // у Билала: к груди, потом кладёт рядом со своей тарелкой
    const chest: Vec = { x: AT_TABLE.bilal.x + 18, y: meetPt.y + 14 };
    if (t < y25.bilalChest) {
      const u = easeInOut(seg(t, y25.release, y25.bilalChest));
      return { ...base, holder: "bilal", pos: mix(meetPt, chest, u), rot: lerp(r0 + 10, r0 + 2, u), flat: 0 };
    }
    const u = easeInOut(seg(t, y25.settle - sec(0.7), y25.settle));
    return { ...base, holder: "bilal", pos: arc(chest, dest, u, 6), rot: lerp(r0 + 2, r0 + 4, u), flat: smoothstep((u - 0.5) / 0.5) };
  };
  // точка встречи рук при последней передаче: над подносом, между мальчиками
  const meet25: Vec = { x: (AT_TABLE.bilal.x + AT_TABLE.yusuf.x) / 2 + 6, y: yusufP.y - 0.28 * yusufP.h };
  const napkins = (t: number) => log.events.map((e) => napkinFor(e, t)).filter((x): x is NapkinPose => x !== null);
  // точки хвата: того, кто дал (угол 0), и того, кто принял (второй верхний угол)
  const gripA = (n: NapkinPose): Vec => {
    const g = napkinGrip(n.w, n.rot, n.flat);
    return { x: n.pos.x + g.x, y: n.pos.y + g.y };
  };
  const gripB = (n: NapkinPose): Vec => {
    const g = napkinOtherGrip(n.w, n.rot, n.flat);
    return { x: n.pos.x + g.x, y: n.pos.y + g.y };
  };
  const gripAt = (e: NapkinEvent, t: number, who: "A" | "B"): Vec => {
    const n = napkinFor(e, t)!;
    return who === "A" ? gripA(n) : gripB(n);
  };
  const napkinHeldBy = (who: string, t: number) => napkins(t).find((n) => n.holder === who || (n.holder === "both" && (n.ev.giver === who || n.ev.recipient === who))) ?? null;

  // ---------- учитель и тарелка Юсуфа ----------
  const open = M("общий план: угощение");
  const plateHold = M("тарелка Юсуфу");
  const sitHold = M("учитель присаживается");
  // подходит (стоя) → опускается на колено → садится на ковёр → ставит тарелку
  const enter = { from: open.from + sec(0.4), to: open.from + sec(2.9) };
  const kneel = { from: enter.to + 2, to: enter.to + sec(1.0) };
  const tSit = { from: kneel.to, to: kneel.to + sec(1.1) };
  const plateDown = { from: Math.max(tSit.to + sec(0.3), plateHold.from + sec(0.7)), to: Math.max(tSit.to + sec(0.3), plateHold.from + sec(0.7)) + sec(1.4) };
  const plateRelease = plateDown.to + sec(0.25);
  const handsBack = plateRelease + sec(0.8);
  // сцена 2: «присаживается» к Юсуфу — наклоняется к уровню его глаз
  const tLean = { from: sitHold.from + sec(0.2), to: sitHold.from + sec(1.6) };
  const teacherXY = (t: number): Vec => {
    if (t < enter.from) return TEACHER_ENTER.from;
    return glide(t, enter.from, enter.to, [TEACHER_ENTER.from, TEACHER_ENTER.to]);
  };
  const teacherPlace = (t: number): Place => {
    const v = teacherXY(t);
    return teacherPlaceAt(v.x, v.y);
  };
  const kneelAt = (t: number) => (t < tSit.from ? easeInOut(seg(t, kneel.from, kneel.to)) : 1 - easeInOut(seg(t, tSit.from, tSit.to)));
  const sitAt = (t: number) => easeInOut(seg(t, tSit.from, tSit.to));
  const leanToYusuf = (t: number) => (t < tLean.from ? 0 : easeInOut(seg(t, tLean.from, tLean.to)));
  const plateHome: Vec = { x: PLATES.yusuf.x, y: PLATES.yusuf.y };
  // тарелка в руках учителя: перед животом при ходьбе; садясь, он отводит
  // её влево, к месту Юсуфа — над краем столика, левее кувшина и ниже лица
  // Юсуфа
  const plateSeated: Vec = { x: PLATES.yusuf.x + 60, y: TABLE_SURFACE_Y - 75 };
  const plateInHands = (t: number): Vec => {
    const P = teacherPlace(t);
    const k = kneelAt(t);
    const sdown = sitAt(t);
    const carry = { x: P.x - 0.04 * P.h - 0.03 * P.h * k, y: P.y - lerp(0.5, 0.36, k) * P.h };
    return mix(carry, plateSeated, easeInOut(sdown));
  };
  // ---------- кусочек яблока Юсуфа ----------
  const meal = M("еда");
  const toPlate = M("Юсуф к тарелке");
  const SLICE_TAKEN = 1; // какой кусочек берёт Юсуф (ближний к правой руке)
  const sl = {
    reach: meal.from + sec(0.1),
    take: meal.from + sec(0.75),
    atMouth1: meal.from + sec(1.5),
    bite1: meal.from + sec(1.65),
    down1: meal.from + sec(2.2),
    up2: meal.from + sec(3.6),
    bite2: meal.from + sec(4.05),
    handBack: meal.from + sec(4.9),
    chewEnd: meal.to - sec(0.55),
  };
  const yusufPlate = (t: number): PlatePose => {
    const slices = [0, 1, 2, 3, 4].map((i) => !(i === SLICE_TAKEN && t >= sl.take));
    if (t >= plateDown.to) return { pos: plateHome, slices, carried: false };
    if (t < plateDown.from) return { pos: plateInHands(t), slices, carried: true };
    // левее кувшина плавно вниз на столик перед Юсуфом
    const u = easeInOut(seg(t, plateDown.from, plateDown.to));
    return { pos: arc(plateInHands(plateDown.from), plateHome, u, 6), slices, carried: true };
  };
  // рот сидящего на ковре при еде (взгляд чуть вниз, голова почти прямо)
  const mouthAt = (look: Look, place: Place, face: number, lookY: number): Vec =>
    anchors ? anchors({ look, place, pose: { floorSit: 1, expr: "calm", lookY }, bodyTurn: face * 0.8, headTurn: face }).mouth : mouthSeated(place, look.build);
  const yMouth = mouthAt(yusufC.look, yusufP, 0.02, 0.15);
  // кусочек: (x, y) — центр, ось +x — к откусываемому концу; держат щепотью
  // у дальнего от рта конца, кончик приходит ко рту
  const sliceDir = (rot: number): Vec => ({ x: Math.cos((rot * Math.PI) / 180), y: Math.sin((rot * Math.PI) / 180) });
  const sliceAtMouth = (mouth: Vec, rot: number, len: number): Vec => {
    const d = sliceDir(rot);
    return { x: mouth.x - d.x * len * 0.42, y: mouth.y + 1 - d.y * len * 0.42 };
  };
  const sliceHold = (sp: SlicePose): Vec => {
    const d = sliceDir(sp.rot);
    return { x: sp.pos.x - d.x * sp.w * 0.3, y: sp.pos.y - d.y * sp.w * 0.3 };
  };
  const Y_SLICE_W = sliceW(PLATE_W);
  const BG_SLICE_W = sliceW(BG_PLATE_W);
  const sliceRest = (i: number) => plateSlot(plateHome.x, plateHome.y, PLATE_W, 5, i);
  const yusufSlice = (t: number): SlicePose | null => {
    if (t < sl.take || t >= sl.bite2) return null;
    const from = sliceRest(SLICE_TAKEN);
    const ROT = -60;
    const atMouth = sliceAtMouth(yMouth, ROT, Y_SLICE_W);
    const lowered: Vec = { x: yusufP.x - 0.04 * yusufP.h, y: yusufP.y - 0.17 * yusufP.h };
    let pos: Vec;
    let rot = ROT;
    if (t < sl.atMouth1) {
      const u = easeInOut(seg(t, sl.take, sl.atMouth1));
      pos = arc(from, atMouth, u, 10);
      rot = lerp(from.rot, ROT, Math.min(1, u * 1.5));
    } else if (t < sl.bite1 + 3) pos = atMouth;
    else if (t < sl.up2) pos = mix(atMouth, lowered, easeInOut(seg(t, sl.bite1 + 3, sl.down1)));
    else pos = mix(lowered, atMouth, easeInOut(seg(t, sl.up2, sl.bite2)));
    return { pos, rot, bite: t >= sl.bite1 ? 1 : 0, owner: "yusuf", w: Y_SLICE_W };
  };
  // жевание: после каждого укуса, ровно до chewEnd; речи в это время нет
  const chewYusuf = (t: number) => {
    if (t < sl.bite1 || t > sl.chewEnd + 6) return 0;
    const pause = t > sl.up2 - 6 && t < sl.bite2 + 2 ? 0.4 : 1;
    return pause * (1 - smoothstep((t - sl.chewEnd) / 6));
  };

  // ---------- фоновые ученики: тарелки и еда в финале ----------
  const fin = M("финал: класс");
  const eaters = new Map<string, number>();
  ["bg02", "bg05", "bg09", "bg12", "bg17", "bg20"].forEach((id, i) => eaters.set(id, fin.from - sec(1.2) + i * 9 + Math.floor(hash01(i + 41) * 10)));
  const bgPlate = (id: string, t: number) => {
    const s = eaters.get(id);
    return [0, 1, 2, 3].map((i) => !(s !== undefined && i === 1 && t >= s + 14));
  };

  const events: Events = {
    plateContact: plateDown.to,
    plateRelease,
    teacherKneel: kneel,
    teacherSit: tSit,
    yusufNapkinPlaced: y24.place,
    lastTake: y25.take,
    lastTouch: y25.touch,
    lastContact: y25.meet,
    lastRelease: y25.release,
    sliceTake: sl.take,
    bite1: sl.bite1,
    bite2: sl.bite2,
    chewEnd: sl.chewEnd,
    trayOnTable: route.trayDown.contact,
  };

  // ========== учитель ==========
  const tFace = (t: number) => {
    const P = teacherPlace(t);
    const toY = faceTo(yusufP.x, P.x);
    const sp = speakerOf(t);
    if (t < enter.to) return t < enter.from ? -0.3 : -0.55; // идёт к Юсуфу
    if (t < handsBack) return -0.42; // на тарелку
    if (t >= M("учитель к классу").from && t < L(40).to + 6) return speaking(36, t) || speaking(38, t) || speaking(34, t) ? -0.12 : inPause(t) ? -0.1 : sp === "muhammad" ? -0.15 : sp ? faceTo(sp === "amir" ? amirP.x : sp === "bilal" ? AT_TABLE.bilal.x : yusufP.x, P.x) : -0.12;
    if (sp === "amir") return faceTo(amirP.x, P.x);
    if (sp === "bilal") return faceTo(AT_TABLE.bilal.x, P.x);
    if (sp === "yusuf") return toY;
    if (t >= s5.from && t < y24.back) return faceTo(NAPKIN_AT.yusuf.x, P.x);
    if (t >= notice.from && t < l30.to) return faceTo(AT_TABLE.bilal.x + 60, P.x);
    if (t >= meal.from - sec(1) && t < meal.to) return toY;
    if (sp === "muhammad") {
      if (speaking(31, t)) return faceTo(AT_TABLE.bilal.x + 80, P.x);
      if (speaking(33, t) || speaking(24, t)) return faceTo(AT_TABLE.bilal.x, P.x);
      return toY;
    }
    if (scene(t) === "s8" && t >= fin.from) return -0.35;
    return toY * 0.9;
  };
  const tPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const P = teacherPlace(t);
    const k = kneelAt(t);
    const s = sitAt(t);
    const base: PoseIn = { kneel: k, floorSit: s, expr: "calm", lookY: 0.15 + 0.15 * k };
    // тарелка: учитель несёт её правой рукой (на экране левой) за ближний
    // край, большой палец сверху; сидя переносит на столик перед Юсуфом,
    // дно касается столика, пальцы разжимаются, рука возвращается
    if (t < handsBack) {
      const pl = yusufPlate(t);
      const rel = easeInOut(seg(t, plateRelease, handsBack));
      const lap = lapOf(P);
      const grip: Vec = { x: pl.pos.x + PLATE_W * 0.4, y: pl.pos.y + 2 };
      const restL: Vec = s > 0.5 ? lap.L : { x: P.x - 0.1 * P.h, y: P.y - lerp(0.36, 0.3, k) * P.h };
      // свободная рука, пока идёт и опускается на колено, висит вдоль тела
      const freeR: WorldArm = s > 0.5 ? arm(lap.R, "relax", "hang") : { target: null, shape: "relax" };
      const hL = mix(grip, restL, rel);
      const holding = rel < 0.1;
      return {
        pose: {
          ...base,
          expr: t < plateDown.to ? "focused" : "softSmile",
          lean: (t < enter.to ? 2 : 8) * (1 - rel),
          lookY: t < enter.to ? 0.3 : 0.45,
          // стоя и на колене предплечье направлено к зрителю: тарелка перед
          // животом, локоть у бока
          armL: { ...arm(hL, holding ? "grip" : "relax", "down"), fore: lerp(0.55, 1, s) },
          armR: freeR,
        },
        front: t >= plateDown.from && rel < 0.6,
      };
    }
    const lap = lapArms(P);
    const kneelRest = (side: -1 | 1): Vec => ({ x: P.x + side * 0.1 * P.h, y: P.y - 0.3 * P.h });
    const restArms = s > 0.5 ? lap : { armL: arm(kneelRest(-1), "relax", "down"), armR: arm(kneelRest(1), "relax", "down") };
    const lt = leanToYusuf(t);
    const lean = 3 * k + 3 * s + 7 * lt;
    const lookY = 0.22 + 0.2 * lt;
    // объясняющий жест: открытая ладонь к угощению (левая на экране — к Юсуфу)
    const gestures: readonly [number, number][] = [
      [4, 0.75],
      [6, 0.55],
      [8, 0.8],
      [12, 0.5],
      [14, 0.5],
      [16, 0.55],
      [18, 0.8],
      [20, 0.5],
      [24, 0.6],
      [31, 0.6],
      [33, 0.7],
      [40, 0.6],
    ];
    for (const [id, strength] of gestures) {
      const l = L(id);
      const endAt = l.to + 8;
      if (t >= l.from - 4 && t <= endAt) {
        const kk = win(t, l.from - 4, endAt, 12) * strength;
        const expr = id === 31 || id === 40 || id === 20 ? "softSmile" : "calm";
        // к угощению — ближняя к Юсуфу рука низко над столиком (ниже его
        // головы); остальные жесты — свободной правой на экране рукой:
        // Юсуф сидит вплотную слева, жест влево накрыл бы его лицо
        if (id === 8 || id === 18) {
          const rest = restArms.armL.target!;
          const toward: Vec = { x: plateHome.x + 34, y: TABLE_SURFACE_Y - 36 };
          return { pose: { ...base, ...restArms, expr, lean, lookY, armL: arm(mix(rest, toward, kk), kk > 0.25 ? "open" : "relax", "out") }, front: kk > 0.6 };
        }
        const rest = restArms.armR.target!;
        // открытая ладонь чуть вперёд и в сторону, на уровне груди — без «оклика»
        const toward: Vec = { x: P.x + 0.13 * P.h, y: P.y - 0.25 * P.h };
        return { pose: { ...base, ...restArms, expr, lean, lookY, armR: arm(mix(rest, toward, kk), kk > 0.25 ? "open" : "relax", "out") }, front: false };
      }
    }
    // короткие подтверждения: кивок
    for (const id of [2, 26, 44]) {
      const l = L(id);
      if (t >= l.from - 2 && t <= l.to + 10) {
        const u = clamp((t - l.from + 2) / 16);
        return { pose: { ...base, ...restArms, expr: "softSmile", lean, lookY, nod: 5 * Math.sin(Math.PI * u) }, front: false };
      }
    }
    if (inPause(t)) return { pose: { ...base, ...restArms, expr: "listening", lookY: 0.08 }, front: false };
    const sp = speakerOf(t);
    if (sp && sp !== "muhammad") return { pose: { ...base, ...restArms, expr: "listening", lean, lookY }, front: false };
    if (t >= meal.from && t < L(43).from) return { pose: { ...base, ...restArms, expr: "softSmile", lean, lookY: 0.3 }, front: false };
    return { pose: { ...base, ...restArms, expr: speaking(2, t) || speaking(44, t) ? "softSmile" : "calm", lean, lookY }, front: false };
  };

  // ========== Юсуф ==========
  const toTeacherFromY = (t: number) => faceTo(teacherPlace(t).x, yusufP.x);
  const toBilalFromY = faceTo(AT_TABLE.bilal.x, yusufP.x);
  const toAmirFromY = faceTo(amirP.x, yusufP.x);
  const lookAtApple = M("Юсуф смотрит на яблоко");
  const lookAtTreat = M("Юсуф смотрит на угощение");
  const lookAtPlate = M("Юсуф смотрит на тарелку");
  const yFace = (t: number) => {
    const sp = speakerOf(t);
    if (t < plateHold.from) return t < enter.from ? 0.05 : 0.3; // замечает учителя с тарелкой
    if (t < plateDown.to + 4) return 0.22; // на тарелку
    if (t >= lookAtApple.from && t < lookAtApple.to) return seg(t, lookAtApple.from, lookAtApple.to) < 0.7 ? 0.08 : toTeacherFromY(t);
    if (t >= lookAtTreat.from && t < lookAtTreat.to) return 0.08;
    if (t >= lookAtPlate.from && t < lookAtPlate.to) return 0.07;
    // сцена 5: салфетка от Билала
    if (t >= s5.from && t < L(21).from) return t < y24.lift ? toBilalFromY * 0.8 : t < y24.place + 6 ? -0.05 : toBilalFromY;
    if (speaking(21, t) || speaking(22, t)) return toBilalFromY;
    if (speaking(23, t)) return lerp(toBilalFromY, toTeacherFromY(t), easeInOut(seg(t, L(23).from - 6, L(23).from + 10)));
    // сцена 6: замечает — своя салфетка → Билал → место Билала → поднос
    if (t >= notice.from && t < notice.to) {
      const u = seg(t, notice.from, notice.to);
      return u < 0.22 ? -0.06 : u < 0.45 ? toBilalFromY : u < 0.7 ? toBilalFromY * 0.8 : -0.24;
    }
    if (speaking(27, t)) return seg(t, L(27).from, L(27).to) < 0.55 ? toTeacherFromY(t) : toBilalFromY * 0.9;
    if (speaking(28, t)) return toBilalFromY;
    if (t >= y25.prep && t < y25.extend) return -0.24; // на поднос
    if (t >= y25.extend && t < l30.to + 6) return toBilalFromY;
    // еда: на тарелку, кусочек у рта
    if (t >= toPlate.from && t < meal.to) return t < sl.take + 4 ? 0.1 : 0.02;
    if (speaking(43, t) || speaking(44, t)) return toTeacherFromY(t);
    if (speaking(45, t)) return seg(t, L(45).from, L(45).to) < 0.5 ? toTeacherFromY(t) * 0.6 : 0.05;
    if (t >= fin.from) return 0.05;
    if (sp === "muhammad") return toTeacherFromY(t);
    if (sp === "amir") return toAmirFromY;
    if (sp === "bilal") return toBilalFromY;
    if (inPause(t)) return toTeacherFromY(t) * 0.8;
    return toTeacherFromY(t) * 0.85;
  };
  const yPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const p = yusufP;
    const lap = lapArms(p);
    const base: PoseIn = { floorSit: 1, expr: "listening", ...lap, lookY: -0.15 };
    // последняя салфетка: подготовка → касание края → взял → поднял → протянул → встреча → отпустил → рука назад
    if (t >= y25.prep && t < y25.yBack) {
      const reach = easeInOut(seg(t, y25.reach, y25.touch));
      const back = easeInOut(seg(t, y25.release, y25.yBack));
      const n = napkinHeldBy("yusuf", t);
      const top = trayTopAt(y25.touch);
      // касается правого края салфетки, затем берёт щепотью сверху
      const edge: Vec = { x: top.x + 7, y: top.y };
      let grip: Vec;
      if (t < y25.touch) grip = mix(yLap.L, edge, reach);
      else if (t < y25.take) grip = mix(edge, top, easeInOut(seg(t, y25.touch, y25.take)));
      else if (n) grip = gripA(n);
      else grip = mix(meet25, yLap.L, back);
      const wrist = t >= y25.release ? mix(meet25, yLap.L, back) : grip;
      const holding = t >= y25.touch && t < y25.release + 2;
      const lean = 6 * win(t, y25.prep, y25.release, 10);
      return {
        pose: { ...base, expr: t >= y25.meet ? "softSmile" : "focused", armL: arm(wrist, holding ? "pinch" : t < y25.touch ? "open" : "relax", "hang"), lookY: t < y25.extend ? 0.5 : 0.05, lean, headTilt: t < y25.extend ? -2 : 0 },
        front: t >= y25.reach + 4 && t < y25.release + 10,
      };
    }
    // еда: правая рука (на экране левая) берёт кусочек, подносит ко рту
    if (t >= sl.reach && t < sl.handBack + sec(0.6)) {
      const s = yusufSlice(t);
      // щепоть у кусочка на тарелке (как его нарисует тарелка) и у рта после второго укуса
      const onPlate = sliceHold({ pos: sliceRest(SLICE_TAKEN), rot: sliceRest(SLICE_TAKEN).rot, bite: 0, owner: "yusuf", w: Y_SLICE_W });
      const lastHold = sliceHold(yusufSlice(sl.bite2 - 1)!);
      let grip: Vec;
      if (t < sl.take) grip = mix(yLap.L, onPlate, easeInOut(seg(t, sl.reach, sl.take)));
      else if (s) grip = sliceHold(s);
      else grip = mix(lastHold, yLap.L, easeInOut(seg(t, sl.bite2, sl.handBack)));
      const chew = chewYusuf(t);
      // рот приоткрывается для укуса
      const bite = Math.max(win(t, sl.bite1 - 7, sl.bite1 + 1, 4), win(t, sl.bite2 - 7, sl.bite2 + 1, 4));
      return {
        pose: { ...base, expr: "calm", armL: arm(grip, t >= sl.take - 2 && t < sl.bite2 + 2 ? "pinch" : "relax", "down"), lookY: t < sl.take ? 0.5 : 0.15, chew, bite: chew > 0 ? 0 : bite, mouthFull: chew > 0 ? 0.6 : 0 },
        front: t < sl.take + sec(0.4),
      };
    }
    if (t >= sl.handBack && t <= sl.chewEnd + 6) return { pose: { ...base, expr: "calm", chew: chewYusuf(t), mouthFull: 0.4 * (1 - seg(t, sl.chewEnd - 20, sl.chewEnd)), lookY: 0.1 }, front: false };
    // смотрит, как учитель ставит тарелку; спасибо
    if (t < plateDown.to + 6) return { pose: { ...base, expr: "curious", lookY: t < plateHold.from ? 0 : 0.45 }, front: false };
    if (speaking(1, t) || speaking(43, t)) return { pose: { ...base, expr: "smile", lookY: -0.15 }, front: false };
    if (t >= lookAtApple.from && t < lookAtApple.to) {
      const u = seg(t, lookAtApple.from, lookAtApple.to);
      return { pose: { ...base, expr: u < 0.7 ? "thinking" : "curious", lookY: u < 0.7 ? 0.55 : -0.15, headTilt: u < 0.7 ? 2 : -2 }, front: false };
    }
    if (t >= lookAtTreat.from && t < lookAtTreat.to) return { pose: { ...base, expr: "softSmile", lookY: 0.5 }, front: false };
    if (t >= lookAtPlate.from && t < lookAtPlate.to) return { pose: { ...base, expr: "thinking", lookY: 0.5 }, front: false };
    if (t >= s5.from && t < L(21).from) return { pose: { ...base, expr: t < y24.place ? "curious" : "softSmile", lookY: t < y24.place + 6 ? 0.45 : 0 }, front: false };
    if (t >= notice.from && t < notice.to) {
      const u = seg(t, notice.from, notice.to);
      return { pose: { ...base, expr: u < 0.45 ? "listening" : "thinking", lookY: u < 0.22 ? 0.5 : u < 0.45 ? -0.05 : 0.45 }, front: false };
    }
    if (speaking(27, t)) return { pose: { ...base, expr: "focused", lookY: 0 }, front: false };
    const curious = [3, 5, 9, 17, 23].some((id) => speaking(id, t));
    if (curious) return { pose: { ...base, expr: "curious", headTilt: speaking(3, t) ? -4 : -2, lookY: -0.2 }, front: false };
    if (speaking(21, t) || speaking(29, t) || speaking(39, t)) return { pose: { ...base, expr: "smile", lookY: -0.05 }, front: false };
    if (speaking(41, t) || speaking(42, t)) return { pose: { ...base, expr: "calm", lookY: speaking(41, t) ? 0.35 : 0.1 }, front: false };
    if (speaking(45, t)) return { pose: { ...base, expr: "softSmile", lookY: -0.1 }, front: false };
    if (t >= toPlate.from && t < meal.from) return { pose: { ...base, expr: "calm", lookY: 0.5 }, front: false };
    if (inPause(t)) return { pose: { ...base, expr: "neutral", lookY: -0.1 }, front: false };
    if (t >= y25.yBack && t < l31.to) return { pose: { ...base, expr: "softSmile" }, front: false };
    if (t >= fin.from) return { pose: { ...base, expr: "softSmile", lookY: 0.2 }, front: false };
    return { pose: base, front: false };
  };

  // ========== Амир ==========
  const amirStop = route.stops[route.stops.length - 1];
  const aFace = (t: number) => {
    const toT = faceTo(teacherSeat.x, amirP.x);
    const toY = faceTo(yusufP.x, amirP.x);
    const toB = faceTo(AT_TABLE.bilal.x, amirP.x);
    const sp = speakerOf(t);
    if (t >= amirStop.arrive - sec(0.6) && t < amirStop.ev.settle + 6) return t < amirStop.ev.release ? -0.45 : 0.05;
    if ([7, 11, 19, 25, 32, 35].some((id) => speaking(id, t))) return toT * 0.9;
    if (t >= y25.prep && t < l30.to) return toB;
    if (t >= s5.from && t < y24.back) return toY * 0.8;
    if (sp === "muhammad") return toT;
    if (sp === "yusuf") return toY;
    if (sp === "bilal") return toB;
    if (inPause(t)) return toT * 0.8;
    return toT * 0.85;
  };
  const aPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const p = amirP;
    const lap = lapArms(p);
    const base: PoseIn = { floorSit: 1, expr: "listening", ...lap, lookY: -0.1 };
    const e = amirStop.ev;
    if (t >= e.take - 8 && t < e.settle + sec(0.6)) {
      const n = napkinHeldBy("amir", t);
      const up = easeInOut(seg(t, e.take - 8, e.contact));
      const back = easeInOut(seg(t, e.settle, e.settle + sec(0.6)));
      let grip: Vec;
      if (t < e.contact) grip = mix(aLap.L, gripAt(e, e.contact, "B"), up);
      else if (n) grip = gripB(n);
      else grip = mix(amirStop.rest, aLap.L, back);
      return {
        pose: { ...base, expr: "softSmile", armL: arm(grip, t >= e.contact - 2 && t < e.settle + 2 ? "pinch" : "open", "out"), lookY: t < e.release ? -0.5 : 0.45 },
        front: t >= e.release + 6 && t < e.settle + 12,
      };
    }
    if (speaking(32, t) || speaking(11, t) || speaking(7, t) || speaking(19, t)) return { pose: { ...base, expr: "curious", lean: 3 }, front: false };
    if (speaking(25, t)) return { pose: { ...base, expr: seg(t, L(25).from, L(25).to) < 0.5 ? "thinking" : "softSmile", lean: 3 }, front: false };
    if (speaking(35, t)) return { pose: { ...base, expr: "focused" }, front: false };
    if (inPause(t)) return { pose: { ...base, expr: "neutral" }, front: false };
    return { pose: base, front: false };
  };

  // ========== Билал ==========
  const bFace = (t: number) => {
    const P = bilalPlace(t);
    const st = stopAt(t);
    if (bilalStanding(t)) {
      if (st) return st.side * (t < st.arrive + GIVE.turn ? 0.2 : 0.5);
      return 0; // при ходьбе направление задаёт шаг
    }
    const toT = faceTo(teacherSeat.x, P.x);
    const toY = faceTo(yusufP.x, P.x);
    const sp = speakerOf(t);
    if (t < route.trayDown.back + 6) return 0.3; // ставит поднос
    if (t >= s5.from && t < y24.back) return 0.35;
    if (t >= notice.from && t < l31.from) return toY;
    if ([13, 15, 37].some((id) => speaking(id, t))) return toT * 0.9;
    if (speaking(22, t) || speaking(28, t) || speaking(30, t)) return toY;
    if (sp === "muhammad") return toT;
    if (sp === "yusuf") return toY;
    if (sp === "amir") return faceTo(amirP.x, P.x);
    if (inPause(t)) return toT * 0.8;
    return toT * 0.85;
  };
  const bPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const P = bilalPlace(t);
    if (bilalStanding(t)) {
      const tr = tray(t);
      const hw = TRAY_W * 0.46;
      const gripL: Vec = { x: tr.pos.x - hw, y: tr.pos.y + 1 };
      const gripR: Vec = { x: tr.pos.x + hw, y: tr.pos.y + 1 };
      const st = stopAt(t);
      let armL = arm(gripL, "grip", "down");
      let armR = arm(gripR, "grip", "down");
      let lean = 0;
      let lookY = 0.15;
      let expr: PoseIn["expr"] = "calm";
      if (st) {
        const e = st.ev;
        const near = st.side; // рука к ученику
        const top = trayTopAt(e.take);
        const n = napkinHeldBy("bilal", t);
        const reach = easeInOut(seg(t, st.arrive + GIVE.reach, e.take));
        const back = easeInOut(seg(t, e.release, st.arrive + GIVE.back));
        const handle = near < 0 ? gripL : gripR;
        let grip: Vec;
        if (t < e.take) grip = mix(handle, top, reach);
        else if (n) grip = gripA(n);
        else grip = mix(gripAt(e, e.release - 1, "A"), handle, back);
        const wrist = grip;
        const giving = arm(wrist, t >= e.take - 2 && t < e.release + 2 ? "pinch" : "open", "out");
        // опорная рука — под центром подноса ладонью вверх
        const support = arm({ x: tr.pos.x - near * 0.05 * P.h, y: tr.pos.y + 4 }, "palmUp", "down");
        const k = win(t, st.arrive + GIVE.turn, st.arrive + GIVE.back, 5);
        if (near < 0) {
          armL = giving;
          armR = k > 0.5 ? support : armR;
        } else {
          armR = giving;
          armL = k > 0.5 ? support : armL;
        }
        lean = 9 * win(t, st.arrive + GIVE.reach, e.release + 4, 8);
        lookY = 0.45;
        expr = "softSmile";
        // Амир сидит за столиком ниже ребят на ковре — Билал чуть приседает
        if (st.who === "amir") {
          const c = 0.32 * win(t, st.arrive + GIVE.turn, st.arrive + GIVE.back, 10);
          return { pose: { expr, lean, lookY, armL, armR, crouch: c }, front: false };
        }
      }
      return { pose: { expr, lean, lookY, armL, armR }, front: false };
    }
    // садится на своё место с подносом, ставит поднос на столик
    const lap = lapArms(P);
    const base: PoseIn = { floorSit: 1, expr: "listening", ...lap, lookY: -0.1 };
    if (t < route.trayDown.back) {
      const sitU = easeInOut(seg(t, route.sitDown.from, route.sitDown.to));
      const tr = tray(t);
      const hw = TRAY_W * 0.46;
      const rel = easeInOut(seg(t, route.trayDown.contact + 2, route.trayDown.back));
      const gripL = mix({ x: tr.pos.x - hw, y: tr.pos.y + 1 }, lapOf(P).L, rel);
      const gripR = mix({ x: tr.pos.x + hw, y: tr.pos.y + 1 }, lapOf(P).R, rel);
      return {
        pose: { kneel: sitU < 0.6 ? smoothstep(sitU / 0.6) : 1 - smoothstep((sitU - 0.6) / 0.4), floorSit: smoothstep((sitU - 0.35) / 0.65), expr: "calm", lookY: 0.35, lean: 4, armL: arm(gripL, rel < 0.2 ? "grip" : "relax", "down"), armR: arm(gripR, rel < 0.2 ? "grip" : "relax", "down") },
        front: t >= route.trayDown.reach && rel < 0.7,
      };
    }
    // №24: кладёт салфетку перед Юсуфом (правая на экране рука)
    if (t >= y24.reach && t < y24.back) {
      const n = napkinHeldBy("bilal", t);
      const top = trayTopAt(y24.take);
      const restR = lapOf(P).R;
      let grip: Vec;
      if (t < y24.take) grip = mix(restR, top, easeInOut(seg(t, y24.reach, y24.take)));
      else if (n) grip = gripA(n);
      else grip = mix({ x: NAPKIN_AT.yusuf.x, y: NAPKIN_AT.yusuf.y }, restR, easeInOut(seg(t, y24.place, y24.back)));
      return { pose: { ...base, expr: "softSmile", armR: arm(grip, t >= y24.take - 2 && t < y24.place + 2 ? "pinch" : "open", "hang"), lookY: 0.45, lean: 5 }, front: true };
    }
    // №25: принимает двумя руками, держит у груди, кладёт рядом со своей тарелкой
    if (t >= y25.extend && t < y25.bilalBack) {
      const n = napkinHeldBy("bilal", t);
      const reach = easeInOut(seg(t, y25.extend, y25.meet));
      const back = easeInOut(seg(t, y25.settle, y25.bilalBack));
      const lapP = lapOf(P);
      let gR: Vec;
      let gL: Vec;
      if (t < y25.meet) {
        const m = gripAt(events25, y25.meet, "B");
        gR = mix(lapP.R, m, reach);
        gL = mix(lapP.L, { x: m.x - 10, y: m.y + 12 }, reach);
      } else if (n && n.holder !== null) {
        const m = gripB(n);
        gR = m;
        gL = { x: m.x - 10, y: m.y + 12 };
      } else {
        const dest: Vec = { x: NAPKIN_AT.bilal.x, y: NAPKIN_AT.bilal.y };
        gR = mix(dest, lapP.R, back);
        gL = mix({ x: dest.x - 14, y: dest.y + 6 }, lapP.L, back);
      }
      const holding = t >= y25.meet - 2 && t < y25.settle + 2;
      // левая рука отпускает, когда салфетка уже у груди
      const leftOn = t < y25.bilalChest + sec(0.4);
      return {
        pose: { ...base, expr: t >= y25.release ? "smile" : "softSmile", armR: arm(gR, holding ? "pinch" : "open", "hang"), armL: leftOn ? arm(gL, holding ? "open" : "relax", "down") : base.armL, lookY: t < y25.release ? 0.2 : 0, lean: 4 },
        front: t >= y25.settle - sec(0.7) && t < y25.bilalBack,
      };
    }
    if (speaking(15, t) || speaking(13, t)) return { pose: { ...base, expr: "curious", lean: 3 }, front: false };
    if (speaking(37, t)) return { pose: { ...base, expr: "focused", lean: 2 }, front: false };
    if (speaking(22, t) || speaking(30, t)) return { pose: { ...base, expr: "smile" }, front: false };
    if (speaking(28, t)) return { pose: { ...base, expr: "softSmile" }, front: false };
    if (inPause(t)) return { pose: { ...base, expr: "neutral" }, front: false };
    return { pose: base, front: false };
  };

  // ========== фоновые ученики ==========
  const focusX = (t: number) => {
    const sp = speakerOf(t);
    if (sp === "muhammad") return teacherPlace(t).x;
    if (sp === "yusuf") return yusufP.x;
    if (sp === "amir") return amirP.x;
    if (sp === "bilal") return bilalPlace(t).x;
    return teacherPlace(t).x;
  };
  const bgMicro = (t: number, seed: number) => {
    const period = 150 + Math.floor(hash01(seed) * 120);
    const k = Math.floor(t / period);
    const local = t - k * period;
    const r = hash01(seed * 7 + k * 3);
    const shift = r < 0.3 && local < 40 ? Math.sin((local / 40) * Math.PI) : 0;
    const tilt = r > 0.7 && local > 60 && local < 140 ? smoothstep((local - 60) / 20) * (1 - smoothstep((local - 120) / 20)) : 0;
    return { lean: shift * 3, headTilt: tilt * (hash01(seed + 2) > 0.5 ? 5 : -5) };
  };
  const bgMouth = new Map<string, Vec>();
  const bg = (p: CastPupil): Ctl => {
    const base = seatPlace(p);
    const stop = route.stops.find((s) => s.who === p.castId)!;
    const e = stop.ev;
    const delay = 3 + Math.floor(hash01(p.seed + 5) * 14);
    const side = (-stop.side) as -1 | 1; // рука ученика к Билалу
    const lap = lapArms(base);
    const mouth = mouthAt(p.look, base, 0.05, 0.2);
    bgMouth.set(p.castId, mouth);
    const eatAt = eaters.get(p.castId);
    const restHand = side < 0 ? lap.armL.target! : lap.armR.target!;
    return {
      place: () => base,
      face: (t) => {
        // замечает подходящего Билала, смотрит на него до передачи
        if (t >= e.take - sec(1.2) && t < e.release + 8) return faceTo(bilalPlace(t).x, base.x, 600);
        if (t >= e.release + 8 && t < e.settle + 6) return side * 0.1;
        if (eatAt !== undefined && t >= eatAt - 6) return 0.05;
        return faceTo(focusX(t - delay), base.x, 1000);
      },
      pose: (t) => {
        const micro = bgMicro(t, p.seed);
        const poseBase: PoseIn = { floorSit: 1, turnBody: SEATED_TURN, expr: "listening", ...lap, ...micro, lookY: 0.05 };
        if (inPause(t)) return { ...poseBase, lean: 0, headTilt: 0 };
        if (t >= e.take - 10 && t < e.settle + sec(0.7)) {
          const n = napkins(t).find((x) => x.ev === e);
          const up = easeInOut(seg(t, e.take - 10, e.contact));
          const back = easeInOut(seg(t, e.settle, e.settle + sec(0.7)));
          let grip: Vec;
          if (t < e.contact) grip = mix(restHand, gripAt(e, e.contact, "B"), up);
          else if (n && n.holder !== null) grip = gripB(n);
          else grip = mix(stop.rest, restHand, back);
          const a = arm(grip, t >= e.contact - 2 && t < e.settle + 2 ? "pinch" : "open", "out");
          const lookY = t < e.release ? -0.35 : 0.45;
          return { ...poseBase, expr: "softSmile", lookY, ...(side < 0 ? { armL: a } : { armR: a }) };
        }
        if (eatAt !== undefined && t >= eatAt) {
          // в финале: берёт кусочек правой рукой (на экране левой), подносит ко рту, откусывает
          const sp = bgSlice(p.castId, Math.max(t, eatAt + 14))!;
          const grip = t < eatAt + 14 ? mix(lap.armL.target!, sliceHold(sp), easeInOut(seg(t, eatAt, eatAt + 14))) : sliceHold(sp);
          const chew = t >= eatAt + 34 ? 1 : 0;
          const bite = win(t, eatAt + 27, eatAt + 35, 4);
          return { ...poseBase, expr: "calm", lookY: 0.2, armL: arm(grip, t >= eatAt + 12 ? "pinch" : "open", "down"), chew, bite: chew > 0 ? 0 : bite, mouthFull: chew * 0.4 };
        }
        return poseBase;
      },
      armsFront: () => false,
    };
  };
  const bgCtl = new Map<string, Ctl>();
  const bgOf = (p: CastPupil) => {
    let c = bgCtl.get(p.castId);
    if (!c) {
      c = bg(p);
      bgCtl.set(p.castId, c);
    }
    return c;
  };
  BG_IDS.forEach((id) => bgOf(castById(id)));
  const bgSlice = (id: string, t: number): SlicePose | null => {
    const s = eaters.get(id);
    if (s === undefined || t < s + 14) return null;
    if (id === "amir" || id === "bilal") return null;
    const p = castById(id);
    const base = seatPlace(p);
    const mouth = bgMouth.get(id)!;
    const plateC: Vec = { x: base.x, y: base.y + BG_PLATE_DY };
    const slot = plateSlot(plateC.x, plateC.y, BG_PLATE_W, 4, 1);
    const ROT = -50;
    const atMouth = sliceAtMouth(mouth, ROT, BG_SLICE_W);
    const low: Vec = { x: base.x - 0.07 * base.h, y: base.y - 0.2 * base.h };
    const u = easeInOut(seg(t, s + 16, s + 34));
    const pos = t < s + 16 ? slot : t < s + 44 ? mix(slot, atMouth, u) : mix(atMouth, low, easeInOut(seg(t, s + 44, s + 60)));
    const rot = t < s + 44 ? lerp(slot.rot, ROT, Math.min(1, u * 1.5)) : ROT;
    return { pos, rot, bite: t >= s + 34 ? 1 : 0, owner: id, w: BG_SLICE_W };
  };
  const chewing = (id: string, t: number) => {
    if (id === "yusuf") return chewYusuf(t);
    const s = eaters.get(id);
    return s !== undefined && t >= s + 34 ? 1 : 0;
  };
  void end;
  void TABLE;

  return {
    teacher: { place: teacherPlace, face: tFace, pose: (t) => (t >= tSit.from ? seated(tPoseEx(t).pose) : tPoseEx(t).pose), armsFront: (t) => tPoseEx(t).front },
    yusuf: { place: () => yusufP, face: yFace, pose: (t) => seated(yPoseEx(t).pose), armsFront: (t) => yPoseEx(t).front },
    amir: { place: () => amirP, face: aFace, pose: (t) => seated(aPoseEx(t).pose), armsFront: (t) => aPoseEx(t).front },
    bilal: { place: bilalPlace, face: bFace, pose: (t) => (t >= route.sitDown.from ? seated(bPoseEx(t).pose) : bPoseEx(t).pose), armsFront: (t) => bPoseEx(t).front },
    bg: bgOf,
    route,
    log,
    napkins,
    tray,
    yusufPlate,
    yusufSlice,
    bgPlate,
    bgSlice,
    chewing,
    events,
  };
};
