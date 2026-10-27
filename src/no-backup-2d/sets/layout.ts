// Общие ориентиры декораций и траекторий; без React.

export const HALL = {
  floorY: 1560,
  door: { x: 760, y: 640, w: 290, h: 920 },
  handle: { x: 1018, y: 1120 },
  hook: { x: 1262, y: 1000 }, // ключи от машины: ключница у двери, на высоте плеча мамы
  console: { x: 1140, y: 1300, w: 330 },
  phone: { x: 1350, y: 1292 }, // телефон мамы на тумбе
  clock: { x: 600, y: 470, r: 70 },
  kitchen: { x: 1720, y: 600, w: 380 },
} as const;

export const SCHOOL = {
  door: { x: 440, y: 1450, w: 320, h: 700 }, // выше ребёнка в полтора раза
  groundY: 1520,
} as const;

export const OFFICE = {
  floorY: 1500,
  desk: { x: 420, y: 1360, w: 480 }, // стол мамы
  chair: { x: 660, y: 1720 },
  door: { x: 60, y: 560, w: 260, h: 940 },
} as const;
