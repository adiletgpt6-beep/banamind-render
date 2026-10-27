import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import {
  buildTcTimeline,
  estimateTcManifest,
  type TcSceneSlot,
  type TcTimeline,
} from "./timing";

// Шкала ролика (сцены и реплики по озвучке) — доступна всем слоям.
export const TimelineContext = createContext<TcTimeline>(
  buildTcTimeline(estimateTcManifest()),
);
// Текущая сцена: её место на шкале и реплика диктора.
export const SlotContext = createContext<TcSceneSlot | null>(null);

// Кадр сцены, длина сцены и её реплика.
export const useScene = () => {
  const slot = useContext(SlotContext);
  if (!slot) throw new Error("Сцена вне SlotContext");
  return { f: useCurrentFrame(), D: slot.to - slot.from, slot };
};
