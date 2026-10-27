// Помощники постановки: цели кистей в мировых координатах, плавные
// переходы между позами рук, повороты «кресла».
import { interpolate } from "remotion";
import { LOOKS, type LookId } from "../rig/looks";
import type { HandKind, HandPose } from "../rig/Person";
import { toLocal } from "../rig/Person";
import { ease } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Pt = { readonly x: number; readonly y: number };

// Мировая точка → локальная цель руки героя.
export const W = (look: LookId, at: Pt, scale: number, wx: number, wy: number, lean = 0): Pt => toLocal(wx, wy, at.x, at.y, scale, lean, look);

// Ключевые позы руки: [время, точка, вид кисти]; между ключами — плавно.
export type HandKey = readonly [number, Pt, HandKind?];

export const handKeys = (t: number, k: readonly HandKey[], extra: Partial<HandPose> = {}): HandPose => {
  if (t <= k[0][0]) return { ...extra, x: k[0][1].x, y: k[0][1].y, kind: k[0][2] ?? "rest" };
  for (let i = 0; i < k.length - 1; i++) {
    const [ta, pa, ka] = k[i];
    const [tb, pb, kb] = k[i + 1];
    if (t <= tb) {
      const q = interpolate(t, [ta, Math.max(ta + 0.001, tb)], [0, 1], { ...clamp, easing: ease });
      return { ...extra, x: pa.x + (pb.x - pa.x) * q, y: pa.y + (pb.y - pa.y) * q, kind: (q < 0.5 ? ka : kb) ?? "rest" };
    }
  }
  const last = k[k.length - 1];
  return { ...extra, x: last[1].x, y: last[1].y, kind: last[2] ?? "rest" };
};

// Нажатие кнопки: 0 → 1 → 0 вокруг момента at (длительность ≈ 0,3 с).
export const pressAt = (t: number, at: number) => interpolate(t, [at - 0.08, at, at + 0.12, at + 0.32], [0, 1, 1, 0], clamp);

// Плавный ключевой скаляр.
export const ramp = (t: number, a: number, b: number, from = 0, to = 1) => interpolate(t, [a, Math.max(a + 0.001, b)], [from, to], { ...clamp, easing: ease });

// Положение головы героя (центр лица) в мире — для FX у головы.
export const headWorld = (look: LookId, at: Pt, scale = 1): Pt => {
  const b = LOOKS[look].build;
  return { x: at.x, y: at.y + (-b.neck - b.headRy * 0.9) * scale };
};
