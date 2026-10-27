import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { BG24_VIDEO } from "./script";
import { buildBg24Timeline, estimateBg24Manifest, type Bg24Timeline } from "./timing";

const FPS = BG24_VIDEO.fps;

// Шкала ролика (сцены и реплики) — доступна всем сценам.
export const TimelineContext = createContext<Bg24Timeline>(buildBg24Timeline(estimateBg24Manifest()));
export const useTimeline = () => useContext(TimelineContext);
// Текущая сцена: начало (кадр ролика) и длина (кадры).
export const SceneContext = createContext<{ readonly from: number; readonly frames: number }>({ from: 0, frames: 1 });
export const useScene = () => useContext(SceneContext);

export const useAbsFrame = () => useCurrentFrame() + useContext(SceneContext).from;

// Начало и конец реплики в кадрах текущей сцены (по фактической озвучке).
export const useLine = (id: string) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return { from: Math.round(c.from * FPS) - from, to: Math.round(c.to * FPS) - from };
};

// Кадр сцены, когда звучит слово с номером index реплики id (по таймингам
// озвучки; без озвучки — оценка).
export const useWordAt = (id: string, index: number) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const w = c.words[Math.min(index, c.words.length - 1)];
  return Math.round((w ? w.start : c.from) * FPS) - from;
};
