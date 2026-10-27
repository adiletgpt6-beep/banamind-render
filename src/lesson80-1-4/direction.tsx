// Режиссура ролика 80-1-4 «Один Создатель»: планы и камера, позы, шаги,
// взгляды и мимика персонажей, действия с предметами (полив, лейка, карточки,
// поддон), состояние предметов. Всё считается от временной шкалы
// (timeline.ts) — по фактическим границам речи; от времени кадра зависит
// только движение, без накопленного состояния и без Math.random.
//
// Контакты рук: предмет — главный (его положение задаётся по времени), кисть
// ставится в точку захвата предмета (canPoint, края карточки, край поддона) и
// следует за ним; руки решаются IK, корпус наклоняется к цели настолько,
// чтобы рука оставалась удобно полусогнутой.
import React from "react";
import { blinkAt, type Expr, exprTrack, type Key, lookAt, poseTrack, speakingMouth, track } from "../lesson01/anim";
import { SEATS, scaleAt, TABLE } from "../lesson01/layout";
import { solveRig } from "../lesson01/rig/Character";
import { type P, add, clamp, easeInOut, easeOut, hash01, lerp, lerpP, mul, strSeed } from "../lesson01/rig/geom";
import { AMIR, BILAL, EXTRA_KIDS, type Look, TEACHER, YUSUF } from "../lesson01/rig/looks";
import { type ArmPose, type Face, mixPose, type Pose } from "../lesson01/rig/pose";
import { kneel, sitCross, stand, toLocal } from "../lesson01/rig/presets";
import { a4Pack } from "./lang";
import { A4_LINES } from "./script";
import {
  A_PATH,
  A_SEAT,
  A_TABLE,
  AMIR_STACK,
  B_PATH,
  B_SEAT,
  B_TABLE,
  CAN0,
  CAN6,
  CAN_Y,
  POT0,
  POT_NEAR_YUSUF,
  QURAN_AT,
  RAIL0,
  SILL,
  STACK0,
  T_ROOT,
  TOP_Y,
  TS,
  WINDOW_C,
  Y_PATH,
  Y_SEAT,
  Y_TABLE,
} from "./layout";
import { halfKneel, kneelTall, poseSeq, type Walk, walkAt } from "./rig/motion";
import { CAN, CARD, CARD_GRIP, Card, type CardKind, canPoint, dripLandTimes, plantBox, POT, POT_SOIL, RAIL, streamEndsAt } from "./sets/props";
import type { Timeline } from "./timeline";
import type { CanState, Char, PotState, RoomState, StreamState } from "./world";

export type Cam = { cx: number; cy: number; w: number };
export type Shot = { from: number; to: number; cam: Key<Cam>[]; fade?: number; tag?: string };
const mixCam = (a: Cam, b: Cam, u: number): Cam => ({ cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), w: lerp(a.w, b.w, u) });
// камера не выходит за пределы комнаты (3840×2160)
export const camAt = (s: Shot, t: number): Cam => {
  const c = track(s.cam, t, mixCam);
  const h = (c.w * 9) / 16;
  return { w: c.w, cx: clamp(c.cx, c.w / 2, 3840 - c.w / 2), cy: Math.min(Math.max(c.cy, h / 2), 2160 - h / 2) };
};

// ---------- Действующие лица ----------
type Hero = "yusuf" | "amir" | "bilal";
const HERO_OF: Record<number, { look: Look; hero: Hero }> = { 0: { look: YUSUF, hero: "yusuf" }, 1: { look: AMIR, hero: "amir" }, 5: { look: BILAL, hero: "bilal" } };
// 25 учеников: 22 фоновых на постоянных местах (тот же порядок, что в
// предыдущих фильмах) и три героя; учитель — 26-й персонаж.
export const KIDS: { look: Look; seat: number; hero?: Hero }[] = (() => {
  let k = 0;
  return SEATS.map((_, i) => (HERO_OF[i] ? { ...HERO_OF[i], seat: i } : { look: EXTRA_KIDS[k++].look, seat: i }));
})();

const ST = scaleAt(T_ROOT.y);
const HAND_T = TEACHER.body.hand;
const ARM_T = (TEACHER.body.upperArm + TEACHER.body.foreArm) * ST;
const CAN_TILT_FLOW = 22; // наклон, с которого вода доходит до носика

const ySit = sitCross(YUSUF, -0.42);
const aSit = sitCross(AMIR, -0.4);
const bSit = sitCross(BILAL, -0.45);
const tKneel = kneel(TEACHER, 0.5);
const tStand = stand(TEACHER, 0.45);
const Y_YAW = -0.42; // Юсуф за столиком смотрит влево, к ростку и учителю
const A_YAW = 0.28; // Амир за столиком — к ростку и Юсуфу (лицо видно)
const B_YAW = -0.5; // Билал перед столиком — влево, к ростку и учителю

const withArms = (p: Pose, armL?: Partial<ArmPose>, armR?: Partial<ArmPose>, extra: Partial<Pose> = {}): Pose => ({
  ...p,
  armL: armL ? { ...p.armL, ...armL } : p.armL,
  armR: armR ? { ...p.armR, ...armR } : p.armR,
  ...extra,
});
const shoulderY = (look: Look, p: Pose) => solveRig(look, p).shoulderC.y;
const headWorld = (look: Look, pose: Pose, root: P) => {
  const r = solveRig(look, pose);
  const s = scaleAt(root.y);
  return { x: root.x + r.headC.x * s, y: root.y + r.headC.y * s };
};
const wristWorld = (look: Look, pose: Pose, root: P, side: "L" | "R") => {
  const r = solveRig(look, pose);
  return add(root, mul(r.arms[side].W, scaleAt(root.y)));
};

// Наклон корпуса к цели кисти: рука остаётся удобно полусогнутой.
const leanToward = (look: Look, base: Pose, root: P, armLen: number, w: P, side: "L" | "R", lo: number, hi: number, k = 0.74) => {
  const sc = scaleAt(root.y);
  let best = base.lean;
  let bestErr = Infinity;
  for (let l = hi; l >= lo; l -= 1) {
    const r = solveRig(look, { ...base, lean: l });
    const sh = add(root, mul(side === "L" ? r.shoulderL : r.shoulderR, sc));
    // только «не дотягивается»: близкая цель не вызывает наклона; при равенстве — ближе к исходному
    const err = Math.max(0, Math.hypot(sh.x - w.x, sh.y - w.y) - k * armLen) + 0.03 * Math.abs(l - base.lean);
    if (err < bestErr - 1e-6) {
      bestErr = err;
      best = l;
    }
  }
  return best;
};
const armLen = (look: Look, root: P) => (look.body.upperArm + look.body.foreArm) * scaleAt(root.y);

// Учитель: жесты как в предыдущих фильмах
// открытая ладонь над столом (не лежит на нём), к детям
const tGestureKids = (p: Pose) => withArms(p, undefined, { target: { x: 120, y: shoulderY(TEACHER, p) + 85 }, bend: 1, hand: "open", handRot: 0, handAbs: 100 });
// небольшой объясняющий жест перед собой (над карточками, не задевая Амира)
const tExplain = (p: Pose) => withArms(p, undefined, { target: { x: 88, y: shoulderY(TEACHER, p) + 80 }, bend: 1, hand: "palmUp", handRot: 0, handAbs: 100, front: true });
// открытая ладонь к мальчикам на уровне груди, выше карточек (ответ в сцене 8)
const tOpenKids = (p: Pose) => withArms(p, undefined, { target: { x: 100, y: shoulderY(TEACHER, p) + 50 }, bend: 1, hand: "open", handRot: 0, handAbs: 100, palm: true, front: true });
// открытая ладонь к мальчикам (перед телом, над столом, не задевая Амира)
const tToKids = (p: Pose) => withArms(p, undefined, { target: { x: 120, y: shoulderY(TEACHER, p) + 70 }, bend: 1, hand: "palmUp", handRot: 0, handAbs: 110, front: true });
// приглашающая открытая ладонь к зрителю — перед грудью, выше и левее карточек
const tGestureCam = (p: Pose) => withArms(p, undefined, { target: { x: 80, y: shoulderY(TEACHER, p) + 62 }, bend: 1, hand: "open", handRot: 0, handAbs: 160, palm: true, front: true });
// жест к окну: спокойная открытая ладонь у груди, голова и взгляд — к окну
// (рука не тянется к Амиру и не поднимается над головой)
const tGestureWindow = (p: Pose) => withArms(p, undefined, { target: { x: 60, y: shoulderY(TEACHER, p) + 80 }, bend: 1, hand: "palmUp", handRot: 0, handAbs: 95 }, { headYaw: 0.55, headPitch: -0.35 });

// ---------- Точки и опоры ----------
const soilTop = (pot: P): P => ({ x: pot.x, y: pot.y + POT_SOIL.y * TS });
// куда льётся вода и где палец проверяет землю (видимая земля слева от стебля)
const soilLand = (pot: P): P => ({ x: pot.x + POT_SOIL.land.x * TS, y: pot.y + POT_SOIL.land.y * TS });
const soilDent = (pot: P): P => ({ x: pot.x + POT_SOIL.dent.x * TS, y: pot.y + POT_SOIL.dent.y * TS });
const canWorld = (c: CanState, name: Parameters<typeof canPoint>[0]): P => {
  const q = canPoint(name, c.tilt);
  return { x: c.x + q.x * TS, y: c.y + q.y * TS };
};
const railSlot = (k: number): P => ({ x: RAIL0.x + RAIL.slots[k] * TS, y: RAIL0.y + RAIL.baseY * TS });
const CARD_ORDER: CardKind[] = ["sun", "drop", "soil", "wind"];

// Произвольная точка лейки (локальная, масштаб 1) с тем же наклоном, что у canPoint.
const canLocal = (q: P, tilt: number): P => {
  const r = (-tilt * Math.PI) / 180;
  const c = CAN.pivot;
  const dx = q.x - c.x;
  const dy = q.y - c.y;
  return { x: c.x + dx * Math.cos(r) - dy * Math.sin(r), y: c.y + dx * Math.sin(r) + dy * Math.cos(r) };
};
const canWorldAt = (c: CanState, q: P): P => {
  const l = canLocal(q, c.tilt);
  return { x: c.x + l.x * TS, y: c.y + l.y * TS };
};
// верх корпуса ближе к носику — сюда учитель кладёт ладонь, направляя наклон
const CAN_TOP_FRONT: P = { x: -12, y: -37 };

// Положение лейки (низ по центру) так, чтобы носик был в точке tip при наклоне tilt.
const canAtTip = (tip: P, tilt: number): P => {
  const q = canPoint("spoutTip", tilt);
  return { x: tip.x - q.x * TS, y: tip.y - q.y * TS };
};

// ---------- Сглаженные кусочные траектории ----------
type K1 = { at: number; v: number; ease?: (u: number) => number };
const keys1 = (ks: K1[], t: number) => {
  if (t <= ks[0].at) return ks[0].v;
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i].at) {
      const a = ks[i - 1];
      const b = ks[i];
      return lerp(a.v, b.v, (b.ease ?? easeInOut)((t - a.at) / Math.max(1e-3, b.at - a.at)));
    }
  }
  return ks[ks.length - 1].v;
};
type KP = { at: number; v: P; ease?: (u: number) => number; arc?: number };
const keysP = (ks: KP[], t: number): P => {
  if (t <= ks[0].at) return ks[0].v;
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i].at) {
      const a = ks[i - 1];
      const b = ks[i];
      const u = (b.ease ?? easeInOut)((t - a.at) / Math.max(1e-3, b.at - a.at));
      const p = lerpP(a.v, b.v, u);
      return { x: p.x, y: p.y - Math.sin(Math.PI * u) * (b.arc ?? 0) };
    }
  }
  return ks[ks.length - 1].v;
};

// Инерция ростка при сдвиге поддона: во время движения стебель отстаёт,
// после остановки — небольшое затухающее покачивание.
const inertia = (t: number, t0: number, t1: number, dir: number) => {
  if (t < t0) return 0;
  if (t <= t1) return -dir * 4.5 * Math.sin(Math.PI * ((t - t0) / (t1 - t0)));
  const d = t - t1;
  return dir * 3.2 * Math.exp(-3.2 * d) * Math.sin(2 * Math.PI * 1.5 * d);
};

