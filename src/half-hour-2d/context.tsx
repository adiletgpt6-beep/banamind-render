import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { HH2_VIDEO, type Hh2Role } from "./script";
import { buildHh2Cues, estimateHh2Manifest, type Hh2Cue } from "./timing";

const FPS = HH2_VIDEO.fps;

// Реплики на шкале ролика — доступны всем сценам.
export const CuesContext = createContext<Hh2Cue[]>(buildHh2Cues(estimateHh2Manifest()));
// Начало текущей сцены (кадр ролика).
export const SceneContext = createContext<number>(0);

// Кадр ролика (абсолютный) для текущего кадра сцены.
export const useAbsFrame = () => {
  const base = useContext(SceneContext);
  return useCurrentFrame() + base;
};

// Открытость рта 0…1 для роли: двигается только внутри слов её реплик
// (по таймингам слов из озвучки), между словами рот закрыт.
export const useMouth = (role: Hh2Role, absFrame?: number) => {
  const cues = useContext(CuesContext);
  const own = useAbsFrame();
  const abs = absFrame ?? own;
  const t = abs / FPS;
  for (const c of cues) {
    if (c.role !== role) continue;
    if (t < c.from - 0.05 || t > c.to + 0.05) continue;
    for (const w of c.words) {
      if (t >= w.start && t <= w.end) {
        const len = Math.max(0.08, w.end - w.start);
        const letters = [...w.text].filter((ch) => /\p{L}/u.test(ch)).length;
        const syll = Math.max(1, Math.round(letters / 2.6));
        const ph = ((t - w.start) / len) * syll * Math.PI;
        const edge = Math.min(1, (t - w.start) / 0.06, (w.end - t) / 0.06);
        // sin² — рот открывается и закрывается плавно, без «щелчков»
        return Math.max(0, edge) * (0.2 + 0.55 * Math.sin(ph) ** 2);
      }
    }
    return 0;
  }
  return 0;
};
