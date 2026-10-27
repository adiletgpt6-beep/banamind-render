import { clamp, ease, prog, type Range } from "../utils/math";

/**
 * PopUpWorldEngine — расписание раскрытия и складывания бумажных миров.
 *
 * Типы конструкций (см. компоненты PopUp*):
 *  FOLD_UP          — элемент поднимается вокруг линии сгиба (горы, дерево, рамка);
 *  RADIAL_EXPANSION — сегменты раскрываются веером из центра (Земля, спицы орбит);
 *  LAYERED_POPUP    — слои бумаги встают по очереди (холмы, облака);
 *  PAPER_BLOOM      — лепестки/листья раскрываются как цветок (крона, росток);
 *  ORBITAL_STRUCTURE— тонкие бумажные дуги вокруг планеты/солнца;
 *  WORLD_COLLAPSE   — обратный ход: всё складывается в страницу и уходит в сгиб.
 *
 * Каждый элемент описывается отрезком раскрытия и общим отрезком
 * складывания мира. Значение 0 — бумага плоская, 1 — конструкция собрана.
 * При складывании элементы закрываются в обратном порядке (последний
 * раскрывшийся складывается первым), как в настоящей pop-up книге.
 */

export enum FoldType {
  FOLD_UP = "fold-up",
  RADIAL_EXPANSION = "radial-expansion",
  LAYERED_POPUP = "layered-popup",
  PAPER_BLOOM = "paper-bloom",
  ORBITAL_STRUCTURE = "orbital-structure",
  WORLD_COLLAPSE = "world-collapse",
}

export type PopUpElement = { type: FoldType; open: Range; order?: number };

/**
 * Состояние элемента: раскрытие по своему отрезку, складывание — по общему
 * отрезку мира со сдвигом: order = 0 складывается последним, крупные
 * несущие части (основание) складываются в самом конце.
 */
export const elementState = (
  t: number,
  open: Range,
  collapse: Range,
  order = 0,
  orders = 1,
  fnOpen: (x: number) => number = ease.inOutCubic,
) => {
  const opened = prog(t, open, fnOpen);
  if (t <= collapse[0]) return opened;
  const span = collapse[1] - collapse[0];
  // Обратный порядок: элементы с большим order складываются раньше.
  const k = orders <= 1 ? 0 : (orders - 1 - order) / (orders - 1);
  const slot = 0.55;
  const a = collapse[0] + k * span * (1 - slot);
  const b = a + span * slot;
  return opened * (1 - ease.inOutCubic(clamp((t - a) / (b - a))));
};

/** Мир виден между началом раскрытия и концом складывания. */
export const worldVisible = (t: number, first: number, collapse: Range) =>
  t >= first - 0.05 && t <= collapse[1] + 0.02;

/**
 * Финальное «ныряние в сгиб»: в последние 18% складывания плоская
 * конструкция уезжает к корешку и сжимается — без простого исчезновения.
 */
export const tuckIntoGutter = (t: number, collapse: Range) => {
  const span = collapse[1] - collapse[0];
  return ease.inCubic(clamp((t - (collapse[1] - span * 0.18)) / (span * 0.18)));
};

/** i-й элемент из n по очереди внутри общего прогресса p. */
export const seq = (p: number, i: number, n: number, overlap = 0.6) => {
  if (n <= 1) return clamp(p);
  const step = 1 / (n - (n - 1) * overlap);
  const a = i * step * (1 - overlap);
  return clamp((p - a) / step);
};
