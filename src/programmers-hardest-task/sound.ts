// Звуковые события фильма №35. Каждая сцена описывает свои эффекты в
// кадрах сцены (те же константы, что и анимация), здесь они переводятся
// на шкалу фильма. Эффекты сдержанные: одно напоминание, тихие касания,
// бумага, крышка ноутбука, детали настольной игры — без шагов «на каждое
// движение», свиста и сирен.
import type { PhtSceneId } from "./script";
import type { PhtPlan } from "./timing";

export type SceneSfx = {
  readonly at: number; // кадр сцены
  readonly src: string; // путь в public/
  readonly volume: number;
  readonly dur?: number; // с (обрезка)
  readonly fade?: number; // с (плавный вход/выход при обрезке)
};
export type Sfx = Omit<SceneSfx, "at"> & { readonly at: number }; // кадр фильма

// Контекст для функции звука сцены: кадры реплик в кадрах сцены.
export type SoundCtx = {
  readonly len: number;
  readonly line: (id: string) => { readonly from: number; readonly to: number; readonly word: (i: number) => number };
};
export type SceneSound = (ctx: SoundCtx) => readonly SceneSfx[];

export const OWN = (n: string) => `audio/programmers-hardest-task/sfx/${n}.mp3`;
export const TS2 = (n: string) => `audio/two-schedules-2d/sfx/${n}.mp3`;
export const COMMON = (n: string) => `audio/sfx-${n}.mp3`;

export const collectSfx = (plan: PhtPlan, sounds: Partial<Record<PhtSceneId, SceneSound>>, fps: number): Sfx[] => {
  const out: Sfx[] = [];
  for (const sc of plan.scenes) {
    const fn = sounds[sc.id];
    if (!fn) continue;
    const ctx: SoundCtx = {
      len: sc.to - sc.from,
      line: (id) => {
        const c = plan.cues.find((x) => x.id === id);
        if (!c) throw new Error(`Нет реплики ${id}`);
        const word = (i: number) => Math.round((c.words[Math.max(0, Math.min(c.words.length - 1, i))]?.start ?? c.from) * fps) - sc.from;
        return { from: Math.floor(c.from * fps) - sc.from, to: Math.ceil(c.to * fps) - sc.from, word };
      },
    };
    for (const s of fn(ctx)) out.push({ ...s, at: sc.from + s.at });
  }
  return out.filter((s) => s.at >= 0 && s.at < plan.totalFrames);
};
