// Время сцены вне React: кадры реплик и слов относительно начала сцены.
// Им пользуются и сцены (анимация), и звуковой слой (эффекты по действиям).
import { KM2_VIDEO, type Km2SceneId } from "./script.ts";
import type { Km2Timeline } from "./timing.ts";

const FPS = KM2_VIDEO.fps;
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}-]/gu, "");

export const sceneTools = (tl: Km2Timeline, id: Km2SceneId) => {
  const sc = tl.scenes.find((s) => s.id === id)!;
  const rel = (sec: number) => Math.round(sec * FPS - sc.from);
  const cue = (lineId: string) => {
    const c = tl.cues.find((x) => x.id === lineId);
    if (!c) throw new Error(`Нет реплики ${lineId}`);
    return c;
  };
  const wi = (lineId: string, w: number | string) => {
    const c = cue(lineId);
    return typeof w === "number" ? w : c.words.findIndex((x) => norm(x.text).startsWith(norm(w)));
  };
  return {
    start: sc.from,
    len: sc.to - sc.from,
    rel,
    cue,
    from: (lineId: string) => rel(cue(lineId).from),
    to: (lineId: string) => rel(cue(lineId).to),
    word: (lineId: string, w: number | string) => {
      const c = cue(lineId);
      const ww = c.words[wi(lineId, w)];
      return rel(ww ? ww.start : c.from);
    },
    wordEnd: (lineId: string, w: number | string) => {
      const c = cue(lineId);
      const ww = c.words[wi(lineId, w)];
      return rel(ww ? ww.end : c.to);
    },
    // абсолютное время (с) кадра сцены
    sec: (frame: number) => (sc.from + frame) / FPS,
  };
};
export type SceneTools = ReturnType<typeof sceneTools>;
