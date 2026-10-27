import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { BG22_VIDEO } from "./script";
import {
  buildBg22Timeline,
  estimateBg22Manifest,
  type Bg22Timeline,
} from "./timing";

const FPS = BG22_VIDEO.fps;

// Шкала ролика (сцены и реплики) — доступна всем сценам.
export const TimelineContext = createContext<Bg22Timeline>(
  buildBg22Timeline(estimateBg22Manifest()),
);
export const useTimeline = () => useContext(TimelineContext);
// Текущая сцена: начало (кадр ролика) и длина (кадры).
export const SceneContext = createContext<{
  readonly from: number;
  readonly frames: number;
}>({ from: 0, frames: 1 });
export const useScene = () => useContext(SceneContext);

// Кадр ролика (абсолютный) для текущего кадра сцены.
export const useAbsFrame = () =>
  useCurrentFrame() + useContext(SceneContext).from;

// Начало и конец реплики в кадрах текущей сцены (по фактической озвучке).
export const useLine = (id: string) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return {
    from: Math.round(c.from * FPS) - from,
    to: Math.round(c.to * FPS) - from,
  };
};

// Момент (кадр сцены), когда диктор произносит слово с индексом i реплики id.
export const useWordAt = (id: string, i: number) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const w = c.words[Math.min(i, c.words.length - 1)];
  return Math.round((w ? w.start : c.from) * FPS) - from;
};
