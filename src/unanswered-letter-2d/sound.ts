// Эффекты «Жооп берилбеген кат» по событиям (секунды ролика). Немного:
// негромкая клавиатура, дверь кабинета, один мягкий сигнал напоминания,
// ключи, бумага рисунка, нажатия и подтверждения отправки (заявка и письмо).
// Без шагов, тиканья и звука на каждую карточку.
import { MOMENTS, sceneById } from "./layout";
import { UL2_VIDEO, type Ul2SceneId } from "./script";
import type { Ul2Cue } from "./timing";

export type Ul2Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };
const OWN = (n: string) => `audio/unanswered-letter-2d/sfx/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
const F = 1 / UL2_VIDEO.fps;
export const sceneAt = (id: Ul2SceneId, sec: number) => sceneById(id).from + sec;

export const ul2Sfx = (cues: readonly Ul2Cue[]): Ul2Sfx[] => {
  const cue = (id: string) => cues.find((c) => c.id === id)!;
  const word = (id: string, i: number) => cue(id).words[i]?.start ?? cue(id).from;
  const m06 = cue("m06");
  const replySent = m06.to + 0.62;
  return [
    { at: 0.15, src: COMMON("whoosh"), volume: 0.07 },
    // кабинет: коллега открывает дверь и уходит
    { at: cue("c01").from - 0.85, src: OWN("door-open"), volume: 0.12 },
    { at: cue("m01").to + 1.25, src: OWN("door-close"), volume: 0.08 },
    // черновик: короткая печать, затем тишина; одно напоминание; ключи; блокировка
    { at: sceneAt("draft", 6 * F), src: COMMON("typing"), volume: 0.08, dur: 1.4, fade: 0.2 },
    { at: MOMENTS.reminder, src: COMMON("chime"), volume: 0.16 },
    { at: MOMENTS.reminder + 54 * F, src: OWN("keys"), volume: 0.12 },
    { at: MOMENTS.reminder + 72 * F, src: COMMON("tap"), volume: 0.07 },
    // дорога домой
    { at: sceneAt("car", 1.1), src: COMMON("traffic"), volume: 0.07, dur: 7.8, fade: 0.8 },
    // офис: отложенные документы
    { at: sceneAt("days", 2.4), src: COMMON("typing"), volume: 0.06, dur: 1.6, fade: 0.3 },
    // вечер: щелчок по тачпаду — открывается календарь
    { at: MOMENTS.toCalendar - 22 * F, src: COMMON("tap"), volume: 0.08 },
    // рисунок переходит из рук в руки
    { at: sceneAt("drawing", 84 * F), src: COMMON("paper"), volume: 0.14 },
    // заявка BalaGo: нажатие и подтверждение
    { at: cue("n04").to + 10 * F, src: COMMON("tap"), volume: 0.16 },
    { at: cue("n04").to + 16 * F, src: COMMON("notify"), volume: 0.13 },
    // ответ: печать смысловыми порциями, «Жөнөтүү», «Жөнөтүлдү»
    ...[0, 2, 7].map((i) => ({ at: word("m06", i) - 2 * F, src: COMMON("typing"), volume: 0.05, dur: 0.55, fade: 0.12 })),
    { at: m06.to + 0.4, src: COMMON("tap"), volume: 0.16 },
    { at: replySent, src: COMMON("notify"), volume: 0.15 },
    // рисунок из папки — к монитору
    { at: replySent + 38 * F, src: COMMON("paper"), volume: 0.12 },
    { at: replySent + 72 * F, src: COMMON("paper"), volume: 0.07 },
    { at: sceneAt("contact", 0.05), src: COMMON("chime"), volume: 0.1 },
  ];
};
