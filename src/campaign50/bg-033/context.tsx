import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { BG33_VIDEO } from "./script";
import type { Bg33Role } from "./script";
import {
  buildBg33Timeline,
  cueFrames,
  estimateBg33Manifest,
  mouthAt,
  wordFrame,
  type Bg33Timeline,
} from "./timing";

const FPS = BG33_VIDEO.fps;

// Шкала ролика (сцены и реплики) — доступна всем сценам.
export const TimelineContext = createContext<Bg33Timeline>(
  buildBg33Timeline(estimateBg33Manifest()),
);
export const useTimeline = () => useContext(TimelineContext);
// Текущая сцена: начало (кадр ролика) и длина (кадры).
export const SceneContext = createContext<{
  readonly from: number;
  readonly frames: number;
}>({ from: 0, frames: 1 });
export const useScene = () => useContext(SceneContext);

// Кадр ролика (абсолютный) для текущего кадра сцены.
export const useAbsFrame = () =>
  useCurrentFrame() + useContext(SceneContext).from;

// Начало и конец реплики в кадрах текущей сцены (по фактической озвучке).
export const useLine = (id: string) =>
  cueFrames(useTimeline(), useScene().from, id);

// Момент (кадр сцены), когда диктор произносит слово с индексом i реплики id.
export const useWordAt = (id: string, i: number) =>
  wordFrame(useTimeline(), useScene().from, id, i);

// Открытие рта роли (0…1) в текущем кадре — по фактической озвучке.
export const useMouth = (role: Bg33Role) =>
  mouthAt(useTimeline(), role, useAbsFrame() / FPS);
