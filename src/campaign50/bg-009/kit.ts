// Общие помощники сцен BG-009: локальное время сцены, кадры, ключи.
import { lipAt } from "./context";
import { BG9_DAYS, BG9_VIDEO, type Bg9DayId, type Bg9Role, type Bg9SceneId } from "./script";
import { cueOf, sceneOf, type Bg9Timeline } from "./timing";

export const FPS = BG9_VIDEO.fps;

export type SceneProps = { readonly t: number; readonly tl: Bg9Timeline };

// Локальное время сцены: lt (с), f (кадр сцены), len (кадров в сцене).
export const local = (tl: Bg9Timeline, id: Bg9SceneId, t: number) => {
  const s = sceneOf(tl, id);
  return { s, lt: t - s.from, f: Math.round((t - s.from) * FPS), len: Math.round((s.to - s.from) * FPS) };
};

// Реплика в кадрах сцены.
export const cueFrames = (tl: Bg9Timeline, id: string) => {
  const c = cueOf(tl, id);
  const s = sceneOf(tl, c.scene);
  return { from: Math.round((c.from - s.from) * FPS), to: Math.round((c.to - s.from) * FPS), cue: c };
};

// Губы роли по кадру сцены.
export const mouthAt = (tl: Bg9Timeline, role: Bg9Role, sceneId: Bg9SceneId, f: number) => lipAt(tl.cues, role, sceneOf(tl, sceneId).from + f / FPS);

export const dayOf = (id: Bg9DayId) => BG9_DAYS.find((d) => d.id === id)!;
export const DAY_IDS = BG9_DAYS.map((d) => d.id);
