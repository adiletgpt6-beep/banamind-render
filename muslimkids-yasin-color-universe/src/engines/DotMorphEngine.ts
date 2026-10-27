// DotMorphEngine — ядро анимации. Пул из N точек с постоянными ID проходит
// через последовательность силуэтов (keyframes). Для каждого перехода заранее
// (один раз) вычисляется соответствие «точка → целевая позиция» сопоставлением
// рангов по пространственному ключу (кривая Гильберта, угол, высота…), поэтому
// ТЕ ЖЕ точки плавно перестраиваются в новую форму, а не исчезают.
// Лишние точки становятся «скрытыми» и следуют за видимой точкой-якорем:
// при росте формы новые точки отделяются от соседей, при сжатии — сливаются.
import { clamp01, easeInOutCubic, easeOutCubic, hash01, smoothstep } from "./rng";
import { sampleShape, SampledShape, ShapeSpec, W, H, Motion } from "./ShapeSamplingEngine";
import { gradIndex, sampleGradient } from "./ParticleColorSystem";
import { PathParams, PathType, pathPoint } from "./DotTrajectoryEngine";

export type OrderKey = "hilbert" | "x" | "y" | "diag" | "radial" | "angle" | "random";
export type StaggerKey = "none" | "x" | "-x" | "y" | "-y" | "radial" | "-radial" | "random" | "diag" | "-diag";

export type TransitionSpec = {
  dur: number; // секунды
  path?: PathType;
  order?: OrderKey;
  stagger?: number; // доля длительности на разбег задержек (0..0.8)
  staggerBy?: StaggerKey;
  curl?: number;
  swirl?: number;
  cx?: number;
  cy?: number;
  spread?: number;
  turns?: number;
  lift?: number;
  via?: string; // промежуточный градиент (цветовая волна)
  colorLead?: number; // смещение цвета относительно движения (−0.3..0.3)
  ease?: "inout" | "out";
  swell?: number;
  match?: Array<[number[], number[]]>; // сопоставление частей (иначе общий пул)
  emerge?: "anchor" | "above" | "center"; // откуда появляются новые точки
};

export type Keyframe = { at: number; shape: ShapeSpec; tr?: TransitionSpec; float?: number };

type ResolvedKF = {
  at: number;
  start: number; // начало перехода в этот кадр
  shape: SampledShape;
  tr: Required<Omit<TransitionSpec, "via" | "match">> & { via: number };
  float: number;
  vis: Uint8Array;
  x: Float32Array; y: Float32Array; r: Float32Array; a: Float32Array; u: Float32Array;
  g: Uint8Array; part: Uint16Array; pidx: Float32Array;
  delay: Float32Array; // задержка точки в переходе (0..1)
};

export const FPS = 30;

const hilbert = (x: number, y: number) => {
  // x, y ∈ [0,1] → индекс на кривой Гильберта 1024×1024
  const n = 1024;
  let xi = Math.min(n - 1, Math.max(0, Math.floor(x * n)));
  let yi = Math.min(n - 1, Math.max(0, Math.floor(y * n)));
  let d = 0;
  for (let s = n / 2; s > 0; s = Math.floor(s / 2)) {
    const rx = (xi & s) > 0 ? 1 : 0;
    const ry = (yi & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) {
      if (rx === 1) {
        xi = s - 1 - xi;
        yi = s - 1 - yi;
      }
      const t = xi;
      xi = yi;
      yi = t;
    }
  }
  return d;
};

const keysFor = (xs: number[], ys: number[], ids: number[], order: OrderKey) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < xs.length; i++) {
    x0 = Math.min(x0, xs[i]); x1 = Math.max(x1, xs[i]);
    y0 = Math.min(y0, ys[i]); y1 = Math.max(y1, ys[i]);
  }
  const bw = Math.max(1, x1 - x0), bh = Math.max(1, y1 - y0);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return xs.map((x, i) => {
    const nx = (x - x0) / bw, ny = (ys[i] - y0) / bh;
    switch (order) {
      case "x": return nx + ny * 1e-3;
      case "y": return ny + nx * 1e-3;
      case "diag": return nx + ny;
      case "radial": return Math.hypot(nx - 0.5, ny - 0.5) + Math.atan2(ny - 0.5, nx - 0.5) * 1e-4;
      case "angle": return Math.atan2(ys[i] - cy, x - cx) + Math.hypot(nx - 0.5, ny - 0.5) * 0.15;
      case "random": return hash01(ids[i], 99);
      default: return hilbert(nx, ny);
    }
  });
};

