// Общие размеры и движения персонажей: рост в мире кадра, посадка и
// вставание (сначала смена опоры и корпус, затем таз), высота сидений.
import type { Place } from "../rig/Actor";

// Рост персонажей (px мира) в обычном плане офиса/дома.
export const H = { dad: 800, mom: 770, son: 560, grandma: 745, colleague: 785 } as const;

// Сиденье стула: доля роста (взрослый / ребёнок).
export const seatOf = (h: number, child = false) => (child ? 0.31 : 0.27) * h;

export const placeAt = (x: number, y: number, h: number): Place => ({ x, y, h });

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
// Посадка: корпус вперёд (вес на стопы), затем таз опускается на сиденье,
// корпус выпрямляется. t0 — начало движения.
export const sitDown = (t: number, t0: number, dur = 34) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.25 ? 0 : u >= 1 ? 1 : smooth((u - 0.25) / 0.75);
  const lean = u <= 0 ? 0 : u >= 1.25 ? 0 : u < 0.35 ? 16 * smooth(u / 0.35) : 16 - 16 * smooth((u - 0.35) / 0.9);
  return { sit, lean };
};
// Вставание: корпус вперёд, вес на стопы, затем выпрямление.
export const standUp = (t: number, t0: number, dur = 34) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.3 ? 1 : u >= 1 ? 0 : 1 - smooth((u - 0.3) / 0.7);
  const lean = u <= 0 ? 0 : u >= 1.2 ? 0 : u < 0.35 ? 18 * smooth(u / 0.35) : 18 - 18 * smooth((u - 0.35) / 0.85);
  return { sit, lean };
};
