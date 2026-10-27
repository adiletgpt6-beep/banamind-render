// Где лицо автора в момент t (кадр 1080×1920) и какого оно цвета.
// Данные — face-data.ts (YuNet по каждому кадру, scripts/live-videos/facetrack.py).
// Интерполяция только внутри плана: через склейку лицо «перескакивает».
// Без импортов Remotion — модуль читают Node-тесты и check.mjs.
import { FACE_CUTS, FACE_SAMPLES } from "./face-data.ts";

export type Face = {
  readonly cx: number;
  readonly cy: number;
  readonly w: number;
  readonly h: number;
  readonly rgb: readonly [number, number, number];
};

export const shotIndex = (t: number) => FACE_CUTS.filter((c) => t >= c - 1e-6).length;

const toFace = (v: readonly number[]): Face => ({ cx: v[1], cy: v[2], w: v[3], h: v[4], rgb: [v[5], v[6], v[7]] });

export const faceAt = (t: number): Face => {
  const s = shotIndex(t);
  const inShot = FACE_SAMPLES.filter((v) => shotIndex(v[0]) === s);
  const list = inShot.length ? inShot : FACE_SAMPLES;
  const i = list.findIndex((v) => v[0] > t);
  if (i === -1) return toFace(list[list.length - 1]);
  if (i === 0) return toFace(list[0]);
  const a = list[i - 1];
  const b = list[i];
  const k = (t - a[0]) / (b[0] - a[0]);
  return toFace(a.map((x, j) => (j === 0 ? t : x + (b[j] - x) * k)));
};

// Прямоугольник лица с запасом (волосы сверху, подбородок/борода снизу).
export const faceBox = (t: number, pad = 0) => {
  const f = faceAt(t);
  return {
    left: f.cx - f.w * 0.62 - pad,
    right: f.cx + f.w * 0.62 + pad,
    top: f.cy - f.h * 0.72 - pad,
    bottom: f.cy + f.h * 0.6 + pad,
  };
};

// Средний цвет лица, сглаженный по времени внутри плана (±0,4 с) —
// чтобы коррекция не «дышала» вслед за каждым всплеском фонтана.
export const faceColorAt = (t: number): readonly [number, number, number] => {
  const s = shotIndex(t);
  const acc = [0, 0, 0];
  let n = 0;
  for (let d = -0.4; d <= 0.4001; d += 0.1) {
    const u = t + d;
    if (shotIndex(u) !== s || u < 0) continue;
    const c = faceAt(u).rgb;
    const wgt = 1 - Math.abs(d) / 0.5;
    acc[0] += c[0] * wgt;
    acc[1] += c[1] * wgt;
    acc[2] += c[2] * wgt;
    n += wgt;
  }
  return [acc[0] / n, acc[1] / n, acc[2] / n];
};
