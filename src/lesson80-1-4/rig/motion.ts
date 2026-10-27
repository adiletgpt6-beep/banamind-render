// Движения ролика 80-1-4, которых не было в первых фильмах: ходьба с
// неподвижными опорными стопами, подъём с ковра, посадка на колени.
// Без React и без Remotion — чистые функции от времени (их используют и
// режиссура, и проверки).
//
// Ходьба. Стопы ставятся в мировые точки на полу и стоят там всю опору;
// таз движется между ними, ноги решаются двухзвенной IK от тазобедренного
// сустава к щиколотке (длина звеньев постоянна — нога не тянется). Высота
// таза берётся такой, чтобы обе опорные стопы были досягаемы: в двойной
// опоре таз ниже, в одиночной — выше (естественный вертикальный ход).
// Перспектива: масштаб персонажа — scaleAt(глубина корня), стопы переводятся
// в локальные координаты корня делением на масштаб.
import { scaleAt } from "../../lesson01/layout";
import { type P, add, angleOf, clamp, dist, easeInOut, ik, lerp, sub } from "../../lesson01/rig/geom";
import type { Look } from "../../lesson01/rig/looks";
import { type ArmPose, type LegPose, mixPose, type Pose } from "../../lesson01/rig/pose";
import { ARM_DOWN_L, ARM_DOWN_R, stand } from "../../lesson01/rig/presets";

const sgn = (v: number) => (v >= 0 ? 1 : -1);

// Тазобедренные суставы в координатах корня — та же формула, что в solveRig.
export const hipJoints = (look: Look, hip: P, yaw: number) => {
  const w = look.body.hipW * 0.3 * (1 - 0.25 * Math.abs(yaw));
  return { L: { x: hip.x - w, y: hip.y }, R: { x: hip.x + w, y: hip.y } };
};

// Нога по точкам суставов: бедро H→K, голень K→A. Если звено видно короче
// своей длины — это перспективное укорочение (f < 1); длиннее не бывает.
export const legFrom = (look: Look, H: P, K: P, A: P, footA: number, footF: number): LegPose => {
  const b = look.body;
  return {
    a1: angleOf(sub(K, H)),
    a2: angleOf(sub(A, K)),
    f1: clamp(dist(H, K) / b.thigh, 0.05, 1),
    f2: clamp(dist(K, A) / b.shin, 0.05, 1),
    footA,
    footF,
  };
};

// Нога по цели щиколотки (полная длина звеньев, колено — в сторону bend).
export const legIK = (look: Look, H: P, A: P, bend: number, footA: number, footF: number): LegPose => {
  const b = look.body;
  const r = ik(H, A, b.thigh, b.shin, bend);
  return { a1: r.a1, a2: r.a2, f1: 1, f2: 1, footA, footF };
};

// Нога по цели щиколотки без «выброса» колена вбок. Когда стопа ближе к
// тазу из-за глубины (шаг к стене или к зрителю), колено у обычной IK
// уходило бы далеко в сторону, как в пинке. Здесь изгиб колена ограничен
// (maxOff — доля бедра), а остаток укорочения ноги показан перспективой
// (оба звена видны короче, f < 1), как у ноги, шагнувшей вглубь кадра.
const kneeOffset = (a: number, b: number, d: number) => {
  const x = (a * a - b * b + d * d) / (2 * d);
  return Math.sqrt(Math.max(0, a * a - x * x));
};
export const legIKSoft = (look: Look, H: P, A: P, bend: number, footA: number, footF: number, maxOff = 0.3): LegPose => {
  const b = look.body;
  const d = Math.max(1e-3, dist(H, A));
  const lim = maxOff * b.thigh;
  if (d >= (b.thigh + b.shin) * 0.999 || kneeOffset(b.thigh, b.shin, d) <= lim) return legIK(look, H, A, bend, footA, footF);
  let lo = d / (b.thigh + b.shin);
  let hi = 1;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (kneeOffset(mid * b.thigh, mid * b.shin, d) > lim) hi = mid;
    else lo = mid;
  }
  const r = ik(H, A, b.thigh * lo, b.shin * lo, bend);
  return { a1: r.a1, a2: r.a2, f1: lo, f2: lo, footA, footF };
};

