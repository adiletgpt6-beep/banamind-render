// ThreadsOfWonderEngine — оркестратор фильма.
// Для любого кадра f (без зависимости от предыдущих кадров) собирает состояние всех нитей:
// хореография каждой нити — цепочка форм через сцены (ThreadContinuityEngine), переплетение
// (ThreadWeavingEngine), изгиб полотна в сферу (WovenSculptureEngine), расплетение
// (ThreadUnravelEngine), динамика (TextileDynamicsEngine), камера и свет.
import type { FrameState, ThreadDraw } from "./types";
import { COL } from "./palette";
import { Path, buildColors, morph, resample, evalChain, ThreadKey } from "./ThreadContinuityEngine";
import { unravelStart, UNRAVEL } from "./ThreadUnravelEngine";
import { cameraAt } from "./ThreadCameraController";
import { lightAt } from "./ThreadLightingSystem";
import { CAMERA_KEYS } from "../scenes/cameraPath";
import { V3, clamp, easeInOutSine, easeOutCubic, lerp, mix3, norm, progress, smoother, smoothstep, sub } from "../utils/math";
import {
  EARTH, EARTH2, EarthSpec, CLOUDS, capShape, cloudShape, earthTransform, merColors, merLon, merShape, merWindow,
  ringColors, ringLat, ringShape, ringWindow, spinAngle, tiltAngle,
} from "../scenes/Scene02Earth";
import {
  MCLOUDS, MEADOW_COUNT, TERRAIN, animatedH, colColors, colShape, mCloudShape, meadowShape, riverShape, rowColors,
  rowShape, snowCapShape, terrainH,
} from "../scenes/Scene03Mountains";
import {
  BROWN_COUNT, BROWN_RADIUS, LEAF_COUNT, PREFIX_FRAC_N, ROOT_COUNT, TIPS, branchList, brownGrowth, brownPath, brownRadii,
  bundleRho, cotyledonPath, leafCrownPath, lengthOf, nestPath, rootPath,
} from "../scenes/Scene04Tree";
import {
  FRAME_LOOPS, SKY, STARS, frameLoopPath, frameZigzagPath, skyColPath, skyRowColor, skyRowPath, skyStreamPath, starStrokePath,
} from "../scenes/Scene05Tapestry";
import {
  HERO_N, HERO_W, SUN2, equatorShape, freeLoopShape, heroFinalPath, heroRadius, sunSpiral,
} from "../scenes/Scene01FirstThread";

// ---------- кэш статичных форм ----------
const cache = new Map<string, Float32Array>();
const cached = (key: string, fn: () => Float32Array) => {
  let v = cache.get(key);
  if (!v) { v = fn(); cache.set(key, v); }
  return v;
};

// ---------- общие тайминги ----------
/** Изгиб полотна в сферу (WovenSculpture). */
export const bendK = (f: number) => smoother(progress(f, 165, 226));
/** Радиус области переплетения (угловой), из которой «прорастает» Земля. */
export const regionR = (f: number) =>
  f < 165 ? lerp(0, 0.36, easeOutCubic(progress(f, 58, 165))) : lerp(0.36, 3.55, easeInOutSine(progress(f, 165, 234)));
const colorWave = (f: number) => lerp(0, 3.7, smoother(progress(f, 168, 238)));
/** Рост гор: плоское волнистое полотно → хребты. */
export const mountainRise = (f: number) => smoother(progress(f, 500, 598));

