// Хореография фильма 80-1-7: для каждого персонажа функции кадра →
// место, направление взгляда и поза (руки, мимика, посадка). Все моменты
// берутся из шкалы (реплики, зрительские паузы, повороты, действия), поэтому
// при перезаписи озвучки постановка пересчитывается сама. Всё детерминированно
// по номеру кадра; состояние с произвольного кадра — правильное.
import { FPS } from "../core/video.ts";
import type { Place, PoseIn, WorldArm } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, lerp, smoothstep, hash01, type Vec } from "../rig/motion.ts";
import { castById, heightAt, seatPlace, teacherPlaceAt, type CastPupil } from "./cast.ts";
import { CAM_SIDE, markState } from "./globe/model.ts";
import { BOAT, GLOBE, LAMP, SHEETS, TABLE } from "./layout.ts";
import { cueById, phiAt, spinAt, type L80Timeline } from "./timeline.ts";
import { ROOM } from "../sets/roomLayout.ts";

export type Ctl = {
  readonly place: (t: number) => Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
};

export type Choreo = {
  readonly teacher: Ctl;
  readonly teacherArmsFront: (t: number) => boolean; // кисти учителя поверх реквизита
  readonly yusuf: Ctl;
  readonly amir: Ctl;
  readonly bilal: Ctl;
  readonly bg: (p: CastPupil) => Ctl;
  // состояние реквизита
  readonly lamp: (t: number) => number;
  readonly curtain: (t: number) => number;
  readonly globeLift: (t: number) => number;
  readonly globeOnTable: (t: number) => number;
  readonly sheetsOnTable: (t: number) => boolean;
  readonly blankOnTable: (t: number) => boolean;
  readonly yusufSheets: (t: number) => { lift: number; day: Vec; night: Vec; angleDay: number; angleNight: number } | null;
  readonly earthLen: (t: number) => number;
  readonly drawingHand: (t: number) => "yusuf" | "amir" | null;
  readonly events: Events;
};

export type Events = {
  readonly lampOn: number; // кадр щелчка
  readonly globeContact: number; // кадр касания подставки стола
  readonly curtainClose: { from: number; to: number };
  readonly curtainOpen: { from: number; to: number };
  readonly sheetTaken: number;
  readonly drawSpans: { from: number; to: number }[]; // когда карандаш действительно рисует
};

const sec = (s: number) => Math.round(s * FPS);
const T_SEAT: Vec = { x: 2190, y: 1205 }; // учитель за столиком (ступни)
const T_SQUAT: Vec = { x: 870, y: 1322 }; // учитель присел рядом с Юсуфом (сцена 1)
const Y_DRAW: Vec = { x: 1850, y: 1425 }; // Юсуф рисует у левого края столика
const A_DRAW: Vec = { x: 1665, y: 1440 }; // Амир рядом
const WINDOW_STAND: Vec = { x: 1985, y: 1012 }; // Амир у занавески

// Мировая точка метки на глобусе (вид сбоку) для указательного жеста.
const markWorldAt = (phi: number): Vec => {
  const m = markState(CAM_SIDE, phi);
  return { x: GLOBE.cx + m.screen.x * GLOBE.r, y: GLOBE.cy + m.screen.y * GLOBE.r };
};

// Путь по точкам с остановками: [[кадр, точка], …]; между ключами — плавно.
const path = (t: number, pts: readonly (readonly [number, Vec])[]): Vec => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, p1] = pts[i];
    const [t0, p0] = pts[i - 1];
    if (t <= t1) {
      const u = t1 <= t0 ? 1 : (t - t0) / (t1 - t0);
      return { x: lerp(p0.x, p1.x, u), y: lerp(p0.y, p1.y, u) };
    }
  }
  return pts[pts.length - 1][1];
};

const arm = (target: Vec, shape: WorldArm["shape"] = "open", elbow: WorldArm["elbow"] = "out"): WorldArm => ({ target, shape, elbow });
const lapArms = (p: Place): { armL: WorldArm; armR: WorldArm } => ({
  armL: { target: { x: p.x - 0.155 * p.h, y: p.y - 0.05 * p.h }, shape: "relax", elbow: "in" },
  armR: { target: { x: p.x + 0.155 * p.h, y: p.y - 0.05 * p.h }, shape: "relax", elbow: "in" },
});
// Куда смотрит персонаж: поворот головы к точке мира из точки x.
const faceTo = (targetX: number, x: number, k = 760) => clamp((targetX - x) / k, -0.85, 0.85);
// Плавное окно 0…1 с краями in/out (кадры).
const win = (t: number, from: number, to: number, edge = 8) => smoothstep((t - from) / edge) * (1 - smoothstep((t - to) / edge));

