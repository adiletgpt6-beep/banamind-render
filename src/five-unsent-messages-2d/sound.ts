// Эффекты «Беш жөнөтүлбөгөн үн билдирүү» по событиям (секунды ролика).
// Немного: одна вибрация рабочего телефона, негромкая дверь, касания перед
// воспроизведением записей, отправка заявки, бытовой фон.
import { WEEK_SAVE } from "./layout";
import { REQ } from "./scenes/Evening";
import { FU2_SCENES } from "./script";
import type { Fu2Cue } from "./timing";

export type Fu2Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };
const OWN = (n: string) => `audio/five-unsent-messages-2d/sfx/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
export const sceneAt = (id: (typeof FU2_SCENES)[number]["id"], sec: number) => FU2_SCENES.find((s) => s.id === id)!.from + sec;

export const fu2Sfx = (cues: readonly Fu2Cue[]): Fu2Sfx[] => {
  const cue = (id: string) => cues.find((c) => c.id === id)!;
  const s01 = cue("s01");
  const buzz = (s01.words[2]?.start ?? s01.from + 0.6) + 2 / 30;
  const rec = ["monday", "tuesday", "wednesday", "thursday", "friday"].map(cue);
  return [
    { at: sceneAt("intro", 0.3), src: COMMON("whoosh"), volume: 0.1 },
    { at: sceneAt("before", 0.6), src: COMMON("typing"), volume: 0.07, dur: 2.6, fade: 0.4 },
    // школьный двор: птицы; одна вибрация рабочего телефона
    { at: sceneAt("gate", 0), src: OWN("birds"), volume: 0.12, dur: 13, fade: 0.8 },
    { at: buzz, src: COMMON("vibrate"), volume: 0.32 },
    // дорога: двигатель и улица
    { at: sceneAt("car", 0), src: COMMON("traffic"), volume: 0.09, dur: 7, fade: 0.8 },
    // будни: касание при сохранении записи
    ...WEEK_SAVE.map((s) => ({ at: sceneAt("week", s), src: COMMON("pop"), volume: 0.09 })),
    // суббота: негромкая дверь, стул
    { at: cue("sat-monday").from + 1.0, src: OWN("door-open"), volume: 0.1 },
    { at: sceneAt("why", 46 / 30), src: OWN("chair"), volume: 0.12 },
    { at: cue("s04").to + 40 / 30, src: COMMON("tap"), volume: 0.16 },
    { at: sceneAt("why", 432 / 30), src: COMMON("tap"), volume: 0.18 },
    // совместное прослушивание: касание перед каждой следующей записью
    ...rec.slice(1).map((c) => ({ at: c.from - 10 / 30, src: COMMON("tap"), volume: 0.16 })),
    // заявка
    { at: sceneAt("request", REQ.tap / 30), src: COMMON("tap"), volume: 0.26 },
    { at: sceneAt("request", REQ.sent / 30), src: COMMON("notify"), volume: 0.18 },
    // ужин: посуда; загорается телефон (тихо) — отец переворачивает и
    // отодвигает его
    { at: sceneAt("dinner", 0.4), src: OWN("spoon"), volume: 0.1 },
    { at: sceneAt("dinner", 6 / 30), src: COMMON("vibrate"), volume: 0.12 },
    { at: sceneAt("dinner", 40 / 30), src: COMMON("tap"), volume: 0.12 },
    { at: sceneAt("dinner", 46 / 30), src: COMMON("paper"), volume: 0.1 },
    { at: sceneAt("contact", 0.05), src: COMMON("chime"), volume: 0.14 },
  ];
};