// ---------- первое переплетение: расписание нитей сцены 1 ----------
type Sched = { start: number; dir: 1 | -1; color: V3 };
const RING_SCHED: Record<number, Sched> = {
  16: { start: 98, dir: 1, color: COL.milk },
  18: { start: 104, dir: -1, color: COL.silver },
  15: { start: 118, dir: 1, color: COL.sky },
  19: { start: 124, dir: -1, color: COL.milk },
  14: { start: 138, dir: 1, color: COL.silver },
  20: { start: 144, dir: -1, color: COL.turquoise },
  13: { start: 154, dir: 1, color: COL.milk },
  21: { start: 158, dir: -1, color: COL.sky },
};
const MER_SCHED: Record<number, Sched> = {
  24: { start: 68, dir: -1, color: COL.turquoise },
  23: { start: 80, dir: 1, color: COL.sky },
  25: { start: 106, dir: -1, color: COL.emerald },
  22: { start: 112, dir: 1, color: COL.turquoise },
  26: { start: 126, dir: -1, color: COL.sky },
  21: { start: 132, dir: 1, color: COL.emerald },
  27: { start: 146, dir: -1, color: COL.turquoise },
  20: { start: 150, dir: 1, color: COL.sky },
};
const GROW = 26;

const growWindow = (w: number, g: number, dir: 1 | -1): [number, number] => {
  const lo = 0.5 - w, hi = 0.5 + w;
  if (g >= 1) return [lo, hi];
  return dir === 1 ? [lo, lo + (hi - lo) * g] : [hi - (hi - lo) * g, hi];
};

/** Цвета нити сцены 1: декоративный цвет уступает земному «волной» от центра. */
const decorMix = (base: Float32Array, decor: V3, f: number, lonLat: (s: number) => [number, number]) => {
  const n = base.length / 3;
  const cw = colorWave(f);
  if (cw <= 0) return buildColors(n, () => decor);
  return buildColors(n, (s, i) => {
    const [lo, la] = lonLat(s);
    const w = 1 - smoothstep(cw - 0.45, cw, Math.hypot(lo, la));
    return mix3(decor, [base[i * 3], base[i * 3 + 1], base[i * 3 + 2]], w);
  });
};

const N_RING = 200, N_MER = 130;

