// Походка и присаживание взрослого персонажа (ролик 80-1-3). Без React:
// план шагов считается один раз (planWalk), поза — чистая функция времени
// (walkAt). Опорная стопа стоит в одной мировой точке, пока не оторвётся;
// переносимая — проходит дугой с небольшим подъёмом.
//
// Пол — косоугольная проекция: шаг на 1 ед. к камере опускает точку на
// экране на DEPTH_K ед. (в масштабе персонажа). Ноги решаются двухзвенной
// ИК «в объёме» (x — вправо, z — к камере, h — вверх) и проецируются на
// экран: экранная длина бедра/голени — это f1/f2 позы.
import { scaleAt } from "../../lesson01/layout.ts";
import { type P, angleOf, clamp, dir, lerp, lerpAngle, lerpP } from "../../lesson01/rig/geom.ts";
import type { Look } from "../../lesson01/rig/looks.ts";
import type { ArmPose, LegPose, Pose } from "../../lesson01/rig/pose.ts";
import { kneel, stand } from "../../lesson01/rig/presets.ts";
import { solveRig } from "../../lesson01/rig/solve.ts";

export const DEPTH_K = 0.45;
const DEPTH_STEP = 0.14; // укорочение шага при ходьбе к камере

type Side = "L" | "R";
const SIDES: Side[] = ["L", "R"];
const sgnSide = (s: Side) => (s === "L" ? -1 : 1);
const sgn = (v: number) => (v >= 0 ? 1 : -1);
const smooth = (x: number) => {
  const u = clamp(x);
  return u * u * (3 - 2 * u);
};
// разгон без торможения: f(0)=0, f'(0)=0, f(1)=1, f'(1)=1.5 — пятка уходит
// вверх всё быстрее и стопа отрывается от пола с ходу, без остановки
const easeToe = (x: number) => {
  const u = clamp(x);
  return 1.5 * u * u - 0.5 * u * u * u;
};
// базис Эрмита: начальная скорость при нулевых концах
const h10 = (u: number) => u * (1 - u) * (1 - u);

// ---------- Параметры шага ----------
const SWING = 0.76; // доля шага в переносе (остальное — двойная опора)
const PREP = 0.3; // перенос веса перед первым шагом, доля T
// Размеры ниже — для взрослого (бедро + голень = LEG_REF); у другого
// персонажа они (и скорость, и длина шага по умолчанию) — пропорционально ногам.
const LEG_REF = 432;
const SEP_X = 28; // стопы чуть уже тазобедренных суставов
const SEP_Z = 20; // и чуть разведены по глубине
const SWAY = 7; // смещение таза к опорной ноге
const BOB_LOW = 28; // таз ниже стойки в двойной опоре
const BOB_HIGH = 6; // и в середине опоры
const LIFT = 0.07; // подъём переносимой стопы, доля длины ноги
const TOE_OFF = 45; // носок вниз при отрыве, °
const HEEL_ON = 18; // носок вверх при касании пяткой, °
const BALL = 0.72; // подушечка стопы — доля видимой длины стопы
const END_SETTLE = 0.38; // доводка позы после последнего шага, с

export type WalkSpec = {
  look: Look;
  t0: number;
  path: P[]; // мировые точки корня
  speed?: number; // ед./с вдоль пути (по умолчанию 420 — спокойный шаг взрослого; у других — пропорционально ногам)
  stepLen?: number; // ед. (по умолчанию 290 ≈ 0.58 м у взрослого; так же пропорционально)
  firstFoot?: Side;
  yawStart?: number;
  yawEnd?: number;
  depthK?: number; // укорочение глубины пола (1 — мерить путь «как на экране»)
};

type Fall = {
  side: Side;
  at: P; // мировая точка пола под лодыжкой
  beta: number; // угол стопы при постановке
  swing0: number; // начало переноса к этой точке
  land: number; // касание пяткой
  lift: number; // отрыв (начало следующего переноса)
  heel: number; // начало подъёма пятки
  kind: "start" | "walk" | "end";
};

// Ход корня: разгон aT с, ровный ход, торможение dT с (скорость — smoothstep).
// Короткий путь — разгон и торможение короче.
type Root = { t0: number; V: number; aT: number; dT: number; cruise: number; D: number };
const ACCEL = 0.95;
const DECEL = 0.85;
const rootSig = (r: Root, t: number) => {
  const x = t - r.t0;
  const dA = (r.V * r.aT) / 2;
  if (x <= 0 || r.D <= 0) return { v: x <= 0 ? 0 : r.D, dv: 0 };
  if (x < r.aT) {
    const u = x / r.aT;
    return { v: r.V * r.aT * (u * u * u - (u * u * u * u) / 2), dv: r.V * u * u * (3 - 2 * u) };
  }
  if (x < r.aT + r.cruise) return { v: dA + r.V * (x - r.aT), dv: r.V };
  const w = (x - r.aT - r.cruise) / r.dT;
  if (w >= 1) return { v: r.D, dv: 0 };
  return { v: Math.min(r.D, dA + r.V * r.cruise + r.V * r.dT * (w - w * w * w + (w * w * w * w) / 2)), dv: r.V * (1 - w * w * (3 - 2 * w)) };
};