// ---------- Построение режиссуры ----------
export const buildDirection = (T: Timeline) => {
  const S = T.seg;
  const H = T.hold;
  const PZ = T.pause;
  const sc = T.scenes;
  const n = (k: number) => `80-1-4-${String(k).padStart(3, "0")}`;
  const seg = (k: number) => S[n(k)];
  // слово внутри реплики (по таймингам; без озвучки — пропорционально)
  // слово русской реплики; в другой языковой версии — её слово-якорь
  const anchors = a4Pack(T.lang).anchors;
  const wordAt = (k: number, word: string, fallback: number) => {
    const s = seg(k);
    const want = (anchors[k]?.[word] ?? word).replace(/[^\p{L}]/gu, "").toLowerCase();
    const w = s.m.words.find((x) => x.text.replace(/[^\p{L}]/gu, "").toLowerCase() === want);
    return w ? s.fileStart + w.start : s.start + (s.end - s.start) * fallback;
  };

  // ---- Шаги и подъёмы ----
  const yRise0 = H.rise.start;
  const yWalk: Walk = { path: Y_PATH, t0: H.rise.end - 0.12, dur: H.walk.end - H.rise.end + 0.05, steps: 5, yaw: -0.55, lift: 0.18, bounce: 0.03, arm: 8 };
  const come0 = H.come.start - 0.9; // Амир встаёт ещё на «смешной» паузе
  const aWalk: Walk = { path: A_PATH, t0: come0 + 1.75, dur: 3.3, steps: 8, yaw: -0.55, lift: 0.14, bounce: 0.02 };
  const aKneel0 = aWalk.t0 + aWalk.dur - 0.05;
  const bRise0 = come0 + 2.95; // Билал встаёт, когда Амир уже прошёл мимо
  const bWalk: Walk = { path: B_PATH, t0: bRise0 + 1.4, dur: 1.2, steps: 3, yaw: -0.55, lift: 0.12 };
  const bKneel0 = bWalk.t0 + bWalk.dur - 0.05;
  const tKneel0 = H.tKneel.start + 0.15;
  const yCrouch0 = H.crouch.start;

  // ---- Лейка: положение (низ по центру) и наклон ----
  const tipPour = (tilt: number) => {
    const st = soilTop(POT0);
    // носик справа от ростка, ниже его листьев и чуть выше края горшка:
    // короткая тонкая струйка уходит в землю, носик не задевает листья
    return { x: st.x + 27 + tilt * 0.05, y: st.y - 26 + tilt * 0.15 };
  };
  const HOLD_A: P = { x: CAN0.x + 15, y: CAN0.y - 42 }; // приподнята над столом перед Юсуфом, ближе к его середине
  const lift0 = H.lift.start + 0.55; // кисти на лейке
  const lift1 = H.lift.start + 1.55; // лейка поднята
  const s4 = seg(4);
  const s5 = seg(5);
  const pour0 = H.pour.start - 0.15; // начало аккуратного наклона
  const stop0 = wordAt(7, "хватит", 0.6) - 0.05; // «хватит» — лейка выпрямляется
  const set0 = H.setCan.start + 0.3;
  const setTouch = H.setCan.start + 1.25; // донышко коснулось стола
  const take12 = wordAt(12, "ухаживать", 0.25) - 0.25;
  const help0 = H.help.start;
  const potSlide = { t0: help0 + 0.75, t1: help0 + 1.75 };
  const canDown = { t0: help0 + 2.45, touch: help0 + 3.35 }; // после того как рука Билала ушла со стола
  const tidy0 = H.tidy.start;
  const potBack = { t0: tidy0 + 1.3, t1: tidy0 + 2.5 };

  const tiltKeys: K1[] = [
    { at: 0, v: 0 },
    { at: s4.start + 0.15, v: 0 },
    { at: s4.start + 0.9, v: 17, ease: easeOut }, // «Я всё вылью!» — начинает лить слишком сильно
    { at: s5.start + 0.5, v: 17 },
    { at: s5.start + 1.4, v: 6 }, // ладонь учителя мягко останавливает
    { at: pour0, v: 6 },
    { at: pour0 + 0.9, v: 33 }, // аккуратный наклон: вода пошла
    { at: stop0, v: 34 },
    { at: stop0 + 0.7, v: 0 }, // выпрямил — вода остановилась
  ];
  const canTilt = (t: number) => (t < set0 ? keys1(tiltKeys, t) : 0);
  const flowStart = (() => {
    for (let t = s4.start; t < stop0 + 1; t += 1 / 120) if (canTilt(t) >= CAN_TILT_FLOW) return t;
    return pour0 + 0.6;
  })();
  const flowStop = (() => {
    for (let t = stop0; t < stop0 + 1.2; t += 1 / 120) if (canTilt(t) < CAN_TILT_FLOW) return t;
    return stop0 + 0.4;
  })();
  const canAt = (t: number): CanState => {
    if (t < lift0) return { ...CAN0, tilt: 0, held: false };
    if (t < set0) {
      const tl = canTilt(t);
      // подъём → «вылить всё» (выше и ближе к горшку) → полив: носик над землёй
      const lifted = keysP(
        [
          { at: lift0, v: CAN0 },
          { at: lift1, v: HOLD_A, arc: 6 },
          { at: s4.start + 0.15, v: HOLD_A },
          { at: s4.start + 0.9, v: { x: HOLD_A.x - 14, y: HOLD_A.y - 10 }, ease: easeOut },
          { at: s5.start + 1.4, v: { x: HOLD_A.x - 8, y: HOLD_A.y - 4 } },
        ],
        t,
      );
      if (t < pour0) return { ...lifted, tilt: tl, held: true };
      const pourPos = canAtTip(tipPour(tl), tl);
      const start = { x: HOLD_A.x - 8, y: HOLD_A.y - 4 };
      if (t < pour0 + 0.9) return { ...lerpP(start, pourPos, easeInOut((t - pour0) / 0.9)), tilt: tl, held: true };
      if (t < stop0) return { ...pourPos, tilt: tl, held: true };
      // «хватит»: лейка выпрямляется, носик поднимается вверх и вправо — от
      // ростка (траектория задаётся носиком, корпус и руки следуют за ним)
      const tipUp = { x: soilTop(POT0).x + 40, y: soilTop(POT0).y - 46 };
      const stopTip = (u: number) => lerpP(tipPour(canTilt(stop0)), tipUp, easeInOut(u));
      if (t < stop0 + 0.7) return { ...canAtTip(stopTip((t - stop0) / 0.7), tl), tilt: tl, held: true };
      const end = canAtTip(tipUp, 0);
      return { ...lerpP(end, HOLD_A, easeInOut((t - stop0 - 0.7) / 1.0)), tilt: 0, held: true };
    }
    if (t < take12) {
      const p = keysP(
        [
          { at: set0, v: HOLD_A },
          { at: setTouch, v: CAN0, arc: 8 },
        ],
        t,
      );
      return { ...p, tilt: 0, held: t < setTouch + 0.35 };
    }
    if (t < canDown.t0) {
      // «ухаживать» — берёт лейку и ставит поближе к себе; руки остаются на ней
      const p = keysP(
        [
          { at: take12, v: CAN0 },
          { at: take12 + 0.35, v: CAN0 },
          { at: take12 + 1.15, v: CAN_Y, arc: 2 }, // двигает по столу
        ],
        t,
      );
      return { ...p, tilt: 0, held: t >= take12 + 0.3 && t < take12 + 1.25 };
    }
    const p = keysP(
      [
        { at: canDown.t0, v: CAN_Y },
        { at: canDown.touch, v: CAN6, arc: 12 },
      ],
      t,
    );
    return { ...p, tilt: 0, held: t > canDown.t0 + 0.05 && t < canDown.touch + 0.3 };
  };

  // ---- Горшок ----
  const potAt = (t: number): PotState => {
    let x = POT0.x;
    let y = POT0.y;
    let tilt = 0;
    if (t >= potSlide.t0) {
      const u = easeInOut(clamp((t - potSlide.t0) / (potSlide.t1 - potSlide.t0)));
      x = lerp(POT0.x, POT_NEAR_YUSUF.x, u);
      y = lerp(POT0.y, POT_NEAR_YUSUF.y, u);
      tilt += inertia(t, potSlide.t0, potSlide.t1, 1);
    }
    if (t >= potBack.t0) {
      const u = easeInOut(clamp((t - potBack.t0) / (potBack.t1 - potBack.t0)));
      x = lerp(POT_NEAR_YUSUF.x, POT0.x, u);
      y = lerp(POT_NEAR_YUSUF.y, POT0.y, u);
      tilt = inertia(t, potBack.t0, potBack.t1, -1);
    }
    const wet = clamp((t - flowStart - 0.35) / 2.4) * 0.85;
    const puddle = clamp((t - flowStart - 0.2) / 0.6) * (1 - clamp((t - flowStop - 0.3) / 2.6)) * 0.9;
    const light = 1 - 0.65 * clamp(Math.abs(x - POT0.x) / Math.abs(POT_NEAR_YUSUF.x - POT0.x));
    const touch0 = H.soil.start + 0.95;
    const dent = clamp((t - touch0) / 0.25) * 0.6;
    return { x, y, wet, puddle, sway: 0, tilt, light, dent };
  };

  // хвост струи падает оттуда, где носик был в момент остановки; каждая капля —
  // оттуда, где носик был в момент её отрыва (лейку уже выпрямляют и поднимают)
  const spoutTipAt = (t: number): P => canWorld(canAt(t), "spoutTip");
  const spoutDirAt = (t: number): P => canPoint("spoutDir", canAt(t).tilt);
  const cStop = canAt(flowStop);
  const detach = { tip: canWorld(cStop, "spoutTip"), dir: canPoint("spoutDir", cStop.tilt) };
  const streamEnd = streamEndsAt(spoutTipAt, soilLand(POT0), flowStop, TS, spoutDirAt);
  // когда каждая капля касается земли (с) — тот же расчёт, по которому она рисуется
  const dripLand = dripLandTimes(spoutTipAt, soilLand(POT0), flowStop, TS, spoutDirAt);
  const streamAt = (t: number): StreamState => {
    if (t < flowStart || t > streamEnd + 0.05) return null;
    const c = canAt(t);
    const tip = canWorld(c, "spoutTip");
    const d = canPoint("spoutDir", c.tilt);
    return { tip, dir: d, land: soilLand(POT0), start: flowStart, stop: t >= flowStop ? flowStop : null, detach: t >= flowStop ? detach : undefined, tipAt: spoutTipAt, dirAt: spoutDirAt };
  };

  // ---- Карточки ----
  // Учитель берёт верхнюю карточку из стопки, поднимает, переносит и ставит
  // в подставку (солнце, капля, почва, листья на ветру), отпускает.
  const cards0 = H.cardsOut.start + 0.5;
  const CARD_STEP = 1.85;
  const cardT = (k: number) => {
    const a = cards0 + k * CARD_STEP;
    return { reach: a, grip: a + 0.45, lift: a + 0.7, over: a + 1.25, seat: a + 1.5, release: a + 1.62, back: a + 1.85 };
  };
  // Амир собирает карточки (справа налево) и кладёт стопку перед собой.
  const gather0 = tidy0 + 0.2;
  const G_STEP = 0.95;
  const gatherT = (j: number) => {
    const a = gather0 + j * G_STEP;
    return { reach: a, grip: a + 0.3, up: a + 0.5, place: a + 0.85 };
  };
  const cardsAt = (t: number) => {
    const rail: (CardKind | null)[] = [null, null, null, null];
    let stack = 4;
    for (let k = 0; k < 4; k++) {
      const c = cardT(k);
      if (t >= c.grip) stack--;
      if (t >= c.seat) rail[k] = CARD_ORDER[k];
    }
    let amirStack = 0;
    for (let j = 0; j < 4; j++) {
      const g = gatherT(j);
      const k = 3 - j;
      if (t >= g.grip) rail[k] = null;
      if (t >= g.place) amirStack++;
    }
    return { rail, stack, amirStack, amirStackAt: AMIR_STACK };
  };

  // ---- Планы ----
  const shots: Shot[] = [];
  const add2 = (from: number, to: number, cams: (Cam & { at?: number; dur?: number })[], extra: Partial<Shot> = {}) => {
    const cam: Key<Cam>[] = cams.map((c, i) => ({ at: c.at ?? from, v: { cx: c.cx, cy: c.cy, w: c.w }, dur: c.dur ?? (i === 0 ? undefined : to - from) }));
    shots.push({ from, to, cam, ...extra });
  };
  const fixed = (from: number, to: number, c: Cam, extra: Partial<Shot> = {}) => add2(from, to, [c], extra);
  const drift = (from: number, to: number, a: Cam, b: Cam, extra: Partial<Shot> = {}) => add2(from, to, [{ ...a, at: from }, { ...b, at: from, dur: to - from }], extra);

  const CU = {
    open: { cx: 2160, cy: 1225, w: 3300 }, // весь класс целиком
    openEnd: { cx: 1720, cy: 1540, w: 2050 },
    tableStand: { cx: 1600, cy: 1630, w: 1700 }, // учитель ещё стоит: голова в кадре; Юсуф виден в рост
    tableMid: { cx: 1580, cy: 1650, w: 1120 },
    group: { cx: 1620, cy: 1650, w: 1320 },
    groupWide: { cx: 1740, cy: 1560, w: 1800 },
    soil: { cx: POT0.x + 4, cy: POT0.y - 44, w: 250 },
    pot: { cx: POT0.x + 4, cy: POT0.y - 62, w: 330 },
    leaves: { cx: POT0.x + 4, cy: POT0.y - 92, w: 230 },
    pour: { cx: POT0.x + 40, cy: POT0.y - 60, w: 430 },
    yusufCan: { cx: 1675, cy: 1648, w: 620 }, // запас над головой
    yusuf: { cx: 1700, cy: 1690, w: 540 },
    yusufPlant: { cx: 1665, cy: 1712, w: 430 },
    amirSeat: { cx: 2040, cy: 1745, w: 1200 }, // лица ряда за Амиром целиком
    amir: { cx: 1645, cy: 1650, w: 600 }, // Амир, Юсуф и Билал целиком; лицо учителя за кадром
    amirCards: { cx: 1610, cy: 1688, w: 510 }, // Амир и карточки; лицо учителя за кадром, головы Амира и Юсуфа целиком
    bilal: { cx: 1780, cy: 1745, w: 600 },
    teacher: { cx: 1330, cy: 1680, w: 700 }, // без половины лица Юсуфа у края
    teacherAmir: { cx: 1400, cy: 1690, w: 880 },
    teacherYusuf: { cx: 1510, cy: 1670, w: 1060 },
    cardsTable: { cx: 1452, cy: 1708, w: 740 },
    cards: { cx: RAIL0.x + 2, cy: RAIL0.y - 26, w: 270 },
    kids: { cx: 2160, cy: 1560, w: 2250 },
    kidsAll: { cx: 2060, cy: 1450, w: 2500 }, // низ кадра — в пределах комнаты
    classAll: { cx: 2330, cy: 1455, w: 2480 }, // весь класс: учитель и все 25 мальчиков
    windowWide: { cx: 2300, cy: 1180, w: 2900 },
    sill: { cx: SILL.x, cy: SILL.y - 200, w: 900 }, // стёкла с небом и травой, подоконник внизу
    sky: { cx: WINDOW_C.x, cy: WINDOW_C.y - 150, w: 700 },
    windowView: { cx: WINDOW_C.x, cy: WINDOW_C.y - 90, w: 900 }, // горы со снежной вершиной целиком
    quran: { cx: QURAN_AT.x + 10, cy: QURAN_AT.y - 70, w: 620 },
    final: { cx: 2160, cy: 1400, w: 3000 }, // весь класс; верх кадра — стена (под надпись)
  };

  // Сцена 1 — «Сейчас вырастет!»
  drift(0, H.rise.start, CU.open, CU.openEnd);
  // камера плавно приходит к столику и останавливается (без склейки), затем
  // медленно приближается, пока учитель присаживается
  drift(H.rise.start, seg(1).start - 0.25, CU.openEnd, CU.tableStand);
  fixed(seg(1).start - 0.25, H.tKneel.end - 0.3, CU.tableStand);
  drift(H.tKneel.end - 0.3, seg(2).start + 1.2, CU.tableStand, CU.tableMid);
  fixed(seg(2).start + 1.2, H.soil.start + 0.1, CU.tableMid);
  drift(H.soil.start + 0.1, H.soil.start + 2.0, CU.soil, { ...CU.soil, w: 236 });
  fixed(H.soil.start + 2.0, seg(3).end + 0.35, CU.amirSeat); // Амир наклоняется к ростку в кадре
  fixed(seg(3).end + 0.35, s5.start - 0.55, CU.yusufCan);
  fixed(s5.start - 0.55, pour0 - 0.1, CU.teacherYusuf); // рука учителя тянется уже в этом плане
  drift(pour0 - 0.1, stop0 + 0.9, CU.pour, { ...CU.pour, w: 400 });
  fixed(stop0 + 0.9, sc.wait.start, CU.tableMid);

  // Сцена 2 — «Почему он не вырос сразу?»
  // Юсуф ставит лейку, присаживается — камера одним движением подходит
  // ближе; «ничего не происходит» — его недоумение и прежний росток в одном кадре
  add2(sc.wait.start, come0, [
    { cx: 1640, cy: 1670, w: 590, at: sc.wait.start }, // без лица фонового мальчика в углу
    { ...CU.yusufPlant, at: yCrouch0, dur: 1.5 },
    { ...CU.yusufPlant, cx: 1657, w: 400, at: yCrouch0 + 1.5, dur: seg(8).end + 0.25 - (yCrouch0 + 1.5) },
    { cx: 1650, cy: 1712, w: 390, at: seg(8).end + 0.25, dur: come0 - (seg(8).end + 0.25) },
  ]);
  // Амир и Билал встают и подходят: общий план (видны и места, и столик)
  drift(come0, seg(9).start - 0.15, { ...CU.groupWide, cy: 1600 }, { ...CU.groupWide, cx: 1700, cy: 1600 });
  fixed(seg(9).start - 0.15, seg(9).end + 0.35, CU.amir);
  const w10 = wordAt(10, "Посмотрите", 0.4);
  fixed(seg(9).end + 0.35, w10 - 0.1, CU.teacher);
  // «стебелёк и листья» — крупно листья; «Позже появятся новые» — трое мальчиков у ростка
  const w10b = wordAt(10, "Позже", 0.8);
  drift(w10 - 0.1, w10b - 0.1, CU.leaves, { ...CU.leaves, w: 215 });
  fixed(w10b - 0.1, seg(10).end + 0.4, { cx: 1720, cy: 1690, w: 760 });
  // Билал, затем без склейки — Юсуф придвигает лейку к себе; дальше одно
  // движение камеры к общему плану начала сцены 3
  fixed(seg(10).end + 0.4, take12 - 0.5, { cx: 1790, cy: 1700, w: 520 });
  drift(take12 - 0.5, take12 + 1.5, { cx: 1790, cy: 1700, w: 520 }, { cx: 1775, cy: 1720, w: 460 });
  drift(take12 + 1.5, sc.needs.start, { cx: 1580, cy: 1715, w: 980 }, CU.group);

  // Сцена 3 — «Не только вода»
  drift(sc.needs.start, seg(13).end + 0.3, CU.group, CU.groupWide);
  fixed(seg(13).end + 0.3, seg(14).start - 0.1, CU.kidsAll); // пауза 4 с: дети думают
  fixed(seg(14).start - 0.1, seg(14).end + 0.3, { cx: 1500, cy: 1650, w: 660 }); // «Свет!» — Амир приподнимается, голова в кадре
  fixed(seg(14).end + 0.3, H.toWindow.start, { cx: 1810, cy: 1690, w: 780 }); // «И воздух.»
  drift(H.toWindow.start, seg(16).start - 0.15, CU.windowWide, { ...CU.windowWide, w: 2800 });
  // реплика 16: учитель → почва и листья (камера ведёт снизу вверх) → учитель с жестом к окну → окно
  const w16v = wordAt(16, "воду", 0.3);
  const w16b = wordAt(16, "Листья", 0.5);
  const w16i = wordAt(16, "И", 0.7);
  fixed(seg(16).start - 0.15, w16v - 0.05, CU.teacher);
  add2(w16v - 0.05, w16i - 0.2, [
    { ...CU.soil, at: w16v - 0.05 },
    { ...CU.soil, w: 240, at: w16v - 0.05, dur: Math.max(0.3, w16b - 0.3 - (w16v - 0.05)) },
    { ...CU.leaves, at: w16b - 0.3, dur: 0.9 },
  ]);
  fixed(w16i - 0.2, seg(16).end + 0.4, CU.teacherAmir);
  drift(seg(16).end + 0.4, H.sill.end, CU.sill, { ...CU.sill, w: 860 }, { fade: 0.3 });
  fixed(H.sill.end, seg(17).end + 0.3, { cx: 1690, cy: 1660, w: 620 });
  // небо → камера опускается к подоконнику: «свет доходит до нашего окна»
  drift(seg(17).end + 0.3, seg(18).start + 0.6, CU.sky, { cx: WINDOW_C.x, cy: SILL.y - 260, w: 760 }, { fade: 0.35 });
  const w18 = wordAt(18, "Всё", 0.65);
  fixed(seg(18).start + 0.6, w18 + 0.3, CU.groupWide);
  // «всё это помогает ростку расти» — мальчики смотрят на росток в обычном дневном свете
  drift(w18 + 0.3, sc.cards.start, { cx: 1675, cy: 1665, w: 620 }, { cx: 1675, cy: 1665, w: 590 });

  // Сцена 4 — «Разные создатели?»
  fixed(sc.cards.start, cardT(3).back + 0.7, CU.cardsTable);
  drift(cardT(3).back + 0.7, cardT(3).back + 1.9, { ...CU.cards, cx: CU.cards.cx - 30 }, { ...CU.cards, cx: CU.cards.cx + 10 });
  fixed(cardT(3).back + 1.9, seg(19).end + 0.4, CU.amirCards); // Амир сравнивает карточки
  fixed(seg(19).end + 0.4, seg(20).end + 0.35, CU.teacher);
  fixed(seg(20).end + 0.35, seg(21).end + 0.35, { cx: 1645, cy: 1700, w: 590 }); // «Аллах.» — Юсуф, рядом Амир и Билал
  fixed(seg(21).end + 0.35, seg(22).end + 0.3, { cx: 1760, cy: 1650, w: 780 }); // Билал указывает на горшок
  fixed(seg(22).end + 0.3, seg(23).end + 0.35, CU.teacher);
  drift(seg(23).end + 0.35, seg(24).end + 0.3, CU.amirCards, { cx: 1605, cy: 1690, w: 495 }); // плавно к Амиру, без «драмы»
  fixed(seg(24).end + 0.3, seg(25).end + 0.5, CU.teacherAmir);
  drift(seg(25).end + 0.5, sc.one.start, { cx: 1515, cy: 1790, w: 330 }, { cx: 1520, cy: 1792, w: 310 }); // карточки и росток (ниже подбородков)

  // Сцена 5 — «Что значит „Един“?»
  fixed(sc.one.start, seg(26).end + 0.35, { cx: 1640, cy: 1745, w: 1240 });
  const w27 = wordAt(27, "Коране", 0.35);
  fixed(seg(26).end + 0.35, w27 - 0.1, CU.teacher);
  drift(w27 - 0.1, wordAt(27, "АльИхляс", 0.7) + 0.2, CU.quran, { ...CU.quran, w: 590 }, { fade: 0.3 });
  fixed(wordAt(27, "АльИхляс", 0.7) + 0.2, seg(28).start - 0.15, { ...CU.groupWide, cx: 1680 }, { fade: 0.3 });
  fixed(seg(28).start - 0.15, seg(28).end + 0.35, CU.yusuf);
  fixed(seg(28).end + 0.35, seg(29).end + 0.4, { ...CU.teacherYusuf, cx: 1545 });
  fixed(seg(29).end + 0.4, seg(30).end + 0.35, { cx: 1505, cy: 1665, w: 640 }); // Амир вспоминает карточки
  fixed(seg(30).end + 0.35, seg(31).end + 0.4, CU.teacher);
  drift(seg(31).end + 0.4, sc.us.start, { ...CU.group, cx: 1595 }, { ...CU.group, cx: 1595, w: 1240 });

  // Сцена 6 — «А мы?»
  drift(sc.us.start, seg(32).end + 0.35, { cx: 1735, cy: 1730, w: 440 }, { cx: 1760, cy: 1700, w: 450 }); // ладонь крупно
  const w33a = wordAt(33, "Амира", 0.45);
  const w33b = wordAt(33, "Билала", 0.65);
  const w33c = wordAt(33, "всех", 0.85);
  // «и Амира, и Билала, и всех нас» — учитель и все трое в кадре, его взгляд
  // переходит от мальчика к мальчику
  void w33b;
  void w33c;
  void w33a;
  drift(seg(32).end + 0.35, help0, CU.teacherYusuf, { ...CU.teacherYusuf, cx: 1530, w: 1110 });
  // помощь и реплика Билала — один план (без склейки того же ракурса)
  fixed(help0, seg(34).end + 0.3, { cx: 1700, cy: 1752, w: 770 });
  fixed(seg(34).end + 0.3, H.amirFwd.start - 0.05, { cx: 1560, cy: 1690, w: 1150 }); // учитель, Билал и Юсуф
  fixed(H.amirFwd.start - 0.05, seg(37).end + 0.6, { cx: 1420, cy: 1700, w: 820 }); // Амир и учитель: вопрос и ответ
  drift(seg(37).end + 0.6, sc.check.start, CU.groupWide, { cx: 2150, cy: 1500, w: 2350 });

  // Сцена 7 — «Проверим, что поняли» (паузы — спокойный общий план всего класса)
  const tSingle = { cx: 1300, cy: 1680, w: 760 }; // учитель без половины лица Юсуфа у края
  drift(sc.check.start, seg(38).end + 0.3, { ...tSingle, w: 800 }, tSingle);
  fixed(seg(38).end + 0.3, seg(39).start - 0.1, CU.classAll);
  fixed(seg(39).start - 0.1, seg(39).end + 0.4, { cx: 1728, cy: 1700, w: 400 }); // Юсуф: «Аллах!»
  fixed(seg(39).end + 0.4, seg(40).end + 0.3, tSingle);
  fixed(seg(40).end + 0.3, seg(41).start - 0.1, { cx: 2350, cy: 1450, w: 2440 });
  fixed(seg(41).start - 0.1, seg(41).end + 0.4, { cx: 1505, cy: 1665, w: 640 }); // Амир: «Творение.»
  fixed(seg(41).end + 0.4, seg(42).end + 0.3, tSingle);
  // пауза перед общим ответом и сам ответ — один план всего класса, медленный наезд
  drift(seg(42).end + 0.3, sc.end.start, CU.classAll, { cx: 2340, cy: 1470, w: 2440 });

  // Сцена 8 — «Маленький росток и большие горы»
  const yEnd = { cx: 1678, cy: 1660, w: 540 }; // Юсуф с ростком; Амир и Билал целиком
  fixed(sc.end.start, H.mountains.start, yEnd);
  // горы — в тишине перед репликой; всю реплику Юсуф в кадре (взгляд: росток → окно)
  drift(H.mountains.start, seg(44).start - 0.1, CU.windowView, { ...CU.windowView, w: 860 }, { fade: 0.4 });
  fixed(seg(44).start - 0.1, seg(45).start - 0.25, yEnd, { fade: 0.3 });
  // учитель отвечает; уборка — один план с плавным приближением (без склейки посреди действия)
  add2(seg(45).start - 0.25, H.tidy.end, [
    { cx: 1560, cy: 1700, w: 1060, at: seg(45).start - 0.25 },
    { cx: 1580, cy: 1735, w: 960, at: seg(45).end - 0.2, dur: 1.4 },
  ]);
  fixed(H.tidy.end, seg(46).end + 0.4, yEnd);
  // финал: учитель и дети целиком, затем камера медленно отходит к общему плану; надпись — на стене
  add2(seg(46).end + 0.4, T.total + 1, [
    { cx: 1700, cy: 1570, w: 1580, at: seg(46).end + 0.4 },
    { ...CU.final, at: seg(47).end - 0.6, dur: 4.8 },
  ]);

  shots.sort((a, b) => a.from - b.from);

  // ---- Внимание класса (куда смотрят дети) ----
  const tHead = headWorld(TEACHER, tKneel, T_ROOT);
  const yHead = headWorld(YUSUF, kneel(YUSUF, Y_YAW), Y_TABLE);
  const aHead = headWorld(AMIR, kneel(AMIR, A_YAW), A_TABLE);
  const bHead = headWorld(BILAL, kneel(BILAL, B_YAW), B_TABLE);
  const plantP: P = { x: POT0.x, y: POT0.y - 70 };
  const cardsP: P = { x: RAIL0.x, y: RAIL0.y - 24 };
  const windowP: P = { x: WINDOW_C.x, y: WINDOW_C.y + 60 };
  const speakerHead = (role: string, t: number): P => {
    if (role === "yusuf") return t < H.crouch.start ? headWorld(YUSUF, stand(YUSUF, Y_YAW), Y_TABLE) : yHead;
    if (role === "amir") return t < aWalk.t0 ? headWorld(AMIR, aSit, A_SEAT) : aHead;
    if (role === "bilal") return t < bWalk.t0 ? headWorld(BILAL, bSit, B_SEAT) : bHead;
    return tHead;
  };
  const attnKeys: Key<P>[] = [{ at: 0, v: plantP }];
  for (const s of Object.values(S).sort((a, b) => a.start - b.start)) {
    if (s.role === "kids") continue;
    attnKeys.push({ at: s.start - 0.2, v: speakerHead(s.role, s.start), dur: 0.5 });
  }
  const special: Key<P>[] = [
    { at: H.rise.start + 0.3, v: headWorld(YUSUF, stand(YUSUF, -0.5), Y_SEAT), dur: 0.6 },
    // класс провожает Юсуфа взглядом до столика
    { at: yWalk.t0 + 0.6, v: headWorld(YUSUF, stand(YUSUF, -0.55), { x: 1890, y: 1960 }), dur: 1.2 },
    { at: yWalk.t0 + yWalk.dur - 0.5, v: headWorld(YUSUF, stand(YUSUF, Y_YAW), Y_TABLE), dur: 0.8 },
    { at: H.soil.start, v: plantP, dur: 0.6 },
    { at: H.pour.start - 0.4, v: plantP, dur: 0.6 },
    { at: H.watch.start, v: plantP, dur: 0.6 },
    { at: seg(8).end + 0.2, v: plantP, dur: 0.5 },
    // взгляды провожают Амира от его места к столику
    { at: come0 + 0.3, v: headWorld(AMIR, stand(AMIR, -0.5), A_SEAT), dur: 0.5 },
    { at: aWalk.t0 + aWalk.dur * 0.5, v: headWorld(AMIR, stand(AMIR, -0.55), A_PATH[2]), dur: 0.8 },
    { at: aKneel0, v: aHead, dur: 0.6 },
    { at: wordAt(10, "Посмотрите", 0.4), v: plantP, dur: 0.6 },
    { at: PZ[n(13)].start + 0.6, v: plantP, dur: 1.0 },
    { at: H.toWindow.start, v: windowP, dur: 0.8 },
    { at: wordAt(16, "Корни", 0.2), v: plantP, dur: 0.6 },
    { at: wordAt(16, "свет", 0.6), v: windowP, dur: 0.7 },
    { at: H.yLook.start, v: windowP, dur: 0.7 },
    { at: seg(18).start + 0.4, v: tHead, dur: 0.6 },
    { at: H.cardsOut.start, v: cardsP, dur: 0.7 },
    { at: H.amirThinks.start, v: cardsP, dur: 0.7 },
    { at: H.cardsBack.start, v: cardsP, dur: 0.6 },
    { at: wordAt(27, "Коране", 0.35), v: tHead, dur: 0.5 },
    { at: H.help.start + 0.3, v: plantP, dur: 0.6 },
    { at: H.mountains.start - 1.0, v: windowP, dur: 0.8 },
    { at: H.tidy.start + 0.2, v: cardsP, dur: 0.6 },
    { at: seg(46).start - 0.2, v: yHead, dur: 0.5 },
    { at: seg(47).start - 0.2, v: tHead, dur: 0.5 },
  ];
  // вопросы зрителю (сцена 7): дети смотрят на учителя, пауза — думают
  for (const q of [38, 40, 42]) special.push({ at: seg(q).start - 0.2, v: tHead, dur: 0.5 });
  const attn = [...attnKeys, ...special].sort((a, b) => a.at - b.at);
  const attention = (t: number) => track(attn, t, lerpP);

  const sfx = {
    // шорох одежды: 1 — встаёт с ковра, 2 — опускается на колени / приседает
    cloth: [
      { at: yRise0 + 0.3, kind: 1 },
      { at: tKneel0 + 0.4, kind: 2 },
      { at: yCrouch0 + 0.3, kind: 2 },
      { at: come0 + 0.3, kind: 1 },
      { at: bRise0 + 0.4, kind: 1 },
      { at: aKneel0 - 0.2, kind: 2 },
      { at: bKneel0 - 0.15, kind: 2 },
    ],
    soilTouch: H.soil.start + 0.95,
    canLift: lift0 + 0.1,
    pour: { start: flowStart, stop: flowStop },
    drips: dripLand, // когда каждая капля касается земли
    canPlace: [setTouch, canDown.touch],
    canLift2: take12 + 0.35,
    cardPick: [0, 1, 2, 3].map((k) => cardT(k).grip),
    cardPlace: [0, 1, 2, 3].map((k) => cardT(k).seat),
    // поддон скользит по столу: туда (1,0 с) и обратно на свет (1,2 с)
    traySlide: { to: potSlide.t0, back: potBack.t0 },
    cardsGather: [0, 1, 2, 3].map((j) => gatherT(j).grip),
    cardsOnStack: [0, 1, 2, 3].map((j) => gatherT(j).place),
  };

  return {
    shots,
    attention,
    wordAt,
    seg,
    n,
    tHead,
    yHead,
    aHead,
    bHead,
    plantP,
    cardsP,
    windowP,
    yRise0,
    yWalk,
    aWalk,
    yStandHead: headWorld(YUSUF, stand(YUSUF, Y_YAW), Y_TABLE),
    bWalk,
    come0,
    bRise0,
    aKneel0,
    bKneel0,
    tKneel0,
    yCrouch0,
    lift0,
    lift1,
    pour0,
    stop0,
    flowStart,
    flowStop,
    set0,
    setTouch,
    take12,
    help0,
    potSlide,
    canDown,
    potBack,
    tidy0,
    cardT,
    gatherT,
    canAt,
    potAt,
    streamAt,
    cardsAt,
    sfx,
  };
};
export type Direction = ReturnType<typeof buildDirection>;

