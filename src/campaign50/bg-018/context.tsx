import { createContext, useContext } from "react";
import { BG18_VIDEO, type Bg18SceneId } from "./script";
import { buildBg18Timeline, estimateBg18Manifest, type Bg18Timeline } from "./timing";

export const FPS = BG18_VIDEO.fps;

export const TimelineContext = createContext<Bg18Timeline>(buildBg18Timeline(estimateBg18Manifest()));

export const useTimeline = () => useContext(TimelineContext);

// Кадры сцены: начало/конец и длительность (кадры ролика).
export const useSceneFrames = (id: Bg18SceneId) => {
  const tl = useTimeline();
  const s = tl.scenes.find((x) => x.id === id)!;
  const from = Math.round(s.from * FPS);
  const to = Math.round(s.to * FPS);
  return { from, to, len: to - from };
};

// Начало и конец реплики в кадрах сцены.
export const useLine = (id: string) => {
  const tl = useTimeline();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const s = tl.scenes.find((x) => x.id === c.scene)!;
  return { from: Math.round((c.from - s.from) * FPS), to: Math.round((c.to - s.from) * FPS), cue: c };
};

// Кадр сцены, когда в реплике звучит слово (по фактическим таймингам).
export const useWordAt = (id: string, wordIndex: number) => {
  const { cue } = useLine(id);
  const tl = useTimeline();
  const s = tl.scenes.find((x) => x.id === cue.scene)!;
  const w = cue.words[Math.min(wordIndex, cue.words.length - 1)];
  return Math.round(((w ? w.start : cue.from) - s.from) * FPS);
};