// ---------- Земля → горы ----------
const earthThreads = (f: number, out: ThreadDraw[]) => {
  const e = EARTH;
  if (f < 60) return;
  const k = bendK(f);
  const xf = earthTransform(e, spinAngle(f), tiltAngle(f));
  const r = regionR(f);
  const hs = mountainRise(f);
  const staticTerrain = hs >= 1;
  const H = staticTerrain ? terrainH : animatedH(hs, f);
  const closedNow = k >= 0.9995 && r > 3.4;

  for (let i = 0; i < e.NR; i++) {
    const sched = RING_SCHED[i];
    const ts = unravelStart.ring(i);
    const base = cached(`rc${i}`, () => ringColors(e, i, N_RING));
    const lat = ringLat(e, i);
    // экватор занят золотой нитью до её ухода к Солнцу
    let g = 1;
    if (i === 17) g = smoother(progress(f, 212, 262));
    else if (sched) g = f >= 165 ? 1 : smoother(progress(f, sched.start, sched.start + GROW));
    else if (f < 165) g = 0;
    if (g <= 0) continue;
    const earthKey: ThreadKey = {
      at: 0,
      shape: () => ringShape(e, i, k, xf, closedNow),
      colors: (ff) => (sched ? decorMix(base, sched.color, ff, (s) => [-Math.PI + s * 2 * Math.PI, lat]) : base),
    };
    const rowKey: ThreadKey = {
      at: ts,
      shape: () => (staticTerrain ? cached(`row${i}`, () => rowShape(i, terrainH)) : rowShape(i, H)),
      colors: () => cached(`rowc${i}`, () => rowColors(i, N_RING)),
      morph: { dur: UNRAVEL.dur, spread: UNRAVEL.spread, lift: UNRAVEL.liftRing, liftDir: (x, y, z) => norm([x, y, z]) },
    };
    const res = evalChain(f, [earthKey, rowKey], N_RING);
    const inEarth = res.stage === 0;
    let s0 = 0, s1 = 1;
    if (inEarth) {
      const w = ringWindow(e, i, r);
      if (w <= 0) continue;
      [s0, s1] = growWindow(w, g, sched?.dir ?? 1);
    }
    out.push({
      id: `ring-${i}`, pts: res.pts, cols: res.cols, radius: e.thread, mat: "silk",
      closed: inEarth && closedNow && s1 - s0 >= 0.999, s0, s1, radial: f < 175 ? 12 : 8, segK: f < 175 ? 0.9 : 1.7,
    });
  }

  for (let j = 0; j < e.NM; j++) {
    const sched = MER_SCHED[j];
    const ts = unravelStart.mer(j);
    const base = cached(`mc${j}`, () => merColors(e, j, N_MER));
    const lon = merLon(e, j);
    let g = 1;
    if (sched) g = f >= 165 ? 1 : smoother(progress(f, sched.start, sched.start + GROW));
    else if (f < 165) g = 0;
    if (g <= 0) continue;
    const earthKey: ThreadKey = {
      at: 0,
      shape: () => merShape(e, j, k, xf),
      colors: (ff) => (sched ? decorMix(base, sched.color, ff, (s) => [lon, (s - 0.5) * 2 * 1.45]) : base),
    };
    const colKey: ThreadKey = {
      at: ts,
      shape: () => (staticTerrain ? cached(`col${j}`, () => colShape(j, terrainH)) : colShape(j, H)),
      colors: () => cached(`colc${j}`, () => colColors(j, N_MER)),
      morph: { dur: UNRAVEL.dur, spread: UNRAVEL.spread, reverse: true, lift: UNRAVEL.liftMer, liftDir: (x, y, z) => norm([x, y, z]) },
    };
    const res = evalChain(f, [earthKey, colKey], N_MER);
    let s0 = 0, s1 = 1;
    if (res.stage === 0) {
      const w = merWindow(e, j, r);
      if (w <= 0) continue;
      [s0, s1] = growWindow(w, g, sched?.dir ?? 1);
    }
    out.push({ id: `mer-${j}`, pts: res.pts, cols: res.cols, radius: e.thread, mat: "cotton", s0, s1, radial: f < 175 ? 12 : 8, segK: f < 175 ? 0.9 : 1.7 });
  }

  // полярные шапки → снег на вершинах
  if (r > 1.25) {
    for (let c = 0; c < 2; c++) {
      const north = c === 0;
      const g = smoother(clamp((r - 1.25) / 0.6));
      const keys: ThreadKey[] = [
        { at: 0, shape: () => capShape(e, north, xf) },
        {
          at: unravelStart.cap(c),
          shape: () => (staticTerrain ? cached(`snow${c}`, () => snowCapShape(c, terrainH)) : snowCapShape(c, H)),
          morph: { dur: 50, spread: 30, reverse: true, lift: 0.6, liftDir: (x, y, z) => norm([x, y, z]) },
        },
      ];
      const res = evalChain(f, keys, 220);
      out.push({ id: `cap-${c}`, pts: res.pts, color: COL.milk, radius: 0.026, mat: "wool", s0: res.stage === 0 ? 1 - g : 0, s1: 1, radial: 8 });
    }
  }

  // облака Земли → облака в горах
  for (let c = 0; c < CLOUDS.length; c++) {
    const g = smoother(progress(f, 226 + c * 6, 286 + c * 6));
    if (g <= 0) continue;
    const keys: ThreadKey[] = [
      { at: 0, shape: (ff) => cloudShape(e, CLOUDS[c], xf, 0.0009 * (ff - 226)) },
      { at: unravelStart.cloud(c), shape: (ff) => mCloudShape(c, ff), morph: { dur: 55, spread: 25, lift: 0.5, liftDir: [0, 1, 0.3] } },
    ];
    const res = evalChain(f, keys, 200);
    const w = res.stage === 0 ? g : 1;
    out.push({ id: `cloud-${c}`, pts: res.pts, color: COL.milk, radius: 0.021, mat: "wool", s0: 0.5 - 0.5 * w, s1: 0.5 + 0.5 * w, radial: 8 });
  }
};

