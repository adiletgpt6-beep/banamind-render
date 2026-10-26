// Сцена 1 — одна золотая нить (и её судьба через весь фильм).
// Это «та же художественная нить»: появляется первой, делает петлю, ложится утком в
// первое переплетение, затем выходит из экватора Земли и сворачивается в тканое Солнце;
// в финале снова вытягивается из Солнца и рисует декоративный завиток.
import { buildPath, Path, resample } from "../engines/ThreadContinuityEngine";
import { V3, add, clamp, lerp, mix3, progress, smoother, smoothstep } from "../utils/math";
import { EARTH, ringShape } from "./Scene02Earth";

export const HERO_N = 640;
/** Полуширина видимого участка экватора в первом переплетении (доля длины кольца). */
export const HERO_W = 0.075;
export const HERO_RING = 17; // экватор

/** Свободная нить с петлёй: экватор плоского полотна + локальная деформация. */
export const freeLoopShape = (f: number, equator: Path): Path => {
  const n = equator.length / 3;
  const r = 0.066;
  return buildPath(n, (s, i) => {
    const q = (s - 0.5) / HERO_W;
    const base: V3 = [equator[i * 3], equator[i * 3 + 1], equator[i * 3 + 2]];
    if (Math.abs(q) >= 1) return base;
    const bell = (1 - q * q) * (1 - q * q);
    const th = 2 * Math.PI * smoother(clamp((q + 0.3) / 0.6));
    const dx = -r * Math.sin(th);
    const dy = r * (1 - Math.cos(th)) + 0.03 * Math.sin(4 * q + f * 0.05) * bell;
    const dz = 0.036 * (2 * smoothstep(-0.32, 0.32, q) - 1) * bell + 0.02 * Math.sin(3 * q - f * 0.04) * bell;
    return add(base, [dx, dy - 0.02 * bell, dz]);
  });
};

/** Экватор полотна (уток i=17) при текущем изгибе k — без вращения (до 225 кадра Земля не вращается). */
export const equatorShape = (k: number, xf: (p: V3) => V3): Path => ringShape(EARTH, HERO_RING, k, xf, false);

// ---------- Солнце из золотой нити ----------
export const SUN2: V3 = [-0.6, 1.3, 0.35];
export const SUN_SKY: V3 = [1.6, 7.7, -3.3];
const sunParams = (f: number) => {
  const w = smoother(progress(f, 470, 565));
  return { c: mix3(SUN2, SUN_SKY, w), R: lerp(0.24, 0.62, w), turns: lerp(5, 5.6, w) };
};
export const heroRadius = (f: number) => lerp(0.024, 0.05, smoother(progress(f, 470, 565)));

export const sunSpiral = (f: number, n = HERO_N): Path => {
  const { c, R, turns } = sunParams(f);
  const spin = f * 0.004;
  return buildPath(n, (s) => {
    const rs = Math.sqrt(Math.max(s, 1e-4));
    const th = turns * 2 * Math.PI * rs + spin;
    const r = R * rs;
    const dome = 0.18 * R * (1 - rs * rs);
    return [c[0] + Math.cos(th) * r, c[1] + Math.sin(th) * r, c[2] + dome];
  });
};

/** Финальный завиток: нить продолжает выходить из внешнего витка Солнца. */
export const FLOURISH_CURL: V3 = [-0.05, 2.7, 6.3];
export const flourishPath = (f: number): Path => {
  const spiral = sunSpiral(f, 400);
  const n = spiral.length / 3;
  const E: V3 = [spiral[(n - 1) * 3], spiral[(n - 1) * 3 + 1], spiral[(n - 1) * 3 + 2]];
  const ctrl: V3[] = [E, add(E, [0.45, -0.25, 0.7]), [2.3, 6.9, 1.6], [1.6, 4.9, 3.9], [0.55, 3.55, 5.4], add(FLOURISH_CURL, [0.42, 0.12, 0])];
  const pts: V3[] = [];
  // Катмулл–Ром через контрольные точки
  for (let k = 0; k < ctrl.length - 1; k++) {
    const p0 = ctrl[Math.max(0, k - 1)], p1 = ctrl[k], p2 = ctrl[k + 1], p3 = ctrl[Math.min(ctrl.length - 1, k + 2)];
    const steps = 50;
    for (let i = k === 0 ? 1 : 0; i < steps; i++) {
      const t = i / steps, t2 = t * t, t3 = t2 * t;
      const p = [0, 1, 2].map((c) =>
        0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3),
      ) as V3;
      pts.push(p);
    }
  }
  // завиток: 1.35 витка внутрь, лёгкая волна по глубине
  const C = FLOURISH_CURL;
  for (let i = 0; i <= 140; i++) {
    const u = i / 140;
    const a = u * 1.35 * 2 * Math.PI;
    const r = lerp(0.42, 0.1, Math.pow(u, 0.85));
    pts.push([C[0] + Math.cos(a) * r, C[1] + 0.12 * (1 - u) + Math.sin(a) * r, C[2] + 0.06 * Math.sin(u * Math.PI)]);
  }
  // свободный конец слегка «дышит»
  const out = buildPath(pts.length, (_s, i) => pts[i]);
  const L = out.length / 3;
  for (let i = Math.floor(L * 0.4); i < L; i++) {
    const w = (i - L * 0.4) / (L * 0.6);
    out[i * 3 + 1] += 0.025 * w * Math.sin(f * 0.06 + i * 0.03);
  }
  return out;
};

/** Полная кривая финальной стадии: Солнце + вытянутая нить. */
export const heroFinalPath = (f: number): { pts: Path; sunFrac: number } => {
  const spiral = sunSpiral(f, 400);
  const fl = flourishPath(f);
  const all = new Float32Array(spiral.length + fl.length);
  all.set(spiral, 0);
  all.set(fl, spiral.length);
  // длины для доли Солнца
  let ls = 0, lf = 0;
  for (let i = 1; i < spiral.length / 3; i++) ls += Math.hypot(spiral[i * 3] - spiral[i * 3 - 3], spiral[i * 3 + 1] - spiral[i * 3 - 2], spiral[i * 3 + 2] - spiral[i * 3 - 1]);
  for (let i = 1; i < fl.length / 3; i++) lf += Math.hypot(fl[i * 3] - fl[i * 3 - 3], fl[i * 3 + 1] - fl[i * 3 - 2], fl[i * 3 + 2] - fl[i * 3 - 1]);
  return { pts: resample(all, 1400), sunFrac: ls / (ls + lf) };
};
