import { createContext, useContext } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { cueTime, FPS, type Timeline } from "../timeline";

export const SceneCtx = createContext<{ tl: Timeline; sceneFrom: number; sceneTo: number } | null>(null);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Хелперы сцены: кадр (локальный) по привязке к речи и анимации появления. */
export const useScene = () => {
  const ctx = useContext(SceneCtx);
  if (!ctx) throw new Error("useScene вне сцены");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (cue: string) => Math.round((cueTime(ctx.tl, cue) - ctx.sceneFrom) * FPS);
  const len = Math.round((ctx.sceneTo - ctx.sceneFrom) * FPS);
  /** 0→1 пружиной с момента cue */
  const pop = (cue: string | number, damping = 14) => {
    const a = typeof cue === "number" ? cue : at(cue);
    return spring({ frame: frame - a, fps, config: { damping, stiffness: 140, mass: 0.7 } });
  };
  /** линейный прогресс от cue за dur секунд */
  const ramp = (cue: string | number, dur = 0.6) => {
    const a = typeof cue === "number" ? cue : at(cue);
    return interpolate(frame, [a, a + dur * fps], [0, 1], clamp);
  };
  /** затухание сцены в конце (последние 10 кадров) */
  const out = interpolate(frame, [len - 2, len + 8], [1, 0], clamp);
  return { frame, fps, at, pop, ramp, out, len };
};
