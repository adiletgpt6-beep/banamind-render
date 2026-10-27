// Общее для сцен BalaGoBG047: шкала (сцены и реплики по фактической
// озвучке) и перевод «слово реплики → кадр сцены».
import { createContext, useContext } from "react";
import { BG47_VIDEO, type Bg47SceneId, type Bg47Who } from "./script";
import { buildBg47Timeline, estimateBg47Manifest, lineFramesIn, sceneOf, speechEnvAt, wordFrameIn, type Bg47Timeline } from "./timing";

export const TimelineContext = createContext<Bg47Timeline>(buildBg47Timeline(estimateBg47Manifest()));
export const useTimeline = () => useContext(TimelineContext);

// Первый кадр текущей сцены в кадрах ролика (для губ по озвучке).
export const SceneStartContext = createContext(0);

// Длительность сцены в кадрах.
export const useSceneFrames = (id: Bg47SceneId) => {
  const s = sceneOf(useTimeline(), id);
  return Math.round((s.to - s.from) * BG47_VIDEO.fps);
};
export const useLine = (id: string) => lineFramesIn(useTimeline(), id);
export const useWord = (id: string, i: number) => wordFrameIn(useTimeline(), id, i);

// Громкость речи персонажа в кадре сцены f (0…1).
export const useSpeech = (who: Bg47Who, f: number) => {
  const tl = useTimeline();
  const start = useContext(SceneStartContext);
  return speechEnvAt(tl, who, start + f);
};
