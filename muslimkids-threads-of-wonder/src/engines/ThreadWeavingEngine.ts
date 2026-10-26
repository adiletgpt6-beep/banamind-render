// ThreadWeavingEngine — логика полотняного переплетения «над — под».
//
// Уточная нить i и основная нить j пересекаются в узле (i, j). Знак σ = (−1)^(i+j):
// при σ = +1 уток проходит НАД основой, при σ = −1 — ПОД ней. Смещение по нормали
// к полотну задаётся косинусом с периодом в два шага сетки, поэтому в каждом узле
// уток и основа разведены ровно на 2A (A ≥ радиуса нити) — нити никогда не проходят
// друг сквозь друга, а между узлами плавно изгибаются (мягкое натяжение без углов).

/** Смещение утка (кольца) с индексом i в точке u вдоль нити; u0 — координата основы j=0, du — шаг основ. */
export const weftOffset = (i: number, u: number, u0: number, du: number, A: number) =>
  A * (i % 2 === 0 ? 1 : -1) * Math.cos((Math.PI * (u - u0)) / du);

/** Смещение основы j в точке v вдоль неё; v0 — координата утка i=0, dv — шаг утков. Противофаза утку. */
export const warpOffset = (j: number, v: number, v0: number, dv: number, A: number) =>
  -A * (j % 2 === 0 ? 1 : -1) * Math.cos((Math.PI * (v - v0)) / dv);

/** Знак прохода в узле: +1 — уток сверху. Используется в тестах QA. */
export const crossingSign = (i: number, j: number) => ((i + j) % 2 === 0 ? 1 : -1);

/**
 * Обжатие нити в узле: в месте пересечения нить слегка сплющивается и натягивается.
 * Возвращает множитель радиуса 0.9..1 (минимум в узле).
 */
export const crimp = (u: number, u0: number, du: number) => 0.92 + 0.08 * Math.abs(Math.sin((Math.PI * (u - u0)) / du));

/** Описание прямоугольной полотняной сетки в собственных координатах (u — по утку, v — по основе). */
export interface WeaveGrid {
  wefts: number; // число утков (колец)
  warps: number; // число основ (меридианов)
  uMin: number; uMax: number; // диапазон вдоль утка
  vMin: number; vMax: number; // диапазон вдоль основы
  /** Координаты основ: u_j. */
  warpU: (j: number) => number;
  /** Координаты утков: v_i. */
  weftV: (i: number) => number;
  du: number;
  dv: number;
}

export const makeGrid = (
  wefts: number, warps: number, uMin: number, uMax: number, vMin: number, vMax: number, warpsCentered = true,
): WeaveGrid => {
  const du = (uMax - uMin) / (warpsCentered ? warps : warps - 1);
  const dv = (vMax - vMin) / (wefts - 1);
  return {
    wefts, warps, uMin, uMax, vMin, vMax, du, dv,
    warpU: (j) => uMin + (warpsCentered ? (j + 0.5) * du : j * du),
    weftV: (i) => vMin + i * dv,
  };
};