// ---------- золотая нить ----------
const heroThread = (f: number, out: ThreadDraw[]) => {
  let pts: Path;
  let s0: number, s1: number;
  if (f < 1640) {
    const k = bendK(f);
    const xf = earthTransform(EARTH, spinAngle(f), tiltAngle(f));
    if (f < 205) {
      const eq = equatorShape(k, xf);
      const free = freeLoopShape(f, eq);
      const r = f < 60 ? { pts: free } : morph(f, free, eq, { start: 60, dur: 34, spread: 30, lift: 0.025, liftDir: [0, 0, 1] });
      pts = resample(r.pts, HERO_N);
      // нить появляется в центре кадра и вытягивается в обе стороны, закладывая петлю
      const g = smoother(progress(f, 2, 64));
      s0 = 0.5 - HERO_W * (0.04 + 0.96 * g);
      s1 = 0.5 + HERO_W * (0.04 + 0.96 * g);
    } else {
      const sun = sunSpiral(f);
      if (f < 300) {
        const eq = resample(equatorShape(k, xf), HERO_N);
        pts = morph(f, eq, sun, { start: 205, dur: 42, spread: 46, lift: 0.45, liftDir: [-0.2, 0.45, 0.85] }).pts;
      } else pts = sun;
      const w = smoother(progress(f, 205, 285));
      s0 = lerp(0.5 - HERO_W, 0, w);
      s1 = lerp(0.5 + HERO_W, 1, w);
    }
  } else {
    const fin = heroFinalPath(f);
    pts = fin.pts;
    s0 = 0;
    s1 = fin.sunFrac + (1 - fin.sunFrac) * easeInOutSine(progress(f, 1646, 1748));
  }
  const glow = smoother(progress(f, 236, 300)) * (1 - 0.45 * smoother(progress(f, 1640, 1720)));
  out.push({
    id: "hero-gold", pts, color: COL.gold, radius: heroRadius(f), mat: "gold", s0, s1, glow,
    radial: f < 150 ? 22 : 12, segK: f < 150 ? 0.5 : 1.2,
  });
};

// ---------- горы: река и луга; луга → листья ----------
const valleyThreads = (f: number, out: ThreadDraw[]) => {
  for (let k = 0; k < 3; k++) {
    const g = smoother(progress(f, 572 + k * 6, 650 + k * 6));
    if (g <= 0) continue;
    out.push({ id: `river-${k}`, pts: cached(`river${k}`, () => riverShape(k)), color: k === 1 ? COL.sky : COL.river, radius: 0.02, mat: "silk", s0: 0, s1: g, radial: 8 });
  }
  for (let m = 0; m < MEADOW_COUNT; m++) {
    const g = smoother(progress(f, 592 + m * 2.5, 640 + m * 2.5));
    if (g <= 0) continue;
    const meadow = cached(`meadow${m}`, () => meadowShape(m));
    const keys: ThreadKey[] = [
      { at: 0, shape: () => meadow },
      { at: 668 + m * 2.2, shape: (ff) => nestPath(m, ff), morph: { dur: 42, spread: 22, lift: 0.45, liftDir: [0, 1, 0] } },
    ];
    if (m < 2) keys.push({ at: 800 + m * 6, shape: (ff) => cotyledonPath(m, ff), morph: { dur: 34, spread: 20, reverse: true, lift: 0.12, liftDir: [0, 1, 0] } });
    keys.push({ at: 900 + m * 2.4, shape: (ff) => leafCrownPath(m, ff), morph: { dur: 32, spread: 30, lift: 0.28, liftDir: [0, 1, 0] } });
    const n = 420;
    const res = evalChain(f, keys, n);
    out.push({
      id: `leaf-${m}`, pts: res.pts, color: m % 3 === 0 ? COL.emeraldLight : m % 3 === 1 ? COL.emerald : mix3(COL.emerald, COL.emeraldLight, 0.5),
      radius: 0.0125, mat: "cotton", s0: res.stage === 0 ? 0 : 0, s1: res.stage === 0 ? g : 1, radial: 7, segK: 1.6,
    });
  }
};

