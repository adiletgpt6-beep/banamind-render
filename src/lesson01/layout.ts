// Постоянный план учебной комнаты (мировые координаты 3840×2160).
// Все ракурсы — окно камеры на этот же мир, поэтому доска, окно, полки,
// стол и места учеников не меняют сторону между склейками.
//
//   стена:  [доска 300–1500] [шкаф 1640–2120] [окно 2380–3100] [тумба 3250–3800]
//   пол:    учитель (1270) — столик с домиком (1590) — ученики справа (1880–3460),
//           все ученики сидят лицом к учителю и столику (влево), учитель — к ним.
import type { P } from "./rig/geom.ts";

export const WORLD = { w: 3840, h: 2160 } as const;
export const FLOOR_Y = 1150; // линия пола у стены
export const FRONT_Y = 2160;

// Перспектива: масштаб персонажа/предмета по линии его опоры на полу.
export const scaleAt = (y: number) => 0.5 + (0.5 * (y - FLOOR_Y)) / (FRONT_Y - FLOOR_Y);

export const BOARD = { x: 300, y: 230, w: 1200, h: 660 } as const;
export const SHELF = { x: 1640, y: 400, w: 480, h: FLOOR_Y - 400 } as const;
export const WINDOW = { x: 2380, y: 230, w: 720, h: 660 } as const;
export const CABINET = { x: 3250, y: 780, w: 540, h: FLOOR_Y - 780 } as const;

export const TABLE = { x: 1590, floorY: 1990, w: 470, legH: 150, topD: 64 } as const;
export const tableTopY = () => TABLE.floorY - TABLE.legH * scaleAt(TABLE.floorY);

// Учитель на одной глубине со столиком: его кисти над столешницей и домиком
// рисуются поверх них (правильное перекрытие при сборке).
export const TEACHER_SPOT: P = { x: 1290, y: 2004 };
export const TOYBOX: P = { x: 1792, y: 2086 };

// Места учеников: 5 рядов по 5 (со смещением рядов, чтобы лица читались).
// Индексы героев: Юсуф — первый ряд у стола, Амир — первый ряд, Билал —
// второй ряд у стола.
export const ROWS: { y: number; xs: number[] }[] = [
  { y: 2070, xs: [1862, 2250, 2615, 2980, 3345] },
  { y: 1900, xs: [2085, 2430, 2775, 3120, 3460] },
  { y: 1745, xs: [1995, 2310, 2625, 2940, 3255] },
  { y: 1600, xs: [2150, 2445, 2740, 3035, 3330] },
  { y: 1465, xs: [2045, 2320, 2595, 2870, 3145] },
];

export type Seat = { row: number; col: number; x: number; y: number };
export const SEATS: Seat[] = ROWS.flatMap((r, row) => r.xs.map((x, col) => ({ row, col, x, y: r.y })));

export const HERO_SEATS = { yusuf: 0, amir: 1, bilal: 5 } as const; // индексы в SEATS