// ---------- Состояние комнаты в момент t ----------
// Моргание главных героев: то же расписание, что blinkAt, но моргание,
// совпавшее (±0,35 с) с морганием более «старшего» героя, сдвигается на 0,5 с —
// в одном кадре герои не моргают одновременно.
const BLINK_ORDER = ["teacher", "yusuf", "bilal", "amir"];
const heroBlinkTimes = (() => {
  const all: Record<string, number[]> = {};
  const taken: number[] = [];
  for (const id of BLINK_ORDER) {
    const seed = strSeed(id);
    const times: number[] = [];
    let x = 0.4 + hash01(seed) * 2.5;
    for (let i = 0; x < 400; i++) {
      let b = x;
      while (taken.some((o) => Math.abs(o - b) < 0.35)) b += 0.5;
      times.push(b);
      x += 2.2 + hash01(seed + i * 7 + 1) * 3.6;
    }
    taken.push(...times);
    all[id] = times;
  }
  return all;
})();
const heroBlink = (id: string, t: number) => {
  let v = 0;
  for (const b of heroBlinkTimes[id] ?? []) {
    const d = t - b;
    if (d >= 0 && d < 0.2) v = Math.max(v, d < 0.07 ? d / 0.07 : 1 - (d - 0.07) / 0.13);
  }
  return clamp(v);
};
const faceWith = (base: Face, gaze: P, blink: number, m: { open: number; wide: number; round: number }): Face => ({ ...base, gaze, blink, mouthOpen: m.open, mouthWide: m.wide, mouthRound: m.round });
const breathe = (id: string, t: number) => {
  const sd = strSeed(id);
  const per = 3.4 + hash01(sd + 3) * 1.4;
  return Math.sin((t / per) * Math.PI * 2 + hash01(sd) * 6.28) * 1.6;
};
const mouthFor = (T: Timeline, role: string) => Object.values(T.seg).filter((s) => s.role === role);
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
const speaking = (T: Timeline, role: string, t: number, pre = 0.3, post = 0.3) => Object.values(T.seg).some((x) => x.role === role && t >= x.start - pre && t <= x.end + post);
const inPauseAt = (T: Timeline, t: number) => Object.values(T.pause).some((p) => t >= p.start && t < p.end);

