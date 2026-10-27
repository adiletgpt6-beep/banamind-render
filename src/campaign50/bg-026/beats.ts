// Абсолютные кадры ключевых моментов (для звуковых эффектов): считаются по
// той же шкале и тем же словам озвучки, что и в сценах.
import { BG26_VIDEO } from "./script.ts";
import { sceneOf, type Bg26Timeline } from "./timing.ts";

const FPS = BG26_VIDEO.fps;

// Кадр (от начала сцены своей реплики), когда звучит первое слово реплики
// id, начинающееся с prefix; как useWordStarting в context.tsx.
export const wordFrame = (tl: Bg26Timeline, id: string, prefix: string) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const p = prefix.toLowerCase();
  const w = c.words.find((x) => x.text.toLowerCase().replace(/[^\p{L}-]/gu, "").startsWith(p));
  return Math.round((w ? w.start : c.from) * FPS) - sceneOf(tl, c.scene).from;
};

export const lineFrames = (tl: Bg26Timeline, id: string) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const from = sceneOf(tl, c.scene).from;
  return { from: Math.round(c.from * FPS) - from, to: Math.round(c.to * FPS) - from };
};
