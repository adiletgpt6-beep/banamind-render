// Эффекты «Он бир мүнөт» по событиям (секунды ролика). Отметки задержек —
// в Em2Audio (по моментам журнала).
import { FINAL } from "./scenes/Final";
import { sceneAt } from "./story";
import type { Em2Cue } from "./timing";

export type Em2Sfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };
const OWN = (n: string) => `audio/eleven-minutes-2d/sfx/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;

export const em2Sfx = (cues: readonly Em2Cue[]): Em2Sfx[] => {
  // щелчок календаря — когда появляется блок «Мектепке баруу» (слово
  // «Жолугушуулардын…» в реплике отца)
  const f01 = cues.find((c) => c.id === "f01");
  const planTick = f01?.words[9] ? f01.words[9].start + 0.15 : sceneAt("plan", 4.5);
  return [
    { at: sceneAt("question", 1.0), src: COMMON("whoosh"), volume: 0.12 },
    { at: planTick, src: OWN("tick"), volume: 0.4 },
    { at: sceneAt("leave", 1.0), src: OWN("door-close"), volume: 0.2 },
    { at: sceneAt("leave", 1.9), src: OWN("car-door"), volume: 0.2 },
    { at: sceneAt("waiting", 0), src: OWN("birds"), volume: 0.16, dur: 15, fade: 0.8 },
    { at: sceneAt("waiting", 2.6), src: COMMON("bell"), volume: 0.12 },
    { at: sceneAt("car", 0.2), src: OWN("belt"), volume: 0.18 },
    { at: sceneAt("road", 0), src: COMMON("traffic"), volume: 0.18, dur: 8, fade: 0.8 },
    { at: sceneAt("grandma", 0.6), src: OWN("door-open"), volume: 0.22 },
    { at: sceneAt("final", FINAL.tap / 30), src: COMMON("tap"), volume: 0.3 },
    { at: sceneAt("final", FINAL.sent / 30), src: COMMON("notify"), volume: 0.22 },
    { at: sceneAt("final", FINAL.grow[0] / 30), src: OWN("tick"), volume: 0.4 },
    { at: sceneAt("final", FINAL.grow[1] / 30), src: OWN("tick"), volume: 0.3 },
    { at: sceneAt("final", FINAL.card / 30), src: COMMON("chime"), volume: 0.18 },
  ];
};
