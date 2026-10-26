// ThreadCameraController — кинематографическая камера по ключевым кадрам.
// Позиция и цель интерполируются кубическим сплайном Эрмита с касательными Катмулла–Рома,
// масштабированными по времени: скорость непрерывна на ключах (без рывков «стоп-старт»),
// а в первом/последнем ключе камера мягко замирает. ease — локальная кривая на сегменте.
import type { CameraState } from "./types";
import { V3 } from "../utils/math";

export interface CamKey {
  f: number;
  pos: V3;
  target: V3;
  fov: number;
  roll?: number;
  /** Остановка в ключе (нулевая скорость) — для спокойных планов. */
  hold?: boolean;
}

const hermite = (p0: number, p1: number, m0: number, m1: number, t: number) => {
  const t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * m1;
};

export const interpolateKeys = <T extends Record<string, unknown>>(
  f: number,
  keys: (T & { f: number; hold?: boolean })[],
  fields: { name: keyof T; dims: number }[],
): Record<string, number[]> => {
  const out: Record<string, number[]> = {};
  if (f <= keys[0].f || keys.length === 1) {
    for (const fd of fields) out[fd.name as string] = toArr(keys[0][fd.name], fd.dims);
    return out;
  }
  const last = keys[keys.length - 1];
  if (f >= last.f) {
    for (const fd of fields) out[fd.name as string] = toArr(last[fd.name], fd.dims);
    return out;
  }
  let i = 0;
  while (i < keys.length - 2 && f >= keys[i + 1].f) i++;
  const k0 = keys[i], k1 = keys[i + 1];
  const km = keys[i - 1], kp = keys[i + 2];
  const dt = k1.f - k0.f;
  const t = (f - k0.f) / dt;
  for (const fd of fields) {
    const a = toArr(k0[fd.name], fd.dims), b = toArr(k1[fd.name], fd.dims);
    const am = km ? toArr(km[fd.name], fd.dims) : a;
    const bp = kp ? toArr(kp[fd.name], fd.dims) : b;
    const res: number[] = [];
    for (let d = 0; d < fd.dims; d++) {
      // касательные в единицах «на сегмент»
      let m0 = 0, m1 = 0;
      if (km && !k0.hold) m0 = ((b[d] - am[d]) / (k1.f - km.f)) * dt;
      if (kp && !k1.hold) m1 = ((bp[d] - a[d]) / (kp.f - k0.f)) * dt;
      // в крайних ключах касательная нулевая — мягкий старт/финиш
      res.push(hermite(a[d], b[d], m0, m1, t));
    }
    out[fd.name as string] = res;
  }
  return out;
};

const toArr = (v: unknown, dims: number): number[] => (dims === 1 ? [v as number] : [...(v as number[])]);

export const cameraAt = (f: number, keys: CamKey[]): CameraState => {
  const r = interpolateKeys(f, keys as (CamKey & Record<string, unknown>)[], [
    { name: "pos", dims: 3 },
    { name: "target", dims: 3 },
    { name: "fov", dims: 1 },
  ]);
  return { pos: r.pos as V3, target: r.target as V3, fov: r.fov[0] };
};
