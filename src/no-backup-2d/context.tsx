import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { NB2_VIDEO, type Nb2Role } from "./script";
import { buildNb2Cues, estimateNb2Manifest, type Nb2Cue } from "./timing";
const FPS = NB2_VIDEO.fps;

// Реплики на шкале ролика — доступны всем сценам.
export const CuesContext = createContext<Nb2Cue[]>(buildNb2Cues(estimateNb2Manifest()));
// Начало текущей сцены (кадр ролика).
export const SceneContext = createContext<number>(0);

// Кадр ролика (абсолютный) для текущего кадра сцены.
export const useAbsFrame = () => {
  const base = useContext(SceneContext);
  return useCurrentFrame() + base;
};

export { CLOSED, lipAt } from "./lip-sync";
export type { Viseme } from "./lip-sync";
import { lipAt, type Viseme } from "./lip-sync";

export const useLips = (role: Nb2Role): Viseme => {
  const cues = useContext(CuesContext);
  return lipAt(cues, role, useAbsFrame());
};

// Говорит ли роль сейчас (для мимики и взгляда собеседников).
export const useSpeaking = (role: Nb2Role, pad = 0.15) => {
  const cues = useContext(CuesContext);
  const t = useAbsFrame() / FPS;
  return cues.some((c) => c.role === role && t >= c.from - pad && t <= c.to + pad);
};

// Реплика на шкале текущей сцены (кадры от начала сцены): позы и жесты
// привязываются к фактическому началу и концу речи.
export const useCueFrames = (id: string) => {
  const cues = useContext(CuesContext);
  const base = useContext(SceneContext);
  const c = cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return { from: c.from * FPS - base, to: c.to * FPS - base };
};
