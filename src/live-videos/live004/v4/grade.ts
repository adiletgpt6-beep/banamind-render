// Цветокоррекция v4 по планам исходника (замеры: средняя яркость, тени p5,
// цвет лица). Каждый план — своя кривая (SVG feComponentTransfer, gamma:
// a·x^e + o по каналам) и насыщенность. Планы 1–2 тёмные с глубокими тенями
// → подъём теней и тёплый баланс; 3–6 мутные (фонтан, контровой свет) →
// контраст и насыщенность; 4 и 7 холодноватые → чуть теплее.
export type Grade = {
  readonly r: readonly [number, number, number]; // amplitude, exponent, offset
  readonly g: readonly [number, number, number];
  readonly b: readonly [number, number, number];
  readonly sat: number;
};

export const SHOT_GRADES: readonly Grade[] = [
  { r: [1.06, 0.84, -0.005], g: [1.04, 0.86, -0.005], b: [1.0, 0.9, -0.005], sat: 1.1 }, // 1: деревья, тени
  { r: [1.08, 0.8, -0.005], g: [1.05, 0.83, -0.005], b: [1.0, 0.88, -0.005], sat: 1.12 }, // 2: лицо в тени
  { r: [1.12, 1.0, -0.06], g: [1.1, 1.0, -0.06], b: [1.07, 1.0, -0.06], sat: 1.14 }, // 3: фонтан, дымка
  { r: [1.1, 0.97, -0.04], g: [1.07, 0.97, -0.04], b: [1.02, 0.98, -0.045], sat: 1.14 }, // 4: площадь, холодно
  { r: [1.13, 1.0, -0.07], g: [1.11, 1.0, -0.07], b: [1.08, 1.0, -0.07], sat: 1.14 }, // 5: фонтан, присед
  { r: [1.13, 1.0, -0.07], g: [1.11, 1.0, -0.07], b: [1.08, 1.0, -0.07], sat: 1.14 }, // 6: фонтан, ближе
  { r: [1.09, 0.95, -0.03], g: [1.06, 0.95, -0.03], b: [1.02, 0.96, -0.035], sat: 1.12 }, // 7: финал, холодно
];

const CUTS = [4.03, 8.93, 14.3, 18.2, 21.7, 27.1];

// Параметры в момент t; на склейке — плавный переход ±2 кадра (склейки
// исходника найдены с точностью до кадра).
export const gradeAt = (t: number): Grade => {
  let i = 0;
  for (const c of CUTS) if (t >= c) i++;
  const g = SHOT_GRADES[i];
  const near = CUTS.findIndex((c) => Math.abs(t - c) < 0.067);
  if (near < 0) return g;
  const k = (t - (CUTS[near] - 0.067)) / 0.134;
  const a = SHOT_GRADES[near];
  const b = SHOT_GRADES[near + 1];
  const mix3 = (x: readonly number[], y: readonly number[]) => x.map((v, j) => v + (y[j] - v) * k) as unknown as readonly [number, number, number];
  return { r: mix3(a.r, b.r), g: mix3(a.g, b.g), b: mix3(a.b, b.b), sat: a.sat + (b.sat - a.sat) * k };
};
