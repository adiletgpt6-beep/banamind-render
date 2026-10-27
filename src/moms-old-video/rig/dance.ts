// Хореография фильма №33: два простых движения, которые повторяются в
// начале (старая запись), в середине (мама показывает сыну) и в финале
// (мама с сыном на новой записи).
//
//   A — приставной шаг в сторону с переносом веса: колени чуть сгибаются
//       (подготовка), вес уходит на опорную ногу, свободная стопа
//       поднимается, переносится и ставится всей стопой; таз переезжает
//       на новую опору, вторая нога приставляется. Сначала вправо, затем
//       обратно влево — движение заканчивается в исходной стойке.
//       Опорная стопа стоит на месте (не скользит).
//   B — плавное движение рук с небольшим поворотом корпуса: правая рука
//       поднимается дугой от плеча, локоть мягкий, кисть ведёт; левая
//       раскрывается в сторону; корпус чуть поворачивается и тянется,
//       голова догоняет корпус с задержкой и смотрит на кисть.
//
// Всё — в единицах рисунка (рост взрослого ≈ 1000) относительно точки
// персонажа; масштаб ребёнка — по его пропорциям. Детерминированно:
// поза зависит только от номера кадра.
import { clamp, easeInOut, lerp, smoothstep } from "./motion.ts";
import type { ArmFk, FootLocal } from "./pose.ts";
import type { Build } from "./looks.ts";

export type MoveId = "A" | "Amirror" | "B" | "tuck" | "bow" | "rest";

export type DanceSeg = { readonly move: MoveId; readonly from: number; readonly dur: number; readonly size?: number };

export type DancePose = {
  readonly feet: readonly [FootLocal, FootLocal];
  readonly hipShift: number;
  readonly hipTilt: number;
  readonly torsoTilt: number;
  readonly crouch: number;
  readonly armL: ArmFk;
  readonly armR: ArmFk;
  readonly turn: number; // поворот корпуса (−1…1)
  readonly headTilt: number;
  readonly lookY: number;
  readonly lean: number;
  readonly nod: number;
  readonly tuck: number; // 0…1 — правая кисть у уха (характерный жест)
};

const REST_ARM: ArmFk = { sh: 12, el: 10, wr: 0 };

type Raw = Omit<DancePose, "feet"> & { readonly fl: FootLocal; readonly fr: FootLocal };

const bump = (u: number, a: number, b: number) => (u <= a || u >= b ? 0 : Math.sin((Math.PI * (u - a)) / (b - a)));
const seg = (u: number, a: number, b: number) => easeInOut((u - a) / (b - a));
const mixArm = (a: ArmFk, b: ArmFk, t: number): ArmFk => ({ sh: lerp(a.sh, b.sh, t), el: lerp(a.el, b.el, t), wr: lerp(a.wr ?? 0, b.wr ?? 0, t) });

// Стойка: стопы под тазом.
const standX = (b: Build) => (b.hipJointX + 8) * 0.85;

// Перенос одной стопы: из x0 в x1 на отрезке [a, b] фазы u, подъём lift.
const swingFoot = (u: number, a: number, b: number, x0: number, x1: number, lift: number, dir: number): FootLocal => {
  const e = seg(u, a, b);
  const up = bump(u, a, b);
  return { x: lerp(x0, x1, e), y: -14 - lift * up, roll: -10 * up * dir };
};

