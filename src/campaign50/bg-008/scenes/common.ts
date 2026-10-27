// Общие помощники сцен: посадка за столом, руки на клавиатуре, моменты
// реплик и отдельных слов по фактической озвучке.
import type { Place, WorldArm } from "../rig/Actor";
import { BG8_SCENES, BG8_VIDEO, type Bg8SceneId } from "../script";
import { OFFICE, seatH } from "../sets/Office";
import type { Bg8Cue } from "../timing";

export const FPS = BG8_VIDEO.fps;
export const H = { mom: 760, son: 560 } as const;

export const seated = (x: number): Place => ({ x, y: OFFICE.seatY, h: H.mom });
export const seatOf = (p: Place) => seatH(p.h);
export const onDesk = (x: number, dy = 0) => ({ x, y: OFFICE.desk.top + 6 + dy });

// Клавиша k (0…5) на ноутбуке; typing — пальцы двигаются.
export const keyAt = (k: number, t: number, typing: boolean) =>
  onDesk(OFFICE.laptop.x - 60 + k * 22 + (typing ? Math.sin(t * 1.7 + k) * 3 : 0), -4 + (typing ? -Math.abs(Math.sin(t * 1.3 + k * 2)) * 5 : 0));

export const restOnDesk = (p: Place, side: -1 | 1): WorldArm => ({
  target: onDesk(p.x + side * 0.15 * p.h, -4),
  shape: "relax",
  elbow: "down",
});

const sceneStart = (scene: Bg8SceneId) => BG8_SCENES.find((s) => s.id === scene)!.from;

// Начало и конец реплики в кадрах сцены.
export const lineFrames = (cues: readonly Bg8Cue[], id: string, scene: Bg8SceneId) => {
  const c = cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const start = sceneStart(scene);
  return { from: Math.round((c.from - start) * FPS), to: Math.round((c.to - start) * FPS) };
};

// Кадр сцены, когда звучит слово (по началу слова, без учёта регистра).
// n — какое по счёту совпадение. Нет таймингов слов — доля длины реплики.
export const wordFrame = (cues: readonly Bg8Cue[], id: string, scene: Bg8SceneId, prefix: string, n = 0) => {
  const c = cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const start = sceneStart(scene);
  const p = prefix.toLowerCase();
  const hits = c.words.filter((w) => w.text.toLowerCase().replace(/^[«"(]/, "").startsWith(p));
  if (hits[n]) return Math.round((hits[n].start - start) * FPS);
  return Math.round((c.from - start) * FPS);
};
