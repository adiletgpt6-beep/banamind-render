// Походка: стопы ставятся в мире и не скользят.
//
// Фаза шага растёт с пройденным путём (двойной шаг = 2 × длина шага).
// Каждая нога в опорной половине цикла стоит в той точке мира, где
// коснулась земли (за полшага впереди тела в момент касания); в переносе —
// летит по дуге от точки отрыва к следующей точке касания. Если персонаж
// остановился посреди переноса, стопа плавно опускается там, где была —
// без проскальзывания. До первого шага стопы следуют за телом (стоя).
// Без зависимостей от React (проверяется тестом).

export type GaitPlace = { readonly x: number; readonly y: number; readonly h: number };
type PlaceFn = (t: number) => GaitPlace;

// Скорость, при которой шаг уже полный (единиц рисунка за кадр).
export const SPEED_FULL = 3.6;
// Перспектива: движение «в глубину» (по y) короче на экране.
export const DEPTH = 0.6;

const smoothstep = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

export const velocityAt = (place: PlaceFn, t: number) => {
  const a = place(t - 2);
  const c = place(t + 2);
  const k = place(t).h / 1000;
  return { vx: (c.x - a.x) / 4 / k, vy: ((c.y - a.y) / 4 / k) * DEPTH };
};

export const amountAt = (place: PlaceFn, t: number) => {
  const { vx, vy } = velocityAt(place, t);
  return smoothstep(Math.hypot(vx, vy) / SPEED_FULL);
};

// Доля движения по горизонтали экрана (знак — направление).
export const dirAt = (place: PlaceFn, t: number) => {
  const { vx, vy } = velocityAt(place, t);
  const s = Math.hypot(vx, vy);
  return s > 0.05 ? vx / s : 0;
};

export const strideOf = (stride: number, amt: number) => stride * (0.6 + 0.4 * amt);

// Положение стопы «стоя» относительно точки тела (единицы рисунка).
export type StandFn = (side: -1 | 1, t: number) => { readonly x: number; readonly y: number };

export type Track = {
  readonly from: number;
  readonly phase: readonly number[]; // фаза в кадрах from…to
  readonly amt: readonly number[];
  readonly dir: readonly number[];
};

// Фаза шага по кадрам [from, to].
export const trackOf = (place: PlaceFn, from: number, to: number, stride: number): Track => {
  const phase = [0];
  const amt = [amountAt(place, from)];
  const dir = [dirAt(place, from)];
  for (let t = from; t < to; t++) {
    const a = place(t);
    const c = place(t + 1);
    const k = c.h / 1000;
    const d = Math.hypot(c.x - a.x, (c.y - a.y) * DEPTH) / k;
    const am = amountAt(place, t + 0.5);
    phase.push(phase[phase.length - 1] + (d < 1e-5 ? 0 : d / (2 * strideOf(stride, am))));
    amt.push(amountAt(place, t + 1));
    dir.push(dirAt(place, t + 1));
  }
  return { from, phase, amt, dir };
};

export type FootWorld = { readonly x: number; readonly y: number; readonly lift: number; readonly roll: number };