// Высота щиколотки над полом (как у позы «стоя»): стопа лежит на полу.
const ankleLift = (look: Look) => look.body.legW * 0.35;

// ---------- Промежуточные позы подъёма и посадки ----------
// yaw — разворот корпуса (знак — куда смотрит персонаж: − влево, + вправо).

// На коленях, корпус вертикально (колени на полу, голени лежат назад).
export const kneelTall = (look: Look, yaw: number): Pose => {
  const b = look.body;
  const s = sgn(yaw);
  const base = stand(look, yaw);
  const hip = { x: 0, y: -(b.thigh * 0.96 + b.legW * 0.5) };
  const J = hipJoints(look, hip, yaw);
  const leg = (H: P, k: number) => {
    const K = { x: H.x + s * b.thigh * 0.12 * k, y: -b.legW * 0.5 };
    const A = { x: K.x - s * b.shin * 0.32, y: K.y - b.shin * 0.26 };
    return legFrom(look, H, K, A, -s * 110, 0.32);
  };
  return {
    ...base,
    hip,
    lean: -s * 2,
    legL: leg(J.L, s < 0 ? 0.6 : 1),
    legR: leg(J.R, s < 0 ? 1 : 0.6),
    legsFront: false,
    legOrder: s < 0 ? "LR" : "RL",
  };
};

// Полуприсед: ближняя нога впереди (стопа на полу, колено поднято),
// дальняя стоит коленом на полу. Подготовка к подъёму и посадке.
export const halfKneel = (look: Look, yaw: number): Pose => {
  const b = look.body;
  const s = sgn(yaw);
  const base = stand(look, yaw);
  const hip = { x: 0, y: -(b.shin * 0.92 + ankleLift(look)) };
  const J = hipJoints(look, hip, yaw);
  const near: "L" | "R" = s < 0 ? "R" : "L";
  const front = (H: P) => {
    const A = { x: H.x + s * b.thigh * 0.62, y: -ankleLift(look) };
    return legIK(look, H, A, -s, s * 78, 0.62);
  };
  const back = (H: P) => {
    const K = { x: H.x - s * b.thigh * 0.18, y: -b.legW * 0.5 };
    const A = { x: K.x - s * b.shin * 0.34, y: K.y - b.shin * 0.22 };
    return legFrom(look, H, K, A, -s * 110, 0.32);
  };
  return {
    ...base,
    hip,
    lean: -s * 10, // вперёд, в сторону взгляда (+lean — к левому краю экрана)
    headPitch: 0.1,
    armL: { ...ARM_DOWN_L, a1: -9 + s * 12, a2: -4 + s * 22 },
    armR: { ...ARM_DOWN_R, a1: 9 + s * 12, a2: 4 + s * 22 },
    legL: near === "L" ? front(J.L) : back(J.L),
    legR: near === "R" ? front(J.R) : back(J.R),
    legsFront: false,
    legOrder: near === "R" ? "LR" : "RL",
  };
};

// Последовательность поз по времени: мягкое смешивание соседних ключей.
export type PoseKey = { at: number; pose: Pose };
export const poseSeq = (keys: PoseKey[], t: number): Pose => {
  if (t <= keys[0].at) return keys[0].pose;
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i].at) {
      const a = keys[i - 1];
      const b = keys[i];
      return mixPose(a.pose, b.pose, easeInOut((t - a.at) / Math.max(1e-3, b.at - a.at)));
    }
  }
  return keys[keys.length - 1].pose;
};

// ---------- Ходьба ----------
export type Walk = {
  path: P[]; // мировые точки на полу (линия опоры)
  t0: number; // начало первого шага, с
  dur: number; // длительность всех шагов, с
  steps: number; // число шагов (последний приставляет стопу)
  yaw: number; // разворот корпуса во время ходьбы
  lift?: number; // подъём стопы (доля голени)
  arm?: number; // размах рук, °
  bounce?: number; // детский «пружинящий» шаг: подъём таза в одиночной опоре (доля голени)
};

