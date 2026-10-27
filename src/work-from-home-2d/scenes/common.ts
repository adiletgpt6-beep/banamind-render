// Общие размеры и позы персонажей: рост, перспектива, посадка, руки.
import type { Place, WorldArm } from "../rig/Actor";
import { HOME, seatH } from "../sets/Home";
import type { WfhCue } from "../timing";
import { WFH_SCENES, WFH_VIDEO, type WfhSceneId } from "../script";

// Рост персонажей (px мира) на линии y = 1540. Сын (8–9 лет) заметно ниже.
export const H = { mom: 760, dad: 790, son: 560 } as const;

// Масштаб глубины: ближе к камере (больше y) — крупнее.
export const depth = (y: number) => 1 + (y - HOME.seatY) * 0.0005;
export const placeAt = (x: number, y: number, h: number): Place => ({ x, y, h: h * depth(y) });

export const seated = (who: keyof typeof H, x: number, y: number = HOME.seatY): Place => ({ x, y, h: H[who] * depth(y) });
export const seatOf = (p: Place) => seatH(p.h);
export const onTable = (x: number, dy = 0) => ({ x, y: HOME.table.top + 6 + dy });
export const restOnTable = (p: Place, side: -1 | 1): WorldArm => ({ target: onTable(p.x + side * 0.15 * p.h, -4), shape: "relax", elbow: "down" });
export const hang: WorldArm = { target: null, shape: "relax" };

// Начало и конец реплики в кадрах сцены (по фактической озвучке).
export const lineFrames = (cues: readonly WfhCue[], id: string, scene: WfhSceneId) => {
  const c = cues.find((x) => x.id === id);
  const start = WFH_SCENES.find((s) => s.id === scene)!.from;
  if (!c) throw new Error(`Нет реплики ${id}`);
  return { from: Math.round((c.from - start) * WFH_VIDEO.fps), to: Math.round((c.to - start) * WFH_VIDEO.fps) };
};
export const sceneLen = (scene: WfhSceneId) => {
  const s = WFH_SCENES.find((x) => x.id === scene)!;
  return Math.round(s.to * WFH_VIDEO.fps) - Math.round(s.from * WFH_VIDEO.fps);
};

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
// Посадка: корпус вперёд (вес на стопы), затем таз на сиденье.
export const sitDown = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.25 ? 0 : u >= 1 ? 1 : smooth((u - 0.25) / 0.75);
  const lean = u <= 0 ? 0 : u >= 1.25 ? 0 : u < 0.35 ? 16 * smooth(u / 0.35) : 16 - 14 * smooth((u - 0.35) / 0.9);
  return { sit, lean };
};
// Вставание: корпус вперёд, вес на стопы, выпрямление.
export const standUp = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.3 ? 1 : u >= 1 ? 0 : 1 - smooth((u - 0.3) / 0.7);
  const lean = u <= 0 ? 0 : u >= 1.2 ? 0 : u < 0.35 ? 18 * smooth(u / 0.35) : 18 - 18 * smooth((u - 0.35) / 0.85);
  return { sit, lean };
};

// Кадр сцены, когда звучит слово (первое вхождение) реплики.
export const wordFrame = (cues: readonly WfhCue[], id: string, word: string, scene: WfhSceneId) => {
  const c = cues.find((x) => x.id === id);
  const start = WFH_SCENES.find((s) => s.id === scene)!.from;
  if (!c) throw new Error(`Нет реплики ${id}`);
  const w = c.words.find((x) => x.text.toLowerCase().includes(word.toLowerCase()));
  const t = w ? w.start : c.from + (c.to - c.from) * 0.5;
  return Math.round((t - start) * WFH_VIDEO.fps);
};

// Печать короткими сериями: 1 — пальцы нажимают, 0 — пауза.
export const typingBursts = (t: number, from: number, to: number, period = 44, on = 26) => {
  if (t < from || t > to) return 0;
  const u = (t - from) % period;
  return u < on ? Math.min(1, u / 3, (on - u) / 3) : 0;
};
