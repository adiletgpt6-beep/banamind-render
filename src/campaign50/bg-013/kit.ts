// Общие помощники сцен BG-013: локальное время сцены, кадры, губы.
import { lipAt } from "./context";
import { BG13_VIDEO, type Bg13Role, type Bg13SceneId } from "./script";
import { cueOf, sceneOf, type Bg13Timeline } from "./timing";

export const FPS = BG13_VIDEO.fps;

export type SceneProps = { readonly t: number; readonly tl: Bg13Timeline };

// Локальное время сцены: lt (с), f (кадр сцены), len (кадров в сцене).
export const local = (tl: Bg13Timeline, id: Bg13SceneId, t: number) => {
  const s = sceneOf(tl, id);
  return { s, lt: t - s.from, f: Math.round((t - s.from) * FPS), len: Math.round((s.to - s.from) * FPS) };
};

// Реплика в кадрах сцены.
export const cueFrames = (tl: Bg13Timeline, id: string) => {
  const c = cueOf(tl, id);
  const s = sceneOf(tl, c.scene);
  return { from: Math.round((c.from - s.from) * FPS), to: Math.round((c.to - s.from) * FPS), cue: c };
};

// Кадр сцены, когда начинается слово реплики (по фактической речи).
export const wordFrame = (tl: Bg13Timeline, id: string, prefix: string, fallback: number) => {
  const c = cueOf(tl, id);
  const s = sceneOf(tl, c.scene);
  const p = prefix.toLowerCase();
  const w = c.words.find((x) => x.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").startsWith(p));
  return Math.round(((w?.start ?? c.from + (c.to - c.from) * fallback) - s.from) * FPS);
};

// Губы роли по кадру сцены.
export const mouthAt = (tl: Bg13Timeline, role: Bg13Role, sceneId: Bg13SceneId, f: number) => lipAt(tl.cues, role, sceneOf(tl, sceneId).from + f / FPS);