// Рука в точку мира: цель для IK в координатах корня (масштаб — по глубине корня).
const armTo = (root: P, w: P, bend: number, hand: ArmPose["hand"], handAbs?: number, front = true): ArmPose => ({
  a1: 0,
  a2: 0,
  target: toLocal(w, root, scaleAt(root.y)),
  bend,
  hand,
  handRot: 0,
  handAbs,
  front,
});
const dirV = (deg: number): P => ({ x: Math.sin((deg * Math.PI) / 180), y: Math.cos((deg * Math.PI) / 180) });

// Кисть, держащая точку grip: запястье отстоит от точки захвата на долю длины
// кисти вдоль её направления (handAbs: 0 — пальцы вниз, 90 — вправо).
const wristFor = (grip: P, handAbs: number, look: Look, root: P, k: number) => {
  const L = look.body.hand * scaleAt(root.y) * k;
  const d = dirV(handAbs);
  return { x: grip.x - d.x * L, y: grip.y - d.y * L };
};

export const roomStateAt = (T: Timeline, D: Direction, t: number): RoomState => {
  const S = T.seg;
  const H = T.hold;
  const seg = D.seg;
  const chars: Char[] = [];
  const inPause = inPauseAt(T, t);
  const can = D.canAt(t);
  const pot = D.potAt(t);
  const cards = D.cardsAt(t);

  // ---------- фоновые ученики (22) ----------
  KIDS.forEach((k) => {
    if (k.hero) return;
    const seat = SEATS[k.seat];
    const root = { x: seat.x, y: seat.y };
    const id = k.look.key;
    const sd = strSeed(id);
    const pose: Pose = sitCross(k.look, -0.32 - hash01(sd + 5) * 0.25);
    const delay = 0.08 + hash01(sd + 11) * 0.55;
    let target = D.attention(t - delay);
    const glancePeriod = 9 + hash01(sd + 21) * 9;
    const gPhase = (t + hash01(sd + 22) * glancePeriod) % glancePeriod;
    if (gPhase < 1.3) target = add(target, { x: (hash01(sd + Math.floor(t / glancePeriod)) - 0.5) * 900, y: 250 });
    // во время паузы для ответа — думают: часть детей смотрит чуть вверх/в сторону
    if (inPause && hash01(sd + 61) < 0.45) target = add(target, { x: (hash01(sd + 62) - 0.5) * 600, y: -260 });
    const hw = headWorld(k.look, pose, root);
    let la = lookAt(target.x - hw.x, target.y - hw.y);
    // смотреть на окно (оно на задней стене): заметный поворот головы через плечо
    if (target.y < hw.y - 400) {
      const sgnX = target.x >= hw.x ? 1 : -1;
      la = { ...la, yaw: sgnX * Math.max(Math.abs(la.yaw), 0.45), gaze: { x: sgnX * 0.8, y: la.gaze.y } };
    }
    let expr: Expr = { smile: 0.2 + hash01(sd + 31) * 0.25, browIn: 0.1 };
    if (inPause) expr = { smile: 0.12 + hash01(sd + 31) * 0.15, browIn: 0.35 + hash01(sd + 33) * 0.3 };
    const s43 = S[D.n(43)];
    if (t > s43.start - 0.2 && t < s43.end + 1.4) expr = { smile: 0.5 + hash01(sd + 51) * 0.3, browIn: 0.15 };
    let mouth = { open: 0, wide: 0, round: 0 };
    // общий ответ «Один! Аллах!»: отвечает большинство, каждый со своей задержкой и силой
    // общий ответ: отвечают все (сдвиг и размах у каждого свой — не синхронно)
    mouth = groupMouth(T, t, hash01(sd + 43) * 0.16, 0.6 + hash01(sd + 41) * 0.55);
    const p2: Pose = { ...pose, headYaw: la.yaw * 0.85, headPitch: la.pitch * 0.85, headTilt: (hash01(sd + 71) - 0.5) * 6 * (inPause ? 1 : 0.3), shoulderUp: breathe(id, t) };
    chars.push({ id, look: k.look, x: root.x, y: root.y, pose: p2, face: faceWith(exprTrack([{ at: 0, v: expr }], t), la.gaze, blinkAt(id, t), mouth) });
  });

  // ---------- Юсуф ----------
  chars.push(yusufAt(T, D, t, can, pot, inPause));
  // ---------- Амир ----------
  chars.push(amirAt(T, D, t, cards, inPause));
  // ---------- Билал ----------
  chars.push(bilalAt(T, D, t, pot, inPause));
  // ---------- Учитель ----------
  chars.push(teacherAt(T, D, t, can, pot, inPause));

  void H;
  void seg;
  return { t, chars, pot, can, stream: D.streamAt(t), cards, sun: 1 };
};

// Общая часть героев: взгляд на говорящего, рот по своим репликам, моргание.
const heroFace = (T: Timeline, D: Direction, t: number, role: Hero, look: Look, pose: Pose, root: P, la0: ReturnType<typeof lookAt> | null, expr: Expr, extraMouth = true) => {
  const hw = headWorld(look, pose, root);
  let la = la0;
  if (!la) {
    let target = D.attention(t - 0.1);
    if (speaking(T, role, t)) target = D.tHead;
    la = lookAt(target.x - hw.x, target.y - hw.y);
  }
  let mouth = speakingMouth(mouthFor(T, role), t);
  if (extraMouth) {
    const gm = groupMouth(T, t, 0.04, 0.9);
    if (gm.open > 0) mouth = gm;
  }
  return { la, face: faceWith(exprTrack([{ at: 0, v: expr }], t), la.gaze, heroBlink(role, t), mouth) };
};
// живой слушатель: медленный наклон головы и перенос веса (у каждого свой ритм)
const idleOf = (id: string, t: number) => {
  const ph = hash01(strSeed(id) + 5) * Math.PI * 2;
  return { tilt: 0.03 * Math.sin((2 * Math.PI * t) / 4.3 + ph), lean: 0.9 * Math.sin((2 * Math.PI * t) / 5.9 + ph * 1.7) };
};
const finish = (pose: Pose, la: ReturnType<typeof lookAt>, id: string, t: number, yawK = 0.85): Pose => {
  const idle = idleOf(id, t);
  return { ...pose, lean: pose.lean + idle.lean, headTilt: pose.headTilt + idle.tilt, headYaw: la.yaw * yawK + pose.headYaw * (1 - yawK) * 0.3, headPitch: la.pitch * 0.85 + pose.headPitch * 0.15, shoulderUp: breathe(id, t) };
};

// Путь кисти от опущенной руки (за столиком, не видна) к предмету на столе:
// сначала вверх над задним краем столешницы, затем к цели. over — рисовать
// руку поверх стола (кисть уже над столешницей).
const TABLE_BACK_Y = TOP_Y - TABLE.topD * TS;
const viaTableTop = (rest: P, target: P, k: number, topY = TABLE_BACK_Y - 16): { w: P; over: boolean } => {
  if (rest.y < TABLE_BACK_Y + 4) return { w: lerpP(rest, target, k), over: k > 0.25 };
  const up = { x: lerp(rest.x, target.x, 0.3), y: Math.min(TABLE_BACK_Y - 16, topY) };
  if (k < 0.45) return { w: lerpP(rest, up, easeInOut(k / 0.45)), over: false };
  return { w: lerpP(up, target, easeInOut((k - 0.45) / 0.55)), over: true };
};

// Вставая с колена, ребёнок опирается ближней рукой на колено выставленной ноги.
const pushOffKnee = (look: Look, p: Pose): Pose => {
  const r = solveRig(look, p);
  const near: "L" | "R" = p.bodyYaw >= 0 ? "L" : "R";
  const front = r.legs.L.K.y < r.legs.R.K.y ? r.legs.L.K : r.legs.R.K; // колено выше — выставленная нога
  const target = { x: front.x, y: front.y - look.body.legW * 0.6 };
  const arm: ArmPose = { a1: 0, a2: 0, target, bend: -1, hand: "flat", handRot: 0, handAbs: 90, front: true };
  return near === "L" ? { ...p, armL: arm } : { ...p, armR: arm };
};