// Мировое положение стопы side в кадре f.
export const footWorld = (
  place: PlaceFn,
  track: Track,
  f: number,
  side: -1 | 1,
  stride: number,
  stand: StandFn,
): FootWorld => {
  const off = side < 0 ? 0 : 0.5;
  const ph = (t: number) => track.phase[Math.max(0, Math.min(track.phase.length - 1, t - track.from))] + off;
  const last = track.from + track.phase.length - 1;
  // момент (дробный кадр), когда фаза ноги проходит значение v
  const crossBack = (v: number) => {
    for (let t = Math.min(f, last); t > track.from; t--) {
      if (ph(t - 1) < v && ph(t) >= v) return t - 1 + (v - ph(t - 1)) / (ph(t) - ph(t - 1));
    }
    return null;
  };
  const crossFwd = (v: number) => {
    for (let t = Math.max(track.from + 1, f + 1); t <= last; t++) {
      if (ph(t - 1) < v && ph(t) >= v) return t - 1 + (v - ph(t - 1)) / (ph(t) - ph(t - 1));
    }
    return null;
  };
  const at = (tau: number) => {
    const a = place(Math.floor(tau));
    const c = place(Math.floor(tau) + 1);
    const u = tau - Math.floor(tau);
    return { x: a.x + (c.x - a.x) * u, y: a.y + (c.y - a.y) * u, h: a.h + (c.h - a.h) * u };
  };
  const dirOf = (tau: number) => track.dir[Math.max(0, Math.min(track.dir.length - 1, Math.round(tau) - track.from))];
  const amtOf = (tau: number) => track.amt[Math.max(0, Math.min(track.amt.length - 1, Math.round(tau) - track.from))];
  // точка касания: за полшага впереди тела по направлению движения
  const touch = (tau: number) => {
    const p = at(tau);
    const k = p.h / 1000;
    const s = stand(side, tau);
    const d = dirOf(tau);
    const S = strideOf(stride, amtOf(tau));
    return { x: p.x + k * (s.x + 0.5 * S * d), y: p.y + k * (s.y + (1 - Math.abs(d)) * 0.5 * S * 0.16) };
  };
  // стопа под телом в кадре t (стоя)
  const standAt = (t: number) => {
    const p = place(t);
    const k = p.h / 1000;
    const s = stand(side, t);
    return { x: p.x + k * s.x, y: p.y + k * s.y };
  };
  const standing = () => standAt(f);
  // до первого касания стопа стоит там, где стояла в начале
  const initial = () => standAt(track.from);
  const v = ph(Math.min(f, last));
  const n = Math.floor(v);
  const fr = v - n;
  // после остановки ноги приставляются: стопа, оставшаяся в шаге, за
  // 14 кадров переходит в положение «стоя» по дуге (вес переносится);
  // вторая нога — на 6 кадров позже. Пока стопа в воздухе, lift > 0.
  const settle = (pos: { x: number; y: number }, lift0: number, roll0: number): FootWorld => {
    let still = 0;
    while (still < 40 && amountAt(place, f - still) < 0.02 && f - still > track.from) still++;
    if (still < 2) return { ...pos, lift: lift0, roll: roll0 };
    const sideDelay = side < 0 ? 0 : 6;
    const b = smoothstep((still - 3 - sideDelay) / 14);
    const st = standing();
    const d = Math.hypot(st.x - pos.x, st.y - pos.y);
    if (d < 1 || b <= 0) return { ...pos, lift: lift0, roll: roll0 };
    const kk = place(f).h / 1000;
    const lift = Math.max(lift0 * (1 - b), stride * 0.12 * kk * Math.sin(Math.PI * b) * Math.min(1, d / (stride * 0.3 * kk)));
    return { x: pos.x + (st.x - pos.x) * b, y: pos.y + (st.y - pos.y) * b, lift: b >= 1 ? 0 : lift, roll: roll0 * (1 - b) };
  };
  if (fr < 0.5) {
    const tau = crossBack(n);
    const pos = tau === null ? initial() : touch(tau);
    const late = Math.max(0, (fr - 0.38) / 0.12); // пятка отрывается перед толчком
    return tau === null ? { ...pos, lift: 0, roll: 0 } : settle(pos, 0, -late * 12 * Math.sign(dirOf(f)));
  }
  // перенос: от точки отрыва к следующей точке касания
  const tOn = crossBack(n);
  // отрыв от точки последнего касания (до первого шага — от исходной)
  const start = tOn === null ? initial() : touch(tOn);
  const tNext = crossFwd(n + 1);
  const p = place(f);
  const k = p.h / 1000;
  const target = tNext === null ? standing() : touch(tNext);
  const u = (fr - 0.5) * 2;
  const e = (1 - Math.cos(Math.PI * u)) / 2;
  const amt = amtOf(f);
  // остановка посреди переноса: стопа опускается на месте
  const lift = stride * 0.3 * amt * Math.sin(Math.PI * u) ** 1.2 * k;
  const roll = (u < 0.75 ? -16 * (1 - u / 0.75) : 12 * ((u - 0.75) / 0.25)) * amt * Math.sign(dirOf(f));
  return settle({ x: start.x + (target.x - start.x) * e, y: start.y + (target.y - start.y) * e }, lift, roll);
};
