// Анимационные помощники: дорожки ключей, артикуляция по таймингам букв и
// громкости, индивидуальное моргание, направление взгляда. Всё зависит только
// от времени кадра — предпросмотр и рендер совпадают.
import { clamp, easeInOut, hash01, strSeed } from "./rig/geom";
import { FACE0, type Face, mixFace, mixPose, type Pose } from "./rig/pose";
import type { ManifestLine, SegTime } from "./timeline";

export type Key<T> = { at: number; v: T; dur?: number; ease?: (u: number) => number };

// Значение дорожки: удержание ключа и плавный переход к следующему
// за dur секунд (по умолчанию 0.6 с).
export const track = <T>(keys: Key<T>[], t: number, mix: (a: T, b: T, u: number) => T): T => {
  let i = -1;
  for (let k = 0; k < keys.length; k++) if (keys[k].at <= t) i = k;
  if (i <= 0) return keys[Math.max(0, i)].v;
  const k = keys[i];
  const u = (t - k.at) / (k.dur ?? 0.6);
  if (u >= 1) return k.v;
  const prev = track(keys.slice(0, i), k.at, mix);
  return mix(prev, k.v, (k.ease ?? easeInOut)(u));
};
export const poseTrack = (keys: Key<Pose>[], t: number) => track(keys, t, mixPose);
export const numTrack = (keys: Key<number>[], t: number) => track(keys, t, (a, b, u) => a + (b - a) * u);

export type Expr = Partial<Omit<Face, "gaze" | "blink" | "mouthOpen" | "mouthWide" | "mouthRound">>;
export const exprTrack = (keys: Key<Expr>[], t: number): Face =>
  track(
    keys.map((k) => ({ ...k, v: { ...FACE0, ...k.v } as Face })),
    t,
    mixFace,
  );

// ---------- Артикуляция ----------
type Vis = { open: number; wide: number; round: number };
const V0: Vis = { open: 0, wide: 0, round: 0 };
const VIS: Record<string, Vis> = {
  а: { open: 0.85, wide: 0.35, round: 0 },
  я: { open: 0.75, wide: 0.4, round: 0 },
  о: { open: 0.62, wide: 0, round: 0.75 },
  ё: { open: 0.6, wide: 0, round: 0.7 },
  у: { open: 0.35, wide: 0, round: 1 },
  ю: { open: 0.38, wide: 0, round: 0.9 },
  // кыргызские огублённые гласные (в русских текстах серии не встречаются)
  ө: { open: 0.55, wide: 0.05, round: 0.7 },
  ү: { open: 0.33, wide: 0.05, round: 0.9 },
  ы: { open: 0.4, wide: 0.6, round: 0 },
  и: { open: 0.38, wide: 0.85, round: 0 },
  е: { open: 0.5, wide: 0.7, round: 0 },
  э: { open: 0.55, wide: 0.6, round: 0 },
  м: { open: 0, wide: 0.1, round: 0 },
  б: { open: 0.02, wide: 0.1, round: 0 },
  п: { open: 0, wide: 0.1, round: 0 },
  в: { open: 0.15, wide: 0.3, round: 0 },
  ф: { open: 0.15, wide: 0.3, round: 0 },
  ш: { open: 0.3, wide: 0, round: 0.5 },
  щ: { open: 0.3, wide: 0.1, round: 0.4 },
  ж: { open: 0.3, wide: 0, round: 0.45 },
  л: { open: 0.35, wide: 0.3, round: 0 },
};
const visOf = (c: string): Vis => VIS[c] ?? { open: 0.28, wide: 0.35, round: 0 };

const mouthRaw = (m: ManifestLine, tl: number): Vis => {
  if (tl < m.speechStart - 0.04 || tl > m.speechEnd + 0.06) return V0;
  const fr = Math.max(0, Math.min(m.env.length - 1, Math.round(tl * 30)));
  const env = m.env.length ? m.env[fr] : 0.7;
  let base: Vis;
  if (m.chars.length) {
    // рот чуть опережает звук (≈ 30 мс), как в живой речи
    const tq = tl + 0.03;
    const ch = m.chars.find((c) => tq >= c.start && tq < c.end);
    if (!ch) {
      // промежуток между словами — рот прикрывается
      return { open: env * 0.2, wide: 0.2, round: 0 };
    }
    base = visOf(ch.c);
  } else base = { open: 0.6, wide: 0.3, round: 0.1 };
  const amp = 0.3 + 0.85 * env;
  return { open: clamp(base.open * amp), wide: base.wide, round: base.round };
};

export const mouthAt = (m: ManifestLine, tl: number): Vis => {
  const a = mouthRaw(m, tl - 1 / 30);
  const b = mouthRaw(m, tl);
  const c = mouthRaw(m, tl + 1 / 30);
  return {
    open: a.open * 0.25 + b.open * 0.5 + c.open * 0.25,
    wide: a.wide * 0.25 + b.wide * 0.5 + c.wide * 0.25,
    round: a.round * 0.25 + b.round * 0.5 + c.round * 0.25,
  };
};

// Рот говорящего: по всем его сегментам.
export const speakingMouth = (segs: SegTime[], t: number): Vis => {
  for (const s of segs) {
    if (t >= s.fileStart && t <= s.fileStart + s.m.durationSec) {
      if (!s.m.file) {
        // черновая оценка без звука: спокойные слоги
        if (t < s.start || t > s.end) return V0;
        const ph = Math.sin((t - s.start) * Math.PI * 7.5);
        return { open: 0.25 + 0.35 * Math.abs(ph), wide: 0.3, round: 0.2 };
      }
      return mouthAt(s.m, t - s.fileStart);
    }
  }
  return V0;
};

// ---------- Моргание ----------
const blinkCache = new Map<string, number[]>();
export const blinkAt = (id: string, t: number, extra: number[] = []) => {
  let times = blinkCache.get(id);
  if (!times) {
    times = [];
    const seed = strSeed(id);
    let x = 0.4 + hash01(seed) * 2.5;
    for (let i = 0; x < 400; i++) {
      times.push(x);
      x += 2.2 + hash01(seed + i * 7 + 1) * 3.6;
    }
    blinkCache.set(id, times);
  }
  let v = 0;
  for (const b of [...times, ...extra]) {
    const d = t - b;
    if (d >= 0 && d < 0.2) v = Math.max(v, d < 0.07 ? d / 0.07 : 1 - (d - 0.07) / 0.13);
  }
  return clamp(v);
};

// ---------- Взгляд ----------
// Поворот головы и глаз к мировой точке (dx, dy — от головы к цели).
export const lookAt = (dx: number, dy: number) => {
  const yaw = clamp((Math.atan2(dx, 650) / (Math.PI / 2)) * 1.45, -0.62, 0.62);
  const pitch = clamp(dy / 1100, -0.45, 0.55);
  const gx = clamp(dx / 420, -1, 1) * 0.85;
  const gy = clamp(dy / 520, -1, 1) * 0.7;
  return { yaw, pitch, gaze: { x: gx, y: gy } };
};

export const smooth = easeInOut;
