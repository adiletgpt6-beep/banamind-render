// Звуковые эффекты (общие файлы проекта, только чтение) — в те же моменты,
// что и анимация (beats.ts): касание карты, рисование дороги, машина мамы,
// звонок с урока, клавиши поиска, нажатия, поля заявки, круг группы.
import type { Bg05Beats } from "./beats";

export type Sfx = {
  readonly src: string;
  readonly at: number;
  readonly volume: number;
  readonly dur?: number;
  readonly fade?: number;
};

export const bg05Sfx = (b: Bg05Beats): Sfx[] => {
  const out: Sfx[] = [];
  const add = (
    at: number,
    name: string,
    volume: number,
    dur?: number,
    fade?: number,
  ) => out.push({ src: `audio/${name}.mp3`, at, volume, dur, fade });
  // 1. палец касается карты, дорога рисуется
  add(b.hook.tap, "sfx-tap", 0.4);
  add(b.hook.drawFrom, "sfx-whoosh", 0.16);
  add(b.hook.districtA, "sfx-pop", 0.2);
  add(b.hook.districtB, "sfx-pop", 0.2);
  // 2. машина мамы, звонок с урока, крюк обратно
  add(
    b.detour.leg1[0],
    "sfx-traffic",
    0.07,
    b.detour.leg3[1] - b.detour.leg1[0] + 0.4,
    0.6,
  );
  add(b.detour.leg1[0], "sfx-car", 0.12, 2.6, 0.5);
  add(b.detour.pickup[0] - 0.8, "sfx-bell", 0.14, 1.6, 0.4);
  add(b.detour.leg3[0], "sfx-car", 0.1, 2.6, 0.5);
  add(b.detour.split, "sfx-paper", 0.22);
  // 3. карточки путей, телефон, поиск, нажатие на BalaGo
  add(b.compare.cards, "sfx-pop", 0.2);
  add(b.compare.cards + 0.35, "sfx-pop", 0.2);
  add(b.compare.phone - 0.1, "sfx-whoosh", 0.2);
  add(
    b.compare.typeFrom,
    "sfx-typing",
    0.16,
    b.compare.typeTo - b.compare.typeFrom,
    0.15,
  );
  add(b.compare.results, "sfx-notify", 0.14);
  add(b.compare.tap, "sfx-tap", 0.4);
  // 4. поля заявки, отправка, круг на карте
  b.apply.fields.forEach((at) => add(at - 0.1, "sfx-typing", 0.12, 0.5, 0.1));
  add(b.apply.send, "sfx-tap", 0.4);
  add(b.apply.send + 0.1, "sfx-chime", 0.18);
  add(b.apply.mapBack, "sfx-whoosh", 0.2);
  add(b.apply.dayWhole, "sfx-pop", 0.22);
  // 5. дома сходятся, шаги, пробная поездка
  b.group.homes.forEach((at) => add(at, "sfx-pop", 0.2));
  add(b.group.step1, "sfx-tap", 0.3);
  add(b.group.step2, "sfx-tap", 0.3);
  add(b.group.free, "sfx-chime", 0.18);
  add(b.group.carFrom + 0.2, "sfx-car", 0.1, 2.8, 0.6);
  // 6. финал
  add(b.cta.from - 0.6, "sfx-whoosh", 0.22);
  add(b.cta.from + 0.2, "sfx-chime", 0.22);
  return out;
};
