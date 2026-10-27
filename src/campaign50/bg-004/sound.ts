// Звуковые эффекты (общие файлы проекта, только чтение) — в те же моменты,
// что и анимация (beats.ts): клавиши калькулятора, печать строк, клики
// курсора, протягивание строк по дням, карточка BalaGo, шаги.
import type { Bg04Beats } from "./beats";

export type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly dur?: number; readonly fade?: number };

export const bg04Sfx = (b: Bg04Beats): Sfx[] => {
  const out: Sfx[] = [];
  const add = (at: number, name: string, volume: number, dur?: number, fade?: number) => out.push({ src: `audio/${name}.mp3`, at, volume, dur, fade });
  // 1. калькулятор: клавиши, тиканье пустой графы «Убакыт»
  add(b.hook.keys[0], "sfx-tap", 0.35);
  add(b.hook.keys[1], "sfx-typing", 0.18, 0.5, 0.1);
  add(b.hook.count, "sfx-tick", 0.14, Math.max(1, b.hook.to - b.hook.count - 0.4), 0.3);
  add(b.hook.to - 0.45, "sfx-whoosh", 0.22);
  // 2. строки дня печатаются
  b.rows.typed.forEach((at) => {
    add(at - 0.05, "sfx-tap", 0.28);
    add(at, "sfx-typing", 0.16, 0.45, 0.1);
  });
  add(b.rows.sum, "sfx-pop", 0.25);
  // 3. протягивание по дням недели, «күн сайын»
  add(b.week.fillFrom + 0.5, "sfx-paper", 0.18, Math.min(1.6, b.week.fillTo - b.week.fillFrom), 0.3);
  add(b.week.onceStrike, "sfx-tap", 0.3);
  add(b.week.daily, "sfx-pop", 0.3);
  add(b.week.total, "sfx-chime", 0.16);
  // 4. перенос в «Алдын ала уюштуруу», карточка BalaGo
  add(b.plan.select, "sfx-tap", 0.3);
  add(b.plan.grab, "sfx-whoosh", 0.18);
  add(b.plan.drop, "sfx-pop", 0.3);
  add(b.plan.formula, "sfx-typing", 0.14, 0.8, 0.15);
  add(b.plan.brand, "sfx-chime", 0.24);
  // 5. круг и шаги
  add(b.trial.from - 0.3, "sfx-whoosh", 0.22);
  add(b.trial.ring + 0.3, "sfx-car", 0.13, 3.2, 0.6);
  b.trial.steps.forEach((at) => add(at, "sfx-pop", 0.24));
  add(b.trial.free, "sfx-chime", 0.2);
  // 6. финал
  add(b.cta.from - 0.4, "sfx-whoosh", 0.24);
  add(b.cta.from + 0.1, "sfx-chime", 0.24);
  return out;
};
