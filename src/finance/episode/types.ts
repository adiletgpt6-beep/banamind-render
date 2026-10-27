import type { PoseName } from "../horse/rig";

/** Место ведущего в широком кадре. */
export type Layout = "center" | "left" | "right" | "corner" | "close" | "off";

/**
 * Привязка к речи: "lineId" — начало реплики, "lineId@word" — начало слова,
 * "lineId@word#2" — третье вхождение, "lineId$" — конец реплики,
 * "+0.5" суффикс — сдвиг в секундах (например "s1a@zero+0.3").
 */
export type Cue = string;

export type Line = {
  id: string;
  text: string;
  /** пауза после реплики, с */
  pauseAfter?: number;
  /** произношение для TTS: токен текста → как его сказать (субтитры не меняются) */
  say?: Record<string, string>;
  /** русская версия: слово-якорь для английской привязки графики (cue → слово[#n]) */
  anchors?: Record<string, string>;
  /** слова для умеренной подсветки в субтитрах */
  hl?: string[];
};

export type Scene = {
  id: string;
  /** название главы (для оглавления и проверок) */
  chapter: string;
  bg: "cream" | "sky";
  lines: Line[];
  /** положение ведущего по ходу сцены; первая запись — со старта сцены */
  host: { at: Cue; layout: Layout }[];
  /** позы ведущего */
  poses: { at: Cue; pose: PoseName }[];
  /** ключ визуального блока (components/visuals) */
  visual: string;
  extraLead?: number;
  hold?: number;
};
