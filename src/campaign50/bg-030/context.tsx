import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { BG30_VIDEO } from "./script";
import { buildBg30Timeline, estimateBg30Manifest, type Bg30Timeline } from "./timing";

const FPS = BG30_VIDEO.fps;

// Шкала ролика (сцены и реплики) — доступна всем сценам.
export const TimelineContext = createContext<Bg30Timeline>(buildBg30Timeline(estimateBg30Manifest()));
export const useTimeline = () => useContext(TimelineContext);
// Текущая сцена: начало (кадр ролика), длина (кадры) и «заход» — сколько
// кадров сцена рисуется до своего начала (мягкий переход поверх
// предыдущей сцены).
export const SceneContext = createContext<{ readonly from: number; readonly frames: number; readonly lead: number }>({ from: 0, frames: 1, lead: 0 });
export const useScene = () => useContext(SceneContext);

// Кадр сцены (0 — начало сцены по шкале; во время захода — отрицательный).
export const useSceneFrame = () => useCurrentFrame() - useContext(SceneContext).lead;

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
