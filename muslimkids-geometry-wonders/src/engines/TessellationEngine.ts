// TessellationEngine — замощения плоскости без промежутков.
//
// • hexSpiral — шестиугольная сетка (осевые координаты) в порядке спирали
//   от центра: 1, затем соседи по кругу… — так соты «строятся» ячейка
//   за ячейкой, без хаоса.
// • triangleGrid — треугольная сетка (основа рельефа: каждая клетка
//   делится на два треугольника, диагональ чередуется).
import type { Vec2 } from "./GeometryWondersEngine";

export type HexCell = { q: number; r: number; ring: number; order: number; x: number; y: number };

const DIRS: [number, number][] = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

/** Центр ячейки для «острой» вершины вверх (pointy-top), size — радиус описанной окружности. */
export function hexToPixel(q: number, r: number, size: number): Vec2 {
  return [size * Math.sqrt(3) * (q + r / 2), size * 1.5 * r];
}

/** Ячейки до кольца maxRing включительно, по спирали. Всего 1 + 3·R·(R+1). */
export function hexSpiral(maxRing: number, size: number): HexCell[] {
  const cells: HexCell[] = [];
  const push = (q: number, r: number, ring: number) => {
    const [x, y] = hexToPixel(q, r, size);
    cells.push({ q, r, ring, order: cells.length, x, y: -y });
  };
  push(0, 0, 0);
  for (let k = 1; k <= maxRing; k++) {
    let q = DIRS[4][0] * k;
    let r = DIRS[4][1] * k;
    for (let side = 0; side < 6; side++) {
      for (let step = 0; step < k; step++) {
        push(q, r, k);
        q += DIRS[side][0];
        r += DIRS[side][1];
      }
    }
  }
  return cells;
}

export type GridTri = { a: number; b: number; c: number; cx: number; cz: number };

/** Треугольная сетка cols×rows клеток размера cell на плоскости XZ, центр в 0. */
export function triangleGrid(cols: number, rows: number, cell: number) {
  const verts: { x: number; z: number }[] = [];
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      // Сдвиг чётных рядов на полклетки — почти равносторонние треугольники.
      verts.push({ x: (i - cols / 2 + (j % 2) * 0.5) * cell, z: (j - rows / 2) * cell * 0.866 });
    }
  }
  const idx = (i: number, j: number) => j * (cols + 1) + i;
  const tris: GridTri[] = [];
  const add = (a: number, b: number, c: number) => {
    tris.push({ a, b, c, cx: (verts[a].x + verts[b].x + verts[c].x) / 3, cz: (verts[a].z + verts[b].z + verts[c].z) / 3 });
  };
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const v00 = idx(i, j);
      const v10 = idx(i + 1, j);
      const v01 = idx(i, j + 1);
      const v11 = idx(i + 1, j + 1);
      if (j % 2 === 0) {
        add(v00, v01, v10);
        add(v10, v01, v11);
      } else {
        add(v00, v11, v10);
        add(v00, v01, v11);
      }
    }
  }
  return { verts, tris };
}
