// Сцена 4 — дерево из волокон.
// Ствол — пучок из 24 коричневых грубых нитей, скрученных по спирали. На каждой развилке
// пучок делится: нити уходят в ветви, потом в веточки — структура растёт последовательно
// (ствол → ветви → веточки), а не масштабируется готовая модель. Листья «вышиты»
// 16 зелёными хлопковыми нитями, пришедшими с горных лугов: каждая нить идёт вдоль своей
// веточки и петлёй обводит лист за листом. Семечко — клубок первых шести волокон.
import { buildPath, Path, arcLengths } from "../engines/ThreadContinuityEngine";
import { smooth } from "../engines/TextileDynamicsEngine";
import { windOffset } from "../engines/TextileDynamicsEngine";
import { V3, add, clamp, cross, dot, easeInOutSine, lerp, norm, progress, rng, scale, smoother, sub } from "../utils/math";
import { groundY } from "./Scene03Mountains";

const DEG = Math.PI / 180;
export const TREE_X = -0.75, TREE_Z = 0.3;
export const TREE_G: V3 = [TREE_X, groundY(TREE_X, TREE_Z), TREE_Z];
export const BROWN_COUNT = 24;
export const LEAF_COUNT = 16;
export const ROOT_COUNT = 5;
const RT = 0.026; // радиус коричневой нити

// ---------- структура ветвей ----------
interface Branch {
  id: number;
  parent: number;
  tp: number; // точка отхода на родителе (0..1)
  P: [V3, V3, V3, V3]; // кубическая Безье
  len: number;
  level: number;
  children: number[];
  threads: number[]; // индексы коричневых нитей
  phase: number;
}

const bez = (P: [V3, V3, V3, V3], t: number): V3 => {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [
    a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0],
    a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1],
    a * P[0][2] + b * P[1][2] + c * P[2][2] + d * P[3][2],
  ];
};
const bezT = (P: [V3, V3, V3, V3], t: number): V3 => {
  const e = 1e-3;
  return norm(sub(bez(P, Math.min(1, t + e)), bez(P, Math.max(0, t - e))));
};
const dirOf = (az: number, tilt: number): V3 => [Math.sin(tilt) * Math.cos(az), Math.cos(tilt), Math.sin(tilt) * Math.sin(az)];

const branches: Branch[] = [];
const addBranch = (parent: number, tp: number, d: V3, len: number, level: number): number => {
  let start: V3, t0: V3;
  if (parent < 0) {
    start = add(TREE_G, [0, 0.01, 0]);
    t0 = [0, 1, 0];
  } else {
    const p = branches[parent];
    start = bez(p.P, tp);
    t0 = bezT(p.P, tp);
  }
  const end = add(start, scale(d, len));
  const P: [V3, V3, V3, V3] = [
    start,
    add(start, scale(norm(add(scale(t0, 0.6), scale(d, 0.4))), len * 0.38)),
    add(sub(end, scale(d, len * 0.3)), [0, len * 0.07, 0]),
    end,
  ];
  const id = branches.length;
  branches.push({ id, parent, tp, P, len, level, children: [], threads: [], phase: id * 1.7 });
  if (parent >= 0) branches[parent].children.push(id);
  return id;
};

// ствол с лёгким S-изгибом
const trunk = addBranch(-1, 0, norm([0.05, 1, -0.025]), 1.18, 0);
branches[trunk].P[1] = add(branches[trunk].P[0], [0.05, 0.4, 0.03]);
branches[trunk].P[2] = add(branches[trunk].P[3], [-0.06, -0.38, -0.02]);
const L1: [number, number, number, number][] = [
  // азимут, наклон, длина, точка отхода
  [25, 32, 0.86, 0.8],
  [150, 36, 0.8, 0.88],
  [262, 33, 0.84, 0.94],
  [80, 9, 0.7, 1.0],
];
for (const [az, tilt, len, tp] of L1) {
  const b1 = addBranch(trunk, tp, dirOf(az * DEG, tilt * DEG), len, 1);
  for (const s2 of [-1, 1]) {
    const az2 = az + s2 * 38;
    const tilt2 = tilt < 15 ? 30 : Math.min(62, tilt + 11);
    const b2 = addBranch(b1, s2 < 0 ? 0.72 : 1.0, dirOf(az2 * DEG, tilt2 * DEG), 0.5, 2);
    for (const s3 of [-1, 1]) {
      addBranch(b2, s3 < 0 ? 0.66 : 1.0, dirOf((az2 + s3 * 30) * DEG, Math.min(70, tilt2 + 9) * DEG), 0.3, 3);
    }
  }
}
export const TIPS = branches.filter((b) => b.children.length === 0).map((b) => b.id); // 16 веточек
const chainOf = (b: number): number[] => {
  const out: number[] = [];
  for (let c = b; c >= 0; c = branches[c].parent) out.unshift(c);
  return out;
};
// распределение коричневых нитей по веточкам
for (let k = 0; k < BROWN_COUNT; k++) for (const b of chainOf(TIPS[k % TIPS.length])) branches[b].threads.push(k);
// порядок нитей в каждой ветви: сгруппированы по дочерним ветвям (секторы без перехлёстов)
const orderIn = (b: number): number[] => {
  const br = branches[b];
  if (br.children.length === 0) return br.threads.slice();
  const ord: number[] = [];
  for (const c of br.children) ord.push(...orderIn(c));
  return ord;
};
const slotOf = new Map<string, { q: number; c: number }>();
for (const br of branches) {
  const ord = orderIn(br.id);
  ord.forEach((k, q) => slotOf.set(`${br.id}:${k}`, { q, c: ord.length }));
}

