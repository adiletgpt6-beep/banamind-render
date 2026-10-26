// Контексты фильма: шкала (реплики, сцены) и начало текущей сцены; губы по
// фактической речи. Форма рта: open — раскрытие, round — округление
// (о, у, ё, ю), wide — растяжение (и, е, ы). Для каждой буквы — своя форма;
// переходы плавные, а раскрытие умножается на громкость файла в этот момент —
// в паузах рот закрыт. Та же схема, что в 2D-роликах BalaGo, адаптирована к
// русской речи.
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { lipAt, type Viseme } from "./lips";
import type { L80Role } from "./roles";
import { EMPTY_TIMELINE, type Timeline } from "./timing";
import { FPS } from "./video";

export { CLOSED, lipAt, speakingAt, type Viseme } from "./lips";

export const TimelineContext = createContext<Timeline>(EMPTY_TIMELINE);
// Начало текущей сцены (кадр фильма) и её длительность.
export const SceneContext = createContext<{ readonly from: number; readonly len: number }>({ from: 0, len: 300 });

export const useTimeline = () => useContext(TimelineContext);
export const useScene = () => useContext(SceneContext);
// Кадр фильма (абсолютный) для текущего кадра сцены.
export const useAbsFrame = () => useCurrentFrame() + useContext(SceneContext).from;

// Границы реплики в кадрах текущей сцены.
export const useLine = (id: number) => {
  const tl = useTimeline();
  const sc = useScene();
  return lineFrames(tl, sc.from, id);
};
export const lineFrames = (tl: Timeline, sceneFrom: number, id: number) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return { from: Math.round(c.from * FPS) - sceneFrom, to: Math.round(c.to * FPS) - sceneFrom, words: c.words.map((w) => ({ ...w, f: Math.round(w.start * FPS) - sceneFrom })) };
};

export const useLips = (role: L80Role, chorus = false): Viseme => lipAt(useTimeline().cues, role, useAbsFrame(), chorus);