// ---------- Юсуф ----------
const yusufAt = (T: Timeline, D: Direction, t: number, can: CanState, pot: PotState, inPause: boolean): Char => {
  const H = T.hold;
  const seg = D.seg;
  let root: P = Y_SEAT;
  let pose: Pose = ySit;
  let overArms: ("L" | "R")[] = [];
  const look = (p: P, base: Pose, r: P) => {
    const hw = headWorld(YUSUF, base, r);
    return lookAt(p.x - hw.x, p.y - hw.y);
  };
  let la: ReturnType<typeof lookAt> | null = null;
  let expr: Expr = { smile: 0.3, browIn: 0.15 };
  const tableStand = stand(YUSUF, Y_YAW);
  const tableKneel = kneel(YUSUF, Y_YAW);

  if (t < D.yWalk.t0) {
    // сидит на своём месте; встаёт
    root = Y_SEAT;
    pose = poseSeq(
      [
        { at: D.yRise0, pose: ySit },
        { at: D.yRise0 + 0.5, pose: withArms(kneel(YUSUF, -0.5), undefined, undefined, { lean: -6 }) },
        { at: D.yRise0 + 1.2, pose: pushOffKnee(YUSUF, halfKneel(YUSUF, -0.5)) },
        { at: D.yWalk.t0, pose: stand(YUSUF, D.yWalk.yaw) },
      ],
      t,
    );
    la = look(D.plantP, pose, root);
    expr = { smile: 0.55, browL: 0.25, browR: 0.25, eyeOpen: 1.06, browIn: 0.2 };
  } else if (t < D.yWalk.t0 + D.yWalk.dur) {
    const w = walkAt(YUSUF, D.yWalk, t);
    root = w.root;
    pose = w.pose;
    la = look(D.plantP, pose, root);
    expr = { smile: 0.55, browL: 0.25, browR: 0.25, eyeOpen: 1.06, browIn: 0.2 };
  } else {
    root = Y_TABLE;
    // стоя за столиком (сцена 1 и начало 2), затем присаживается и сидит на коленях
    const c0 = D.yCrouch0;
    const wEnd = D.yWalk.t0 + D.yWalk.dur;
    // после последнего шага — мягко выпрямляется в спокойную стойку (без скачка);
    // в ожидании кисти нетерпеливо сложены перед животом (выше края столика,
    // в стороне от ручки лейки)
    const eagerHands = (p: Pose, k: number): Pose => {
      if (k <= 0) return p;
      const sy = shoulderY(YUSUF, p);
      const curL = p.armL.target ?? solveRig(YUSUF, p).arms.L.W;
      const curR = p.armR.target ?? solveRig(YUSUF, p).arms.R.W;
      return {
        ...p,
        armL: { a1: 0, a2: 0, target: lerpP(curL, { x: -6, y: sy + 95 }, k), bend: 1, hand: "relaxed", handRot: 0, front: true },
        armR: { a1: 0, a2: 0, target: lerpP(curR, { x: 8, y: sy + 100 }, k), bend: -1, hand: "relaxed", handRot: 0, front: true },
      };
    };
    if (t < wEnd + 0.45) pose = mixPose(walkAt(YUSUF, D.yWalk, wEnd - 1e-3).pose, tableStand, easeInOut((t - wEnd) / 0.45));
    else if (t < c0) pose = tableStand;
    else
      pose = poseSeq(
        [
          { at: c0, pose: tableStand },
          { at: c0 + 0.55, pose: halfKneel(YUSUF, Y_YAW) },
          { at: c0 + 1.45, pose: tableKneel },
        ],
        t,
      );
    // до подъёма лейки кисти сложены перед собой
    if (t > wEnd && t < D.lift0) pose = eagerHands(pose, easeInOut((t - wEnd - 0.1) / 0.5));
    // ожидание: смотрит, наклоняет голову, тянется к ростку
    const watch = H.watch;
    if (t > watch.start && t < seg(8).end + 2.2) {
      const tilt = keysTilt(t, watch.start);
      const leanK = easeInOut(clamp((t - H.lean.start) / 0.5)) * (1 - easeInOut(clamp((t - seg(8).end - 0.6) / 0.8)));
      pose = { ...pose, headTilt: tilt, lean: pose.lean + 9 * leanK };
    }
    // руки: лейка в руках (подъём, полив, установка; держит у груди)
    if (can.held) {
      const grip = canWorld(can, "handleGrip");
      const body = canWorld(can, "bodyGrip");
      const aR = clamp(-can.tilt * 0.6, -40, 0); // кисть на ручке поворачивается вместе с лейкой
      const wR = wristFor(grip, aR, YUSUF, root, 0.62);
      const wL = wristFor(body, 72 - can.tilt * 0.5, YUSUF, root, 0.58);
      // сцена 6: переставляет лейку одной рукой за ручку (левая рука не
      // ложится поперёк лейки)
      const oneHand = t > D.canDown.t0 - 0.7 || (t > D.take12 - 0.6 && t < D.take12 + 2.05);
      pose = oneHand ? { ...pose, armR: armTo(root, wR, -1, "grip", aR, true) } : { ...pose, armR: armTo(root, wR, -1, "grip", aR, true), armL: armTo(root, wL, -1, "grip", 72 - can.tilt * 0.5, true) };
      // ставя лейку на стол, наклоняется ниже — обе руки достают до лейки
      const setting = t > D.set0 && t < D.setTouch + 0.6;
      const aim = oneHand ? wR : lerpP(wR, wL, 0.5);
      const want = setting ? leanToward(YUSUF, pose, root, armLen(YUSUF, root), aim, "R", -6, 24, 0.72) : leanToward(YUSUF, pose, root, armLen(YUSUF, root), aim, "R", -6, 16, 0.78);
      pose = { ...pose, lean: lerp(pose.lean, want, 0.8) };
      overArms = oneHand ? ["R"] : ["L", "R"];
    } else {
      // подход рук к лейке (до захвата) и отпускание после установки.
      // Кисти, опущенные за столиком, сначала поднимаются над его задним краем
      // и только потом ложатся на лейку (руки не проходят сквозь стол).
      const reach = (from: number, to: number) => easeInOut(clamp((t - from) / (to - from)));
      const restR = wristWorld(YUSUF, pose, root, "R");
      const restL = wristWorld(YUSUF, pose, root, "L");
      let k = 0;
      if (t < D.lift0 && t > D.lift0 - 0.55) k = reach(D.lift0 - 0.55, D.lift0);
      if (t > D.setTouch && t < D.setTouch + 0.9) k = 1 - reach(D.setTouch + 0.3, D.setTouch + 0.9);
      if (t < D.take12 + 0.3 && t > D.take12 - 0.55) k = reach(D.take12 - 0.55, D.take12 + 0.3);
      if (t > D.take12 + 1.2 && t < D.take12 + 2.0) k = 1 - reach(D.take12 + 1.25, D.take12 + 2.0);
      if (t < D.canDown.t0 + 0.05 && t > D.canDown.t0 - 0.6) k = reach(D.canDown.t0 - 0.6, D.canDown.t0 + 0.05);
      if (t > D.canDown.touch && t < D.canDown.touch + 0.9) k = 1 - reach(D.canDown.touch + 0.3, D.canDown.touch + 0.9);
      if (k > 0) {
        const grip = canWorld(can, "handleGrip");
        const body = canWorld(can, "bodyGrip");
        // отпуская лейку, кисти раскрываются и чуть приподнимаются над ней
        const releasing = (t > D.setTouch && t < D.setTouch + 0.9) || (t > D.take12 + 1.2 && t < D.take12 + 2.0) || (t > D.canDown.touch && t < D.canDown.touch + 0.9);
        const lift = releasing ? 12 * Math.sin(Math.PI * (1 - k)) : 0;
        // кисть поднимается выше ручки лейки и только потом ложится на неё
        // (рука переходит «поверх стола» уже над лейкой — без скачка глубины)
        const topY = canWorld(can, "handleGrip").y - 10;
        const vR = viaTableTop(restR, wristFor(grip, 0, YUSUF, root, 0.62), k, topY);
        const vL = viaTableTop(restL, wristFor(body, 72, YUSUF, root, 0.58), k, topY);
        const wR = { x: vR.w.x, y: vR.w.y - lift };
        const wL = { x: vL.w.x, y: vL.w.y - lift };
        const hand = (kk: number): ArmPose["hand"] => (releasing ? (kk > 0.95 ? "grip" : kk > 0.5 ? "open" : "relaxed") : kk > 0.6 ? "grip" : "relaxed");
        const oneHand = t > D.canDown.t0 - 0.7 || (t > D.take12 - 0.6 && t < D.take12 + 2.05);
        pose = { ...pose, armR: armTo(root, wR, -1, hand(k), k > 0.4 ? 0 : undefined, true), ...(oneHand ? {} : { armL: armTo(root, wL, -1, hand(k), k > 0.4 ? 72 : undefined, true) }) };
        const aimP = oneHand ? wR : lerpP(wR, wL, 0.5);
        const setting = t > D.set0 && t < D.setTouch + 0.6;
        const want = setting ? leanToward(YUSUF, pose, root, armLen(YUSUF, root), aimP, "R", -6, 24, 0.72) : leanToward(YUSUF, pose, root, armLen(YUSUF, root), aimP, "R", -6, 16, 0.78);
        pose = { ...pose, lean: lerp(pose.lean, want, 0.8 * k) };
        overArms = [...(vL.over && !oneHand ? (["L"] as const) : []), ...(vR.over ? (["R"] as const) : [])];
      }
    }
    // «Един — это один?» — поднимает один палец левой руки (правая лежит на лейке)
    const s28 = seg(28);
    const f28 = easeInOut(clamp((t - (s28.start - 0.75)) / 0.7)) * (1 - easeInOut(clamp((t - (s28.end + 0.5)) / 0.7)));
    if (f28 > 0) {
      // палец — сбоку от щеки, локоть внизу; кисть идёт через низкую точку сбоку
      // (стол закрывает нижнюю часть руки, как в покое)
      const r = solveRig(YUSUF, pose);
      const up = { x: r.headC.x - YUSUF.body.headW * 0.5 - 40, y: r.headC.y + 60 };
      const cur = pose.armL.target ?? r.arms.L.W;
      const side = { x: r.shoulderL.x - 45, y: -110 };
      const w = f28 < 0.2 ? lerpP(cur, side, f28 / 0.2) : lerpP(side, up, (f28 - 0.2) / 0.8);
      pose = { ...pose, armL: { a1: 0, a2: 0, target: w, bend: -1, hand: f28 > 0.5 ? "point" : "relaxed", handRot: 0, handAbs: lerp(0, 182, f28), front: true } };
    }
    // сцена 6: рассматривает левую ладонь, поворачивает её. Кисть поднимается
    // за столиком (рука за столом, как в покое) и выходит выше его края;
    // голова и взгляд опущены на ладонь.
    const p0 = H.palm.start;
    const fp = easeInOut(clamp((t - (p0 + 0.1)) / 0.7)) * (1 - easeInOut(clamp((t - (seg(32).start + 0.2)) / 0.7)));
    if (fp > 0) {
      const r = solveRig(YUSUF, pose);
      const palmAt = { x: r.shoulderL.x - 15, y: r.headC.y + 125 };
      const cur = pose.armL.target ?? r.arms.L.W;
      const behind = { x: cur.x, y: palmAt.y + 40 };
      const w = fp < 0.45 ? lerpP(cur, behind, fp / 0.45) : lerpP(behind, palmAt, (fp - 0.45) / 0.55);
      const turn = Math.sin(clamp((t - p0 - 0.6) / 2.2) * Math.PI * 2) * 65;
      pose = { ...pose, headPitch: pose.headPitch + 0.5 * fp, headYaw: pose.headYaw - 0.25 * fp, headTilt: pose.headTilt + 0.1 * fp, armL: { a1: 0, a2: 0, target: w, bend: -1, hand: fp > 0.5 ? "open" : "relaxed", handRot: 0, handAbs: lerp(0, 200 + turn * 0.4, fp), palm: true, front: true } };
      la = look({ x: root.x + palmAt.x * scaleAt(root.y), y: root.y + (palmAt.y - 6) * scaleAt(root.y) }, pose, root);
      la = { ...la, yaw: la.yaw - 0.25 * fp, gaze: { x: -0.6 * fp, y: 0.5 * fp } };
      if (t > seg(32).start - 0.35) la = null;
      expr = { smile: 0.25, browIn: 0.45, browL: 0.3, browR: 0.3, eyeOpen: 1.05 };
    }
  }

  // ---- взгляд ----
  if (!la) {
    const s = (k: number) => seg(k);
    if (t < s(1).end + 0.2) la = look(D.tHead, pose, root);
    else if (t < H.soil.end + 0.2 && t > H.soil.start) la = look(soilTop(pot), pose, root);
    else if (t > H.lift.start && t < D.setTouch + 0.6) la = speaking(T, "teacher", t, 0.1, 0.1) && t < D.pour0 ? look(D.tHead, pose, root) : look(soilTop(pot), pose, root);
    else if (t > H.crouch.start && t < D.come0 + 0.6) la = look({ x: pot.x, y: pot.y - 76 }, pose, root);
    else if (t > H.toWindow.start && t < seg(16).start + 0.4) la = look(D.windowP, pose, root);
    else if (t > H.yLook.start - 0.1 && t < seg(17).end + 0.5) la = look(D.windowP, pose, root);
    else if (t > H.cardsOut.start && t < seg(19).end) la = look(D.cardsP, pose, root);
    else if (t > D.take12 - 0.45 && t < D.take12 + 1.4) la = look(canWorld(can, "handleGrip"), pose, root);
    else if (t > seg(34).start - 0.3 && t < seg(34).end + 0.4) {
      // Билал рядом и чуть впереди: голова заметно поворачивается к нему
      const l = look(D.bHead, pose, root);
      la = { ...l, yaw: l.yaw + 0.4, gaze: { x: 0.7, y: l.gaze.y } };
    }
    else if (t > D.help0 + 0.4 && t < D.canDown.touch + 0.6) la = look({ x: pot.x + 30, y: pot.y - 20 }, pose, root);
    else if (t > H.yPlant.start && t < seg(46).end + 0.6) {
      // сцена 8: росток → окно (перед видом гор) → росток («маленький росток») →
      // окно («большие горы») → учитель (его ответ) → снова росток. Голова
      // поворачивается плавно; к ростку — с наклоном головы вниз и влево.
      const plant = { x: pot.x + 10, y: pot.y - 40 };
      const ks: { at: number; v: P; w: number }[] = [
        { at: H.yPlant.start, v: plant, w: 1 },
        { at: H.mountains.start - 1.3, v: plant, w: 1 },
        { at: H.mountains.start - 0.7, v: D.windowP, w: 0 },
        { at: seg(44).start - 0.55, v: D.windowP, w: 0 },
        { at: seg(44).start - 0.15, v: plant, w: 1 },
        { at: D.wordAt(44, "росток", 0.35) + 0.3, v: plant, w: 1 },
        { at: D.wordAt(44, "большие", 0.5) + 0.05, v: D.windowP, w: 0 },
        { at: seg(44).end + 0.15, v: D.windowP, w: 0 },
        { at: seg(44).end + 0.55, v: D.tHead, w: 0 },
        { at: seg(45).end, v: D.tHead, w: 0 },
        { at: seg(45).end + 0.5, v: plant, w: 1 },
      ];
      const tgt = keysP(ks.map((k) => ({ at: k.at, v: k.v })), t);
      const w = keysP(ks.map((k) => ({ at: k.at, v: { x: k.w, y: 0 } })), t).x;
      const l = look(tgt, pose, root);
      la = { ...l, pitch: l.pitch + 0.15 * w, yaw: l.yaw - 0.1 * w };
    }
  }
  // ---- мимика ----
  const sp = (k: number, a = 0.3, b = 0.3) => t > seg(k).start - a && t < seg(k).end + b;
  if (sp(1)) expr = { smile: 0.6, browL: 0.35, browR: 0.35, eyeOpen: 1.1, browIn: 0.3 };
  if (sp(4, 0.4, 0.6)) expr = { smile: 0.9, browL: 0.45, browR: 0.45, eyeOpen: 1.12, browIn: 0.1 };
  if (t > seg(5).start + 0.4 && t < seg(5).end + 0.3) expr = { smile: 0.35, browIn: 0.35, browL: 0.15, browR: 0.15 };
  if (sp(6)) expr = { smile: 0.45, browIn: 0.5, browL: 0.25, browR: 0.25, eyeOpen: 1.05 };
  if (t > H.watch.start && t < seg(8).start - 0.2) expr = { smile: 0.35, browL: 0.4, browR: 0.4, eyeOpen: 1.12, browIn: 0.35 };
  if (sp(8, 0.2, 0.1)) expr = { smile: 0.4, browL: 0.55, browR: 0.55, eyeOpen: 1.15, browIn: 0.45 };
  if (t > seg(8).end + 0.1 && t < H.funny.end) expr = { smile: 0.1, browL: 0.15, browR: 0.6, eyeOpen: 1.1, browIn: 0.55 }; // «ну?..» — недоумение
  if (t > seg(12).end - 1.2 && t < H.wonder.end) expr = { smile: 0.2, browIn: 0.55, browL: 0.3, browR: 0.3, eyeOpen: 1.05 };
  if (sp(17, 0.5, 0.4)) expr = { smile: 0.4, browL: 0.6, browR: 0.6, eyeOpen: 1.18, browIn: 0.3 };
  if (sp(21)) expr = { smile: 0.8, browIn: 0.1, eyeOpen: 1.05 };
  if (sp(28, 0.4, 0.4)) expr = { smile: 0.3, browIn: 0.55, browL: 0.35, browR: 0.35, eyeOpen: 1.05 };
  if (t > seg(29).start && t < seg(29).end + 0.6) expr = { smile: 0.55, browIn: 0.2 };
  if (sp(32)) expr = { smile: 0.3, browIn: 0.5, browL: 0.35, browR: 0.35, eyeOpen: 1.06 };
  if (t > seg(33).start && t < seg(33).end + 0.8) expr = { smile: 0.75, browIn: 0.15 };
  if (sp(39, 0.2, 0.8)) expr = { smile: 0.85, browIn: 0.1, eyeOpen: 1.04 };
  if (inPause) expr = { smile: 0.25, browIn: 0.45 };
  if (t > H.yPlant.start) expr = { smile: 0.55, browIn: 0.15 };
  if (sp(44, 0.2, 0.4)) expr = { smile: 0.65, browL: 0.3, browR: 0.3, eyeOpen: 1.06, browIn: 0.15 };
  if (sp(46, 0.3, 0.8)) expr = { smile: 0.6, browIn: 0.2 };
  const hf = heroFace(T, D, t, "yusuf", YUSUF, pose, root, la, expr);
  // «Ну? Расти!» — обращается к ростку, а не к учителю
  return { id: "yusuf", look: YUSUF, x: root.x, y: root.y, pose: finish(pose, hf.la, "yusuf", t), face: hf.face, overArms };
};

// Наклоны головы Юсуфа в ожидании (с).
const keysTilt = (t: number, w0: number) =>
  keys1(
    [
      { at: w0, v: 0 },
      { at: w0 + 0.9, v: 0 },
      { at: w0 + 1.5, v: 9 },
      { at: w0 + 2.4, v: 9 },
      { at: w0 + 3.0, v: -3 },
      { at: w0 + 4.0, v: 0 },
    ],
    t,
  );

