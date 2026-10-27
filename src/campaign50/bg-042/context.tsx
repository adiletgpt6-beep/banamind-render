// Шкала ролика доступна всем сценам: реплики (с фактическими таймингами
// слов и букв) и границы сцен.
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CLOSED, lipAt as ts2LipAt, type Viseme } from "../../two-schedules-2d/context";
import type { Ts2Cue } from "../../two-schedules-2d/timing";
import { BG42_VIDEO, type Bg42Role, type Bg42SceneId } from "./script";
import { buildTimeline, cueOf, estimateManifest, sceneOf, wordEnd, wordTime, type Cue, type Timeline } from "./timeline";

export const FPS = BG42_VIDEO.fps;

export const TimelineContext = createContext<Timeline>(buildTimeline(estimateManifest()));
export const useTimeline = () => useContext(TimelineContext);

export type SceneClock = {
  /** Кадр сцены. */
  readonly f: number;
  /** Кадр ролика. */
  readonly abs: number;
  /** Длина сцены, кадры. */
  readonly len: number;
  /** Абсолютное время (с) → кадр сцены. */
  readonly at: (sec: number) => number;
  /** Реплика по id. */
  readonly cue: (id: string) => Cue;
  /** Кадр сцены, где начинается слово w реплики id. */
  readonly word: (id: string, w: number) => number;
  /** Кадр сцены, где заканчивается слово w реплики id. */
  readonly wordEnd: (id: string, w: number) => number;
  readonly tl: Timeline;
};

// Кадр сцены ↔ время ролика.
export const useScene = (id: Bg42SceneId): SceneClock => {
  const tl = useTimeline();
  const span = sceneOf(tl, id);
  const f = useCurrentFrame();
  const start = Math.round(span.from * FPS);
  const len = Math.round(span.to * FPS) - start;
  const at = (sec: number) => Math.round(sec * FPS) - start;
  return {
    f,
    abs: f + start,
    len,
    at,
    cue: (cid) => cueOf(tl, cid),
    word: (cid, w) => at(wordTime(cueOf(tl, cid), w)),
    wordEnd: (cid, w) => at(wordEnd(cueOf(tl, cid), w)),
    tl,
  };
};

// Губы по фактической речи: формы букв и огибающая громкости файла
// (общая функция 2D-роликов, только чтение).
export const lipsOf = (tl: Timeline, role: Bg42Role, absFrame: number): Viseme =>
  ts2LipAt(tl.cues as unknown as readonly Ts2Cue[], role as never, absFrame);

export const speaking = (tl: Timeline, role: Bg42Role, absFrame: number, pad = 0.15) => {
  const t = absFrame / FPS;
  return tl.cues.some((c) => c.role === role && t >= c.from - pad && t <= c.to + pad);
};

export { CLOSED };
export type { Viseme };
