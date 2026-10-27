// Негромкие немелодические эффекты по смыслу: «поп» при появлении карточки,
// «вжух» при смене сцены, «тик» при подсчёте, мягкий «тук» на ошибке.
// Привязки — к словам озвучки (см. SFX в script.ts).
import { cueTime, type Timeline } from "../timeline";
import { SFX } from "./script";
import type { Scene } from "./types";

export type SfxKind = "pop" | "whoosh" | "tick" | "thud";
export const SFX_FILES: Record<SfxKind, string> = { pop: "pop.mp3", whoosh: "whoosh.mp3", tick: "tick.mp3", thud: "thud.mp3" };
const VOL: Record<SfxKind, number> = { pop: 0.55, whoosh: 0.22, tick: 0.18, thud: 0.16 };

export const sfxCues = (tl: Timeline, SCENES: Scene[]) => {
  const out: { at: number; kind: SfxKind; volume: number }[] = [];
  // смена сцены — тихий «вжух» (кроме первой)
  tl.scenes.forEach((s, i) => {
    if (i > 0 && SCENES[i].bg !== SCENES[i - 1].bg) out.push({ at: s.from, kind: "whoosh", volume: VOL.whoosh });
  });
  for (const [cue, kind] of SFX) out.push({ at: cueTime(tl, cue), kind, volume: VOL[kind] });
  return out.sort((a, b) => a.at - b.at);
};
