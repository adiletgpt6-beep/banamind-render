// Общие размеры и движения героев №34: рост в мире гостиной, посадка и
// вставание (сначала корпус и опора, затем таз), масштаб предметов в руках
// (одна и та же книга и игрушка одного размера в мире у всех героев).
import type { Place } from "../rig/Actor";
import { LIVING } from "../sets/Living";

// Рост героев (px мира) на линии стоп у дивана (y = 1540).
export const H = { mom: 760, dad: 790, caregiver: 750, son: 560, toddler: 380 } as const;

export const placeAt = (x: number, y: number, h: number): Place => ({ x, y, h });
// Сидящий на месте дивана / кресла / стула (стопы на линии LIVING.feetY).
export const seatedAt = (who: keyof typeof H, x: number): Place => ({ x, y: LIVING.feetY, h: H[who] });

// Масштаб предмета в руке: предмет рисуется в единицах рисунка героя
// (рост 1000), поэтому для одинакового размера в мире делим на рост.
export const itemScaleFor = (h: number, worldPerUnit = 0.76) => worldPerUnit / (h / 1000);
export const BOOK_SCALE = (h: number) => itemScaleFor(h, 0.95); // книга ≈ 125×160 px мира
export const BUNNY_SCALE = (h: number) => itemScaleFor(h, 0.92); // зайчик ≈ 110 px мира

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
// Посадка: корпус вперёд (вес на стопы), затем таз опускается на сиденье,
// корпус выпрямляется. t0 — начало движения.
export const sitDown = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.25 ? 0 : u >= 1 ? 1 : smooth((u - 0.25) / 0.75);
  const lean = u <= 0 ? 0 : u >= 1.25 ? 0 : u < 0.35 ? 16 * smooth(u / 0.35) : 16 - 16 * smooth((u - 0.35) / 0.9);
  return { sit, lean };
};
// Вставание: корпус вперёд, вес на стопы, затем выпрямление.
export const standUp = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.3 ? 1 : u >= 1 ? 0 : 1 - smooth((u - 0.3) / 0.7);
  const lean = u <= 0 ? 0 : u >= 1.2 ? 0 : u < 0.35 ? 18 * smooth(u / 0.35) : 18 - 18 * smooth((u - 0.35) / 0.85);
  return { sit, lean };
};