// A: шаг вправо (u 0…0,5) и обратно влево (0,5…1). mirror — начинает влево.
const moveA = (u: number, b: Build, size: number, mirror: boolean): Raw => {
  const sx = standX(b);
  const step = 118 * size * (b.headRx > 68 ? 0.82 : 1);
  const d = mirror ? -1 : 1; // направление первого шага
  const half = (v: number, first: boolean) => {
    // v — фаза половины (0…1); first — первая половина (наружу)
    const dir = first ? d : -d;
    const base = first ? 0 : d * step; // где центр стойки в начале половины
    // подготовка: вес на опорную ногу (противоположную направлению)
    const prep = seg(v, 0, 0.22);
    const land = 0.56;
    const transfer = seg(v, 0.46, 0.8);
    const close = seg(v, 0.68, 1);
    const crouch = 0.07 * bump(v, 0, 0.5) + 0.05 * bump(v, 0.5, 1);
    // ведущая стопа — по направлению шага
    const leadX0 = base + dir * sx;
    const leadX1 = base + dir * (sx + step);
    const trailX0 = base - dir * sx;
    const trailX1 = base + dir * (step - sx);
    const lead = swingFoot(v, 0.18, land, leadX0, leadX1, 42 * size, dir);
    const trail = v < 0.68 ? { x: trailX0, y: -14, roll: 0 } : swingFoot(v, 0.68, 1, trailX0, trailX1, 16 * size, dir);
    // таз: сначала к опорной ноге, затем переезжает на новую опору (с
    // небольшим «доездом» за опору — вес приходит мягко)
    const hipFinal = base - dir * 16 * prep * (1 - transfer) + dir * step * transfer + dir * 10 * bump(v, 0.6, 1);
    const tilt = dir * (4 * prep * (1 - transfer) - 4 * transfer * (1 - close));
    const torso = -dir * 3.5 * bump(v, 0.3, 1);
    // руки: мягкая встречная волна
    const open = bump(v, 0.15, 1);
    const armOut: ArmFk = { sh: 30 + 8 * open, el: 18, wr: -10 };
    const armL = mixArm(REST_ARM, armOut, open * (dir > 0 ? 0.9 : 1.1));
    const armR = mixArm(REST_ARM, armOut, open * (dir > 0 ? 1.1 : 0.9));
    const fl = dir > 0 ? trail : lead;
    const fr = dir > 0 ? lead : trail;
    return { fl, fr, hipShift: hipFinal, hipTilt: tilt, torsoTilt: torso, crouch, armL, armR, turn: 0.05 * dir * open, headTilt: 0, lookY: 0.05, lean: 0, nod: 0, tuck: 0 };
  };
  return u < 0.5 ? half(u / 0.5, true) : half((u - 0.5) / 0.5, false);
};

// B: рука вверх дугой и обратно; корпус поворачивается и тянется.
const moveB = (u: number, b: Build, size: number): Raw => {
  const sx = standX(b);
  const up = seg(u, 0.05, 0.5);
  const down = seg(u, 0.6, 1);
  const k = up * (1 - down);
  // кисть ведёт: на подъёме запястье отстаёт вниз, на спуске — вверх
  const lagUp = bump(u, 0.05, 0.5);
  const lagDown = bump(u, 0.6, 1);
  const armR: ArmFk = {
    sh: lerp(12, 128 * size + 12 * (1 - size), k),
    el: lerp(10, 26, k) + 14 * lagUp - 6 * lagDown,
    wr: -24 * lagUp + 26 * lagDown,
  };
  const armL: ArmFk = { sh: lerp(12, 72, smoothstep(clamp(k * 1.2))), el: lerp(10, 24, k), wr: -10 * lagUp + 12 * lagDown };
  return {
    fl: { x: -sx, y: -14, roll: 0 },
    fr: { x: sx, y: -14, roll: 0 },
    hipShift: 14 * k,
    hipTilt: -2 * k,
    torsoTilt: -5 * k,
    crouch: 0.04 * bump(u, 0, 0.3) + 0.03 * bump(u, 0.55, 1),
    armL,
    armR,
    turn: 0.24 * k,
    headTilt: -3 * k,
    lookY: -0.45 * k,
    lean: 0,
    nod: 0,
    tuck: 0,
  };
};

// Характерный жест мамы: правая кисть убирает прядь за ухо, лёгкий наклон
// головы. Рука идёт к уху IK (tuck), остальное — стойка.
const moveTuck = (u: number, b: Build): Raw => {
  const sx = standX(b);
  const k = seg(u, 0, 0.4) * (1 - seg(u, 0.7, 1));
  return {
    fl: { x: -sx, y: -14, roll: 0 },
    fr: { x: sx, y: -14, roll: 0 },
    hipShift: 6 * k,
    hipTilt: -1.5 * k,
    torsoTilt: 0,
    crouch: 0,
    armL: REST_ARM,
    armR: REST_ARM,
    turn: 0.12 * k,
    headTilt: 6 * k,
    lookY: 0.1 * k,
    lean: 0,
    nod: 0,
    tuck: k,
  };
};

