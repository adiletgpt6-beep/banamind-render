// Общие помощники сцен BG-041: локальное время сцены, кадры реплик,
// перемотка «плёнки».
import { BG41_VIDEO, type Bg41SceneId } from "./script";
import { cueOf, sceneOf, type Bg41Timeline } from "./timing";

export const FPS = BG41_VIDEO.fps;

export type SceneProps = { readonly t: number; readonly tl: Bg41Timeline };

// Локальное время сцены: lt (с), f (кадр сцены), len (кадров в сцене).
export const local = (tl: Bg41Timeline, id: Bg41SceneId, t: number) => {
  const s = sceneOf(tl, id);
  return { s, lt: t - s.from, f: Math.round((t - s.from) * FPS), len: Math.round((s.to - s.from) * FPS) };
};

// Реплика в кадрах сцены.
export const cueFrames = (tl: Bg41Timeline, id: string) => {
  const c = cueOf(tl, id);
  const s = sceneOf(tl, c.scene);
  return { from: Math.round((c.from - s.from) * FPS), to: Math.round((c.to - s.from) * FPS), cue: c };
};

// Кадр сцены, когда начинается слово реплики (по фактической речи).
export const wordFrame = (tl: Bg41Timeline, id: string, prefix: string, fallback: number) => {
  const c = cueOf(tl, id);
  const s = sceneOf(tl, c.scene);
  const p = prefix.toLowerCase();
  const w = c.words.find((x) => x.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").startsWith(p));
  return Math.round(((w?.start ?? c.from + (c.to - c.from) * fallback) - s.from) * FPS);
};

// ---------- «Плёнка» ----------
// Сцена описывается отрезками по кадрам сцены. Каждый отрезок говорит,
// какой кадр «снятой» анимации (shot) показать:
//   play  — вперёд: shot = from + (f − at)·speed
//   rew   — назад:  shot = from − (f − at)·speed (перемотка)
//   pause — стоп-кадр: shot = from
// Кадр снятой анимации всегда в пределах [0, len] — анимация полностью
// детерминирована по номеру кадра, поэтому перемотка показывает ровно те же
// движения в обратном порядке (стопы, моргание, предметы).
export type TapeMode = "play" | "rew" | "pause" | "ff";
export type TapeSeg = { readonly at: number; readonly mode: TapeMode; readonly from: number; readonly speed?: number };

export const tapeAt = (segs: readonly TapeSeg[], f: number, shotLen: number) => {
  let seg = segs[0];
  for (const s of segs) if (f >= s.at) seg = s;
  const d = Math.max(0, f - seg.at);
  const v = seg.speed ?? 1;
  const raw = seg.mode === "play" || seg.mode === "ff" ? seg.from + d * v : seg.mode === "rew" ? seg.from - d * v : seg.from;
  const shot = Math.max(0, Math.min(shotLen, raw));
  // перемотка/проигрывание дошли до края — плёнка стоит
  const mode: TapeMode = (seg.mode === "rew" && raw <= 0) || ((seg.mode === "play" || seg.mode === "ff") && raw >= shotLen) ? "pause" : seg.mode;
  return { shot, mode, speed: v };
};
