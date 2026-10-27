// Звуковой эффект сцены: кадр от начала сцены, файл из
// public/audio/campaign50/bg-025/sfx/ и громкость.
import type { Bg25Timeline } from "./timing";

export type Sfx = { readonly at: number; readonly src: string; readonly volume: number };
export type SceneSfx = (tl: Bg25Timeline) => readonly Sfx[];

// Доступные эффекты (scripts/campaign50/bg-025/sfx.mjs).
export const SFX = {
  tap: "sfx/tap.mp3", // касание экрана
  type: "sfx/type.mp3", // короткая серия нажатий клавиатуры
  send: "sfx/send.mp3", // отправка сообщения (мягкий «вжик»)
  ping: "sfx/ping.mp3", // тихий сигнал нового сообщения
  unfold: "sfx/unfold.mp3", // бумага разворачивается (шелест)
  fold: "sfx/fold.mp3", // бумага складывается (короткий шелест)
  rustle: "sfx/rustle.mp3", // лёгкий шелест бумаги
  pop: "sfx/pop.mp3", // pop-up элемент встаёт
  tick: "sfx/tick.mp3", // отметка
  chime: "sfx/chime.mp3", // мягкий колокольчик (совпадение, решение)
  slide: "sfx/slide.mp3", // ползунок
  whoosh: "sfx/whoosh.mp3", // мягкий переход
} as const;