// ---------- Амир ----------
const amirAt = (T: Timeline, D: Direction, t: number, cards: ReturnType<Direction["cardsAt"]>, inPause: boolean): Char => {
  const H = T.hold;
  const seg = D.seg;
  let root: P = A_SEAT;
  let pose: Pose = aSit;
  let overArms: ("L" | "R")[] = [];
  let holdL: React.ReactNode | undefined;
  let holdR: React.ReactNode | undefined;
  let la: ReturnType<typeof lookAt> | null = null;
  const look = (p: P) => {
    const hw = headWorld(AMIR, pose, root);
    return lookAt(p.x - hw.x, p.y - hw.y);
  };
  let expr: Expr = { smile: 0.3, browIn: 0.15 };
  const tableKneel = kneel(AMIR, A_YAW);
  const c0 = D.come0;
  if (t < D.aWalk.t0) {
    pose = poseSeq(
      [
        { at: c0, pose: aSit },
        { at: c0 + 0.5, pose: kneel(AMIR, -0.5) },
        { at: c0 + 1.2, pose: pushOffKnee(AMIR, halfKneel(AMIR, -0.5)) },
        { at: D.aWalk.t0, pose: stand(AMIR, D.aWalk.yaw) },
      ],
      t,
    );
    // сцена 1: наклоняется со своего места, рассматривая горшок
    const lk = easeInOut(clamp((t - (seg(3).start - 0.75)) / 0.55)) * (1 - easeInOut(clamp((t - (seg(3).end + 0.6)) / 0.7)));
    if (lk > 0) pose = { ...pose, lean: pose.lean + 9 * lk, headPitch: 0.2 * lk };
    if (t > H.soil.start && t < seg(3).end + 0.6) la = look({ x: POT0.x, y: POT0.y - 46 });
  } else if (t < D.aKneel0) {
    const w = walkAt(AMIR, D.aWalk, t);
    root = w.root;
    pose = w.pose;
    la = look({ x: POT0.x, y: POT0.y - 70 });
  } else {
    root = A_TABLE;
    const k0 = D.aKneel0;
    pose = poseSeq(
      [
        { at: k0, pose: stand(AMIR, D.aWalk.yaw) },
        { at: k0 + 0.55, pose: withArms({ ...halfKneel(AMIR, -0.4), lean: 5 }, { a1: -6, a2: -10 }, { a1: 6, a2: 10 }) },
        { at: k0 + 1.35, pose: tableKneel },
      ],
      t,
    );
    // «Свет!» — чуть приподнимается от догадки
    const s14 = seg(14);
    // небольшое «предвкушение» (чуть ниже), затем плавно приподнимается
    const up = easeInOut(clamp((t - (s14.start - 0.05)) / 0.45)) * (1 - easeInOut(clamp((t - (s14.end + 0.5)) / 0.7)));
    const dip = Math.sin(Math.PI * clamp((t - (s14.start - 0.2)) / 0.2)) * (t < s14.start ? 1 : 0);
    if (dip > 0) pose = { ...pose, lean: pose.lean + 3 * dip };
    if (up > 0) pose = { ...poseSeq([{ at: 0, pose }, { at: 1, pose: kneelTall(AMIR, A_YAW) }], up * 0.5) };
    // «Ему не нужен другой создатель?» — подаётся вперёд
    const fw = easeInOut(clamp((t - H.amirFwd.start) / 0.5)) * (1 - easeInOut(clamp((t - (seg(37).end + 0.6)) / 0.8)));
    if (fw > 0) pose = { ...pose, lean: pose.lean + 13 * fw, headPitch: pose.headPitch + 0.12 * fw };
    // сбор карточек (сцена 8): справа налево, стопка — перед собой. Правые
    // карточки (листья, почва) — правой рукой, левые (капля, солнце) — левой:
    // локоть каждой руки остаётся со своей стороны и ниже плеча. Карточка
    // опускается на стопку, ложась рубашкой вверх (не уходит под край стола).
    // Карточки стоят почти на уровне плеча: рука, тянущаяся вперёд к столу,
    // видна укороченной (перспектива), локоть чуть в сторону и вниз — не
    // поднимается к плечу и не уходит поперёк груди. Позднейшая карточка
    // управляет своей рукой; наклон корпуса — по последней активной руке.
    const busy = new Set<"L" | "R">();
    for (let j = 3; j >= 0; j--) {
      const g = D.gatherT(j);
      const side: "L" | "R" = j <= 1 ? "R" : "L";
      const last = j === 1 || j === 3; // после неё рука возвращается в покой
      if (busy.has(side) || t < g.reach - 0.05 || t > g.place + 0.45 + (last ? 0.5 : 0)) continue;
      const lead = busy.size === 0;
      busy.add(side);
      const k = 3 - j;
      const slot = railSlot(k);
      // левая рука берёт карточку сбоку, ниже середины: кисть ближе к телу, локоть внизу
      const gp = side === "L" ? { x: -0.35 * CARD.w, y: CARD_GRIP.y * 0.6 } : CARD_GRIP;
      const top = { x: slot.x + gp.x * TS, y: slot.y + gp.y * TS };
      const stackTop = { x: AMIR_STACK.x + gp.x * TS, y: AMIR_STACK.y - 3 * TS * (j + 1) };
      const rest = wristWorld(AMIR, tableKneel, root, side);
      const cardH = -gp.y * TS;
      let grip: P;
      let holding = false;
      let lay = 0;
      if (t < g.grip) grip = lerpP(j === 0 || j === 2 ? rest : stackTop, top, easeInOut((t - g.reach) / (g.grip - g.reach)));
      else if (t < g.up) {
        holding = true;
        grip = lerpP(top, { x: top.x, y: top.y - 22 }, easeInOut((t - g.grip) / (g.up - g.grip)));
      } else if (t < g.place) {
        holding = true;
        const u = easeInOut((t - g.up) / (g.place - g.up));
        lay = easeInOut(clamp((u - 0.55) / 0.45));
        const down = stackTop.y - 6 - cardH * (1 - lay);
        grip = { x: lerp(top.x, stackTop.x, u), y: lerp(top.y - 22, down, u) - Math.sin(Math.PI * u) * 10 };
      } else grip = last ? lerpP({ x: stackTop.x, y: stackTop.y - 6 }, rest, easeInOut((t - g.place - 0.3) / 0.6)) : { x: stackTop.x, y: stackTop.y - 6 };
      const wW = wristFor(grip, 8, AMIR, root, 1.05);
      const arm = armTo(root, wW, 1, holding ? "pinch" : "relaxed", 8, true);
      pose = side === "R" ? { ...pose, armR: arm } : { ...pose, armL: arm };
      if (lead) pose = { ...pose, lean: lerp(pose.lean, leanToward(AMIR, pose, root, armLen(AMIR, root), wW, side, -6, 8, 0.8), 0.8) };
      // локоть — с той стороны, где он ниже; прямо под плечом рука почти прямая
      // (укороченная), поэтому смена стороны локтя не даёт скачка
      const rs = solveRig(AMIR, pose);
      const sh = side === "R" ? rs.shoulderR : rs.shoulderL;
      const tg = arm.target!;
      const base = (Math.atan2(tg.x - sh.x, tg.y - sh.y) * 180) / Math.PI;
      const straight = lerp(0.995, 0.86, easeInOut(clamp(Math.abs(base) / 30)));
      const ff = clamp(Math.hypot(tg.x - sh.x, tg.y - sh.y) / (straight * (AMIR.body.upperArm + AMIR.body.foreArm)), 0.25, 1);
      const armF = { ...arm, bend: base >= 0 ? 1 : -1, f: ff };
      pose = side === "R" ? { ...pose, armR: armF } : { ...pose, armL: armF };
      if (!overArms.includes(side)) overArms = [...overArms, side];
      if (holding) {
        const kk = TS / scaleAt(root.y);
        const flat = clamp((t - g.up) / (g.place - g.up));
        const card = (
          <g transform={`translate(${(dirV(8).x * AMIR.body.hand * 1.05).toFixed(2)} ${(dirV(8).y * AMIR.body.hand * 1.05).toFixed(2)}) scale(${kk.toFixed(4)})`}>
            <g transform={`scale(1 ${(1 - 0.88 * lay).toFixed(3)})`}>
              <Card x={-gp.x} y={-gp.y} kind={CARD_ORDER[k]} lean={flat * 0.85} back={lay > 0.5} />
            </g>
          </g>
        );
        if (side === "R") holdR = card;
        else holdL = card;
      }
      if (lead) la = look(grip);
    }
  }
  // ---- взгляд ----
  if (!la) {
    if (t > H.cardsOut.start && t < seg(19).end + 0.2) {
      // сравнивает карточки; на словах — та, о которой говорит
      const which = (() => {
        if (t < D.cardT(3).back) return Math.min(3, Math.max(0, Math.floor((t - H.cardsOut.start - 0.5) / 1.85)));
        if (t < seg(19).start) return [0, 1, 2, 3, 2, 1][Math.floor(((t - D.cardT(3).back) / 0.45) % 6)];
        const ws = [
          ["Вода", 1],
          ["земля", 2],
          ["воздух", 3],
          ["солнце", 0],
        ] as const;
        let w = 1;
        for (const [word, idx] of ws) if (t >= D.wordAt(19, word, 0.2) - 0.15) w = idx;
        return w;
      })();
      // взгляд (и голова) заметно переходит от карточки к карточке
      la = look({ x: railSlot(which).x + (which - 1.5) * 60, y: railSlot(which).y - 22 });
    } else if (t > H.amirThinks.start && t < seg(24).end + 0.1) {
      const u = t - H.amirThinks.start;
      const which = u < 0.9 ? 0 : u < 1.8 ? 1 : u < 2.4 ? 0 : 1;
      la = look({ x: railSlot(which).x + (which - 1.5) * 60, y: railSlot(which).y - 22 });
      if (t > seg(24).start + 0.6) la = null;
    } else if (t > D.wordAt(30, "солнце", 0.3) - 0.35 && t < D.wordAt(30, "дождь", 0.6) + 0.45) {
      // вспоминает карточки: «солнце» — карточка солнца, «дождь» — капля
      const which = t < D.wordAt(30, "дождь", 0.6) - 0.3 ? 0 : 1;
      la = look({ x: railSlot(which).x + (which - 1.5) * 60, y: railSlot(which).y - 22 });
    } else if (t > D.aKneel0 && t < seg(9).end + 0.3) {
      // «Он сейчас станет большим?» — смотрит на росток (заметно вниз-вправо)
      const l = look({ x: POT0.x, y: POT0.y - 74 });
      la = { ...l, yaw: l.yaw + 0.25, gaze: { x: 0.55, y: 0.45 } };
    } else if (t > seg(9).end + 0.3 && t < seg(10).end + 0.3) {
      // слушает учителя, который сидит рядом
      const l = look(D.tHead);
      la = { ...l, yaw: l.yaw - 0.3, gaze: { x: -0.75, y: l.gaze.y } };
    }
    else if ((t > seg(33).start - 0.2 && t < seg(33).end + 0.3) || (t > seg(35).start - 0.3 && t < seg(37).end + 0.6)) {
      // разговор с учителем, который сидит рядом: голова заметно повёрнута к нему
      const l = look(D.tHead);
      la = { ...l, yaw: l.yaw - 0.3, gaze: { x: -0.75, y: l.gaze.y } };
    }
  }
  const sp = (k: number, a = 0.3, b = 0.3) => t > seg(k).start - a && t < seg(k).end + b;
  if (sp(3)) expr = { smile: 0.35, browIn: 0.3, eyeOpen: 1.04 };
  if (sp(9)) expr = { smile: 0.35, browL: 0.4, browR: 0.4, eyeOpen: 1.1, browIn: 0.35 };
  if (sp(14, 0.3, 0.6)) expr = { smile: 0.7, browL: 0.45, browR: 0.45, eyeOpen: 1.1 };
  if (t > H.compare.start && t < seg(19).end + 0.3) expr = { smile: 0.2, browIn: 0.55, browL: 0.15, browR: 0.1 };
  if (t > H.amirThinks.start && t < seg(24).end + 0.4) expr = { smile: 0.1, browIn: 0.65, browL: 0.25, browR: 0.05, eyeOpen: 0.96 };
  if (t > seg(25).start + 1.0 && t < seg(25).end + 1.2) expr = { smile: 0.5, browIn: 0.2 };
  if (sp(30)) expr = { smile: 0.25, browIn: 0.5, browL: 0.3, browR: 0.2 };
  if (t > seg(31).start && t < seg(31).end + 0.8) expr = { smile: 0.55, browIn: 0.15 };
  if (sp(36)) expr = { smile: 0.2, browIn: 0.55, browL: 0.3, browR: 0.3 };
  if (sp(41, 0.2, 0.6)) expr = { smile: 0.55, browIn: 0.15 };
  if (inPause) expr = { smile: 0.2, browIn: 0.5 };
  if (t > H.amirThinks.start && t < seg(24).start) pose = { ...pose, headTilt: 7 * easeInOut(clamp((t - H.amirThinks.start - 0.9) / 0.6)) };
  const hf = heroFace(T, D, t, "amir", AMIR, pose, root, la, expr);
  void cards;
  return { id: "amir", look: AMIR, x: root.x, y: root.y, pose: finish(pose, hf.la, "amir", t), face: hf.face, overArms, holdL, holdR };
};

