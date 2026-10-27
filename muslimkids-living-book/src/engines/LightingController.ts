import { TL } from "../story/timeline";
import { prog } from "../utils/math";

/**
 * LightingController — мягкий тёплый свет комнаты.
 * Большой рассеянный ключевой источник сверху-сбоку, холодное заполнение
 * с противоположной стороны, окружение (RoomEnvironment) для объёма.
 * Изменения плавные и небольшие — без вспышек: при раскрытии книги чуть
 * светлее, на тёмном «небесном» развороте немного больше заполнения, чтобы
 * детали оставались видны на телефоне.
 */
export const lightingAt = (t: number) => {
  const opened = prog(t, TL.book.coverOpen);
  const sky = prog(t, [34.6, 36.0]) * (1 - prog(t, [53.6, 55.6]));
  return {
    key: 2.25 + 0.15 * opened,
    keyColor: "#fff1dc",
    fill: 0.55 + 0.25 * sky,
    fillColor: "#cfe2ff",
    ambient: 0.32 + 0.08 * sky,
    hemiSky: "#fff4e4",
    hemiGround: "#6b4a33",
    env: 0.45 + 0.1 * sky,
    exposure: 1.05,
  };
};
