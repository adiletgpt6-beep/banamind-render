// WovenSculptureEngine — превращение плоского полотна в объёмные формы.
//
// 1) bendToSphere: полотно с координатами (u, v) (длина дуги) изгибается с кривизной κ.
//    κ = 0 — плоскость; растёт — центр поднимается, края закручиваются; κ = 1/R —
//    замкнутая сфера радиуса R. Длины нитей при этом сохраняются (изометрия по утку и основе
//    в центре), поэтому зритель видит именно изгиб ткани, а не подмену модели.
// 2) drapeHeightfield: полотно ложится на рельеф (горы), смещения переплетения идут по нормали.
import { V3 } from "../utils/math";

export interface SurfacePoint { p: V3; n: V3 }

/**
 * Точка изогнутого полотна. lon/lat — угловые координаты будущей сферы (рад), R — её радиус,
 * k — доля изгиба 0..1 (κ = k / R). Центр финальной сферы — в начале координат.
 */
export const bendToSphere = (lon: number, lat: number, R: number, k: number): SurfacePoint => {
  const u = lon * R, v = lat * R;
  if (k < 1e-4) return { p: [u, v, 0], n: [0, 0, 1] };
  const kap = k / R;
  const rho = 1 / kap;
  const a = u * kap, b = v * kap;
  const cb = Math.cos(b);
  const nx = cb * Math.sin(a), ny = Math.sin(b), nz = cb * Math.cos(a);
  // сфера радиуса rho с центром (0,0,-rho), затем сдвиг так, чтобы при k=1 центр был в 0
  return { p: [rho * nx, rho * ny, -rho + rho * nz + R * k], n: [nx, ny, nz] };
};

/** Смещение точки вдоль нормали (переплетение «над/под» на изогнутой поверхности). */
export const offsetAlong = (sp: SurfacePoint, h: number): V3 => [
  sp.p[0] + sp.n[0] * h,
  sp.p[1] + sp.n[1] * h,
  sp.p[2] + sp.n[2] * h,
];

/** Нормаль рельефа по центральным разностям. */
export const heightNormal = (H: (x: number, z: number) => number, x: number, z: number, e = 0.02): V3 => {
  const dx = (H(x + e, z) - H(x - e, z)) / (2 * e);
  const dz = (H(x, z + e) - H(x, z - e)) / (2 * e);
  const l = Math.hypot(dx, 1, dz);
  return [-dx / l, 1 / l, -dz / l];
};

/** Точка полотна, уложенного на рельеф: base + высота, плюс смещение переплетения по нормали. */
export const drapeHeightfield = (
  H: (x: number, z: number) => number, x: number, z: number, baseY: number, h: number,
): V3 => {
  const y = baseY + H(x, z);
  const n = heightNormal(H, x, z);
  return [x + n[0] * h, y + n[1] * h, z + n[2] * h];
};