const pathLen = (pts: P[]) => pts.slice(1).reduce((a, p, i) => a + dist(p, pts[i]), 0);
const pathAt = (pts: P[], s: number): P => {
  let rest = Math.max(0, s);
  for (let i = 1; i < pts.length; i++) {
    const d = dist(pts[i - 1], pts[i]);
    if (rest <= d || i === pts.length - 1) {
      const k = d > 1e-6 ? Math.min(1, rest / d) : 1;
      return { x: lerp(pts[i - 1].x, pts[i].x, k), y: lerp(pts[i - 1].y, pts[i].y, k) };
    }
    rest -= d;
  }
  return pts[pts.length - 1];
};

export type WalkState = { root: P; scale: number; pose: Pose; feet: { L: P; R: P }; moving: boolean; progress: number };

// Положение стоп вдоль пути (длина дуги) в момент t.
const footArc = (w: Walk, L: number, t: number) => {
  const N = Math.max(2, w.steps);
  const Ts = w.dur / N;
  const q = (k: number) => (k <= 0 ? 0 : k >= N - 1 ? L : (L * k) / (N - 1));
  // шаг k (1…N) переносит стопу A (нечётные) или B (чётные) в q(k)
  const pos = { A: 0, B: 0 };
  const swing = { A: 0, B: 0 }; // 0…1 — доля переноса (для подъёма стопы)
  let lastA = 0;
  let lastB = 0;
  for (let k = 1; k <= N; k++) {
    const isA = k % 2 === 1;
    const from = isA ? lastA : lastB;
    const to = k === N ? L : q(k);
    const s0 = w.t0 + (k - 1) * Ts;
    const u = clamp((t - s0) / (Ts * 0.74));
    const p = from + (to - from) * easeInOut(u);
    if (isA) {
      if (t >= s0) pos.A = p;
      if (u > 0 && u < 1) swing.A = u;
      lastA = to;
    } else {
      if (t >= s0) pos.B = p;
      if (u > 0 && u < 1) swing.B = u;
      lastB = to;
    }
  }
  return { pos, swing };
};