// Поклон в конце выступления: корпус и голова вперёд, правая кисть к груди,
// левая — в сторону.
const moveBow = (u: number, b: Build): Raw => {
  const sx = standX(b);
  const k = seg(u, 0, 0.35) * (1 - seg(u, 0.7, 1));
  return {
    fl: { x: -sx, y: -14, roll: 0 },
    fr: { x: sx, y: -14, roll: 0 },
    hipShift: 0,
    hipTilt: 0,
    torsoTilt: 0,
    crouch: 0.05 * k,
    armL: mixArm(REST_ARM, { sh: 48, el: 12, wr: -8 }, k),
    armR: mixArm(REST_ARM, { sh: -30, el: -78, wr: -10 }, k),
    turn: 0,
    headTilt: 0,
    lookY: 0.4 * k,
    lean: 16 * k,
    nod: 16 * k,
    tuck: 0,
  };
};

const restPose = (b: Build): Raw => {
  const sx = standX(b);
  return {
    fl: { x: -sx, y: -14, roll: 0 },
    fr: { x: sx, y: -14, roll: 0 },
    hipShift: 0,
    hipTilt: 0,
    torsoTilt: 0,
    crouch: 0,
    armL: REST_ARM,
    armR: REST_ARM,
    turn: 0,
    headTilt: 0,
    lookY: 0,
    lean: 0,
    nod: 0,
    tuck: 0,
  };
};

const rawAt = (t: number, segs: readonly DanceSeg[], b: Build): Raw => {
  for (const s of segs) {
    if (t >= s.from && t < s.from + s.dur) {
      const u = (t - s.from) / s.dur;
      const size = s.size ?? 1;
      if (s.move === "A") return moveA(u, b, size, false);
      if (s.move === "Amirror") return moveA(u, b, size, true);
      if (s.move === "B") return moveB(u, b, size);
      if (s.move === "tuck") return moveTuck(u, b);
      if (s.move === "bow") return moveBow(u, b);
    }
  }
  return restPose(b);
};

// Поза в кадре t. Голова следует за корпусом с задержкой ≈ 4 кадра; волосы
// и подол запаздывают по скорости таза.
export const danceAt = (t: number, segs: readonly DanceSeg[], b: Build): DancePose => {
  const r = rawAt(t, segs, b);
  const lag = rawAt(t - 4, segs, b);
  return {
    feet: [r.fl, r.fr],
    hipShift: r.hipShift,
    hipTilt: r.hipTilt,
    torsoTilt: r.torsoTilt,
    crouch: r.crouch,
    armL: r.armL,
    armR: r.armR,
    turn: r.turn,
    // голова: наклон догоняет наклон корпуса (компенсирует его на ≈ 60 %)
    headTilt: r.headTilt - 0.6 * (r.torsoTilt - lag.torsoTilt) - 0.25 * r.torsoTilt,
    lookY: lag.lookY,
    lean: r.lean,
    nod: r.nod,
    tuck: r.tuck,
  };
};

// Скорость таза (для волос и подола), единицы за 4 кадра.
export const hipVelocity = (t: number, segs: readonly DanceSeg[], b: Build) => rawAt(t - 2, segs, b).hipShift - rawAt(t - 6, segs, b).hipShift;

// Цель кисти для жеста «прядь за ухо» (единицы рисунка от точки персонажа).
// Цель — запястье сбоку от уха; кисть рисуется за головой (behind), так
// что пальцы уходят за ухо и не закрывают лицо.
export const tuckTarget = (b: Build, k: number, rest: { x: number; y: number }) => ({
  x: lerp(rest.x, b.headRx * 1.32, k),
  y: lerp(rest.y, b.headY + b.headRy * 0.25, k),
});
