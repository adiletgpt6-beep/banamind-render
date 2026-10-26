// Звуковые события ролика №32 (абсолютные кадры). Моменты берутся из той
// же шкалы, что и анимация: начала сцен и слова реплик (по фактической
// озвучке), поэтому шорох карандаша, лист, макет и касание экрана
// совпадают с действием. Звуки редкие и тихие — заметно тише речи.
import { localCue, wordAt } from "./context";
import { DD_VIDEO, type DdSceneId } from "./script";
import type { DdTimeline } from "./timing";

export type DdSfx = { readonly at: number; readonly src: string; readonly volume: number; readonly dur?: number; readonly fade?: number };
export type DdBed = { readonly from: number; readonly to: number; readonly src: string; readonly volume: number };

const FPS = DD_VIDEO.fps;
const OWN = (n: string) => `audio/dad-driver/sfx/${n}.mp3`;
const COMMON = (n: string) => `audio/sfx-${n}.mp3`;
const TS2 = (n: string) => `audio/two-schedules-2d/sfx/${n}.mp3`;

// Моменты действий сцен (кадры сцены), которые сцены экспортируют для звука.
export type SceneBeats = Partial<Record<string, number>>;
export type BeatsBySceneFn = (tl: DdTimeline) => Partial<Record<DdSceneId, SceneBeats>>;

export const ddSound = (tl: DdTimeline, beats: Partial<Record<DdSceneId, SceneBeats>>): { sfx: DdSfx[]; beds: DdBed[] } => {
  const sc = (id: DdSceneId) => tl.scenes.find((s) => s.id === id)!;
  const S = (id: DdSceneId) => sc(id).from;
  const cue = (id: DdSceneId, line: string) => localCue(tl, S(id), line);
  // момент действия сцены; без него (и без запасного по словам) — звука нет
  const b = (id: DdSceneId, k: string, fallback?: number) => {
    const v = beats[id]?.[k] ?? fallback;
    return v === undefined ? undefined : S(id) + Math.round(v);
  };
  const sfx: DdSfx[] = [];
  const push = (at: number | undefined, src: string, volume: number, dur?: number, fade?: number) => {
    if (at === undefined || !Number.isFinite(at)) return;
    sfx.push({ at: Math.max(0, Math.round(at)), src, volume, dur, fade });
  };

  // 1. Карандаш дописывает слово, лист поднимают
  const v01 = cue("hook", "vo01");
  push(S("hook"), OWN("pencil-short"), 0.55);
  push(S("hook") + wordAt(v01, 5) + 4, COMMON("paper"), 0.22);

  // 2. Карточка задания, мама листает анкету, папа садится
  push(b("task", "card", 6), COMMON("paper"), 0.16);
  push(b("task", "dadSit"), TS2("chair"), 0.32);

  // 6. Макет снят с полки и поставлен на стол
  push(b("model", "grab"), OWN("model-lift"), 0.8);
  push(b("model", "place"), OWN("model-place"), 0.8);

  // 7. Лист с чертежом ложится на стол
  push(b("blueprint", "sheet"), COMMON("paper"), 0.2);

  // 11. Одно касание экрана
  const v14 = cue("apply", "vo14");
  push(b("apply", "tap", wordAt(v14, v14.words.length - 1)), COMMON("tap"), 0.9);

  // 12–13. Запись «инженер» и строки
  push(b("rewrite", "sheet"), COMMON("paper"), 0.18);
  push(b("rewrite", "writeWord"), OWN("pencil-word"), 0.5);
  push(b("rewrite", "writeLine"), OWN("pencil-line"), 0.42);
  push(b("read", "writeEnd"), OWN("pencil-short"), 0.4);

  // 14. Финал: мягкий колокольчик при появлении логотипа
  push(S("cta") + 4, COMMON("chime"), 0.12);

  // Тихая атмосфера: комната (дом) и офис — петли по 12 с.
  const beds: DdBed[] = [];
  const bed = (from: DdSceneId, to: DdSceneId, src: string, volume: number) => {
    beds.push({ from: S(from), to: sc(to).to, src, volume });
  };
  bed("task", "reply", OWN("room"), 0.9);
  bed("model", "blueprint", OWN("room"), 0.9);
  bed("office", "question", OWN("office"), 0.9);
  bed("week", "apply", OWN("room"), 0.8);
  bed("rewrite", "read", OWN("room"), 0.9);
  return { sfx: sfx.filter((x) => x.at < tl.frames - 2), beds };
};

export const sec = (f: number) => f / FPS;