/** Радиус пучка ветви (растёт по мере присоединения волокон: ρ). */
const bundleR = (c: number) => RT * 1.38 * Math.sqrt(c);

const frameAt = (T: V3): [V3, V3] => {
  const ref: V3 = Math.abs(T[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const N = norm(cross(T, ref));
  return [N, cross(T, N)];
};

/** Точка нити k внутри ветви b при параметре t. ρ — «плотность» пучка (0.25 → 1). */
const threadPointIn = (b: number, k: number, t: number, rho: number, aGlobal: number): V3 => {
  const br = branches[b];
  const C = bez(br.P, t);
  const T = bezT(br.P, t);
  const [N, B] = frameAt(T);
  const { q, c } = slotOf.get(`${b}:${k}`)!;
  if (c === 1) return C;
  let rr = bundleR(c) * rho;
  let ang: number;
  if (c > 7) {
    const inner = Math.floor(c / 3);
    if (q < inner) { ang = (2 * Math.PI * (q + 0.5)) / inner; rr *= 0.42; } else { ang = (2 * Math.PI * (q - inner + 0.5)) / (c - inner); rr *= 0.86; }
  } else {
    ang = (2 * Math.PI * (q + 0.5)) / c;
    rr *= 0.62;
  }
  // корневой «наплыв» у земли
  if (b === trunk) rr *= 1 + 0.55 * (1 - smoother(clamp(t / 0.22)));
  ang += br.phase + (aGlobal * 2 * Math.PI) / 1.5; // спиральная скрутка пучка
  return add(C, add(scale(N, Math.cos(ang) * rr), scale(B, Math.sin(ang) * rr)));
};

// ---------- семечко ----------
export const SEED_C: V3 = add(TREE_G, [0, 0.055, 0]);
const SEED_R: V3 = [0.078, 0.056, 0.06];
const seedPoint = (k: number, u: number): V3 => {
  const th = u * 2 * Math.PI * 2.3 + k * 1.1;
  const tilt = (k * 31 + 15) * DEG;
  let p: V3 = [Math.cos(th), 0, Math.sin(th)];
  p = [p[0], p[1] * Math.cos(tilt) - p[2] * Math.sin(tilt), p[1] * Math.sin(tilt) + p[2] * Math.cos(tilt)];
  const yaw = k * 0.55;
  p = [p[0] * Math.cos(yaw) - p[2] * Math.sin(yaw), p[1], p[0] * Math.sin(yaw) + p[2] * Math.cos(yaw)];
  return [SEED_C[0] + p[0] * SEED_R[0], SEED_C[1] + p[1] * SEED_R[1], SEED_C[2] + p[2] * SEED_R[2]];
};

/** Длина «префикса» (клубок семечка / подход от земли) в точках. */
const PREFIX_N = 44;

/** Центральная линия коричневой нити k при плотности пучка rho (без учёта роста). */
export const brownPath = (k: number, rho: number, f: number): Path => {
  const chain = chainOf(TIPS[k % TIPS.length]);
  const pts: V3[] = [];
  if (k < 6) {
    for (let i = 0; i < PREFIX_N; i++) pts.push(seedPoint(k, i / (PREFIX_N - 1)));
  } else {
    const a0 = ((k - 6) / (BROWN_COUNT - 6)) * 2 * Math.PI * 1.7;
    for (let i = 0; i < PREFIX_N; i++) {
      const u = i / (PREFIX_N - 1);
      const r = lerp(0.36 + 0.03 * (k % 3), 0.17, smoother(u));
      const a = a0 + u * 1.3;
      const x = TREE_X + Math.cos(a) * r, z = TREE_Z + Math.sin(a) * r;
      pts.push([x, groundY(x, z) + 0.02 + 0.13 * u * u, z]);
    }
  }
  let aG = 0;
  for (let ci = 0; ci < chain.length; ci++) {
    const b = chain[ci];
    const next = chain[ci + 1];
    const tEnd = next !== undefined ? branches[next].tp : 1;
    let tStart = ci === 0 ? (k < 6 ? 0.0 : 0.1) : 0;
    const br = branches[b];
    const n = Math.max(6, Math.round(((tEnd - tStart) * br.len) * 46));
    for (let i = ci === 0 ? 0 : 1; i <= n; i++) {
      const t = tStart + ((tEnd - tStart) * i) / n;
      pts.push(threadPointIn(b, k, t, rho, aG + (t - tStart) * br.len));
    }
    aG += (tEnd - tStart) * br.len;
    tStart = 0;
  }
  // лёгкий ветер в кроне: смещение растёт с высотой
  const out = buildPath(pts.length, (_s, i) => {
    const p = pts[i];
    const w = clamp((p[1] - TREE_G[1] - 1.0) / 1.5);
    const o = windOffset(p[0], p[1], p[2], f, w, 0.025);
    return add(p, o);
  });
  return smooth(out, 5, 0.5);
};

export const brownRadii = (n: number, prefixFrac: number): Float32Array => {
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1);
    r[i] = s < prefixFrac ? 0.9 : lerp(1.0, 0.5, Math.pow((s - prefixFrac) / (1 - prefixFrac), 1.3));
  }
  return r;
};
export const BROWN_RADIUS = RT;
export const PREFIX_FRAC_N = PREFIX_N;

