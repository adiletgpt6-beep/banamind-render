// Звуковые эффекты (общие файлы проекта, только чтение) — в те же моменты,
// что и анимация (beats.ts): линии маршрутов, ценники, машина, переходы.
import type { Bg32Beats } from "./beats";

export type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly dur?: number; readonly fade?: number };

export const bg32Sfx = (b: Bg32Beats): Sfx[] => {
  const out: Sfx[] = [];
  const add = (at: number, name: string, volume: number, dur?: number, fade?: number) => out.push({ src: `audio/${name}.mp3`, at, volume, dur, fade });
  // 1. хук: три линии и подписи 7 / 12 / 20
  add(b.hook.from + 0.15, "sfx-whoosh", 0.25);
  b.hook.pills.forEach((p) => add(p, "sfx-pop", 0.28));
  // 2–4. тарифы: переход камеры, машина, ценник
  for (const s of [b.t1, b.t2, b.t3]) {
    add(s.from, "sfx-whoosh", 0.2);
    add(s.drive.go, "sfx-car", 0.16, Math.min(3, s.drive.home - s.drive.go), 0.5);
    add(s.price, "sfx-chime", 0.22);
  }
  add(b.t1.bracket, "sfx-tap", 0.4);
  add(b.t3.over, "sfx-tap", 0.35);
  // 5. полный круг
  add(b.full.from - 0.3, "sfx-whoosh", 0.25);
  add(b.full.notOneWay + 0.55, "sfx-tap", 0.4);
  add(b.full.morning, "sfx-car", 0.15, 2.6, 0.5);
  add(b.full.afternoon, "sfx-car", 0.15, 2.6, 0.5);
  add(b.full.onePrice, "sfx-pop", 0.3);
  // 6. финал
  add(b.cta.from - 0.4, "sfx-whoosh", 0.25);
  add(b.cta.from + 0.1, "sfx-chime", 0.25);
  return out;
};
