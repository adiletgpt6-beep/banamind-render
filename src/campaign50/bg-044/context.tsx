import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { BG44_VIDEO, type Bg44Role } from "./script";
import { buildBg44Timeline, estimateBg44Manifest, type Bg44Timeline } from "./timing";

const FPS = BG44_VIDEO.fps;

// Шкала ролика (сцены и реплики) — доступна всем сценам.
export const TimelineContext = createContext<Bg44Timeline>(buildBg44Timeline(estimateBg44Manifest()));
export const useTimeline = () => useContext(TimelineContext);
// Текущая сцена: начало (кадр ролика) и длина (кадры).
export const SceneContext = createContext<{ readonly from: number; readonly frames: number }>({ from: 0, frames: 1 });
export const useScene = () => useContext(SceneContext);

// Кадр от начала ролика (внутри сцены useCurrentFrame() — кадр сцены).
export const useAbsFrame = () => useCurrentFrame() + useContext(SceneContext).from;

// Начало и конец реплики в кадрах ТЕКУЩЕЙ сцены (по фактической озвучке).
export const useLine = (id: string) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return { from: Math.round(c.from * FPS) - from, to: Math.round(c.to * FPS) - from };
};

// Кадр текущей сцены, когда звучит слово с номером index реплики id
// (по таймингам озвучки; без озвучки — оценка). Так движение попадает
// в слово даже после замены дубля озвучки.
export const useWordAt = (id: string, index: number) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const w = c.words[Math.min(index, c.words.length - 1)];
  return Math.round((w ? w.start : c.from) * FPS) - from;
};

// Открытие рта 0…1 для персонажа роли role в текущий кадр: по огибающей
// громкости файла реплики (рот закрыт в паузах и когда говорит другой).
export const useMouth = (role: Bg44Role) => {
  const tl = useTimeline();
  const t = (useAbsFrame() + 0.5) / FPS;
  const c = tl.cues.find((x) => x.role === role && t >= x.from - 0.05 && t <= x.to + 0.1);
  if (!c || !c.env.length) return 0;
  const i = Math.floor((t - c.audioFrom) * FPS);
  const v = c.env[Math.max(0, Math.min(c.env.length - 1, i))] ?? 0;
  return v < 0.12 ? 0 : Math.min(1, v * 1.15);
};