/** Плотность пучка: росток из трёх волокон → толстый ствол. */
export const bundleRho = (f: number) => lerp(0.22, 1, smoother(progress(f, 835, 910)));

/**
 * Выросшая длина нити k (в долях от полной), по кадру. Префикс — клубок семечка
 * или подход к стволу; потом рост ствола, ветвей, веточек.
 */
export const brownGrowth = (k: number, f: number, prefixFrac: number, total: number): number => {
  if (k < 6) {
    const seed = smoother(progress(f, 722 + k * 5, 760 + k * 5)) * prefixFrac;
    if (f < 790) return seed;
    // росток — первые три волокна поднимаются стеблем
    const sprout = k < 3 ? (0.5 / total) * easeInOutSine(progress(f, 790, 845)) : 0;
    const tree = (1 - prefixFrac) * easeInOutSine(progress(f, 845 + (k % 3) * 4, 990));
    return prefixFrac + Math.max(sprout, tree);
  }
  const join = smoother(progress(f, 820 + (k - 6) * 2.2, 860 + (k - 6) * 2.2)) * prefixFrac;
  const tree = (1 - prefixFrac) * easeInOutSine(progress(f, 850 + (k - 6) * 1.5, 992));
  return f < 850 ? join : prefixFrac + tree;
};

// ---------- корни ----------
export const rootPath = (r: number): Path => {
  const R = rng(900 + r);
  const a0 = (r / ROOT_COUNT) * 2 * Math.PI + R() * 0.6;
  const L = 0.42 + R() * 0.2;
  return buildPath(60, (s) => {
    const a = a0 + Math.sin(s * 5 + r) * 0.25;
    const d = 0.03 + s * L;
    const x = SEED_C[0] + Math.cos(a) * d, z = SEED_C[2] + Math.sin(a) * d;
    return [x, groundY(x, z) + 0.02 - 0.02 * Math.sin(s * Math.PI), z];
  });
};

// ---------- листья ----------
interface LeafRoute { pts: V3[] }
const leafLoop = (P: V3, d: V3, w: V3, up: V3, Lf: number, W: number, f: number, seed: number, out: V3[]) => {
  const N = 26;
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i <= N; i++) {
      const u = side === 0 ? i / N : 1 - i / N;
      const sgn = side === 0 ? 1 : -1;
      const wp = W * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), 0.8) * (1 - 0.3 * u);
      let p = add(P, add(scale(d, Lf * u), scale(w, wp * sgn)));
      p = add(p, scale(up, -0.18 * Lf * u * u));
      const o = windOffset(P[0] + seed, P[1], P[2], f, u, 0.022);
      out.push(add(p, o));
    }
  }
};

