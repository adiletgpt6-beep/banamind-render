// Эффекты «Жооп берилбеген кат» по событиям (секунды ролика) — в те же
// моменты, что и действия в сценах (кадры сцен из scenes/*.tsx повторены
// здесь по тем же формулам от реплик и MOMENTS). Немного и негромко:
// дверь кабинета, печать, одно напоминание, сохранение и блокировка,
// ключи и стул, машина и её дверь, дверь дома, бумага рисунка, нажатия и
// подтверждения отправки (заявка и письмо).
import { MOMENTS, sceneById } from "./layout";
import { UL2_VIDEO, type Ul2SceneId } from "./script";
import type { Ul2Cue } from "./timing";
import { requestBeats } from "./scenes/beats";

export type Ul2Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };
const OWN = (n: string) => `audio/unanswered-letter-2d/sfx/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
const F = 1 / UL2_VIDEO.fps;
export const sceneAt = (id: Ul2SceneId, sec: number) => sceneById(id).from + sec;

export const ul2Sfx = (cues: readonly Ul2Cue[]): Ul2Sfx[] => {
  const cue = (id: string) => cues.find((c) => c.id === id)!;
  // начало слова i (как useScene().word: без таймингов — равномерно по реплике)
  const word = (id: string, i: number) => {
    const c = cue(id);
    return c.words[i]?.start ?? c.from + ((c.to - c.from) * i) / Math.max(1, c.words.length || 8);
  };
  const m06 = cue("m06");
  // ответ: «Жөнөтүү» +0,5 с, «Жөнөтүлдү» +0,7 с, кабинет через 1,35 с (REPLY)
  const replySent = m06.to + 0.7;
  const toDesk = replySent + 41 * F;
  // рисунок: план «вместе» после второго показа рисунка
  const lay = cue("m05").to + (40 + 66 + 8) * F;
  // заявка: те же моменты, что в RequestScene (кадры сцены → секунды)
  const req = sceneById("request").from;
  const rb = requestBeats((id, i) => Math.round((word(id, i) - req) * 30));
  const R = (fr: number) => req + fr * F;
  // вступление: начинает отвечать — короткая серия нажатий
  const introType = cue("n01").to - 14 * F;
  return [
    // вступление: короткая серия нажатий и остановка
    { at: Math.max(1, introType), src: COMMON("typing"), volume: 0.05, dur: 26 * F, fade: 0.15 },
    // кабинет: коллега открывает дверь и, уходя, прикрывает её
    { at: sceneAt("offer", 68 * F), src: OWN("door-open"), volume: 0.12 },
    { at: cue("m01").to + (22 + 38) * F, src: OWN("door-close"), volume: 0.08 },
    // черновик: печать сериями; напоминание; щелчок «сохранить»; крышка
    // ноутбука закрывается; ключи; стул
    { at: sceneAt("draft", 4 * F), src: COMMON("typing"), volume: 0.08, dur: 1.2, fade: 0.2 },
    { at: MOMENTS.reminder, src: COMMON("chime"), volume: 0.16 },
    { at: MOMENTS.saved, src: COMMON("tap"), volume: 0.1 },
    { at: MOMENTS.saved + 24 * F, src: OWN("laptop-close"), volume: 0.12 },
    { at: MOMENTS.saved + 32 * F, src: OWN("keys"), volume: 0.12 },
    { at: MOMENTS.saved + 42 * F, src: OWN("chair"), volume: 0.07 },
    // школа: машина подъезжает; задняя дверь открывается и закрывается;
    // ремень; дорога домой
    { at: sceneAt("car", 0), src: COMMON("car"), volume: 0.08, dur: 1.6, fade: 0.4 },
    { at: sceneAt("car", 80 * F), src: OWN("car-door"), volume: 0.09 },
    { at: sceneAt("car", 128 * F), src: OWN("car-door"), volume: 0.12 },
    { at: sceneAt("car", 146 * F), src: OWN("belt"), volume: 0.1 },
    { at: sceneAt("car", 150 * F), src: COMMON("traffic"), volume: 0.07, dur: sceneById("car").to - sceneById("car").from - 150 * F, fade: 0.8 },
    // дом: мама уходит, дверь закрывается; офис: отложенные документы
    { at: sceneAt("days", 72 * F), src: OWN("door-close"), volume: 0.08 },
    { at: word("n02", 4), src: COMMON("typing"), volume: 0.06, dur: 1.4, fade: 0.3 },
    // вечер: муж садится рядом; щелчок по тачпаду — открывается календарь
    { at: sceneAt("husband", 52 * F), src: OWN("chair"), volume: 0.07 },
    { at: MOMENTS.toCalendar - 22 * F, src: COMMON("tap"), volume: 0.08 },
    // рисунок переходит из рук в руки; позже мама кладёт его на стол
    { at: sceneAt("drawing", 70 * F), src: COMMON("paper"), volume: 0.14 },
    { at: lay + 8 * F, src: COMMON("paper"), volume: 0.08 },
    // поиск: запрос набирается, нажатие на BalaGo; страница: «Алдын ала
    // арыз»; заявка: выбор маршрута, нажатие и подтверждение
    { at: R(rb.qFrom), src: COMMON("typing"), volume: 0.05, dur: Math.max(0.5, (rb.qTo - rb.qFrom) * F), fade: 0.2 },
    { at: R(rb.resClick), src: COMMON("tap"), volume: 0.1 },
    { at: R(rb.pageClick), src: COMMON("tap"), volume: 0.12 },
    { at: R(rb.chooseAt), src: COMMON("tap"), volume: 0.1 },
    { at: R(rb.tap), src: COMMON("tap"), volume: 0.16 },
    { at: R(rb.sent), src: COMMON("notify"), volume: 0.13 },
    // ответ: крышка поднимается; печать вместе с внутренним голосом;
    // «Жөнөтүү», «Жөнөтүлдү»
    { at: sceneAt("reply", 8 * F), src: OWN("laptop-open"), volume: 0.1 },
    { at: word("m06", 2) - 2 * F, src: COMMON("typing"), volume: 0.05, dur: m06.to - word("m06", 2), fade: 0.2 },
    { at: m06.to + 0.5, src: COMMON("tap"), volume: 0.16 },
    { at: replySent, src: COMMON("notify"), volume: 0.15 },
    // рисунок из папки — к подставке у ноутбука
    { at: toDesk + 18 * F, src: COMMON("paper"), volume: 0.12 },
    { at: toDesk + 72 * F, src: COMMON("paper"), volume: 0.07 },
    { at: sceneAt("contact", 0.05), src: COMMON("chime"), volume: 0.08 },
  ];
};
