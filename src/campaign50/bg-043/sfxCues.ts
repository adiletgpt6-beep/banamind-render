// Сводная шкала звуковых эффектов: каждая сцена отдаёт свои эффекты по
// тем же «битам», что и анимация (scenes/*: *Sfx). Файлы эффектов
// синтезируются локально: scripts/campaign50/bg-043/sfx.mjs.
import { alignSfx } from "./scenes/Align";
import { ctaSfx } from "./scenes/Cta";
import { fieldsSfx } from "./scenes/Fields";
import { hookSfx } from "./scenes/Hook";
import { searchSfx } from "./scenes/Search";
import { trialSfx } from "./scenes/Trial";
import { sceneOf, type Bg43Timeline } from "./timing";
import { GEAR_FRAMES, IRIS_IN } from "./Transition";

export const SFX_NAMES = [
  "tick",
  "tock",
  "ring",
  "ringShort",
  "gear",
  "pop",
  "step",
  "slide",
  "pen",
  "page",
  "type",
  "click",
  "whoosh",
  "chime",
  "stamp",
  "boing",
  "car",
  "ding",
] as const;
export type SfxName = (typeof SFX_NAMES)[number];
export type SfxCue = { readonly at: number; readonly src: SfxName; readonly volume: number };
// Эффекты сцены: кадры — от начала РОЛИКА (sceneFrom уже прибавлен).
export type SceneSfx = (tl: Bg43Timeline, sceneFrom: number, sceneFrames: number) => SfxCue[];

export const SFX_CUES = (tl: Bg43Timeline): SfxCue[] => {
  const at = (id: Parameters<typeof sceneOf>[1]) => sceneOf(tl, id);
  const out: SfxCue[] = [];
  const add = (id: Parameters<typeof sceneOf>[1], fn: SceneSfx) => out.push(...fn(tl, at(id).from, at(id).frames));
  add("hook", hookSfx);
  add("align", alignSfx);
  add("search", searchSfx);
  add("fields", fieldsSfx);
  add("trial", trialSfx);
  add("cta", ctaSfx);
  // переходы
  out.push({ at: at("fields").from - Math.floor(GEAR_FRAMES / 2) - 2, src: "whoosh", volume: 0.16 });
  out.push({ at: at("fields").from - 3, src: "gear", volume: 0.12 });
  out.push({ at: at("trial").from - Math.floor(GEAR_FRAMES / 2) - 2, src: "whoosh", volume: 0.16 });
  out.push({ at: at("trial").from - 3, src: "gear", volume: 0.12 });
  out.push({ at: at("cta").from - IRIS_IN, src: "whoosh", volume: 0.14 });
  return out;
};