export const buildChoreo = (tl: L80Timeline): Choreo => {
  const L = (id: number) => {
    const c = cueById(tl, id);
    return { from: sec(c.from), to: sec(c.to) };
  };
  const M = (label: string) => {
    const m = tl.marks[label];
    if (!m) throw new Error(`Нет отрезка «${label}»`);
    return { from: sec(m.from), to: sec(m.to) };
  };
  const phi = (t: number) => phiAt(tl, t / FPS);
  const scene = (t: number) => tl.sceneOf(t / FPS);
  const speaking = (id: number, t: number, pad = 4) => t >= L(id).from - pad && t <= L(id).to + pad;
  const speakerOf = (t: number) => {
    const s = t / FPS;
    for (const c of tl.cues) if (s >= c.from - 0.15 && s <= c.to + 0.2) return c.role;
    return null;
  };

  // ---------- события реквизита ----------
  const place0 = M("учитель ставит глобус");
  const globeContact = place0.from + sec(2.2);
  const switchHold = M("рука к выключателю");
  const lampOn = switchHold.to - 2; // щелчок в конце подведения руки
  const closeHold = M("Амир прикрывает занавеску");
  const curtainClose = { from: closeHold.from + sec(0.5), to: closeHold.from + sec(1.9) };
  const openHold = M("Амир открывает занавеску");
  const curtainOpen = { from: openHold.from + sec(0.5), to: openHold.from + sec(1.8) };
  const takeHold = M("Юсуф берёт лист");
  const sheetTaken = takeHold.to - sec(0.3);
  const circleHold = M("первый круг");
  const l41 = L(41);
  const l42 = L(42);
  // карандаш: круг во время «первого круга», детали и точка — реплика 41,
  // стрелка — реплика 42 (рука Амира)
  const drawSpans = [
    { from: circleHold.from + sec(0.4), to: circleHold.to },
    { from: l41.from + sec(0.2), to: l41.to - sec(0.2) },
    { from: l42.from + sec(0.5), to: l42.to },
  ];
  const events: Events = { lampOn, globeContact, curtainClose, curtainOpen, sheetTaken, drawSpans };

  const lamp = (t: number) => (t >= lampOn ? 1 : 0);
  const curtain = (t: number) => {
    if (t < curtainClose.from) return 0;
    if (t < curtainClose.to) return easeInOut((t - curtainClose.from) / (curtainClose.to - curtainClose.from));
    if (t < curtainOpen.from) return 1;
    if (t < curtainOpen.to) return 1 - easeInOut((t - curtainOpen.from) / (curtainOpen.to - curtainOpen.from));
    return 0;
  };
  const sceneTwo = sec(tl.scenes[1].from);
  const globeLift = (t: number) => (t < sceneTwo ? 0 : t >= globeContact ? 0 : 70 * (1 - easeOut((t - place0.from) / (globeContact - place0.from))));
  const globeOnTable = (t: number) => (t < sceneTwo ? 0 : t >= globeContact ? 1 : 0.0001);
  const sheetsOnTable = (t: number) => t >= sceneTwo;
  const blankOnTable = (t: number) => t >= sceneTwo && t < sheetTaken;

  // ---------- рисунок Земли ----------
  const { EARTH_TOTAL, strokeStart } = DRAW;
  const earthLen = (t: number) => {
    const a = strokeStart("land1");
    const b = strokeStart("arrow");
    if (t < drawSpans[0].from) return 0;
    if (t < drawSpans[0].to) return a * easeInOut((t - drawSpans[0].from) / (drawSpans[0].to - drawSpans[0].from));
    if (t < drawSpans[1].from) return a;
    if (t < drawSpans[1].to) return lerp(a, b, (t - drawSpans[1].from) / (drawSpans[1].to - drawSpans[1].from));
    if (t < drawSpans[2].from) return b;
    if (t < drawSpans[2].to) return lerp(b, EARTH_TOTAL, (t - drawSpans[2].from) / (drawSpans[2].to - drawSpans[2].from));
    return EARTH_TOTAL;
  };
  const drawingHand = (t: number): "yusuf" | "amir" | null => {
    if (t >= drawSpans[2].from - sec(0.8) && t <= drawSpans[2].to + sec(0.6)) return "amir";
    if (t >= drawSpans[0].from - sec(0.6) && t <= drawSpans[1].to + sec(0.5)) return "yusuf";
    return null;
  };

  // ---------- учитель ----------
  const gesture = M("жест к столику");
  const sceneOneEnd = sceneTwo;
  const teacherPlace = (t: number): Place => (t < sceneOneEnd ? teacherPlaceAt(T_SQUAT.x, T_SQUAT.y) : teacherPlaceAt(T_SEAT.x, T_SEAT.y));
  const teacherFace = (t: number) => {
    if (t < sceneOneEnd) {
      // смотрит на рисунки Юсуфа, во время реплики 2 — на самого Юсуфа; на жесте — к столику
      if (t >= gesture.from) return 0.85;
      return speaking(2, t) ? 0.62 : 0.5;
    }
    const sp = speakerOf(t);
    const s = scene(t);
    if (s === "s8") return -0.6;
    if (sp === "yusuf") return -0.75;
    if (sp === "amir") return -0.85;
    if (sp === "bilal") return -0.65;
    if (sp === "muhammad") {
      // говоря с классом, чуть поворачивается к детям; при показе — к модели
      const showing = speaking(8, t) || speaking(11, t) || speaking(13, t) || speaking(24, t) || speaking(6, t);
      return showing ? -0.2 : -0.55;
    }
    if (spinAt(tl, t / FPS)) return -0.15;
    return -0.45;
  };
  // front — кисти перед столиком/глобусом (рисуются поверх реквизита):
  // только когда рука действительно касается предмета или показывает на него.
  const teacherPoseEx = (t: number): { pose: PoseIn; front: boolean } => {
    const F = (pose: PoseIn, front = false) => ({ pose, front });
    const p = teacherPlace(t);
    if (t < sceneOneEnd) {
      // присел рядом с Юсуфом: руки на коленях, на жесте правая ладонь к столику
      const g = win(t, gesture.from, gesture.to + 20, 10);
      const handR = g > 0.01 ? arm({ x: lerp(p.x + 0.155 * p.h, p.x + 0.4 * p.h, g), y: lerp(p.y - 0.06 * p.h, p.y - 0.44 * p.h, g) }, "open", "out") : arm({ x: p.x + 0.155 * p.h, y: p.y - 0.06 * p.h }, "relax", "in");
      return F({ floorSit: 1, expr: speaking(2, t) || speaking(5, t) ? "softSmile" : "listening", lean: 3, armL: arm({ x: p.x - 0.15 * p.h, y: p.y - 0.06 * p.h }, "relax", "in"), armR: handR, lookY: speaking(2, t) ? 0.1 : 0.25 });
    }
    // кисти в коленях чуть ближе к корпусу — не на стойке лампы
    const lap = { armL: arm({ x: p.x - 0.12 * p.h, y: p.y - 0.05 * p.h }, "relax", "in"), armR: arm({ x: p.x + 0.11 * p.h, y: p.y - 0.05 * p.h }, "relax", "in") };
    const rest: PoseIn = { floorSit: 1, expr: "calm", ...lap, lookY: 0.05 };
    const hand = (target: Vec, shape: WorldArm["shape"] = "open", k = 1): PoseIn => ({
      ...rest,
      armL: k >= 1 ? arm(target, shape, "out") : arm({ x: lerp(lap.armL.target!.x, target.x, k), y: lerp(lap.armL.target!.y, target.y, k) }, k > 0.5 ? shape : "relax", "out"),
    });
    // установка глобуса: обе руки на подставке, после контакта отпускает
    if (t < globeContact + sec(0.9)) {
      const lift = globeLift(t);
      const release = clamp((t - globeContact) / sec(0.9));
      const baseY = GLOBE.cy + GLOBE.r * 1.2 - lift;
      const hl: Vec = { x: GLOBE.cx - GLOBE.r * 0.55, y: baseY };
      const hr: Vec = { x: GLOBE.cx + GLOBE.r * 0.55, y: baseY };
      return F({
        ...rest,
        lean: 8 * (1 - release),
        expr: "focused",
        armL: arm({ x: lerp(hl.x, lap.armL.target!.x, easeInOut(release)), y: lerp(hl.y, lap.armL.target!.y, easeInOut(release)) }, release > 0.6 ? "relax" : "fist", "out"),
        armR: arm({ x: lerp(hr.x, lap.armR.target!.x, easeInOut(release)), y: lerp(hr.y, lap.armR.target!.y, easeInOut(release)) }, release > 0.6 ? "relax" : "fist", "out"),
        lookY: 0.35 * (1 - release),
      }, release < 0.7);
    }
    // реплика 6: открытая ладонь к глобусу; 8 и 11: палец рядом с меткой
    const l6 = L(6);
    if (t >= l6.from - 6 && t <= l6.to + 10) return F(hand({ x: GLOBE.cx - GLOBE.r * 0.3, y: GLOBE.cy - GLOBE.r * 1.25 }, "open", win(t, l6.from - 6, l6.to + 10, 10)), true);
    for (const id of [8, 11]) {
      const l = L(id);
      if (t >= l.from - 8 && t <= l.to + 12) {
        const m = markWorldAt(phi(t));
        return F({ ...hand({ x: m.x + 34, y: m.y + 30 }, "point", win(t, l.from - 8, l.to + 12, 10)), lookY: 0.3 }, true);
      }
    }
    // реплика 10 и подведение руки к выключателю (правой рукой, лампа справа)
    const l10 = L(10);
    if (t >= l10.from && t < switchHold.from) {
      const k = win(t, l10.from, l10.to + 8, 10);
      return F({ ...rest, armR: arm({ x: lerp(lap.armR.target!.x, LAMP.headX + 70, k), y: lerp(lap.armR.target!.y, LAMP.headY - 30, k) }, "open", "out") }, k > 0.3);
    }
    if (t >= switchHold.from && t < lampOn + sec(0.9)) {
      const k = t < lampOn ? easeInOut((t - switchHold.from) / Math.max(1, lampOn - switchHold.from - 4)) : 1 - easeInOut((t - lampOn) / sec(0.9));
      return F({ ...rest, armR: arm({ x: lerp(lap.armR.target!.x, LAMP.baseX + 18, k), y: lerp(lap.armR.target!.y, LAMP.baseY - 24, k) }, k > 0.7 ? "point" : "relax", "out"), lookY: 0.3 * k, expr: "focused" }, k > 0.3);
    }
    // повороты глобуса: ладонь идёт по верху шара в направлении вращения,
    // затем спокойно перехватывает; перед поворотом — подведение руки
    const sp = spinAt(tl, t / FPS);
    const approach = ["рука к глобусу", "рука к глобусу"].map((l) => tl.marks[l]).filter(Boolean);
    const near = (t2: number) => tl.spins.find((s) => t2 / FPS >= s.from - 1.0 && t2 / FPS < s.from) ?? null;
    if (sp || near(t)) {
      const s = sp ?? near(t)!;
      const tt = t / FPS;
      const pre = !sp ? easeInOut((tt - (s.from - 1.0)) / 1.0) : 1;
      const cycle = 1.6;
      const u = ((tt - s.from) % cycle) / cycle;
      const sweep = u < 0.62 ? u / 0.62 : -1;
      const hx = sweep >= 0 ? lerp(GLOBE.cx - GLOBE.r * 0.45, GLOBE.cx + GLOBE.r * 0.6, sweep) : lerp(GLOBE.cx + GLOBE.r * 0.6, GLOBE.cx - GLOBE.r * 0.45, (u - 0.62) / 0.38);
      const hy = sweep >= 0 ? GLOBE.cy - GLOBE.r * (0.98 - 0.12 * Math.sin(Math.PI * sweep)) : GLOBE.cy - GLOBE.r * (1.18 + 0.1 * Math.sin(Math.PI * (u - 0.62) / 0.38));
      const target: Vec = sp ? { x: hx, y: hy } : { x: lerp(lap.armL.target!.x, GLOBE.cx - GLOBE.r * 0.45, pre), y: lerp(lap.armL.target!.y, GLOBE.cy - GLOBE.r * 0.98, pre) };
      void approach;
      return F({ ...rest, armL: arm(target, "open", "out"), lean: 5, lookY: 0.35, expr: "focused" }, true);
    }
    // после поворота — рука возвращается (0,6 с)
    const lastSpin = [...tl.spins].reverse().find((s) => t / FPS >= s.to && t / FPS < s.to + 0.6);
    if (lastSpin) {
      const k = 1 - easeInOut((t / FPS - lastSpin.to) / 0.6);
      return F({ ...rest, armL: arm({ x: lerp(lap.armL.target!.x, GLOBE.cx - GLOBE.r * 0.45, k), y: lerp(lap.armL.target!.y, GLOBE.cy - GLOBE.r * 1.18, k) }, "relax", "out"), lookY: 0.3 * k }, k > 0.3);
    }
    // реплика 24: показывает светлую (справа), затем ночную (слева) области
    const l24 = L(24);
    if (t >= l24.from - 6 && t <= l24.to + 10) {
      const u = (t - l24.from) / Math.max(1, l24.to - l24.from);
      const k = win(t, l24.from - 6, l24.to + 10, 10);
      const side = u < 0.5 ? 1 : -1;
      const sw = smoothstep((u - 0.45) / 0.12);
      const tx = lerp(GLOBE.cx + GLOBE.r * 1.25, GLOBE.cx - GLOBE.r * 1.3, sw);
      const ty = GLOBE.cy - GLOBE.r * (0.85 - 0.25 * Math.sin(Math.PI * sw));
      void side;
      return F({ ...hand({ x: tx, y: ty }, "point", k), lookY: 0.3 }, true);
    }
    // вопрос классу / объяснение: открытая ладонь к детям (они слева), невысоко
    for (const id of [17, 34, 36, 38, 40, 44, 29, 31, 33, 20, 26, 27]) {
      const l = L(id);
      if (t >= l.from && t <= l.to + 8) {
        const k = win(t, l.from, l.to + 8, 12) * (id === 31 || id === 17 ? 0.9 : 0.65);
        const open: Vec = { x: lap.armL.target!.x - 0.2 * p.h, y: lap.armL.target!.y - 0.16 * p.h };
        return F({ ...rest, expr: id === 44 || id === 33 || id === 40 ? "smile" : "calm", armL: arm({ x: lerp(lap.armL.target!.x, open.x, k), y: lerp(lap.armL.target!.y, open.y, k) }, k > 0.3 ? "open" : "relax", "out") });
      }
    }
    // во время пауз и ответов детей — внимательно слушает
    const pauseNow = tl.pauses.some((ps) => t / FPS >= ps.from && t / FPS <= ps.to);
    if (pauseNow) return F({ ...rest, expr: "listening", lookY: 0 });
    const sp2 = speakerOf(t);
    if (sp2 && sp2 !== "muhammad") return F({ ...rest, expr: "listening" });
    return F(rest);
  };
  const teacherPose = (t: number): PoseIn => teacherPoseEx(t).pose;
  const teacherArmsFront = (t: number) => t >= sceneOneEnd && teacherPoseEx(t).front;

  // ---------- Юсуф ----------
  const yusufSeat = seatPlace(castById("yusuf"));
  const yusufPlace = (t: number): Place => {
    if (t < takeHold.from) return yusufSeat;
    const p = path(t, [
      [takeHold.from, { x: yusufSeat.x, y: yusufSeat.y }],
      [takeHold.from + sec(0.3), { x: yusufSeat.x + 40, y: yusufSeat.y + 70 }],
      [takeHold.to - sec(0.35), { x: Y_DRAW.x - 10, y: Y_DRAW.y }],
      [takeHold.to, Y_DRAW],
    ]);
    return { x: p.x, y: p.y, h: heightAt(4, p.y) };
  };
  const yusufFace = (t: number) => {
    if (t < sceneTwo) return speaking(1, t) ? 0.1 : speaking(3, t) ? 0.35 : 0.55; // на рисунки, потом к учителю
    if (t >= takeHold.from) return 0.5;
    if (speaking(15, t)) return 0.85; // на лампу
    const sp = speakerOf(t);
    if (sp === "muhammad" && !spinAt(tl, t / FPS)) return 0.75;
    if (sp === "amir") return -0.55;
    if (sp === "bilal") return 0.35;
    return 0.8; // на глобус
  };
  const yusufSheets = (t: number) => {
    if (t >= sceneTwo) return null;
    const p = yusufSeat;
    const l1 = L(1);
    const u = (t - l1.from) / Math.max(1, l1.to - l1.from);
    const liftDay = win(t, l1.from - 4, l1.from + (l1.to - l1.from) * 0.45, 8);
    const liftNight = win(t, l1.from + (l1.to - l1.from) * 0.5, l1.to + 6, 8);
    const down = smoothstep((t - gesture.from - 10) / 24);
    void u;
    const baseY = p.y - 0.46 * p.h + 40 * down;
    return {
      lift: 1 - down,
      day: { x: p.x - 0.19 * p.h, y: baseY - 18 * liftDay },
      night: { x: p.x + 0.2 * p.h, y: baseY - 18 * liftNight },
      angleDay: -8 - 4 * liftDay,
      angleNight: 7 + 4 * liftNight,
    };
  };
  const yusufPose = (t: number): PoseIn => {
    const p = yusufPlace(t);
    const lap = lapArms(p);
    const sh = yusufSheets(t);
    if (sh) {
      const expr = speaking(3, t) ? "curious" : speaking(1, t) ? "softSmile" : "listening";
      return {
        floorSit: 1,
        expr,
        armL: arm({ x: sh.day.x + 10, y: sh.day.y + 36 }, "fist", "down"),
        armR: arm({ x: sh.night.x - 10, y: sh.night.y + 36 }, "fist", "down"),
        lookY: speaking(3, t) ? ((t - L(3).from) / Math.max(1, L(3).to - L(3).from) < 0.5 ? 0.45 : 0.25) : 0.2,
      };
    }
    if (t >= takeHold.from) {
      // идёт к столику, садится, берёт лист и рисует
      const sit = smoothstep((t - (takeHold.to - sec(0.4))) / sec(0.5));
      const reach = win(t, takeHold.to - sec(0.3), sheetTaken + sec(0.4), 6);
      const pencil = t >= circleHold.from;
      const tip = DRAW.tipWorld(earthLen(t));
      const handR: WorldArm = pencil
        ? arm({ x: tip.x + 8, y: tip.y + 12 }, "pinch", "out")
        : reach > 0.01
          ? arm({ x: lerp(lap.armR.target!.x, SHEETS.blank.x + 20, reach), y: lerp(lap.armR.target!.y, SHEETS.blank.y - 6, reach) }, "pinch", "out")
          : lap.armR;
      return {
        floorSit: sit,
        crouch: 0,
        expr: speaking(43, t) ? "smile" : speaking(41, t) ? "focused" : "focused",
        armL: pencil ? arm({ x: SHEETS.blank.x - 70, y: SHEETS.blank.y + 2 }, "open", "in") : lap.armL,
        armR: handR,
        lean: pencil ? 8 : 0,
        lookY: pencil ? 0.5 : 0.25,
      };
    }
    const l7 = L(7);
    const leanK = win(t, l7.from - 8, l7.to + 20, 12) * 7;
    const expr = speaking(15, t) ? "surprised" : speaking(12, t) || speaking(19, t) ? "smile" : speaking(7, t) || speaking(30, t) ? "curious" : speaking(37, t) ? "focused" : "listening";
    return { floorSit: 1, expr, lean: leanK, ...lap, lookY: speaking(15, t) ? -0.15 : 0.05 };
  };

  // ---------- Амир ----------
  const amirSeat = seatPlace(castById("amir"));
  const l10 = L(10);
  const trip1Go = l10.from;
  const trip1Arrive = Math.max(trip1Go + sec(4.6), closeHold.from - sec(0.2));
  const trip1Back = closeHold.to + sec(0.3);
  const trip1Home = trip1Back + sec(4.6);
  const twoSides = M("две стороны");
  const trip2Go = twoSides.from + sec(0.2);
  const trip2Arrive = Math.max(trip2Go + sec(4.6), openHold.from + sec(0.2));
  const trip2Back = openHold.to + sec(0.2);
  const trip2Home = trip2Back + sec(4.6);
  const route = (t: number, go: number, arrive: number, back: number, home: number): Vec => {
    const A = { x: amirSeat.x, y: amirSeat.y };
    const front1 = { x: amirSeat.x + 150, y: 1352 };
    const front2 = { x: 1690, y: 1352 };
    const side = { x: 1760, y: 1122 };
    const dur = arrive - go;
    const durB = home - back;
    return path(t, [
      [go, A],
      [go + dur * 0.14, front1],
      [go + dur * 0.55, front2],
      [go + dur * 0.78, side],
      [arrive, WINDOW_STAND],
      [back, WINDOW_STAND],
      [back + durB * 0.22, side],
      [back + durB * 0.45, front2],
      [back + durB * 0.86, front1],
      [home, A],
    ]);
  };
  const amirPlace = (t: number): Place => {
    let p: Vec = { x: amirSeat.x, y: amirSeat.y };
    if (t >= trip1Go && t <= trip1Home) p = route(t, trip1Go, trip1Arrive, trip1Back, trip1Home);
    else if (t >= trip2Go && t <= trip2Home) p = route(t, trip2Go, trip2Arrive, trip2Back, trip2Home);
    else if (t >= l42.from - sec(1.2)) {
      p = path(t, [
        [l42.from - sec(1.2), { x: amirSeat.x, y: amirSeat.y }],
        [l42.from - sec(0.2), A_DRAW],
      ]);
    }
    return { x: p.x, y: p.y, h: heightAt(8, p.y) };
  };
  const amirStanding = (t: number) => (t > trip1Go + 4 && t < trip1Home - 4) || (t > trip2Go + 4 && t < trip2Home - 4);
  const amirFace = (t: number) => {
    if (amirStanding(t)) {
      const atWindow = (t >= trip1Arrive - 6 && t <= trip1Back) || (t >= trip2Arrive - 6 && t <= trip2Back);
      return atWindow ? 0.6 : 0;
    }
    if (t >= l42.from - sec(1.2)) return 0.4;
    const s = scene(t);
    if (s === "s1") return speaking(4, t) ? 0.65 : 0.45;
    const sp = speakerOf(t);
    if (sp === "muhammad" && !spinAt(tl, t / FPS)) return 0.8;
    if (sp === "yusuf") return 0.4;
    if (sp === "bilal") return 0.7;
    return 0.85; // на модель
  };
  const amirPose = (t: number): PoseIn => {
    const p = amirPlace(t);
    const lap = lapArms(p);
    if (amirStanding(t)) {
      const standUp = clamp((t - trip1Go) / 12) * clamp((trip1Home - t) / 12);
      const standUp2 = clamp((t - trip2Go) / 12) * clamp((trip2Home - t) / 12);
      const st = t < trip1Home ? standUp : standUp2;
      const pull = t >= curtainClose.from - 10 && t <= curtainClose.to + 8 ? win(t, curtainClose.from - 10, curtainClose.to + 8, 8) : 0;
      const open = t >= curtainOpen.from - 10 && t <= curtainOpen.to + 8 ? win(t, curtainOpen.from - 10, curtainOpen.to + 8, 8) : 0;
      // рука на краю ткани: при прикрывании ведёт вправо, при открывании — влево
      const w = ROOM.window;
      const edgeClosed = w.x - 58 + 90 + w.w * 0.46;
      const edgeOpen = w.x - 58 + 90;
      const cx = pull > 0 ? lerp(edgeOpen, edgeClosed, curtain(t)) : open > 0 ? lerp(edgeOpen, edgeClosed, curtain(t)) : edgeOpen;
      const k = Math.max(pull, open);
      const handR = k > 0.01 ? arm({ x: lerp(p.x + 0.12 * p.h, cx + 6, k), y: lerp(p.y - 0.42 * p.h, 640, k) }, "fist", "out") : { target: null, shape: "relax" as const };
      return { floorSit: 1 - st, expr: "focused", armR: handR, armL: { target: null, shape: "relax" }, lookY: k > 0.3 ? -0.35 : 0 };
    }
    if (t >= l42.from - sec(1.2)) {
      const sit = smoothstep((t - (l42.from - sec(0.5))) / sec(0.4));
      const draws = drawingHand(t) === "amir";
      const tip = DRAW.tipWorld(earthLen(t));
      return { floorSit: sit, expr: speaking(42, t) ? "softSmile" : "listening", armR: draws ? arm({ x: tip.x + 8, y: tip.y + 12 }, "pinch", "out") : lap.armR, armL: lap.armL, lean: draws ? 6 : 0, lookY: 0.4 };
    }
    const l18 = L(18);
    const think = tl.pauses[0] ? win(t, sec(tl.pauses[0].from) + 20, l18.from - 4, 12) : 0;
    const expr = speaking(4, t) || speaking(25, t) || speaking(32, t) ? "curious" : speaking(18, t) ? "smile" : think > 0.5 ? "thinking" : speaking(14, t) || speaking(39, t) ? "focused" : "listening";
    const leanK = speaking(32, t) ? 6 : speaking(18, t) ? 4 : 0;
    return { floorSit: 1, expr, lean: leanK, ...lap, lookY: think > 0.5 ? -0.1 : 0.05, headTilt: think > 0.5 ? -4 : 0 };
  };

  // ---------- Билал ----------
  const bilalSeat = seatPlace(castById("bilal"));
  const bilalFace = (t: number) => {
    if (speaking(9, t)) return 0.85; // на лампу
    const l21 = L(21);
    if (t >= l21.from && t <= l21.to) return (t - l21.from) / (l21.to - l21.from) < 0.5 ? 0.7 : 0.85;
    const sp = speakerOf(t);
    if (sp === "muhammad") return 0.75;
    if (sp === "yusuf") return -0.45;
    if (sp === "amir") return -0.75;
    const s = scene(t);
    if (s === "s1") return -0.5;
    return 0.8;
  };
  const bilalPose = (t: number): PoseIn => {
    const p = bilalSeat;
    const lap = lapArms(p);
    const expr = speaking(23, t) || speaking(28, t) || speaking(9, t) ? "curious" : speaking(21, t) || speaking(35, t) ? "focused" : "listening";
    const leanK = speaking(21, t) || speaking(28, t) ? 5 : 0;
    return { floorSit: 1, expr, lean: leanK, ...lap, lookY: 0.05 };
  };

  // ---------- фон класса ----------
  const focusX = (t: number) => {
    const sp = speakerOf(t);
    const s = t / FPS;
    if (spinAt(tl, s)) return GLOBE.cx;
    if ((t >= curtainClose.from - 20 && t <= curtainClose.to + 20) || (t >= curtainOpen.from - 20 && t <= curtainOpen.to + 20)) return WINDOW_STAND.x;
    if (sp === "muhammad") return scene(t) === "s1" ? T_SQUAT.x : T_SEAT.x;
    if (sp === "yusuf") return yusufPlace(t).x;
    if (sp === "amir") return amirPlace(t).x;
    if (sp === "bilal") return bilalSeat.x;
    if (tl.pauses.some((ps) => s >= ps.from && s <= ps.to)) return GLOBE.cx;
    if (scene(t) === "s1") return yusufSeat.x;
    if (scene(t) === "s8") return Y_DRAW.x;
    return GLOBE.cx;
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
    // старший ученик (pupil19) поднимает руку в конце паузы P2 и опускает после ответа Билала
    const raises = p.id === "pupil19" && tl.pauses[1];
    const raiseFrom = raises ? sec(tl.pauses[1].to) - sec(1.6) : 0;
    const raiseTo = raises ? L(35).to + sec(0.6) : 0;
    // младший смотрит на рисунок в сцене 8, кто-то кивает после ответа
    return {
      place: () => base,
      face: (t) => faceTo(stubborn ? T_SEAT.x : focusX(t - delay), p.seat.x, 900),
      pose: (t) => {
        const micro = bgMicro(t, p.seed);
        const lap = lapArms(base);
        const r = raises ? win(t, raiseFrom, raiseTo, 10) : 0;
        const armR = r > 0.01 ? arm({ x: lerp(lap.armR.target!.x, base.x + 0.14 * base.h, r), y: lerp(lap.armR.target!.y, base.y - 0.78 * base.h, r) }, "open", "out") : lap.armR;
        const nodAfter = [35, 37, 39].map((id) => L(id).to + 6 + Math.floor(hash01(p.seed + id) * 20));
        const nod = nodAfter.some((n) => t >= n && t < n + 16 && hash01(p.seed + 3) > 0.6) ? Math.sin(((t - nodAfter.find((n) => t >= n && t < n + 16)!) / 16) * Math.PI) * 6 : 0;
        return { floorSit: 1, expr: "listening", ...lap, armR, ...micro, nod: nod + (micro.lean > 0 ? 0 : 0) };
      },
    };
  };

  return {
    teacher: { place: teacherPlace, face: teacherFace, pose: teacherPose },
    teacherArmsFront,
    yusuf: { place: yusufPlace, face: yusufFace, pose: yusufPose },
    amir: { place: amirPlace, face: amirFace, pose: amirPose },
    bilal: { place: () => bilalSeat, face: bilalFace, pose: bilalPose },
    bg,
    lamp,
    curtain,
    globeLift,
    globeOnTable,
    sheetsOnTable,
    blankOnTable,
    yusufSheets,
    earthLen,
    drawingHand,
    events,
  };
};

// Геометрия рисунка в мире (лист лежит на столе у левого края).
import { EARTH_TOTAL as _ET, SHEET_H, SHEET_W, pencilTip, strokeStart as _ss } from "./earthPath.ts";
export const DRAW = {
  EARTH_TOTAL: _ET,
  strokeStart: _ss,
  // лист на столе: центр и сплющенный масштаб
  sheet: { x: SHEETS.blank.x + 40, y: SHEETS.blank.y - 4, w: 150, k: 0.26 },
  tipWorld: (len: number): Vec => {
    const tip = pencilTip(len);
    const kx = 150 / SHEET_W;
    return { x: SHEETS.blank.x + 40 + (tip.x - SHEET_W / 2) * kx, y: SHEETS.blank.y - 4 + (tip.y - SHEET_H / 2) * kx * 0.26 };
  },
};
void BOAT;
void TABLE;
void keys;
