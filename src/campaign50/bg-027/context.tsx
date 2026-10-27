// Общее для сцен BalaGoBG027: шкала (сцены и реплики по фактической
// озвучке), моменты реплик и слов в кадрах сцены.
import { createContext, useContext } from "react";
import { BG27_VIDEO, type Bg27SceneId } from "./script";
import { buildBg27Timeline, estimateBg27Manifest, lineFramesIn, sceneOf, wordFrameIn, type Bg27Timeline } from "./timing";

export const TimelineContext = createContext<Bg27Timeline>(buildBg27Timeline(estimateBg27Manifest()));
export const useTimeline = () => useContext(TimelineContext);

// Длительность сцены в кадрах.
export const useSceneFrames = (id: Bg27SceneId) => {
  const s = sceneOf(useTimeline(), id);
  return Math.round((s.to - s.from) * BG27_VIDEO.fps);
};
export const useLine = (id: string) => lineFramesIn(useTimeline(), id);
export const useWord = (id: string, i: number) => wordFrameIn(useTimeline(), id, i);
