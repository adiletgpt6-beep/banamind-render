// Звуковые эффекты (общие файлы проекта public/audio/sfx-*.mp3, только
// чтение) — в те же моменты, что и анимация: двери, школьная метка,
// клавиатура, телефон, календарь, заявка, машина, финал.
import { boardBeats } from "./scenes/WeekBoard";
import { satKeys } from "./scenes/Saturday";
import { FPS } from "./kit";
import { cueOf, sceneOf, wordTime, type Bg9Timeline } from "./timing";

export type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly dur?: number; readonly fade?: number };

export const bg9Sfx = (tl: Bg9Timeline): Sfx[] => {
  const out: Sfx[] = [];
  const add = (at: number, name: string, volume: number, dur?: number, fade?: number) => out.push({ src: `audio/${name}.mp3`, at, volume, dur, fade });
  const hook = sceneOf(tl, "hook");
  const b = boardBeats(tl);
  // 1. хук: двери появляются, метки вспыхивают, влёт в дверь
  [0, 1, 2, 3, 4].forEach((i) => add(hook.from + 0.3 + i * 0.17, "sfx-pop", 0.16));
  add(wordTime(cueOf(tl, "n01"), "бир", 0.7), "sfx-chime", 0.2);
  add(hook.to - 0.8, "sfx-whoosh", 0.28);
  // 2–6. дни: дверь (въезд и распахивание), метка, полёт в ячейку
  b.days.forEach((d, i) => {
    if (i > 0) add(d.from - 0.4, "sfx-whoosh", 0.22);
    add(d.from + 0.12, "sfx-whoosh", 0.12);
    add(d.chipIn, "sfx-notify", 0.2);
    add(d.land - 0.05, "sfx-tap", 0.3);
  });
  const tue = sceneOf(tl, "tue");
  add(tue.from + 0.3, "sfx-typing", 0.12, 0.9, 0.2);
  add(tue.from + 2.2, "sfx-typing", 0.12, Math.max(0.4, tue.to - tue.from - 2.3), 0.2);
  const wed = sceneOf(tl, "wed");
  add(wed.from + 22 / FPS, "sfx-vibrate", 0.25, 0.7, 0.1);
  const thu = sceneOf(tl, "thu");
  add(thu.from + 0.3, "sfx-pop", 0.2);
  add(thu.from + 0.75, "sfx-pop", 0.2);
  add(thu.from + 1.4, "sfx-pop", 0.2);
  const fri = sceneOf(tl, "fri");
  add(fri.from + 0.2, "sfx-tick", 0.18, Math.min(3, fri.to - fri.from - 0.2), 0.3);
  // 7. повтор: календарь, строки
  add(b.rep.from + 0.05, "sfx-paper", 0.22);
  add(b.rep.repeat - 0.05, "sfx-chime", 0.22);
  // 8. суббота: маркер, телефон, заявка, линия соединяется
  const sat = sceneOf(tl, "sat");
  const k = satKeys(tl);
  const at = (f: number) => sat.from + f / FPS;
  add(b.sat.circle - 0.1, "sfx-paper", 0.25);
  add(at(k.pick), "sfx-tap", 0.25);
  add(at(k.phoneIn), "sfx-whoosh", 0.18);
  k.fill.forEach((f) => add(at(f), "sfx-typing", 0.1, 0.4, 0.1));
  add(at(k.tap), "sfx-tap", 0.4);
  add(at(k.sent), "sfx-notify", 0.28);
  add(b.sat.connect, "sfx-whoosh", 0.2);
  add(b.sat.connect + 0.6, "sfx-chime", 0.26);
  // 9. маршрут и этапы
  const how = sceneOf(tl, "how");
  const n09 = cueOf(tl, "n09");
  add(how.from - 0.45, "sfx-whoosh", 0.24);
  add(wordTime(n09, "үйдөн", 0.02) + 0.2, "sfx-car", 0.14, 1.5, 0.4);
  add(wordTime(n09, "сабактан", 0.22) + 0.1, "sfx-car", 0.14, 1.5, 0.4);
  add(wordTime(n09, "акысыз", 0.92), "sfx-pop", 0.28);
  // 10. финал
  const cta = sceneOf(tl, "cta");
  add(cta.from - 0.6, "sfx-whoosh", 0.26);
  add(cta.from + 0.05, "sfx-chime", 0.25);
  return out;
};
