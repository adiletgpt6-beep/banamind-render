// Общие размеры и позы персонажей для сцен ролика №32: рост, посадка за
// домашним столом, руки на столешнице, вставание/посадка с подготовкой.
import type { Place, WorldArm } from "../rig/Actor";
import { HOME, seatH } from "../sets/Home";

// Рост персонажей (px мира) на линии пола за столом. Сын (6–7 лет) —
// ≈ 0,68 роста папы; пропорции одинаковы во всех планах.
export const H = { dad: 790, mom: 760, son: 540, colleague: 770, grandma: 740 } as const;

// Сидящий за домашним столом.
export const seated = (who: keyof typeof H, x: number): Place => ({ x, y: HOME.seatY, h: H[who] });
export const seatOf = (p: Place) => seatH(p.h);

// Точка на столешнице (для кисти).
export const onTable = (x: number, dy = 0) => ({ x, y: HOME.table.top - 20 + dy });

// Рука, свободно лежащая на столе перед сидящим: плечо вдоль тела, локоть
// у края стола, предплечье лежит на столешнице «к зрителю» (в проекции
// короткое) — без «галочки» из рук.
export const restOnTable = (p: Place, side: -1 | 1, reach = 0.11): WorldArm => ({
  target: onTable(p.x + side * reach * p.h, 34),
  shape: "relax",
  elbow: "hang",
  behind: false,
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
