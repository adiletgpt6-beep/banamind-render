// Расстановка ролика 80-1-4 в той же комнате, что и в предыдущих фильмах
// (src/lesson01/layout.ts — стена, доска, шкаф, окно, тумба, столик, места
// 25 учеников не меняются). Здесь — только новое: где стоят горшок с ростком,
// лейка и карточки на низком столике, куда подходят герои и пути их шагов.
// Без React: используется и режиссурой, и проверками.
//
//   столик (1355…1825):  [стопка карточек] [подставка с карточками] [горшок — светлое место] [лейка]
//   за столиком:          Амир (слева, с 2-й сцены)                     Юсуф (справа)
//   перед столиком:       Мухаммад (слева, как всегда)                               Билал (справа, с 2-й сцены)
import { CABINET, SEATS, TABLE, TEACHER_SPOT, WINDOW, scaleAt } from "../lesson01/layout";
import type { P } from "../lesson01/rig/geom";

export const TS = scaleAt(TABLE.floorY); // масштаб предметов на столе
export const TOP_Y = TABLE.floorY - TABLE.legH * TS; // передний край столешницы
// Точка на столешнице: x — по ширине, z — глубина 0 (передний край) … 1 (задний).
// Столешница нарисована косоугольно: глубина уходит вверх и вправо.
export const onTable = (x: number, z: number): P => ({ x: x + TABLE.topD * TS * 0.55 * z, y: TOP_Y - TABLE.topD * TS * z });

// Предметы (точка опоры — низ по центру).
export const POT0 = onTable(1578, 0.62); // горшок на поддоне: светлое место у окна
export const POT_NEAR_YUSUF = onTable(1626, 0.62); // Билал придвинул поддон к Юсуфу (сцена 6)
export const CAN0 = onTable(1676, 0.6); // лейка рядом с горшком
export const CAN_Y = onTable(1712, 0.66); // Юсуф придвинул лейку к себе и держит её на столе (сцены 3–6)
export const CAN6 = onTable(1745, 0.6); // куда Юсуф ставит лейку: рядом с придвинутым горшком, носик не над ним (сцена 6)
export const RAIL0 = onTable(1438, 0.66); // подставка для карточек (центр)
export const STACK0 = onTable(1420, 0.3); // стопка карточек (рубашкой вверх), перед учителем
export const AMIR_STACK = onTable(1470, 0.4); // куда Амир кладёт собранные карточки (прямо перед собой)

// Пятно солнечного света на столешнице (светлое место горшка).
export const SUN_PATCH = { x: POT0.x + 6, y: POT0.y + 2, w: 150 } as const;

// Персонажи.
export const T_ROOT: P = TEACHER_SPOT; // Мухаммад — у левого края столика
export const Y_SEAT: P = { x: SEATS[0].x, y: SEATS[0].y };
export const A_SEAT: P = { x: SEATS[1].x, y: SEATS[1].y };
export const B_SEAT: P = { x: SEATS[5].x, y: SEATS[5].y };
export const Y_TABLE: P = { x: 1752, y: 1906 }; // Юсуф за столиком справа
export const A_TABLE: P = { x: 1488, y: 1882 }; // Амир за столиком слева (не за плечом учителя)
export const B_TABLE: P = { x: 1874, y: 2052 }; // Билал перед столиком справа

// Пути шагов (мировые точки на полу). Юсуф обходит правый край столика;
// Амир проходит за Юсуфом; Билал спускается к свободному месту Юсуфа.
// сначала — в глубину, огибая правый край столика, затем — вдоль его задней стороны
export const Y_PATH: P[] = [Y_SEAT, { x: 1885, y: 1985 }, { x: 1895, y: 1930 }, Y_TABLE];
export const A_PATH: P[] = [A_SEAT, { x: 1996, y: 1980 }, { x: 1936, y: 1890 }, A_TABLE];
export const B_PATH: P[] = [B_SEAT, { x: 1990, y: 1980 }, B_TABLE];

// Окно (то же, что в первых фильмах) и подставка для книги на тумбе.
export const WINDOW_C: P = { x: WINDOW.x + WINDOW.w / 2, y: WINDOW.y + WINDOW.h / 2 };
export const SILL: P = { x: WINDOW.x + WINDOW.w / 2, y: WINDOW.y + WINDOW.h + 17 };
export const QURAN_AT: P = { x: CABINET.x + 150, y: CABINET.y - 16 };
export const HOUSE_AT: P = { x: CABINET.x + 300, y: CABINET.y - 16 };