// ---------- дерево ----------
const brownMeta: { total: number; prefixFrac: number }[] = [];
const treeThreads = (f: number, out: ThreadDraw[]) => {
  if (f < 720) return;
  const rho = bundleRho(f);
  for (let k = 0; k < BROWN_COUNT; k++) {
    if (!brownMeta[k]) {
      const p = brownPath(k, 1, 900);
      const n = p.length / 3;
      // доля префикса по длине
      const pre = resample(p, n); // форма та же
      let lp = 0;
      for (let i = 1; i < PREFIX_FRAC_N; i++) lp += Math.hypot(pre[i * 3] - pre[i * 3 - 3], pre[i * 3 + 1] - pre[i * 3 - 2], pre[i * 3 + 2] - pre[i * 3 - 1]);
      const total = lengthOf(p);
      brownMeta[k] = { total, prefixFrac: lp / total };
    }
    const { prefixFrac, total } = brownMeta[k];
    const g = brownGrowth(k, f, prefixFrac, total);
    if (g <= 0) continue;
    const pts = brownPath(k, rho, f);
    const n = pts.length / 3;
    out.push({
      id: `brown-${k}`, pts, color: k % 3 === 0 ? COL.brownDeep : k % 3 === 1 ? COL.brown : COL.brownLight,
      radii: cached(`brr${k}-${n}`, () => brownRadii(n, prefixFrac)), radius: BROWN_RADIUS, mat: "coarse", s0: 0, s1: g, radial: 9, segK: 1.3,
    });
  }
  for (let r = 0; r < ROOT_COUNT; r++) {
    const g = smoother(progress(f, 762 + r * 5, 815 + r * 5));
    if (g <= 0) continue;
    out.push({ id: `root-${r}`, pts: cached(`root${r}`, () => rootPath(r)), color: COL.brownDeep, radius: 0.017, mat: "coarse", s0: 0, s1: g, radial: 8 });
  }
};

// ---------- небо, звёзды, Земля в гобелене, рама ----------
const topTips = (() => {
  const br = branchList();
  return TIPS.map((id) => ({ id, p: br[id].P[3] })).sort((a, b) => b.p[1] - a.p[1]).slice(0, 8).map((t) => t.p);
})();

const skyThreads = (f: number, out: ThreadDraw[]) => {
  if (f < 1030) return;
  for (let m = 0; m < SKY.rows; m++) {
    const start = 1032 + ((m * 7) % SKY.rows) * 1.6;
    const g = smoother(progress(f, start, start + 64));
    if (g <= 0) continue;
    const fromLeft = m % 2 === 0;
    const tip = topTips[m % topTips.length];
    const stream = cached(`sky-stream${m}`, () => resample(skyStreamPath(m, tip, fromLeft), 260));
    const row = cached(`sky-row${m}`, () => resample(skyRowPath(m, fromLeft), 260));
    const tStart = 1112 + ((m * 7) % SKY.rows) * 0.9;
    const pts = f < tStart ? stream : morph(f, stream, row, { start: tStart, dur: 34, spread: 28, lift: 0.0 }).pts;
    out.push({ id: `sky-row-${m}`, pts, color: skyRowColor(m), radius: SKY.r, mat: "silk", s0: 0, s1: g, radial: 7, segK: 2 });
  }
  for (let j = 0; j < SKY.cols; j++) {
    const g = smoother(progress(f, 1092 + j * 1.5, 1150 + j * 1.5));
    if (g <= 0) continue;
    out.push({ id: `sky-col-${j}`, pts: cached(`sky-col${j}`, () => skyColPath(j)), color: j % 2 ? COL.skyThread : COL.skyThreadDeep, radius: SKY.r * 0.9, mat: "cotton", s0: 0, s1: g, radial: 7, segK: 2 });
  }
  STARS.forEach((st, si) => {
    for (let k = 0; k < 4; k++) {
      const g = smoother(progress(f, 1124 + si * 3 + k * 2, 1142 + si * 3 + k * 2));
      if (g <= 0) continue;
      out.push({ id: `star-${si}-${k}`, pts: cached(`star${si}-${k}`, () => starStrokePath(st, k)), color: COL.silver, radius: 0.024, mat: "silver", s0: 0.5 - 0.5 * g, s1: 0.5 + 0.5 * g, radial: 8, segK: 1.4 });
    }
  });
};

