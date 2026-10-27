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
export const STANCE = 0.6;

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
  readonly settle: readonly number[]; // 0…1: доводка шагов после остановки
};

// Доводка шагов после остановки: фаза за кадр (полшага ≈ 10 кадров).
const SETTLE_RATE = 0.05;
const STOPPED = 0.25;

// Фаза шага по кадрам [from, to]. Когда персонаж (после ходьбы) почти
// остановился, шаги доводятся: нога в переносе опускается, затем вторая
// приставляется под тело (фаза дорастает до кратной 0,5 плюс полшага).
// Никто не замирает с поднятой ногой и не стоит в широком шаге.
export const trackOf = (place: PlaceFn, from: number, to: number, stride: number): Track => {
  const phase = [0];
  const amt = [amountAt(place, from)];
  const dir = [dirAt(place, from)];
  const settle = [0];
  let walked = false;
  let goal: number | null = null;
  for (let t = from; t < to; t++) {
    const a = place(t);
    const c = place(t + 1);
    const k = c.h / 1000;
    const d = Math.hypot(c.x - a.x, (c.y - a.y) * DEPTH) / k;
    const am = amountAt(place, t + 0.5);
    const prev = phase[phase.length - 1];
    let next = prev + (d < 1e-5 ? 0 : d / (2 * strideOf(stride, am)));
    let s = 0;
    if (am >= STOPPED) walked = true;
    const soon = amountAt(place, t + 4);
    if (walked && soon < STOPPED) {
      if (goal === null) goal = Math.ceil(prev * 2 - 1e-9) / 2 + 0.5;
      s = 1 - soon / STOPPED;
      if (goal - next > 1e-9) next = Math.min(goal, Math.max(next, prev + SETTLE_RATE * s));
      if (next >= goal - 1e-9) {
        walked = false;
        goal = null;
      }
    } else goal = null;
    phase.push(next);
    amt.push(amountAt(place, t + 1));
    dir.push(dirAt(place, t + 1));
    settle.push(s);
  }
  return { from, phase, amt, dir, settle };
};

// Дробные кадры возникают при замедлении/перемонтаже жестов.
// Линейно берём фазу между целыми кадрами: индекс массива с дробью
// даёт undefined и раньше делал весь сидящий персонаж невидимым.
export const trackSample = (values: readonly number[], from: number, t: number) => {
  const pos = Math.max(0, Math.min(values.length - 1, t - from));
  const i = Math.floor(pos);
  return values[i] + ((values[i + 1] ?? values[i]) - values[i]) * (pos - i);
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
  // Начинаем с переноса первой ноги, пока вторая остаётся опорной.
  // До движения u=0: обе стопы стоят на исходных местах.
  const off = side < 0 ? STANCE : STANCE - 0.5;
  const ph = (t: number) => trackSample(track.phase, track.from, t) + off;
  const last = track.from + track.phase.length - 1;
  // момент (дробный кадр), когда фаза ноги проходит значение v
  const crossBack = (v: number) => {
    for (let t = Math.min(Math.ceil(f), last); t > track.from; t--) {
      if (ph(t - 1) < v && ph(t) >= v) return t - 1 + (v - ph(t - 1)) / (ph(t) - ph(t - 1));
    }
    return null;
  };
  const crossFwd = (v: number) => {
    for (let t = Math.max(track.from + 1, Math.floor(f) + 1); t <= last; t++) {
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
  const dirOf = (tau: number) => trackSample(track.dir, track.from, tau);
  const amtOf = (tau: number) => trackSample(track.amt, track.from, tau);
  const settleOf = (tau: number) => trackSample(track.settle, track.from, tau);
  // точка касания: там, где окажется тело к середине опоры (через четверть
  // цикла, но не дальше 16 кадров) — при ходьбе это впереди тела, при
  // остановке — под телом в конечной точке
  const touch = (tau: number) => {
    const v = ph(Math.floor(tau)) + (ph(Math.floor(tau) + 1) - ph(Math.floor(tau))) * (tau - Math.floor(tau)) + STANCE / 2;
    const end = Math.min(last, Math.floor(tau) + 16);
    let tm = end;
    for (let t = Math.ceil(tau); t <= end; t++) {
      if (ph(t) >= v) {
        tm = t;
        break;
      }
    }
    const p = at(tm);
    const k = p.h / 1000;
    const s = stand(side, tm);
    return { x: p.x + k * s.x, y: p.y + k * s.y };
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
  // Первый шаг с места: задняя нога отрывается раньше (на четверти цикла),
  // иначе она стоит, пока тело не уйдёт на целый шаг, — «шпагат».
  const firstLift = side > 0 && n === 0 && crossBack(0) === null ? Math.min(STANCE, 0.35) : STANCE;
  if (fr < firstLift) {
    const tau = crossBack(n);
    const pos = tau === null ? initial() : touch(tau);
    const late = Math.max(0, (fr - STANCE + 0.1) / 0.1);
    return { ...pos, lift: 0, roll: -late * 6 * amtOf(f) * Math.sign(dirOf(f)) };
  }
  // перенос: от точки отрыва к следующей точке касания
  const tOn = crossBack(n);
  // отрыв от точки последнего касания (до первого шага — от исходной)
  const start = tOn === null ? initial() : touch(tOn);
  const tNext = crossFwd(n + 1);
  const p = place(f);
  const k = p.h / 1000;
  const target = tNext === null ? standing() : touch(tNext);
  const u = (fr - firstLift) / (1 - firstLift);
  const e = (1 - Math.cos(Math.PI * u)) / 2;
  // высота переноса: от скорости; приставной шаг после остановки — пониже
  const amt = Math.max(amtOf(f), 0.45 * settleOf(f));
  const lift = stride * 0.08 * amt * Math.sin(Math.PI * u) ** 1.2 * k;
  const roll = (u < 0.75 ? -6 * (1 - u / 0.75) : 4 * ((u - 0.75) / 0.25)) * amt * Math.sign(dirOf(f));
  return { x: start.x + (target.x - start.x) * e, y: start.y + (target.y - start.y) * e, lift, roll };
};

// Кадры касания стопы с полом (для звука шагов): момент, когда фаза ноги
// проходит целое значение — начало опоры (см. footWorld). Только шаги в
// движении (размах ≥ minAmt), без доводки стоя.
export const stepFrames = (place: PlaceFn, from: number, to: number, stride: number, minAmt = 0.3) => {
  const track = trackOf(place, from, to, stride);
  const out: { frame: number; side: -1 | 1 }[] = [];
  for (const side of [-1, 1] as const) {
    const off = side < 0 ? STANCE : STANCE - 0.5;
    for (let i = 1; i < track.phase.length; i++) {
      const a = track.phase[i - 1] + off;
      const b = track.phase[i] + off;
      if (Math.floor(b) > Math.floor(a) && track.amt[i] >= minAmt) out.push({ frame: from + i, side });
    }
  }
  return out.sort((x, y) => x.frame - y.frame);
};
