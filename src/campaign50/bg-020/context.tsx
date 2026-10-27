import { createContext, useContext } from "react";
import { BG020_VIDEO, type Bg020SceneId } from "./script";
import { buildBg020Timeline, estimateBg020Manifest, sceneSpan, type Bg020Timeline } from "./timeline";

const FPS = BG020_VIDEO.fps;

export const TimelineContext = createContext<Bg020Timeline>(buildBg020Timeline(estimateBg020Manifest()));
export const useTimeline = () => useContext(TimelineContext);

// Реплика в кадрах сцены (по фактической озвучке).
export type LineF = { readonly from: number; readonly to: number; readonly len: number; readonly wordAt: (needle: string, fallback: number) => number };

export const lineF = (tl: Bg020Timeline, id: string, scene: Bg020SceneId): LineF => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const base = sceneSpan(tl, scene).from;
  const from = Math.round((c.from - base) * FPS);
  const to = Math.round((c.to - base) * FPS);
  // начало слова (по таймингам озвучки) или доля длительности реплики
  const wordAt = (needle: string, fallback: number) => {
    const w = c.words.find((x) => x.text.toLowerCase().startsWith(needle.toLowerCase()));
    return w ? Math.round((w.start - base) * FPS) : Math.round(from + (to - from) * fallback);
  };
  return { from, to, len: to - from, wordAt };
};

export const sceneFrames = (tl: Bg020Timeline, id: Bg020SceneId) => {
  const s = sceneSpan(tl, id);
  return { from: Math.round(s.from * FPS), dur: Math.round((s.to - s.from) * FPS) };
};
