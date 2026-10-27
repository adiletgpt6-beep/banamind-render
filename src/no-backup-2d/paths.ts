import { clamp, cruise, glide, lerp } from "./rig/motion.ts";
import type { GaitPlace } from "./rig/gait.ts";
import { SCHOOL, OFFICE } from "./sets/layout.ts";
type Place = GaitPlace;

// Прихожая: дочка у двери, мама у ключницы (крючок на высоте плеча).
export const GIRL_HALL: Place = { x: 690, y: 1712, h: 560 };
export const MOM_HALL: Place = { x: 1400, y: 1672, h: 780 };

// Двор (кадры сцены «drive»): из подъезда к машине мамы. Мама идёт
// спокойно, с остановкой у задней двери; у дочки свой путь — она чуть
// отстаёт и приближается к маме, шаг у неё короче и чаще (см. gait).
export const YARD_FROM = 250;
export const YARD_TO = 330;
export const MOM_YARD = (t: number): Place => {
  const u = cruise((t - YARD_FROM - 4) / (YARD_TO - YARD_FROM + 6), 0.2);
  return { x: lerp(840, 1500, u), y: lerp(1660, 1722, u), h: lerp(684, 700, u) };
};
export const GIRL_YARD = (t: number): Place => {
  const u = cruise((t - YARD_FROM - 7) / (YARD_TO - YARD_FROM + 6), 0.24);
  const m = { x: lerp(840, 1500, u), y: lerp(1660, 1722, u), h: lerp(684, 700, u) };
  // расстояние между ними «дышит»: держатся за руки, но не жёсткая сцепка
  const gap = 0.165 * m.h + 7 * Math.sin((t - YARD_FROM) / 17) * Math.min(u, 1 - u) * 2;
  return { x: m.x - gap, y: m.y + 26, h: m.h * 0.7 };
};

export const MOM_S: Place = { x: 1000, y: 1510, h: 800 };
export const GIRL_S: Place = { x: 830, y: 1480, h: 560 };

// Траектории (кадры сцены): дочка к двери школы; мама в офисе к столу.
export const SCHOOL_WALK = { from: 112, to: 172 } as const;
export const GIRL_TO_SCHOOL = (t: number): Place => {
  const u = cruise((t - SCHOOL_WALK.from) / (SCHOOL_WALK.to - SCHOOL_WALK.from), 0.4);
  return { x: lerp(GIRL_S.x, 610, u), y: lerp(GIRL_S.y, SCHOOL.door.y + 6, u), h: lerp(GIRL_S.h, 540, u) };
};
// Мама в офисе: из дверного проёма — шаг в комнату — к своему стулу;
// останавливается у стула, потом садится (сцена «school», кадры).
export const OFFICE_WALK = { from: 434, to: 488 } as const;
export const MOM_OFFICE = (t: number): Place => {
  const p = glide(t, OFFICE_WALK.from, OFFICE_WALK.to, [{ x: 190, y: 1490 }, { x: 214, y: 1546 }, { x: OFFICE.chair.x, y: 1600 }], cruise);
  return { x: p.x, y: p.y, h: lerp(780, 800, clamp((t - OFFICE_WALK.from) / 26)) };
};
