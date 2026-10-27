// Общие размеры и позы персонажей для сцен ролика: рост на разной глубине
// (перспектива), посадка за столом, руки на столешнице.
import type { Place } from "../rig/Actor";
import type { WorldArm } from "../rig/Actor";
import { HOME, seatH } from "../sets/Home";

// Рост персонажей (px мира) на линии пола y = 1540 (за столом).
export const H = { mom: 760, dad: 790, son: 540, daughter: 670, teacher: 770 } as const;

// Масштаб глубины: ближе к камере (больше y) — крупнее.
export const depth = (y: number) => 1 + (y - HOME.seatY) * 0.0005;

export const placeAt = (x: number, y: number, h: number): Place => ({ x, y, h: h * depth(y) });

// Сидящий за столом.
export const seated = (who: keyof typeof H, x: number): Place => ({ x, y: HOME.seatY, h: H[who] });
export const seatOf = (p: Place) => seatH(p.h);

// Точка на столешнице (для кисти).
export const onTable = (x: number, dy = 0) => ({ x, y: HOME.table.top + 6 + dy });

// Кисть сидящего «на коленях» под столом (не видна) — нейтрально.
export const lap = (p: Place, side: -1 | 1) => ({ x: p.x + side * 0.12 * p.h, y: p.y - 0.36 * p.h });

// Рука, свободно лежащая на столе перед сидящим.
export const restOnTable = (p: Place, side: -1 | 1): WorldArm => ({
  target: onTable(p.x + side * 0.15 * p.h, -4),
  shape: "relax",
  elbow: "down",
});

// Опущенная рука стоящего.
export const hang: WorldArm = { target: null, shape: "relax" };

// Посадка: сначала корпус вперёд (вес на стопы), затем таз опускается на
// сиденье, корпус выпрямляется. Вставание — в обратном порядке: корпус
// вперёд, вес на стопы, затем выпрямление. t0 — начало движения.
export const sitDown = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.25 ? 0 : u >= 1 ? 1 : smooth((u - 0.25) / 0.75);
  const lean = u <= 0 ? 0 : u >= 1.25 ? 0 : u < 0.35 ? 16 * smooth(u / 0.35) : 16 - 14 * smooth((u - 0.35) / 0.9);
  return { sit, lean };
};
export const standUp = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.3 ? 1 : u >= 1 ? 0 : 1 - smooth((u - 0.3) / 0.7);
  const lean = u <= 0 ? 0 : u >= 1.2 ? 0 : u < 0.35 ? 18 * smooth(u / 0.35) : 18 - 18 * smooth((u - 0.35) / 0.85);
  return { sit, lean };
};
const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
