// Звуковые эффекты ролика (синтезированы локально скриптом
// scripts/campaign50/bg-044/sfx.mjs → public/audio/campaign50/bg-044/sfx/).
// Мягкие 8-битные звуки игры и тихие бытовые звуки 2D-сцен. Без резких
// сигналов «ошибки» и без громких фанфар.
import type { Bg44SceneId } from "./script";
import type { Bg44Timeline } from "./timing";

export const SFX_NAMES = [
  "blip", // курсор / выбор пункта меню
  "select", // подтверждение выбора (двухнотный)
  "coin", // карточка собрана
  "bonk", // мягкий «не получилось» (кнопка-чудо не работает)
  "levelup", // спокойный короткий джингл открытия уровня
  "start", // заставка уровня (три ноты)
  "type", // нажатие клавиши / буквы на телефоне
  "tap", // касание экрана пальцем
  "send", // отправка сообщения (мягкий «вжух-поп»)
  "belt", // щелчок ремня безопасности
  "door", // мягкий стук двери машины
  "chime", // тёплый колокольчик
  "whoosh", // шелест движения камеры
  "pixels", // мерцание пикселей при превращении игры в 2D
  "stamp", // мягкий штамп «Кепил эмес»
  "check", // галочка «туура келет»
] as const;

export type SfxName = (typeof SFX_NAMES)[number];

export type Sfx = { readonly at: number; readonly name: SfxName; readonly volume: number };

// Эффекты сцены: кадры ОТ НАЧАЛА СЦЕНЫ. wordAt(id, i) — кадр сцены, когда
// звучит слово i реплики id (как useWordAt); lineAt(id) — начало/конец
// реплики в кадрах сцены. Сцена экспортирует такую функцию рядом с
// компонентом и использует те же константы, что и анимация.
export type SceneSfxCtx = {
  readonly frames: number;
  readonly wordAt: (id: string, index: number) => number;
  readonly lineAt: (id: string) => { readonly from: number; readonly to: number };
};
export type SceneSfxFn = (ctx: SceneSfxCtx) => readonly Sfx[];

export const sceneSfxCtx = (tl: Bg44Timeline, id: Bg44SceneId, fps: number): SceneSfxCtx => {
  const sc = tl.scenes.find((s) => s.id === id)!;
  const cue = (cid: string) => {
    const c = tl.cues.find((x) => x.id === cid);
    if (!c) throw new Error(`Нет реплики ${cid}`);
    return c;
  };
  return {
    frames: sc.frames,
    wordAt: (cid, i) => {
      const c = cue(cid);
      const w = c.words[Math.min(i, c.words.length - 1)];
      return Math.round((w ? w.start : c.from) * fps) - sc.from;
    },
    lineAt: (cid) => {
      const c = cue(cid);
      return { from: Math.round(c.from * fps) - sc.from, to: Math.round(c.to * fps) - sc.from };
    },
  };
};
