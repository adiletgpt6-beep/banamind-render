// Общие размеры и позы персонажей BG-002: рост, посадка за столом,
// точки на столешнице, кадры реплик.
import type { Place, WorldArm } from "../rig/Actor";
import { OFFICE, seatH } from "../sets/Office";
import type { Bg2Cue } from "../timing";
import { BG2_SCENES, BG2_VIDEO, type Bg2SceneId } from "../script";

export const H = { dad: 790, son: 560, colleagueA: 700, colleagueB: 720 } as const;

export const depth = (y: number) => 1 + (y - OFFICE.seatY) * 0.0005;
export const placeAt = (x: number, y: number, h: number): Place => ({ x, y, h: h * depth(y) });

export const seatedDad = (): Place => ({ x: OFFICE.dad, y: OFFICE.seatY, h: H.dad });
export const seatOf = (p: Place) => seatH(p.h);

export const onDesk = (x: number, dy = 0) => ({ x, y: OFFICE.desk.top + 6 + dy });

export const restOnDesk = (p: Place, side: -1 | 1): WorldArm => ({
  target: onDesk(p.x + side * 0.15 * p.h, -4),
  shape: "relax",
  elbow: "down",
});

export const sceneFrom = (id: Bg2SceneId) => Math.round(BG2_SCENES.find((s) => s.id === id)!.from * BG2_VIDEO.fps);

// Начало и конец реплики в кадрах сцены (по фактической озвучке).
export const lineFrames = (cues: readonly Bg2Cue[], id: string, scene: Bg2SceneId) => {
  const c = cues.find((x) => x.id === id);
  const start = BG2_SCENES.find((s) => s.id === scene)!.from;
  if (!c) throw new Error(`Нет реплики ${id}`);
  return { from: Math.round((c.from - start) * BG2_VIDEO.fps), to: Math.round((c.to - start) * BG2_VIDEO.fps) };
};

// Кадр сцены, когда звучит k-е предложение реплики (по словам озвучки).
export const sentenceFrames = (cues: readonly Bg2Cue[], id: string, scene: Bg2SceneId, text: string): number[] => {
  const c = cues.find((x) => x.id === id);
  const start = BG2_SCENES.find((s) => s.id === scene)!.from;
  if (!c) throw new Error(`Нет реплики ${id}`);
  const sentences = text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: number[] = [];
  let wi = 0;
  const total = text.split(/\s+/).filter(Boolean).length;
  for (const s of sentences) {
    const w = c.words[wi];
    const sec = w ? w.start : c.from + ((c.to - c.from) * wi) / total;
    out.push(Math.round((sec - start) * BG2_VIDEO.fps));
    wi += s.split(/\s+/).filter(Boolean).length;
  }
  return out;
};

// Вставание со стула: корпус вперёд, вес на стопы, выпрямление.
export const standUp = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.3 ? 1 : u >= 1 ? 0 : 1 - smooth((u - 0.3) / 0.7);
  const lean = u <= 0 ? 0 : u >= 1.2 ? 0 : u < 0.35 ? 18 * smooth(u / 0.35) : 18 - 18 * smooth((u - 0.35) / 0.85);
  return { sit, lean };
};
const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
