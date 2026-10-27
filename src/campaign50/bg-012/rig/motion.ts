// Плавные переходы, моргание, дыхание и микродвижения героев.
// Всё детерминировано от времени (секунды), без случайности между кадрами.
import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.bezier(0.45, 0, 0.25, 1);

// Плавный переход значения между моментами a и b.
export const tw = (t: number, a: number, b: number, from: number, to: number, ease = io) =>
  interpolate(t, [a, Math.max(a + 0.001, b)], [from, to], { ...clamp, easing: ease });

// Ключевые точки [время, значение] с плавными переходами между ними.
export const keys = (t: number, k: readonly (readonly [number, number])[], ease = io): number => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [ta, va] = k[i];
    const [tb, vb] = k[i + 1];
    if (t <= tb) return tw(t, ta, tb, va, vb, ease);
  }
  return k[k.length - 1][1];
};

// Ключевые точки для 2D-позиций.
export const keys2 = (t: number, k: readonly (readonly [number, number, number])[], ease = io): [number, number] => [
  keys(t, k.map(([a, x]) => [a, x] as const), ease),
  keys(t, k.map(([a, , y]) => [a, y] as const), ease),
];

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Моргание: каждые 2,4–4,6 с, длительность ≈ 0,17 с; extra — моменты
// дополнительных морганий (например, перед репликой или на смене взгляда).
export const blinkAt = (t: number, seed: number, extra: readonly number[] = []): number => {
  const tri = (c: number) => {
    const d = Math.abs(t - c);
    return d < 0.085 ? 1 - d / 0.085 : 0;
  };
  let v = 0;
  let c = 0.8 + hash(seed) * 1.5;
  let i = 0;
  while (c < t + 0.2) {
    v = Math.max(v, tri(c));
    i++;
    c += 2.4 + hash(seed * 7 + i) * 2.2;
  }
  for (const e of extra) v = Math.max(v, tri(e));
  return Math.min(1, v * 1.15);
};

// Дыхание 0…1 (медленно, ≈ 0,25 Гц).
export const breathe = (t: number, seed: number) => 0.5 + 0.5 * Math.sin(t * 1.55 + seed * 2.1);

// Медленное «живое» покачивание −1…1 (сумма синусов разных частот).
export const sway = (t: number, seed: number) =>
  0.6 * Math.sin(t * 0.83 + seed) + 0.3 * Math.sin(t * 1.71 + seed * 3.3) + 0.1 * Math.sin(t * 3.1 + seed * 5.7);
