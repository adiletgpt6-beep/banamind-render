// Эффекты по видимым действиям (кадр ролика) — собираются из сцен
// (каждая сцена экспортирует <id>Sfx по своему плану). Только тихие
// предметные звуки в точке действия: ключи со стола, дверь машины, защёлка
// ремня, звонок/вибрация телефона на парковке, лист бумаги, касание кнопки.
// Во время живых реплик эффектов нет; звуков ходьбы нет.
import type { M13Timeline } from "../timing";
import { M13_VIDEO, type M13SceneId } from "../script";
import { calendarSfx } from "./Calendar";
import { noticeSfx } from "./Notice";
import { askSfx } from "./Ask";
import { driveSfx } from "./Drive";
import { revealSfx } from "./Reveal";
import { grandmaSfx } from "./Grandma";
import { backSfx } from "./Back";
import { eveningSfx } from "./Evening";
import { homeSfx } from "./Home";
import { drawingSfx } from "./Drawing";
import { brandSfx } from "./Brand";

export type M13Sfx = { readonly frame: number; readonly src: string; readonly volume: number; readonly dur?: number };

// Файлы эффектов: public/meeting-1320/sfx/<имя>.mp3 (scripts/m1320-foley.mjs).
export const M13_SFX_FILES = [
  "keys-pickup",
  "keys-jingle",
  "car-door-open",
  "car-door-close",
  "belt-pull",
  "belt-click",
  "phone-vibrate",
  "phone-tap",
  "paper-slide",
  "paper-place",
  "flat-door",
  "notify",
  "chair",
] as const;
export type SfxName = (typeof M13_SFX_FILES)[number];
export const sfxSrc = (n: SfxName) => `${M13_VIDEO.assetDir}/sfx/${n}.mp3`;
// Эффект в кадре f сцены id.
export const sfxAt = (tl: M13Timeline, id: M13SceneId, f: number, n: SfxName, volume: number, dur?: number): M13Sfx => ({
  frame: tl.scenes.find((s) => s.id === id)!.from + f,
  src: sfxSrc(n),
  volume,
  ...(dur ? { dur } : {}),
});

export const m13Sfx = (tl: M13Timeline): M13Sfx[] => {
  const out: M13Sfx[] = [
    ...calendarSfx(tl),
    ...noticeSfx(tl),
    ...askSfx(tl),
    ...driveSfx(tl),
    ...revealSfx(tl),
    ...grandmaSfx(tl),
    ...backSfx(tl),
    ...eveningSfx(tl),
    ...homeSfx(tl),
    ...drawingSfx(tl),
    ...brandSfx(tl),
  ];
  // ни один эффект не звучит поверх живой реплики
  const quiet = tl.cues.filter((c) => c.mode === "live").map((c) => [Math.round(c.from * M13_VIDEO.fps) - 4, Math.round(c.to * M13_VIDEO.fps) + 4]);
  return out.filter((x) => !quiet.some(([a, b]) => x.frame >= a && x.frame <= b)).sort((a, b) => a.frame - b.frame);
};
