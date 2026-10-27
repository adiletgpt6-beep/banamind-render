// Звуковые эффекты (общие файлы проекта public/audio/sfx-*.mp3, только
// чтение) — в те же моменты, что и анимация: тиканье «длинных» часов,
// школьный звонок, уведомление, машина, ремень, шаги времени, звонок
// коллеги, бумага и мелок, клавиатура, финал. Без резких и тревожных звуков.
import { FPS } from "./kit";
import { CTA_KEYS } from "./scenes/Cta";
import { drawingKeys } from "./scenes/Drawing";
import { eveningKeys } from "./scenes/Evening";
import { hookKeys } from "./scenes/Hook";
import { mapKeys } from "./scenes/MapScene";
import { pickupKeys } from "./scenes/Pickup";
import { sceneOf, type Bg13Timeline } from "./timing";

export type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly dur?: number; readonly fade?: number };

export const bg13Sfx = (tl: Bg13Timeline): Sfx[] => {
  const out: Sfx[] = [];
  const add = (at: number, name: string, volume: number, dur?: number, fade?: number) => out.push({ src: `audio/${name}.mp3`, at, volume, dur, fade });
  const at = (id: Parameters<typeof sceneOf>[1], f: number) => sceneOf(tl, id).from + f / FPS;
  // 1. хук: медленное тиканье, звонок
  const hook = sceneOf(tl, "hook");
  const hk = hookKeys(tl);
  add(hook.from + 0.1, "sfx-tick", 0.16, Math.max(1, hk.bell / FPS - 0.2), 0.5);
  add(at("hook", hk.legs[0] + 10), "sfx-whoosh", 0.08);
  add(at("hook", hk.bell), "sfx-bell", 0.2, 1.6, 0.4);
  // 2. офис → школа → дом → работа
  const pk = pickupKeys(tl);
  add(at("pickup", 2), "sfx-notify", 0.24);
  add(at("pickup", 32), "sfx-tap", 0.22);
  add(at("pickup", 42), "sfx-chime", 0.14);
  add(at("pickup", pk.school - 6), "sfx-whoosh", 0.14);
  add(at("pickup", pk.school), "sfx-car", 0.16, 1.4, 0.4);
  add(at("pickup", pk.school + 86), "sfx-tap", 0.32);
  add(at("pickup", pk.home - 6), "sfx-whoosh", 0.14);
  add(at("pickup", pk.work), "sfx-typing", 0.08, Math.max(0.6, sceneOf(tl, "pickup").to - at("pickup", pk.work) - 0.3), 0.3);
  add(at("pickup", pk.work + 6), "sfx-tick", 0.12, Math.max(0.6, sceneOf(tl, "pickup").to - at("pickup", pk.work) - 0.5), 0.4);
  // 3. вечер: звонок коллеги (вибрация), ноутбук, лист
  const ek = eveningKeys(tl);
  add(at("evening", ek.ring + 2), "sfx-vibrate", 0.22, 0.6, 0.1);
  add(at("evening", ek.hang + 10), "sfx-tap", 0.18);
  add(at("evening", ek.open), "sfx-tap", 0.14);
  add(at("evening", ek.place + 6), "sfx-paper", 0.22);
  // 4. рисунок: бумага, мелок, поиск
  const dk = drawingKeys(tl);
  add(at("drawing", 0), "sfx-paper", 0.26);
  add(at("drawing", dk.a1[0]), "sfx-paper", 0.1);
  add(at("drawing", dk.a2[0]), "sfx-paper", 0.1);
  add(at("drawing", dk.search), "sfx-whoosh", 0.16);
  add(at("drawing", dk.search + 10), "sfx-typing", 0.12, 1.4, 0.2);
  add(at("drawing", dk.search + 8 + 74), "sfx-tap", 0.3);
  // 5. карта
  const mk = mapKeys(tl);
  add(at("map", 4), "sfx-whoosh", 0.16);
  add(at("map", mk.morning), "sfx-pop", 0.18);
  add(at("map", mk.after), "sfx-pop", 0.18);
  add(at("map", mk.step1), "sfx-pop", 0.2);
  add(at("map", mk.step2), "sfx-pop", 0.2);
  add(at("map", mk.step3), "sfx-chime", 0.22);
  // 6. финал: солнце и раскрытие
  add(at("cta", CTA_KEYS.sun[0]), "sfx-paper", 0.12);
  add(at("cta", CTA_KEYS.iris[0] - 4), "sfx-whoosh", 0.22);
  add(at("cta", CTA_KEYS.iris[1] - 6), "sfx-chime", 0.24);
  return out;
};