/** Путь листовой нити m в кроне: вдоль веточки, вышивая лист за листом. */
export const leafCrownPath = (m: number, f: number): Path => {
  const tip = TIPS[m];
  const chain = chainOf(tip);
  const b3 = chain[chain.length - 1], b2 = chain[chain.length - 2];
  const R = rng(4242 + m * 7);
  const route: { b: number; t0: number; t1: number }[] = [
    { b: b2, t0: 0.15, t1: branches[b3].tp },
    { b: b3, t0: 0, t1: 1 },
  ];
  const pts: V3[] = [];
  let phyllo = R() * 6.28;
  let acc = 0;
  let nextLeaf = 0.12;
  for (const seg of route) {
    const br = branches[seg.b];
    const n = Math.max(4, Math.round((seg.t1 - seg.t0) * br.len * 60));
    for (let i = 0; i <= n; i++) {
      const t = seg.t0 + ((seg.t1 - seg.t0) * i) / n;
      const C = bez(br.P, t);
      const T = bezT(br.P, t);
      const [N, B] = frameAt(T);
      const surf = add(C, scale(add(scale(N, Math.cos(phyllo)), scale(B, Math.sin(phyllo))), 0.02));
      const wobble = windOffset(C[0], C[1], C[2], f, 0.5, 0.012);
      pts.push(add(surf, wobble));
      if (i > 0) acc += br.len * ((seg.t1 - seg.t0) / n);
      const atTip = seg.b === b3 && i === n;
      if (acc >= nextLeaf || atTip) {
        const cluster = atTip ? 3 : 1;
        for (let c = 0; c < cluster; c++) {
          phyllo += 137.5 * DEG;
          const out = norm(add(scale(N, Math.cos(phyllo)), scale(B, Math.sin(phyllo))));
          const d = norm(add(add(scale(out, 0.78), scale(T, atTip ? 0.75 : 0.42)), [0, 0.22, 0]));
          const w = norm(cross(d, [0, 1, 0.2]));
          const up = norm(cross(w, d));
          const Lf = 0.19 + R() * 0.06;
          const P0 = pts[pts.length - 1];
          leafLoop(P0, d, w, dot(up, [0, 1, 0]) < 0 ? scale(up, -1) : up, Lf, Lf * 0.42, f, m * 3.1 + c, pts);
          pts.push(P0);
        }
        nextLeaf = acc + 0.058 + R() * 0.018;
      }
    }
  }
  return buildPath(pts.length, (_s, i) => pts[i]);
};

/** «Гнездо»: зелёные нити с лугов кружат вокруг места будущего дерева. */
export const nestPath = (m: number, f: number): Path => {
  const turns = 2.4;
  const r0 = 0.44 + 0.012 * m;
  const spin = f * 0.012 + m * 0.4;
  return buildPath(160, (s) => {
    const a = spin + s * turns * 2 * Math.PI;
    const r = r0 + 0.03 * Math.sin(s * 9 + m);
    const x = TREE_X + Math.cos(a) * r, z = TREE_Z + Math.sin(a) * r;
    return [x, TREE_G[1] + 0.5 + 0.014 * m + 0.04 * Math.sin(a * 0.5 + m) + s * 0.03, z];
  });
};

/** Семядоли: две первые листовые нити поднимаются по ростку и раскрывают листочки. */
export const cotyledonPath = (m: number, f: number): Path => {
  const nest = nestPath(m, f);
  const nn = nest.length / 3;
  const keep = Math.floor(nn * 0.62);
  const pts: V3[] = [];
  for (let i = 0; i < keep; i++) pts.push([nest[i * 3], nest[i * 3 + 1], nest[i * 3 + 2]]);
  const top = add(TREE_G, [0, 0.06 + 0.4, 0]);
  const last = pts[pts.length - 1];
  for (let i = 1; i <= 20; i++) {
    const u = i / 20;
    pts.push(add(scale(last, 1 - u), scale(add(top, [0, -0.25 * (1 - u), 0]), u)));
  }
  const side = m === 0 ? 1 : -1;
  const d = norm([side * 0.9, 0.45, 0.25]);
  const w = norm(cross(d, [0, 0, 1]));
  leafLoop(top, d, w, [0, 1, 0], 0.11, 0.055, f, m, pts);
  return buildPath(pts.length, (_s, i) => pts[i]);
};

export const branchList = () => branches;
export const lengthOf = (p: Path) => {
  const L = arcLengths(p);
  return L[L.length - 1];
};