// ---------- Билал ----------
const bilalAt = (T: Timeline, D: Direction, t: number, pot: PotState, inPause: boolean): Char => {
  const H = T.hold;
  const seg = D.seg;
  let root: P = B_SEAT;
  let pose: Pose = bSit;
  let la: ReturnType<typeof lookAt> | null = null;
  const look = (p: P) => {
    const hw = headWorld(BILAL, pose, root);
    return lookAt(p.x - hw.x, p.y - hw.y);
  };
  let expr: Expr = { smile: 0.3, browIn: 0.2 };
  const tableKneel = kneel(BILAL, B_YAW);
  if (t < D.bWalk.t0) {
    const r0 = D.bRise0;
    pose = poseSeq(
      [
        { at: r0, pose: bSit },
        { at: r0 + 0.5, pose: kneel(BILAL, -0.5) },
        { at: r0 + 1.05, pose: pushOffKnee(BILAL, halfKneel(BILAL, -0.5)) },
        { at: D.bWalk.t0, pose: stand(BILAL, D.bWalk.yaw) },
      ],
      t,
    );
  } else if (t < D.bKneel0) {
    const w = walkAt(BILAL, D.bWalk, t);
    root = w.root;
    pose = w.pose;
    la = look({ x: POT0.x, y: POT0.y - 70 });
  } else {
    root = B_TABLE;
    const k0 = D.bKneel0;
    pose = poseSeq(
      [
        { at: k0, pose: stand(BILAL, D.bWalk.yaw) },
        { at: k0 + 0.55, pose: halfKneel(BILAL, B_YAW) },
        { at: k0 + 1.35, pose: tableKneel },
      ],
      t,
    );
    // «Мы можем наблюдать…» — внимательно рассматривает стебель
    const s11 = seg(11);
    const st = easeInOut(clamp((t - (s11.start - 0.9)) / 0.6)) * (1 - easeInOut(clamp((t - (s11.end + 0.2)) / 0.7)));
    if (st > 0) {
      pose = { ...pose, lean: pose.lean + 10 * st, headPitch: 0.2 * st };
      la = look({ x: pot.x, y: pot.y - 68 });
    }
    // «И семечко…» — показывает на горшок (ладонь, без касания)
    const s22 = seg(22);
    const pt = easeInOut(clamp((t - (s22.start - 0.2)) / 0.45)) * (1 - easeInOut(clamp((t - (s22.end - 0.1)) / 0.4)));
    if (pt > 0) {
      const r = solveRig(BILAL, pose);
      // указательный жест к горшку: рука поднята от плеча в его сторону, локоть вниз
      const sc0 = scaleAt(root.y);
      const sh = add(root, mul(r.shoulderL, sc0));
      const aim = { x: pot.x + 10, y: pot.y - 60 };
      const d = Math.hypot(aim.x - sh.x, aim.y - sh.y) || 1;
      const wPt = { x: sh.x + ((aim.x - sh.x) / d) * armLen(BILAL, root) * 0.7, y: sh.y + ((aim.y - sh.y) / d) * armLen(BILAL, root) * 0.7 };
      const rest = r.arms.L.W;
      pose = { ...pose, armL: { a1: 0, a2: 0, target: lerpP(rest, toLocal(wPt, root, sc0), pt), bend: -1, hand: pt > 0.5 ? "point" : "relaxed", handRot: 0, handAbs: pt > 0.4 ? -96 : undefined, front: true } };
    }
    // поднимает руку перед вопросом (сцена 5)
    const r5 = solveRig(BILAL, tableKneel);
    const bHand = withArms(tableKneel, undefined, { target: { x: r5.shoulderR.x + 24, y: r5.headC.y - 110 }, bend: 1, hand: "open", handRot: 180, palm: true, front: true });
    const hu = easeInOut(clamp((t - (H.handUp.start + 0.1)) / 0.6)) * (1 - easeInOut(clamp((t - (seg(26).start + 0.5)) / 0.8)));
    if (hu > 0) {
      // плечо идёт наружу (через горизонталь), предплечье складывается вверх перед
      // телом — локоть не пересекает грудь и лицо; пальцы смотрят вверх
      const rr = solveRig(BILAL, pose).arms.R;
      // рука идёт одной дугой в сторону и вверх; ладонь — правее лица мальчика сзади
      const k = hu;
      const sway = 2 * Math.sin(t * 4) * k;
      pose = { ...pose, armR: { a1: lerp(rr.a1, 128, k) + sway, a2: lerp(rr.a2, 168, k), target: undefined, bend: 1, hand: k > 0.7 ? "open" : "relaxed", handRot: 0, palm: k > 0.7, front: true } };
    }
    void bHand;
    // поддон: к Юсуфу (сцена 6) и обратно на светлое место (сцена 8)
    const tray = (t0: number, t1: number, from: number, to: number) => {
      const rim = (x: number) => ({ x: x + POT.trayRt * TS * 0.92, y: pot.y - 3 * TS });
      const rest = wristWorld(BILAL, tableKneel, root, "L");
      const reach0 = t0 - 0.65;
      const rel = t1 + 0.25;
      const REL = 1.3;
      if (t < reach0 || t > rel + REL) return null;
      // кисть проходит над передним краем столешницы (не сквозь него)
      const over = (x: number) => ({ x: rim(x).x + 30, y: TOP_Y - 25 });
      let w: P;
      let k = 1;
      let deep = 1; // рука тянется вглубь стола (видна укороченной)
      if (t < t0) {
        k = easeInOut((t - reach0) / 0.65);
        deep = k;
        w = keysP(
          [
            { at: reach0, v: rest },
            { at: t0 - 0.3, v: over(from) },
            { at: t0, v: wristFor(rim(from), -95, BILAL, root, 0.55) },
          ],
          t,
        );
      } else if (t < rel) w = wristFor(rim(pot.x), -95, BILAL, root, 0.55);
      else {
        // отпускает: кисть приподнимается над поддоном, возвращается к себе над
        // столешницей и только потом опускается — локоть внизу, у бока
        k = 1 - easeInOut((t - rel) / REL);
        deep = 1 - easeInOut((t - rel) / 0.75);
        const shL = add(root, mul(solveRig(BILAL, tableKneel).shoulderL, scaleAt(root.y)));
        const w0 = wristFor(rim(to), -95, BILAL, root, 0.55);
        w = keysP(
          [
            { at: rel, v: w0 },
            { at: rel + 0.3, v: { x: w0.x + 40, y: w0.y - 14 } },
            { at: rel + 0.75, v: { x: shL.x - 40, y: TOP_Y - 20 } },
            { at: rel + REL, v: rest },
          ],
          t,
        );
      }
      return { w, k, deep };
    };
    const tr = tray(D.potSlide.t0, D.potSlide.t1, POT0.x, POT_NEAR_YUSUF.x) ?? tray(D.potBack.t0, D.potBack.t1, POT_NEAR_YUSUF.x, POT0.x);
    if (tr) {
      const arm = armTo(root, tr.w, 1, tr.k > 0.6 ? "open" : "relaxed", tr.k > 0.4 ? -95 : undefined, true);
      pose = { ...pose, armL: arm };
      pose = { ...pose, lean: lerp(pose.lean, leanToward(BILAL, pose, root, armLen(BILAL, root), tr.w, "L", 0, 30, 0.8), tr.k) };
      // локоть — всегда ниже линии плечо–кисть (не поднимается к лицу Юсуфа);
      // к поддону рука почти прямая и укороченная: тянется вглубь стола
      const sh = solveRig(BILAL, pose).shoulderL;
      const tg = arm.target!;
      const base = (Math.atan2(tg.x - sh.x, tg.y - sh.y) * 180) / Math.PI;
      const need = clamp(Math.hypot(tg.x - sh.x, tg.y - sh.y) / (0.95 * (BILAL.body.upperArm + BILAL.body.foreArm)), 0.55, 1);
      pose = { ...pose, armL: { ...arm, bend: base >= 0 ? 1 : -1, f: lerp(1, need, tr.deep) } };
      la = look({ x: pot.x, y: pot.y - 40 });
    }
  }
  if (!la) {
    if (t > H.toWindow.start - 0.3 && t < seg(16).start + 0.3) la = look(D.windowP);
    else if (t > seg(15).start - 0.2 && t < seg(15).end + 0.5) la = look(D.windowP);
    else if (t > H.yLook.start - 0.1 && t < seg(17).end + 0.5) la = look(D.windowP); // вместе с Юсуфом смотрит в окно
    else if (t > H.tidy.start && t < H.tidy.end) la = look({ x: pot.x, y: pot.y - 60 });
    else if (t > seg(44).end && t < seg(45).end) la = look(D.tHead); // ждёт ответа учителя
    else if (t > seg(46).start - 0.3 && t < seg(46).end + 0.4) la = look(D.yHead); // слушает Юсуфа
  }
  const sp = (k: number, a = 0.3, b = 0.3) => t > seg(k).start - a && t < seg(k).end + b;
  if (sp(11)) expr = { smile: 0.4, browIn: 0.4 };
  if (sp(15)) expr = { smile: 0.45, browIn: 0.25 };
  if (sp(22)) expr = { smile: 0.3, browIn: 0.5, browL: 0.25, browR: 0.25 };
  if (sp(26, 0.6, 0.3)) expr = { smile: 0.15, browIn: 0.55, browL: 0.2, browR: 0.2 };
  if (sp(34, 0.6, 0.6)) expr = { smile: 0.55, browIn: 0.25 };
  if (inPause) expr = { smile: 0.2, browIn: 0.45 };
  const hf = heroFace(T, D, t, "bilal", BILAL, pose, root, la, expr);
  return { id: "bilal", look: BILAL, x: root.x, y: root.y, pose: finish(pose, hf.la, "bilal", t), face: hf.face };
};

