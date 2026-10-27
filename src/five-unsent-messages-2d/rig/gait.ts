// Стопы опираются на фиксированные точки мира. План шага строится сразу
// на всю сцену: цель переноса не меняется от длины «окна в будущее».
// После полноценной остановки новый шаг начинается из спокойной стойки,
// а не из незавершённой фазы предыдущего движения.
export type GaitPlace = { readonly x: number; readonly y: number; readonly h: number };
type PlaceFn = (t: number) => GaitPlace;
export const SPEED_FULL = 3.6;
export const DEPTH = 0.6;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const smoothstep = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };

export const velocityAt = (place: PlaceFn, t: number) => {
  const a = place(t - 2);
  const c = place(t + 2);
  const k = place(t).h / 1000;
  return { vx: (c.x - a.x) / 4 / k, vy: (c.y - a.y) / 4 / k * DEPTH };
};
export const amountAt = (place: PlaceFn, t: number) => {
  const { vx, vy } = velocityAt(place, t);
  return smoothstep(Math.hypot(vx, vy) / SPEED_FULL);
};
export const dirAt = (place: PlaceFn, t: number) => {
  const { vx, vy } = velocityAt(place, t);
  const speed = Math.hypot(vx, vy);
  return speed > 0.05 ? vx / speed : 0;
};
export const strideOf = (stride: number, amt: number) => stride * (0.6 + 0.4 * amt);
export type StandFn = (side: -1 | 1, t: number) => { readonly x: number; readonly y: number };
export type MotionWindow = { readonly from: number; readonly to: number };
export type Track = {
  readonly from: number;
  readonly phase: readonly number[];
  readonly amt: readonly number[];
  readonly dir: readonly number[];
  readonly windows: readonly MotionWindow[];
};

export const trackOf = (place: PlaceFn, from: number, to: number, stride: number): Track => {
  const distance: number[] = [];
  const amt: number[] = [];
  const dir: number[] = [];
  const windows: { from: number; to: number }[] = [];
  let movingFrom: number | null = null;
  for (let t = from; t <= to; t++) {
    const a = place(t);
    const b = place(t + 1);
    const d = Math.hypot(b.x - a.x, (b.y - a.y) * DEPTH) / (b.h / 1000);
    distance.push(d);
    amt.push(amountAt(place, t));
    dir.push(dirAt(place, t));
    if (t < to && d > 1e-5) movingFrom ??= t;
    if (movingFrom !== null && (d <= 1e-5 || t === to)) {
      const previous = windows[windows.length - 1];
      // Короткая заминка между отрезками пути не перезапускает ноги.
      if (previous && movingFrom - previous.to < 28) previous.to = t;
      else windows.push({ from: movingFrom, to: t });
      movingFrom = null;
    }
  }
  const phase = Array.from({ length: to - from + 1 }, () => 0);
  for (const window of windows) {
    // Первая опора уже под корпусом; первый перенос — короткий.
    let value = 0.25;
    phase[window.from - from] = value;
    for (let t = window.from; t < window.to; t++) {
      value += distance[t - from] / (2 * strideOf(stride, amountAt(place, t + 0.5)));
      phase[t + 1 - from] = value;
    }
    for (let t = window.to + 1; t <= to; t++) phase[t - from] = value;
  }
  return { from, phase, amt, dir, windows };
};

// Моменты опускания переносимой стопы. Ими же пользуется звуковой слой.
export const contactFrames = (track: Track): number[] => {
  const out: number[] = [];
  for (const window of track.windows) {
    for (let t = window.from + 1; t <= window.to; t++) {
      const a = track.phase[t - 1 - track.from];
      const b = track.phase[t - track.from];
      if (Math.floor(b * 2) > Math.floor(a * 2)) out.push(t);
    }
    // Начатый перед торможением перенос завершается приставным шагом,
    // без сжатия движения ноги до последних нескольких кадров пути.
    const phase = track.phase[window.to - track.from];
    if (Math.abs(phase * 2 - Math.round(phase * 2)) > 0.02) {
      const landing = window.to + (phase % 1 >= 0.5 ? 20 : 26);
      if (landing - track.from < track.phase.length) out.push(landing);
    }
  }
  return out;
};

export type FootWorld = { readonly x: number; readonly y: number; readonly lift: number; readonly roll: number };
export const footWorld = (place: PlaceFn, track: Track, f: number, side: -1 | 1, stride: number, stand: StandFn): FootWorld => {
  const standAt = (t: number) => {
    const p = place(t);
    const s = stand(side, t);
    return { x: p.x + p.h / 1000 * s.x, y: p.y + p.h / 1000 * s.y };
  };
  const window = [...track.windows].reverse().find((w) => w.from <= f);
  if (!window) return { ...standAt(f), lift: 0, roll: 0 };
  const off = side < 0 ? 0 : 0.5;
  const phaseAt = (t: number) => track.phase[Math.round(t) - track.from] + off;
  const now = Math.min(f, window.to);
  const value = phaseAt(now);
  const integer = Math.floor(value);
  const fraction = value - integer;
  const crossing = (value: number) => {
    for (let t = window.from + 1; t <= window.to; t++) {
      const a = phaseAt(t - 1);
      const b = phaseAt(t);
      if (a < value && b >= value) return t - 1 + (value - a) / (b - a);
    }
    return null;
  };
  const touch = (t: number) => {
    const i = Math.floor(t);
    const a = place(i);
    const b = place(i + 1);
    const u = t - i;
    const p = { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, h: a.h + (b.h - a.h) * u };
    const index = Math.round(t) - track.from;
    const dir = track.dir[index];
    const s = stand(side, t);
    const step = strideOf(stride, track.amt[index]);
    return { x: p.x + p.h / 1000 * (s.x + 0.5 * step * dir), y: p.y + p.h / 1000 * (s.y + (1 - Math.abs(dir)) * step * 0.08) };
  };
  const on = crossing(integer);
  const start = on === null ? standAt(window.from) : touch(on);
  let foot: FootWorld;
  if (fraction < 0.5) {
    foot = { ...start, lift: 0, roll: on === null ? 0 : -Math.max(0, (fraction - 0.4) / 0.1) * 7 * Math.sign(track.dir[now - track.from]) };
  } else {
    const next = crossing(integer + 1);
    const target = next === null ? standAt(window.to) : touch(next);
    const begin = on === null ? Math.max(integer + 0.5, phaseAt(window.from)) : integer + 0.5;
    const end = integer + 1;
    const u = clamp((value - begin) / Math.max(1e-6, end - begin));
    const e = smoothstep(u);
    const amount = track.amt[now - track.from];
    foot = {
      x: start.x + (target.x - start.x) * e,
      y: start.y + (target.y - start.y) * e,
      lift: Math.min(22, stride * 0.08) * amount * Math.sin(Math.PI * u) * place(now).h / 1000,
      roll: -8 * Math.sin(Math.PI * u) * amount * Math.sign(track.dir[now - track.from]),
    };
  }
  if (f <= window.to + 2) return foot;
  const target = standAt(window.to);
  const distance = Math.hypot(target.x - foot.x, target.y - foot.y);
  if (distance < 0.1) return { ...target, lift: 0, roll: 0 };
  const u = smoothstep((f - window.to - 2 - (side < 0 ? 0 : 6)) / 18);
  return {
    x: foot.x + (target.x - foot.x) * u,
    y: foot.y + (target.y - foot.y) * u,
    lift: foot.lift * (1 - u) + Math.min(14, stride * 0.06) * place(window.to).h / 1000 * Math.sin(Math.PI * u) * Math.min(1, distance / 20),
    roll: foot.roll * (1 - u),
  };
};
