// Общее для сцен BG-045: рост персонажей, мама в офисе (посадка, руки на
// клавиатуре), камеры половин, поиск момента слова в озвучке.
import type { Place, PoseIn } from "../rig/Actor";
import { keys } from "../rig/motion";
import { OFFICE } from "../sets/Office";
import type { Cam } from "../shots";

// Рост персонажей (px мира).
export const H = { mom: 990, son: 700 } as const;
export const FLOOR = OFFICE.floorY;

// Мама в офисном кресле: точка между стопами и рост.
export const MOM_SEAT = (): Place => ({ x: OFFICE.mom.x, y: FLOOR, h: H.mom });

// Ось зеркала офиса и камеры (кадр целиком / половина).
export const OFFICE_AXIS = 112;
export const CAM_FULL: Cam = { x: 60, y: 990, zoom: 1.1 };
export const CAM_HALF: Cam = { x: OFFICE_AXIS, y: 1000, zoom: 0.98 };

// Руки на клавиатуре ноутбука: мягкое «печатание» (кисти по очереди).
export const typePose = (t: number, typing = 1, seed = 0): PoseIn => {
  const kx = OFFICE.laptop.x;
  const ky = OFFICE.laptop.y - 10;
  const a = Math.sin((t + seed) / 2.1);
  const b = Math.sin((t + seed) / 2.5 + 1.3);
  return {
    sit: 1,
    seat: OFFICE.mom.seat,
    lean: 7,
    lookY: 0.22,
    armR: { target: { x: kx - 60 + a * 7 * typing, y: ky - Math.max(0, a) * 9 * typing }, shape: "relax", elbow: "down", behind: false },
    armL: { target: { x: kx - 110 + b * 7 * typing, y: ky + 2 - Math.max(0, b) * 8 * typing }, shape: "relax", elbow: "down", behind: false },
  };
};

export { wordFrame } from "../beats";

// Плавное «включение» 0→1 между кадрами a и b.
export const ramp = (f: number, a: number, b: number) => keys(f, [[a, 0], [b, 1]]);
