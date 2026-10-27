// Звуковые эффекты (общие файлы проекта, только чтение) — в те же моменты,
// что и анимация (beats.ts): бумага конвертов, карточки, штампы, машина.
import type { Bg37Beats } from "./beats";

export type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly dur?: number; readonly fade?: number };

export const bg37Sfx = (b: Bg37Beats): Sfx[] => {
  const out: Sfx[] = [];
  const add = (at: number, name: string, volume: number, dur?: number, fade?: number) => out.push({ src: `audio/${name}.mp3`, at, volume, dur, fade });
  // 1. хук: заголовок, вставка с конвертами
  add(b.hook.insert - 0.1, "sfx-whoosh", 0.18);
  add(b.hook.insert + 0.2, "sfx-paper", 0.3);
  // 2. папа раскладывает конверты
  b.rules.envs.forEach((e) => add(e - 0.05, "sfx-paper", 0.22));
  add(b.rules.read - 0.1, "sfx-paper", 0.2);
  add(b.rules.push, "sfx-whoosh", 0.2);
  // 3–5. конверты открываются
  for (const s of [b.group, b.trial, b.decide]) {
    add(s.open + 0.1, "sfx-paper", 0.32);
    add(s.open + 0.9, "sfx-whoosh", 0.14);
  }
  b.group.cards.forEach((c) => add(c, "sfx-pop", 0.22));
  add(b.group.team, "sfx-chime", 0.18);
  add(b.group.noPay, "sfx-tap", 0.4);
  add(b.group.tomorrow + 0.45, "sfx-tap", 0.25);
  add(b.trial.team, "sfx-pop", 0.22);
  add(b.trial.morning, "sfx-car", 0.13, 2.2, 0.5);
  add(b.trial.afternoon, "sfx-car", 0.13, 2.2, 0.5);
  add(b.trial.free, "sfx-chime", 0.24);
  add(b.decide.choices, "sfx-pop", 0.22);
  add(b.decide.pick - 0.05, "sfx-tap", 0.4);
  add(b.decide.pack, "sfx-pop", 0.2);
  add(b.decide.pay, "sfx-chime", 0.2);
  add(b.decide.kitchen - 0.2, "sfx-whoosh", 0.15);
  // 6. финал
  add(b.cta.from - 0.7, "sfx-paper", 0.22);
  add(b.cta.from - 0.3, "sfx-whoosh", 0.22);
  add(b.cta.from + 0.2, "sfx-chime", 0.24);
  return out;
};
