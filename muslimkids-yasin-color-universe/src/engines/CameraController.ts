// Камера точечного слоя: масштаб вокруг точки (cx, cy), плавная интерполяция ключей.
import { easeInOutSine } from "./rng";

export type CamKey = { at: number; s: number; cx?: number; cy?: number; ease?: "inout" | "linear" };

export const cameraAt = (keys: CamKey[], t: number) => {
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1].at <= t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  if (!b) return { s: a.s, cx: a.cx ?? 540, cy: a.cy ?? 960 };
  const raw = (t - a.at) / (b.at - a.at);
  const f = b.ease === "linear" ? raw : easeInOutSine(Math.max(0, Math.min(1, raw)));
  const lerp = (x: number, y: number) => x + (y - x) * f;
  return { s: lerp(a.s, b.s), cx: lerp(a.cx ?? 540, b.cx ?? a.cx ?? 540), cy: lerp(a.cy ?? 960, b.cy ?? a.cy ?? 960) };
};
