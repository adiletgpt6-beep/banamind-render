import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { BG25_VIDEO, type Bg25Role } from "./script";
import { buildBg25Timeline, estimateBg25Manifest, type Bg25Cue, type Bg25Timeline } from "./timing";

const FPS = BG25_VIDEO.fps;

// Шкала ролика (сцены и реплики по фактической речи) — доступна всем сценам.
export const TimelineContext = createContext<Bg25Timeline>(buildBg25Timeline(estimateBg25Manifest()));
export const useTimeline = () => useContext(TimelineContext);
export const useCues = (): readonly Bg25Cue[] => useContext(TimelineContext).cues;

// Текущая сцена: первый кадр (ролика), следующий за последним и длина.
export const SceneContext = createContext<{ readonly from: number; readonly to: number; readonly frames: number }>({ from: 0, to: 1, frames: 1 });
export const useScene = () => useContext(SceneContext);

// Кадр ролика (абсолютный) для текущего кадра сцены.
export const useAbsFrame = () => useCurrentFrame() + useContext(SceneContext).from;

// Начало и конец реплики в кадрах текущей сцены (по фактической озвучке).
export const useLine = (id: string) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return { from: Math.round(c.from * FPS) - from, to: Math.round(c.to * FPS) - from };
};

// Кадр сцены, когда звучит слово с номером index реплики id (по таймингам
// озвучки; без озвучки — оценка). Отрицательный index — с конца.
export const useWordAt = (id: string, index: number) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const i = index < 0 ? c.words.length + index : index;
  const w = c.words[Math.max(0, Math.min(i, c.words.length - 1))];
  return Math.round((w ? w.start : c.from) * FPS) - from;
};

// Кадр сцены, когда звучит первое слово реплики id, начинающееся с prefix
// (без учёта регистра и знаков); если такого нет — начало реплики.
export const useWordMatch = (id: string, prefix: string, nth = 0) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const p = norm(prefix);
  const hits = c.words.filter((w) => norm(w.text).startsWith(p));
  const w = hits[Math.min(nth, hits.length - 1)];
  return Math.round((w ? w.start : c.from) * FPS) - from;
};

// ---------- Губы по фактической речи ----------
// Форма рта: open — раскрытие, round — округление (о, у, ө, ү),
// wide — растяжение (и, е, ы). Для каждой буквы — своя форма; переходы
// между буквами плавные (40 мс), а раскрытие умножается на громкость
// файла в этот момент — в паузах рот закрыт.
export type Viseme = { readonly open: number; readonly round: number; readonly wide: number };
export const CLOSED: Viseme = { open: 0, round: 0, wide: 0 };

const V = (open: number, round: number, wide: number): Viseme => ({ open, round, wide });
const SHAPES: Record<string, Viseme> = {
  а: V(0.95, 0.05, 0.35),
  я: V(0.85, 0.05, 0.4),
  о: V(0.7, 0.85, 0),
  ё: V(0.65, 0.8, 0.05),
  ө: V(0.55, 0.75, 0),
  у: V(0.32, 1, 0),
  ү: V(0.32, 0.95, 0),
  ю: V(0.35, 0.9, 0),
  ы: V(0.45, 0, 0.45),
  и: V(0.35, 0, 0.85),
  е: V(0.5, 0, 0.7),
  э: V(0.55, 0, 0.6),
  м: V(0, 0, 0.15),
  б: V(0, 0, 0.1),
  п: V(0, 0, 0.1),
  в: V(0.1, 0, 0.3),
  ф: V(0.1, 0, 0.3),
  ш: V(0.18, 0.5, 0.1),
  ж: V(0.2, 0.45, 0.1),
  ч: V(0.18, 0.4, 0.15),
  щ: V(0.18, 0.45, 0.1),
};
const CONSONANT = V(0.2, 0, 0.4);
const shapeOf = (c: string) => SHAPES[c] ?? CONSONANT;
const mixV = (a: Viseme, b: Viseme, t: number): Viseme => ({
  open: a.open + (b.open - a.open) * t,
  round: a.round + (b.round - a.round) * t,
  wide: a.wide + (b.wide - a.wide) * t,
});
const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

const visemeAt = (cue: Bg25Cue, t: number): Viseme => {
  const { chars } = cue;
  if (!chars.length || t < cue.from - 0.1 || t > cue.to + 0.15) return CLOSED;
  let i = -1;
  for (let k = 0; k < chars.length; k++) {
    if (chars[k].start <= t) i = k;
    else break;
  }
  let v: Viseme;
  if (i < 0) v = CLOSED;
  else {
    const c = chars[i];
    const cur = t <= c.end + 0.06 ? shapeOf(c.c) : CLOSED;
    const prev = i > 0 && chars[i - 1].end > c.start - 0.08 ? shapeOf(chars[i - 1].c) : CLOSED;
    v = mixV(prev, cur, smooth((t - c.start) / 0.04));
    const next = chars[i + 1];
    if (next && next.start - t < 0.03) v = mixV(v, shapeOf(next.c), smooth((0.03 - (next.start - t)) / 0.06));
  }
  // громкость файла (по кадрам от начала файла): в паузах рот закрыт
  const pos = (t - cue.audioFrom) * FPS - 0.5;
  const k0 = Math.floor(pos);
  const fr = pos - k0;
  const e0 = cue.env[k0] ?? 0;
  const e1 = cue.env[k0 + 1] ?? 0;
  const gain = Math.max(0, Math.min(1, (e0 + (e1 - e0) * fr) * 1.7 - 0.1));
  return { open: v.open * gain, round: v.round * Math.min(1, gain * 2), wide: v.wide * Math.min(1, gain * 2) };
};

// Форма рта роли в кадре absFrame: двигается только во время её реплик.
export const lipAt = (cues: readonly Bg25Cue[], role: Bg25Role, absFrame: number): Viseme => {
  // немного раньше звука — так губы воспринимаются синхронными
  const t = (absFrame + 0.5) / FPS + 0.03;
  for (const c of cues) {
    if (c.role !== role || c.mode === "narration" || t < c.from - 0.2 || t > c.to + 0.25) continue;
    const a = visemeAt(c, t - 1 / FPS / 2);
    const b = visemeAt(c, t);
    const d = visemeAt(c, t + 1 / FPS / 2);
    return {
      open: 0.25 * a.open + 0.5 * b.open + 0.25 * d.open,
      round: 0.25 * a.round + 0.5 * b.round + 0.25 * d.round,
      wide: 0.25 * a.wide + 0.5 * b.wide + 0.25 * d.wide,
    };
  }
  return CLOSED;
};

// Говорит ли роль сейчас (для мимики).
export const useSpeaking = (role: Bg25Role, pad = 0.15) => {
  const cues = useCues();
  const t = useAbsFrame() / FPS;
  return cues.some((c) => c.role === role && c.mode !== "narration" && t >= c.from - pad && t <= c.to + pad);
};
