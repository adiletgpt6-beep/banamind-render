// Детерминированные функции движения: всё считается по номеру кадра.
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);
// Пружинка: быстрое появление с небольшим перелётом (≈ 8 %) и успокоением.
export const pop = (x: number) => {
  const t = clamp(x);
  return t >= 1 ? 1 : 1 - Math.cos(t * Math.PI * 2.2) * Math.exp(-5.5 * t);
};
// Появление: 0 → 1 за d кадров начиная с кадра at.
export const appear = (f: number, at: number, d = 12) => easeOut((f - at) / d);
// Исчезновение: 1 → 0 за d кадров начиная с кадра at.
export const vanish = (f: number, at: number, d = 12) => 1 - easeInOut((f - at) / d);
// Плавное покачивание «туда-обратно» (отказ кнопки, «не подходит»).
export const shake = (f: number, at: number, d = 18, amp = 16) => {
  const t = clamp((f - at) / d);
  return amp * Math.sin(t * Math.PI * 4) * (1 - t);
};
// Ступенчатое время для «пиксельной» анимации спрайтов: n кадров спрайта в секунду.
export const stepFrame = (f: number, perSec: number, fps = 30) => Math.floor((f * perSec) / fps);
// Мигание без вспышек: мягкая пульсация 0…1 с периодом period кадров.
export const pulse = (f: number, period = 30) => 0.5 - 0.5 * Math.cos((f / period) * Math.PI * 2);
// Квантование к сетке игрового пикселя (px — размер «пикселя» на экране).
export const snapPx = (v: number, px: number) => Math.round(v / px) * px;
