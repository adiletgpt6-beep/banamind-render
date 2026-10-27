// MirrorDimensionsEngine — дирижёр мультфильма: таблица сцен, «миры»
// (отдельные 3D-холсты), окна переходов и ключевые моменты, привязанные к речи.
// Всё вычисляется из номера кадра Remotion — рендер полностью детерминирован.
import { cue, line } from "./AudioSyncSystem";

export const FPS = 30;
export const DURATION_SEC = 60;
export const DURATION_FRAMES = FPS * DURATION_SEC; // 1800
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type SceneId =
  | "s1-first-mirror"
  | "s2-earth"
  | "s3-lake"
  | "s4-tree"
  | "s5-mirror-universe"
  | "s6-quran"
  | "s7-ending";

/** Семь сюжетных сцен (секунды). */
export const SCENES: Record<SceneId, [number, number]> = {
  "s1-first-mirror": [0, 6.3],
  "s2-earth": [6.3, 15.4],
  "s3-lake": [15.4, 24.4],
  "s4-tree": [24.4, 34.5],
  "s5-mirror-universe": [34.5, 45.6],
  "s6-quran": [45.6, 54.0],
  "s7-ending": [54.0, 60.0],
};

/**
 * Миры — независимые 3D-сцены (каждая на своём ThreeCanvas). Соседние миры
 * перекрываются на время оптического перехода; ReflectionSceneComposer
 * смешивает их маской, совпадающей с отражающей поверхностью.
 */
export const WORLDS = {
  space: { from: 0, to: 19.7 }, // зеркало, Земля, зеркало→озеро
  valley: { from: 18.4, to: 38.6 }, // горное озеро, дерево, вечер
  universe: { from: 36.9, to: 56.4 }, // зеркальная вселенная, цитата
  night: { from: 55.0, to: 60.0 }, // ночное озеро, мальчик, финал
} as const;

/** Ключевые моменты (секунды), синхронизированные с фактической озвучкой. */
export const BEATS = {
  // сцена 1
  glint: 0.3,
  mirrorWord: cue("l1", "зеркал", 2.9),
  earthInMirror: 4.3,
  // сцена 2
  earthWord: cue("l2", "земля", 7.5),
  rotatesWord: cue("l2", "вращается", 8.8),
  dayWord: cue("l2", "день", 11.7),
  nightWord: cue("l2", "ночь", 13.5),
  // сцена 3
  lookNow: line("l3").start,
  waterWord: cue("l3", "воде", 18.1),
  mountainsWord: cue("l3", "горы", 19.9),
  cloudsWord: cue("l3", "облака", 20.5),
  // сцена 4
  treeWord: cue("l4", "дерево", 26.1),
  sproutWord: cue("l4", "росток", 27.6),
  growsWord: cue("l4", "вырастает", 29.7),
  // сцена 5
  surahStart: line("l5").start,
  heavensWord: cue("l5", "небес", 38.1),
  nightDayWord: cue("l5", "ночи", 39.5),
  signsWord: cue("l5", "знамения", 40.9),
  // сцена 6
  believersStart: line("l6").start,
  lordWord: cue("l6", "господь", 48.0),
  quoteEnd: line("l6").end,
  // сцена 7
  finalQuestion: line("l7").start,
  lookAround: cue("l7", "вокруг", 57.8),
};

export const sceneAt = (t: number): SceneId => {
  const ids = Object.keys(SCENES) as SceneId[];
  return ids.find((id) => t >= SCENES[id][0] && t < SCENES[id][1]) ?? "s7-ending";
};
