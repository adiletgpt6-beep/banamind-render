// События сцен decision / group / start / cta для звука (кадры сцены →
// секунды ролика). Плёнку (◀◀/❚❚/▶/▶▶) озвучивает sound.ts.
import type { Sfx } from "../sound";
import type { Bg41Timeline } from "../timing";
import { ctaSfx } from "./Cta";
import { decisionKeys } from "./Decision";
import { groupKeys } from "./Group";
import { startSfx } from "./Start";

export const sceneSfx = (tl: Bg41Timeline): Sfx[] => {
  const from = (id: string) => tl.scenes.find((s) => s.id === id)!.from;
  const d = decisionKeys(tl);
  const g = groupKeys(tl);
  const at = (id: string, f: number) => from(id) + f / 30;
  return [
    // решение: мини-машина на карточке пробы, отметки, штамп «акысыз», стрелка
    { src: "audio/sfx-paper.mp3", at: at("decision", d.pushA), volume: 0.18 },
    { src: "audio/sfx-pop.mp3", at: at("decision", d.m1), volume: 0.2 },
    { src: "audio/sfx-pop.mp3", at: at("decision", d.n1), volume: 0.2 },
    { src: "audio/sfx-chime.mp3", at: at("decision", d.stampAt), volume: 0.16 },
    { src: "audio/sfx-whoosh.mp3", at: at("decision", d.arrowA), volume: 0.1 },
    // группа: факты и честная печать «Кепилдик жок»
    { src: "audio/sfx-pop.mp3", at: at("group", g.need), volume: 0.18 },
    { src: "audio/sfx-pop.mp3", at: at("group", g.search), volume: 0.18 },
    { src: "audio/sfx-paper.mp3", at: at("group", g.stamp), volume: 0.24 },
    ...startSfx(tl),
    ...ctaSfx(tl),
  ];
};
