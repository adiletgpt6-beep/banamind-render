import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { BG26_VIDEO } from "./script";
import { buildBg26Timeline, estimateBg26Manifest, type Bg26Timeline } from "./timing";

const FPS = BG26_VIDEO.fps;

// Шкала ролика (сцены и реплики) — доступна всем сценам.
export const TimelineContext = createContext<Bg26Timeline>(buildBg26Timeline(estimateBg26Manifest()));
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

// Кадр сцены, когда звучит первое слово реплики id, начинающееся с prefix
// (без учёта регистра). Если слова нет — начало реплики.
export const useWordStarting = (id: string, prefix: string) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const p = prefix.toLowerCase();
  const w = c.words.find((x) => x.text.toLowerCase().replace(/[^\p{L}-]/gu, "").startsWith(p));
  return Math.round((w ? w.start : c.from) * FPS) - from;
};
