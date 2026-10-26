import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { BG15_VIDEO, type Bg15SceneId } from "./script";
import { buildTimeline, estimateManifest, type Cue, type Timeline } from "./timeline";

const FPS = BG15_VIDEO.fps;

export const TimelineContext = createContext<Timeline>(buildTimeline(estimateManifest()));

export const useTimeline = () => useContext(TimelineContext);

export const sceneOf = (tl: Timeline, id: Bg15SceneId) => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  return s;
};

// Длина сцены и реплики в кадрах сцены.
export const useSceneInfo = (id: Bg15SceneId) => {
  const tl = useTimeline();
  const sc = sceneOf(tl, id);
  const base = Math.round(sc.from * FPS);
  const dur = Math.round(sc.to * FPS) - base;
  const cue = (lineId: string): Cue => {
    const c = tl.cues.find((x) => x.id === lineId);
    if (!c) throw new Error(`Нет реплики ${lineId}`);
    return c;
  };
  // секунды ролика → кадр сцены
  const fr = (sec: number) => Math.round(sec * FPS) - base;
  const line = (lineId: string) => {
    const c = cue(lineId);
    return { from: fr(c.from), to: fr(c.to), cue: c };
  };
  return { f: useCurrentFrame(), dur, base, cue, line, fr };
};