export const walkAt = (look: Look, w: Walk, t: number): WalkState => {
  const b = look.body;
  const s = sgn(w.yaw);
  const L = pathLen(w.path);
  const { pos, swing } = footArc(w, L, t);
  const mid = (pos.A + pos.B) / 2;
  const root = pathAt(w.path, mid);
  const sc = scaleAt(root.y);
  // ближняя к зрителю стопа — ниже на экране (чуть ближе по глубине)
  const near: "L" | "R" = s < 0 ? "R" : "L";
  const lat = b.hipW * 0.3 * 0.55 * sc;
  const footWorld = (arc: number, sw: number, isNear: boolean): P => {
    const p = pathAt(w.path, arc);
    const lift = Math.sin(Math.PI * sw) * b.shin * (w.lift ?? 0.16) * sc;
    return { x: p.x, y: p.y + (isNear ? lat : -lat) - lift };
  };
  // стопа A — дальняя, B — ближняя (первой шагает дальняя нога)
  const far: "L" | "R" = near === "L" ? "R" : "L";
  const fw: Record<"L" | "R", P> = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } };
  fw[far] = footWorld(pos.A, swing.A, false);
  fw[near] = footWorld(pos.B, swing.B, true);
  const loc = (p: P): P => ({ x: (p.x - root.x) / sc, y: (p.y - root.y) / sc });
  const ankle = { L: add(loc(fw.L), { x: 0, y: -ankleLift(look) }), R: add(loc(fw.R), { x: 0, y: -ankleLift(look) }) };
  // таз: не выше стоячего; опускается, если иначе стопа недосягаема
  const base = stand(look, w.yaw);
  const reach = (b.thigh + b.shin) * 0.992;
  let hipY = base.hip.y;
  const hx = (side: "L" | "R") => hipJoints(look, { x: 0, y: 0 }, w.yaw)[side].x;
  for (const side of ["L", "R"] as const) {
    const dx = ankle[side].x - hx(side);
    const dy = Math.sqrt(Math.max(0, reach * reach - dx * dx));
    hipY = Math.max(hipY, ankle[side].y - dy);
  }
  // пружинящий шаг: в одиночной опоре таз чуть выше (только если досягаемо)
  const single = Math.max(swing.A, swing.B);
  const bounce = Math.sin(Math.PI * single) * b.shin * (w.bounce ?? 0);
  let hipBounce = hipY - bounce;
  for (const side of ["L", "R"] as const) {
    const sw = side === far ? swing.A : swing.B;
    if (sw > 0 && sw < 1) continue; // переносимая нога может согнуться сильнее
    const dx = ankle[side].x - hx(side);
    const dy = Math.sqrt(Math.max(0, reach * reach - dx * dx));
    hipBounce = Math.max(hipBounce, ankle[side].y - dy);
  }
  const hip = { x: 0, y: hipBounce };
  const J = hipJoints(look, hip, w.yaw);
  const footAng = (sw: number) => s * (78 - 30 * Math.sin(Math.PI * sw));
  const swOf = (side: "L" | "R") => (side === far ? swing.A : swing.B);
  // переносимая нога сгибается заметнее опорной
  const legOf = (side: "L" | "R") => legIKSoft(look, J[side], ankle[side], -s, footAng(swOf(side)), 0.62, swOf(side) > 0 && swOf(side) < 1 ? 0.42 : 0.24);
  const legL = legOf("L");
  const legR = legOf("R");
  // руки — в противофазе ногам своей стороны
  const hs = Math.max(1, L / Math.max(1, w.steps - 1)) / 2;
  const fwd = (side: "L" | "R") => clamp(((side === far ? pos.A : pos.B) - mid) / hs, -1, 1);
  const amp = w.arm ?? 13;
  // к последнему шагу размах рук и сгиб локтя затухают — финальная стойка
  // совпадает со стоячей позой (без скачка рук после остановки)
  const env = clamp((w.t0 + w.dur - t) / Math.max(0.7, w.dur / Math.max(1, w.steps)));
  // рука вперёд (в сторону взгляда), когда нога своей стороны сзади; локоть чуть согнут
  const arm = (base0: ArmPose, side: "L" | "R"): ArmPose => {
    const k = -fwd(side);
    return { ...base0, a1: base0.a1 + s * amp * k * env, a2: base0.a2 + s * (amp * 1.3 * k + 10) * env, hand: "relaxed", handRot: 0 };
  };
  const moving = t > w.t0 && t < w.t0 + w.dur;
  const pose: Pose = {
    ...base,
    hip,
    lean: -s * 3 * (moving ? env : 0), // лёгкий наклон вперёд по ходу шага
    headPitch: 0.04,
    armL: arm(ARM_DOWN_L, "L"),
    armR: arm(ARM_DOWN_R, "R"),
    legL,
    legR,
    legsFront: false,
    legOrder: near === "R" ? "LR" : "RL",
  };
  // первые и последние 0,25 с поза плавно переходит из стоячей и в стоячую:
  // на стыке со вставанием/присаживанием нет скачка таза и рук
  const e = Math.min(clamp((t - w.t0) / 0.25), clamp((w.t0 + w.dur - t) / 0.25));
  const blended = e < 1 ? mixPose(stand(look, w.yaw), pose, easeInOut(e)) : pose;
  return { root, scale: sc, pose: blended, feet: fw, moving, progress: L > 0 ? mid / L : 1 };
};

// Мировые координаты щиколоток по позе (для проверки: стопа не скользит).
export const ankleWorld = (look: Look, pose: Pose, root: P, sc: number) => {
  const b = look.body;
  const J = hipJoints(look, pose.hip, pose.bodyYaw);
  const end = (H: P, l: LegPose) => {
    const K = { x: H.x + Math.sin((l.a1 * Math.PI) / 180) * b.thigh * l.f1, y: H.y + Math.cos((l.a1 * Math.PI) / 180) * b.thigh * l.f1 };
    const A = { x: K.x + Math.sin((l.a2 * Math.PI) / 180) * b.shin * l.f2, y: K.y + Math.cos((l.a2 * Math.PI) / 180) * b.shin * l.f2 };
    return { x: root.x + A.x * sc, y: root.y + A.y * sc };
  };
  return { L: end(J.L, pose.legL), R: end(J.R, pose.legR) };
};