export type WalkPlan = {
  look: Look;
  t0: number;
  t1: number;
  tStop: number; // касание последней стопы
  k: number;
  speed: number;
  stepLen: number;
  T: number; // длительность обычного шага
  pts: P[];
  acc: number[]; // длина пути до точки, ед.
  D: number;
  root: Root;
  bob: { t: number[]; v: number[] };
  sway: { t: number[]; v: number[] };
  falls: Record<Side, Fall[]>;
  yawStart: number;
  yawEnd: number;
  turnS: number; // длительность разворота на старте, с
  H0: number; // высота таза стоя
  ankleH: number; // высота лодыжки над полом стоя
  nSteps: number;
};

// ---------- Путь ----------
const chaikin = (pts: P[], iters: number) => {
  let p = pts;
  for (let it = 0; it < iters; it++) {
    if (p.length < 3) return p;
    const q: P[] = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      if (i > 0) q.push(lerpP(p[i], p[i + 1], 0.25));
      if (i < p.length - 2) q.push(lerpP(p[i], p[i + 1], 0.75));
    }
    q.push(p[p.length - 1]);
    p = q;
  }
  return p;
};

// длина отрезка в ед. тела: глубина пола растянута на 1/k
const unitLen = (a: P, b: P, k: number) => {
  const s = scaleAt((a.y + b.y) / 2);
  return Math.hypot((b.x - a.x) / s, (b.y - a.y) / (s * k));
};

const densify = (path: P[], k: number) => {
  const sm = chaikin(path, 3);
  const pts: P[] = [sm[0]];
  const acc = [0];
  for (let i = 0; i < sm.length - 1; i++) {
    const n = Math.max(1, Math.ceil(unitLen(sm[i], sm[i + 1], k) / 8));
    for (let j = 1; j <= n; j++) {
      const p = lerpP(sm[i], sm[i + 1], j / n);
      acc.push(acc[acc.length - 1] + unitLen(pts[pts.length - 1], p, k));
      pts.push(p);
    }
  }
  return { pts, acc };
};

const pathAt = (pl: { pts: P[]; acc: number[] }, sig: number): P => {
  const { pts, acc } = pl;
  if (sig <= 0) return pts[0];
  if (sig >= acc[acc.length - 1]) return pts[pts.length - 1];
  let lo = 0;
  let hi = acc.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (acc[mid] <= sig) lo = mid;
    else hi = mid;
  }
  return lerpP(pts[lo], pts[hi], (sig - acc[lo]) / Math.max(1e-9, acc[hi] - acc[lo]));
};

// Направление пути в ед. тела: x — вправо, z — к камере (хорда ±70 ед.).
const unitDir = (pl: { pts: P[]; acc: number[]; k: number }, sig: number) => {
  const D = pl.acc[pl.acc.length - 1];
  const a = pathAt(pl, clamp(sig - 70, 0, D));
  const b = pathAt(pl, clamp(sig + 70, 0, D));
  const s = scaleAt((a.y + b.y) / 2);
  const x = (b.x - a.x) / s;
  const z = (b.y - a.y) / (s * pl.k);
  const l = Math.hypot(x, z);
  return l < 1e-6 ? { x: 0, z: 1 } : { x: x / l, z: z / l };
};

// Разворот корпуса по направлению ходьбы: вбок — ±0.55, к камере — ±0.2…0.3.
export const yawForDir = (d: { x: number; z: number }) => clamp(0.55 * sgn(d.x) * Math.pow(Math.abs(d.x), 0.45), -0.6, 0.6);

// ---------- Кривые ----------
const cosKnots =(k: { t: number[]; v: number[] }, x: number) => {
  const n = k.t.length;
  if (x <= k.t[0]) return k.v[0];
  if (x >= k.t[n - 1]) return k.v[n - 1];
  let i = 0;
  while (i < n - 2 && x > k.t[i + 1]) i++;
  const u = (x - k.t[i]) / Math.max(1e-9, k.t[i + 1] - k.t[i]);
  return lerp(k.v[i], k.v[i + 1], (1 - Math.cos(Math.PI * u)) / 2);
};

// ---------- Стопа: угол рисования ----------
// Как у stand(): носки в сторону разворота, ближняя/дальняя ±10°;
// у нуля разворота стопа плавно проходит «носком к зрителю».
const betaWalk = (yaw: number, side: Side) => 70 * Math.tanh(yaw / 0.1) + sgnSide(side) * 10;
const betaStand = (yaw: number, side: Side) => sgn(yaw) * 70 + sgnSide(side) * 10;
const footFOf = (beta: number) => 0.62 - 0.19 * clamp(1 - Math.abs(beta) / 50);
// наклон носка (вверх/вниз) поворачивает стопу «в профиль»; у стопы носком к
// зрителю (beta ≈ 0) — плавно сходит на нет, без скачка при смене знака beta
const pitchK = (beta: number) => Math.tanh(beta / 22);

