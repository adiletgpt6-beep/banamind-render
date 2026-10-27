// Шкала ролика доступна всем сценам: реплики (с фактическими таймингами
// слов и букв) и границы сцен.
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { lipAt as ts2LipAt, CLOSED, type Viseme } from "../../two-schedules-2d/context";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { BG016_VIDEO, type Bg016Role, type Bg016SceneId } from "./script";
import { buildTimeline, estimateManifest, type Cue, type Timeline } from "./timeline";

export const FPS = BG016_VIDEO.fps;

export const TimelineContext = createContext<Timeline>(buildTimeline(estimateManifest()));
export const useTimeline = () => useContext(TimelineContext);

export const sceneSpan = (tl: Timeline, id: Bg016SceneId) => tl.scenes.find((s) => s.id === id)!;
export const cueOf = (tl: Timeline, id: string): Cue => tl.cues.find((c) => c.id === id)!;

// Кадр сцены → секунды ролика и обратно.
export const useScene = (id: Bg016SceneId) => {
  const tl = useTimeline();
  const span = sceneSpan(tl, id);
  const f = useCurrentFrame();
  const start = Math.round(span.from * FPS);
  const len = Math.round((span.to - span.from) * FPS);
  // абсолютное время (с) → кадр сцены
  const at = (sec: number) => Math.round((sec - span.from) * FPS);
  return { f, abs: f + start, start, len, at, tl };
};

// Губы по фактической речи: формы букв и огибающая громкости файла
// (общая функция 2D-роликов, только чтение).
export const lipsOf = (tl: Timeline, role: Bg016Role, absFrame: number): Viseme =>
  ts2LipAt(tl.cues as unknown as readonly Ts2Cue[], role, absFrame);

export const speaking = (tl: Timeline, role: Bg016Role, absFrame: number, pad = 0.15) => {
  const t = absFrame / FPS;
  return tl.cues.some((c) => c.role === role && t >= c.from - pad && t <= c.to + pad);
};

export { CLOSED };
export type { Viseme };
