// Планировка фильма 80-1-10 (чистые константы без React — их читают
// хореография, монтаж, тесты и Node-скрипты). Три системы координат:
//
//   • мир комнаты (px) — тот же класс, что в 80-1-6…80-1-9 (sets/roomLayout.ts):
//     доска слева на задней стене, полка с книгами, окно с деревом и ростком
//     справа, низкий столик у окна;
//   • стол «сверху» (мм): u — вдоль столика слева направо (как в комнате),
//     v — поперёк, от края у детей (0) к краю у камеры комнаты (TABLE_DEPTH_MM).
//     Вид сверху (DeskView) снят «со стороны детей»: руки входят снизу кадра,
//     порядок слева направо тот же, что в комнате (Билал, Амир, Юсуф, учитель);
//   • плакат (мм, A1 горизонтально, 841 × 594): x вправо, y вниз от верхнего
//     края с заголовком.
//
// Масштаб: Юсуф (≈ 1 м) в комнате ≈ 426 px, поэтому 1 мм ≈ 0,425 px мира.

export type Vec = { readonly x: number; readonly y: number };

export const MM = 0.425; // px мира на мм

// ---------- Столик у окна (тот же, что в 80-1-7 и 80-1-8) ----------
export const TABLE = { x1: 1740, x2: 2420, top: 1300, h: 56, legH: 118 } as const;
export const TABLE_LEN_MM = (TABLE.x2 - TABLE.x1) / MM; // 1600 мм
export const TABLE_DEPTH_MM = 700;
// Сжатие глубины стола в плане комнаты: лист 594 мм ≈ 33 px.
export const DESK_FS = 0.13;

// Точка на столе (u, v мм) → мир комнаты (px).
export const deskToWorld = (u: number, v: number): Vec => ({ x: TABLE.x1 + u * MM, y: TABLE.top - (TABLE_DEPTH_MM - v) * MM * DESK_FS });
export const worldToDeskU = (x: number) => (x - TABLE.x1) / MM;

// ---------- Места за столиком (точка между ступнями) ----------
// Слева направо: Билал, Амир, Юсуф, учитель — как в 80-1-7/80-1-8.
export const AT_TABLE = {
  bilal: { x: 1790, y: 1346 },
  amir: { x: 1940, y: 1342 },
  yusuf: { x: 2130, y: 1340 },
  teacher: { x: 2300, y: 1332 },
} as const;
// Амир в сцене 6 спокойно пересаживается ближе к Юсуфу.
export const AMIR_NEAR_YUSUF = { x: 2006, y: 1342 } as const;

// ---------- Плакат (мм) ----------
export const POSTER = { w: 841, h: 594 } as const;
export const POSTER_TITLE = { cx: 420.5, baseline: 76, size: 50, top: 22, bottom: 92 } as const;
export const TEXT_CARD = {
  one: { x: 104, y: 104, w: 250, h: 48 },
  two: { x: 380, y: 104, w: 357, h: 48 },
} as const;
// Детская карточка: 104 × 70 мм; в единицах рисунка 300 × 202.
export const CARD_MM = { w: 104, h: 70 } as const;
export const CARD_UNITS = { w: 300, h: 202 } as const;
export const GRID = { rows: 5, cols: 5, x0: 124.5, y0: 166, cellW: 104, cellH: 70, gapX: 18, gapY: 14 } as const;
// Центр ячейки (row, col) на плакате, мм.
export const cellCenter = (row: number, col: number): Vec => ({
  x: GRID.x0 + GRID.cellW / 2 + col * (GRID.cellW + GRID.gapX),
  y: GRID.y0 + GRID.cellH / 2 + row * (GRID.cellH + GRID.gapY),
});

// ---------- Плакат на столе ----------
// Нижний край (сетка) — у детей, верхний (заголовок) — к камере комнаты.
export const POSTER_ON_DESK = { u0: 368, v0: 60 } as const;
// Точка плаката (мм) → стол (мм).
export const posterToDesk = (p: Vec): Vec => ({ x: POSTER_ON_DESK.u0 + p.x, y: POSTER_ON_DESK.v0 + POSTER.h - p.y });
export const deskToPoster = (d: Vec): Vec => ({ x: d.x - POSTER_ON_DESK.u0, y: POSTER_ON_DESK.v0 + POSTER.h - d.y });

// ---------- Предметы на столе (мм стола; центр предмета) ----------
export const DESK = {
  // где каждый из трёх главных рисует свою карточку (сцена 1)
  drawBilal: { x: 190, y: 230, rot: -4 },
  drawAmir: { x: 486, y: 150, rot: 3 },
  drawYusuf: { x: 918, y: 146, rot: -5 },
  // плоский пенал с цветными карандашами у края детей, между Амиром и Юсуфом
  pencilTray: { x: 690, y: 34, w: 170, h: 42 },
  // закрытая папка «Наши вопросы» справа от листа, перед Юсуфом и учителем
  folder: { x: 1330, y: 196, w: 236, h: 318, rot: -3 },
  // две текстовые карточки учителя лицом вниз и полоски крепления
  textStack: { x: 1480, y: 520, rot: 2 },
  tapeHolder: { x: 1500, y: 330, w: 96, h: 150 },
  marker: { x: 1430, y: 380, rot: 70 },
  // лодочка Амира: сначала слева на свободной части стола, в сцене 5 — у
  // карточки с деревом (под ней, на нижнем свободном поле листа), в сцене 7 —
  // снова на свободной части стола (сетка освобождается для сборки)
  boatStart: { x: 262, y: 430 },
  boatByTree: { x: 790, y: 150 },
  boatAside: { x: 250, y: 470 },
  // стопка карточек, которые собрал Билал, — рядом с учителем
  collected: { x: 1280, y: 470, rot: -6 },
} as const;

// ---------- Комната ----------
// Коран на подставке — на отдельной невысокой тумбе у правой стены, вдали
// от карандашей и бумаги.
export const QURAN_CABINET = { x: 2452, y: 868, w: 128, h: 132 } as const; // y — верх тумбы, низ — линия пола 1000
export const QURAN_ON_STAND = { x: 2516, y: 836, w: 70 } as const;
// Прежний рисунок Земли (из 80-1-7) — приколот к стене между полкой и окном.
export const OLD_EARTH_PIN = { x: 1774, y: 346, w: 126, rot: -2 } as const;
// Плакат на доске: доска 300…1060 × 210…630, плакат 357 × 252 px.
export const POSTER_ON_BOARD = { x: 680 - (POSTER.w * MM) / 2, y: 300, w: POSTER.w * MM, h: POSTER.h * MM } as const;
// Глобус из 80-1-7 на полу справа от столика (как в 80-1-8).
export const GLOBE_FLOOR = { cx: 2560, r: 104, baseY: 1446 } as const;
export const LAMP_ASIDE = { baseX: 2404, baseY: 682 } as const;

// Финальные места у доски (сцена 8; точка между ступнями).
export const AT_BOARD = {
  teacher: { x: 436, y: 1012 },
  teacherHang: { x: 640, y: 1012 }, // пока вешает плакат
  bilal: { x: 942, y: 1016 },
  amir: { x: 1026, y: 1018 },
  yusuf: { x: 1104, y: 1020 },
} as const;
