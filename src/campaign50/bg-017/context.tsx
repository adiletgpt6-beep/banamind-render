// Шкала ролика доступна компонентам через контекст. Фильм BG-017 — один
// непрерывный «живой рисунок»: компоненты работают в абсолютном времени,
// границы сцен и моменты реплик берут из шкалы, построенной по фактической
// озвучке (timing.ts).
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { B17_VIDEO, type B17SceneId } from "./script";
import type { B17Cue, B17Timeline } from "./timing";

export const TimelineContext = createContext<B17Timeline | null>(null);

export const useTimeline = () => {
  const tl = useContext(TimelineContext);
  if (!tl) throw new Error("Нет шкалы ролика");
  return tl;
};

export type Clock = {
  readonly t: number; // абсолютное время, с
  readonly tl: B17Timeline;
  // начало и конец сцены (абсолютно, с)
  readonly scene: (id: B17SceneId) => { readonly from: number; readonly to: number };
  // начало и конец речи реплики (абсолютно, с)
  readonly cue: (id: string) => B17Cue;
};

export const useClock = (): Clock => {
  const tl = useTimeline();
  const t = useCurrentFrame() / B17_VIDEO.fps;
  return {
    t,
    tl,
    scene: (id) => {
      const s = tl.scenes.find((x) => x.id === id);
      if (!s) throw new Error(`Нет сцены ${id}`);
      return s;
    },
    cue: (id) => {
      const c = tl.cues.find((x) => x.id === id);
      if (!c) throw new Error(`Нет реплики ${id}`);
      return c;
    },
  };
};
