// Хронометраж «Удивительная картина мира»: 60 с, 30 fps, 1800 кадров.
import voice from "./data/voice-timings.json";

export const FPS = 30;
export const DURATION = 1800;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Границы сцен по сценарию (кадры). */
export const SCENES = {
  s1: [0, 180], // Одна золотая нить
  s2: [180, 450], // Тканая Земля
  s3: [450, 720], // Горы из нитей
  s4: [720, 1020], // Дерево из волокон
  s5: [1020, 1350], // Небо и большая картина
  s6: [1350, 1620], // Слова из Корана
  s7: [1620, 1800], // Возвращение к первой нити
} as const;

/**
 * Начало каждой реплики (кадр). Подобрано по фактическим длительностям TTS так, чтобы
 * ключевые слова совпадали с изображением: «нить» — нить, «Земля» — Земля, «горы» — горы,
 * «дерево» — дерево, «небес» — небо. Во время цитаты аята движение замедлено.
 */
export const VOICE_START: Record<keyof typeof voice, number> = {
  s1: 12,
  s2: 206,
  s3: 532,
  s4: 738,
  s5: 1036,
  s6: 1370,
  s7: 1640,
};

export type SceneId = keyof typeof voice;
export const VOICE = voice as Record<SceneId, { duration: number; phrases: { text: string; start: number; dur: number }[] }>;

/** Кадр начала фразы p сцены s. */
export const phraseFrame = (s: SceneId, p: number) => Math.round(VOICE_START[s] + VOICE[s].phrases[p].start * FPS);
export const voiceEnd = (s: SceneId) => Math.round(VOICE_START[s] + VOICE[s].duration * FPS);