// ---------- Учитель ----------
// пока стоит: руки свободно сложены впереди, лёгкое покачивание (не статуя)
const tIdle = (t: number): Pose => {
  const sy = shoulderY(TEACHER, tStand);
  const p = withArms(tStand, { target: { x: -22, y: sy + 262 }, bend: 1, hand: "relaxed", handRot: 0 }, { target: { x: 14, y: sy + 266 }, bend: -1, hand: "relaxed", handRot: 0 });
  return { ...p, hip: { x: p.hip.x + Math.sin((t / 4.2) * Math.PI * 2) * 3, y: p.hip.y }, lean: p.lean + Math.sin((t / 4.2) * Math.PI * 2 + 1) * 1.2 };
};
const teacherAt = (T: Timeline, D: Direction, t: number, can: CanState, pot: PotState, inPause: boolean): Char => {
  const S = T.seg;
  const H = T.hold;
  const PZ = T.pause;
  const seg = D.seg;
  const n = D.n;
  const root = T_ROOT;
  // стоит у столика → присаживается → жесты (как в прошлых фильмах)
  const k0 = D.tKneel0;
  let pose: Pose;
  if (t < k0) pose = tIdle(t);
  else if (t < k0 + 1.6)
    pose = poseSeq(
      [
        { at: k0, pose: tIdle(t) },
        { at: k0 + 0.5, pose: halfKneel(TEACHER, 0.5) },
        { at: k0 + 1.0, pose: mixPose(kneelTall(TEACHER, 0.5), tKneel, 0.55) },
        { at: k0 + 1.42, pose: { ...tKneel, lean: tKneel.lean - 2 } },
        { at: k0 + 1.6, pose: tKneel },
      ],
      t,
    );
  else {
    const keys: Key<Pose>[] = [{ at: 0, v: tKneel }];
    // жест и возврат; рука опускается сбоку от стола (не на карточки и не на угол)
    const via = withArms(tKneel, undefined, { target: { x: 50, y: shoulderY(TEACHER, tKneel) + 160 }, bend: 1, hand: "relaxed", handRot: 0 });
    const g = (at: number, v: Pose, back: number, dur = 0.7) => keys.push({ at, v, dur }, { at: back, v: via, dur: 0.35 }, { at: back + 0.35, v: tKneel, dur: 0.6 });
    // помогает с поливом: приподнимается на коленях — рука идёт над ростком
    g(seg(5).start - 0.5, mixPose(tKneel, kneelTall(TEACHER, 0.5), 0.85), H.pourEnd.start + 1.7, 0.8);
    g(seg(10).start + 0.2, tGestureKids(tKneel), D.wordAt(10, "Посмотрите", 0.4) - 0.2);
    g(D.wordAt(12, "ещё", 0.55) - 0.35, tGestureKids(tKneel), seg(12).end - 0.15);
    g(seg(13).start + 0.1, tGestureCam(kneel(TEACHER, 0.25)), PZ[n(13)].start + 0.3, 1.0); // вопрос к зрителям; в паузе рука опущена
    // жест к окну: кисть идёт вверх близко к телу, затем раскрывается к окну;
    // опускается до смены плана
    const mid = withArms(tKneel, undefined, { target: { x: 30, y: shoulderY(TEACHER, tKneel) + 40 }, bend: 1, hand: "relaxed", handRot: 0 });
    const gw = (a: number, back: number) => keys.push({ at: a, v: mid, dur: 0.3 }, { at: a + 0.3, v: tGestureWindow(tKneel), dur: 0.45 }, { at: back, v: mid, dur: 0.35 }, { at: back + 0.35, v: tKneel, dur: 0.45 });
    gw(D.wordAt(16, "И", 0.7) - 0.1, seg(16).end - 0.4);
    gw(seg(18).start + 0.2, D.wordAt(18, "Всё", 0.65) - 0.7);


    g(D.wordAt(27, "сказано", 0.65), tExplain(tKneel), seg(27).end + 0.2);
    g(seg(29).start + 0.6, tExplain(tKneel), seg(29).end + 0.1);
    g(seg(35).start + 0.4, tToKids(tKneel), D.wordAt(35, "Аллах", 0.75) - 0.1); // спокойное утверждение — рука опускается
    g(seg(38).start - 0.55, tGestureCam(kneel(TEACHER, 0.25)), seg(38).end + 0.2, 0.9);
    g(seg(40).start - 0.55, tGestureCam(kneel(TEACHER, 0.25)), seg(40).end + 0.2, 0.9);
    g(seg(42).start - 0.55, tGestureCam(kneel(TEACHER, 0.25)), seg(42).end + 0.2, 0.9);
    // ладонь у груди, над карточками; рука уходит до того, как Амир тянется к стойке
    g(seg(45).start + 0.3, tOpenKids(tKneel), seg(45).end - 0.3);
    g(seg(47).start + 0.2, tOpenKids(kneel(TEACHER, 0.35)), seg(47).end + 0.6);
    keys.sort((a, b) => a.at - b.at);
    pose = poseTrack(keys, t);
  }
  // ладонь «отбивает» ударные слоги, пока жест удерживается
  if (pose.armR.target && pose.armR.hand === "palmUp") {
    const spk = Object.values(S).find((x) => x.role === "teacher" && t >= x.start && t <= x.end);
    if (spk) {
      const e = clamp((t - spk.start) / 0.4) * clamp((spk.end - t) / 0.4);
      pose = { ...pose, armR: { ...pose.armR, target: { x: pose.armR.target.x, y: pose.armR.target.y + 6 * Math.sin(2 * Math.PI * 1.3 * (t - spk.start)) * e } } };
    }
  }
  let holdR: React.ReactNode | undefined;
  let lookTarget: P | null = null;
  const baseLean = pose.lean;
  // действие руки: кисть w с силой k; корпус наклоняется к цели (lo…hi, доля
  // длины руки kk, от позы base; rate — как быстро наклон следует за рукой)
  const acts: { w: P; side: "L" | "R"; k: number; lo?: number; hi?: number; kk?: number; base?: Pose; rate?: number }[] = [];
  const restR = wristWorld(TEACHER, tKneel, root, "R");

  // 1) пальцем проверяет землю сверху (не задевая росток): кисть приходит
  //    дугой сверху, палец смотрит вниз; после касания поднимается и уходит
  //    вверх-влево, не задевая подставку и край горшка
  {
    const a = H.soil.start + 0.15;
    const touch = H.soil.start + 0.95;
    const off = H.soil.start + 1.7;
    const end = H.soil.start + 2.6;
    if (t > a && t < end) {
      const tip = soilDent(pot);
      const PA = 35; // палец вниз-вправо, почти вертикально
      const above = { x: tip.x - 4, y: tip.y - 34 };
      const restF = add(restR, mul(dirV(PA), HAND_T * ST * 1.2));
      let fin: P;
      let k = 1;
      if (t < touch - 0.25) {
        k = easeInOut((t - a) / (touch - 0.25 - a));
        fin = lerpP(restF, above, k);
        fin = { x: fin.x, y: fin.y - Math.sin(Math.PI * k) * 40 };
      } else if (t < touch) fin = lerpP(above, tip, easeInOut((t - (touch - 0.25)) / 0.25));
      else if (t < off) fin = tip;
      else if (t < off + 0.25) fin = lerpP(tip, above, easeInOut((t - off) / 0.25));
      else {
        k = 1 - easeInOut((t - off - 0.25) / (end - off - 0.25));
        fin = lerpP(restF, above, k);
        fin = { x: fin.x, y: fin.y - Math.sin(Math.PI * k) * 40 };
      }
      const w = { x: fin.x - dirV(PA).x * HAND_T * ST * 1.2, y: fin.y - dirV(PA).y * HAND_T * ST * 1.2 };
      pose = { ...pose, armR: armTo(root, w, 1, k > 0.5 ? "point" : "relaxed", k > 0.3 ? PA : undefined, true) };
      acts.push({ w, side: "R", k });
      lookTarget = tip;
    }
  }
  // 2) мягко направляет лейку: учитель приподнимается на коленях, кисть идёт
  //    над ростком (не задевая листья и стол) и ложится ладонью на крышку
  //    лейки у носика; после полива так же над ростком возвращается к колену
  {
    const a = seg(5).start - 0.45;
    const on = seg(5).start + 0.55;
    const offT = H.pourEnd.start + 1.0;
    const end = offT + 1.2;
    if (t > a && t < end && can.held) {
      const top = canWorldAt(can, CAN_TOP_FRONT);
      const HA = 72 - can.tilt * 0.6; // пальцы вниз-вправо, по крышке
      const want = wristFor({ x: top.x, y: top.y + 2 }, HA, TEACHER, root, 0.5);
      const rest = wristWorld(TEACHER, pose, root, "R");
      const pb = plantBox();
      // кисть идёт сбоку от левого края стола и высоко над ростком: пальцы
      // (на длину кисти ниже запястья) не задевают ни листья, ни стол
      const HI = { x: pot.x - 70, y: pot.y + pb.y * TS - 34 - HAND_T * ST };
      const SIDE = { x: Math.min(restR.x + 20, 1335), y: TOP_Y - 70 };
      let w: P;
      let k = 1;
      if (t < on) {
        k = easeInOut((t - a) / (on - a));
        w = keysP(
          [
            { at: a, v: rest },
            { at: a + 0.3, v: SIDE },
            { at: a + 0.6, v: HI, arc: 8 },
            { at: on, v: want, ease: easeOut },
          ],
          t,
        );
      } else if (t <= offT) w = want;
      else {
        k = 1 - easeInOut((t - offT) / (end - offT));
        w = keysP(
          [
            { at: offT, v: want },
            { at: offT + 0.3, v: { x: want.x - 10, y: want.y - 40 } },
            { at: offT + 0.65, v: HI },
            { at: offT + 0.9, v: SIDE },
            { at: end, v: rest },
          ],
          t,
        );
      }
      pose = { ...pose, armR: armTo(root, w, -1, k > 0.5 ? "flat" : "relaxed", k > 0.3 ? HA : undefined, true) };
      acts.push({ w, side: "R", k, lo: -24, hi: 4, kk: 0.8, base: pose, rate: 1 });
      if (t < H.pourEnd.start) lookTarget = soilTop(pot);
      // «Понемногу, Юсуф» — смотрит на Юсуфа, затем снова на землю
      const wY = D.wordAt(5, "Юсуф", 0.25);
      if (t > wY - 0.15 && t < wY + 0.95) lookTarget = D.yStandHead;
    }
  }
  // 3) карточки: берёт из стопки, переносит, ставит в подставку
  {
    for (let k = 0; k < 4; k++) {
      const c = D.cardT(k);
      const prevBack = k === 0 ? c.reach : D.cardT(k - 1).release;
      if (t < prevBack || t > c.back + (k === 3 ? 0.6 : 0)) continue;
      const stackTop = { x: STACK0.x, y: STACK0.y - 3 * TS * (4 - k) };
      const slot = railSlot(k);
      const seatTop = { x: slot.x + CARD_GRIP.x * TS, y: slot.y + CARD_GRIP.y * TS };
      const PA = 20;
      const fromRest = k === 0 ? add(restR, mul(dirV(PA), HAND_T * ST * 1.12)) : (() => {
        const ps = railSlot(k - 1);
        return { x: ps.x + CARD_GRIP.x * TS, y: ps.y + CARD_GRIP.y * TS - 10 };
      })();
      let grip: P;
      let holding = false;
      let flat = 1; // карточка из стопки лежит, в руке — выпрямляется
      // карточка поднимается выше своей высоты и только потом встаёт вертикально
      // (не проходит сквозь край стола)
      const LIFT = CARD.h * TS + 8;
      if (t < c.grip) grip = lerpP(fromRest, stackTop, easeInOut((t - prevBack) / (c.grip - prevBack)));
      else if (t < c.lift) {
        holding = true;
        grip = lerpP(stackTop, { x: stackTop.x, y: stackTop.y - LIFT }, easeInOut((t - c.grip) / (c.lift - c.grip)));
        flat = 1 - easeInOut(clamp((t - c.grip - 0.1) / (c.lift - c.grip - 0.1)));
      } else if (t < c.over) {
        holding = true;
        flat = 0;
        const u = easeInOut((t - c.lift) / (c.over - c.lift));
        grip = { x: lerp(stackTop.x, seatTop.x, u), y: lerp(stackTop.y - LIFT, seatTop.y - 14, u) - Math.sin(Math.PI * u) * 10 };
      } else if (t < c.seat) {
        holding = true;
        flat = 0;
        grip = lerpP({ x: seatTop.x, y: seatTop.y - 14 }, seatTop, easeInOut((t - c.over) / (c.seat - c.over)));
      } else if (t < c.release) grip = seatTop;
      else {
        const u = easeInOut((t - c.release) / (c.back + (k === 3 ? 0.6 : 0) - c.release));
        grip = k === 3 ? lerpP(seatTop, add(restR, mul(dirV(PA), HAND_T * ST * 1.12)), u) : lerpP(seatTop, { x: seatTop.x, y: seatTop.y - 10 }, u);
      }
      const w = { x: grip.x - dirV(PA).x * HAND_T * ST * 1.12, y: grip.y - dirV(PA).y * HAND_T * ST * 1.12 };
      // дальняя (правая) рука: локоть опущен и уходит за корпус — плечо и локоть
      // заслонены телом, к карточке тянется предплечье (так видно при повороте
      // ¾); корпус лишь слегка подаётся вперёд
      pose = { ...pose, armR: armTo(root, w, 1, holding || (t >= c.seat && t < c.release) ? "pinch" : "relaxed", PA, false) };
      const env = easeInOut(clamp((t - prevBack) / 0.4)) * (1 - easeInOut(clamp((t - (c.back + (k === 3 ? 0.6 : 0) - 0.3)) / 0.3)));
      pose = { ...pose, lean: baseLean - 4 * env };
      lookTarget = grip;
      if (holding) {
        const kk = TS / ST;
        holdR = (
          <g transform={`translate(${(dirV(PA).x * HAND_T * 1.12).toFixed(2)} ${(dirV(PA).y * HAND_T * 1.12).toFixed(2)}) scale(${kk.toFixed(4)})`}>
            {/* лежащая карточка сплюснута по высоте и встаёт по мере подъёма;
                переворот рубашкой → лицом — через «ребро» (сжатие по ширине) */}
            <g transform={`scale(${Math.max(0.15, Math.abs(1 - 2 * clamp((flat - 0.35) / 0.3))).toFixed(3)} ${(0.3 + 0.7 * (1 - flat)).toFixed(3)})`}>
              <Card x={-CARD_GRIP.x} y={-CARD_GRIP.y} kind={CARD_ORDER[k]} lean={flat * 0.85} back={flat > 0.5} />
            </g>
          </g>
        );
      }
    }
  }

  // 4) реплики 20 и 25: указывает на названные карточки (вода, солнце), затем
  //    открытая ладонь к детям («и весь мир»)
  {
    const cardTip = (k: number): P => {
      const sl = railSlot(k);
      return { x: sl.x + CARD_GRIP.x * TS - 4, y: sl.y + CARD_GRIP.y * TS - 55 };
    };
    const PA = 28;
    const finW = (f: P) => ({ x: f.x - dirV(PA).x * HAND_T * ST * 1.15, y: f.y - dirV(PA).y * HAND_T * ST * 1.15 });
    const plans: { a: number; b: number; pts: { at: number; v: P; hand: ArmPose["hand"] }[] }[] = [
      {
        a: D.wordAt(20, "воду", 0.45) - 0.55,
        b: seg(20).end + 0.2,
        pts: [
          { at: D.wordAt(20, "воду", 0.45) - 0.1, v: finW(cardTip(1)), hand: "point" },
          { at: D.wordAt(20, "солнце", 0.7) - 0.1, v: finW(cardTip(0)), hand: "point" },
        ],
      },
      {
        a: D.wordAt(25, "солнце", 0.4) - 0.55,
        b: seg(25).end + 0.2,
        pts: [
          { at: D.wordAt(25, "солнце", 0.4) - 0.1, v: finW(cardTip(0)), hand: "point" },
          { at: D.wordAt(25, "воду", 0.5) - 0.1, v: finW(cardTip(1)), hand: "point" },
        ],
      },
    ];
    for (const pl of plans) {
      if (t <= pl.a || t >= pl.b) continue;
      // кисть сначала поднимается перед столом, затем — к карточке
      const lift = { x: wristWorld(TEACHER, tKneel, root, "L").x + 40, y: pl.pts[0].v.y - 40 };
      const restL = wristWorld(TEACHER, tKneel, root, "L");
      const keysW: KP[] = [{ at: pl.a, v: restL }, { at: pl.a + 0.25, v: lift }, ...pl.pts.map((x) => ({ at: x.at, v: x.v, arc: 6 })), { at: pl.pts[pl.pts.length - 1].at + 0.6, v: pl.pts[pl.pts.length - 1].v }, { at: pl.b, v: restL }];
      const w = keysP(keysW, t);
      const cur = [...pl.pts].reverse().find((x) => t >= x.at - 0.25) ?? pl.pts[0];
      const k = Math.min(easeInOut(clamp((t - pl.a) / 0.4)), easeInOut(clamp((pl.b - t) / 0.4)));
      const hand = k > 0.5 ? cur.hand : "relaxed";
      // указывает ближней (левой) рукой — она перед телом, локоть внизу; дальняя
      // рука при такой близкой цели складывалась бы локтем к Амиру
      pose = { ...pose, armL: armTo(root, w, 1, hand, k > 0.4 ? PA : undefined, true) };
      if (hand === "point") lookTarget = { x: w.x + 30, y: w.y + 30 };
    }
  }
  if (acts.length) {
    const ks = acts.reduce((a, x) => a + x.k, 0);
    const kMax = Math.max(...acts.map((x) => x.k));
    const want = ks > 1e-4 ? acts.reduce((a, x) => a + leanToward(TEACHER, x.base ?? tKneel, root, ARM_T, x.w, x.side, x.lo ?? -30, x.hi ?? 4, x.kk) * x.k, 0) / ks : baseLean;
    const rate = Math.min(...acts.map((x) => x.rate ?? 1.5));
    pose = { ...pose, lean: lerp(baseLean, want, clamp(kMax * rate)) };
  }
  const hw = add(root, mul(solveRig(TEACHER, pose).headC, ST));
  let target = D.attention(t - 0.05);
  const spk = Object.values(S).find((s) => t >= s.start - 0.3 && t <= s.end + 0.4);
  const heroHead = (r: string) => (r === "yusuf" ? (t < D.yCrouch0 ? headWorld(YUSUF, stand(YUSUF, Y_YAW), Y_TABLE) : D.yHead) : r === "amir" ? (t < D.aKneel0 ? headWorld(AMIR, aSit, A_SEAT) : D.aHead) : t < D.bKneel0 ? headWorld(BILAL, bSit, B_SEAT) : D.bHead);
  if (spk && spk.role !== "teacher" && spk.role !== "kids") target = heroHead(spk.role);
  if (spk && spk.role === "teacher") {
    // отвечает тому, кто спросил (предыдущая реплика ребёнка)
    const idx = A4_LINES.findIndex((l) => l.id === spk.line);
    const prev = A4_LINES[idx - 1];
    target = prev && prev.role !== "teacher" && prev.role !== "kids" ? heroHead(prev.role) : { x: 2250, y: 1700 };
    // «И Амира, и Билала, и всех нас» — взгляд переходит от мальчика к мальчику
    if (spk.line === n(33)) {
      if (t > D.wordAt(33, "Амира", 0.45) - 0.15) target = D.aHead;
      if (t > D.wordAt(33, "Билала", 0.65) - 0.15) target = D.bHead;
      if (t > D.wordAt(33, "всех", 0.85) - 0.15) target = { x: 2300, y: 1650 };
    }
    if (spk.line === n(35) && t > D.wordAt(35, "родители", 0.45)) target = t > D.wordAt(35, "Аллах", 0.75) ? { x: 2250, y: 1680 } : D.yHead;
    if (spk.line === n(13)) target = { x: 2250, y: 1700 };
    // «И ухаживать» — замечает, что Юсуф придвигает лейку, затем ко всем
    if (spk.line === n(12)) target = t < D.wordAt(12, "ухаживать", 0.25) + 0.7 ? D.yHead : { x: 2250, y: 1700 };
  }
  if (spk?.role === "kids") target = { x: 2500, y: 1580 };
  if (inPause) target = { x: 2300, y: 1650 };
  // перед вопросами к зрителям — сначала смотрит на класс, затем поворачивается к камере
  if (!spk && t > seg(37).end + 0.4 && t < seg(38).start - 1.3) target = { x: 2250, y: 1700 };
  if (t < seg(1).start - 0.3 && !lookTarget) target = t < H.rise.start + 0.2 ? D.plantP : heroHead("yusuf");
  if (t > H.cardsOut.start && t < D.cardT(3).back + 0.3 && !lookTarget) target = D.cardsP;
  // жест к окну: первую секунду учитель сам смотрит на окно
  for (const [a, b] of [
    [D.wordAt(16, "И", 0.7) - 0.1, seg(16).end - 0.4],
    [seg(18).start + 0.2, D.wordAt(18, "Всё", 0.65) - 0.7],
  ])
    if (t > a && t < b) target = D.windowP;
  if (lookTarget) target = lookTarget;
  let la = lookAt(target.x - hw.x, target.y - hw.y);
  // сцена 7: вопросы к зрителям — взгляд в камеру; во время пауз — спокойно ждёт
  const camK = Math.max(
    ...[38, 40, 42].map((q) => clamp((t - (seg(q).start - (q === 38 ? 1.3 : 0.6))) / 0.6) * (1 - clamp((t - (PZ[n(q)].end - 0.2)) / 0.6))),
    clamp((t - (seg(13).start + 0.5)) / 0.8) * (1 - clamp((t - (PZ[n(13)].end - 0.2)) / 0.6)) * 0.6,
  );
  if (camK > 0) {
    const camLa = { yaw: 0.06, pitch: 0.04, gaze: { x: -0.05, y: 0.05 } };
    la = { yaw: lerp(la.yaw, camLa.yaw, camK), pitch: lerp(la.pitch, camLa.pitch, camK), gaze: lerpP(la.gaze, camLa.gaze, camK) };
  }
  let expr: Expr = { smile: 0.45, browIn: 0.15 };
  if (t < seg(1).end + 0.2 && t > seg(1).start) expr = { smile: 0.62, browIn: 0.2, browL: 0.15, browR: 0.15 }; // слегка улыбается Юсуфу
  if (inPause) expr = { smile: 0.42, browIn: 0.22 };
  if (t > seg(24).start && t < seg(25).start) expr = { smile: 0.4, browIn: 0.3, browL: 0.15, browR: 0.15 }; // спокойно дослушивает
  if (t > seg(28).end - 0.2 && t < seg(29).start + 1.0) expr = { smile: 0.68, browIn: 0.2 }; // улыбается Юсуфу
  if (t > seg(43).start && t < T.scenes.end.start) expr = { smile: 0.7, browIn: 0.15 }; // радуется общему ответу
  if ((t > seg(39).end && t < seg(40).start + 0.3) || (t > seg(41).end && t < seg(42).start + 0.3)) expr = { smile: 0.68, browIn: 0.15 }; // правильный ответ
  if (lookTarget) expr = { smile: 0.42, browIn: 0.2 };
  // кивки на «Да.» / «Верно.» / «Тоже Аллах.» / «Не нужен.» / «Посмотрим.»
  // кивки: на «Да.»/«Верно.»/…, и одобрение правильных ответов зрителю/детей
  const nodAt = [...[2, 7, 16, 18, 20, 23, 29, 31, 33, 35, 37, 45, 47].map((k) => seg(k).start), D.wordAt(5, "Юсуф", 0.25), D.wordAt(5, "Слишком", 0.45), seg(39).end + 0.3, seg(41).end + 0.3, seg(43).end + 0.2, D.wordAt(5, "навредить", 0.8)];
  let nod = 0;
  for (const a of nodAt) {
    const d = t - a;
    const amp = Math.abs(a - (seg(39).end + 0.3)) < 0.01 || Math.abs(a - (seg(41).end + 0.3)) < 0.01 ? 0.18 : 0.12;
    if (d > -0.1 && d < 0.6) nod = Math.max(nod, Math.sin(((d + 0.1) / 0.7) * Math.PI) * amp);
  }
  const mouth = speakingMouth(mouthFor(T, "teacher"), t);
  const p2: Pose = { ...pose, headYaw: pose.headYaw * 0.35 + la.yaw * 0.65, headPitch: pose.headPitch * 0.5 + la.pitch * 0.6 + nod, shoulderUp: breathe("teacher", t) };
  const face = faceWith(exprTrack([{ at: 0, v: expr }], t), la.gaze, heroBlink("teacher", t), mouth);
  void CAN;
  void CARD;
  return { id: "teacher", look: TEACHER, x: root.x, y: root.y, pose: p2, face, holdR };
};

// Время двух надписей — от слов озвучки (единый источник — шкала):
// «Аллах Един» — на слове «Един» реплики 27, держится до конца паузы-надписи;
// «Аллах — Единственный Создатель» — в последнем кадре, ≈ 4,5 с до затухания.
export const captionTimes = (T: Timeline, D: Direction) => {
  const s27 = D.seg(27);
  return {
    oneIn: Math.min(D.wordAt(27, "Един", 0.92) + 0.15, s27.end + 0.1),
    oneOut: Math.min(T.hold.caption.end + 0.1, D.seg(28).start - 0.65), // угасание заканчивается до смены плана
    finalIn: T.hold.final.start + 1.3, // ≈ 5,2 с до конца, последние 0,9 с — общее затухание
    finalOut: T.total + 1,
  };
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
    const pick = (f: (x: Char) => number, w = HEAD_W) => all.reduce((acc, s, k) => acc + f(s.chars[i] ?? c) * w[k], 0);
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
