// Шкала ролика доступна сценам через контекст; сцены работают в своём
// локальном времени (секунды от начала сцены), а моменты реплик берут из
// фактической озвучки: cue("m01").from — начало речи относительно сцены.
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { B48_VIDEO, type B48Role, type B48SceneId } from "./script";
import type { B48Cue, B48Timeline } from "./timing";

export const TimelineContext = createContext<B48Timeline | null>(null);
export const SceneContext = createContext<B48SceneId>("hook");

export const useTimeline = () => {
  const tl = useContext(TimelineContext);
  if (!tl) throw new Error("Нет шкалы ролика");
  return tl;
};

const FPS = B48_VIDEO.fps;

// Абсолютное время текущего кадра (с).
export const useAbsTime = () => {
  const tl = useTimeline();
  const id = useContext(SceneContext);
  const sc = tl.scenes.find((s) => s.id === id)!;
  return sc.from + useCurrentFrame() / FPS;
};

export type SceneClock = {
  readonly t: number; // секунды от начала сцены
  readonly dur: number; // длительность сцены
  readonly start: number; // абсолютное начало сцены
  // реплика относительно начала сцены
  readonly cue: (id: string) => { readonly from: number; readonly to: number };
  readonly abs: number;
};

export const useScene = (): SceneClock => {
  const tl = useTimeline();
  const id = useContext(SceneContext);
  const frame = useCurrentFrame();
  const sc = tl.scenes.find((s) => s.id === id)!;
  const t = frame / FPS;
  return {
    t,
    dur: sc.to - sc.from,
    start: sc.from,
    abs: sc.from + t,
    cue: (cid: string) => {
      const c = tl.cues.find((x) => x.id === cid);
      if (!c) throw new Error(`Нет реплики ${cid}`);
      return { from: c.from - sc.from, to: c.to - sc.from };
    },
  };
};

// ---------- Речь → рот ----------
const ROUND = new Set(["о", "ө", "у", "ү", "ю"]);
const WIDE = new Set(["и", "е", "э", "ы"]);
const CLOSED = new Set(["м", "б", "п"]);

export type Viseme = { readonly open: number; readonly round: number; readonly wide: number; readonly talking: boolean };
export const SILENT: Viseme = { open: 0, round: 0, wide: 0, talking: false };

const envAt = (c: B48Cue, t: number) => {
  const x = (t - c.audioFrom) * FPS - 0.5;
  const i = Math.floor(x);
  const f = x - i;
  const a = c.env[i] ?? 0;
  const b = c.env[i + 1] ?? 0;
  return a + (b - a) * f;
};

export const visemeAt = (cues: readonly B48Cue[], role: B48Role, t: number): Viseme => {
  const c = cues.find((x) => x.role === role && t >= x.from - 0.05 && t <= x.to + 0.12);
  if (!c) return SILENT;
  // огибающая сглажена по соседним кадрам — без дрожания губ
  const e = 0.25 * envAt(c, t - 1 / FPS) + 0.5 * envAt(c, t) + 0.25 * envAt(c, t + 1 / FPS);
  // форма губ — среднее по соседним буквам (плавные переходы)
  let round = 0;
  let wide = 0;
  let closed = 0;
  const W = [0.25, 0.5, 0.25];
  [-0.045, 0, 0.045].forEach((dt, k) => {
    const ch = c.chars.find((x) => t + dt >= x.start && t + dt < x.end);
    const letter = ch?.c ?? "";
    if (ROUND.has(letter)) round += W[k];
    if (WIDE.has(letter)) wide += W[k];
    if (CLOSED.has(letter)) closed += W[k];
  });
  const open = Math.min(1, Math.max(0, (e - 0.08) * 1.25)) * (1 - 0.7 * closed);
  return { open, round, wide, talking: true };
};

export const useViseme = (role: B48Role): Viseme => {
  const tl = useTimeline();
  const abs = useAbsTime();
  return visemeAt(tl.cues, role, abs);
};
