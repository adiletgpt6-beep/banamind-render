// TextileDynamicsEngine — процедурная, но физически убедительная динамика нитей.
// Без недетерминированной симуляции: каждое состояние — функция кадра.
//  • smooth: лапласово сглаживание — убирает резкие углы в стыках форм;
//  • freeEndSway: колебание свободного конца с затуханием к закреплённому концу и
//    запаздыванием фазы вдоль длины (инерция: «волна» бежит к кончику);
//  • tensionSag: провисание, которое исчезает при натяжении;
//  • wind: мягкий ветер для листьев и облаков.
import type { Path } from "./ThreadContinuityEngine";
import { V3 } from "../utils/math";

export const smooth = (p: Path, iterations = 2, strength = 0.5, closed = false, keepEnds = true): Path => {
  const n = p.length / 3;
  let a = p.slice();
  let b = new Float32Array(p.length);
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < n; i++) {
      let i0 = i - 1, i1 = i + 1;
      if (closed) { i0 = (i0 + n) % n; i1 = i1 % n; } else if (i0 < 0 || i1 >= n) {
        for (let c = 0; c < 3; c++) b[i * 3 + c] = a[i * 3 + c];
        if (keepEnds) continue;
        i0 = Math.max(0, i0); i1 = Math.min(n - 1, i1);
      }
      for (let c = 0; c < 3; c++) {
        const avg = (a[i0 * 3 + c] + a[i1 * 3 + c]) * 0.5;
        b[i * 3 + c] = a[i * 3 + c] + (avg - a[i * 3 + c]) * strength;
      }
    }
    const t = a; a = b; b = t;
  }
  return a;
};

/**
 * Колебание свободного конца. anchorEnd = 0 — закреплено начало (s=0), качается конец.
 * amp — амплитуда на кончике, freq — рад/кадр, k — фазовое запаздывание вдоль длины.
 */
export const freeEndSway = (p: Path, f: number, amp: number, dir: V3, freq = 0.08, k = 4, anchorEnd: 0 | 1 = 0): Path => {
  const n = p.length / 3;
  const out = p.slice();
  for (let i = 0; i < n; i++) {
    const s = n === 1 ? 0 : i / (n - 1);
    const w = anchorEnd === 0 ? s : 1 - s;
    const a = amp * w * w * Math.sin(freq * f - k * w);
    out[i * 3] += dir[0] * a;
    out[i * 3 + 1] += dir[1] * a;
    out[i * 3 + 2] += dir[2] * a;
  }
  return out;
};

/** Провисание между закреплёнными концами: sag·sin(πs), убывает с натяжением tension 0..1. */
export const tensionSag = (p: Path, sag: number, tension: number, dir: V3 = [0, -1, 0]): Path => {
  const n = p.length / 3;
  const out = p.slice();
  const amp = sag * (1 - tension);
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1);
    const a = amp * Math.sin(Math.PI * s);
    out[i * 3] += dir[0] * a;
    out[i * 3 + 1] += dir[1] * a;
    out[i * 3 + 2] += dir[2] * a;
  }
  return out;
};

/** Мягкий ветер: смещение, растущее с параметром w (0 у основания, 1 на кончике). */
export const windOffset = (x: number, y: number, z: number, f: number, w: number, amp: number): V3 => {
  const ph = x * 1.7 + z * 1.3 + y * 0.6;
  const g = Math.sin(f * 0.07 + ph) * 0.65 + Math.sin(f * 0.13 + ph * 1.9) * 0.35;
  return [g * amp * w, Math.sin(f * 0.09 + ph * 1.3) * amp * 0.35 * w, Math.cos(f * 0.06 + ph) * amp * 0.6 * w];
};
