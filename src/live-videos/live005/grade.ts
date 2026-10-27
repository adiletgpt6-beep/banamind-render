// Цветокоррекция LIVE-005 «по лицу»: ночная площадь, цветная подсветка фонтанов
// (оранжевый, маджента, синий, зелёный, красный) окрашивает и затемняет лицо.
// В каждый момент берём реальный цвет лица (face.ts) и строим тоновую кривую
// для каждого канала:
//   • средние тона лица поднимаются к яркости ≈ FACE_TARGET_LUM — лицо светлее;
//   • цветовой перекос лица сдвигается на долю CHROMA_FIX к естественному тону
//     кожи — ночная атмосфера и цвет фонтанов остаются, лицо не «синее»;
//   • глубокие тени (ночное небо) почти не трогаются — нет «молочной» дымки;
//   • светлые тона почти не трогаются: белая куртка остаётся белой.
// Без импортов Remotion — кривые проверяются Node-тестом.
import { faceColorAt } from "./face.ts";

export const FACE_TARGET_LUM = 0.47; // средняя яркость внутренней части лица (0–1)
export const LUM_FIX = 0.85; // доля подъёма яркости к цели
export const CHROMA_FIX = 0.35; // доля коррекции цветового перекоса лица
// Естественный тон кожи (отношение каналов к яркости) — тёплый, не розовый.
const SKIN = [1.27, 0.94, 0.77] as const;

const lum = (c: readonly number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const smooth = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};

export type Grade = {
  readonly exponents: readonly [number, number, number]; // x^e для средних тонов
  readonly sat: number;
};

// Показатели степени для каждого канала: цвет лица f → желаемый f'.
export const gradeFor = (rgb255: readonly [number, number, number]): Grade => {
  const f = rgb255.map((v) => clamp(v / 255, 0.02, 0.98));
  const L = lum(f);
  const Lt = L + (FACE_TARGET_LUM - L) * LUM_FIX;
  // цветность лица и цель: в логарифмах, частичная коррекция
  const chroma = f.map((v, i) => Math.exp(Math.log(v / L) * (1 - CHROMA_FIX) + Math.log(SKIN[i]) * CHROMA_FIX));
  const want = chroma.map((c) => c * Lt);
  const norm = Lt / lum(want);
  const target = want.map((v) => clamp(v * norm, 0.04, 0.95));
  const exponents = f.map((v, i) => clamp(Math.log(target[i]) / Math.log(v), 0.6, 1.12)) as [number, number, number];
  // Чем сильнее окрашен свет на лице, тем мягче насыщенность (не «кислотно»);
  // при почти нейтральном свете — чуть сочнее.
  const spread = Math.max(...f) / Math.min(...f);
  const sat = clamp(1.04 - (spread - 1.8) * 0.05, 0.92, 1.04);
  return { exponents, sat };
};

export const gradeAt = (t: number): Grade => gradeFor(faceColorAt(t));

// Тоновая кривая канала (таблица для feFuncX type="table").
// Коррекция действует в средних тонах (кожа): тени до ~0,04 не поднимаются
// (переход к x^e к ~0,24), светлые тона от ~0,62 плавно возвращаются к
// исходным — белая куртка и фонари не желтеют и не синеют.
export const curve = (e: number, n = 24): number[] => {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);
    const k = smooth(0.03, 0.24, x) * (1 - smooth(0.62, 0.98, x));
    out.push(+(x + (Math.pow(x, e) - x) * k).toFixed(4));
  }
  return out;
};

// Что станет с цветом (для тестов и подбора): применить кривые к цвету 0–255.
export const applyGrade = (g: Grade, rgb255: readonly number[]) => {
  const n = 24;
  const tables = g.exponents.map((e) => curve(e, n));
  const c = rgb255.map((v, i) => {
    const x = clamp(v / 255, 0, 1) * (n - 1);
    const a = Math.floor(x);
    const b = Math.min(n - 1, a + 1);
    return (tables[i][a] + (tables[i][b] - tables[i][a]) * (x - a)) * 255;
  });
  // насыщенность (как feColorMatrix saturate: смешение с яркостью)
  const l = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return c.map((v) => clamp(l + (v - l) * g.sat, 0, 255));
};