const earth2Threads = (f: number, out: ThreadDraw[]) => {
  if (f < 1150) return;
  const e: EarthSpec = EARTH2;
  const r = lerp(0, 3.55, easeInOutSine(progress(f, 1150, 1236)));
  const xf = earthTransform(e, 0.9 + (f - 1150) * 0.004, -23.4 * (Math.PI / 180));
  const closed = r > 3.4;
  for (let i = 0; i < e.NR; i++) {
    const w = ringWindow(e, i, r);
    if (w <= 0) continue;
    out.push({
      id: `e2r-${i}`, pts: ringShape(e, i, 1, xf, true), cols: cached(`e2rc${i}`, () => ringColors(e, i, e.ringN)),
      radius: e.thread, mat: "silk", closed: true, s0: closed ? 0 : 0.5 - w, s1: closed ? 1 : 0.5 + w, radial: 7, segK: 2,
    });
  }
  for (let j = 0; j < e.NM; j++) {
    const w = merWindow(e, j, r);
    if (w <= 0) continue;
    out.push({
      id: `e2m-${j}`, pts: merShape(e, j, 1, xf), cols: cached(`e2mc${j}`, () => merColors(e, j, e.merN)),
      radius: e.thread, mat: "cotton", s0: 0.5 - w, s1: 0.5 + w, radial: 7, segK: 2,
    });
  }
  if (r > 1.3) {
    const g = smoother(clamp((r - 1.3) / 0.6));
    for (let c = 0; c < 2; c++) out.push({ id: `e2cap-${c}`, pts: capShape(e, c === 0, xf), color: COL.milk, radius: 0.022, mat: "wool", s0: 1 - g, s1: 1, radial: 7 });
  }
};

const frameThreads = (f: number, out: ThreadDraw[]) => {
  if (f < 1158) return;
  FRAME_LOOPS.forEach((fl, k) => {
    const g = smoother(progress(f, 1160 + k * 6, 1250 + k * 6));
    if (g <= 0) return;
    out.push({ id: `frame-${k}`, pts: cached(`frame${k}`, () => frameLoopPath(k)), color: fl.color, radius: 0.036, mat: fl.mat, closed: true, s0: -0.5 * g, s1: 0.5 * g, radial: 8, segK: 2 });
  });
  for (let k = 0; k < 2; k++) {
    const g = smoother(progress(f, 1186 + k * 8, 1268 + k * 8));
    if (g <= 0) continue;
    out.push({ id: `zigzag-${k}`, pts: cached(`zig${k}`, () => frameZigzagPath(k)), color: k === 0 ? COL.milk : COL.sky, radius: 0.022, mat: "wool", closed: true, s0: -0.5 * g, s1: 0.5 * g, radial: 7, segK: 1.6 });
  }
};

/** Главная функция движка: полное состояние кадра. */
export const frameState = (f: number): FrameState => {
  const threads: ThreadDraw[] = [];
  heroThread(f, threads);
  earthThreads(f, threads);
  if (f >= 560) valleyThreads(f, threads);
  treeThreads(f, threads);
  skyThreads(f, threads);
  earth2Threads(f, threads);
  frameThreads(f, threads);

  const camera = cameraAt(f, CAMERA_KEYS);
  const light = lightAt(f);
  const hero = threads[0];
  const sunC = heroCenter(f);
  return {
    threads,
    camera,
    light,
    skyBacking: smoother(progress(f, 1070, 1150)),
    sunGlow: { pos: sunC, strength: hero.glow ?? 0, size: heroRadius(f) * 26 },
  };
};

const heroCenter = (f: number): V3 => {
  const sp = sunSpiral(f, 3);
  return [sp[0], sp[1], sp[2]];
};
