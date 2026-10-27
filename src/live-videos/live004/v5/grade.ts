// Цветокоррекция v5 = v4 + точечная правка планов у фонтана (5–6, 18,2–27,1 с).
// Замер v4: лицо в этих планах темнее исходника (яркость ≈ 84 против ≈ 92),
// потому что контраст v4 (offset −0,07) опускал средние тона. Теперь средние
// тона и лицо поднимаются гаммой (≈ 0,82), контраст мягче, баланс ближе к
// исходной коже — без пересвета белой куртки и бликов воды. Остальные планы
// — как в v4.
import { SHOT_GRADES as V4_GRADES, type Grade } from "../v4/grade.ts";

const FOUNTAIN: Grade = { r: [1.05, 0.82, -0.03], g: [1.07, 0.82, -0.03], b: [1.04, 0.83, -0.03], sat: 1.1 };

export const SHOT_GRADES: readonly Grade[] = V4_GRADES.map((g, i) => (i === 4 || i === 5 ? FOUNTAIN : g));

const CUTS = [4.03, 8.93, 14.3, 18.2, 21.7, 27.1];

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
