// Звуковые эффекты (общие файлы проекта public/audio/sfx-*.mp3, только
// чтение) — в те же моменты, что и анимация (beats.ts).
import type { Bg3Beats } from "./beats";

export type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly dur?: number; readonly fade?: number };

export const bg3Sfx = (b: Bg3Beats): Sfx[] => {
  const out: Sfx[] = [];
  const add = (at: number, name: string, volume: number, dur?: number, fade?: number) => out.push({ src: `audio/${name}.mp3`, at, volume, dur, fade });
  // 1. хук: тиканье часов, тарелка → песочные часы, часы в шкалу
  add(b.hook.clock, "sfx-tick", 0.3, Math.min(3.2, b.hook.toBar - b.hook.clock), 0.3);
  add(b.hook.morph, "sfx-whoosh", 0.22);
  add(b.hook.toBar + 0.4, "sfx-pop", 0.25);
  // 2. таймлапс: улица, машина, школьный звонок, двери
  const d = b.drive;
  add(d.from, "sfx-traffic", 0.06, d.to - d.from, 0.8);
  add(d.exit - 0.1, "sfx-tap", 0.3);
  add(d.go1, "sfx-car", 0.14, Math.min(3, d.atSchool - d.go1), 0.5);
  add(d.atSchool + 0.05, "sfx-bell", 0.12, 1.6, 0.4);
  add(d.kidIn - 0.1, "sfx-tap", 0.3);
  add(d.go2, "sfx-car", 0.14, Math.min(3, d.atHome - d.go2), 0.5);
  add(d.kidOut - 0.2, "sfx-pop", 0.18);
  add(d.go3, "sfx-whoosh", 0.22);
  add(d.go3 + 0.1, "sfx-car", 0.14, Math.min(3, d.atOffice - d.go3), 0.5);
  add(d.over, "sfx-vibrate", 0.3);
  // 3. неделя: строки планера, телефон со стола, наезд
  const w = b.week;
  w.rows.forEach((r) => add(r + 0.2, "sfx-pop", 0.2));
  add(w.more, "sfx-paper", 0.25);
  add(w.phone + 0.4, "sfx-tap", 0.3);
  add(w.zoom, "sfx-whoosh", 0.22);
  // 4. поиск: набор текста, поиск, результат, нажатие, маршрут
  const s = b.search;
  add(s.type, "sfx-typing", 0.25, Math.min(3, s.typed - s.type + 0.1), 0.2);
  add(s.submit, "sfx-tap", 0.35);
  add(s.results, "sfx-notify", 0.2);
  add(s.tap, "sfx-tap", 0.4);
  add(s.open, "sfx-whoosh", 0.18);
  add(s.route, "sfx-chime", 0.18);
  // 5. шаги
  add(b.steps.s1, "sfx-pop", 0.25);
  add(b.steps.s2, "sfx-pop", 0.25);
  add(b.steps.s3, "sfx-pop", 0.25);
  // 6. финал
  add(b.cta.from - 0.4, "sfx-whoosh", 0.22);
  add(b.cta.from + 0.2, "sfx-chime", 0.22);
  return out;
};
