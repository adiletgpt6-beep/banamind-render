// Общие данные кадра BalaGo32DadDriver: шкала (реплики и сцены по
// фактической озвучке), текущая сцена, губы по речи.
// Кадр ролика — абсолютный (useCurrentFrame композиции); сцены получают
// своё локальное время t = кадр − начало сцены (во время входного перехода
// t < 0).
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { DD_VIDEO, type DdRole, type DdSceneId } from "./script";
import { buildDdTimeline, estimateDdManifest, type DdCue, type DdTimeline } from "./timing";

const FPS = DD_VIDEO.fps;

export const TimelineContext = createContext<DdTimeline>(buildDdTimeline(estimateDdManifest()));
export const SceneContext = createContext<{ readonly id: DdSceneId; readonly from: number; readonly to: number }>({
  id: "hook",
  from: 0,
  to: 1,
});

export const useTimeline = () => useContext(TimelineContext);
export const useScene = () => useContext(SceneContext);

// Локальный кадр сцены и её длина (кадры).
export const useSceneFrame = () => {
  const sc = useScene();
  return useCurrentFrame() - sc.from;
};
export const useSceneLength = () => {
  const sc = useScene();
  return sc.to - sc.from;
};

// Реплика в кадрах текущей сцены: начало/конец речи и слова.
export type LocalCue = {
  readonly id: string;
  readonly from: number;
  readonly to: number;
  readonly words: readonly { readonly text: string; readonly from: number; readonly to: number }[];
};

export const localCue = (tl: DdTimeline, sceneFrom: number, id: string): LocalCue => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return {
    id,
    from: c.from * FPS - sceneFrom,
    to: c.to * FPS - sceneFrom,
    words: c.words.map((w) => ({ text: w.text, from: w.start * FPS - sceneFrom, to: w.end * FPS - sceneFrom })),
  };
};

export const useCue = (id: string): LocalCue => {
  const tl = useTimeline();
  const sc = useScene();
  return localCue(tl, sc.from, id);
};

// Кадр начала слова реплики (по счёту слов с буквами, с 0); если слова нет
// — пропорционально длине реплики.
export const wordAt = (cue: LocalCue, i: number) =>
  cue.words[i]?.from ?? cue.from + ((cue.to - cue.from) * i) / Math.max(1, cue.words.length);
export const wordEnd = (cue: LocalCue, i: number) =>
  cue.words[i]?.to ?? cue.from + ((cue.to - cue.from) * (i + 1)) / Math.max(1, cue.words.length);
// Индекс первого слова, начинающегося с префикса (без учёта регистра/кавычек).
export const findWord = (cue: LocalCue, prefix: string, after = 0) => {
  const p = prefix.toLowerCase();
  for (let i = after; i < cue.words.length; i++) {
    if (cue.words[i].text.toLowerCase().replace(/[«»„“"(]/g, "").startsWith(p)) return i;
  }
  return -1;
};
export const wordFrame = (cue: LocalCue, prefix: string, after = 0) => {
  const i = findWord(cue, prefix, after);
  return i < 0 ? cue.from : wordAt(cue, i);
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

const visemeAt = (cue: DdCue, t: number): Viseme => {
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

// Форма рта роли в абсолютном кадре: двигается только во время её реплик.
export const lipAt = (cues: readonly DdCue[], role: DdRole, absFrame: number): Viseme => {
  // немного раньше звука — так губы воспринимаются синхронными
  const t = (absFrame + 0.5) / FPS + 0.03;
  for (const c of cues) {
    if (c.role !== role || t < c.from - 0.2 || t > c.to + 0.25) continue;
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

// Говорит ли роль в момент absFrame (для мимики и взгляда слушателя).
export const speakingAt = (cues: readonly DdCue[], role: DdRole, absFrame: number, pad = 0.15) => {
  const t = absFrame / FPS;
  return cues.some((c) => c.role === role && t >= c.from - pad && t <= c.to + pad);
};
