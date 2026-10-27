// Детерминированные функции движения: всё считается по номеру кадра.
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeInOutSine = (x: number) => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);
// Появление: 0 → 1 за d кадров начиная с кадра at.
export const appear = (f: number, at: number, d = 12) => easeOut((f - at) / d);
// Видимость «появилось в at, исчезло в out» с плавными краями.
export const window01 = (f: number, at: number, out: number, d = 10) => appear(f, at, d) * (1 - easeInOut((f - out) / d));
// Значение по ключевым кадрам [кадр, значение] с плавностью между ними.
export const keys = (f: number, pts: readonly (readonly [number, number])[], ease = easeInOutSine) => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [f1, v1] = pts[i];
    const [f0, v0] = pts[i - 1];
    if (f <= f1) return lerp(v0, v1, ease((f - f0) / Math.max(1, f1 - f0)));
  }
  return pts[pts.length - 1][1];
};
// Плавная кривая через ключевые точки без остановок в промежуточных
// точках (монотонный кубический сплайн Фритча–Карлсона); на краях —
// мягкий старт и остановка.
export const spline = (f: number, pts: readonly (readonly [number, number])[]) => {
  const n = pts.length;
  if (f <= pts[0][0]) return pts[0][1];
  if (f >= pts[n - 1][0]) return pts[n - 1][1];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / Math.max(1e-6, pts[i + 1][0] - pts[i][0]));
  const m: number[] = [0];
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]));
  m.push(0);
  let i = 0;
  while (f > pts[i + 1][0]) i++;
  const h = pts[i + 1][0] - pts[i][0];
  const t = (f - pts[i][0]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * pts[i][1] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * pts[i + 1][1] + (t3 - t2) * h * m[i + 1];
};
// Масштаб камеры меняется в логарифмической шкале — наезд выглядит
// равномерным, без «рывка» в конце.
export const zoomLerp = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));
// Лёгкое «пружинистое» появление (масштаб 0.92 → 1.0 с небольшим дотягиванием).
export const pop = (f: number, at: number, d = 14) => {
  const t = clamp((f - at) / d);
  return t <= 0 ? 0 : 0.92 + 0.08 * easeOut(t) + 0.035 * Math.sin(Math.PI * t) * (1 - t);
};
// Псевдослучайное, но детерминированное число 0…1.
export const hash01 = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
