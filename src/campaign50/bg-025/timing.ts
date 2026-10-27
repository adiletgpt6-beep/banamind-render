// Шкала BalaGoBG025. Сцены идут подряд; реплика начинается в момент
// at (от начала своей сцены), но не раньше чем через gap после конца
// предыдущей. Длительность реплики — из файла озвучки (manifest.json);
// если речь длиннее, сцена растягивается (tail после последней реплики).
// Так реплика никогда не обрезается и не ускоряется.
// Без озвучки — оценка по тексту (для превью в Studio; финальный рендер
// без голоса запрещён, см. manifestGuard.ts).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { BG25_LINES, BG25_SCENES, BG25_VIDEO, type Bg25Line, type Bg25SceneId } from "./script.ts";

export type Bg25Word = { readonly text: string; readonly start: number; readonly end: number };
export type Bg25Char = { readonly c: string; readonly start: number; readonly end: number };

export type Bg25ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Bg25Word[];
  readonly chars?: readonly Bg25Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type Bg25Manifest = {
  readonly version: 1;
  readonly kind: "bg025";
  readonly estimated?: boolean;
  readonly lines: readonly Bg25ManifestLine[];
};

const FPS = BG25_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 13 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg25Line): Bg25ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Bg25Word[] = [];
  const chars: Bg25Char[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 13);
    letters.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateBg25Manifest = (): Bg25Manifest => ({
  version: 1,
  kind: "bg025",
  estimated: true,
  lines: BG25_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс.
export const CHAR_LAG = 0.065;
export const WORD_LAG = 0.08;

export type Bg25Cue = {
  readonly id: string;
  readonly role: Bg25Line["role"];
  // narration — закадровый диктор; dialogue — говорит персонаж в кадре
  readonly mode: "narration" | "dialogue";
  readonly scene: Bg25SceneId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла (с, от начала ролика)
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Bg25Word[];
  readonly chars: readonly Bg25Char[];
  readonly env: readonly number[];
};

export type Bg25Scene = {
  readonly id: Bg25SceneId;
  readonly title: string;
  readonly from: number; // кадр ролика
  readonly frames: number;
};

export type Bg25Timeline = {
  readonly scenes: readonly Bg25Scene[];
  readonly cues: readonly Bg25Cue[];
  readonly frames: number;
  readonly speechEnd: number; // конец последней реплики, с
};

export const buildBg25Timeline = (m: Bg25Manifest): Bg25Timeline => {
  const scenes: Bg25Scene[] = [];
  const cues: Bg25Cue[] = [];
  let start = 0; // начало сцены, кадры
  let prevEnd = -Infinity; // конец предыдущей реплики, с
  for (const sc of BG25_SCENES) {
    const s0 = start / FPS;
    let lastEnd = s0;
    for (const l of BG25_LINES.filter((x) => x.scene === sc.id)) {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
      const from = Math.max(s0 + l.at, prevEnd + (l.gap ?? 0.3));
      const to = from + (ml.speechEnd - ml.speechStart);
      const shift = from - ml.speechStart;
      const lag = ml.chars ? CHAR_LAG : 0;
      cues.push({
        id: l.id,
        role: l.role,
        mode: l.role === "narrator" ? "narration" : "dialogue",
        scene: sc.id,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from,
        to,
        // слова тоже сдвигаются на задержку звука в файле (+ ≈25 мс декодера mp3),
        // чтобы события «на слове» не опережали голос
        words: (ml.words ?? est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift + (ml.words ? WORD_LAG : 0), end: w.end + shift + (ml.words ? WORD_LAG : 0) })),
        chars: (est.chars ?? []).map((c) => ({ c: c.c, start: c.start + shift + lag, end: c.end + shift + lag })),
        env: est.env ?? [],
      });
      prevEnd = to;
      lastEnd = to;
    }
    let frames = Math.round(Math.max(sc.len, lastEnd - s0 + sc.tail) * FPS);
    // финал: общая длительность не короче minSec
    if (sc.id === "cta") frames = Math.max(frames, Math.round(BG25_VIDEO.minSec * FPS) - start);
    scenes.push({ id: sc.id, title: sc.title, from: start, frames });
    start += frames;
  }
  return { scenes, cues, frames: start, speechEnd: prevEnd };
};

// Проверка шкалы: файл не начинается раньше 0 с, речь не выходит за свою
// сцену, ролик не длиннее maxSec, после последнего слова ≥ 3 с.
export const checkBg25Timeline = (tl: Bg25Timeline): string[] => {
  const problems: string[] = [];
  for (const c of tl.cues) {
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (c.to * FPS > sc.from + sc.frames - 6) problems.push(`${c.id}: речь выходит за сцену ${sc.id}`);
  }
  const total = tl.frames / FPS;
  if (total > BG25_VIDEO.maxSec) problems.push(`ролик ${total.toFixed(1)} с длиннее ${BG25_VIDEO.maxSec} с`);
  if (total - tl.speechEnd < 3) problems.push(`после последнего слова только ${(total - tl.speechEnd).toFixed(2)} с`);
  return problems;
};

export const sceneOf = (tl: Bg25Timeline, id: Bg25SceneId) => tl.scenes.find((s) => s.id === id)!;

// ---------- Кадры реплик и слов внутри сцены (чистые функции шкалы) ----------
// Используются и сценами (анимация), и звуком (эффекты на тех же кадрах).
const cueOf = (tl: Bg25Timeline, lineId: string) => {
  const c = tl.cues.find((x) => x.id === lineId);
  if (!c) throw new Error(`Нет реплики ${lineId}`);
  return c;
};

// Начало и конец реплики в кадрах сцены sceneId.
export const lineIn = (tl: Bg25Timeline, sceneId: Bg25SceneId, lineId: string) => {
  const s0 = sceneOf(tl, sceneId).from;
  const c = cueOf(tl, lineId);
  return { from: Math.round(c.from * FPS) - s0, to: Math.round(c.to * FPS) - s0 };
};

// Кадр сцены, когда звучит слово index реплики (отрицательный — с конца).
export const wordIn = (tl: Bg25Timeline, sceneId: Bg25SceneId, lineId: string, index: number) => {
  const s0 = sceneOf(tl, sceneId).from;
  const c = cueOf(tl, lineId);
  const i = index < 0 ? c.words.length + index : index;
  const w = c.words[Math.max(0, Math.min(i, c.words.length - 1))];
  return Math.round((w ? w.start : c.from) * FPS) - s0;
};

// Кадр сцены, когда звучит n-е слово реплики, начинающееся с prefix.
export const wordMatchIn = (tl: Bg25Timeline, sceneId: Bg25SceneId, lineId: string, prefix: string, nth = 0) => {
  const s0 = sceneOf(tl, sceneId).from;
  const c = cueOf(tl, lineId);
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const p = norm(prefix);
  const hits = c.words.filter((w) => norm(w.text).startsWith(p));
  const w = hits[Math.min(nth, hits.length - 1)];
  return Math.round((w ? w.start : c.from) * FPS) - s0;
};
