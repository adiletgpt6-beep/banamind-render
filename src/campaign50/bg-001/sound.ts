// Звуки ролика (общие файлы проекта, только чтение) — в те же моменты,
// что и анимация (beats.ts): окна открываются, жёлтая вкладка, щелчки
// переключения, клавиатура, переход на улицу, машина, карточки шагов.
import { bg1Beats } from "./beats";
import { BG1_SCENES, BG1_VIDEO, type Bg1SceneId } from "./script";
import type { Bg1Cue } from "./timing";

export type Sfx = { readonly src: string; readonly at: number; readonly volume: number; readonly dur?: number; readonly fade?: number };

const FPS = BG1_VIDEO.fps;
const base = (id: Bg1SceneId) => Math.round(BG1_SCENES.find((s) => s.id === id)!.from * FPS);

export const bg1Sfx = (cues: readonly Bg1Cue[]): Sfx[] => {
  const b = bg1Beats(cues);
  const out: Sfx[] = [];
  const add = (scene: Bg1SceneId, at: number, src: string, volume: number, dur?: number, fade?: number) =>
    out.push({ src: `audio/${src}.mp3`, at: base(scene) + Math.max(0, at), volume, dur, fade });
  // 1. хук
  add("hook", 0, "sfx-whoosh", 0.35);
  b.opens.forEach((o) => add("hook", o, "sfx-pop", 0.32));
  add("hook", b.ninthAt, "sfx-notify", 0.5);
  // 2. вкладки: щелчок на каждой смене, клавиатура под планом мамы
  b.pages.slice(1).forEach(([at]) => add("tabs", at - 1, "sfx-tap", 0.55));
  add("tabs", b.tabsCut, "sfx-typing", 0.22, 1.0, 0.2);
  // 3. параллельно: клавиатура до вопроса сына
  add("parallel", 0, "sfx-whoosh", 0.25);
  add("parallel", 4, "sfx-typing", 0.16, Math.max(0.5, (b.s01.from - 10) / FPS), 0.25);
  // 4. мост: перетаскивание встречи, тихое «нет», клавиатура поиска, щелчок
  const br = b.bridge;
  add("bridge", br.cal.drag - 2, "sfx-tap", 0.5);
  add("bridge", br.cal.dragEnd + 2, "sfx-notify", 0.22);
  add("bridge", br.cal.back, "sfx-tap", 0.4);
  add("bridge", br.typeFrom, "sfx-typing", 0.2, (br.typeTo - br.typeFrom) / FPS + 0.2, 0.15);
  add("bridge", br.found, "sfx-pop", 0.3);
  add("bridge", br.click - 1, "sfx-tap", 0.55);
  // 5. маршрут: переход на улицу и машина
  add("route", 30, "sfx-whoosh", 0.25);
  add("route", b.street, "sfx-whoosh", 0.25);
  add("route", b.drive.go - 6, "sfx-car", 0.22, 3, 0.6);
  add("route", b.drive.back - 6, "sfx-car", 0.2, 3, 0.6);
  // 6. шаги: карточки
  b.steps.forEach((s) => add("steps", s, "sfx-pop", 0.26));
  // 6. финал
  add("cta", 0, "sfx-chime", 0.3);
  return out;
};
