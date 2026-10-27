// Саунд-дизайн BG-008 (общие файлы эффектов проекта, только чтение) — в те
// же моменты, что и анимация (beats.ts): вибрация телефона импульсами,
// уведомление о пропущенном, гудки «кайра чалуу», касания экрана, щелчки
// дней календаря, клавиатура поиска, машина и улица, шаги BalaGo, чат.
import { bg8Beats } from "./beats";
import { BG8_SCENES, BG8_VIDEO, type Bg8SceneId } from "./script";
import type { Bg8Cue } from "./timing";

export type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly dur?: number; readonly fade?: number };

const FPS = BG8_VIDEO.fps;
const base = (id: Bg8SceneId) => Math.round(BG8_SCENES.find((s) => s.id === id)!.from * FPS);

export const bg8Sfx = (cues: readonly Bg8Cue[]): Sfx[] => {
  const b = bg8Beats(cues);
  const out: Sfx[] = [];
  const add = (scene: Bg8SceneId, at: number, src: string, volume: number, dur?: number, fade?: number) =>
    out.push({ src: `audio/${src}.mp3`, at: base(scene) + Math.max(0, at), volume, dur, fade });
  // 1. хук: телефон вибрирует в держателе; крупный план — громче;
  //    машина трогается
  b.hook.buzz.forEach((t) => add("hook", t, "sfx-vibrate", t >= b.hook.insert && t < b.hook.back ? 0.6 : 0.42, 1.0, 0.05));
  add("hook", b.hook.go - 6, "sfx-car", 0.22, 3, 0.6);
  // 2. офис: отмотка, клавиатура, «сохранено», дорожки, пересечение
  add("office", 0, "sfx-whoosh", 0.4);
  add("office", 16, "sfx-typing", 0.18, (b.office.save - 20) / FPS, 0.2);
  add("office", b.office.save, "sfx-tap", 0.5);
  add("office", b.office.save + 2, "sfx-pop", 0.3);
  add("office", b.office.lanesIn, "sfx-whoosh", 0.22);
  add("office", b.office.clash, "sfx-tick", 0.2, 1.2, 0.2);
  // 3. в пути: улица, вибрация в салоне (глуше), пропущенный звонок
  add("drive", 0, "sfx-traffic", 0.16, 7, 0.8);
  add("drive", 0, "sfx-car", 0.2, 3, 0.6);
  b.drive.buzz.forEach((t) => add("drive", t, "sfx-vibrate", 0.4, 1.0, 0.05));
  add("drive", b.drive.missed + 4, "sfx-notify", 0.55);
  // 4. у школы: машина останавливается, дверь; гудки; календарь
  const s = b.school;
  add("school", 0, "sfx-car", 0.18, 1.6, 0.5);
  add("school", 54, "sfx-tap", 0.35);
  add("school", s.take + 4, "sfx-tap", 0.45);
  add("school", s.ring[0], "sfx-ringback", 0.38, 2.1, 0.08);
  add("school", s.ring[1] - 22, "sfx-ringback", 0.3, 1.4, 0.2);
  add("school", s.noAnswer, "sfx-tap", 0.35);
  add("school", s.cal, "sfx-whoosh", 0.25);
  s.days.forEach((t) => add("school", t, "sfx-pop", 0.26));
  add("school", s.clashAt, "sfx-notify", 0.22);
  add("school", s.type, "sfx-typing", 0.14, 1.0, 0.2);
  // 5. поиск → BalaGo → маршрут
  const d = b.decide;
  add("decide", d.typeFrom, "sfx-typing", 0.2, (d.typeTo - d.typeFrom) / FPS + 0.2, 0.15);
  add("decide", d.found, "sfx-pop", 0.3);
  add("decide", d.click - 1, "sfx-tap", 0.55);
  add("decide", d.expand, "sfx-whoosh", 0.3);
  add("decide", d.back, "sfx-whoosh", 0.18);
  // 6. дорожки расходятся, шаги, сообщение водителя в чате
  add("how", b.how.split, "sfx-whoosh", 0.3);
  b.how.steps.forEach((t) => add("how", t, "sfx-pop", 0.26));
  add("how", b.how.msg, "sfx-notify", 0.32);
  add("how", b.how.loc, "sfx-pop", 0.24);
  // 7. финал
  add("cta", 0, "sfx-chime", 0.3);
  return out;
};