// ---------- План ----------
export const planWalk = (spec: WalkSpec): WalkPlan => {
  const look = spec.look;
  const k = spec.depthK ?? DEPTH_K;
  const lk = (look.body.thigh + look.body.shin) / LEG_REF;
  const speed = spec.speed ?? 420 * lk;
  const L = spec.stepLen ?? 290 * lk;
  const yawStart = spec.yawStart ?? 0;
  const yawEnd = spec.yawEnd ?? yawStart;
  const t0 = spec.t0;
  const { pts, acc } = densify(spec.path, k);
  const pl = { pts, acc, k };
  const D = acc[acc.length - 1];
  const stS = solveRig(look, stand(look, yawStart));
  const stE = solveRig(look, stand(look, yawEnd));
  const H0 = -stand(look, 0).hip.y;
  const ankleH = -stS.legs.L.A.y;
  const T = L / speed;
  const p0 = pts[0];
  const pE = pts[pts.length - 1];
  const s0 = scaleAt(p0.y);
  const sE = scaleAt(pE.y);
  const restStart = (side: Side): P => ({ x: p0.x + stS.legs[side].A.x * s0, y: p0.y });
  const restEnd = (side: Side): P => ({ x: pE.x + stE.legs[side].A.x * sE, y: pE.y });

  // число шагов: первый короче (0.6), последний — 0.75, между ними — полные;
  // к камере шаг чуть короче (в кадре он и так виден сверху)
  const phi = (x: number) => 1 - DEPTH_STEP * Math.abs(unitDir(pl, x).z);
  let phiAvg = 0;
  for (let i = 0; i < 40; i++) phiAvg += phi(((i + 0.5) / 40) * D) / 40;
  const wts = (c: number) => (c === 1 ? [1] : c === 2 ? [0.6, 0.75] : [0.6, ...Array.from({ length: c - 2 }, () => 1), 0.75]);
  let m = 1;
  let best = Infinity;
  for (let c = 1; c <= 60; c++) {
    const sum = wts(c).reduce((acc0, v) => acc0 + v, 0);
    const err = Math.abs(Math.log(D / sum / (L * phiAvg)));
    if (err < best) {
      best = err;
      m = c;
    }
  }
  if (D < 1) m = 0;
  const w = m > 0 ? wts(m) : [];
  let sig: number[] = [0];
  for (let j = 0; j < m; j++) sig.push(sig[j] + (w[j] * D) / w.reduce((acc0, v) => acc0 + v, 0));
  for (let it = 0; it < 3 && m > 1; it++) {
    const ww = w.map((v, j) => v * phi((sig[j] + sig[j + 1]) / 2));
    const tot = ww.reduce((acc0, v) => acc0 + v, 0);
    const nx = [0];
    for (let j = 0; j < m; j++) nx.push(nx[j] + (ww[j] * D) / tot);
    sig = nx;
  }
  if (m > 0) sig[m] = D;

  const dir0 = unitDir(pl, 0);
  const A: Side = spec.firstFoot ?? (dir0.x < 0 ? "L" : "R");
  const B: Side = A === "L" ? "R" : "L";
  const sideOf = (j: number): Side => (j % 2 === 1 ? A : B); // j = 1…m — шаги, m+1 — приставной

  // корень: плавный разгон — ровный ход — торможение; касания стоп — по
  // положению корня (в двойной опоре он посередине между стопами)
  const kT = Math.sqrt(clamp(D / ((speed * (ACCEL + DECEL)) / 2), 0.2, 1));
  const aT = ACCEL * kT;
  const dT = DECEL * kT;
  const V = Math.min(speed, (2 * D) / (aT + dT));
  const root: Root = { t0, V, aT, dT, cruise: V > 1e-6 ? Math.max(0, (D - (V * (aT + dT)) / 2) / V) : 0, D };
  const tEnd = D > 0 ? t0 + aT + root.cruise + dT : t0;
  const inv = (x: number) => {
    let lo = t0;
    let hi = tEnd;
    for (let it = 0; it < 40; it++) {
      const mid = (lo + hi) / 2;
      if (rootSig(root, mid).v < x) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const land: number[] = [t0];
  const swing0: number[] = [t0];
  if (m > 0) {
    for (let j = 1; j <= m; j++) land.push(inv((sig[j - 1] + sig[j]) / 2));
    land.push(Math.max(land[m] + 0.45 * T, tEnd - 0.08));
    swing0.push(Math.max(t0 + PREP * T, land[1] - 0.8 * T));
    for (let j = 2; j <= m; j++) swing0.push(land[j] - SWING * (land[j] - land[j - 1]));
    swing0.push(land[m + 1] - 0.7 * (land[m + 1] - land[m]));
  }
  const tStop = m > 0 ? land[m + 1] : t0;
  // большой доворот на месте (например, через «лицом к зрителю») — дольше
  const turnEnd = Math.abs(yawEnd - yawForDir(unitDir(pl, D)));
  const t1 = Math.max(tStop, tEnd) + END_SETTLE + 0.3 * Math.max(0, turnEnd - 0.3) + (m > 0 ? 0 : 0.2);

  // будущее направление в точке пути → угол стопы при постановке
  const yawAtSig = (s: number) => yawForDir(unitDir(pl, s + 50));
  const falls: Record<Side, Fall[]> = { L: [], R: [] };
  for (const side of SIDES) {
    falls[side].push({ side, at: restStart(side), beta: betaStand(yawStart, side), swing0: -Infinity, land: -Infinity, lift: Infinity, heel: Infinity, kind: "start" });
  }
  for (let j = 1; j <= m + 1; j++) {
    const side = sideOf(j);
    const isEnd = j >= m;
    let at: P;
    if (isEnd) at = restEnd(side);
    else {
      const c = pathAt(pl, sig[j]);
      const d = unitDir(pl, sig[j]);
      const s = scaleAt(c.y);
      const sd = sgnSide(side);
      // идёт к камере по диагонали — стопы шире, ноги меньше перекрещиваются
      const sx = SEP_X * lk + Math.pow(Math.abs(d.z), 4) * Math.max(0, (Math.abs(d.x) * L) / 2 - SEP_X * lk);
      at = { x: c.x + sd * sx * s, y: c.y + sd * SEP_Z * lk * -d.x * k * s };
    }
    const rs = rootSig(root, land[j]).v;
    const beta = j === m + 1 ? betaStand(yawEnd, side) : betaWalk(yawAtSig(rs), side);
    falls[side].push({ side, at, beta, swing0: swing0[j], land: land[j], lift: Infinity, heel: Infinity, kind: isEnd ? "end" : "walk" });
  }
  // отрыв = начало следующего переноса; подъём пятки — перед отрывом
  for (const side of SIDES) {
    const fs = falls[side];
    for (let i = 0; i < fs.length - 1; i++) {
      const f = fs[i];
      f.lift = fs[i + 1].swing0;
      f.heel = f.kind === "start" ? Math.max(t0, f.lift - 0.22 * T) : Math.max(f.land + 0.2 * (f.lift - f.land), f.lift - 0.3 * T);
    }
  }

  // покачивание таза: ниже в двойной опоре, выше над опорной ногой
  const bobT = [t0];
  const bobV = [0];
  const swayT = [t0];
  const swayV = [0];
  if (m > 0) {
    bobT.push(swing0[1]);
    bobV.push(3 * lk);
    for (let j = 1; j <= m + 1; j++) {
      // середина переноса стопы j: опора — другая нога
      const mid = (swing0[j] + land[j]) / 2;
      swayT.push(mid);
      swayV.push(-sgnSide(sideOf(j)) * (j === m + 1 ? 0.5 : 1));
      if (j > 1 && j <= m) {
        bobT.push(mid);
        bobV.push(BOB_HIGH * lk);
      }
      if (j <= m) {
        // короткий шаг (первый, последний) — таз опускается меньше: ноги не
        // расставлены, и глубокий «присед» читался бы как согнутые колени
        bobT.push(land[j] + 0.25 * (swing0[j + 1] - land[j]));
        bobV.push(BOB_LOW * lk * Math.pow(clamp((sig[j] - sig[j - 1]) / L, 0, 1.1), 1.5));
      }
    }
    bobT.push(land[m + 1]);
    bobV.push(4 * lk);
  }
  bobT.push(t1);
  bobV.push(0);
  swayT.push(t1);
  swayV.push(0);

  return {
    look,
    t0,
    t1,
    tStop,
    k,
    speed,
    stepLen: L,
    T,
    pts,
    acc,
    D,
    root,
    bob: { t: bobT, v: bobV },
    sway: { t: swayT, v: swayV },
    falls,
    yawStart,
    yawEnd,
    turnS: 0.3 + 0.3 * Math.min(1, Math.abs(yawStart - yawForDir(unitDir(pl, 50)))),
    H0,
    ankleH,
    nSteps: m > 0 ? m + 1 : 0,
  };
};

// ---------- Состояние во времени ----------
const sigAt = (pl: WalkPlan, t: number) => rootSig(pl.root, t);
const rootAt = (pl: WalkPlan, t: number) => pathAt(pl, sigAt(pl, t).v);

const yawAt = (pl: WalkPlan, t: number) => {
  const ws = smooth((t - pl.t0) / pl.turnS);
  const e0 = pl.tStop - 0.2;
  const we = smooth((t - e0) / (pl.t1 - e0));
  const yw = yawForDir(unitDir(pl, sigAt(pl, t).v + 50));
  return lerp(lerp(pl.yawStart, yw, ws), pl.yawEnd, we);
};

// угол стопы, стоящей на точке f. Стоящая стопа доворачивается на пятке
// только всей подошвой на полу: на старте — до подъёма пятки (первую шагающую
// стопу разворачивает перенос), в конце — после приставного шага.
const betaPlanted = (pl: WalkPlan, f: Fall, t: number) => {
  if (f.kind === "start") {
    const dur = f.heel - pl.t0;
    if (dur < 0.25) return f.beta;
    const tt = Math.min(t, f.heel);
    return lerpAngle(f.beta, betaWalk(yawAt(pl, tt), f.side), smooth((tt - pl.t0) / dur));
  }
  if (f.kind === "end") {
    const p0 = Math.max(f.land, pl.tStop - 0.1);
    return lerpAngle(f.beta, betaStand(pl.yawEnd, f.side), smooth((t - p0) / Math.max(0.05, pl.t1 - p0)));
  }
  return f.beta;
};

type FootSt = {
  A: P; // лодыжка, локально (экран, ед.)
  z: number; // глубина точки пола под лодыжкой, ед.
  h: number; // высота лодыжки, ед.
  footA: number;
  footF: number;
  planted: boolean;
  contact: P; // мировая точка, которая не должна сдвигаться
  phase: "rest" | "strike" | "flat" | "heelUp" | "swing";
};

type Ctx = { R: P; s: number };

const plantedSt = (pl: WalkPlan, f: Fall, t: number, c: Ctx): FootSt => {
  const b = pl.look.body;
  const beta = betaPlanted(pl, f, t);
  const sb = pitchK(beta);
  const fF = footFOf(beta);
  const gl = { x: (f.at.x - c.R.x) / c.s, y: (f.at.y - c.R.y) / c.s };
  const z = gl.y / pl.k;
  let pitch = 0;
  if (f.kind !== "start" && t < f.land + 0.15 * pl.T) pitch = HEEL_ON * (1 - smooth((t - f.land) / (0.15 * pl.T)));
  if (t > f.heel) {
    // пятка поднимается, подушечка стопы стоит на месте
    pitch = -TOE_OFF * easeToe((t - f.heel) / Math.max(1e-6, f.lift - f.heel));
    const rH = rootAt(pl, f.heel);
    const sH = scaleAt(rH.y);
    const bH = betaPlanted(pl, f, f.heel);
    const lbH = b.foot * footFOf(bH) * BALL;
    const ball = { x: f.at.x + sH * dir(bH).x * lbH, y: f.at.y + sH * (dir(bH).y * lbH - pl.ankleH) };
    const fa = beta + sb * pitch;
    const lb = b.foot * fF * BALL;
    const A0 = { x: (ball.x - c.R.x) / c.s - dir(fa).x * lb, y: (ball.y - c.R.y) / c.s - dir(fa).y * lb };
    // стопа носком к зрителю: поворот рисунка пятку не поднимает — пятка идёт
    // вверх, носок стоит (иначе задняя нога «не достаёт» и таз проседает)
    const up = b.foot * BALL * Math.sin((-pitch * Math.PI) / 180) * clamp(1 - Math.abs(beta) / 45);
    if (up < 1e-3) return { A: A0, z, h: gl.y - A0.y, footA: fa, footF: fF, planted: true, contact: ball, phase: "heelUp" };
    const A = { x: A0.x, y: A0.y - up };
    const v = { x: A0.x + dir(fa).x * b.foot * fF - A.x, y: A0.y + dir(fa).y * b.foot * fF - A.y };
    return { A, z, h: gl.y - A.y, footA: angleOf(v), footF: Math.hypot(v.x, v.y) / b.foot, planted: true, contact: ball, phase: "heelUp" };
  }
  const A = { x: gl.x, y: gl.y - pl.ankleH };
  const phase = f.kind === "start" || f.kind === "end" ? (pitch > 0 ? "strike" : "rest") : pitch > 0 ? "strike" : "flat";
  return { A, z, h: pl.ankleH, footA: beta + sb * pitch, footF: fF, planted: true, contact: f.at, phase };
};

const footSt = (pl: WalkPlan, side: Side, t: number, c: Ctx): FootSt => {
  const fs = pl.falls[side];
  let i = 0;
  while (i + 1 < fs.length && t >= fs[i + 1].swing0) i++;
  const f1 = fs[i];
  if (t >= f1.land) return plantedSt(pl, f1, t, c);
  // перенос от fs[i-1] к f1
  const f0 = fs[i - 1];
  const u = (t - f1.swing0) / (f1.land - f1.swing0);
  const tl = f1.swing0;
  const rl = rootAt(pl, tl);
  const cl = { R: rl, s: scaleAt(rl.y) };
  const st0 = plantedSt(pl, f0, tl, cl);
  const aw0 = { x: rl.x + st0.A.x * cl.s, y: rl.y + st0.A.y * cl.s };
  // скорость лодыжки в момент отрыва (пятка поднимается вокруг подушечки):
  // перенос продолжает это движение, без остановки и рывка колена
  const eps = 0.004;
  const rb = rootAt(pl, tl - eps);
  const cb = { R: rb, s: scaleAt(rb.y) };
  const stb = plantedSt(pl, f0, tl - eps, cb);
  const Dsw = f1.land - f1.swing0;
  const dx = f1.at.x - aw0.x;
  const m0x = clamp(((aw0.x - (rb.x + stb.A.x * cb.s)) / eps) * Dsw, -Math.abs(dx) * 0.5 - 10, Math.abs(dx) * 2.5 + 10);
  const m0h = clamp(((st0.h - stb.h) / eps) * Dsw, 0, 120);
  const e = smooth(u);
  const ex = e + (dx !== 0 ? (m0x / dx) * h10(u) : 0);
  const g = { x: aw0.x + dx * ex, y: lerp(f0.at.y, f1.at.y, e) };
  // подъём — от длины переноса: мелкий приставной шаг почти не поднимает стопу
  const lift = LIFT * (pl.look.body.thigh + pl.look.body.shin) * clamp(unitLen(f0.at, f1.at, pl.k) / pl.stepLen, 0.3, 1);
  // высота: пятка, поднятая при отрыве, опускается только во второй половине
  // переноса (иначе нога в начале переноса снова выпрямляется)
  const h = lerp(st0.h, pl.ankleH, smooth((u - 0.25) / 0.75)) + lift * Math.sin(Math.PI * Math.pow(u, 0.8)) ** 2 + m0h * h10(u);
  const gl = { x: (g.x - c.R.x) / c.s, y: (g.y - c.R.y) / c.s };
  const b0 = betaPlanted(pl, f0, tl);
  const b1 = betaPlanted(pl, f1, f1.land);
  const beta = lerpAngle(b0, b1, e);
  const pitch = lerp(-TOE_OFF, HEEL_ON, e);
  // рисунок стопы — от позы отрыва (у стопы носком к зрителю она своя)
  const k0 = 1 - smooth(u / 0.35);
  const footA = lerpAngle(beta + pitchK(beta) * pitch, st0.footA, k0);
  return { A: { x: gl.x, y: gl.y - h }, z: gl.y / pl.k, h, footA, footF: lerp(footFOf(beta), st0.footF, k0), planted: false, contact: g, phase: "swing" };
};

// 2 звена в объёме: колено — вперёд по ходу; проекция (x, z, h) → (x, −h + k·z)
type V3 = { x: number; z: number; h: number };
const ik3 = (S: V3, T: V3, l1: number, l2: number, fwd: { x: number; z: number }) => {
  const v = { x: T.x - S.x, z: T.z - S.z, h: T.h - S.h };
  const d0 = Math.hypot(v.x, v.z, v.h);
  const d = clamp(d0, Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  const vh = { x: v.x / d0, z: v.z / d0, h: v.h / d0 };
  const dot = fwd.x * vh.x + fwd.z * vh.z;
  let n = { x: fwd.x - dot * vh.x, z: fwd.z - dot * vh.z, h: -dot * vh.h };
  const nl = Math.hypot(n.x, n.z, n.h);
  n = nl < 1e-6 ? { x: fwd.x, z: fwd.z, h: 0 } : { x: n.x / nl, z: n.z / nl, h: n.h / nl };
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const hgt = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  return { x: S.x + vh.x * a + n.x * hgt, z: S.z + vh.z * a + n.z * hgt, h: S.h + vh.h * a + n.h * hgt };
};

const legFrom = (look: Look, H: P, K: P, A: P, footA: number, footF: number): LegPose => ({
  a1: angleOf({ x: K.x - H.x, y: K.y - H.y }),
  a2: angleOf({ x: A.x - K.x, y: A.y - K.y }),
  f1: Math.hypot(K.x - H.x, K.y - H.y) / look.body.thigh,
  f2: Math.hypot(A.x - K.x, A.y - K.y) / look.body.shin,
  footA,
  footF,
});

export type WalkState = { root: P; scale: number; pose: Pose; dir: P; moving: boolean; done: boolean; t1: number; speed: number };

const restState = (pl: WalkPlan, end: boolean): WalkState => {
  const root = end ? pl.pts[pl.pts.length - 1] : pl.pts[0];
  const d = unitDir(pl, end ? pl.D : 0);
  const s = scaleAt(root.y);
  const wl = Math.hypot(d.x * s, d.z * s * pl.k);
  return { root, scale: s, pose: stand(pl.look, end ? pl.yawEnd : pl.yawStart), dir: { x: (d.x * s) / wl, y: (d.z * s * pl.k) / wl }, moving: false, done: end, t1: pl.t1, speed: 0 };
};

export const walkAt = (pl: WalkPlan, t: number): WalkState => {
  if (t <= pl.t0 || pl.nSteps === 0) {
    if (pl.nSteps === 0 && t > pl.t0) {
      const u = smooth((t - pl.t0) / (pl.t1 - pl.t0));
      const st = restState(pl, t >= pl.t1);
      return { ...st, pose: stand(pl.look, lerp(pl.yawStart, pl.yawEnd, u)) };
    }
    return restState(pl, false);
  }
  if (t >= pl.t1) return restState(pl, true);
  const look = pl.look;
  const b = look.body;
  const sg = sigAt(pl, t);
  const R = pathAt(pl, sg.v);
  const s = scaleAt(R.y);
  const c: Ctx = { R, s };
  const yaw = yawAt(pl, t);
  const base = stand(look, yaw);
  const d = unitDir(pl, sg.v);
  const vf = clamp(sg.dv / pl.speed, 0, 1.2);

  const feet = { L: footSt(pl, "L", t, c), R: footSt(pl, "R", t, c) };
  // таз: покачивание к опорной ноге и вверх-вниз; ноги должны доставать до стоп
  const sw = cosKnots(pl.sway, t);
  const latR = { x: d.z, z: -d.x };
  const sway = SWAY * ((b.thigh + b.shin) / LEG_REF);
  const swX = sw * sway * latR.x;
  const swZ = sw * sway * latR.z;
  const hw = b.hipW * 0.3 * (1 - 0.25 * Math.abs(yaw));
  const Lmax = b.thigh + b.shin - 0.05;
  let hMax = Infinity;
  for (const side of SIDES) {
    const F = feet[side];
    const hx = swX + sgnSide(side) * hw;
    const hor2 = (hx - F.A.x) ** 2 + (swZ - F.z) ** 2;
    hMax = Math.min(hMax, F.h + Math.sqrt(Math.max(0, Lmax * Lmax - hor2)));
  }
  // у стойки — ровно stand(): таз и колени плавно переходят в позу стойки
  const wR = Math.max(1 - smooth((t - pl.t0) / (PREP * pl.T * 0.7)), smooth((t - pl.tStop) / (pl.t1 - pl.tStop)));
  const hDes = lerp(pl.H0 - cosKnots(pl.bob, t), pl.H0, wR);
  const kk = 3;
  const dd = hMax - hDes;
  const h = hMax - kk * (dd / kk > 30 ? dd / kk : Math.log(1 + Math.exp(dd / kk)));
  const hx0 = lerp(swX, 0, wR);
  const hz0 = lerp(swZ, 0, wR);
  // у стойки таз ровно на высоте stand() — без скачка в t0 и t1
  const hip = { x: hx0, y: lerp(-h + pl.k * hz0, base.hip.y, wR) };

  // ноги: ИК к стопам; колено у стойки — как в stand()
  const rb = solveRig(look, base);
  const fwd = { x: d.x, z: d.z };
  const legs: Record<Side, LegPose> = { L: base.legL, R: base.legR };
  const near: Record<Side, number> = { L: 0, R: 0 };
  for (const side of SIDES) {
    const F = feet[side];
    const S3 = { x: hx0 + sgnSide(side) * hw, z: hz0, h: -hip.y + pl.k * hz0 };
    const T3 = { x: F.A.x, z: F.z, h: F.h };
    const K3 = ik3(S3, T3, b.thigh, b.shin, fwd);
    const H = { x: S3.x, y: hip.y };
    const Kst = { x: H.x + rb.legs[side].K.x - rb.legs[side].H.x, y: H.y + rb.legs[side].K.y - rb.legs[side].H.y };
    const K = lerpP({ x: K3.x, y: -K3.h + pl.k * K3.z }, Kst, wR);
    legs[side] = legFrom(look, H, K, F.A, F.footA, F.footF);
    // ближняя к зрителю (по развороту корпуса) нога — ближе на ширину таза:
    // при ходьбе вбок ноги не меняются местами на каждом шаге
    near[side] = K3.z + F.z + sgnSide(side) * -yaw * hw * 2.2;
  }
  const legL = legs.L;
  const legR = legs.R;
  const legOrder: Pose["legOrder"] = near.L > near.R + 2 ? "RL" : near.R > near.L + 2 ? "LR" : base.legOrder;

  // руки: встречный мах (рука против ноги). В развороте 3/4 мах «внутрь» (к
  // середине корпуса) короче: дальняя рука уходит назад за корпус, ближняя —
  // вперёд, и кисть не ложится на середину таза; локоть сгибается только по
  // ходу (больше — на махе вперёд) и назад не выгибается.
  const mv = Math.min(1, vf);
  const proj = (F: FootSt) => F.A.x * d.x + F.z * d.z;
  const legFwd = clamp((proj(feet.L) - proj(feet.R)) / pl.stepLen, -1, 1) * mv;
  const sx = Math.tanh(d.x / 0.1); // знак хода по экрану — плавно через ноль
  const ax = Math.abs(d.x) * mv;
  const amp = 4 * sx + 13 * d.x;
  const nearL = smooth((yaw + 0.15) / 0.3); // 1 — ближняя рука левая
  const arm = (a: ArmPose, side: Side, fw: number): ArmPose => {
    const n = side === "L" ? nearL : 1 - nearL;
    const d1 = fw * amp;
    const out = smooth((sgnSide(side) * d1) / 10 + 0.5); // 1 — мах наружу
    // внутрь: дальняя 0.3, ближняя 0.4; наружу: дальняя (вперёд) 0.75, ближняя 1
    const a1 = a.a1 + d1 * lerp(lerp(0.3, 0.4, n), lerp(0.75, 1, n), out);
    const flex = ax * (8 + 10 * Math.max(0, fw));
    return { ...a, a1, a2: a1 + (a.a2 - a.a1) * (1 - ax) + sx * flex };
  };
  const armL = arm(base.armL, "L", -legFwd);
  const armR = arm(base.armR, "R", legFwd);

  const headYaw = yawAt(pl, Math.min(t + 0.15, pl.t1));
  const wl = Math.hypot(d.x * s, d.z * s * pl.k);
  const pose: Pose = {
    ...base,
    hip,
    lean: 3 * d.x * Math.min(1, vf),
    legL,
    legR,
    legOrder,
    armL,
    armR,
    headYaw,
    headPitch: 0.04 * Math.min(1, vf),
    headTilt: -sw * 1.2,
  };
  return { root: R, scale: s, pose, dir: { x: (d.x * s) / wl, y: (d.z * s * pl.k) / wl }, moving: true, done: false, t1: pl.t1, speed: sg.dv };
};

// Отладка: мировые точки стоп (лодыжка, опорная точка) и фаза.
export const footWorld = (pl: WalkPlan, t: number) => {
  const tt = clamp(t, pl.t0 + 1e-6, pl.t1 - 1e-6);
  const sg = sigAt(pl, tt);
  const R = pathAt(pl, sg.v);
  const s = scaleAt(R.y);
  const out = {} as Record<Side, { ankle: P; contact: P; planted: boolean; phase: FootSt["phase"]; fall: number }>;
  for (const side of SIDES) {
    const F = footSt(pl, side, tt, { R, s });
    const fs = pl.falls[side];
    let i = 0;
    while (i + 1 < fs.length && tt >= fs[i + 1].swing0) i++;
    out[side] = { ankle: { x: R.x + F.A.x * s, y: R.y + F.A.y * s }, contact: F.contact, planted: F.planted, phase: F.phase, fall: i };
  }
  return out;
};

// ---------- Присаживание на колени ----------
// u = 0 — stand(look, yaw), u = 1 — kneel(look, yaw); вставание — u от 1 к 0.
// Ближнее колено опускается первым (таз — вниз, корпус — вперёд), дальняя
// стопа стоит на месте; затем дальняя нога отступает и опускается на колено,
// и в конце учитель садится на пятки. Корень неподвижен.
export const kneelBlend = (look: Look, yaw: number, u: number): Pose => {
  if (u <= 0) return stand(look, yaw);
  if (u >= 1) return kneel(look, yaw);
  const b = look.body;
  const s = sgn(yaw);
  const st = stand(look, yaw);
  const kn = kneel(look, yaw);
  const rs = solveRig(look, st);
  const rk = solveRig(look, kn);
  const nearS: Side = s > 0 ? "L" : "R";
  const farS: Side = s > 0 ? "R" : "L";
  const e1 = smooth(u / 0.45);
  const e2 = smooth((u - 0.35) / 0.4);
  const e3 = smooth((u - 0.66) / 0.34);
  const hw = b.hipW * 0.3 * (1 - 0.25 * Math.abs(yaw));
  // таз
  const yHalf = -(b.thigh + b.legW * 0.25);
  const yUp = -(b.thigh * 0.97 + b.legW * 0.1);
  const hipY = lerp(lerp(lerp(st.hip.y, yHalf, e1), yUp, e2), kn.hip.y, e3);
  const hipX = s * (6 * e1 * (1 - e2) + 4 * e2 * (1 - e3));
  const lean = lerp(lerp(lerp(0, s * 9, e1), s * 6, e2), kn.lean, e3);
  const H = (side: Side): P => ({ x: hipX + sgnSide(side) * hw, y: hipY });
  // ближняя нога: колено — вниз на своё место, стопа поворачивается на месте
  const nK0 = rs.legs[nearS].K;
  const nK1 = rk.legs[nearS].K;
  const nCtl = { x: (nK0.x + nK1.x) / 2 + s * 30, y: (nK0.y + nK1.y) / 2 - 20 };
  const q = (a: P, c: P, d: P, x: number) => ({ x: (1 - x) * (1 - x) * a.x + 2 * x * (1 - x) * c.x + x * x * d.x, y: (1 - x) * (1 - x) * a.y + 2 * x * (1 - x) * c.y + x * x * d.y });
  const nK = q(nK0, nCtl, nK1, e1);
  const ea = smooth(u / 0.72);
  const nA0 = rs.legs[nearS].A;
  const nA1 = rk.legs[nearS].A;
  const nA = { x: lerp(nA0.x, nA1.x, ea), y: lerp(nA0.y, nA1.y, ea) - 16 * Math.sin(Math.PI * ea) };
  const nLeg0 = nearS === "L" ? st.legL : st.legR;
  const nLeg1 = nearS === "L" ? kn.legL : kn.legR;
  const nFA = lerpAngle(nLeg0.footA, nLeg1.footA, smooth((u - 0.08) / 0.6));
  const nFF = lerp(nLeg0.footF, nLeg1.footF, smooth((u - 0.08) / 0.6));
  // дальняя нога: стопа на месте, колено вперёд-вверх; потом шаг назад и на колено
  const fK0 = rs.legs[farS].K;
  const fK1 = rk.legs[farS].K;
  const fKl = { x: s * (b.thigh * 0.5) + (farS === "L" ? -hw : hw) * 0.2, y: -b.thigh * 0.75 };
  const fK = lerpP(lerpP(fK0, fKl, e1), fK1, e2);
  const fA0 = rs.legs[farS].A;
  const fA1 = rk.legs[farS].A;
  const fA = { x: lerp(fA0.x, fA1.x, e2), y: lerp(fA0.y, fA1.y, e2) - 34 * Math.sin(Math.PI * e2) };
  const fLeg0 = farS === "L" ? st.legL : st.legR;
  const fLeg1 = farS === "L" ? kn.legL : kn.legR;
  const fFA = lerpAngle(fLeg0.footA, fLeg1.footA, e2);
  const fFF = lerp(fLeg0.footF, fLeg1.footF, e2);
  const nearLeg = legFrom(look, H(nearS), nK, nA, nFA, nFF);
  const farLeg = legFrom(look, H(farS), fK, fA, fFA, fFF);
  const pose: Pose = {
    ...st,
    hip: { x: hipX, y: hipY },
    lean,
    headYaw: yaw,
    headPitch: 0.16 * Math.sin(Math.PI * clamp(u / 0.8)),
    legL: nearS === "L" ? nearLeg : farLeg,
    legR: nearS === "L" ? farLeg : nearLeg,
    legsFront: e3 > 0.35,
    legOrder: s > 0 ? "RL" : "LR",
  };
  // руки: кисти от свободно висящих — к бёдрам (цели — от текущих плеч)
  const r = solveRig(look, pose);
  const ar = smooth((u - 0.15) / 0.85);
  const wristOff = (side: Side) => {
    const S0 = side === "L" ? rs.shoulderL : rs.shoulderR;
    const S1 = side === "L" ? rk.shoulderL : rk.shoulderR;
    const W0 = rs.arms[side].W;
    const tg = (side === "L" ? kn.armL : kn.armR).target ?? rk.arms[side].W;
    return lerpP({ x: W0.x - S0.x, y: W0.y - S0.y }, { x: tg.x - S1.x, y: tg.y - S1.y }, ar);
  };
  const armAt = (side: Side): ArmPose => {
    const S = side === "L" ? r.shoulderL : r.shoulderR;
    const o = wristOff(side);
    const a1 = side === "L" ? kn.armL : kn.armR;
    return { a1: 0, a2: 0, target: { x: S.x + o.x, y: S.y + o.y }, bend: sgnSide(side) * -1, hand: "relaxed", handRot: lerp(0, a1.handRot, ar) };
  };
  return { ...pose, armL: armAt("L"), armR: armAt("R") };
};

// Тень на полу при присаживании: Character меняет размер тени скачком
// (legsFront), поэтому на время перехода рисуйте её сами (shadow={false}):
// <ellipse cx={0} cy={0} rx ry fill="#5a3b2c" opacity={0.2} /> в осях корня.
export const kneelShadow = (look: Look, u: number) => {
  const b = look.body;
  const k = smooth((u - 0.3) / 0.7);
  return { rx: lerp(b.hipW * 0.8, b.thigh * 1.25, k), ry: lerp(b.hipW * 0.14, b.thigh * 0.22, k) };
};
