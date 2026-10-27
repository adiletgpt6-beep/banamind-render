// Общие размеры и позы персонажей офисных сцен, кадры реплик.
import type { Place, WorldArm } from "../rig/Actor";
import { OFFICE, seatH } from "../sets/Office";
import type { B6Cue } from "../timing";
import { B6_SCENES, B6_VIDEO, type B6SceneId } from "../script";

// Рост персонажей (px мира).
export const H = { mom: 780, colleague: 800, b: 760, c: 790 } as const;

export const seated = (who: keyof typeof H, x: number): Place => ({ x, y: OFFICE.seatY, h: H[who] });
export const seatOf = (p: Place) => seatH(p.h);

// Точка на столешнице (для кисти).
export const onTable = (x: number, dy = 0) => ({ x, y: OFFICE.table.top + 6 + dy });

// Рука, свободно лежащая на столе перед сидящим.
export const restOnTable = (p: Place, side: -1 | 1): WorldArm => ({
  target: onTable(p.x + side * 0.15 * p.h, -4),
  shape: "relax",
  elbow: "down",
});

// Начало и конец реплики в кадрах сцены (по фактической озвучке).
export const lineFrames = (cues: readonly B6Cue[], id: string, scene: B6SceneId) => {
  const c = cues.find((x) => x.id === id);
  const start = B6_SCENES.find((s) => s.id === scene)!.from;
  if (!c) throw new Error(`Нет реплики ${id}`);
  return { from: Math.round((c.from - start) * B6_VIDEO.fps), to: Math.round((c.to - start) * B6_VIDEO.fps) };
};

// Кадр сцены, в который звучит слово реплики (первое, начинающееся с prefix).
export const wordFrame = (cues: readonly B6Cue[], id: string, scene: B6SceneId, prefix: string, fallback: number) => {
  const c = cues.find((x) => x.id === id);
  const start = B6_SCENES.find((s) => s.id === scene)!.from;
  const w = c?.words.find((x) => x.text.toLowerCase().replace(/[^\p{L}]/gu, "").startsWith(prefix));
  if (!c || !w) return fallback;
  return Math.round((w.start - start) * B6_VIDEO.fps);
};
