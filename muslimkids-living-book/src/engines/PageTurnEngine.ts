import * as THREE from "three";
import { clamp, mix } from "../utils/math";

/**
 * PageTurnEngine — процедурная деформация листа при перелистывании.
 *
 * Лист — тонкая «лента» с толщиной: лицевая и оборотная поверхности,
 * срезы по трём сторонам. Средняя линия листа в плоскости XY (корешок —
 * ось Z в точке x = 0) задаётся углом наклона φ(s) вдоль ширины s:
 *
 *   φ(s, z) = clamp(θ(p) + c(p) · (s/W)² · (1 + κ·z), 0, π)
 *   θ(p) = π·p — общий поворот вокруг корешка;
 *   c(p) = A·sin(2πp) — изгиб: в начале внешний край поднимается первым,
 *          во второй половине отстаёт и мягко «ложится» последним;
 *   κ   — диагональный завиток: ближний к зрителю угол ведёт движение.
 *
 * Положение точки — интеграл касательной (cos φ, sin φ) от корешка.
 * Так лист не растягивается (длина дуги = W) и не проходит сквозь блок:
 * φ ограничен диапазоном [0, π]. Нормали пересчитываются каждый кадр,
 * поэтому свет и тени на странице естественно меняются во время поворота.
 */

export type SheetParams = {
  width: number;
  depth: number;
  thickness: number;
  /** 0 — лист лежит справа, 1 — слева. */
  progress: number;
  /** Высота нижней грани листа у корешка справа и слева. */
  yRight: number;
  yLeft: number;
  /** Сила изгиба (тонкий лист ≈ 0.9, толстая пачка ≈ 0.3). */
  bend?: number;
  curl?: number;
};

export const SHEET_SEG_S = 44;
export const SHEET_SEG_Z = 10;

/** Геометрия листа: группы материалов 0 — лицевая, 1 — оборот, 2 — срез. */
export const createSheetGeometry = (nS = SHEET_SEG_S, nZ = SHEET_SEG_Z) => {
  const g = new THREE.BufferGeometry();
  const grid = (nS + 1) * (nZ + 1);
  const edgeOuter = (nZ + 1) * 2;
  const edgeSide = (nS + 1) * 2;
  const count = grid * 2 + edgeOuter + edgeSide * 2;
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const uv = new Float32Array(count * 2);
  const idx: number[] = [];
  const F = 0;
  const B = grid;
  for (let i = 0; i <= nS; i++) {
    for (let j = 0; j <= nZ; j++) {
      const k = i * (nZ + 1) + j;
      const u = i / nS;
      const v = 1 - j / nZ;
      uv[(F + k) * 2] = u;
      uv[(F + k) * 2 + 1] = v;
      uv[(B + k) * 2] = 1 - u;
      uv[(B + k) * 2 + 1] = v;
    }
  }
  const front: number[] = [];
  const back: number[] = [];
  for (let i = 0; i < nS; i++) {
    for (let j = 0; j < nZ; j++) {
      const a = i * (nZ + 1) + j;
      const b = a + 1;
      const c = a + (nZ + 1);
      const d = c + 1;
      front.push(F + a, F + b, F + c, F + b, F + d, F + c);
      back.push(B + a, B + c, B + b, B + b, B + c, B + d);
    }
  }
  const edge: number[] = [];
  const O = grid * 2;
  for (let j = 0; j < nZ; j++) {
    const a = O + j * 2;
    edge.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  for (let side = 0; side < 2; side++) {
    const S0 = O + edgeOuter + side * edgeSide;
    for (let i = 0; i < nS; i++) {
      const a = S0 + i * 2;
      if (side === 0) edge.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      else edge.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  for (let k = O; k < count; k++) {
    uv[k * 2] = (k % 2) * 0.5;
    uv[k * 2 + 1] = ((k - O) / (count - O)) % 1;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  idx.push(...front, ...back, ...edge);
  g.setIndex(idx);
  g.addGroup(0, front.length, 0);
  g.addGroup(front.length, back.length, 1);
  g.addGroup(front.length + back.length, edge.length, 2);
  g.userData = { nS, nZ, grid, edgeOuter, edgeSide };
  return g;
};

/** Средняя линия листа: x, y и угол φ для каждой точки (s_i, z_j). */
export const sheetCenterline = (p: SheetParams, nS: number, nZ: number) => {
  const W = p.width;
  const D = p.depth;
  const pr = clamp(p.progress);
  const theta = Math.PI * (0.5 - 0.5 * Math.cos(Math.PI * pr));
  const A = (p.bend ?? 0.9) * Math.sin(2 * Math.PI * pr);
  const kappa = (p.curl ?? 0.55) * Math.sin(Math.PI * pr);
  const y0 = mix(p.yRight, p.yLeft, theta / Math.PI) + p.thickness / 2;
  const ds = W / nS;
  const out: { x: number; y: number; phi: number }[][] = [];
  for (let j = 0; j <= nZ; j++) {
    const zn = j / nZ - 0.5;
    const row: { x: number; y: number; phi: number }[] = [];
    let x = 0;
    let y = y0;
    for (let i = 0; i <= nS; i++) {
      const s = i * ds;
      const phi = clamp(theta + A * (s / W) ** 2 * (1 + kappa * zn * 2), 0, Math.PI);
      row.push({ x, y, phi });
      // интеграл касательной по средней точке отрезка
      const sm = s + ds / 2;
      const phim = clamp(theta + A * (sm / W) ** 2 * (1 + kappa * zn * 2), 0, Math.PI);
      x += Math.cos(phim) * ds;
      y += Math.sin(phim) * ds;
    }
    out.push(row);
  }
  return { rows: out, depth: D };
};

export const updateSheetGeometry = (g: THREE.BufferGeometry, p: SheetParams) => {
  const { nS, nZ, grid, edgeOuter, edgeSide } = g.userData as Record<string, number>;
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  const { rows } = sheetCenterline(p, nS, nZ);
  const h = p.thickness / 2;
  const D = p.depth;
  const set = (k: number, x: number, y: number, z: number) => {
    arr[k * 3] = x;
    arr[k * 3 + 1] = y;
    arr[k * 3 + 2] = z;
  };
  const surf = (i: number, j: number, sign: number) => {
    const c = rows[j][i];
    const nx = -Math.sin(c.phi);
    const ny = Math.cos(c.phi);
    return [c.x + nx * h * sign, c.y + ny * h * sign, -D / 2 + (j / nZ) * D] as const;
  };
  for (let i = 0; i <= nS; i++) {
    for (let j = 0; j <= nZ; j++) {
      const k = i * (nZ + 1) + j;
      const f = surf(i, j, 1);
      const b = surf(i, j, -1);
      set(k, f[0], f[1], f[2]);
      set(grid + k, b[0], b[1], b[2]);
    }
  }
  const O = grid * 2;
  for (let j = 0; j <= nZ; j++) {
    const f = surf(nS, j, 1);
    const b = surf(nS, j, -1);
    set(O + j * 2, f[0], f[1], f[2]);
    set(O + j * 2 + 1, b[0], b[1], b[2]);
  }
  for (let side = 0; side < 2; side++) {
    const S0 = O + edgeOuter + side * edgeSide;
    const j = side === 0 ? 0 : nZ;
    for (let i = 0; i <= nS; i++) {
      const f = surf(i, j, 1);
      const b = surf(i, j, -1);
      set(S0 + i * 2, f[0], f[1], f[2]);
      set(S0 + i * 2 + 1, b[0], b[1], b[2]);
    }
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingSphere();
};
