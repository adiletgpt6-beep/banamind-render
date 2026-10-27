// LAYER DISCOVERY ENGINE
//
// Увеличенная образовательная модель поперечного среза листа:
//   верхняя кожица (с кутикулой) → палисадная ткань (столбчатые клетки,
//   много хлоропластов) → губчатая ткань (рыхлые клетки и межклетники)
//   с сосудистым пучком (это и есть прожилка: ксилема + флоэма) →
//   нижняя кожица с устьицами.
// Модель в собственных единицах (ширина блока 1.2), раскладка клеток
// детерминирована (seed), состояние — функция оси масштаба s.
import { Vector3 } from "three";
import { mulberry32 } from "../utils/random";
import { smootherstep, smoothstep } from "./CameraTransitionEngine";

export const BLOCK = {
  sizeX: 1.2,
  sizeZ: 0.8,
  sizeY: 0.5,
  layers: {
    lower: [0.0, 0.065],
    spongy: [0.065, 0.24],
    palisade: [0.24, 0.42],
    upper: [0.42, 0.49],
    cuticle: [0.49, 0.502],
  },
  bundle: { y: 0.152, z: 0.0, r: 0.074 },
  /** Сдвиг слоёв в раскрытом состоянии (по оси толщины). */
  explode: { upper: 0.4, palisade: 0.2, spongy: 0, lower: -0.17 },
};

export type Cell = { pos: Vector3; size: Vector3; rot: number; seed: number };

const PAL_NX = 15;
const PAL_NZ = 10;
const PAL_R = 0.034;
const PAL_LEN = 0.1;

export function palisadeCells(): Cell[] {
  const rnd = mulberry32(31);
  const cells: Cell[] = [];
  const [y0, y1] = BLOCK.layers.palisade;
  for (let i = 0; i < PAL_NX; i++) {
    for (let k = 0; k < PAL_NZ; k++) {
      const x = -BLOCK.sizeX / 2 + (i + 0.5) * (BLOCK.sizeX / PAL_NX) + (rnd() - 0.5) * 0.008;
      const z = -BLOCK.sizeZ / 2 + (k + 0.5) * (BLOCK.sizeZ / PAL_NZ) + (rnd() - 0.5) * 0.008;
      const h = PAL_LEN * (0.9 + rnd() * 0.15);
      cells.push({
        pos: new Vector3(x, (y0 + y1) / 2 + (rnd() - 0.5) * 0.006, z),
        size: new Vector3(PAL_R * (0.92 + rnd() * 0.1), h, PAL_R),
        rot: rnd() * Math.PI,
        seed: rnd(),
      });
    }
  }
  return cells;
}

/** Клетка для крупного плана: передний ряд (к зрителю), центр по ширине. */
export const FOCUS_INDEX = 7 * PAL_NZ + (PAL_NZ - 1);
export const palisadeCellCenter = () => palisadeCells()[FOCUS_INDEX].pos.clone();

export function epidermisCells(layer: "upper" | "lower"): Cell[] {
  const rnd = mulberry32(layer === "upper" ? 41 : 43);
  const [y0, y1] = BLOCK.layers[layer];
  const nx = 13;
  const nz = 9;
  const cells: Cell[] = [];
  for (let i = 0; i < nx; i++) {
    for (let k = 0; k < nz; k++) {
      const w = BLOCK.sizeX / nx;
      const d = BLOCK.sizeZ / nz;
      const off = (k % 2) * w * 0.35;
      const x = -BLOCK.sizeX / 2 + (i + 0.5) * w + off - w * 0.17;
      if (Math.abs(x) > BLOCK.sizeX / 2 - w * 0.3) continue;
      cells.push({
        pos: new Vector3(x, (y0 + y1) / 2, -BLOCK.sizeZ / 2 + (k + 0.5) * d),
        size: new Vector3(w * (0.94 + rnd() * 0.05), (y1 - y0) * 0.92, d * 0.94),
        rot: 0,
        seed: rnd(),
      });
    }
  }
  return cells;
}

export function spongyCells(): Cell[] {
  const rnd = mulberry32(53);
  const [y0, y1] = BLOCK.layers.spongy;
  const cells: Cell[] = [];
  const b = BLOCK.bundle;
  let guard = 0;
  while (cells.length < 70 && guard++ < 6000) {
    const r = 0.034 + rnd() * 0.02;
    const p = new Vector3(
      (rnd() * 2 - 1) * (BLOCK.sizeX / 2 - r),
      y0 + r * 0.8 + rnd() * (y1 - y0 - r * 1.6),
      (rnd() * 2 - 1) * (BLOCK.sizeZ / 2 - r),
    );
    // Пучок проходит вдоль X: возле него клеток губчатой ткани нет.
    if (Math.hypot(p.y - b.y, p.z - b.z) < b.r + r * 0.9) continue;
    // Рыхлая ткань: клетки почти не соприкасаются — видны межклетники.
    if (cells.some((c) => c.pos.distanceTo(p) < (c.size.x + r) * 0.96)) continue;
    cells.push({ pos: p, size: new Vector3(r, r * (0.8 + rnd() * 0.3), r), rot: rnd() * Math.PI, seed: rnd() });
  }
  return cells;
}

/** Устьица нижней кожицы: пары замыкающих клеток. */
export const STOMATA = [
  new Vector3(-0.32, 0, 0.18),
  new Vector3(0.08, 0, -0.12),
  new Vector3(0.38, 0, 0.24),
  new Vector3(-0.1, 0, 0.3),
];

/** Состояние раскрытия как функция оси масштаба s. */
export function discoveryState(s: number, t: number) {
  // Лист: становится полупрозрачным, прожилки подсвечиваются.
  const xray = smoothstep(10.1, 10.42, s);
  // Квадрат-«лупа» на листе и вылет блока.
  const marker = smoothstep(10.18, 10.32, s) * (1 - smoothstep(10.75, 10.95, s));
  const emerge = smootherstep(10.32, 10.86, s);
  const explode = smootherstep(10.82, 11.0, s);
  // Фон «увеличенной модели» отделяет схему от настоящего дерева.
  const backdrop = smoothstep(10.4, 10.85, s);
  // Детальная клетка проявляется при подлёте к ткани.
  const cellDetail = smoothstep(12.1, 12.6, s);
  // Лист перестаёт колыхаться, когда камера «фиксирует композицию».
  const sway = t < 43 ? 1 - smoothstep(25.4, 27.0, t) : smoothstep(46.4, 47.6, t);
  // Настоящий лист остаётся контекстом, пока камера не уходит в ткань.
  const leafFade = 1 - smoothstep(11.15, 11.7, s);
  return { xray, marker, emerge, explode, backdrop, cellDetail, sway, leafFade };
}
