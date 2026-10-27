// PAINT TO LIFE ENGINE
//
// Один и тот же меш Земли проходит путь «капля → акварель → объём»:
//   • reveal      — пигмент растекается от точки удара капли по волокнам бумаги;
//   • landReveal  — мазки зелёного и коричневого ложатся поверх влажного синего;
//   • flat        — сфера сжата в диск ортографической проекцией на холст
//                   (передняя полусфера совпадает с рисунком), затем
//                   кривизна плавно возвращается — картина «поднимается»;
//   • paint       — смешивание акварельного и освещённого 3D-материала;
//   • spaceWash   — ночная лессировка растекается по холсту и становится космосом.
// Возвращение использует те же функции оси s в обратную сторону, а
// финальные элементы пейзажа «дописываются» по времени.
import { smootherstep, smoothstep, windowed } from "./CameraTransitionEngine";

export const DROP = { fall0: 0.2, impact: 0.72 };

export function paintState(t: number, s: number) {
  const fall = smoothstep(DROP.fall0, DROP.impact, t);
  // Капля падает с ускорением: квадрат по времени.
  const dropZ = 0.55 * (1 - fall * fall);
  const splash = smoothstep(DROP.impact, DROP.impact + 0.16, t);
  const dropVisible = t < DROP.impact + 0.5 ? 1 - smoothstep(DROP.impact + 0.12, DROP.impact + 0.5, t) : 0;

  // Растекание: быстро у капли, медленнее у края (как настоящая влага).
  const spread = smoothstep(DROP.impact, 3.5, t);
  const reveal = 0.05 + 1.3 * (1 - Math.pow(1 - spread, 2.2));
  const landReveal = smoothstep(1.9, 4.3, t);
  const wet = 1 - smoothstep(3.6, 5.2, t);

  const flat = 1 - smootherstep(1.06, 1.86, s);
  const paint = 1 - smoothstep(1.12, 2.05, s);
  const spaceWash = smoothstep(1.18, 2.12, s);
  const paperFade = smoothstep(2.15, 2.6, s);

  // Финальная картина: небо, горы, лес и дерево дописываются при возвращении.
  const fin = (a: number, b: number) => (t < 49 ? 0 : smoothstep(a, b, t));
  const final = {
    sky: fin(50.2, 52.2),
    far: fin(50.6, 52.4),
    near: fin(50.9, 52.7),
    tree: fin(51.2, 53.0),
    meadow: fin(51.0, 52.9),
  };
  // Подсветка «влажного» края у свежих мазков финала.
  const finalWet = windowed(t, 50.4, 51.2, 52.6, 54.0);
  return { dropZ, splash, dropVisible, reveal, landReveal, wet, flat, paint, spaceWash, paperFade, final, finalWet };
}

export type PaintState = ReturnType<typeof paintState>;
