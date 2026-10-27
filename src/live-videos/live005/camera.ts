// Камера LIVE-005: плавные приближения к лицу (точка — по треку лица) и один
// мягкий переход «наезд с размытием» на склейке проблема → решение (17,43 с).
// Без импортов Remotion — проверяется тестом (масштаб, плавность).
import { faceAt, shotIndex } from "./face.ts";
import { CAMERA_MOVES } from "./plan.ts";
import { CUTS } from "./timing.ts";

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const ramp = (t: number, a: number, dur: number) => inOut(clamp((t - a) / dur));
const move = (id: string) => {
  const m = CAMERA_MOVES.find((x) => x.id === id);
  if (!m) throw new Error(`нет движения ${id}`);
  return m;
};

// Масштаб по планам (1 — исходный кадр). Каждое приближение живёт до склейки
// своего плана — на склейке кадр возвращается к исходному (новый план).
export const zoomAt = (t: number): number => {
  const s = shotIndex(t);
  if (s === 0) return 1 + 0.06 * ramp(t, move("push-question").from, 1.2);
  if (s === 1) return 1 + 0.14 * ramp(t, CUTS[0], CUTS[1] - CUTS[0]);
  if (s === 2) return 1.06 - 0.06 * ramp(t, CUTS[1], 0.9); // «выдох» под два варианта: руки по краям не режутся
  if (s === 3) return 1 + 0.1 * ramp(t, move("push-hard").from, 0.9);
  if (s === 4) return 1 + 0.05 * ramp(t, CUTS[3], CUTS[4] - CUTS[3]);
  if (s === 5) return 1 + 0.07 * ramp(t, move("push-mission").from, CUTS[5] - move("push-mission").from);
  if (s === 6) return 1;
  // S8: план раскрывается 1,05 → 1 к жестам CTA (координаты жестов сняты без зума),
  // затем тёплый наезд на «Биз дайыма кызматтабыз»
  const open = 1.05 - 0.05 * ramp(t, CUTS[6], move("open-cta").to - CUTS[6]);
  return open + 0.05 * ramp(t, move("push-final").from, 1.3);
};

// Мягкий переход на 17,43 с: уходящий план чуть наезжает и размывается,
// входящий «приземляется» из лёгкого наезда в резкость.
const T = CUTS[4];
// На остальных склейках — жёсткий монтаж автора с мягким «входом из размытия»
// (3 px → 0 за 4 кадра), без наплыва: два кадра одного человека не накладываются.
export const SOFT_CUT = { blur: 3, dur: 4 / 30 } as const;
export const transitionAt = (t: number) => {
  if (t >= T - 0.25 && t <= T + 0.32) {
    const out = ramp(t, T - 0.25, 0.25);
    const inn = 1 - ramp(t, T, 0.32);
    return t < T ? { s: 1 + 0.06 * out, blur: 6 * out } : { s: 1 + 0.06 * inn, blur: 6 * inn };
  }
  const c = CUTS.find((x) => t >= x - 1e-6 && t < x + SOFT_CUT.dur);
  if (c !== undefined) return { s: 1, blur: SOFT_CUT.blur * (1 - (t - c) / SOFT_CUT.dur) };
  return { s: 1, blur: 0 };
};

// Точка приближения — лицо, усреднённое ±0,3 с внутри плана (без дрожи).
export const focusAt = (t: number) => {
  const s = shotIndex(t);
  let x = 0;
  let y = 0;
  let n = 0;
  for (let d = -0.3; d <= 0.3001; d += 0.1) {
    const u = t + d;
    if (u < 0 || shotIndex(u) !== s) continue;
    const f = faceAt(u);
    x += f.cx;
    y += f.cy;
    n++;
  }
  return { x: x / n, y: y / n };
};

export const cameraAt = (t: number) => {
  const tr = transitionAt(t);
  const f = focusAt(t);
  return { s: zoomAt(t) * tr.s, ox: f.x, oy: f.y, blur: tr.blur };
};