const DEFAULT_TR = {
  dur: 1, path: "curve" as PathType, order: "hilbert" as OrderKey, stagger: 0.3, staggerBy: "random" as StaggerKey,
  curl: 0.25, swirl: 1, cx: W / 2, cy: H / 2, spread: 420, turns: 0.25, lift: 120, colorLead: 0, ease: "inout" as const, swell: 0.18,
  emerge: "anchor" as const,
};

export class DotMorphEngine {
  readonly n: number;
  readonly kfs: ResolvedKF[] = [];
  private h1: Float32Array; private h2: Float32Array; private h3: Float32Array;
  // выходные буферы (переиспользуются каждый кадр)
  readonly ox: Float32Array; readonly oy: Float32Array; readonly or: Float32Array; readonly oa: Float32Array; readonly oc: Float32Array;
  private tmp = new Float32Array(2);
  private ca = new Float32Array(3);
  private cb = new Float32Array(3);
  private cv = new Float32Array(3);

  constructor(n: number, keyframes: Keyframe[]) {
    this.n = n;
    this.h1 = new Float32Array(n); this.h2 = new Float32Array(n); this.h3 = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      this.h1[i] = hash01(i, 1); this.h2[i] = hash01(i, 2); this.h3[i] = hash01(i, 3);
    }
    this.ox = new Float32Array(n); this.oy = new Float32Array(n); this.or = new Float32Array(n);
    this.oa = new Float32Array(n); this.oc = new Float32Array(n * 3);
    this.build(keyframes);
  }

  private build(keyframes: Keyframe[]) {
    const n = this.n;
    const slots: Int32Array[] = [];
    const anchors: Int32Array[] = [];
    const shapes = keyframes.map((k) => sampleShape(k.shape));
    shapes.forEach((s) => {
      if (s.n > n) throw new Error(`Shape ${s.name} has ${s.n} points > pool ${n}`);
      if (s.n === 0) throw new Error(`Shape ${s.name} is empty`);
    });
    // первый кадр: точки по порядку
    {
      const s0 = shapes[0];
      const slot = new Int32Array(n).fill(-1);
      const anc = new Int32Array(n);
      for (let i = 0; i < n; i++) {
        if (i < s0.n) slot[i] = i;
        anc[i] = i < s0.n ? i : Math.floor(hash01(i, 5) * s0.n);
      }
      slots.push(slot);
      anchors.push(anc);
    }
    for (let k = 1; k < shapes.length; k++) {
      const prev = shapes[k - 1], next = shapes[k];
      const tr = keyframes[k].tr ?? { dur: 0 };
      const order = tr.order ?? DEFAULT_TR.order;
      const pSlot = slots[k - 1], pAnc = anchors[k - 1];
      const slot = new Int32Array(n).fill(-1);
      const anc = new Int32Array(n).fill(-1);
      const visibleNext: number[] = [];
      const B: number[] = [];
      for (let i = 0; i < n; i++) if (pSlot[i] < 0) B.push(i);
      let bPtr = 0;
      // группы частей: [части пред. формы] → [части новой формы]; остальное — общий пул
      const groups = (tr.match ?? []).map(([pp, np]) => [new Set(pp), new Set(np)] as const);
      const usedPrev = new Set<number>(), usedNext = new Set<number>();
      groups.forEach(([pp, np]) => { pp.forEach((v) => usedPrev.add(v)); np.forEach((v) => usedNext.add(v)); });
      const allGroups = [...groups.map(([pp, np]) => ({ inP: (q: number) => pp.has(q), inN: (q: number) => np.has(q) })),
        { inP: (q: number) => !usedPrev.has(q), inN: (q: number) => !usedNext.has(q) }];
      const leftovers: Array<[number, number[]]> = [];
      for (const grp of allGroups) {
        const A: number[] = [];
        for (let i = 0; i < n; i++) if (pSlot[i] >= 0 && grp.inP(prev.part[pSlot[i]])) A.push(i);
        const S: number[] = [];
        for (let j = 0; j < next.n; j++) if (grp.inN(next.part[j])) S.push(j);
        const Ma = A.length, Mb = S.length;
        const kA = keysFor(A.map((i) => prev.x[pSlot[i]]), A.map((i) => prev.y[pSlot[i]]), A, order);
        const sortedA = A.map((id, j) => [id, kA[j]] as const).sort((a, b) => a[1] - b[1]).map((v) => v[0]);
        const kS = keysFor(S.map((j) => next.x[j]), S.map((j) => next.y[j]), S, order);
        const sortedS = S.map((j, q) => [j, kS[q]] as const).sort((a, b) => a[1] - b[1]).map((v) => v[0]);
        if (Mb === 0) {
          leftovers.push([0, sortedA]);
          continue;
        }
        if (Mb <= Ma) {
          const chosen = new Int32Array(Mb);
          for (let j = 0; j < Mb; j++) {
            const dot = sortedA[Math.floor(((j + 0.5) * Ma) / Mb)];
            slot[dot] = sortedS[j];
            chosen[j] = dot;
            visibleNext.push(dot);
          }
          for (let r = 0; r < Ma; r++) {
            const dot = sortedA[r];
            if (slot[dot] < 0) anc[dot] = chosen[Math.min(Mb - 1, Math.floor((r * Mb) / Ma))];
          }
        } else {
          const used = new Uint8Array(Mb);
          for (let r = 0; r < Ma; r++) {
            const j = Math.floor(((r + 0.5) * Mb) / Ma);
            slot[sortedA[r]] = sortedS[j];
            used[j] = 1;
            visibleNext.push(sortedA[r]);
          }
          for (let j = 0; j < Mb; j++) {
            if (used[j]) continue;
            if (bPtr >= B.length) throw new Error(`Pool exhausted at ${next.name}`);
            const dot = B[bPtr++];
            slot[dot] = sortedS[j];
            visibleNext.push(dot);
            // новая точка «отделяется» от соседней точки предыдущей формы
            if (Ma > 0) pAnc[dot] = sortedA[Math.min(Ma - 1, Math.floor((j * Ma) / Mb))];
          }
        }
      }
      for (const [, dots] of leftovers) {
        for (const dot of dots) anc[dot] = visibleNext[Math.floor(hash01(dot, 13 + k) * visibleNext.length)];
      }
      for (let i = 0; i < n; i++) {
        if (slot[i] >= 0) anc[i] = i;
        else if (anc[i] < 0) anc[i] = visibleNext[Math.floor(hash01(i, 7 + k) * visibleNext.length)];
      }
      slots.push(slot);
      anchors.push(anc);
    }
    // разрешение позиций для каждого кадра
    keyframes.forEach((kf, k) => {
      const s = shapes[k];
      const slot = slots[k], anc = anchors[k];
      const R: ResolvedKF = {
        at: kf.at,
        start: kf.at - (kf.tr?.dur ?? 0),
        shape: s,
        tr: { ...DEFAULT_TR, ...kf.tr, match: undefined, via: kf.tr?.via ? gradIndex(kf.tr.via) : -1 } as ResolvedKF["tr"],
        float: kf.float ?? 1.4,
        vis: new Uint8Array(n),
        x: new Float32Array(n), y: new Float32Array(n), r: new Float32Array(n), a: new Float32Array(n), u: new Float32Array(n),
        g: new Uint8Array(n), part: new Uint16Array(n), pidx: new Float32Array(n), delay: new Float32Array(n),
      };
      for (let i = 0; i < n; i++) {
        const sl = slot[i] >= 0 ? slot[i] : slot[anc[i]];
        if (sl < 0) throw new Error(`Unresolved anchor in ${s.name}`);
        R.vis[i] = slot[i] >= 0 ? 1 : 0;
        R.x[i] = s.x[sl]; R.y[i] = s.y[sl]; R.u[i] = s.u[sl]; R.g[i] = s.g[sl];
        R.part[i] = s.part[sl]; R.pidx[i] = s.pidx[sl];
        R.r[i] = slot[i] >= 0 ? s.r[sl] : 0;
        R.a[i] = slot[i] >= 0 ? s.a[sl] : 0;
      }
      this.kfs.push(R);
    });
    // задержки (волна/разбег) для каждого перехода
    for (let k = 1; k < this.kfs.length; k++) {
      const R = this.kfs[k];
      const by = R.tr.staggerBy;
      const raw = new Float32Array(n);
      let mn = Infinity, mx = -Infinity;
      for (let i = 0; i < n; i++) {
        const x = R.x[i] / W, y = R.y[i] / H;
        let v = 0;
        switch (by) {
          case "x": v = x; break;
          case "-x": v = -x; break;
          case "y": v = y; break;
          case "-y": v = -y; break;
          case "diag": v = x + y * 0.6; break;
          case "-diag": v = -(x + y * 0.6); break;
          case "radial": v = Math.hypot(R.x[i] - R.tr.cx, R.y[i] - R.tr.cy); break;
          case "-radial": v = -Math.hypot(R.x[i] - R.tr.cx, R.y[i] - R.tr.cy); break;
          case "random": v = this.h3[i]; break;
          default: v = 0;
        }
        if (by !== "random" && by !== "none") v += (this.h3[i] - 0.5) * 0.06; // лёгкая неровность фронта
        raw[i] = v;
        mn = Math.min(mn, v); mx = Math.max(mx, v);
      }
      for (let i = 0; i < n; i++) R.delay[i] = mx > mn ? (raw[i] - mn) / (mx - mn) : 0;
      if (R.start < this.kfs[k - 1].at - 1e-6) {
        throw new Error(`Keyframe ${R.shape.name} transition overlaps previous (${R.start} < ${this.kfs[k - 1].at})`);
      }
    }
  }

  /** Позиция/радиус/альфа точки i в кадре k с учётом «удержания» (движения части). */
  private held(R: ResolvedKF, i: number, t: number, out: Float32Array) {
    let x = R.x[i], y = R.y[i], r = R.r[i], a = R.a[i];
    const m: Motion | undefined = R.shape.parts[R.part[i]]?.motion;
    const h1 = this.h1[i], h2 = this.h2[i];
    if (m) {
      switch (m.type) {
        case "rotate": {
          const ang = m.speed * t, c = Math.cos(ang), s = Math.sin(ang);
          const dx = x - m.cx, dy = y - m.cy;
          x = m.cx + dx * c - dy * s; y = m.cy + dx * s + dy * c;
          break;
        }
        case "orbit": {
          const th = m.phase + m.speed * t;
          const ex = m.rx * Math.cos(th), ey = m.ry * Math.sin(th);
          const c = Math.cos(m.tilt), s = Math.sin(m.tilt);
          x = m.cx + ex * c - ey * s + (x - m.bx);
          y = m.cy + ex * s + ey * c + (y - m.by);
          break;
        }
        case "fall": {
          const f = (((t * m.speed) / m.dist + m.phase) % 1 + 1) % 1;
          y += (f - 0.5) * m.dist;
          a *= smoothstep(0, 0.18, f) * (1 - smoothstep(0.78, 1, f));
          break;
        }
        case "twinkle": {
          const sp = m.speed ?? 1.6;
          const w = Math.sin(t * sp * (0.6 + h1) + h2 * 40);
          a *= 0.6 + 0.4 * w;
          r *= 0.85 + 0.2 * w;
          break;
        }
        case "sweep": {
          const ph = ((t - (m.delay ?? 0)) / m.period) % 1.6 - 0.2;
          const d = (R.pidx[i] - ph) / m.width;
          r *= 1 + 0.55 * Math.exp(-d * d);
          break;
        }
        case "pulse": {
          r *= 1 + m.amp * Math.sin(t * m.speed - R.pidx[i] * 6.28);
          break;
        }
        case "float":
          break;
      }
    }
    const fa = m?.type === "float" ? m.amp ?? R.float : R.float;
    if (fa > 0) {
      x += fa * Math.sin(t * 0.9 + h1 * 6.283);
      y += fa * Math.cos(t * 0.75 + h2 * 6.283);
    }
    out[0] = x; out[1] = y; out[2] = r; out[3] = a;
  }

  private colorOf(R: ResolvedKF, i: number, t: number, out: Float32Array) {
    const sh = R.shape.parts[R.part[i]]?.shimmer ?? 0.03;
    sampleGradient(R.g[i], R.u[i] + sh * t, out, 0);
  }

  /** Состояние всех точек в момент frame. */
  evaluate(frame: number) {
    const t = frame / FPS;
    const K = this.kfs;
    let k = 0;
    while (k + 1 < K.length && t >= K[k + 1].start) k++;
    const cur = K[k];
    const inTr = k > 0 && t < cur.at;
    const prev = inTr ? K[k - 1] : cur;
    const p = inTr ? clamp01((t - cur.start) / Math.max(1e-6, cur.at - cur.start)) : 1;
    const tr = cur.tr;
    const A = new Float32Array(4), B = new Float32Array(4);
    const P: PathParams = { curl: tr.curl, swirl: tr.swirl, cx: tr.cx, cy: tr.cy, spread: tr.spread, turns: tr.turns, lift: tr.lift };
    for (let i = 0; i < this.n; i++) {
      this.held(cur, i, t, B);
      if (!inTr) {
        this.ox[i] = B[0]; this.oy[i] = B[1]; this.or[i] = B[2]; this.oa[i] = B[3];
        this.colorOf(cur, i, t, this.cb);
        this.oc[i * 3] = this.cb[0]; this.oc[i * 3 + 1] = this.cb[1]; this.oc[i * 3 + 2] = this.cb[2];
        continue;
      }
      this.held(prev, i, t, A);
      const visA = prev.vis[i], visB = cur.vis[i];
      if (!visA && !visB) {
        this.oa[i] = 0; this.or[i] = 0;
        continue;
      }
      const st = tr.stagger;
      const l = clamp01((p - cur.delay[i] * st) / (1 - st));
      const e = tr.ease === "out" ? easeOutCubic(l) : easeInOutCubic(l);
      if (!visA && tr.emerge === "above") {
        A[0] = B[0] + (this.h1[i] - 0.5) * 60;
        A[1] = B[1] - 420 - this.h2[i] * 200;
      } else if (!visA && tr.emerge === "center") {
        A[0] = tr.cx + (this.h1[i] - 0.5) * 40;
        A[1] = tr.cy + (this.h2[i] - 0.5) * 40;
      }
      pathPoint(tr.path, A[0], A[1], B[0], B[1], e, this.h1[i], this.h2[i], P, this.tmp);
      this.ox[i] = this.tmp[0]; this.oy[i] = this.tmp[1];
      let r: number, a: number;
      if (visA && visB) {
        r = A[2] + (B[2] - A[2]) * e;
        a = A[3] + (B[3] - A[3]) * e;
      } else if (visB) {
        const f = smoothstep(0, 0.75, l);
        r = (B[2] * 0.6 + B[2] * 0.4 * e) * f;
        a = B[3] * f;
      } else {
        const f = 1 - smoothstep(0.3, 1, l);
        r = A[2] * f;
        a = A[3] * f;
      }
      r *= 1 + tr.swell * Math.sin(Math.PI * l);
      this.or[i] = r; this.oa[i] = a;
      this.colorOf(prev, i, t, this.ca);
      this.colorOf(cur, i, t, this.cb);
      let cp = smoothstep(0.08, 0.92, clamp01(l + tr.colorLead));
      if (!visA) cp = 1;
      if (!visB) cp = 0;
      const o = i * 3;
      if (tr.via >= 0 && visA && visB) {
        sampleGradient(tr.via, cur.u[i] * 0.5 + l * 0.6, this.cv, 0);
        if (cp < 0.5) {
          const f = cp * 2;
          for (let c = 0; c < 3; c++) this.oc[o + c] = this.ca[c] + (this.cv[c] - this.ca[c]) * f;
        } else {
          const f = (cp - 0.5) * 2;
          for (let c = 0; c < 3; c++) this.oc[o + c] = this.cv[c] + (this.cb[c] - this.cv[c]) * f;
        }
      } else {
        for (let c = 0; c < 3; c++) this.oc[o + c] = this.ca[c] + (this.cb[c] - this.ca[c]) * cp;
      }
    }
  }
}
