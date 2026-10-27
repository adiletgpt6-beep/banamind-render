import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { BG49_VIDEO } from "./script";
import {
  buildBg49Timeline,
  estimateBg49Manifest,
  type Bg49Timeline,
} from "./timing";

const FPS = BG49_VIDEO.fps;

// Шкала ролика (сцены и реплики) — доступна всем сценам.
export const TimelineContext = createContext<Bg49Timeline>(
  buildBg49Timeline(estimateBg49Manifest()),
);
export const useTimeline = () => useContext(TimelineContext);
// Текущая сцена: начало (кадр ролика) и длина (кадры).
export const SceneContext = createContext<{
  readonly from: number;
  readonly frames: number;
}>({ from: 0, frames: 1 });
export const useScene = () => useContext(SceneContext);

export const useAbsFrame = () =>
  useCurrentFrame() + useContext(SceneContext).from;

// Начало и конец реплики в кадрах текущей сцены (по фактической озвучке).
export const useLine = (id: string) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return {
    from: Math.round(c.from * FPS) - from,
    to: Math.round(c.to * FPS) - from,
  };
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

// Открытость рта говорящего персонажа (0…1) по огибающей громкости его
// реплики: рот двигается по фактической речи и закрыт в паузах.
export const useMouth = (role: "narrator" | "mother") => {
  const tl = useTimeline();
  const abs = useAbsFrame();
  const t = abs / FPS;
  const c = tl.cues.find(
    (x) => x.role === role && t >= x.from - 0.05 && t <= x.to + 0.1,
  );
  if (!c) return 0;
  const i = Math.round((t - c.audioFrom) * FPS);
  const v = c.env[i] ?? 0;
  const prev = c.env[i - 1] ?? 0;
  return Math.max(0, Math.min(1, 0.65 * v + 0.35 * prev));
};
