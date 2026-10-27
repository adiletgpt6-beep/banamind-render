// Положение реквизита фильма 80-1-7 в комнате (px мира) — чистые константы
// для хореографии, монтажного плана и тестов. Рисунок — set.tsx.
export const TABLE = { x1: 1740, x2: 2420, top: 1300, h: 56, legH: 118 } as const;
export const GLOBE = { cx: 2010, r: 112, cy: 1300 - 112 * 1.47 } as const; // центр шара над столом
export const LAMP = { baseX: 2330, baseY: 1300, headX: 2256, headY: GLOBE.cy } as const; // голова на уровне центра шара, свет влево
export const SHEETS = { day: { x: 1830, y: 1286, rot: -7 }, night: { x: 1905, y: 1282, rot: 5 }, blank: { x: 1790, y: 1296, rot: 2 } } as const;
export const BOAT = { x: 1985, y: 1286 } as const;
// занавеска: висит слева от окна, прикрывается вправо (доля ширины окна)
export const CURTAIN = { closedFrac: 0.46 } as const;

